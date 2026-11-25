import { useState } from 'react'
import { Badge } from '../../components/ui'
import { COST_SOURCES, stageShort, type CostFunction, type CostSourceId, type Lever, type StageCell, type TrendPoint } from '../../data/reportSummaries'
import { LabelBadge } from './ReportParts'

/*
 * The charts of the summary-first reports (U126, J179): the buyer agents'
 * success trend, what moves success, the funnel stage strip and the cost
 * function. Series colours are the admin series tokens, fixed per series.
 */

const pct = (x: number) => `${Math.round(x * 100)}%`

const SERIES = [
  { key: 'tries', label: 'Would try', stroke: 'stroke-adm-s1', fill: 'fill-adm-s1', dot: 'bg-adm-s1' },
  { key: 'pays', label: 'Would pay', stroke: 'stroke-adm-s2', fill: 'fill-adm-s2', dot: 'bg-adm-s2' },
  { key: 'sure30', label: 'Still sure after a month', stroke: 'stroke-adm-s3', fill: 'fill-adm-s3', dot: 'bg-adm-s3' },
] as const

const TW = 880
const TH = 250
const L = 56
const R = 24
const T = 16
const B = 52

/** Try, pay and sure-at-day-30 across reports v1–v7, each point annotated by what changed. */
export function SuccessTrend({ points }: { points: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const x = (i: number) => L + (i * (TW - L - R)) / (points.length - 1)
  const y = (v: number) => T + (1 - v) * (TH - T - B)
  const path = (k: (typeof SERIES)[number]['key']) => {
    let d = ''
    let pen = false
    points.forEach((p, i) => {
      const v = p[k]
      if (v === null) {
        pen = false
        return
      }
      d += `${pen ? 'L' : 'M'} ${x(i)} ${y(v)} `
      pen = true
    })
    return d
  }
  const h = hover === null ? null : points[hover]
  return (
    <div className="flex min-w-0 flex-col gap-10">
      <div className="flex flex-wrap items-center gap-x-14 gap-y-4 text-12 text-adm-ink-2">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-6">
            <span className={`h-2 w-14 rounded-full ${s.dot}`} aria-hidden="true" />
            {s.label}
          </span>
        ))}
        <span className="text-adm-muted">Each point: the share of that test’s simulated people. A missing point was not asked.</span>
      </div>
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${TW} ${TH}`} className="block w-full min-w-[640px]" role="img" aria-label="Line chart: share of simulated people who would try, would pay and would still be sure after a month, test 1 to test 7">
          <text x={14} y={T + (TH - T - B) / 2} transform={`rotate(-90 14 ${T + (TH - T - B) / 2})`} textAnchor="middle" className="fill-adm-muted text-11">
            Share of simulated people
          </text>
          <text x={L + (TW - L - R) / 2} y={TH - 4} textAnchor="middle" className="fill-adm-muted text-11">
            Test, oldest to newest
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line x1={L} x2={TW - R} y1={y(v)} y2={y(v)} className="stroke-adm-grid" strokeWidth={1} />
              <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-11 tabular-nums">
                {pct(v)}
              </text>
            </g>
          ))}
          {points.map((p, i) => (
            <text key={p.id} x={x(i)} y={TH - B + 18} textAnchor="middle" className={`text-12 ${hover === i ? 'fill-adm-ink font-semibold' : 'fill-adm-ink-2'}`}>
              {p.label}
            </text>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={TH - B} className="stroke-adm-axis" strokeWidth={1} />}
          {SERIES.map((s) => (
            <path key={s.key} d={path(s.key)} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className={s.stroke} />
          ))}
          {SERIES.map((s) =>
            points.map((p, i) =>
              p[s.key] === null ? null : <circle key={`${s.key}-${p.id}`} cx={x(i)} cy={y(p[s.key]!)} r={4} strokeWidth={2} className={`${s.fill} stroke-adm-surface`} />,
            ),
          )}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.id}`}
              x={x(i) - (TW - L - R) / (points.length - 1) / 2}
              y={0}
              width={(TW - L - R) / (points.length - 1)}
              height={TH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        {h && (
          <div className="pointer-events-none absolute top-0 right-0 max-w-[260px] rounded-8 border border-adm-line bg-adm-surface p-10 text-12 shadow-sm">
            <p className="font-semibold text-adm-ink">
              {h.label} · {h.n} simulated people
            </p>
            <p className="text-adm-ink-2">{h.change}</p>
            {SERIES.map((s) => (
              <p key={s.key} className="tabular-nums text-adm-ink">
                {s.label}: {h[s.key] === null ? 'not asked' : pct(h[s.key]!)}
              </p>
            ))}
          </div>
        )}
      </div>
      <ol className="grid gap-x-12 gap-y-4 text-11 text-adm-ink-2 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <li key={p.id}>
            <span className="font-semibold text-adm-ink">{p.label}</span> · {p.change}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Horizontal bars: the share of a report's answers each change moved. */
export function WhatMoves({ levers }: { levers: Lever[] }) {
  const max = Math.max(...levers.map((l) => l.share), 0.01)
  return (
    <ul className="flex flex-col gap-8">
      {levers.map((l) => (
        <li key={l.theme} className="grid grid-cols-[110px_1fr] items-center gap-x-10 gap-y-2" title={`${l.change}: changed ${l.moved} of ${l.n} answers, test ${l.report.replace('v', '')}`}>
          <span className="text-12 font-semibold text-adm-ink">{l.theme}</span>
          <span className="flex items-center gap-8">
            <span className="h-14 rounded-r-4 bg-adm-s1" style={{ width: `${(l.share / max) * 70}%` }} aria-hidden="true" />
            <span className="text-12 tabular-nums text-adm-ink">
              {pct(l.share)} <span className="text-adm-muted">({l.moved} of {l.n} people, test {l.report.replace('v', '')})</span>
            </span>
          </span>
          <span className="col-start-2 text-11 text-adm-muted">{l.change}</span>
        </li>
      ))}
    </ul>
  )
}

/** The five funnel stages, coloured by status, with the one key number each. */
export function StageStrip({ cells }: { cells: StageCell[] }) {
  return (
    <ol className="grid gap-6 lg:grid-cols-5">
      {cells.map((c, i) => (
        <li key={c.id}>
          <a
            href={`#stage-${c.id}`}
            onClick={() => {
              const d = document.getElementById(`stage-${c.id}`)?.closest('details')
              if (d) d.open = true
            }}
            className={`flex h-full flex-col gap-4 rounded-8 border p-12 hover:bg-adm-hover ${c.isGap ? 'border-2 border-adm-critical' : 'border-adm-line'} ${c.status === 'on-track' ? 'bg-adm-good/8' : 'bg-adm-critical/6'}`}
          >
            <span className="flex items-center justify-between gap-6">
              <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">
                {i + 1}. {stageShort(c.id)}
              </span>
              {c.isGap ? <Badge tone="critical">Fix first</Badge> : <Badge tone={c.status === 'on-track' ? 'good' : 'serious'}>{c.status === 'on-track' ? 'Goal reached' : 'Below goal'}</Badge>}
            </span>
            <span className="text-24 font-semibold tabular-nums text-adm-ink">{pct(c.value)}</span>
            <span className="text-12 text-adm-ink-2">
              {c.metric} <span className="text-adm-muted">· goal {pct(c.target)}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
}

function TermRow({ t, on, onToggle }: { t: CostFunction['terms'][number]; on: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        className={`flex w-full items-start justify-between gap-8 rounded-8 border p-8 text-left ${on ? 'border-adm-ink bg-adm-bg' : 'border-adm-line hover:bg-adm-hover'}`}
      >
        <span className="min-w-0">
          <span className="block text-12 font-semibold text-adm-ink">{t.label}</span>
          <span className="block text-11 text-adm-muted">{t.from}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-13 font-semibold tabular-nums text-adm-ink">{t.value}</span>
          <LabelBadge label={COST_SOURCES.find((s) => s.id === t.source)!.label} />
        </span>
      </button>
    </li>
  )
}

/** Sources → the formula → the result, each term naming its source; clicking a term lights its source. */
export function CostFunctionPanel({ f }: { f: CostFunction }) {
  const [active, setActive] = useState<CostSourceId | null>(null)
  const inputs = f.terms.filter((t) => !t.result)
  const results = f.terms.filter((t) => t.result)
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr_1fr]">
      <div className="flex min-w-0 flex-col gap-8">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">1 · Where the numbers come from</h3>
        {COST_SOURCES.map((s) => (
          <div key={s.id} className={`rounded-8 border p-10 transition-colors ${active === s.id ? 'border-2 border-adm-ink bg-adm-bg' : active ? 'border-adm-line opacity-50' : 'border-adm-line'}`}>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <span className="text-12 font-semibold text-adm-ink">{s.title}</span>
              <LabelBadge label={s.label} />
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-11 text-adm-ink-2">
              {s.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-8">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">2 · How we add it up (click a line to see its source)</h3>
        <div className="rounded-8 bg-adm-bg p-10 text-12 leading-relaxed text-adm-ink">
          <p>Cost per session = (script + voice + music + picture − reuse) × learning discount</p>
          <p>Cost for one person = sessions until sleep is good × cost per session</p>
          <p>Cost per person helped = cost for one person ÷ chance it works</p>
          <p>Profit per person helped = (price − cost for one person − fees) ÷ chance it works</p>
        </div>
        <ul className="flex flex-col gap-6">
          {inputs.map((t) => (
            <TermRow key={t.id} t={t} on={active === t.source} onToggle={() => setActive(active === t.source ? null : t.source)} />
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-8">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">3 · The result, today (learning stage 1)</h3>
        <ul className="flex flex-col gap-6">
          {results.map((t) => (
            <TermRow key={t.id} t={t} on={active === t.source} onToggle={() => setActive(active === t.source ? null : t.source)} />
          ))}
        </ul>
        <p className="text-11 text-adm-muted">Middle choice of AI suppliers, 10-minute sessions, sleep score from 25 to 85 of 100, 3 sessions a week.</p>
      </div>
    </div>
  )
}
