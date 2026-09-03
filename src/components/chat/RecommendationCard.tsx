import { ArrowUp, Play, Plus, Trash2 } from 'lucide-react'

export interface Recommendation {
  id: string
  title: string
  description: string
  improveScore: string
  orb: string
}

interface RecommendationCardProps {
  recommendation: Recommendation
  applied: boolean
  onToggle: () => void
}

// Figma "Frame 45/46/47" — 173x245, surface/default on a gradient hairline
// border, 16px padding, 12px gap. The orb is a 73px circular image with a
// play affordance overlapping its lower-right.
export function RecommendationCard({ recommendation, applied, onToggle }: RecommendationCardProps) {
  const { title, description, improveScore, orb } = recommendation

  return (
    <article
      className="flex w-[173px] shrink-0 flex-col gap-12 rounded-[20px] bg-surface-default p-16"
      style={{
        border: '1px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(160deg, #ffe682, #ff881b)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="relative w-fit">
        <img src={orb} alt="" className="size-[73px] rounded-full object-cover" />
        <span className="absolute -bottom-2 -right-2 flex size-32 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm">
          <Play size={12} fill="currentColor" />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-style-body-small text-text-primary">{title}</p>
        <p className="text-style-caption text-text-primary">{description}</p>
      </div>

      <div className="flex items-center gap-8">
        <span className="text-style-caption text-text-primary">Improve Score</span>
        <span className="flex items-center gap-4 rounded-full bg-[#ecfbed] px-8 py-4 text-style-caption text-text-primary">
          <ArrowUp size={12} className="text-success-600" />
          {improveScore}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="flex w-fit items-center gap-4 rounded-full border border-border-subtle px-12 py-10 text-style-label text-text-primary transition-colors hover:bg-background-elevated"
      >
        {applied ? <Trash2 size={12} className="text-icon-default" /> : <Plus size={12} className="text-icon-default" />}
        {applied ? 'Remove' : 'Add'}
      </button>
    </article>
  )
}
