import type { Recommendation } from './RecommendationCard'

interface RecommendationDeckProps {
  recommendations: Recommendation[]
  count: number
  /** Left out once the set has been applied: it is then a record of what was
   *  asked for, and opening it would offer edits that no longer land. */
  onOpen?: () => void
}

/**
 * Figma: 144 x 150, so the card is very slightly taller than wide rather than
 * square. The width is load-bearing — with the 12px padding it leaves 120px of
 * text, which is what breaks "Helps bring joy, aligned with your goal" after
 * "joy," the way the design does. Widen the card and the description rewraps.
 */
const CARD_W = 144
const CARD_H = 150
/**
 * The fan is gentle — the cards read as a neat cascade, not a splay. Each also
 * sits lower than the one in front of it, which is what keeps the three
 * distinguishable at this small a tilt.
 */
const TILT = [-5, -4, -3]
const DROP = [0, 14, 19]
/**
 * How far each card steps right. 80 is the Figma value — enough that the cards
 * behind show part of their own orb rather than a sliver of edge. It narrows
 * on a small screen because the deck sits in the message column, which does
 * not scroll sideways: 231 is what the tilted front card and the column's own
 * gutters take, so the rest is what the two steps have to share.
 */
const STEP = 'clamp(40px, (100vw - 231px) / 2, 80px)'
/** The tilted front card's footprint: w·cos5 + h·sin5. */
const FRONT = 157
/** Room above the cards for the count, which overlaps the front card's corner. */
const HEAD = 25

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
        height: HEAD + (DROP.at(-1) ?? 0) + CARD_H + 4,
      }}
      className={`relative block shrink-0 text-left ${onOpen ? 'u-press' : ''}`}
    >
      {cards.map((recommendation, index) => (
        <span
          key={recommendation.id}
          className="absolute flex flex-col overflow-hidden rounded-24 border border-brand-emphasis/45 bg-surface-default p-12"
          style={{
            left: `calc(${STEP} * ${index})`,
            top: HEAD + (DROP[index] ?? 0),
            width: CARD_W,
            height: CARD_H,
            rotate: `${TILT[index] ?? 0}deg`,
            zIndex: cards.length - index,
            boxShadow: '0 6px 18px rgba(60, 36, 5, 0.10)',
          }}
        >
          <img src={recommendation.orb} alt="" className="size-42 shrink-0 rounded-full object-cover" />
          <span className="text-style-body mt-12 line-clamp-1 text-text-primary">
            {recommendation.title}
          </span>
          <span className="text-style-label font-normal mt-4 line-clamp-2 text-text-secondary">
            {recommendation.description}
          </span>
        </span>
      ))}

      {/* The count overlaps the front card's tilted top-right corner, so the
          stack says how many changes it holds without being opened. Placed off
          that corner rather than off the card's box, which the tilt has moved. */}
      <span
        className="text-style-label absolute z-10 flex size-28 items-center justify-center rounded-full bg-brand-default text-text-strong shadow-sm"
        style={{ left: 114, top: 0 }}
        aria-hidden="true"
      >
        {count}
      </span>
    </Tag>
  )
}
