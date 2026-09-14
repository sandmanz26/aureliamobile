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

// Figma "Frame 45/46/47" — 173 wide on a gradient hairline border, radius 24,
// 16px padding, 14px between blocks. The orb is a 73px circular image the play
// glyph sits on, rather than a badge beside it.
export function RecommendationCard({ recommendation, applied, onToggle }: RecommendationCardProps) {
  const { title, description, improveScore, orb } = recommendation

  return (
    <article
      className="flex w-[173px] shrink-0 flex-col gap-14 rounded-24 bg-surface-default p-16"
      style={{
        border: '1px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(160deg, #ffe682, #ff881b)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      {/* The play glyph sits on the orb rather than in a badge beside it: the
          orb is the preview, and a corner badge read as a second control. */}
      <div className="relative w-fit">
        <img src={orb} alt="" className="size-[73px] rounded-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-white/75">
          <Play size={22} fill="currentColor" />
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
        className="flex h-30 w-fit items-center gap-4 rounded-full border border-border-subtle px-12 text-style-label text-text-primary transition-colors hover:bg-background-elevated"
      >
        {applied ? <Trash2 size={12} className="text-icon-default" /> : <Plus size={12} className="text-icon-default" />}
        {applied ? 'Remove' : 'Add'}
      </button>
    </article>
  )
}
