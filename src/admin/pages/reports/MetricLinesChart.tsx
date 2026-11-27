import { useMemo } from 'react'
import { Badge, Panel } from '../../components/ui'
import { FLIP_WINDOW_WEEKS, metricLines, topDrivers } from '../../data/metricLines'
import { SourceChip } from './ReportParts'

/*
 * A31 (U146, J206): the spec's three metric lines on one chart, over the three
 * Causal AI stages, and the drivers that move cost per flip most. All values
 * come from data/metricLines.ts; nothing is typed in.
 */

const W = 640
const H = 260
const L = 76
const R = 150
const T = 16
const B = 40
const pct = (v: number) => `${Math.round(v * 100)}%`
const usd = (v: number) => `$${v.toFixed(2)}`

type Key = 'costIndex' | 'density' | 'velocity' | 'flipped'
const SERIES: { key: Key; label: string; line: string; dot: string; dash?: string }[] = [
  { key: 'costIndex', label: 'Cost per flip (vs stage 1)', line: 'stroke-adm-s1', dot: 'fill-adm-s1' },
  { key: 'density', label: 'Causal AI density', line: 'stroke-adm-s2', dot: 'fill-adm-s2' },
  { key: 'velocity', label: 'Causal AI velocity', line: 'stroke-adm-s3', dot: 'fill-adm-s3', dash: '6 4' },
  { key: 'flipped', label: 'Sleep cohort flipped', line: 'stroke-adm-good', dot: 'fill-adm-good' },
]

export function MetricLinesPanel() {
  const points = useMemo(() => metricLines(), [])
  const drivers = useMemo(() => topDrivers(), [])
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1)
  const y = (v: number) => T + (1 - v) * (H - T - B)
  // Direct labels at the right end, nudged apart so they do not overlap.
  const ends = SERIES.map((s) => ({ s, y: y(points[points.length - 1][s.key]) })).sort((a, b) => a.y - b.y)
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14

  return (
    <Panel
      title="Three metric lines over time"
      description="Compute cost, Causal AI and therapeutic, as the spec asks, across its three Causal AI stages (there is no calendar data yet). Assumed: the stage figures are the business owner’s spec, the people are simulated."
    >
      <div className="flex flex-wrap items-center gap-6 text-12 text-adm-ink-2">
        <Badge tone="serious">Assumed</Badge>
        <span>Read from</span>
        <SourceChip id="cost-model" />
        <SourceChip id="spec-causal" />
        <SourceChip id="sleep-cohort" />
      </div>
      <div className="min-w-0 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[560px] max-w-[760px]" role="img" aria-label="Line chart: cost per flip as a share of stage 1, Causal AI density, Causal AI velocity and the share of the sleep cohort that flips, at Causal AI stages 1, 2 and 3">
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-adm-grid" strokeWidth={1} />
              <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-11 tabular-nums">
                {pct(v)}
              </text>
            </g>
          ))}
          {points.map((p, i) => (
            <text key={p.stage} x={x(i)} y={H - B + 18} textAnchor="middle" className="fill-adm-ink-2 text-11">
              <tspan>Stage {p.stage}</tspan>
              <tspan x={x(i)} dy={13} className="fill-adm-muted">
                {p.sessions}
              </tspan>
            </text>
          ))}
          {SERIES.map((s) => (
            <g key={s.key}>
              <polyline points={points.map((p, i) => `${x(i)},${y(p[s.key])}`).join(' ')} fill="none" strokeWidth={2} strokeDasharray={s.dash} className={s.line} />
              {points.map((p, i) => (
                <circle key={p.stage} cx={x(i)} cy={y(p[s.key])} r={3.5} className={s.dot}>
                  <title>{`${s.label}, stage ${p.stage}: ${pct(p[s.key])}${s.key === 'costIndex' ? ` (${usd(p.costPerFlip)})` : ''}`}</title>
                </circle>
              ))}
            </g>
          ))}
          {ends.map(({ s, y: ly }) => (
            <text key={s.key} x={W - R + 8} y={ly + 4} className="fill-adm-ink text-11">
              {s.label}
            </text>
          ))}
        </svg>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-12">
          <thead className="text-adm-muted">
            <tr>
              <th className="py-4 pr-12 font-medium">Stage</th>
              <th className="py-4 pr-12 font-medium">Cost per flip</th>
              <th className="py-4 pr-12 font-medium">Density</th>
              <th className="py-4 pr-12 font-medium">Velocity</th>
              <th className="py-4 font-medium">Sleep cohort flipped in {FLIP_WINDOW_WEEKS} weeks</th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-adm-ink">
            {points.map((p) => (
              <tr key={p.stage} className="border-t border-adm-line">
                <td className="py-4 pr-12">
                  Stage {p.stage} <span className="text-adm-muted">· {p.sessions}</span>
                </td>
                <td className="py-4 pr-12">{usd(p.costPerFlip)}</td>
                <td className="py-4 pr-12">{pct(p.density)}</td>
                <td className="py-4 pr-12">{pct(p.velocity)}</td>
                <td className="py-4">{pct(p.flipped)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-12 text-adm-muted">
        Cost per flip is the mean over the sleep cohort, Balanced models at 10 minutes, 3 chapters a week. A person counts as flipped when the journey fits {FLIP_WINDOW_WEEKS} weeks, weighted by the stage’s chance it works.
      </p>
      <div className="flex flex-col gap-6 border-t border-adm-line pt-12">
        <h3 className="text-13 font-semibold text-adm-ink">Top Causal AI drivers of cost per flip</h3>
        <ol className="flex flex-col gap-6">
          {drivers.map((d, i) => (
            <li key={d.id} data-driver={d.id} className="flex flex-col gap-2 text-13 lg:flex-row lg:items-baseline lg:justify-between lg:gap-12">
              <span className="text-adm-ink">
                <span className="mr-6 font-semibold tabular-nums">{i + 1}.</span>
                {d.label}: {d.from} → {d.to}
              </span>
              <span className="tabular-nums text-adm-ink-2">
                {usd(d.costFrom)} → {usd(d.costTo)}{' '}
                <span className={d.change < 0 ? 'text-adm-good' : 'text-adm-critical'}>
                  ({d.change < 0 ? '−' : '+'}
                  {Math.abs(Math.round(d.change * 100))}%)
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-12 text-adm-muted">Each driver is changed alone from the default journey (score 25 to 85, stage 1, Balanced, 10 minutes, 3 a week). Worked out, not measured.</p>
      </div>
    </Panel>
  )
}
