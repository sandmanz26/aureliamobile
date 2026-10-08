import { ChevronDown, ChevronRight, ChevronUp, Pencil, Target, WandSparkles } from 'lucide-react'
import type { WellnessGoal } from '../../lib/wellnessGoals'
import { TagRow } from '../ui/TagRow'
import { AlignmentPanel } from './AlignmentPanel'

function XpBar({ current, target }: { current: number; target: number }) {
  const share = target === 0 ? 0 : Math.min(1, current / target)
  return (
    <div className="flex items-center gap-12">
      <span className="text-style-caption shrink-0 text-text-secondary">{current.toLocaleString()} XP</span>
      <span className="h-6 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: '#FBE7D2' }}>
        <span
          className="block h-full rounded-full transition-[width] duration-300"
          style={{ width: `${share * 100}%`, background: 'linear-gradient(90deg, #FF881B, #FFD242)' }}
        />
      </span>
      <span className="text-style-caption shrink-0 text-text-secondary">{target.toLocaleString()} XP</span>
    </div>
  )
}

export function WellnessObjectiveCard({
  goal,
  expanded,
  onToggle,
  onAnalyze,
  onSecondaryAction,
}: {
  goal: WellnessGoal
  expanded: boolean
  onToggle: () => void
  onAnalyze: () => void
  onSecondaryAction: () => void
}) {
  return (
    <article
      className={`overflow-hidden rounded-24 bg-surface-default shadow-sm transition-colors ${
        expanded ? 'border border-brand-emphasis' : 'border border-border-subtle'
      }`}
    >
      <div className="flex flex-col gap-16 p-16">
        <div className="flex items-center gap-12">
          <span
            className="flex size-40 shrink-0 items-center justify-center rounded-full text-icon-strong"
            style={{ background: '#FFEEDC' }}
          >
            <Target size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-style-caption text-text-secondary">{goal.kind}</p>
            <p className="text-style-body font-semibold text-text-primary">{goal.title}</p>
          </div>
          <button
            type="button"
            aria-label={`Edit ${goal.title}`}
            className="u-press u-tap shrink-0 text-icon-secondary"
          >
            <Pencil size={16} />
          </button>
        </div>

        <XpBar current={goal.xpCurrent} target={goal.xpTarget} />
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="u-press flex w-full items-center justify-between border-t border-border-subtle px-16 py-14 text-left"
      >
        <span className="text-style-body-small text-text-primary">Learn more</span>
        {expanded ? (
          <ChevronUp size={18} className="text-icon-secondary" />
        ) : (
          <ChevronDown size={18} className="text-icon-secondary" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-16 px-16 pb-16">
          {/* Side by side at lg: — stacked full-width on a desktop card, the
              gauge sat alone in a wide grey box with the two state lists
              pushed to opposite edges. The wrapper's own gap-16 is the same
              gap the parent already gave these two on mobile. */}
          <div className="flex flex-col gap-16 lg:grid lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col gap-12 rounded-16 bg-background-elevated p-16">
              <h3 className="text-style-body font-semibold text-text-primary">What's helping me progress</h3>
              <p className="text-style-body-small text-text-secondary">{goal.progress}</p>
              <TagRow tags={goal.tags} max={4} />
            </div>

            <AlignmentPanel
              score={goal.alignmentScore}
              previousState={goal.previousState}
              currentState={goal.currentState}
            />
          </div>

          <div className="flex gap-12">
            <button
              type="button"
              onClick={onAnalyze}
              className="u-press flex h-44 flex-1 items-center justify-center gap-8 rounded-full border border-brand-emphasis text-style-label text-text-primary"
            >
              <WandSparkles size={14} />
              Analyze my state
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={onSecondaryAction}
              className="u-press flex h-44 flex-1 items-center justify-center gap-8 rounded-full border border-brand-emphasis text-style-label text-text-primary"
            >
              <WandSparkles size={14} />
              {goal.secondaryAction}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
