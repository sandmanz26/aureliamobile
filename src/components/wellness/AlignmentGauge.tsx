import { useEffect, useState } from 'react'

const CENTER = 100
const BASELINE = 100
const ARC_RADIUS = 80
const ARC_STROKE = 14
const NEEDLE_INNER = 28
const NEEDLE_OUTER = 62
const NEEDLE_HALF_WIDTH = 5
/** The reference angle the needle triangle is drawn at — "Challenging",
 *  score 0. Rotating a `<g>` from here is simpler than recomputing the
 *  triangle's three points on every animation frame. */
const NEEDLE_BASE_ANGLE = 180

/** A point on the gauge's circle, measuring from 0° at the right ("Aligned") to 180° at the left ("Challenging"). */
function pointAt(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: BASELINE - radius * Math.sin(rad) }
}

const arcStart = pointAt(180, ARC_RADIUS)
const arcEnd = pointAt(0, ARC_RADIUS)

const needleTip = pointAt(NEEDLE_BASE_ANGLE, NEEDLE_OUTER)
const needleBase = pointAt(NEEDLE_BASE_ANGLE, NEEDLE_INNER)
const needleHalfStep = pointAt(NEEDLE_BASE_ANGLE + 90, NEEDLE_HALF_WIDTH)
const needleBaseOffset = { x: needleHalfStep.x - CENTER, y: needleHalfStep.y - BASELINE }
const needleBaseLeft = { x: needleBase.x + needleBaseOffset.x, y: needleBase.y + needleBaseOffset.y }
const needleBaseRight = { x: needleBase.x - needleBaseOffset.x, y: needleBase.y - needleBaseOffset.y }
const NEEDLE_PATH = `M ${needleBaseLeft.x} ${needleBaseLeft.y} L ${needleTip.x} ${needleTip.y} L ${needleBaseRight.x} ${needleBaseRight.y} Z`

/**
 * The semicircle gauge on a wellness goal's "Learn more" panel — Figma's
 * "Alignment Score". 0 sits at "Challenging" (left), 100 at "Aligned"
 * (right); the arc's color does the same trip, from a warm, saturated
 * orange down to a neutral gray, so intensity reads as agitation rather
 * than "aligned" meaning "vivid."
 *
 * The needle is a filled triangle, drawn once at the 0-score reference
 * angle, then swung into place with a CSS `transform: rotate()` on its `<g>`
 * rather than recomputed per frame — the same rotation, applied to a fixed
 * shape, is far cheaper than re-deriving three trig points on every tick,
 * and it's what lets the needle *animate*: React only has to change one
 * `deg` value across a transition, the browser does the interpolation.
 * Mounts pointed at 0 and animates to the real score on the next frame, so
 * it sweeps in every time a goal card is expanded (the component mounts
 * fresh each time — see `WellnessObjectiveCard`) rather than snapping.
 * `transition-duration` collapses to 1ms under `prefers-reduced-motion`
 * via the blanket rule in `motion.css`, same as everything else animated
 * in this app — nothing extra to do here for that.
 */
export function AlignmentGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score))
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayScore(clamped))
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  const rotation = (displayScore / 100) * 180

  return (
    <div role="img" aria-label={`Alignment score ${clamped}%, from Challenging to Aligned`}>
      <svg viewBox="0 0 200 108" className="mx-auto w-full max-w-[240px]">
        <defs>
          <linearGradient id="alignment-arc" x1={arcStart.x} y1="0" x2={arcEnd.x} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0863E" />
            <stop offset="55%" stopColor="#FFCC5C" />
            <stop offset="100%" stopColor="#E4E4E4" />
          </linearGradient>
        </defs>
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="url(#alignment-arc)"
          strokeWidth={ARC_STROKE}
          strokeLinecap="round"
        />
        <g
          style={{
            transformOrigin: `${CENTER}px ${BASELINE}px`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <path d={NEEDLE_PATH} fill="#2B1C0F" />
        </g>
      </svg>
      <div className="mt-4 flex justify-between px-4 text-style-caption text-text-secondary">
        <span>Challenging</span>
        <span>Aligned</span>
      </div>
    </div>
  )
}
