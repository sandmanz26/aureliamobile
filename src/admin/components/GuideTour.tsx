import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface TourStep {
  /** The `data-tour` value of the element to point at; none centres the card. */
  target?: string
  title: string
  body: ReactNode
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 6
const CARD = 360

/**
 * A guided tour over an admin page (U105): dims the page, cuts a lit window
 * around one element at a time and explains it in a card beside it. Steps
 * point at elements by `data-tour`, so the page only marks what to show.
 * Portaled and `adm-root`, like Modal, for the theme and the dark option
 * lists. Escape closes it; the arrow keys move between steps.
 */
export function GuideTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })
  const step = steps[i]
  const last = i === steps.length - 1

  useEffect(() => {
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null
    el?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
    // Measured after scrolling settles; a step without a target centres the card.
    const measure = () => {
      if (!el) return setRect(null)
      const r = el.getBoundingClientRect()
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }
    const t = window.setTimeout(measure, 60)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step.target])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((x) => Math.min(steps.length - 1, x + 1))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  const width = Math.min(CARD, viewport.w - 32)
  let cardStyle: CSSProperties = { width, left: (viewport.w - width) / 2, top: Math.max(16, viewport.h / 2 - 160) }
  if (rect) {
    const below = rect.top + rect.height + 12
    const fitsBelow = below + 240 < viewport.h
    const left = Math.min(Math.max(16, rect.left), viewport.w - width - 16)
    cardStyle = fitsBelow ? { width, left, top: below } : { width, left, top: Math.max(16, rect.top - 12 - 240) }
  }

  return createPortal(
    <div className="adm-root fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Guide: ${step.title}`}>
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-12 ring-2 ring-adm-accent transition-all duration-200"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: '0 0 0 9999px rgba(15, 12, 8, 0.55)' }}
          aria-hidden="true"
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(15,12,8,0.55)]" aria-hidden="true" />
      )}
      {/* Clicks outside the card do nothing, so a stray click does not lose the place. */}
      <div className="fixed inset-0" aria-hidden="true" />
      <div className="fixed flex flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16 shadow-2xl" style={cardStyle}>
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="text-11 font-medium tabular-nums text-adm-muted">
              Step {i + 1} of {steps.length}
            </p>
            <h2 className="mt-2 text-15 font-semibold text-adm-ink">{step.title}</h2>
          </div>
          <button type="button" aria-label="Close the guide" onClick={onClose} className="flex size-28 shrink-0 items-center justify-center rounded-8 text-adm-muted hover:bg-adm-hover hover:text-adm-ink">
            <X size={16} />
          </button>
        </div>
        <div className="text-13 leading-[20px] text-adm-ink-2">{step.body}</div>
        <div className="flex items-center gap-8 pt-4">
          <div className="flex gap-4" aria-hidden="true">
            {steps.map((s, k) => (
              <span key={s.title} className={`h-6 rounded-full ${k === i ? 'w-16 bg-adm-ink' : 'w-6 bg-adm-line'}`} />
            ))}
          </div>
          <div className="ml-auto flex gap-6">
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="inline-flex h-30 items-center gap-4 rounded-8 border border-adm-line px-10 text-12 font-medium text-adm-ink hover:bg-adm-hover">
                <ArrowLeft size={12} /> Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose() : setI(i + 1))}
              className="inline-flex h-30 items-center gap-4 rounded-8 bg-adm-ink px-12 text-12 font-medium text-adm-surface hover:opacity-90"
              autoFocus
            >
              {last ? 'Done' : 'Next'} {!last && <ArrowRight size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
