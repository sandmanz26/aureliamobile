import { useState } from 'react'
import type { Recommendation } from './RecommendationCard'
import { RecommendationCard } from './RecommendationCard'

/**
 * Version 2 (staging): the opened recommendation row with a filter above it.
 *
 * Assumption, since the request was only "add a filter": the useful cut is
 * *what each change acts on* — what you see, what you hear, how it moves —
 * plus "Selected", so you can check the set you are about to apply before
 * pressing Apply. Chips carry counts and a kind with nothing in it is not
 * offered. v1 renders the plain row in ChatMessageItem and never this.
 */
export type RecommendationKind = 'visual' | 'sound' | 'movement'

const KIND_OF: Record<string, RecommendationKind> = {
  yellow: 'visual',
  movement: 'movement',
  frequency: 'sound',
}

const FILTERS: { id: 'all' | RecommendationKind | 'selected'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'visual', label: 'Visual' },
  { id: 'sound', label: 'Sound' },
  { id: 'movement', label: 'Movement' },
  { id: 'selected', label: 'Selected' },
]

export function RecommendationFilter({
  recommendations,
  applied,
  onToggle,
}: {
  recommendations: Recommendation[]
  applied: string[]
  onToggle: (id: string) => void
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')

  const matches = (r: Recommendation, id: (typeof FILTERS)[number]['id']) =>
    id === 'all' ? true : id === 'selected' ? applied.includes(r.id) : KIND_OF[r.id] === id

  const shown = recommendations.filter((r) => matches(r, filter))

  return (
    <div className="u-message mt-12">
      <div role="toolbar" aria-label="Filter recommendations" className="-mx-20 flex gap-8 overflow-x-auto px-20 pb-4">
        {FILTERS.map((f) => {
          const count = recommendations.filter((r) => matches(r, f.id)).length
          if (count === 0 && f.id !== 'all' && f.id !== 'selected') return null
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`u-press flex h-32 shrink-0 items-center gap-6 rounded-full border px-12 text-[13px] leading-none transition-colors ${
                active
                  ? 'border-text-primary bg-text-primary text-text-inverse'
                  : 'border-border-subtle bg-surface-default text-text-primary'
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${active ? 'text-text-inverse/70' : 'text-text-secondary'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="-mx-20 mt-8 flex gap-11 overflow-x-auto px-20 pb-4">
        {shown.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            applied={applied.includes(recommendation.id)}
            onToggle={() => onToggle(recommendation.id)}
          />
        ))}
        {shown.length === 0 && (
          <p className="text-style-body-small py-24 text-text-secondary">
            Nothing selected yet. Add a change from All to see it here.
          </p>
        )}
      </div>
    </div>
  )
}
