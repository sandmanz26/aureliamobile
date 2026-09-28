import { useEffect, useState } from 'react'

/**
 * Four cells in a 2x2 grid; each frame lights a different subset, so the
 * mark reads as one shape continuously reforming rather than four separate
 * icons swapping. Figma's own reference ("Squares, Spinner squares-6") runs
 * eight frames in a loop — this is the same idea, in the app's own gradient,
 * not a traced copy of its exact cell layout.
 */
const FRAMES: readonly [boolean, boolean, boolean, boolean][] = [
  [false, false, false, true],
  [true, true, false, false],
  [false, true, false, true],
  [true, false, true, true],
  [true, true, true, true],
  [true, true, false, true],
  [false, true, true, false],
  [true, false, false, false],
]

const FRAME_MS = 450

/** The "building this" mark for `SessionProgressCardV2` — /__demo option 2. */
export function GeneratingShape({ size = 54 }: { size?: number }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), FRAME_MS)
    return () => window.clearInterval(timer)
  }, [])

  const cell = size * 0.42

  return (
    <div
      className="grid shrink-0 grid-cols-2 grid-rows-2"
      style={{ width: size, height: size, gap: size * 0.08 }}
      aria-hidden="true"
    >
      {FRAMES[frame].map((on, index) => (
        <span
          key={index}
          className="rounded-6 transition-all duration-300 ease-in-out"
          style={{
            width: cell,
            height: cell,
            background: 'linear-gradient(160deg, #ffe682, #ff881b)',
            transform: on ? 'scale(1)' : 'scale(0)',
            opacity: on ? 1 : 0,
          }}
        />
      ))}
    </div>
  )
}
