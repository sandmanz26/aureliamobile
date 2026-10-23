import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Crosshair } from 'lucide-react'
import type { ClickEvent } from './tracker'
import type { ElementStat } from './stats'
import { countBy, heatmapUrl, layoutOf, median, pct, seconds } from './stats'

function Pill({ tone, children }: { tone: 'neutral' | 'good' | 'warn' | 'bad'; children: React.ReactNode }) {
  const cls = {
    neutral: 'bg-background-elevated text-text-secondary',
    good: 'bg-[#ECFBED] text-success-600',
    warn: 'bg-[#FFF4E5] text-[#B25E09]',
    bad: 'bg-[#FDECEC] text-feedback-error',
  }[tone]
  return <span className={`inline-flex h-20 items-center whitespace-nowrap rounded-full px-8 text-[11px] ${cls}`}>{children}</span>
}

/** One line saying what the taps did. */
function Outcome({ s }: { s: ElementStat }) {
  const n = s.taps.length
  const known = s.navigated + s.changed + s.nothing
  if (!known) return <span className="text-text-secondary">—</span>
  return (
    <span className="flex flex-wrap gap-4">
      {s.navigated > 0 && <Pill tone="good">→ {s.topTo?.[0] ?? 'other screen'} {pct(s.navigated, n)}</Pill>}
      {s.changed > 0 && <Pill tone="neutral">changed screen {pct(s.changed, n)}</Pill>}
      {s.nothing > 0 && <Pill tone="bad">no response {pct(s.nothing, n)}</Pill>}
    </span>
  )
}

function Split({ title, rows }: { title: string; rows: [string, number][] }) {
  const total = rows.reduce((sum, [, n]) => sum + n, 0)
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">{title}</p>
      <ul className="mt-6 flex flex-col gap-4">
        {rows.length === 0 && <li className="text-text-secondary">—</li>}
        {rows.slice(0, 6).map(([k, n]) => (
          <li key={k} className="flex justify-between gap-8">
            <span className="truncate" title={k}>
              {k}
            </span>
            <span className="tabular-nums text-text-secondary">
              {n} · {pct(n, total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The element drawn to its average shape, with every tap as a dot where it
 *  landed on it — shows whether people hit the middle, an edge, or the icon. */
function OnElement({ taps }: { taps: ClickEvent[] }) {
  const sized = taps.filter((t) => t.ex !== undefined && t.ey !== undefined)
  if (!sized.length) return <p className="text-text-secondary">Recorded before element detail existed.</p>
  const w = median(sized.flatMap((t) => (t.ew ? [t.ew] : []))) ?? 100
  const h = median(sized.flatMap((t) => (t.eh ? [t.eh] : []))) ?? 40
  const scale = Math.min(260 / w, 130 / h, 1.5)
  return (
    <div>
      <div
        className="relative rounded-8 border border-dashed border-text-secondary/50 bg-background-elevated"
        style={{ width: Math.max(24, w * scale), height: Math.max(16, h * scale) }}
      >
        {sized.map((t, i) => (
          <span
            key={i}
            className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3b1f]/60"
            style={{ left: `${Math.min(100, Math.max(0, t.ex!))}%`, top: `${Math.min(100, Math.max(0, t.ey!))}%` }}
          />
        ))}
      </div>
      <p className="mt-6 text-text-secondary">
        {w}×{h}px{w < 44 || h < 44 ? ' · smaller than the 44px tap target' : ''}
      </p>
    </div>
  )
}

function Detail({ s }: { s: ElementStat }) {
  return (
    <div className="grid gap-16 text-[12px] text-text-primary sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">Where on the element</p>
        <div className="mt-6">
          <OnElement taps={s.taps} />
        </div>
      </div>
      <Split title="Devices" rows={countBy(s.taps, (t) => layoutOf(t.vw))} />
      <Split title="Design version" rows={countBy(s.taps, (t) => `v${t.ui}`)} />
      <Split title="State before tap" rows={countBy(s.taps, (t) => t.state ?? 'none')} />
      <Split title="Led to" rows={countBy(s.taps, (t) => (t.fx === 'navigated' ? t.to : t.fx ? (t.fx === 'changed' ? 'changed this screen' : 'no response') : undefined))} />
      <Split title="Label seen" rows={countBy(s.taps, (t) => t.label)} />
      <div>
        <p className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">Timing</p>
        <ul className="mt-6 flex flex-col gap-4">
          <li>Median after screen opened: {seconds(s.medianMs)}</li>
          <li>Fastest: {seconds(Math.min(...s.taps.flatMap((t) => (t.ms === undefined ? [] : [t.ms]))) || undefined)}</li>
          <li>Median scroll depth: {s.medianDepth === undefined ? '—' : `${s.medianDepth}%`}</li>
          <li>Rage taps: {s.rage}</li>
        </ul>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">Find it</p>
        <code className="mt-6 block break-all rounded-8 bg-background-elevated p-8 text-[11px]">{s.sel ?? '—'}</code>
        <a href={heatmapUrl(s.page, s.sel)} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-4 text-[#ff881b]">
          <Crosshair size={13} /> Show on screen
        </a>
      </div>
    </div>
  )
}

export function ElementsTable({ stats }: { stats: ElementStat[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [kind, setKind] = useState('all')
  const kinds = useMemo(() => countBy(stats, (s) => s.kind), [stats])
  const shown = kind === 'all' ? stats : stats.filter((s) => s.kind === kind)

  if (!stats.length) return <p className="text-[13px] text-text-secondary">No taps on this screen yet.</p>

  return (
    <div>
      <div className="mb-12 flex flex-wrap gap-6">
        {[['all', stats.length] as [string, number], ...kinds].map(([k, n]) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`h-28 rounded-full border px-10 text-[12px] ${
              kind === k ? 'border-text-primary bg-text-primary text-text-inverse' : 'border-border-subtle text-text-primary'
            }`}
          >
            {k === 'all' ? 'All elements' : k} · {n}
          </button>
        ))}
      </div>
      <div className="-mx-16 overflow-x-auto px-16">
        <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] uppercase tracking-[0.06em] text-text-secondary">
              <th className="py-8 pr-12 font-normal">Element</th>
              <th className="py-8 pr-12 font-normal">Section</th>
              <th className="py-8 pr-12 text-right font-normal">Taps</th>
              <th className="py-8 pr-12 text-right font-normal" title="Share of the sessions that opened this screen and tapped this element">
                Reach
              </th>
              <th className="py-8 pr-12 text-right font-normal" title="Median time from opening the screen to the tap">
                After
              </th>
              <th className="py-8 pr-12 font-normal">What it did</th>
              <th className="py-8 font-normal" />
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const isOpen = open === s.key
              return (
                <Fragment key={s.key}>
                  <tr
                    className={`cursor-pointer border-b border-border-subtle align-top hover:bg-background-elevated ${isOpen ? 'bg-background-elevated' : ''}`}
                    onClick={() => setOpen(isOpen ? null : s.key)}
                  >
                    <td className="max-w-[280px] py-10 pr-12">
                      <span className="block truncate text-text-primary" title={s.label}>
                        {s.label}
                      </span>
                      <span className="mt-4 flex flex-wrap gap-4">
                        <Pill tone={s.kind === 'not a control' ? 'warn' : 'neutral'}>{s.kind}</Pill>
                        {s.rage > 0 && <Pill tone="bad">{s.rage} rage</Pill>}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate py-10 pr-12 text-text-secondary" title={s.section}>
                      {s.section}
                    </td>
                    <td className="py-10 pr-12 text-right tabular-nums">{s.taps.length}</td>
                    <td className="py-10 pr-12 text-right tabular-nums">
                      {pct(s.sessions, s.viewers)}
                      <span className="block text-[11px] text-text-secondary">
                        {s.sessions}/{s.viewers}
                      </span>
                    </td>
                    <td className="py-10 pr-12 text-right tabular-nums">{seconds(s.medianMs)}</td>
                    <td className="py-10 pr-12">
                      <Outcome s={s} />
                    </td>
                    <td className="py-10">
                      <ChevronDown size={16} className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border-subtle bg-background-elevated/50">
                      <td colSpan={7} className="px-4 py-16">
                        <Detail s={s} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Elements worth a look: taps that did nothing, rage taps, taps on things
 *  that are not controls. */
export function ProblemList({ stats }: { stats: ElementStat[] }) {
  const rows = stats
    .map((s) => ({ s, score: s.nothing + s.rage * 2 + s.dead }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
  if (!rows.length) return <p className="text-[13px] text-text-secondary">No dead, rage or unanswered taps for these filters.</p>
  return (
    <ul className="flex flex-col gap-10">
      {rows.map(({ s }) => (
        <li key={s.key} className="flex items-start justify-between gap-12 text-[13px]">
          <span className="min-w-0">
            <span className="block truncate text-text-primary" title={s.label}>
              {s.label}
            </span>
            <span className="block truncate text-[11px] text-text-secondary">
              {s.page} · {s.section}
            </span>
          </span>
          <span className="flex shrink-0 flex-wrap justify-end gap-4">
            {s.dead > 0 && <Pill tone="warn">{s.dead} not a control</Pill>}
            {s.nothing > 0 && <Pill tone="bad">{s.nothing} no response</Pill>}
            {s.rage > 0 && <Pill tone="bad">{s.rage} rage</Pill>}
            <a href={heatmapUrl(s.page, s.sel)} target="_blank" rel="noreferrer" aria-label={`Show ${s.label} on screen`} className="text-[#ff881b]">
              <Crosshair size={14} />
            </a>
          </span>
        </li>
      ))}
    </ul>
  )
}
