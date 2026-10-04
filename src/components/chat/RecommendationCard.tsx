import { ArrowUp, Plus, Shuffle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRecreateTarget } from '../../chat/recreate'
import { findSession } from '../../lib/sessions'

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
  /**
   * Which card this is. In the cockpit it is a change you add to or remove
   * from the set being built (173x246, with the score it would move). On the
   * player it is a starting point you fork, so the score and the toggle go and
   * a Recreate takes their place — the frame's 173x214.
   */
  variant?: 'toggle' | 'recreate'
}

// Figma "Frame 45" inside the Chat screen (16809:4944 → 16809:4992), read
// from the file rather than a screenshot: 173 wide, 16px padding, 12px
// between blocks, on a 1px gradient hairline — the established brand
// gradient (#FF881B -> #FFE682; the file's own paint style for this hairline
// resolves to #FF8514 -> #FFE270, close enough that DESIGN-SYSTEM-HISTORY.md
// records the difference and leaves the established pair alone).
//
// cornerRadius is a uniform 20 here — off the token radius scale
// (0/2/4/8/12/16/24/32/full), so it has to stay arbitrary: rounded-20 is not
// a class and would render square with no error at all. An earlier pass read
// an asymmetric [48, 20, 20, 20] off a different, older frame (16523:9513);
// this screen's own card does not carry that asymmetry.
//
// The orb is a plain 73px circular image on this screen — no play glyph over
// it. A different card elsewhere in the same file does carry one; this one
// does not, and the two are not meant to agree.
export function RecommendationCard({
  recommendation,
  applied,
  onToggle,
  variant = 'toggle',
}: RecommendationCardProps) {
  const { title, description, improveScore, orb, preview } = recommendation
  const recreate = variant === 'recreate'
  // `preview` is the session this card plays, and it is the one a Recreate
  // forks — the card has no other session to offer.
  const recreateTarget = useRecreateTarget(findSession(preview))

  return (
    <article
      className="flex w-[173px] shrink-0 flex-col gap-12 rounded-[20px] bg-surface-default p-16"
      style={{
        border: '1px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(45deg, #FF881B, #FFE682)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      {/* Plays on tap, same as the rest of the card's controls — but no play
          glyph drawn over it, matching this screen's own cards. */}
      <Link
        to={`/play/${preview}`}
        state={{ origin: 'own' }}
        aria-label={`Play ${title}`}
        className="u-press w-fit"
      >
        <img src={orb} alt="" className="size-[73px] rounded-full object-cover" />
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-style-body-small text-text-primary">{title}</p>
        {/* Sofia Pro Light in the frame. font-light alone loses to
            .text-style-caption, which sets font-weight itself and sits outside
            Tailwind's utility layer — the v4 ordering trap. */}
        <p className="text-style-caption font-light! text-text-primary">{description}</p>
      </div>

      {!recreate && (
        <div className="flex items-center gap-8">
          <span className="text-style-caption text-text-primary">Improve Score</span>
          <span className="flex items-center gap-4 rounded-full bg-[#ecfbed] px-8 py-4 text-style-caption text-text-primary">
            <ArrowUp size={12} className="text-success-600" />
            {improveScore}
          </span>
        </div>
      )}

      {recreate ? (
        <Link
          to={recreateTarget.to}
          state={recreateTarget.state}
          className="u-press mt-auto flex h-32 w-fit items-center gap-4 rounded-full border border-border-subtle pl-12 pr-14 text-style-label text-[#331B04]"
        >
          <Shuffle size={12} />
          Recreate
        </Link>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-32 w-fit items-center gap-4 rounded-full border border-border-subtle pl-12 pr-14 text-style-label text-text-primary transition-colors hover:bg-background-elevated"
        >
          {applied ? <Trash2 size={12} className="text-icon-default" /> : <Plus size={12} className="text-icon-default" />}
          {applied ? 'Remove' : 'Add'}
        </button>
      )}
    </article>
  )
}
