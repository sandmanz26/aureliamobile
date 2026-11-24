import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * One word that changes in place (U111, J157: Eugene's "Headline in Motion").
 * The words share one grid cell, so they cross-fade without moving the line;
 * the box's width follows the word on screen over the same 500ms ease-in-out,
 * so the rest of the sentence slides instead of jumping. Under reduced motion
 * it stays on the first word. Screen readers get `label`, not the cycle.
 */
export function RotatingWord({ words, label, holdMs = 2600, className = '' }: { words: string[]; label: string; holdMs?: number; className?: string }) {
  const [i, setI] = useState(0)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), holdMs)
    return () => window.clearInterval(id)
  }, [words.length, holdMs])

  // Width is written to the DOM, not to state: it is a measurement of what is
  // already rendered. Skipped while hidden (display: none measures 0).
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => {
      const w = el.querySelector<HTMLElement>(`[data-word="${i}"]`)?.offsetWidth ?? 0
      if (w > 0) el.style.width = `${w}px`
    }
    fit()
    void document.fonts?.ready.then(fit)
  }, [i])

  const prev = (i - 1 + words.length) % words.length
  return (
    <>
      <span className="sr-only">{label}</span>
      <span
        ref={box}
        aria-hidden="true"
        className={`relative inline-grid justify-items-start align-bottom transition-[width] duration-500 ease-in-out motion-reduce:transition-none ${className}`}
      >
        {words.map((w, k) => (
          <span
            key={w}
            data-word={k}
            className="col-start-1 row-start-1 whitespace-nowrap pr-[0.08em] transition-[opacity,transform] duration-500 ease-in-out motion-reduce:transition-none"
            style={{ opacity: k === i ? 1 : 0, transform: k === i ? 'none' : k === prev ? 'translateY(-0.3em)' : 'translateY(0.3em)' }}
          >
            {w}
          </span>
        ))}
      </span>
    </>
  )
}
