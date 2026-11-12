import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Story } from '../../lib/journeys'

/**
 * A personal journey on Explore (Figma 16906:5645): 236 x 320, the photo
 * under a dark gradient, the story's own words as the title, then the author
 * and the read time. The gradient floor shows while the photo loads.
 */
export function JourneyCard({ story, className = '' }: { story: Story; className?: string }) {
  return (
    <Link
      to={`/journeys/${story.slug}`}
      className={`u-press relative flex h-[320px] w-[236px] shrink-0 flex-col justify-end overflow-hidden rounded-16 p-16 text-text-inverse ${className}`}
      style={{ background: story.gradient }}
    >
      <img src={story.photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)' }} />
      <span className="relative flex flex-col gap-12">
        <span className="text-[18px] leading-[24px]">{story.title}</span>
        <span className="text-style-caption flex items-center gap-8">
          <img src={story.avatar} alt="" className="size-20 rounded-full object-cover" />
          <span className="min-w-0 flex-1 truncate">{story.author}</span>
          <span className="flex shrink-0 items-center gap-4 opacity-90">
            <Clock size={12} aria-hidden="true" />
            {story.minutes} mins read
          </span>
        </span>
      </span>
    </Link>
  )
}
