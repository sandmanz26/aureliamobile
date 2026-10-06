import { useId } from 'react'
import aureliaMark from '../../assets/aurelia-mark.png'

interface AureliaLogoProps {
  /** Height of the mark in px; the wordmark scales from it. */
  iconSize?: number
  /** Mark only, no wordmark — for tight spots like the admin sidebar. */
  markOnly?: boolean
  /** Plain white, for the mark over a photo instead of the light background it
   *  otherwise assumes — the tile turns solid white and its cutouts turn
   *  transparent instead of white-on-orange, so a dark backdrop shows through
   *  them the same way it does in the Figma reference (16698:15285). */
  inverse?: boolean
  className?: string
}

/**
 * The Aurelia brand mark: a gold-to-orange tile with a sweep and a dot.
 *
 * The real exported artwork, not a traced approximation — this is the only
 * file that draws the mark, so every placement (hero, sidebar, account
 * screens) updates together from the one asset.
 */
export function AureliaLogo({ iconSize = 40, markOnly = false, inverse = false, className = '' }: AureliaLogoProps) {
  // Unique per instance: a shared id makes every mark on the page point at the
  // first <defs> in the document, and if that one sits in a hidden subtree
  // (the desktop sidebar on a phone viewport) the rest paint with no stroke.
  // Colons stripped: React's ids contain them, and they are awkward inside a
  // url(#…) fragment reference.
  const uid = useId().replace(/:/g, '')
  const maskId = `aurelia-mark-mask${uid}`

  return (
    <span className={`inline-flex items-center gap-10 ${className}`}>
      {inverse ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 64 64"
          fill="none"
          role="img"
          aria-label="Aurelia"
          className="shrink-0"
        >
          {/* No white/inverse export of the real mark exists yet — this stays
              the hand-traced cutout version for the photo-overlay contexts
              that need a plain white tile instead of the gold-to-orange one. */}
          <mask id={maskId}>
            <rect x="2" y="2" width="60" height="60" rx="17" fill="#FFFFFF" />
            <path d="M56 9C42 15 27 26 10 47c15-13 30-21 48-27z" fill="#000000" />
            <circle cx="33" cy="41" r="8.5" fill="#000000" />
          </mask>
          <rect x="2" y="2" width="60" height="60" rx="17" fill="#FFFFFF" mask={`url(#${maskId})`} />
        </svg>
      ) : (
        <img
          src={aureliaMark}
          alt="Aurelia"
          width={iconSize}
          height={iconSize}
          className="shrink-0"
          style={{ width: iconSize, height: iconSize }}
        />
      )}

      {!markOnly && (
        <span
          style={
            inverse
              ? { fontSize: iconSize * 0.62, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: '#FFFFFF' }
              : {
                  fontSize: iconSize * 0.62,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  background: 'linear-gradient(95deg, #FCA22B, #F2801A)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }
          }
        >
          aurelia
        </span>
      )}
    </span>
  )
}
