import { Clock, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoverImage } from '../ui/CoverImage'
import { durationLabel, findSession } from '../../lib/sessions'
import { useFeatureFlags } from '../../demo/FeatureFlags'
import { playerHref } from '../../lib/playerBeta'

/**
 * The original a fork is being made from, shown in the thread.
 *
 * Recreate used to arrive as a sentence — "Recreate X by Y, at N minutes" —
 * which names the session but does not show it, and gives you no way to hear
 * the thing you are about to change. This is the same hand-off with the
 * session attached to it: cover, title, author, run time, and a play control
 * that opens the player on it.
 *
 * It sits under the message that carries it rather than at the end of the
 * thread, so everything said afterwards comes after it.
 */
export function AttachedSession({ slug }: { slug: string }) {
  const session = findSession(slug)
  const { isEnabled } = useFeatureFlags()
  // A slug that resolves to nothing is not worth a broken card: the message
  // above still says what is being recreated.
  if (!session) return null

  return (
    <article className="flex w-[283px] items-center gap-12 overflow-hidden rounded-16 bg-surface-default p-8 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
      <span className="relative size-56 shrink-0 overflow-hidden rounded-12">
        <CoverImage photo={session.photo} gradient={session.gradient} width={160} height={160} scrim={false} />
        <Link
          to={playerHref(`/play/${session.slug}`, isEnabled('player.beta'))}
          state={{ origin: 'community' }}
          aria-label={`Play ${session.title}`}
          className="u-press absolute inset-0 flex items-center justify-center bg-black/25 text-text-inverse"
        >
          <Play size={16} fill="currentColor" strokeWidth={0} />
        </Link>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-2 pr-4">
        <span className="truncate text-[13px] leading-[19px] text-text-primary">{session.title}</span>
        <span className="truncate text-[10px] leading-[15px] text-[#525252]">{session.author}</span>
        <span className="flex items-center gap-4 text-[10px] leading-[15px] text-[#525252]">
          <Clock size={10} />
          {durationLabel(session)} mins
        </span>
      </span>
    </article>
  )
}
