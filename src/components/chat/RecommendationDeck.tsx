import type { Recommendation } from './RecommendationCard'

interface RecommendationDeckProps {
  recommendations: Recommendation[]
  count: number
  /** Left out once the set has been applied: it is then a record of what was
   *  asked for, and opening it would offer edits that no longer land. */
  onOpen?: () => void
}

/**
 * Figma: a card wide enough that the front one reads in full — "Increase
 * yellow" on one line and its description on two, with neither ellipsised.
 * That is what sets the width: at 124 the title fitted in 98px of 98 and the
 * description wanted one pixel more than it had, so both clipped.
 */
const CARD_W = 148
const CARD_H = 142
const TILT = [-7, -5.5, -4]
/**
 * How far each card steps right. 78 is the Figma value — enough that the cards
 * behind show part of their own orb rather than a sliver of edge. It narrows
 * on a small screen because the deck sits in the message column, which does
 * not scroll sideways: 214 is what the rotated front card and the column's
 * own gutters take, so the rest is what the two steps have to share.
 */
const STEP = 'clamp(40px, (100vw - 238px) / 2, 78px)'
/** The rotated front card's footprint: w·cos7 + h·sin7, and h·cos7 + w·sin7. */
const FRONT = 164
const ROTATED_H = 159

/**
 * The collapsed form of a recommendation set — a fanned stack with the count
 * on it, which opens into the full rail.
 *
 * Aurelia proposes three changes at once, and three full cards is most of a
 * phone screen. Collapsed, the set reads as one thing the message is handing
 * over; the reader opens it when they want to weigh the individual changes,
 * and it folds back once they are applied so the thread stays readable as
 * history rather than as a control panel.
 */
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
        height: ROTATED_H + 14,
      }}
      className={`relative block shrink-0 text-left ${onOpen ? 'u-press' : ''}`}
    >
      {cards.map((recommendation, index) => (
        <span
          key={recommendation.id}
          className="absolute top-8 flex flex-col overflow-hidden rounded-24 border border-brand-emphasis/45 bg-surface-default p-12"
          style={{
            left: `calc(${STEP} * ${index})`,
            width: CARD_W,
            height: CARD_H,
            rotate: `${TILT[index] ?? 0}deg`,
            zIndex: cards.length - index,
            boxShadow: '0 6px 18px rgba(60, 36, 5, 0.10)',
          }}
        >
          <img src={recommendation.orb} alt="" className="size-52 shrink-0 rounded-full object-cover" />
          <span className="text-style-body-small mt-8 line-clamp-1 text-text-primary">
            {recommendation.title}
          </span>
          <span className="text-style-caption mt-2 line-clamp-2 text-text-secondary">
            {recommendation.description}
          </span>
        </span>
      ))}

      {/* The count rides the front card's top-right corner, so the stack says
          how many changes it holds without being opened. */}
      <span
        className="text-style-label absolute z-10 flex size-28 items-center justify-center rounded-full bg-brand-default text-text-strong shadow-sm"
        style={{ left: CARD_W - 16, top: -6 }}
        aria-hidden="true"
      >
        {count}
      </span>
    </Tag>
  )
}
