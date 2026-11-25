import { useState, type ReactNode } from 'react'
import type { Verdict } from '../../data/buyerRuns'
import { APP_PLUS } from '../../data/buyerPlay'
import { SEGMENT_LABEL, funnel, heat, objections, priceLadder, type Slope, type VizRow, type VizTest, type VizTestId } from '../../data/buyerViz'
import { useDetail } from './DetailDrawer'

/*
 * The buyer agent report, drawn (U130, J183): funnels per test, a people
 * grid, who says yes, the price ladder, why people say no and what moves
 * them. Every number comes from data/buyerViz.ts. Colour never works alone:
 * each verdict also has its own shape, every bar and cell carries its number.
 */

const pct = (k: number, n: number) => (n ? `${Math.round((k / n) * 100)}%` : '–')
const money = (x: number) => `$${x % 1 ? x.toFixed(2) : x}`

/** A row of buttons for picking a test or a measure; one row, above the chart. */
export function Toggle<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-4 rounded-8 bg-adm-bg p-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-4 px-10 py-4 text-12 font-medium ${value === o.id ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="text-11 text-adm-muted">{children}</p>
}

/* ---------------------------------------------------------------- Funnels */

/** “Saw it → would try → would pay → still using at day 30”, one column per test. */
export function TestFunnels({ tests }: { tests: VizTest[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-12 lg:grid-cols-3">
        {tests.map((t) => (
          <figure key={t.id} className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12">
            <figcaption className="flex flex-col">
              <span className="text-13 font-semibold text-adm-ink">
                {t.label} · {t.rows.length} simulated people
              </span>
              <span className="text-11 text-adm-muted">{t.offer}</span>
            </figcaption>
            <ol className="flex flex-col gap-6">
              {funnel(t).map((s) => (
                <li key={s.key} className="grid grid-cols-[112px_1fr] items-center gap-8">
                  <span className="text-12 text-adm-ink-2">{s.label}</span>
                  {s.count === null ? (
                    <span className="text-11 italic text-adm-muted">not asked for this offer</span>
                  ) : (
                    <span className="flex min-w-0 items-center gap-6">
                      <span className="h-14 min-w-2 rounded-r-4 bg-adm-s1" style={{ width: `${(s.count / s.n) * 62}%`, opacity: s.key === 'saw' ? 0.35 : 1 }} aria-hidden="true" />
                      <span className="shrink-0 text-12 tabular-nums text-adm-ink">
                        {s.count} <span className="text-adm-muted">· {pct(s.count, s.n)}</span>
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </figure>
        ))}
      </div>
      <Caption>Each bar is the share of that test’s simulated people. The offer and the people differ between tests, so compare the shape, not only the numbers.</Caption>
    </div>
  )
}

/* ------------------------------------------------------------ People grid */

const VERDICT_TEXT: Record<Verdict, string> = { yes: 'Yes', maybe: 'Maybe', no: 'No' }
const RANK: Record<Verdict, number> = { yes: 0, maybe: 1, no: 2 }

/** Yes: a filled dot. Maybe: a ring with a dot. No: a small hollow ring. Shape and colour both say it. */
function VerdictMark({ v, size = 16 }: { v: Verdict; size?: number }) {
  const c = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="block">
      {v === 'yes' && <circle cx={c} cy={c} r={c - 1} className="fill-adm-s3" />}
      {v === 'maybe' && (
        <>
          <circle cx={c} cy={c} r={c - 2} fill="none" strokeWidth={2.5} className="stroke-adm-s4" />
          <circle cx={c} cy={c} r={c / 3} className="fill-adm-s4" />
        </>
      )}
      {v === 'no' && <circle cx={c} cy={c} r={c / 2} fill="none" strokeWidth={1.5} className="stroke-adm-muted" />}
    </svg>
  )
}

export function VerdictLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-14 gap-y-4 text-12 text-adm-ink-2">
      {(['yes', 'maybe', 'no'] as const).map((v) => (
        <span key={v} className="inline-flex items-center gap-6">
          <VerdictMark v={v} size={14} />
          {VERDICT_TEXT[v]}
        </span>
      ))}
    </div>
  )
}

function useOpenPerson() {
  const open = useDetail()
  return (r: VizRow, t: VizTest) => {
    const p = r.persona
    const a = r.answer
    open({
      kicker: `Simulated person · ${t.label}`,
      title: `${p.name}, ${p.age}`,
      summary: `{{simulated|A simulated person}}: ${p.occupation} in ${p.city}, ${p.country}. In their words: “${a.quote}”`,
      numbers: [
        { label: 'Would try', value: VERDICT_TEXT[r.tries] },
        { label: 'Would pay', value: VERDICT_TEXT[r.pays] },
        { label: 'Still using at day 30', value: r.day30 ? VERDICT_TEXT[r.day30] : 'Not asked' },
        { label: 'Fair price, a month', value: `${money(a.prices.bargain)}–${money(a.prices.expensive)}` },
      ],
      labels: ['prediction'],
      extra: (
        <dl className="flex flex-col gap-8 text-12">
          {[
            ['Who they are', `${p.ageBand} · ${p.region} · ${p.workPattern} · ${p.household}`],
            ['Main reason against', a.objection],
            ['What would change their mind', a.flip],
            ['Why, as the AI played them', a.reasoning],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-2">
              <dt className="text-11 font-semibold uppercase tracking-wider text-adm-muted">{k}</dt>
              <dd className="text-adm-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ),
      to: `/admin/buyer-agent?v=${t.id.slice(1)}`,
      toLabel: 'Every answer in this test',
    })
  }
}

/** One dot per simulated person, sorted yes → maybe → no; a tap opens who they are and what they said. */
export function PeopleGrid({ tests }: { tests: VizTest[] }) {
  const [id, setId] = useState<VizTestId>(tests[tests.length - 1].id)
  const [measure, setMeasure] = useState<'tries' | 'pays'>('tries')
  const openPerson = useOpenPerson()
  const t = tests.find((x) => x.id === id) ?? tests[0]
  const rows = [...t.rows].sort((a, b) => RANK[a[measure]] - RANK[b[measure]])
  const count = (v: Verdict) => t.rows.filter((r) => r[measure] === v).length
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-8">
        <Toggle label="Test" value={id} onChange={setId} options={tests.map((x) => ({ id: x.id, label: x.label }))} />
        <Toggle label="Question" value={measure} onChange={setMeasure} options={[{ id: 'tries', label: 'Would try' }, { id: 'pays', label: 'Would pay' }]} />
      </div>
      <p className="text-13 text-adm-ink">
        <span className="font-semibold">
          {count('yes')} of {t.rows.length}
        </span>{' '}
        say yes, {count('maybe')} maybe, {count('no')} no ({measure === 'tries' ? 'would try' : 'would pay'}).
      </p>
      <VerdictLegend />
      <ul className="flex flex-wrap gap-4" aria-label={`${t.label}: one mark per simulated person`}>
        {rows.map((r) => (
          <li key={r.personaId}>
            <button
              type="button"
              onClick={() => openPerson(r, t)}
              title={`${r.persona.name}, ${r.persona.age}, ${r.persona.country}: ${VERDICT_TEXT[r[measure]]}`}
              aria-label={`${r.persona.name}, ${r.persona.age}, ${r.persona.country}: ${measure === 'tries' ? 'would try' : 'would pay'} ${VERDICT_TEXT[r[measure]]}. Open details`}
              data-person-dot
              className="flex size-24 items-center justify-center rounded-4 hover:bg-adm-hover focus-visible:outline-2 focus-visible:outline-adm-ink"
            >
              <VerdictMark v={r[measure]} />
            </button>
          </li>
        ))}
      </ul>
      <Caption>Each mark is one simulated person in {t.label} ({t.offer.toLowerCase()}). Tap one for their profile, their answer and their reasons.</Caption>
    </div>
  )
}

/* ---------------------------------------------------------------- Heat map */

function cellStyle(share: number) {
  const p = Math.round(share * 100)
  return { background: `color-mix(in oklab, var(--color-adm-s1) ${Math.round(8 + share * 80)}%, var(--color-adm-surface))`, color: p >= 50 ? '#ffffff' : 'var(--color-adm-ink)' }
}

/** Share who would try and who would pay (yes), by segment, darker = more. */
export function WhoSaysYes({ tests }: { tests: VizTest[] }) {
  const [id, setId] = useState<VizTestId>(tests[tests.length - 1].id)
  const t = tests.find((x) => x.id === id) ?? tests[0]
  const cells = heat(t)
  const segs = [...new Set(cells.map((c) => c.segment))]
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <Toggle label="Test" value={id} onChange={setId} options={tests.map((x) => ({ id: x.id, label: x.label }))} />
        <span className="inline-flex items-center gap-6 text-11 text-adm-muted">
          0%
          <span className="h-8 w-80 rounded-full" style={{ background: 'linear-gradient(to right, color-mix(in oklab, var(--color-adm-s1) 8%, var(--color-adm-surface)), var(--color-adm-s1))' }} aria-hidden="true" />
          100%
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] border-separate border-spacing-2 text-left text-12">
          <thead>
            <tr className="text-11 text-adm-muted">
              <th className="py-4 pr-8 font-semibold">Group</th>
              <th className="py-4 text-center font-semibold">Would try</th>
              <th className="py-4 text-center font-semibold">Would pay</th>
              <th className="py-4 pl-6 text-right font-semibold">People</th>
            </tr>
          </thead>
          {segs.map((s) => (
            <tbody key={s}>
              <tr>
                <th colSpan={4} scope="colgroup" className="pt-10 pb-2 text-11 font-semibold uppercase tracking-wider text-adm-muted">
                  {SEGMENT_LABEL[s]}
                </th>
              </tr>
              {cells
                .filter((c) => c.segment === s)
                .map((c) => (
                  <tr key={c.value}>
                    <th scope="row" className="py-4 pr-8 font-normal text-adm-ink">
                      {c.value}
                    </th>
                    {([c.tries, c.pays] as const).map((k, i) => (
                      <td key={i} className="w-[30%] rounded-4 px-8 py-6 text-center font-semibold tabular-nums" style={cellStyle(k / c.n)} title={`${c.value}: ${k} of ${c.n}`}>
                        {pct(k, c.n)}
                      </td>
                    ))}
                    <td className="py-4 pl-6 text-right tabular-nums text-adm-muted">{c.n}</td>
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
      <Caption>Each cell: the share of that group who said yes. Groups under 10 people are too small to read much into.</Caption>
    </div>
  )
}

/* ------------------------------------------------------------ Price ladder */

const PW = 640
const PL = 72
const PR = 24
const ROW = 46

/** The middle answer to the four price questions per test, against Aurelia’s price. */
export function PriceLadderChart({ tests }: { tests: VizTest[] }) {
  const ladders = tests.map((t) => ({ t, p: priceLadder(t) }))
  const max = Math.ceil(Math.max(APP_PLUS.monthly, ...ladders.map((l) => l.p.tooExpensive)) / 2) * 2 + 2
  const x = (v: number) => PL + (v / max) * (PW - PL - PR)
  const H = 34 + ladders.length * ROW + 28
  const ticks = Array.from({ length: max / 2 + 1 }, (_, i) => i * 2)
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-x-14 gap-y-4 text-12 text-adm-ink-2">
        <span className="inline-flex items-center gap-6">
          <span className="h-10 w-16 rounded-2 bg-adm-s3" aria-hidden="true" /> Fair: a bargain to getting expensive
        </span>
        <span className="inline-flex items-center gap-6">
          <span className="h-10 w-16 rounded-2 bg-adm-axis" aria-hidden="true" /> Too cheap to trust, or too expensive
        </span>
        <span className="inline-flex items-center gap-6">
          <span className="h-12 w-0 border-l-2 border-dashed border-adm-critical" aria-hidden="true" /> Aurelia today, {money(APP_PLUS.monthly)} a month
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${PW} ${H}`} className="block w-full min-w-[520px]" role="img" aria-label={`Price ladder per test: ${ladders.map(({ t, p }) => `${t.label} fair ${money(p.bargain)} to ${money(p.expensive)}`).join('; ')}; Aurelia costs ${money(APP_PLUS.monthly)}.`}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={22} y2={H - 24} className="stroke-adm-grid" strokeWidth={1} />
              <text x={x(v)} y={H - 8} textAnchor="middle" className="fill-adm-muted text-11 tabular-nums">
                {money(v)}
              </text>
            </g>
          ))}
          <line x1={x(APP_PLUS.monthly)} x2={x(APP_PLUS.monthly)} y1={14} y2={H - 24} strokeDasharray="4 3" strokeWidth={2} className="stroke-adm-critical" />
          <text x={x(APP_PLUS.monthly)} y={11} textAnchor="middle" className="fill-adm-ink text-11 font-semibold">
            Aurelia {money(APP_PLUS.monthly)}
          </text>
          {ladders.map(({ t, p }, i) => {
            const cy = 34 + i * ROW + 10
            return (
              <g key={t.id}>
                <text x={0} y={cy + 4} className="fill-adm-ink text-12 font-semibold">
                  {t.label}
                </text>
                <rect x={x(p.tooCheap)} y={cy - 6} width={x(p.bargain) - x(p.tooCheap) - 1} height={12} rx={2} className="fill-adm-axis" />
                <rect x={x(p.bargain) + 1} y={cy - 6} width={x(p.expensive) - x(p.bargain) - 2} height={12} rx={2} className="fill-adm-s3" />
                <rect x={x(p.expensive) + 1} y={cy - 6} width={x(p.tooExpensive) - x(p.expensive) - 1} height={12} rx={2} className="fill-adm-axis" />
                {[p.tooCheap, p.bargain, p.expensive, p.tooExpensive].map((v, k) => (
                  <text key={k} x={x(v)} y={cy + 22} textAnchor="middle" className={`text-11 tabular-nums ${k === 1 || k === 2 ? 'fill-adm-ink' : 'fill-adm-muted'}`}>
                    {money(v)}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
        {ladders.map(({ t, p }) => (
          <li key={t.id}>
            <span className="font-semibold text-adm-ink">{t.label}:</span> {p.overExpensive} of {p.n} ({pct(p.overExpensive, p.n)}) already call {money(APP_PLUS.monthly)} a month expensive.
          </li>
        ))}
      </ul>
      <Caption>Each row: the middle answer of that test’s simulated people to “too cheap to trust”, “a bargain”, “getting expensive” and “too expensive”, in US dollars a month.</Caption>
    </div>
  )
}

/* --------------------------------------------------------------- Why no */

/** The main reason of everyone who would not pay, ranked; a bar opens example quotes. */
export function WhyNo({ tests }: { tests: VizTest[] }) {
  const [id, setId] = useState<VizTestId>(tests[tests.length - 1].id)
  const open = useDetail()
  const t = tests.find((x) => x.id === id) ?? tests[0]
  const rows = objections(t)
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="flex flex-col gap-10">
      <Toggle label="Test" value={id} onChange={setId} options={tests.map((x) => ({ id: x.id, label: x.label }))} />
      <ul className="flex flex-col gap-6">
        {rows.map((r) => (
          <li key={r.theme}>
            <button
              type="button"
              onClick={() =>
                open({
                  kicker: `Why people say no · ${t.label}`,
                  title: r.label,
                  summary: `The main reason for ${r.count} of the ${r.n} {{simulated|simulated people}} who would not pay yes.`,
                  labels: ['prediction'],
                  extra: (
                    <ul className="flex flex-col gap-10">
                      {r.quotes.map((q) => (
                        <li key={q.personaId} className="rounded-8 border border-adm-line bg-adm-bg p-10 text-12">
                          <p className="text-adm-ink">“{q.quote}”</p>
                          <p className="mt-4 text-adm-muted">
                            {q.name} · {q.objection}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ),
                })
              }
              className="grid w-full grid-cols-[minmax(96px,150px)_1fr] items-center gap-8 rounded-4 py-2 text-left hover:bg-adm-hover"
            >
              <span className="text-12 font-semibold text-adm-ink">{r.label}</span>
              <span className="flex min-w-0 items-center gap-6">
                <span className="h-14 rounded-r-4 bg-adm-s2" style={{ width: `${(r.count / max) * 65}%` }} aria-hidden="true" />
                <span className="shrink-0 text-12 tabular-nums text-adm-ink">
                  {r.count} <span className="text-adm-muted">· {pct(r.count, r.n)}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Caption>Counted over the {rows[0]?.n ?? 0} people in {t.label} who would not pay yes; each gave one main reason. Tap a bar for what they said.</Caption>
    </div>
  )
}

/* ------------------------------------------------------- What moves people */

const SW = 640
const SX1 = 150
const SX2 = 330
const ST = 30
const SH = 220

/** Before and after each change, among the people it moved: how many would try. */
export function WhatMovesSlope({ slopes }: { slopes: Slope[] }) {
  const [hover, setHover] = useState<string | null>(null)
  const max = Math.max(...slopes.map((s) => s.moved), 1)
  const y = (v: number) => ST + (1 - v / max) * (SH - ST - 20)
  // Right-hand labels, nudged apart so none overlap.
  const placed = [...slopes].sort((a, b) => y(a.after) - y(b.after))
  const labelY = new Map<string, number>()
  let last = -Infinity
  for (const s of placed) {
    const v = Math.max(y(s.after), last + 16)
    labelY.set(s.key, v)
    last = v
  }
  const H = Math.max(SH, last + 14)
  return (
    <div className="flex flex-col gap-10">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${SW} ${H}`} className="block w-full min-w-[560px]" role="img" aria-label={`Slope chart: ${slopes.map((s) => `${s.theme}, ${s.before} to ${s.after} would try among ${s.moved} moved`).join('; ')}`}>
          <text x={SX1} y={14} textAnchor="middle" className="fill-adm-muted text-11 font-semibold">
            Without it
          </text>
          <text x={SX2} y={14} textAnchor="middle" className="fill-adm-muted text-11 font-semibold">
            With it
          </text>
          <line x1={SX1} x2={SX1} y1={ST - 6} y2={SH - 14} className="stroke-adm-axis" />
          <line x1={SX2} x2={SX2} y1={ST - 6} y2={SH - 14} className="stroke-adm-axis" />
          {[0, Math.round(max / 2), max].map((v) => (
            <text key={v} x={SX1 - 10} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-11 tabular-nums">
              {v} people
            </text>
          ))}
          {slopes.map((s) => {
            const on = hover === null || hover === s.key
            const ly = labelY.get(s.key)!
            return (
              <g key={s.key} onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)} opacity={on ? 1 : 0.25}>
                <line x1={SX1} y1={y(s.before)} x2={SX2} y2={y(s.after)} strokeWidth={2} strokeLinecap="round" className="stroke-adm-s1" />
                <circle cx={SX1} cy={y(s.before)} r={4} strokeWidth={2} className="fill-adm-s1 stroke-adm-surface" />
                <circle cx={SX2} cy={y(s.after)} r={4} strokeWidth={2} className="fill-adm-s1 stroke-adm-surface" />
                <line x1={SX2 + 6} y1={y(s.after)} x2={SX2 + 16} y2={ly} className="stroke-adm-axis" />
                <text x={SX2 + 20} y={ly + 4} className="fill-adm-ink text-12">
                  <tspan className="font-semibold">{s.theme}</tspan>
                  <tspan className="fill-adm-muted">
                    {' '}
                    {s.before} → {s.after} of {s.moved} · {s.test}
                  </tspan>
                </text>
                <rect x={SX1 - 6} y={Math.min(y(s.before), y(s.after)) - 6} width={SW - SX1} height={Math.abs(y(s.after) - y(s.before)) + 12} fill="transparent" />
              </g>
            )
          })}
        </svg>
      </div>
      <Caption>Each line is one change, among the simulated people whose answer it changed: how many would try without it (left) and with it (right). Only these changes were tested; the panels differ by test.</Caption>
    </div>
  )
}
