import { useEffect, useState } from 'react'

/**
 * One word inside a heading that cycles through alternatives, in place —
 * "Trusted Creators" becoming "Trusted Guides" becoming "Trusted
 * Storytellers", without the surrounding sentence moving.
 *
 * Reuses `u-fade` from motion.css rather than a bespoke keyframe, keyed on
 * the current index so it replays on every change the same way `.u-page`
 * replays on every route. `prefers-reduced-motion` already turns that
 * animation into a snap globally, so there is nothing extra to handle here.
 */
export function FlipWord({ words, intervalMs = 2200 }: { words: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [words, intervalMs])

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <span className="inline-grid align-baseline">
      {/* Same cell, same baseline — the invisible copy of the longest word
          reserves the width so neighbouring text does not reflow as the
          word changes underneath it. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {longest}
      </span>
      <span key={index} className="u-fade col-start-1 row-start-1 whitespace-nowrap text-text-brand">
        {words[index]}
      </span>
    </span>
  )
}
