const CENTER = 100
const BASELINE = 100
const ARC_RADIUS = 80
const ARC_STROKE = 14
const NEEDLE_INNER = 28
const NEEDLE_OUTER = 62
const NEEDLE_HALF_WIDTH = 5

/** A point on the gauge's circle, measuring from 0° at the right ("Aligned") to 180° at the left ("Challenging"). */
function pointAt(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: BASELINE - radius * Math.sin(rad) }
}

/**
 * The semicircle gauge on a wellness goal's "Learn more" panel — Figma's
 * "Alignment Score". 0 sits at "Challenging" (left), 100 at "Aligned"
 * (right); the arc's color does the same trip, from a warm, saturated
 * orange down to a neutral gray, so intensity reads as agitation rather
 * than "aligned" meaning "vivid."
 *
 * The needle is a filled triangle rather than a stroked line — a stroke
 * gives a uniform-width rod, and the reference has a tapered dart that a
 * triangle approximates in a few lines without needing a hand-drawn path.
 */
export function AlignmentGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score))
  const angle = 180 - (clamped / 100) * 180

  const tip = pointAt(angle, NEEDLE_OUTER)
  const base = pointAt(angle, NEEDLE_INNER)
  const perpendicular = angle + 90
  const halfStep = pointAt(perpendicular, NEEDLE_HALF_WIDTH)
  const baseOffsetX = halfStep.x - CENTER
  const baseOffsetY = halfStep.y - BASELINE
  const baseLeft = { x: base.x + baseOffsetX, y: base.y + baseOffsetY }
  const baseRight = { x: base.x - baseOffsetX, y: base.y - baseOffsetY }

  const arcStart = pointAt(180, ARC_RADIUS)
  const arcEnd = pointAt(0, ARC_RADIUS)

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
        <path
          d={`M ${baseLeft.x} ${baseLeft.y} L ${tip.x} ${tip.y} L ${baseRight.x} ${baseRight.y} Z`}
          fill="#2B1C0F"
        />
      </svg>
      <div className="mt-4 flex justify-between px-4 text-style-caption text-text-secondary">
        <span>Challenging</span>
        <span>Aligned</span>
      </div>
    </div>
  )
}
