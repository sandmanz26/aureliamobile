import { useState } from 'react'
import { shade } from './shade'

/*
 * Dashboard charts for Buyer agent results (U107, J146). Plain HTML on the
 * admin tokens so light and dark resolve from one definition.
 * - Verdicts (yes / maybe / no) are one ordered measure, so they take one hue
 *   in three steps (sequential), not three status colours: the status palette
 *   stays reserved for state.
 * - Every bar shows its count as text; colour is never the only carrier, and
 *   the legend names each step. Hover shows the exact share.
 */

export interface Counts {
  yes: number
  maybe: number
  no: number
}

const STEP = {
  yes: 'var(--color-adm-s1)',
  maybe: 'color-mix(in oklab, var(--color-adm-s1) 50%, var(--color-adm-surface))',
  no: 'color-mix(in oklab, var(--color-adm-s1) 16%, var(--color-adm-surface))',
} as const
const STEP_INK = { yes: 'text-white', maybe: 'text-adm-ink', no: 'text-adm-ink-2' } as const
const LABEL = { yes: 'Yes', maybe: 'Maybe', no: 'No' } as const
const KEYS = ['yes', 'maybe', 'no'] as const

export function VerdictLegend() {
  return (
    <div className="flex flex-wrap gap-12 text-12 text-adm-ink-2" aria-hidden="true">
      {KEYS.map((k) => (
        <span key={k} className="inline-flex items-center gap-6">
          <span className="size-10 rounded-2 ring-1 ring-adm-line" style={{ background: STEP[k] }} />
          {LABEL[k]}
        </span>
      ))}
    </div>
  )
}

/** One 100% bar of yes / maybe / no, counts written in the segments, the exact share on hover. */
function VerdictBar({ label, counts }: { label: string; counts: Counts }) {
  const [hover, setHover] = useState<(typeof KEYS)[number] | null>(null)
  const total = counts.yes + counts.maybe + counts.no || 1
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-10">
      <span className="text-12 text-adm-ink-2">{label}</span>
      <div className="relative">
        <div className="flex h-28 gap-2 overflow-hidden rounded-4" role="img" aria-label={`${label}: ${counts.yes} yes, ${counts.maybe} maybe, ${counts.no} no, of ${total}`}>
          {KEYS.map((k) =>
            counts[k] > 0 ? (
              <div
                key={k}
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(null)}
                className={`flex items-center justify-center text-12 font-semibold tabular-nums ${STEP_INK[k]} transition-opacity`}
                style={{ width: `${(counts[k] / total) * 100}%`, background: STEP[k], opacity: hover && hover !== k ? 0.6 : 1 }}
              >
                {counts[k] / total >= 0.07 ? counts[k] : ''}
              </div>
            ) : null,
          )}
        </div>
        {hover && (
          <div className="pointer-events-none absolute -top-34 left-0 z-10 rounded-8 border border-adm-line bg-adm-surface px-8 py-4 text-12 text-adm-ink shadow-lg">
            {LABEL[hover]}: <b className="tabular-nums">{counts[hover]}</b> of {total} ({Math.round((counts[hover] / total) * 100)}%)
          </div>
        )}
      </div>
    </div>
  )
}

/** Would try / would pay, for one offer or for A against B. */
export function VerdictChart({ groups }: { groups: { label: string; tries: Counts; pays: Counts }[] }) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-6">
          {groups.length > 1 && <p className="text-12 font-semibold text-adm-ink">{g.label}</p>}
          <VerdictBar label="Would try" counts={g.tries} />
          <VerdictBar label="Would pay" counts={g.pays} />
        </div>
      ))}
      <VerdictLegend />
    </div>
  )
}

/** Horizontal bars with the value written beside each, longest first. */
export function RankBars({ rows, total, note }: { rows: { label: string; value: number; hint?: string }[]; total: number; note?: (value: number) => string }) {
  return (
    <ul className="flex flex-col gap-8">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(110px,180px)_1fr_auto] items-center gap-10 text-12" title={r.hint}>
          <span className="text-adm-ink">{r.label}</span>
          <span className="h-12 rounded-4 bg-adm-bg">
            <span className="block h-full rounded-4 bg-adm-s1" style={{ width: `${(r.value / Math.max(1, total)) * 100}%` }} />
          </span>
          <span className="min-w-[44px] text-right tabular-nums text-adm-ink-2">{note ? note(r.value) : r.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** Segments × measures as a heat table: darker is more. */
export function HeatTable({
  title,
  cols,
  rows,
}: {
  title: string
  cols: string[]
  rows: { label: string; n: number; values: number[] }[]
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full border-separate border-spacing-[2px] text-12">
        <thead>
          <tr className="text-left text-adm-muted">
            <th className="px-6 py-4 font-medium">{title}</th>
            <th className="px-6 py-4 text-right font-medium">n</th>
            {cols.map((c) => (
              <th key={c} className="px-6 py-4 text-center font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="whitespace-nowrap px-6 py-6 text-adm-ink">{r.label}</td>
              <td className="px-6 py-6 text-right text-adm-muted">{r.n}</td>
              {r.values.map((v, i) => {
                const s = shade(v)
                return (
                  <td key={cols[i]} className={`rounded-4 px-6 py-6 text-center font-medium ${s.dark ? 'text-white' : 'text-adm-ink'}`} style={{ background: s.background }} title={`${r.label} · ${cols[i]}: ${Math.round(v * 100)}%`}>
                    {Math.round(v * 100)}%
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HeatLegend() {
  return (
    <div className="flex items-center gap-8 text-11 text-adm-muted" aria-hidden="true">
      <span>0%</span>
      <span className="flex h-8 w-120 overflow-hidden rounded-2">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <span key={v} className="flex-1" style={{ background: shade(v).background }} />
        ))}
      </span>
      <span>100%</span>
    </div>
  )
}

/** A finding as a short bold lead (its first sentence) and the detail under it. */
export function Finding({ text, index }: { text: string; index?: number }) {
  const cut = text.search(/[.:](\s|$)/)
  const lead = cut > 0 ? text.slice(0, cut + 1) : text
  const rest = cut > 0 ? text.slice(cut + 1).trim() : ''
  return (
    <li className="flex gap-10">
      {index !== undefined && <span className="mt-1 flex size-20 shrink-0 items-center justify-center rounded-full bg-adm-hover text-11 font-semibold tabular-nums text-adm-ink">{index + 1}</span>}
      <div className="min-w-0">
        <p className="text-13 font-semibold leading-[20px] text-adm-ink">{lead}</p>
        {rest && <p className="mt-2 max-w-[68ch] text-13 leading-[21px] text-adm-ink-2">{rest}</p>}
      </div>
    </li>
  )
}
