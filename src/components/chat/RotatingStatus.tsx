import { useEffect, useState } from 'react'

const DEFAULT_LINES = [
  'Layering in white noise...',
  'Adjusting voice over...',
  'Enhancing the visuals...',
  'Putting final touches..',
]

/**
 * The status line for `SessionProgressCardV2` — cycles through what the
 * build is "doing" instead of sitting on one static message. Keyed on the
 * line index so each change remounts the `<p>` and replays `u-fade`
 * (already reduced-motion-aware, same as everything else in `motion.css`),
 * rather than hand-rolling a second crossfade.
 */
export function RotatingStatus({
  lines = DEFAULT_LINES,
  intervalMs = 1200,
}: {
  lines?: string[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % lines.length), intervalMs)
    return () => window.clearInterval(timer)
  }, [lines, intervalMs])

  return (
    <p key={index} className="u-fade text-style-caption truncate text-text-secondary">
      {lines[index]}
    </p>
  )
}
