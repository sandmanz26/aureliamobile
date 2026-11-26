import { PanelRightOpen, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui'
import { formatChange, formatValue, runChange, type HeadlineChange, type HeadlineId, type RunChange } from '../../data/runChanges'
import { useDetail, type DetailItem } from '../reports/DetailDrawer'
import { Details } from '../reports/ReportSummary'
import { RichText, Term } from '../reports/Term'

/*
 * "What changed and why" (U137, J189): every headline of a buyer run carries
 * its reasons next to it — a one-line change under the tile, a section with a
 * bridge chart per headline, and the drawer with the numbers and the people
 * whose answer changed. The numbers come from src/admin/data/runChanges.ts.
 */

const STEP_TERM = { offer: 'offer-effect', panel: 'panel-effect', rules: 'rules-effect' } as const

function countText(c: HeadlineChange['curCount']) {
  return c ? `${c.k} of ${c.n}` : ''
}

/** The drawer for one headline's change. */
function headlineItem(h: HeadlineChange, c: RunChange): DetailItem {
  return {
    kicker: `v${c.previous} → v${c.version} · ${h.measured ? 'measured by replaying' : 'not measured: documented differences'}`,
    title: `${h.label}: why it changed`,
    summary: h.why,
    numbers: [
      { label: `v${c.previous}`, value: h.id === 'objection' ? `${h.prevTheme}` : `${formatValue(h.unit, h.prev)}${h.prevCount ? ` (${countText(h.prevCount)})` : ''}` },
      { label: `v${c.version}`, value: h.id === 'objection' ? `${h.curTheme} ${countText(h.curCount)}` : `${formatValue(h.unit, h.cur)}${h.curCount ? ` (${countText(h.curCount)})` : ''}` },
      ...h.steps.map((s) => ({ label: s.label, value: `${formatChange(h.unit, s.value)}${s.measured ? '' : ' (not split)'}` })),
    ],
    labels: ['prediction'],
    extra: <HeadlineBreakdown h={h} c={c} />,
  }
}

function HeadlineBreakdown({ h, c }: { h: HeadlineChange; c: RunChange }) {
  const p = c.panel
  const pct = (x: number) => `${Math.round(x * 100)}%`
  const shownFlips = h.flips.slice(0, 40)
  return (
    <div className="flex min-w-0 flex-col gap-14 text-13">
      {h.warning && (
        <p className="flex items-start gap-6 rounded-8 bg-adm-critical/10 p-10 text-12 text-adm-critical">
          <TriangleAlert size={14} aria-hidden="true" className="mt-2 shrink-0" />
          <span>{h.warning}</span>
        </p>
      )}
      <Bridge h={h} c={c} />
      <section className="flex flex-col gap-6">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Each cause</h3>
        <ul className="flex flex-col gap-6">
          {h.steps.map((s) => (
            <li key={s.kind} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line p-8">
              <span className="flex flex-wrap items-center justify-between gap-6">
                <span className="font-medium text-adm-ink">{s.kind in STEP_TERM ? <Term id={STEP_TERM[s.kind as keyof typeof STEP_TERM]}>{s.label}</Term> : s.label}</span>
                <span className="font-semibold tabular-nums text-adm-ink">{formatChange(h.unit, s.value)}</span>
              </span>
              <span className="text-12 text-adm-ink-2">{s.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-6">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Who was asked</h3>
        <p className="text-12 text-adm-ink-2">
          {p.prevSize} → {p.curSize} people · seed {p.prevSeed} → {p.curSeed} · generator {p.prevGenerator} → {p.curGenerator}
          {p.samePeople ? ` · ${p.samePeople} the same people` : ''}. In a country the price rule scales down: {pct(p.prevScaled)} → {pct(p.curScaled)} (Indonesia {pct(p.prevIndonesia)} → {pct(p.curIndonesia)}).
        </p>
        {c.mix.length > 0 && (
          <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
            {c.mix.slice(0, 6).map((d) => (
              <li key={d.dimension + d.group}>
                {d.dimension}, {d.group}: {pct(d.prev)} → {pct(d.cur)}
              </li>
            ))}
          </ul>
        )}
      </section>
      {h.flips.length > 0 && (
        <section className="flex flex-col gap-6">
          <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">People whose answer changed ({h.flips.length})</h3>
          <ul className="flex flex-col gap-4" data-flips>
            {shownFlips.map((f, i) => (
              <li key={`${f.personaId}-${f.cause}-${i}`} className="flex min-w-0 flex-col gap-2 border-b border-adm-line pb-4 text-12 last:border-0">
                <span className="flex flex-wrap items-center gap-6">
                  <span className="font-mono text-11 text-adm-muted">{f.personaId}</span>
                  <span className="font-medium text-adm-ink">{f.name}</span>
                  <Badge tone={f.cause === 'offer' ? 'info' : f.cause === 'rules' ? 'warning' : 'neutral'}>{f.cause === 'same person' ? 'same person' : `by the ${f.cause}`}</Badge>
                  <span className="tabular-nums text-adm-ink-2">
                    {f.before} → <span className="font-semibold text-adm-ink">{f.after}</span>
                  </span>
                </span>
                <span className="break-words text-adm-ink-2">{f.reason}</span>
              </li>
            ))}
          </ul>
          {h.flips.length > shownFlips.length && <p className="text-11 text-adm-muted">And {h.flips.length - shownFlips.length} more; the run’s JSON has every answer.</p>}
        </section>
      )}
    </div>
  )
}

/** A bridge (waterfall): the previous value, each cause as a step, the current value. */
export function Bridge({ h, c }: { h: HeadlineChange; c: RunChange }) {
  const bars: { label: string; from: number; to: number; total?: boolean }[] = [{ label: `v${c.previous}`, from: 0, to: h.prev, total: true }]
  let run = h.prev
  for (const s of h.steps) {
    bars.push({ label: s.label, from: run, to: run + s.value })
    run += s.value
  }
  bars.push({ label: `v${c.version}`, from: 0, to: h.cur, total: true })
  const hi = Math.max(...bars.map((b) => Math.max(b.from, b.to))) || 1
  const pos = (v: number) => `${(v / hi) * 100}%`
  return (
    <figure className="flex min-w-0 flex-col gap-4" aria-label={`Bridge chart: ${h.label}`} data-bridge={h.id}>
      <div className="flex h-[120px] items-stretch gap-6 border-b border-adm-axis">
        {bars.map((b, i) => {
          const lo = Math.min(b.from, b.to)
          const up = b.to >= b.from
          return (
            <div key={i} className="relative min-w-0 flex-1" title={`${b.label}: ${b.total ? formatValue(h.unit, b.to) : formatChange(h.unit, b.to - b.from)}`}>
              <div
                className={`absolute inset-x-0 rounded-2 ${b.total ? 'bg-adm-ink' : up ? 'bg-adm-good' : 'bg-adm-critical'}`}
                style={{ bottom: pos(lo), height: `max(2px, ${pos(Math.abs(b.to - b.from))})` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-6">
        {bars.map((b, i) => (
          <figcaption key={i} className="flex min-w-0 flex-1 flex-col text-center text-11 leading-tight">
            <span className="font-semibold tabular-nums text-adm-ink">{b.total ? formatValue(h.unit, b.to) : formatChange(h.unit, b.to - b.from)}</span>
            <span className="break-words text-adm-muted">{b.label}</span>
          </figcaption>
        ))}
      </div>
    </figure>
  )
}

/** The line under a headline tile: "vs v6: was 2 of 60, +58 pts · why". */
export function ChangeLine({ version, id }: { version: number; id: HeadlineId }) {
  const open = useDetail()
  const c = runChange(version)
  const h = c?.headlines.find((x) => x.id === id)
  if (!c || !h) return null
  const was = h.id === 'objection' ? h.prevTheme : h.prevCount ? countText(h.prevCount) : formatValue(h.unit, h.prev)
  return (
    <button
      type="button"
      data-change-line={id}
      onClick={() => open(headlineItem(h, c))}
      className="inline-flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 text-left text-11 text-adm-ink-2 hover:text-adm-ink"
    >
      <span className="tabular-nums">
        vs v{c.previous}: was {was}, <span className="font-semibold text-adm-ink">{formatChange(h.unit, h.delta)}</span>
      </span>
      {!h.likeForLike && <span className="text-adm-critical">different offer</span>}
      <span className="inline-flex items-center gap-2 font-medium underline decoration-adm-axis underline-offset-2">
        why <PanelRightOpen size={11} aria-hidden="true" />
      </span>
    </button>
  )
}

const LEAD: HeadlineId[] = ['tryB', 'payB', 'fairHigh', 'objection']

function HeadlineCard({ h, c }: { h: HeadlineChange; c: RunChange }) {
  const open = useDetail()
  return (
    <div className="flex min-w-0 flex-col gap-10 rounded-8 border border-adm-line p-12" data-headline-change={h.id}>
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <span className="text-13 font-semibold text-adm-ink">{h.label}</span>
        <span className="text-12 tabular-nums text-adm-ink-2">
          {h.id === 'objection' ? `${h.prevTheme} → ${h.curTheme}` : `${formatValue(h.unit, h.prev)} → ${formatValue(h.unit, h.cur)}`} ({formatChange(h.unit, h.delta)})
        </span>
      </div>
      {!h.likeForLike && <Badge tone="critical">Not like for like</Badge>}
      <Bridge h={h} c={c} />
      <p className="text-12 text-adm-ink-2">{h.why}</p>
      <button type="button" onClick={() => open(headlineItem(h, c))} className="inline-flex w-fit items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2">
        The breakdown and who changed their answer <PanelRightOpen size={12} aria-hidden="true" />
      </button>
    </div>
  )
}

/** A headline's reasons, for another page's drawer (Report metrics' trend rows). */
export function RunChangeReasons({ version, id, note }: { version: number; id: HeadlineId; note?: string }) {
  const c = runChange(version)
  const h = c?.headlines.find((x) => x.id === id)
  if (!c || !h) return null
  return (
    <section className="flex min-w-0 flex-col gap-8 border-t border-adm-line pt-10" data-run-change-reasons>
      <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Why it changed since v{c.previous}</h3>
      <p className="text-13 text-adm-ink">{h.why}</p>
      {note && <p className="text-12 text-adm-muted">{note}</p>}
      <HeadlineBreakdown h={h} c={c} />
    </section>
  )
}

/** For the Buyer agent report summary: the latest test against the one before, each headline with its reason. */
export function LatestChangeAside({ version }: { version: number }) {
  const open = useDetail()
  const c = runChange(version)
  if (!c) return null
  const lead = c.headlines.filter((h) => LEAD.includes(h.id))
  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12" data-latest-change>
      <h2 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">
        What changed since test {c.previous}, and why
      </h2>
      {c.notLikeForLike.length > 0 && <p className="text-12 text-adm-critical">{c.notLikeForLike[c.notLikeForLike.length - 1]}</p>}
      <ul className="flex flex-col gap-6">
        {lead.map((h) => (
          <li key={h.id} className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-baseline lg:justify-between lg:gap-12">
            <span className="min-w-0 text-12 text-adm-ink-2">{h.why}</span>
            <button type="button" onClick={() => open(headlineItem(h, c))} className="inline-flex shrink-0 items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2">
              Breakdown <PanelRightOpen size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Link to={`/admin/buyer-agent?v=${version}#what-changed`} className="w-fit text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2">
        Every headline, with its bridge chart
      </Link>
    </div>
  )
}

/** "What changed since vN": summary first, then a bridge per headline. */
export function RunChangesSection({ version }: { version: number }) {
  const c = runChange(version)
  if (!c) return null
  const lead = c.headlines.filter((h) => LEAD.includes(h.id))
  const rest = c.headlines.filter((h) => !LEAD.includes(h.id))
  return (
    <section id="what-changed" aria-label={`What changed since v${c.previous}`} className="flex min-w-0 scroll-mt-16 flex-col gap-14 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <h2 className="text-16 font-semibold text-adm-ink">What changed since v{c.previous}, and why</h2>
        <Badge tone={c.declaration.reproducible ? 'good' : 'warning'}>{c.declaration.reproducible ? 'Measured by replaying' : 'Not measured: hand-written runs'}</Badge>
      </div>
      <ul className="flex flex-col gap-6 text-13 text-adm-ink">
        {c.summary.map((s) => (
          <li key={s} className="min-w-0 break-words">
            {s}
          </li>
        ))}
      </ul>
      {c.notLikeForLike.length > 0 && (
        <div className="flex flex-col gap-4 rounded-8 bg-adm-critical/10 p-10 text-12 text-adm-critical" data-not-like-for-like>
          <span className="inline-flex items-center gap-6 font-semibold">
            <TriangleAlert size={14} aria-hidden="true" />
            <RichText text="Not {{like-for-like}}" />
          </span>
          {c.notLikeForLike.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}
      <p className="text-12 text-adm-muted">
        <RichText text="Each {{bridge|bridge chart}} starts at the last run’s number, adds {{offer-effect|what was tested}}, {{panel-effect|who was asked}} and {{rules-effect|the rules}} (for prices: what people say they would pay, and the country and income scaling of the price rule), and ends at this run’s number. Changes in shares are in {{points}}." />
      </p>
      <div className="grid gap-12 lg:grid-cols-2">
        {lead.map((h) => (
          <HeadlineCard key={h.id} h={h} c={c} />
        ))}
      </div>
      {rest.length > 0 && (
        <Details title="Every other headline, step by step" hint={rest.map((h) => h.label).join(', ')}>
          <div className="grid gap-12 lg:grid-cols-2">
            {rest.map((h) => (
              <HeadlineCard key={h.id} h={h} c={c} />
            ))}
          </div>
        </Details>
      )}
    </section>
  )
}
