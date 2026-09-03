interface AureliaLogoProps {
  iconSize?: number
  className?: string
}

// Placeholder approximation of the Figma brand mark (gradient squircle + circular
// cutout) — swap for the exported SVG asset when available.
export function AureliaLogo({ iconSize = 40, className = '' }: AureliaLogoProps) {
  return (
    <div className={`inline-flex items-center gap-12 ${className}`}>
      <div
        className="relative overflow-hidden rounded-8"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-300))',
        }}
      >
        <span
          className="absolute rounded-full bg-surface-default"
          style={{ width: iconSize * 0.32, height: iconSize * 0.32, left: iconSize * 0.14, bottom: iconSize * 0.14 }}
        />
      </div>
      <span
        className="font-semibold"
        style={{
          fontSize: iconSize * 0.6,
          letterSpacing: -0.5,
          background: 'linear-gradient(90deg, var(--color-gold-700), var(--color-gold-400))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        aurelia
      </span>
    </div>
  )
}
