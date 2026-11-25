import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { GLOSSARY, segments, type TermId } from '../../data/glossary'

/*
 * A glossary word in a report (U128, J181): dotted underline, and its plain
 * definition in a tooltip on hover, keyboard focus or tap (a tap
 * elsewhere, Escape or a scroll closes it). The tooltip goes
 * through a portal (a transformed page would pin a fixed box to itself) and
 * is clamped to the viewport, so it never adds a horizontal scroll at 402px.
 */

const TIP_W = 260

export function Term({ id, children }: { id: TermId; children?: ReactNode }) {
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const tipId = useId()
  const entry = GLOSSARY[id]

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const w = Math.min(TIP_W, window.innerWidth - 16)
    setPos({ left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), top: r.bottom + 6, width: w })
  }
  const hide = () => setPos(null)

  useEffect(() => {
    if (!pos) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && ref.current?.contains(e.target as Node)) return
      setPos(null)
    }
    window.addEventListener('keydown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('pointerdown', close)
    return () => {
      window.removeEventListener('keydown', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('pointerdown', close)
    }
  }, [pos])

  return (
    <>
      <span
        ref={ref}
        data-term={id}
        tabIndex={0}
        role="button"
        aria-describedby={pos ? tipId : undefined}
        onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          show()
        }}
        className="cursor-help underline decoration-adm-muted decoration-dotted decoration-1 underline-offset-[3px] outline-none focus-visible:rounded-2 focus-visible:ring-2 focus-visible:ring-adm-ink"
      >
        {children ?? entry.term.toLowerCase()}
      </span>
      {pos &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            style={{ left: pos.left, top: pos.top, width: pos.width }}
            className="pointer-events-none fixed z-50 block rounded-8 border border-adm-line bg-adm-surface p-10 text-left text-12 font-normal leading-snug text-adm-ink-2 normal-case tracking-normal shadow-md"
          >
            <span className="block font-semibold text-adm-ink">{entry.term}</span>
            {entry.plain}
          </span>,
          document.body,
        )}
    </>
  )
}

/** Text with `{{id|shown}}` glossary marks, rendered with a `Term` for each. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {segments(text).map((s, i) =>
        s.term ? (
          <Term key={i} id={s.term}>
            {s.text}
          </Term>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
