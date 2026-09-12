import { useId } from 'react'

interface AureliaLogoProps {
  /** Height of the mark in px; the wordmark scales from it. */
  iconSize?: number
  /** Mark only, no wordmark — for tight spots like the admin sidebar. */
  markOnly?: boolean
  className?: string
}

/**
 * The Aurelia brand mark: a gold-to-orange tile with a sweep and a dot.
 *
 * Traced from the supplied logo artwork, so the curve is an approximation of
 * it rather than the artwork itself. If the original vector exists (Figma, or a
 * designer's .svg), drop it in and replace the shapes below — this is the only
 * file that draws the mark, so the swap is one edit and every placement, hero
 * and sidebar and account screens alike, updates with it.
 */
export function AureliaLogo({ iconSize = 40, markOnly = false, className = '' }: AureliaLogoProps) {
  // Unique per instance: a shared id makes every mark on the page point at the
  // first <defs> in the document, and if that one sits in a hidden subtree
  // (the desktop sidebar on a phone viewport) the rest paint with no stroke.
  // Colons stripped: React's ids contain them, and they are awkward inside a
  // url(#…) fragment reference.
  const gradientId = `aurelia-mark${useId().replace(/:/g, '')}`

  return (
    <span className={`inline-flex items-center gap-10 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="Aurelia"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFCB63" />
            <stop offset="0.5" stopColor="#F9A331" />
            <stop offset="1" stopColor="#EF7C14" />
          </linearGradient>
        </defs>

        {/* A rounded tile carrying two cut-outs: a tapered sweep from the upper
            right down to the lower left, and the dot it sweeps around. */}
        <rect x="2" y="2" width="60" height="60" rx="17" fill={`url(#${gradientId})`} />
        <path
          d="M56 9C42 15 27 26 10 47c15-13 30-21 48-27z"
          fill="#FFFFFF"
        />
        <circle cx="33" cy="41" r="8.5" fill="#FFFFFF" />
      </svg>

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
