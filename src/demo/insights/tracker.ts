import { readVersion } from '../../versions/versions'

/**
 * Click insights: a record of what people tap and how they move between
 * screens, so it can be read back later in /__demo/insights.
 *
 * Two kinds of event, both small and anonymous:
 * - `view`  — a screen was opened (with the screen it came from).
 * - `click` — something was tapped: the nearest button/link/control, its
 *   visible label, and where on the page it was (x as % of the window width,
 *   y in page pixels) so a heatmap can be drawn back over the same screen.
 *
 * Never recorded: anything typed into a field, names or emails, the content
 * of the page. The session id is random per browser tab.
 *
 * Events are batched and sent to /api/clicks every few seconds and when the
 * tab is hidden. If the server has no store (`configured: false`) or can't be
 * reached, they go to localStorage instead, so local and offline use still
 * produce something to read.
 */
export interface ClickEvent {
  type: 'click' | 'view'
  t: string
  sid: string
  page: string
  /** Design version on screen (staging v1/v2 switcher; 2 on production). */
  ui: number
  vw: number
  vh: number
  x?: number
  y?: number
  docH?: number
  label?: string
  tag?: string
  href?: string
  from?: string
}

export const LOCAL_KEY = 'aurelia.insights.clicks'
const LOCAL_MAX = 3000
const FLUSH_MS = 8000

function sessionId() {
  try {
    let id = sessionStorage.getItem('aurelia.insights.sid')
    if (!id) {
      id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
      sessionStorage.setItem('aurelia.insights.sid', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

let queue: ClickEvent[] = []
let serverOff = false
let timer: number | undefined

function base(type: ClickEvent['type']): ClickEvent {
  return {
    type,
    t: new Date().toISOString(),
    sid: sessionId(),
    page: window.location.pathname,
    ui: readVersion(),
    vw: window.innerWidth,
    vh: window.innerHeight,
  }
}

export function readLocal(): ClickEvent[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as ClickEvent[]
  } catch {
    return []
  }
}

function saveLocal(events: ClickEvent[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...readLocal(), ...events].slice(-LOCAL_MAX)))
  } catch {
    /* storage full or blocked: drop */
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    /* ignore */
  }
}

async function flush(useBeacon = false) {
  if (!queue.length) return
  const batch = queue.splice(0, 200)
  if (serverOff) return saveLocal(batch)
  const body = JSON.stringify({ events: batch })
  if (useBeacon && navigator.sendBeacon) {
    if (!navigator.sendBeacon('/api/clicks', new Blob([body], { type: 'application/json' }))) saveLocal(batch)
    return
  }
  try {
    const res = await fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
    const data = (await res.json().catch(() => null)) as { configured?: boolean } | null
    if (!res.ok || data?.configured === false) {
      if (data?.configured === false) serverOff = true
      saveLocal(batch)
    }
  } catch {
    saveLocal(batch)
  }
}

function push(event: ClickEvent) {
  queue.push(event)
  if (timer === undefined) timer = window.setTimeout(() => ((timer = undefined), void flush()), FLUSH_MS)
}

export function recordView(from: string | null) {
  push({ ...base('view'), ...(from && from !== window.location.pathname ? { from } : {}) })
}

const CONTROL = 'a, button, [role="button"], [role="tab"], [role="link"], input, select, textarea, label, summary'

/** A short human name for what was tapped — never a field's value. */
function labelFor(el: Element): string {
  const aria = el.getAttribute('aria-label')
  if (aria) return aria.trim().slice(0, 120)
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return (el.getAttribute('placeholder') || el.name || el.type || 'field').slice(0, 120)
  }
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 80)
  const img = el.querySelector('img[alt]')
  return (img?.getAttribute('alt') || el.tagName.toLowerCase()).slice(0, 120)
}

function onClick(e: MouseEvent) {
  const target = e.target as Element | null
  if (!target || target.closest('[data-demo-annotations], [data-insights-ignore]')) return
  const control = target.closest(CONTROL)
  const el = control ?? target
  const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') ?? undefined : undefined
  push({
    ...base('click'),
    x: Math.round((e.clientX / window.innerWidth) * 1000) / 10,
    y: Math.round(e.clientY + window.scrollY),
    docH: document.documentElement.scrollHeight,
    // A tap that missed every control is still worth seeing (people tapping
    // things that look tappable but are not), but its "label" would be the
    // text of a whole section — so name it as a miss, briefly.
    label: control ? labelFor(el) : `(not a control) ${labelFor(el).slice(0, 40)}`,
    tag: el.tagName.toLowerCase(),
    ...(href ? { href: href.slice(0, 300) } : {}),
  })
}

function onHide() {
  if (document.visibilityState === 'hidden') void flush(true)
}

let installed = false
export function installTracker() {
  if (installed) return () => {}
  installed = true
  document.addEventListener('click', onClick, true)
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', onHide)
  return () => {
    installed = false
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', onHide)
    void flush(true)
  }
}

/** Server events, or local ones when the server has no store. */
export async function loadEvents(): Promise<{ events: ClickEvent[]; source: 'server' | 'local'; scope?: string }> {
  try {
    const res = await fetch('/api/clicks', { cache: 'no-store' })
    const data = (await res.json()) as { configured: boolean; events: ClickEvent[] | null; scope?: string }
    if (data.configured && data.events) return { events: data.events, source: 'server', scope: data.scope }
  } catch {
    /* fall through */
  }
  return { events: readLocal(), source: 'local' }
}

export async function clearEvents(source: 'server' | 'local') {
  clearLocal()
  if (source === 'server') {
    await fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clear: true }) })
  }
}
