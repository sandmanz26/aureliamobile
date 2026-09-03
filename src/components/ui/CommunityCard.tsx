import { Bookmark, PlayCircle, Repeat2 } from 'lucide-react'

interface CommunityCardProps {
  title: string
  description: string
  author: string
  plays: string
  recreated: string
  gradient: string
}

export function CommunityCard({ title, description, author, plays, recreated, gradient }: CommunityCardProps) {
  return (
    <article
      className="relative flex h-[230px] w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-16 p-12 text-text-inverse"
      style={{ background: gradient }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Save"
          className="flex size-32 items-center justify-center rounded-full bg-surface-default/90 text-icon-default"
        >
          <Bookmark size={16} />
        </button>
        <button
          type="button"
          className="flex h-32 items-center gap-4 rounded-full bg-surface-default/90 px-12 text-style-label text-text-primary"
        >
          <Repeat2 size={14} />
          Recreate
        </button>
      </div>
      <div>
        <p className="text-style-body font-semibold">{title}</p>
        <p className="mt-4 text-style-body-small line-clamp-2 opacity-90">{description}</p>
        <div className="mt-8 flex items-center justify-between text-style-caption opacity-90">
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
