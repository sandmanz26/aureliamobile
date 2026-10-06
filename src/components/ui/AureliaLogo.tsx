import aureliaMark from '../../assets/aurelia-mark.png'
import aureliaMarkInverse from '../../assets/aurelia-mark-inverse.png'

interface AureliaLogoProps {
  /** Height of the mark in px; the wordmark scales from it. */
  iconSize?: number
  /** Mark only, no wordmark — for tight spots like the admin sidebar. Has no
   *  effect combined with `inverse`: that lockup is one flat image with the
   *  wordmark baked in (see below), and no `inverse` + `markOnly` placement
   *  exists yet to need a mark-only crop of it. */
  markOnly?: boolean
  /** White mark + wordmark as one lockup, for the mark over a photo instead
   *  of the light background it otherwise assumes — the Figma reference
   *  (16698:15285) draws it this way rather than as the gold-to-orange tile
   *  with a separately-coloured word next to it. */
  inverse?: boolean
  className?: string
}

/**
 * The Aurelia brand mark: a gold-to-orange tile with a sweep and a dot.
 *
 * The real exported artwork, not a traced approximation — this is the only
 * file that draws the mark, so every placement (hero, sidebar, account
 * screens) updates together from the one asset. `inverse` is a second,
 * separate export (the mark and the wordmark together, already white) for
 * the photo-overlay contexts — not a recolour of the first image, since a
 * CSS filter on a multi-colour gradient tile doesn't land on a clean flat
 * white.
 */
export function AureliaLogo({ iconSize = 40, markOnly = false, inverse = false, className = '' }: AureliaLogoProps) {
  if (inverse) {
    return (
      <img
        src={aureliaMarkInverse}
        alt="Aurelia"
        height={iconSize}
        className={`shrink-0 ${className}`}
        style={{ height: iconSize, width: 'auto' }}
      />
    )
  }

  return (
    <span className={`inline-flex items-center gap-10 ${className}`}>
      <img
        src={aureliaMark}
        alt="Aurelia"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />

      {!markOnly && (
        <span
          style={{
            fontSize: iconSize * 0.62,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            background: 'linear-gradient(95deg, #FCA22B, #F2801A)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          aurelia
        </span>
      )}
    </span>
  )
}
