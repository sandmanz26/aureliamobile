import type { Recommendation } from './RecommendationCard'

interface RecommendationDeckProps {
  recommendations: Recommendation[]
  count: number
  /** Left out once the set has been applied: it is then a record of what was
   *  asked for, and opening it would offer edits that no longer land. */
  onOpen?: () => void
}

/**
 * Figma: 156 x 150. The width is not a pixel-fit — do not tighten it to the
 * exact width of the longest line. --font-sans resolves to SF Pro on the
 * designer's machine and to whatever generic sans a headless Linux Chromium
 * has, and those differ by ~5%: at 144 the description measured 116 into 120
 * here and ellipsised on a Mac. 156 leaves the text column 132px, which is
 * slack in either font.
 */
const CARD_W = 156
const CARD_H = 150
/**
 * The cards are near-parallel at ~8 degrees, and it is the drop down the stack
 * rather than a spread of angles that separates them. Fanning the angles
 * instead reads as a splay.
 */
const TILT = [-8, -7, -6]
const DROP = [0, 14, 19]
/** The tilted front card reaches ~10px left of the box; inset so it does not
 *  hang into the message gutter. */
const LEAD = 10
/** Room above the cards for the count, which straddles the front corner. */
const HEAD = 18
/**
 * How far each card steps right. 88 is the Figma value — enough that the cards
 * behind show part of their own orb rather than a sliver of edge. It narrows
 * on a small screen because the deck sits in the message column, which does
 * not scroll sideways: 256 is what the tilted front card and the column's own
 * gutters take, so the rest is what the two steps have to share.
 */
const STEP = 'clamp(38px, (100vw - 256px) / 2, 88px)'
/** The tilted front card's footprint plus the lead: w·cos8 + h·sin8 + LEAD. */
const FRONT = 174

export function RecommendationDeck({ recommendations, count, onOpen }: RecommendationDeckProps) {
  // Front card first in the DOM for the reader; painted last via z-index.
  const cards = recommendations.slice(0, 3)
  const Tag = onOpen ? 'button' : 'div'

  return (
    <Tag
      {...(onOpen
        ? {
            type: 'button' as const,
            onClick: onOpen,
            'aria-label': `Open ${count} recommended ${count === 1 ? 'change' : 'changes'}`,
          }
        : {})}
      style={{
        width: `calc(${STEP} * ${cards.length - 1} + ${FRONT}px)`,
        height: 195,
      }}
      className={`relative block shrink-0 text-left ${onOpen ? 'u-press' : ''}`}
    >
      {cards.map((recommendation, index) => (
        <span
          key={recommendation.id}
          className="absolute flex flex-col overflow-hidden rounded-24 rounded-tl-32 border border-brand-emphasis/45 bg-surface-default p-12"
          style={{
            left: `calc(${STEP} * ${index} + ${LEAD}px)`,
            top: HEAD + (DROP[index] ?? 0),
            width: CARD_W,
            height: CARD_H,
            rotate: `${TILT[index] ?? 0}deg`,
            zIndex: cards.length - index,
            boxShadow: '0 6px 18px rgba(60, 36, 5, 0.10)',
          }}
        >
          <img src={recommendation.orb} alt="" className="size-56 shrink-0 rounded-full object-cover" />
          <span className="text-style-body mt-10 line-clamp-1 text-text-primary">
            {recommendation.title}
          </span>
          <span className="text-style-label mt-2 line-clamp-2 text-balance font-normal text-text-secondary">
            {recommendation.description}
          </span>
        </span>
      ))}

      {/* The count straddles the front card's tilted top-right corner — most of
          the disc on the card, the rest overhanging it. Placed off that corner,
          which the tilt has moved well in from the card's own box. */}
      <span
        className="text-style-label absolute z-10 flex size-28 items-center justify-center rounded-full bg-brand-default text-text-strong shadow-sm"
        style={{ left: LEAD + 125, top: 1 }}
        aria-hidden="true"
      >
        {count}
      </span>
    </Tag>
  )
}
