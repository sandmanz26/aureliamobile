import { useEffect, useState } from 'react'

type Cell = 'tl' | 'tr' | 'br' | 'bl'

/**
 * Figma's "Squares, Spinner squares-6" reference, traced frame by frame: a
 * single lit cell walks clockwise through a 2x2 grid's four corners in this
 * order. Reading its 8 frames: 1–4 grow the square one corner at a time,
 * each newly-lit corner leaving the last one behind as a pale, settled
 * square; 5–8 walk the same four corners again, but this time each step
 * also erases the corner two steps behind it, so the square shrinks back
 * down to one corner (frame 8 is `bl` alone) before the loop restarts at
 * frame 1 (`tl` alone).
 */
const WALK: readonly Cell[] = ['tl', 'tr', 'br', 'bl']
const STEP_MS = 320

const CELL_STYLE: Record<Cell, { top: number; left: number }> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, left: 1 },
  br: { top: 1, left: 1 },
  bl: { top: 1, left: 0 },
}

/** The settled fill, and the lit corner's gradient starts from the same tone. */
const LIGHT = '#F9DE7D'
const DARK = '#F1A253'

/** The "building this" mark for `SessionProgressCardV2` — /__demo option 2. */
export function GeneratingShape({ size = 40 }: { size?: number }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => (s + 1) % 8), STEP_MS)
    return () => window.clearInterval(timer)
  }, [])

  const idx = step % 4
  const growing = step < 4
  const present = new Set(growing ? WALK.slice(0, idx + 1) : WALK.slice(idx))
  const active = WALK[idx]
  const half = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {WALK.map((cellId) => {
        const { top, left } = CELL_STYLE[cellId]
        const isPresent = present.has(cellId)
        return (
          <div
            key={cellId}
            className="absolute transition-all duration-300 ease-in-out"
            style={{
              width: half,
              height: half,
              top: top * half,
              left: left * half,
              background: LIGHT,
              opacity: isPresent ? 1 : 0,
              transform: isPresent ? 'scale(1)' : 'scale(0.6)',
            }}
          >
            <div
              className="absolute inset-0 transition-opacity duration-300 ease-in-out"
              style={{
                background: `linear-gradient(225deg, ${LIGHT}, ${DARK})`,
                opacity: cellId === active ? 1 : 0,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
