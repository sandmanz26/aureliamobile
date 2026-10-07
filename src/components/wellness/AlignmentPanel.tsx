import { AlignmentGauge } from './AlignmentGauge'

/** A stacked, tinted tag list — `TagRow` wraps horizontally with overflow
 *  folded into "+N", which is right for a topic list but wrong here: these
 *  are exactly three states, always, and the frame stacks them so "before"
 *  and "after" read top-to-bottom rather than competing for one line. */
function StateList({ states, tone }: { states: string[]; tone: 'previous' | 'current' }) {
  return (
    <div className={`flex flex-col gap-8 ${tone === 'current' ? 'items-end' : 'items-start'}`}>
      {states.map((state) => (
        <span
          key={state}
          className={`text-style-caption inline-block rounded-full px-10 py-4 ${
            tone === 'previous' ? 'bg-[#FBDCC0] text-warning-700' : 'bg-gold-100 text-warning-700'
          }`}
        >
          #{state}
        </span>
      ))}
    </div>
  )
}

/**
 * The score gauge plus its Previous/Current state columns — shared by
 * `WellnessObjectiveCard`'s "Learn more" panel and the player's own
 * post-session check-in, so the two never draw it two different ways.
 */
export function AlignmentPanel({
  score,
  previousState,
  currentState,
}: {
  score: number
  previousState: string[]
  currentState: string[]
}) {
  return (
    <div className="flex flex-col gap-16 rounded-16 bg-background-elevated p-16">
      <div className="flex items-center justify-between">
        <h3 className="text-style-body font-semibold text-text-primary">Alignment Score</h3>
        <span className="text-style-label rounded-full border border-border-default bg-surface-default px-12 py-4 text-text-primary">
          {score}%
        </span>
      </div>

      <AlignmentGauge score={score} />

      <div className="grid grid-cols-2 gap-16">
        <div className="flex flex-col gap-10">
          <h4 className="text-style-body-small font-medium text-text-primary">Previous State</h4>
          <StateList states={previousState} tone="previous" />
        </div>
        <div className="flex flex-col items-end gap-10 text-right">
          <h4 className="text-style-body-small font-medium text-text-primary">Current State</h4>
          <StateList states={currentState} tone="current" />
        </div>
      </div>
    </div>
  )
}
