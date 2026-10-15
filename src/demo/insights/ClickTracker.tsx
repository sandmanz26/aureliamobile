import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFeatureFlags } from '../FeatureFlags'
import { CLICKS_FLAG } from '../modules'
import type { ClickEvent } from './tracker'
import { installTracker, loadEvents, recordView } from './tracker'

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

  return heatmap && !pathname.startsWith('/__demo') ? <Heatmap pathname={pathname} /> : null
}

/** Phones and desktops lay a screen out differently, so taps are only drawn
 *  over the same kind of layout they were made on. */
const layoutOf = (vw: number) => (vw < 640 ? 'mobile' : vw < 1024 ? 'tablet' : 'desktop')

function Heatmap({ pathname }: { pathname: string }) {
  const navigate = useNavigate()
  const [events, setEvents] = useState<ClickEvent[] | null>(null)
  const [docH, setDocH] = useState(() => document.documentElement.scrollHeight)
  const layout = layoutOf(window.innerWidth)

  useEffect(() => {
    void loadEvents().then((r) => setEvents(r.events))
    const id = window.setInterval(() => setDocH(document.documentElement.scrollHeight), 1000)
    return () => window.clearInterval(id)
  }, [])

  const taps = (events ?? []).filter(
    (e) => e.type === 'click' && e.page === pathname && layoutOf(e.vw) === layout && e.x !== undefined && e.y !== undefined,
  )

  return createPortal(
    <div data-insights-ignore="">
      <div className="pointer-events-none absolute left-0 top-0 z-[80] w-full" style={{ height: docH }}>
        {taps.map((e, i) => (
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
      </div>
      <div className="fixed bottom-16 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-12 rounded-full bg-[#1B1006] px-16 py-10 text-[13px] text-white shadow-lg">
        <span>
          {events === null ? 'Loading taps…' : `${taps.length} ${taps.length === 1 ? 'tap' : 'taps'} on ${pathname} · ${layout}`}
        </span>
        <button type="button" className="rounded-full bg-white/15 px-10 py-4" onClick={() => navigate(pathname)}>
          Close heatmap
        </button>
      </div>
    </div>,
    document.body,
  )
}
