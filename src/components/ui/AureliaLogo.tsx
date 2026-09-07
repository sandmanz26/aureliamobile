import { useId } from 'react'

interface AureliaLogoProps {
  /** Height of the mark in px; the wordmark scales from it. */
  iconSize?: number
  /** Mark only, no wordmark — for tight spots like the admin sidebar. */
  markOnly?: boolean
  className?: string
}

/**
 * The Aurelia brand mark: a gold-to-orange spiral that opens at the lower left.
 *
 * Redrawn from the supplied logo artwork. If the original vector exists (Figma,
 * or a designer's .svg), drop it in and replace the <path> below — this is the
 * only file that draws the mark, so the swap is one edit and every placement
 * updates with it.
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
          <linearGradient id={gradientId} x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD86B" />
            <stop offset="0.55" stopColor="#FCA22B" />
            <stop offset="1" stopColor="#F2801A" />
          </linearGradient>
        </defs>

        {/* One continuous stroke spiralling inward — the open end sits lower-left. */}
        <path
          d="M18 46 A 24 24 0 1 1 46 50 A 13 13 0 1 1 32 20"
          stroke={`url(#${gradientId})`}
          strokeWidth="9.5"
          strokeLinecap="round"
          fill="none"
        />
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
