import { ChevronRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import sessionThumb from '../../assets/session-thumb.png'

interface SessionProgressCardProps {
  title: string
  status: string
  progress: number | null
  /** Where the artwork plays to. Left out while the session is still being
   *  made — there is nothing to play yet. */
  to?: string
}

// Figma "Frame 10" inside the generating state — a radius-100 pill 74 tall,
// surface/default, with a 54px round thumbnail carrying the play glyph and
// the percentage + chevron trailing. The thumbnail is the pill's measure: it
// sits in a 10px inset, so growing one without the other reads as a different
// component. It was 45 in a 70 pill, which made the artwork look inset.
export function SessionProgressCard({ title, status, progress, to }: SessionProgressCardProps) {
  return (
    <div className="flex w-full items-center gap-10 rounded-full bg-surface-default py-10 pl-12 pr-23">
      {to ? (
        <Link
          to={to}
          state={{ origin: 'own' }}
          aria-label={`Play ${title}`}
          className="u-press relative shrink-0"
        >
          <img src={sessionThumb} alt="" className="size-54 rounded-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
            <Play size={22} fill="currentColor" />
          </span>
        </Link>
      ) : (
        <div className="relative shrink-0">
          <img src={sessionThumb} alt="" className="size-54 rounded-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
            <Play size={22} fill="currentColor" />
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-style-body-small truncate text-text-primary">{title}</p>
        <p className="text-style-caption truncate text-text-secondary">{status}</p>
      </div>

      {progress !== null && <span className="text-style-caption shrink-0 text-text-secondary">{progress}%</span>}
      <ChevronRight size={19} className="shrink-0 text-icon-default" />
    </div>
  )
}
