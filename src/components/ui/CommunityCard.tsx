import { Bookmark, PlayCircle, Repeat2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CoverKey } from '../../lib/photos'
import { CoverImage } from './CoverImage'

interface CommunityCardProps {
  /** Identifies the session in the catalogue — the card links to it. */
  slug: string
  title: string
  description: string
  author: string
  plays: string
  recreated: string
  gradient: string
  photo: CoverKey
  /**
   * Runs before either link navigates. Returning false cancels it — that is how
   * the visitor-facing home sends someone to sign in instead of into a session.
   */
  guard?: () => boolean
}

// The whole card opens the session; Recreate and Save sit above that overlay so
// they stay their own targets rather than being swallowed by it.
export function CommunityCard({
  slug,
  title,
  description,
  author,
  plays,
  recreated,
  gradient,
  photo,
  guard,
}: CommunityCardProps) {
  function handleClick(event: React.MouseEvent) {
    if (guard && !guard()) event.preventDefault()
  }

  return (
    <article className="u-lift relative flex h-[230px] w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-16 p-12 text-text-inverse">
      <CoverImage photo={photo} gradient={gradient} width={520} height={460} />
      <Link
        to={`/session/${slug}`}
        aria-label={`Open ${title}`}
        onClick={handleClick}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-20 flex items-center justify-between">
        <button
          type="button"
          aria-label="Save"
          className="flex size-32 items-center justify-center rounded-full bg-surface-default/90 text-icon-default"
        >
          <Bookmark size={16} />
        </button>
        <Link
          to={`/recreate/${slug}`}
          onClick={handleClick}
          className="text-style-label flex h-32 items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/90 px-12 text-text-primary"
        >
          <Repeat2 size={14} />
          Recreate
        </Link>
      </div>

      <div className="pointer-events-none relative">
        <p className="text-style-body font-semibold">{title}</p>
        <p className="text-style-body-small mt-4 line-clamp-2 opacity-90">{description}</p>
        <div className="text-style-caption mt-8 flex items-center justify-between opacity-90">
          <span>{author}</span>
          <span className="flex items-center gap-8">
            <span className="inline-flex items-center gap-2">
              <PlayCircle size={12} /> {plays}
            </span>
            <span className="inline-flex items-center gap-2">
              <Repeat2 size={12} /> {recreated}
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}
