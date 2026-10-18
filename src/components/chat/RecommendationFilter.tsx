import { useLayoutEffect, useRef, useState } from 'react'
import { CheckCircle2, Eye, LayoutGrid, Music, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Recommendation } from './RecommendationCard'
import { RecommendationCard } from './RecommendationCard'

/**
 * Version 2 (staging): the opened recommendation row with a filter above it.
 *
 * Assumption, since the request was only "add a filter, be creative": the
 * useful cut is *what each change acts on* — what you see, what you hear, how
 * it moves — plus "Selected", so the set about to be applied can be checked
 * before pressing Apply. Each chip has an icon and a count, a kind with
 * nothing in it is not offered, and the active highlight slides between chips
 * rather than jumping. Under the chips a summary line says how many changes
 * are selected and the score they would add together, which updates as cards
 * are added or removed. v1 renders the plain row in ChatMessageItem.
 */
export type RecommendationKind = 'visual' | 'sound' | 'movement'

const KIND_OF: Record<string, RecommendationKind> = {
  yellow: 'visual',
  movement: 'movement',
  frequency: 'sound',
}

type FilterId = 'all' | RecommendationKind | 'selected'

const FILTERS: { id: FilterId; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'visual', label: 'Visual', icon: Eye },
  { id: 'sound', label: 'Sound', icon: Music },
  { id: 'movement', label: 'Movement', icon: Wind },
  { id: 'selected', label: 'Selected', icon: CheckCircle2 },
]

const percent = (value: string) => Number.parseFloat(value.replace(/[^0-9.-]/g, '')) || 0

export function RecommendationFilter({
  recommendations,
  applied,
  onToggle,
}: {
  recommendations: Recommendation[]
  applied: string[]
  onToggle: (id: string) => void
}) {
  const [filter, setFilter] = useState<FilterId>('all')

  const matches = (r: Recommendation, id: FilterId) =>
    id === 'all' ? true : id === 'selected' ? applied.includes(r.id) : KIND_OF[r.id] === id

  const visible = FILTERS.filter(
    (f) => f.id === 'all' || f.id === 'selected' || recommendations.some((r) => matches(r, f.id)),
  )
  const shown = recommendations.filter((r) => matches(r, filter))

  const selected = recommendations.filter((r) => applied.includes(r.id))
  const totalImpact = selected.reduce((sum, r) => sum + percent(r.improveScore), 0)

  // The sliding highlight: measured from the active chip, so it follows the
  // chip's real width whatever its label and count.
  const rail = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  useLayoutEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>(`[data-filter="${filter}"]`)
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [filter, applied.length])

  return (
    <div className="u-message mt-12">
      <div className="-mx-20 overflow-x-auto px-20 pb-4">
        <div ref={rail} role="toolbar" aria-label="Filter recommendations" className="relative flex w-max gap-6">
          {pill && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-text-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {visible.map(({ id, label, icon: Icon }) => {
            const count = recommendations.filter((r) => matches(r, id)).length
            const active = filter === id
            return (
              <button
                key={id}
                type="button"
                data-filter={id}
                aria-pressed={active}
                onClick={() => setFilter(id)}
                className={`u-press relative flex h-34 shrink-0 items-center gap-6 rounded-full border px-12 text-[13px] leading-none transition-colors duration-300 ${
                  active ? 'border-transparent text-text-inverse' : 'border-border-subtle bg-surface-default text-text-primary'
                }`}
              >
                <Icon size={14} />
                {label}
                <span
                  className={`min-w-18 rounded-full px-5 py-2 text-center text-[11px] tabular-nums ${
                    active ? 'bg-white/20 text-text-inverse' : 'bg-background-elevated text-text-secondary'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* What the current set adds up to, in the card's own currency. */}
      <p className="text-style-caption mt-8 flex items-center gap-6 text-text-secondary" aria-live="polite">
        <span className="tabular-nums">
          {selected.length} of {recommendations.length} selected
        </span>
        {selected.length > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="rounded-full bg-[#ECFBED] px-6 py-2 text-success-600 tabular-nums">
              ↑ {totalImpact}% combined
            </span>
          </>
        )}
      </p>

      {/* Wrapper is flex so each card stretches to the row's tallest one
          (U037) — a two-line description made one card taller and its Add
          button sat lower than its neighbours'. */}
      <div key={filter} className="-mx-20 mt-10 flex gap-11 overflow-x-auto px-20 pb-4">
        {shown.map((recommendation, index) => (
          <div key={recommendation.id} className="u-pop flex shrink-0" style={{ animationDelay: `${index * 50}ms` }}>
            <RecommendationCard
              recommendation={recommendation}
              applied={applied.includes(recommendation.id)}
              onToggle={() => onToggle(recommendation.id)}
            />
          </div>
        ))}
        {shown.length === 0 && (
          <div className="flex min-h-120 w-full flex-col items-start justify-center gap-8 rounded-[20px] border border-dashed border-border-subtle px-16 py-20">
            <p className="text-style-body-small text-text-secondary">
              {filter === 'selected' ? 'Nothing selected yet.' : 'No changes of this kind in this set.'}
            </p>
            <button type="button" onClick={() => setFilter('all')} className="text-style-body-small text-[#ff881b]">
              Show all {recommendations.length}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
