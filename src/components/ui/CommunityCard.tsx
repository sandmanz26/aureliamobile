import { Bookmark, PlayCircle, Repeat2 } from 'lucide-react'
import type { CoverKey } from '../../lib/photos'
import { CoverImage } from './CoverImage'

interface CommunityCardProps {
  title: string
  description: string
  author: string
  plays: string
  recreated: string
  gradient: string
  photo: CoverKey
}

export function CommunityCard({ title, description, author, plays, recreated, gradient, photo }: CommunityCardProps) {
  return (
    <article
      className="relative flex h-[230px] w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-16 p-12 text-text-inverse"
    >
      <CoverImage photo={photo} gradient={gradient} width={520} height={460} />
      <div className="relative flex items-center justify-between">
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
      <div className="relative">
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
