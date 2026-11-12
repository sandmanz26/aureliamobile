import { WandSparkles } from 'lucide-react'
import { chapterSummary } from '../../chat/chapter'
import type { Recommendation } from './RecommendationCard'

/**
 * The proposal as one card (Figma "Frame 45" in Changes → Chat, 16906:4995),
 * replacing the fanned deck (U066): the changes' orbs stacked with a count,
 * the chapter it would make, a one-line summary, and two actions — Review the
 * list, or Apply it as it stands.
 *
 * White, 20 radius (off the token scale, so arbitrary), 16 padding, 24 between
 * the summary row and the buttons, the deck's two shadows. Orbs overlap by 34.
 */
const CARD_SHADOW = '14px 9px 14px 4px rgba(0, 0, 0, 0.03), 4px 4px 5px rgba(0, 0, 0, 0.03)'

interface ChapterCardProps {
  title: string
  recommendations: Recommendation[]
  count: number
  /** Left out once applied: the card is then a record of what was asked for. */
  onReview?: () => void
  onApply?: () => void
  applying?: boolean
}

export function ChapterCard({ title, recommendations, count, onReview, onApply, applying }: ChapterCardProps) {
  const orbs = recommendations.slice(0, 3)
  return (
    <article
      aria-label={`${title}: ${count} ${count === 1 ? 'change' : 'changes'}`}
      className="flex flex-col gap-24 rounded-[20px] bg-surface-default p-16"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-14">
        <div className="relative flex shrink-0 items-center" aria-hidden="true">
          {orbs.map((r, i) => (
            <img
              key={r.id}
              src={r.orb}
              alt=""
              className="size-48 rounded-full border-2 border-surface-default object-cover"
              style={{ marginLeft: i === 0 ? 0 : -34, zIndex: i + 1 }}
            />
          ))}
          <span
            className="text-style-caption absolute -right-4 -top-4 z-10 flex size-20 items-center justify-center rounded-full bg-surface-default font-medium! text-text-primary"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
          >
            {count}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-[20px] leading-[26px] text-text-primary">{title}</p>
          <p className="text-style-caption line-clamp-1 text-text-secondary">{chapterSummary(recommendations)}</p>
        </div>
      </div>

      {(onReview || onApply) && (
        <div className="flex gap-12">
          {onReview && (
            <button
              type="button"
              onClick={onReview}
              className="text-style-label u-press flex h-40 flex-1 items-center justify-center rounded-12 border border-[#E4E4E4] bg-surface-default px-12 text-text-primary"
            >
              Review changes
            </button>
          )}
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              disabled={applying || count === 0}
              className="text-style-label u-press flex h-40 flex-1 items-center justify-center gap-4 rounded-12 bg-[#331B04] px-12 text-text-inverse disabled:opacity-60"
            >
              <WandSparkles size={13} aria-hidden="true" />
              {applying ? 'Updating..' : `Apply changes (${count})`}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
