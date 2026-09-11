import { Play, Repeat2 } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  className = 'aspect-[164/205]',
}: {
  session: SessionRecord
  className?: string
}) {
  return (
    <article
      // min-h: the ratio alone starves the card on a 320px screen — two grid
      // columns leave it 167px tall for 188px of content, and the card clips
      // its own stats row. The floor wins there; the ratio wins everywhere else.
      className={`u-lift @container relative flex min-h-[192px] w-full flex-col justify-between overflow-hidden rounded-16 p-10 text-text-inverse ${className}`}
    >
      <CoverImage photo={session.photo} gradient={session.gradient} width={420} height={520} />
      <Link to={`/session/${session.slug}`} aria-label={`Open ${session.title}`} className="absolute inset-0 z-10" />

      <div className="relative z-20 flex items-start justify-between gap-8">
        <Link
          to={`/session/${session.slug}`}
          aria-label={`Play ${session.title}`}
          className="flex size-32 shrink-0 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm"
        >
          <Play size={14} fill="currentColor" />
        </Link>
        {/* Below ~152px of card the word does not fit beside Play, and a
            truncated "Rec…" reads as broken where the glyph alone reads as a
            button. Keyed on the card, not the viewport, so the challenge
            shelf's wider cards keep the label at any screen size. */}
        <Link
          to={`/recreate/${session.slug}`}
          aria-label={`Recreate ${session.title}`}
          className="text-style-label flex h-30 shrink-0 items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/95 px-11 text-text-primary"
        >
          <Repeat2 size={13} className="shrink-0" />
          <span className="hidden @min-[130px]:inline">Recreate</span>
        </Link>
      </div>

      <div className="pointer-events-none relative flex flex-col gap-6">
        <div>
          <p className="text-style-body font-semibold">{session.title}</p>
          <p className="text-style-body-small mt-2 line-clamp-2 opacity-90">{session.description}</p>
        </div>

        <div className="flex items-center gap-6">
          <PhotoCircle
            photo={session.authorPhoto}
            size={20}
            gradient="conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))"
          />
          <span className="text-style-caption truncate">{session.author}</span>
        </div>

        <div className="text-style-caption flex items-center gap-8 opacity-90">
          <span className="inline-flex items-center gap-3">
            <Play size={11} /> {session.plays}
          </span>
          <span className="opacity-50">|</span>
          <span className="inline-flex items-center gap-3">
            <Repeat2 size={11} /> {session.recreated}
          </span>
        </div>
      </div>
    </article>
  )
}
