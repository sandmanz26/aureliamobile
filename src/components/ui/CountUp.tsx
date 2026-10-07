import { useEffect, useState } from 'react'

const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** "87k", "20k", "1,323" — the compact form these stat reads use. Only
 *  thousands get the suffix; nothing here has reached millions. */
export function formatCompactCount(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return Math.round(value).toLocaleString()
}

/**
 * Counts up from 0 to `value` once, on mount — the "87k / 20k / 50" read on
 * the live-sessions card, and anywhere else a number should feel like it
 * just arrived rather than sitting there pre-filled.
 *
 * Tweens the raw number via `requestAnimationFrame` rather than a CSS
 * transition — there's no way to transition formatted text like "87k" in
 * CSS — so `prefers-reduced-motion` is checked by hand here instead of
 * getting the blanket rule in `motion.css` for free the way `AlignmentGauge`
 * does for its needle rotation.
 */
export function CountUp({
  value,
  durationMs = 1200,
  format = formatCompactCount,
}: {
  value: number
  durationMs?: number
  format?: (n: number) => string
}) {
  const [shown, setShown] = useState(REDUCED_MOTION ? value : 0)

  useEffect(() => {
    if (REDUCED_MOTION) {
      setShown(value)
      return
    }
    let frame: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      // Decelerating, same curve as --ease-out elsewhere in the app.
      const eased = 1 - (1 - progress) ** 3
      setShown(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs])

  return <>{format(shown)}</>
}
