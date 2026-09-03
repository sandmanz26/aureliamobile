import { ChevronRight, Play } from 'lucide-react'
import sessionThumb from '../../assets/session-thumb.png'

interface SessionProgressCardProps {
  title: string
  status: string
  progress: number | null
}

// Figma "Frame 10" inside the generating state — 362x70 pill, radius 100,
// surface/default, 45px round thumbnail with a play glyph, and the
// percentage + chevron trailing.
export function SessionProgressCard({ title, status, progress }: SessionProgressCardProps) {
  return (
    <div className="flex w-full items-center gap-10 rounded-full bg-surface-default py-12 pl-14 pr-23">
      <div className="relative shrink-0">
        <img src={sessionThumb} alt="" className="size-45 rounded-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
          <Play size={18} fill="currentColor" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-style-body-small truncate text-text-primary">{title}</p>
        <p className="text-style-caption truncate text-text-secondary">{status}</p>
      </div>

      {progress !== null && <span className="text-style-caption shrink-0 text-text-secondary">{progress}%</span>}
      <ChevronRight size={19} className="shrink-0 text-icon-default" />
    </div>
  )
}
