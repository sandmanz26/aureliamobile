import type { Recommendation } from './RecommendationCard'

interface RecommendationDeckProps {
  recommendations: Recommendation[]
  count: number
  /** Left out once the set has been applied: it is then a record of what was
   *  asked for, and opening it would offer edits that no longer land. */
  onOpen?: () => void
}

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
      className={`relative block h-[172px] w-[268px] shrink-0 text-left ${onOpen ? 'u-press' : ''}`}
    >
      {cards.map((recommendation, index) => {
        // Each card behind the front one sits further right and turns back
        // towards upright, so the stack reads as a deck rather than a blur.
        const rotate = [-7, -3, 1][index] ?? 0
        return (
          <span
            key={recommendation.id}
            className="absolute top-0 flex h-[160px] w-[152px] flex-col justify-end gap-2 overflow-hidden rounded-[18px] border border-brand-emphasis/45 bg-surface-default p-14 shadow-sm"
            style={{ left: index * 44, rotate: `${rotate}deg`, zIndex: cards.length - index }}
          >
            <img
              src={recommendation.orb}
              alt=""
              className="absolute left-14 top-14 size-[42px] rounded-full object-cover"
            />
            <span className="text-style-body-small mt-auto line-clamp-1 font-medium text-text-primary">
              {recommendation.title}
            </span>
            <span className="text-style-caption line-clamp-2 text-text-secondary">
              {recommendation.description}
            </span>
          </span>
        )
      })}

      {/* The count rides the front card's top-right corner, so the stack says
          how many changes it holds without being opened. */}
      <span
        className="text-style-label absolute left-[104px] top-[-10px] z-10 flex size-30 items-center justify-center rounded-full bg-brand-default text-text-strong shadow-sm"
        aria-hidden="true"
      >
        {count}
      </span>
    </Tag>
  )
}
