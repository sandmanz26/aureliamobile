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
      className={`u-lift relative flex w-full flex-col justify-between overflow-hidden rounded-16 p-10 text-text-inverse ${className}`}
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
        <Link
          to={`/recreate/${session.slug}`}
          className="text-style-label flex h-30 items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/95 px-11 text-text-primary"
        >
          <Repeat2 size={13} />
          Recreate
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
