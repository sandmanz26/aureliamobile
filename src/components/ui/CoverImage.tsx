import { useState } from 'react'
import type { CoverKey } from '../../lib/photos'
import { COVER_PHOTOS, unsplash } from '../../lib/photos'

interface CoverImageProps {
  photo: CoverKey
  /** Design-token gradient painted underneath; the only thing shown if the photo fails. */
  gradient: string
  /** Requested pixel width — pass the rendered size so the CDN doesn't over-serve. */
  width?: number
  height?: number
  /** Darkens the photo so overlaid white text stays legible. */
  scrim?: boolean
  className?: string
}

// The gradient is the floor, not the fallback path — it is always painted, and
// the photo simply layers over it once decoded. A failed load hides the <img>
// and leaves the card exactly as it looked before photos were introduced.
export function CoverImage({
  photo,
  gradient,
  width = 600,
  height = 600,
  scrim = true,
  className = '',
}: CoverImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ background: gradient }}>
      {!failed && (
        <img
          src={unsplash(COVER_PHOTOS[photo], width, height)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
      {scrim && <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/10" />}
    </div>
  )
}
