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
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading')

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ background: gradient }}>
      {/* Sits over the gradient floor while the photo is still in flight —
          `loading="lazy"` means that can be a while for anything below the
          fold. Gone the moment the image loads or gives up, never both. */}
      {/* Not the shared `Skeleton` primitive: this always sits inside a
          card that already clips to its own radius via `overflow-hidden`,
          and Tailwind v4 orders utilities by its own layers rather than
          source order, so a `rounded-none` override here could lose to
          Skeleton's built-in `rounded-8` instead of winning. Plain and
          square avoids the fight entirely. */}
      {status === 'loading' && <div aria-hidden="true" className="u-shimmer absolute inset-0" />}
      {status !== 'failed' && (
        <img
          src={unsplash(COVER_PHOTOS[photo], width, height)}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('failed')}
          className={`size-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {scrim && <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/10" />}
    </div>
  )
}
