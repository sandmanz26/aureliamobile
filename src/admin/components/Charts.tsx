import { useState } from 'react'

/* Charts are inline SVG on one shared scale, drawn against the admin theme
   tokens so both light and dark resolve from the same definitions. Every chart
   ships a hover layer; series identity is carried by a legend plus the tooltip
   label, never by color alone. */

const PAD = { top: 12, right: 12, bottom: 26, left: 44 }

/* Charts are driven by dynamic key names, so rows are read through these two
   guarded accessors. Callers pass their own interfaces — requiring an index
   signature would force every data type in the admin to become a type alias. */
type ChartRow = object

function num(row: ChartRow, key: string): number {
  const value = (row as Record<string, unknown>)[key]
  return typeof value === 'number' ? value : 0
}

function str(row: ChartRow, key: string): string {
  const value = (row as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : String(value ?? '')
}

function niceMax(value: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  return Math.ceil(value / magnitude) * magnitude
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export interface Series {
  key: string
  label: string
  color: string
}

interface LineChartProps {
  data: ChartRow[]
  xKey: string
  series: Series[]
  height?: number
  /** Formats the y-axis ticks and tooltip values. */
  format?: (value: number) => string
  yLabel?: string
}

export function LineChart({ data, xKey, series, height = 220, format = (v) => String(v), yLabel }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const width = 760
  const innerW = width - PAD.left - PAD.right
  const innerH = height - PAD.top - PAD.bottom

  const max = niceMax(Math.max(...data.flatMap((row) => series.map((s) => num(row, s.key)))) * 1.1)
  const x = (i: number) => PAD.left + (i / Math.max(1, data.length - 1)) * innerW
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t)

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[520px]"
        role="img"
        aria-label={`${series.map((s) => s.label).join(', ')} over time`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-adm-grid)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="10" fill="var(--color-adm-muted)">
              {format(tick)}
            </text>
          </g>
        ))}

        {data.map((row, i) =>
          i % Math.ceil(data.length / 7) === 0 ? (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--color-adm-muted)">
              {shortDate(str(row, xKey))}
            </text>
          ) : null,
        )}

        {series.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={data.map((row, i) => `${x(i)},${y(num(row, s.key))}`).join(' ')}
          />
        ))}

        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--color-adm-axis)" strokeWidth="1" />
            {series.map((s) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(num(data[hover], s.key))}
                r="4"
                fill={s.color}
                stroke="var(--color-adm-surface)"
                strokeWidth="2"
              />
            ))}
          </>
        )}

        {/* Hit targets are wider than the marks. */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={x(i) - innerW / data.length / 2}
            y={PAD.top}
            width={innerW / data.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {yLabel && (
          <text x={PAD.left - 8} y={PAD.top - 2} textAnchor="end" fontSize="10" fill="var(--color-adm-muted)">
            {yLabel}
          </text>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-8 rounded-8 border border-adm-line bg-adm-surface px-10 py-8 text-12 shadow-lg"
          style={{ left: `${(x(hover) / width) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <p className="mb-4 font-medium text-adm-ink">{shortDate(str(data[hover], xKey))}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center gap-6 whitespace-nowrap text-adm-ink-2">
              <span className="size-8 shrink-0 rounded-2" style={{ background: s.color }} />
              {s.label}
              <span className="ml-auto pl-8 font-medium tabular-nums text-adm-ink">
                {format(num(data[hover], s.key))}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
  format?: (value: number) => string
  /** Horizontal bars read better for long category labels. */
  height?: number
}

export function BarChart({ data, color = 'var(--color-adm-s1)', format = (v) => String(v), height = 200 }: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(...data.map((d) => d.value)) * 1.05)

  return (
    <div className="flex flex-col gap-8" style={{ minHeight: height }}>
      {data.map((row, i) => (
        <div
          key={row.label}
          className="flex items-center gap-10"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <span className="w-[132px] shrink-0 truncate text-12 text-adm-ink-2">{row.label}</span>
          <div className="relative h-16 flex-1 rounded-4 bg-adm-hover">
            <div
              className="h-full rounded-4 transition-[width]"
              style={{ width: `${(row.value / max) * 100}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.55 }}
            />
          </div>
          <span className="w-[68px] shrink-0 text-right text-12 font-medium tabular-nums text-adm-ink">
            {format(row.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Stacked cost bars — 2px surface gap between segments, per the mark spec. */
export function StackedBars({
  data,
  xKey,
  series,
  height = 200,
  format = (v) => String(v),
}: {
  data: ChartRow[]
  xKey: string
  series: Series[]
  height?: number
  format?: (value: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const totals = data.map((row) => series.reduce((sum, s) => sum + num(row, s.key), 0))
  const max = niceMax(Math.max(...totals) * 1.08)

  return (
    <div className="relative w-full">
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((row, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col justify-end gap-[2px]"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {[...series].reverse().map((s) => {
              const value = num(row, s.key)
              return (
                <div
                  key={s.key}
                  style={{
                    height: `${(value / max) * 100}%`,
                    background: s.color,
                    opacity: hover === null || hover === i ? 1 : 0.5,
                  }}
                  className="first:rounded-t-4"
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between text-10 text-adm-muted">
        <span>{shortDate(str(data[0], xKey))}</span>
        <span>{shortDate(str(data[data.length - 1], xKey))}</span>
      </div>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-4 z-10 rounded-8 border border-adm-line bg-adm-surface px-10 py-8 text-12 shadow-lg"
          style={{ left: `${((hover + 0.5) / data.length) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <p className="mb-4 font-medium text-adm-ink">{shortDate(str(data[hover], xKey))}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center gap-6 whitespace-nowrap text-adm-ink-2">
              <span className="size-8 shrink-0 rounded-2" style={{ background: s.color }} />
              {s.label}
              <span className="ml-auto pl-8 font-medium tabular-nums text-adm-ink">
                {format(num(data[hover], s.key))}
              </span>
            </p>
          ))}
          <p className="mt-4 border-t border-adm-line pt-4 text-right font-medium tabular-nums text-adm-ink">
            {format(totals[hover])}
          </p>
        </div>
      )}
    </div>
  )
}
