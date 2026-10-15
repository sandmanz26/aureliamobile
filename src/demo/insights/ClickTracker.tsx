import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFeatureFlags } from '../FeatureFlags'
import { CLICKS_FLAG } from '../modules'
import type { ClickEvent } from './tracker'
import { findVisible, installTracker, loadEvents, recordView } from './tracker'

/**
 * Mounts the click recorder (when /__demo's "Click insights" is on) and, when
 * the URL carries `?heatmap`, draws the recorded taps for this screen back
 * over it. Nothing is recorded on /__demo, nor while a heatmap is showing.
 */
export function ClickTracker() {
  const { isEnabled } = useFeatureFlags()
  const { pathname, search } = useLocation()
  const heatmap = new URLSearchParams(search).has('heatmap')
  const on = isEnabled(CLICKS_FLAG) && !pathname.startsWith('/__demo') && !heatmap
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!on) return
    return installTracker()
  }, [on])

  useEffect(() => {
    if (!on) return
    recordView(last.current)
    last.current = pathname
  }, [on, pathname])

  return heatmap && !pathname.startsWith('/__demo') ? <Heatmap pathname={pathname} search={search} /> : null
}

/** Phones and desktops lay a screen out differently, so taps are only drawn
 *  over the same kind of layout they were made on. */
const layoutOf = (vw: number) => (vw < 640 ? 'mobile' : vw < 1024 ? 'tablet' : 'desktop')

interface Box {
  sel: string
  label: string
  count: number
  nothing: number
  left: number
  top: number
  width: number
  height: number
}

/**
 * `?heatmap` draws every tap as a dot; `?heatmap=elements` outlines each
 * tapped element with its tap count instead, and `&el=<selector>` (from the
 * insights page's "Show on screen") scrolls to one element and rings it.
 */
function Heatmap({ pathname, search }: { pathname: string; search: string }) {
  const navigate = useNavigate()
  const params = new URLSearchParams(search)
  const mode = params.get('heatmap') === 'elements' ? 'elements' : 'dots'
  const focus = params.get('el')
  const [events, setEvents] = useState<ClickEvent[] | null>(null)
  const [docH, setDocH] = useState(() => document.documentElement.scrollHeight)
  const [tick, setTick] = useState(0)
  const layout = layoutOf(window.innerWidth)

  useEffect(() => {
    void loadEvents().then((r) => setEvents(r.events))
    const id = window.setInterval(() => {
      setDocH(document.documentElement.scrollHeight)
      setTick((n) => n + 1)
    }, 1000)
    // Elements inside horizontal shelves move when the shelf scrolls.
    const onScroll = () => setTick((n) => n + 1)
    document.addEventListener('scroll', onScroll, true)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [])

  const taps = (events ?? []).filter(
    (e) => e.type === 'click' && e.page === pathname && layoutOf(e.vw) === layout && e.x !== undefined && e.y !== undefined,
  )

  // Group by element and measure where each one is now. Recomputed every
  // tick so the outlines follow layout changes and scrolling shelves.
  const boxes: Box[] = []
  if (mode === 'elements') {
    const bySel = new Map<string, ClickEvent[]>()
    for (const e of taps) if (e.sel) bySel.set(e.sel, [...(bySel.get(e.sel) ?? []), e])
    for (const [sel, list] of bySel) {
      const el = findVisible(sel)
      if (!el) continue
      const r = el.getBoundingClientRect()
      boxes.push({
        sel,
        label: list[list.length - 1].label ?? sel,
        count: list.length,
        nothing: list.filter((e) => e.fx === 'nothing').length,
        left: r.left + window.scrollX,
        top: r.top + window.scrollY,
        width: r.width,
        height: r.height,
      })
    }
  }
  const maxCount = Math.max(1, ...boxes.map((b) => b.count))
  const unplaced = mode === 'elements' ? new Set(taps.filter((e) => e.sel).map((e) => e.sel)).size - boxes.length : 0
  void tick

  // Scroll the focused element into view once it exists.
  const scrolled = useRef(false)
  useEffect(() => {
    if (!focus || scrolled.current || events === null) return
    const el = findVisible(focus)
    if (el) {
      scrolled.current = true
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })

  const setMode = (next: 'dots' | 'elements') =>
    navigate(`${pathname}?heatmap${next === 'elements' ? '=elements' : ''}${focus ? `&el=${encodeURIComponent(focus)}` : ''}`, { replace: true })

  return createPortal(
    <div data-insights-ignore="">
      <div className="pointer-events-none absolute left-0 top-0 z-[80] w-full" style={{ height: docH }}>
        {mode === 'dots' &&
          taps.map((e, i) => (
            <span
              key={i}
              className="absolute size-36 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${e.x}%`,
                top: e.y,
                background: 'radial-gradient(circle, rgba(255,40,40,0.55) 0%, rgba(255,140,0,0.25) 45%, transparent 70%)',
              }}
            />
          ))}
        {mode === 'elements' &&
          boxes.map((b) => {
            const focused = b.sel === focus
            const heat = b.count / maxCount
            return (
              <div
                key={b.sel}
                className="absolute rounded-8"
                style={{
                  left: b.left - 2,
                  top: b.top - 2,
                  width: b.width + 4,
                  height: b.height + 4,
                  border: `${focused ? 3 : 2}px solid rgba(255,${Math.round(140 - heat * 110)},20,${focused ? 1 : 0.5 + heat * 0.5})`,
                  background: `rgba(255,${Math.round(140 - heat * 110)},20,${0.06 + heat * 0.18})`,
                  boxShadow: focused ? '0 0 0 6px rgba(255,59,31,0.25)' : undefined,
                }}
              >
                <span
                  title={`${b.label} — ${b.count} ${b.count === 1 ? 'tap' : 'taps'}${b.nothing ? `, ${b.nothing} with no response` : ''}`}
                  className="pointer-events-auto absolute -right-8 -top-10 flex h-20 min-w-20 items-center justify-center rounded-full bg-[#1B1006] px-6 text-[11px] tabular-nums text-white"
                >
                  {b.count}
                  {b.nothing > 0 && <span className="ml-4 text-[#ff8a7a]">✕{b.nothing}</span>}
                </span>
                {focused && (
                  <span className="absolute left-0 top-full mt-6 max-w-[260px] truncate rounded-8 bg-[#1B1006] px-8 py-4 text-[11px] text-white">
                    {b.label}
                  </span>
                )}
              </div>
            )
          })}
      </div>
      <div className="fixed bottom-16 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-8 whitespace-nowrap rounded-full bg-[#1B1006] px-12 py-8 text-[13px] text-white shadow-lg">
        <span className="flex rounded-full bg-white/10 p-2">
          {(['dots', 'elements'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-10 py-4 ${mode === m ? 'bg-white text-[#1B1006]' : ''}`}
            >
              {m === 'dots' ? 'Taps' : 'Elements'}
            </button>
          ))}
        </span>
        <span>
          {events === null
            ? 'Loading…'
            : mode === 'dots'
              ? `${taps.length} ${taps.length === 1 ? 'tap' : 'taps'} · ${layout}`
              : `${boxes.length} elements · ${layout}${unplaced > 0 ? ` · ${unplaced} not on screen now` : ''}`}
        </span>
        <button type="button" className="rounded-full bg-white/15 px-10 py-4" onClick={() => navigate(pathname)}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  )
}
