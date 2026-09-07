import { useState } from 'react'
import type { CoverKey } from '../../lib/photos'
import { COVER_PHOTOS, unsplash } from '../../lib/photos'

interface PhotoCircleProps {
  photo: CoverKey
  /** Rendered diameter in px; also what the CDN is asked for (at 2x). */
  size: number
  /** Painted underneath, and left showing if the photo fails to load. */
  gradient: string
  alt?: string
  className?: string
}

// Circular counterpart to <CoverImage> — same contract: the gradient is always
// painted, the photo layers over it, and a failed load falls back silently
// rather than leaving a broken-image box.
export function PhotoCircle({ photo, size, gradient, alt = '', className = '' }: PhotoCircleProps) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: gradient }}
    >
      {!failed && (
        <img
          src={unsplash(COVER_PHOTOS[photo], size * 2, size * 2)}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </span>
  )
}
