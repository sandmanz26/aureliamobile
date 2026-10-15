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
 *   Since U034 a click also describes the *element*: what kind of control it
 *   is, the section it sits in, a selector to find it again, where on the
 *   element the finger landed, its state before the tap (pressed, expanded,
 *   disabled…), how long after the screen opened it came, how far down the
 *   page, whether it was a rage tap (3+ in a second on one spot), and what
 *   happened in the 700ms after: went to another screen, changed something
 *   on this one, or nothing at all.
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
  /** U034 element detail — absent on events recorded before it. */
  kind?: string
  section?: string
  sel?: string
  /** Where on the element the tap landed, % of its width/height. */
  ex?: number
  ey?: number
  /** The element's size in px. */
  ew?: number
  eh?: number
  /** aria-pressed/expanded/checked/selected/disabled before the tap. */
  state?: string
  /** ms since this screen was opened. */
  ms?: number
  /** How far down the page the bottom of the window was, %. */
  sy?: number
  rage?: boolean
  /** The tap hit no button, link or field. */
  dead?: boolean
  /** What followed within 700ms. */
  fx?: 'navigated' | 'changed' | 'nothing'
  /** The screen it led to, when fx is 'navigated'. */
  to?: string
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

let viewedAt = Date.now()

export function recordView(from: string | null) {
  viewedAt = Date.now()
  push({ ...base('view'), ...(from && from !== window.location.pathname ? { from } : {}) })
}

const CONTROL =
  'a, button, [role="button"], [role="tab"], [role="link"], [role="switch"], [role="checkbox"], [role="menuitem"], [role="option"], input, select, textarea, label, summary'

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

/** What sort of control it is, in words a reader of the report would use. */
function kindFor(el: Element, isControl: boolean, w: number, h: number): string {
  if (!isControl) return 'not a control'
  const tag = el.tagName.toLowerCase()
  const role = el.getAttribute('role')
  const type = el instanceof HTMLInputElement ? el.type : ''
  if (role === 'switch' || role === 'checkbox' || type === 'checkbox' || type === 'radio') return 'toggle'
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'field'
  if (role === 'tab') return 'tab'
  if (role === 'menuitem' || role === 'option') return 'menu item'
  if (el.hasAttribute('aria-pressed')) return 'chip'
  // Big tappable areas are cards whatever element they are made of.
  if (w * h >= 24000) return 'card'
  if (tag === 'a' || role === 'link') return 'link'
  return 'button'
}

const clip = (text: string | null | undefined, max: number) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

/** The nearest named region around the element: a dialog, the sidebar, or
 *  the section whose heading it sits under. */
function sectionFor(el: Element): string {
  const name = (n: Element) => clip(n.getAttribute('aria-label') || n.querySelector('h1, h2, h3, h4')?.textContent, 60)
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const tag = n.tagName.toLowerCase()
    const role = n.getAttribute('role')
    if (role === 'dialog' || tag === 'dialog') return `Dialog · ${name(n) || 'untitled'}`
    if (tag === 'nav' || tag === 'aside') return clip(n.getAttribute('aria-label'), 60) || (tag === 'nav' ? 'Navigation' : 'Sidebar')
    if (tag === 'section' || tag === 'article' || tag === 'form' || tag === 'header' || role === 'toolbar') {
      const found = name(n)
      if (found) return found
    }
  }
  return 'Page'
}

const attr = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

/** First match that is actually on screen — the drawer and the desktop
 *  sidebar render the same controls twice, one of them hidden. */
export function findVisible(sel: string): Element | null {
  try {
    for (const el of document.querySelectorAll(sel)) {
      if (el.closest('[data-insights-ignore]')) continue
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) return el
    }
  } catch {
    /* a selector from an old build that no longer parses */
  }
  return null
}

/** A selector that finds the element again on the same screen — by its id,
 *  accessible name or link target when that leads back to this element
 *  (stable across layouts), otherwise by its position in the tree. Two links
 *  to the same place (a card and its Join pill) fail the check and fall
 *  through to the tree path. */
function selectorFor(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const aria = el.getAttribute('aria-label')
  const href = el.getAttribute('href')
  const candidates = [
    el.id ? `#${CSS.escape(el.id)}` : '',
    aria ? `${tag}[aria-label="${attr(aria)}"]` : '',
    tag === 'a' && href ? `a[href="${attr(href)}"]` : '',
  ]
  for (const c of candidates) if (c && c.length <= 300 && findVisible(c) === el) return c
  const parts: string[] = []
  let node: Element | null = el
  while (node && node !== document.body && parts.length < 10) {
    if (node.id) {
      parts.unshift(`#${CSS.escape(node.id)}`)
      break
    }
    let part = node.tagName.toLowerCase()
    const parent: Element | null = node.parentElement
    if (parent) {
      const same = [...parent.children].filter((c) => c.tagName === node!.tagName)
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`
    }
    parts.unshift(part)
    node = parent
  }
  return parts.join(' > ').slice(0, 300)
}

function stateFor(el: Element): string | undefined {
  const out: string[] = []
  for (const a of ['pressed', 'expanded', 'checked', 'selected', 'current']) {
    const v = el.getAttribute(`aria-${a}`)
    if (v !== null && v !== 'false') out.push(v === 'true' ? a : `${a}=${v}`)
    else if (v === 'false') out.push(`not ${a}`)
  }
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) out.push(el.checked ? 'checked' : 'not checked')
  if (el.getAttribute('aria-disabled') === 'true' || (el as HTMLButtonElement).disabled) out.push('disabled')
  return out.length ? out.join(', ').slice(0, 60) : undefined
}

// Rage taps: three or more within a second on roughly the same spot.
let recent: { at: number; x: number; y: number }[] = []

function onClick(e: MouseEvent) {
  const target = e.target as Element | null
  if (!target || target.closest('[data-demo-annotations], [data-insights-ignore]')) return
  const control = target.closest(CONTROL)
  const el = control ?? target
  const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') ?? undefined : undefined
  const rect = el.getBoundingClientRect()
  const docH = document.documentElement.scrollHeight
  const now = Date.now()
  recent = recent.filter((r) => now - r.at < 1000)
  const rage = recent.filter((r) => Math.hypot(r.x - e.clientX, r.y - e.clientY) < 40).length >= 2
  recent.push({ at: now, x: e.clientX, y: e.clientY })

  const event: ClickEvent = {
    ...base('click'),
    x: Math.round((e.clientX / window.innerWidth) * 1000) / 10,
    y: Math.round(e.clientY + window.scrollY),
    docH,
    // A tap that missed every control is still worth seeing (people tapping
    // things that look tappable but are not), but its "label" would be the
    // text of a whole section — so name it as a miss, briefly.
    label: control ? labelFor(el) : `(not a control) ${labelFor(el).slice(0, 40)}`,
    tag: el.tagName.toLowerCase(),
    ...(href ? { href: href.slice(0, 300) } : {}),
    kind: kindFor(el, !!control, rect.width, rect.height),
    section: sectionFor(el),
    sel: selectorFor(el),
    ex: rect.width ? Math.round(((e.clientX - rect.left) / rect.width) * 100) : 50,
    ey: rect.height ? Math.round(((e.clientY - rect.top) / rect.height) * 100) : 50,
    ew: Math.round(rect.width),
    eh: Math.round(rect.height),
    ms: now - viewedAt,
    sy: docH ? Math.min(100, Math.round(((window.scrollY + window.innerHeight) / docH) * 100)) : 100,
    ...(stateFor(el) ? { state: stateFor(el) } : {}),
    ...(rage ? { rage: true } : {}),
    ...(control ? {} : { dead: true }),
  }

  // What the tap did: watch the page for 700ms. Anything else on the page
  // that animates by changing the DOM will also count as "changed", so
  // "nothing" is the reliable reading and "changed" the generous one.
  const before = window.location.pathname
  let mutations = 0
  const observer = new MutationObserver((list) => {
    for (const m of list) {
      const node = m.target instanceof Element ? m.target : m.target.parentElement
      if (!node?.closest('[data-insights-ignore]')) mutations++
    }
  })
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
  window.setTimeout(() => {
    observer.disconnect()
    const after = window.location.pathname
    push({
      ...event,
      fx: after !== before ? 'navigated' : mutations ? 'changed' : 'nothing',
      ...(after !== before ? { to: after.slice(0, 300) } : {}),
    })
  }, 700)
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
