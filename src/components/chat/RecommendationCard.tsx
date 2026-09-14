import { ArrowUp, Play, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Recommendation {
  id: string
  title: string
  description: string
  improveScore: string
  orb: string
  /** The session this change previews against, for the play glyph on the orb. */
  preview: string
}

interface RecommendationCardProps {
  recommendation: Recommendation
  applied: boolean
  onToggle: () => void
}

// Figma "Frame 45" (16523:9513), read from the file rather than a screenshot:
// 173 wide, 16px padding, 12px between blocks, on a 1px gradient hairline
// (#FFE682 -> #FCC181 at 217deg, from the frame's own gradient handles).
//
// rectangleCornerRadii is [48, 20, 20, 20] — the top-left is more than twice
// the others, and that asymmetry is the card's signature. Both values are off
// the token radius scale (0/2/4/8/12/16/24/32/full), so they have to be
// arbitrary: rounded-20 and rounded-tl-48 are not classes and would render
// square with no error at all.
//
// The orb is a 73px circular image the play glyph sits on, rather than a badge
// beside it.
export function RecommendationCard({ recommendation, applied, onToggle }: RecommendationCardProps) {
  const { title, description, improveScore, orb, preview } = recommendation

  return (
    <article
      className="flex w-[173px] shrink-0 flex-col gap-12 rounded-[20px] rounded-tl-[48px] bg-surface-default p-16"
      style={{
        border: '1px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(217deg, #ffe682, #fcc181)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      {/* The play glyph sits on the orb rather than in a badge beside it: the
          orb is the preview, and a corner badge read as a second control. It
          plays, rather than decorating — the disc is the only thing on this
          card that looks like a control and did nothing. */}
      <Link to={`/play/${preview}`} aria-label={`Play ${title}`} className="u-press relative w-fit">
        <img src={orb} alt="" className="size-[73px] rounded-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-[16px]">
            <Play size={16} fill="currentColor" className="text-white" />
          </span>
        </span>
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-style-body-small text-text-primary">{title}</p>
        {/* Sofia Pro Light in the frame. font-light alone loses to
            .text-style-caption, which sets font-weight itself and sits outside
            Tailwind's utility layer — the v4 ordering trap. */}
        <p className="text-style-caption font-light! text-text-primary">{description}</p>
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
        className="flex h-32 w-fit items-center gap-4 rounded-full border border-border-subtle pl-12 pr-14 text-style-label text-text-primary transition-colors hover:bg-background-elevated"
      >
        {applied ? <Trash2 size={12} className="text-icon-default" /> : <Plus size={12} className="text-icon-default" />}
        {applied ? 'Remove' : 'Add'}
      </button>
    </article>
  )
}
