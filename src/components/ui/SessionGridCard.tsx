import { Play, Repeat2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRecreateTarget } from '../../chat/recreate'
import type { ProfileOrigin } from '../../lib/people'
import type { SessionRecord } from '../../lib/sessions'
import { CoverImage } from './CoverImage'
import { PhotoCircle } from './PhotoCircle'

/**
 * The tall session card used on the See All grid and the challenge shelf.
 *
 * Different from the shelf card on Home: it leads with Play rather than Save,
 * and it credits the creator by face as well as name — on a grid of eight,
 * "who made this" is the fastest thing to scan by.
 */
export function SessionGridCard({
  session,
  /** Overrides the grid's portrait ratio — the challenge shelf runs wider and shorter. */
  className = 'aspect-[164/205] w-full',
  /** Home shows this card signed out, where opening a session asks for an account first. */
  guard,
  /** Your own profile already says whose sessions these are in its own
   *  header — crediting the creator again on every card is the one thing
   *  that differs from the community grid this was built for. */
  showAuthor = true,
  /** Where the player's own byline should point back to — 'own' from your
   *  own profile, 'community' everywhere else this card is used. */
  playOrigin = 'community',
}: {
  session: SessionRecord
  className?: string
  guard?: () => boolean
  showAuthor?: boolean
  playOrigin?: ProfileOrigin
}) {
  const recreate = useRecreateTarget(session)

  function handleClick(event: React.MouseEvent) {
    if (guard && !guard()) event.preventDefault()
  }

  return (
    <article
      // min-h: the ratio alone starves the card on a 320px screen — two grid
      // columns leave it 167px tall for 188px of content, and the card clips
      // its own stats row. The floor wins there; the ratio wins everywhere else.
      className={`u-lift @container relative flex min-h-[192px] flex-col justify-between overflow-hidden rounded-16 p-10 text-text-inverse ${className}`}
    >
      <CoverImage photo={session.photo} gradient={session.gradient} width={420} height={520} />
      <Link
        to={`/session/${session.slug}`}
        aria-label={`Open ${session.title}`}
        onClick={handleClick}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-20 flex items-start justify-between gap-8">
        <Link
          to={`/play/${session.slug}`}
          state={{ origin: playOrigin }}
          aria-label={`Play ${session.title}`}
          onClick={handleClick}
          className="flex size-32 shrink-0 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm"
        >
          <Play size={14} fill="currentColor" />
        </Link>
        {/* Below ~152px of card the word does not fit beside Play, and a
            truncated "Rec…" reads as broken where the glyph alone reads as a
            button. Keyed on the card, not the viewport, so the challenge
            shelf's wider cards keep the label at any screen size. */}
        <Link
          to={recreate.to}
          state={recreate.state}
          aria-label={`Recreate ${session.title}`}
          onClick={handleClick}
          className="text-style-label-regular flex h-30 shrink-0 items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/95 px-11 text-[#331B04]"
        >
          <Repeat2 size={13} className="shrink-0" />
          <span className="hidden @min-[130px]:inline">Recreate</span>
        </Link>
      </div>

      <div className="pointer-events-none relative z-20 mt-auto">
        {/* The frosted panel behind the title/stats block, not a blur over
            the whole photo — CoverImage's own scrim already darkens the
            full card, and blurring that too would soften the Play/Recreate
            controls above it as well. Sized past the card's own p-10 with
            negative insets so it reaches the actual edges `overflow-hidden`
            clips to, rather than leaving a sharp strip around it. The
            explicit z-20 on this wrapper (matching the top row's) gives the
            blur panel's negative z-index a stacking context to stay inside,
            so it stays behind the text without escaping to behind the photo.
            `backdrop-blur` has no gradient of its own — a plain rectangle
            cuts the blur off instantly at its top edge, which is a visible
            seam against the sharp photo above it. The mask fades that same
            edge out, so the blur itself tapers off rather than stopping. */}
        <div
          className="absolute -inset-x-10 -bottom-10 -top-16 -z-10 bg-gradient-to-t from-black/55 via-black/35 to-transparent backdrop-blur-sm"
          style={{
            maskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
          }}
        />
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-style-body">{session.title}</p>
            <p className="text-style-label-light mt-2 line-clamp-2">{session.description}</p>
          </div>

          {/* Credit and counts share a row once the card is wide enough for both,
              which is how the design sets it. On the narrow grid cells they stack
              instead — one row there would leave the name a couple of letters. */}
          <div
            className={
              showAuthor
                ? 'flex flex-col gap-6 @min-[200px]:flex-row @min-[200px]:items-center @min-[200px]:justify-between @min-[200px]:gap-8'
                : 'flex items-center'
            }
          >
            {showAuthor && (
              <div className="flex min-w-0 items-center gap-6">
                <PhotoCircle
                  photo={session.authorPhoto}
                  size={20}
                  gradient="conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))"
                />
                <span className="text-style-caption truncate">{session.author}</span>
              </div>
            )}

            <div className="text-style-caption-light flex shrink-0 items-center gap-8">
              <span className="inline-flex items-center gap-3">
                <Play size={11} /> {session.plays}
              </span>
              <span className="opacity-50">|</span>
              <span className="inline-flex items-center gap-3">
                <Repeat2 size={11} /> {session.recreated}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
