import { useId } from 'react'

/**
 * A progress ring whose arc is the value — Figma draws these as ellipse arcs
 * (the card's 23px ring, the analysis hero's 120px one). Drawn from the
 * number rather than copied from the frame, which had the 24% card's arc at
 * ~31% (U039).
 */
export function ProgressRing({
  value,
  size,
  stroke,
  track,
  arc = 'gradient',
  inner,
  children,
}: {
  /** 0–100 */
  value: number
  size: number
  stroke: number
  track: string
  /** 'gradient' = the brand orange→yellow; anything else is a solid colour. */
  arc?: 'gradient' | string
  /** Fill inside the ring (the hero's 12% black disc). */
  inner?: string
  children?: React.ReactNode
}) {
  const id = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const share = Math.max(0, Math.min(100, value)) / 100

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        {arc === 'gradient' && (
          <defs>
            <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FF993B" />
              <stop offset="1" stopColor="#FFE270" />
            </linearGradient>
          </defs>
        )}
        {inner && <circle cx={size / 2} cy={size / 2} r={r - stroke / 2} fill={inner} />}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={arc === 'gradient' ? `url(#${id})` : arc}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * share} ${c}`}
        />
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </span>
  )
}

/** "3% ↑" on green, "2% ↓" on red — Figma's delta pill (r40, 10/6, 12 SemiBold white). */
export function DeltaPill({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className="inline-flex h-22 shrink-0 items-center gap-2 rounded-full px-10 text-[12px] font-semibold leading-[18px] text-white"
      style={{ background: up ? '#70C973' : '#F02B2B' }}
      aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(value)}% since yesterday`}
    >
      {Math.abs(value)}%
      <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden="true" className={up ? '' : 'rotate-180'}>
        <path d="M4 9.5V1M4 1L1 4M4 1l3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
