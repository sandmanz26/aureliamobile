import { DataSources } from './DataSources'
import { PageTabs } from '../../components/PageTabs'
import { metricsBrief } from '../../data/reportBriefs'
import { ReportHeaderCard } from './ReportHeaderCard'
import { ArrowDownRight, ArrowUpRight, Minus, PanelRightOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import { plainText } from '../../data/glossary'
import {
  QUALITY_TEXT,
  REPORT_LINK,
  REPORT_NAME,
  buildMetrics,
  formatDelta,
  formatValue,
  metricsReportSummary,
  type Check,
  type MetricReport,
  type MetricResult,
  type Quality,
} from '../../data/reportMetrics'
import { studyWeek } from '../../data/study'
import { trendHeadline } from '../../data/runChanges'
import { RunChangeReasons } from '../buyer/RunChanges'
import { DetailDrawerProvider, useDetail, type DetailItem } from './DetailDrawer'
import { SummaryBlock } from './ReportSummary'
import { RichText, Term } from './Term'

/**
 * Admin → Reports → Report metrics (U135, J186). The owner asked for a table
 * of results and their quality: is every number backed by data and a
 * formula, and are the results improving? Summary first; then one row per
 * number with its trend and its audit; a click shows the formula, the
 * inputs, the calculation with the real numbers, and who counted.
 */
export function ReportMetricsPage() {
  return (
    <DetailDrawerProvider>
      <MetricsView />
    </DetailDrawerProvider>
  )
}

const QUALITY_TONE: Record<Quality, Tone> = { consistent: 'good', mismatch: 'critical', untraceable: 'serious' }
const CHECK_TONE: Record<Check['level'], Tone> = { ok: 'good', warn: 'warning', fail: 'critical' }
const CHECK_TEXT: Record<Check['level'], string> = { ok: 'OK', warn: 'Check', fail: 'Problem' }

function QualityPill({ q }: { q: Quality }) {
  return <Badge tone={QUALITY_TONE[q]}>{QUALITY_TEXT[q]}</Badge>
}

function TrendCell({ r }: { r: MetricResult }) {
  if (!r.trend) return <span className="text-12 text-adm-muted">—</span>
  const { delta, better, previousStep } = r.trend
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  const cls = better === true ? 'text-adm-good' : better === false ? 'text-adm-critical' : 'text-adm-muted'
  const word = better === true ? 'better' : better === false ? 'worse' : 'no change'
  return (
    <span className={`inline-flex items-center gap-2 text-12 font-medium tabular-nums ${cls}`} title={`Against ${previousStep}: ${word}`}>
      <Icon size={13} aria-hidden="true" />
      {formatDelta(r.def.unit, delta)}
      <span className="sr-only"> against {previousStep}, {word}</span>
    </span>
  )
}

const warnCount = (r: MetricResult) => r.checks.filter((c) => c.level !== 'ok').length

function detailOf(r: MetricResult): DetailItem {
  const d = r.derivation
  const u = r.def.unit
  return {
    kicker: `${REPORT_NAME[r.def.report]} · ${QUALITY_TEXT[r.quality]}`,
    title: r.def.label,
    summary: r.def.formula,
    numbers: [
      { label: 'Shown in the report', value: formatValue(u, r.displayed) },
      { label: '{{recomputed|Worked out again}} from the data', value: r.quality === 'untraceable' ? 'No data to work from' : formatValue(u, r.recomputed) },
      ...(r.trend ? [{ label: `Against ${r.trend.previousStep}`, value: `${formatValue(u, r.trend.previous)} → ${formatValue(u, r.value)} (${formatDelta(u, r.trend.delta)}, ${r.trend.better === true ? 'better' : r.trend.better === false ? 'worse' : 'no change'})` }] : []),
      ...(d?.n !== undefined ? [{ label: 'Based on', value: `${d.n}` }] : []),
    ],
    to: REPORT_LINK[r.def.report],
    toLabel: `Open the ${REPORT_NAME[r.def.report]}`,
    extra: <MetricDetail r={r} />,
  }
}

function MetricDetail({ r }: { r: MetricResult }) {
  const d = r.derivation
  const cause = trendHeadline(r.def.id)
  const prevStep = r.trend ? Number(/\d+/.exec(r.trend.previousStep)?.[0]) : NaN
  return (
    <div className="flex min-w-0 flex-col gap-14 text-13">
      {cause && (
        <RunChangeReasons
          version={cause.version}
          id={cause.id}
          note={r.trend && prevStep !== cause.previous ? `The trend column compares with ${r.trend.previousStep}; the reasons here are against the run just before this one.` : undefined}
        />
      )}
      <section className="flex flex-col gap-6">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Quality checks</h3>
        <ul className="flex flex-col gap-6">
          {r.checks.map((c, i) => (
            <li key={i} className="flex items-start gap-8">
              <span className="shrink-0">
                <Badge tone={CHECK_TONE[c.level]}>{CHECK_TEXT[c.level]}</Badge>
              </span>
              <span className="min-w-0 text-adm-ink-2">{c.text}</span>
            </li>
          ))}
          {r.checks.length === 0 && <li className="text-adm-ink-2">The number shown matches the data, and nothing looks out of range.</li>}
        </ul>
      </section>

      {d && (
        <section className="flex flex-col gap-6">
          <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">What it is made from</h3>
          <ul className="flex flex-col overflow-hidden rounded-8 border border-adm-line">
            {d.inputs.map((x, i) => (
              <li key={i} className="flex flex-col gap-2 border-b border-adm-line p-8 last:border-0">
                <span className="flex flex-wrap items-baseline justify-between gap-8">
                  <span className="text-adm-ink">{x.label}</span>
                  <span className="font-semibold tabular-nums text-adm-ink">{x.value}</span>
                </span>
                <span className="break-words font-mono text-11 text-adm-muted">{x.source}</span>
                {x.ids && x.ids.length > 0 && (
                  <span className="break-words text-11 text-adm-muted">
                    {x.ids.length > 12 ? `${x.ids.slice(0, 12).join(', ')} and ${x.ids.length - 12} more` : x.ids.join(', ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d && (
        <section className="flex flex-col gap-6">
          <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">The calculation, step by step</h3>
          <ol className="flex list-decimal flex-col gap-4 pl-18 text-adm-ink-2">
            {d.steps.map((s, i) => (
              <li key={i} className="break-words">
                {s}
              </li>
            ))}
          </ol>
        </section>
      )}

      {r.quality === 'untraceable' && (
        <p className="rounded-8 border border-adm-line bg-adm-bg p-10 text-adm-ink-2">
          <span className="font-semibold text-adm-ink">Assumption. </span>
          {r.def.assumption}
        </p>
      )}

      {d?.breakdown && (
        <section className="flex min-w-0 flex-col gap-6">
          <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">{d.breakdown.title}</h3>
          <div className="max-h-[360px] min-w-0 overflow-auto rounded-8 border border-adm-line">
            <table className="w-full text-left text-11">
              <thead className="sticky top-0 bg-adm-bg">
                <tr>
                  {d.breakdown.columns.map((c, i) => (
                    <th key={i} scope="col" className="whitespace-nowrap px-8 py-6 font-semibold text-adm-muted">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.breakdown.rows.map((row) => (
                  <tr key={row.id} className={`border-t border-adm-line ${row.flag ? 'bg-adm-warning/12' : ''}`} title={row.flag}>
                    {row.cells.map((c, i) => (
                      <td key={i} className="whitespace-nowrap px-8 py-4 tabular-nums text-adm-ink-2">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {d.breakdown.rows.some((x) => x.flag) && <p className="text-11 text-adm-muted">Shaded rows: the person’s own answer is out of line with what they said they would pay.</p>}
          {d.breakdown.footer?.map((f) => (
            <p key={f} className="text-12 font-medium text-adm-ink">
              {f}
            </p>
          ))}
        </section>
      )}

      <p className="border-t border-adm-line pt-10 text-11 text-adm-muted">Shown at: {r.def.shownAt}</p>
    </div>
  )
}

const ALL = 'all'

function MetricsView() {
  const open = useDetail()
  const [week] = useState(() => Math.max(1, Math.min(8, studyWeek(Date.now()))))
  const rows = useMemo(() => buildMetrics(week), [week])
  const summary = useMemo(() => metricsReportSummary(rows), [rows])
  const [report, setReport] = useState<MetricReport | typeof ALL>(ALL)
  const [quality, setQuality] = useState<Quality | 'warn' | typeof ALL>(ALL)
  const reports = [...new Set(rows.map((r) => r.def.report))]
  const shown = rows.filter((r) => (report === ALL || r.def.report === report) && (quality === ALL || (quality === 'warn' ? warnCount(r) > 0 : r.quality === quality)))
  const series = useMemo(() => {
    const m = new Map<string, MetricResult[]>()
    for (const r of rows) if (r.def.series && r.value !== null) m.set(r.def.series.id, [...(m.get(r.def.series.id) ?? []), r])
    return [...m.values()].map((xs) => xs.sort((a, b) => a.def.series!.order - b.def.series!.order))
  }, [rows])

  const selectCls = 'h-32 min-w-0 rounded-8 border border-adm-line bg-adm-surface px-8 text-13 text-adm-ink'

  const brief = useMemo(() => metricsBrief(week), [week])
  const summaryBlock = (
      <SummaryBlock s={summary} />
  )

  return (
    <div className="flex min-w-0 flex-col gap-16">
      <PageHeader title="Report metrics" description={plainText(summary.intro ?? '')} />
      <PageTabs summary={<ReportHeaderCard route="/admin/reports/metrics" brief={brief} />}>
      {summaryBlock}

      <Panel title="How to read the quality" description="Each number gets one of three labels, plus checks for things that look wrong.">
        <dl className="grid gap-8 text-12 lg:grid-cols-3">
          <div className="flex items-start gap-8">
            <dt className="shrink-0">
              <QualityPill q="consistent" />
            </dt>
            <dd className="text-adm-ink-2">
              The number <Term id="traceable">traces back to data</Term>: <Term id="recomputed">worked out again</Term>, it gives the number the report shows.
            </dd>
          </div>
          <div className="flex items-start gap-8">
            <dt className="shrink-0">
              <QualityPill q="mismatch" />
            </dt>
            <dd className="text-adm-ink-2">Worked out again, the data gives a different number. Both numbers are shown.</dd>
          </div>
          <div className="flex items-start gap-8">
            <dt className="shrink-0">
              <QualityPill q="untraceable" />
            </dt>
            <dd className="text-adm-ink-2">
              There is no data to work it out from. It is an <Term id="assumption">assumption</Term> or a goal.
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Are results improving?" description="The same number across tests, stages or persona sets. Green is better, red is worse. The people changed between tests, so compare shares, not head counts.">
        <ul className="flex flex-col gap-8">
          {series.map((xs) => (
            <li key={xs[0].def.series!.id} className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-10 lg:flex-row lg:items-center lg:gap-16">
              <span className="text-13 font-semibold text-adm-ink lg:w-[200px] lg:shrink-0">{xs[0].def.series!.label}</span>
              <ol className="flex min-w-0 flex-wrap items-center gap-6">
                {xs.map((x) => (
                  <li key={x.def.id}>
                    <button
                      type="button"
                      onClick={() => open(detailOf(x))}
                      className="flex flex-col items-start rounded-8 border border-adm-line px-8 py-4 text-left hover:bg-adm-hover focus-visible:outline-2 focus-visible:outline-adm-accent"
                    >
                      <span className="text-11 text-adm-muted">{x.def.series!.step}</span>
                      <span className="text-13 font-semibold tabular-nums text-adm-ink">{formatValue(x.def.unit, x.value)}</span>
                      <TrendCell r={x} />
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </Panel>

      <section id="metrics-table" aria-labelledby="metrics-title" className="flex min-w-0 scroll-mt-16 flex-col gap-12 rounded-12 border border-adm-line bg-adm-surface p-16">
        <div className="flex flex-col gap-2">
          <h2 id="metrics-title" className="text-15 font-semibold text-adm-ink">
            Every number, with its quality
          </h2>
          <p className="text-12 text-adm-muted">Click a row for the formula, the inputs, the calculation and who counted.</p>
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <label className="flex min-w-0 flex-col gap-2 text-11 font-medium text-adm-muted">
            Report
            <select className={selectCls} value={report} onChange={(e) => setReport(e.target.value as MetricReport | typeof ALL)}>
              <option value={ALL}>All reports</option>
              {reports.map((r) => (
                <option key={r} value={r}>
                  {REPORT_NAME[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-11 font-medium text-adm-muted">
            Quality
            <select className={selectCls} value={quality} onChange={(e) => setQuality(e.target.value as Quality | 'warn' | typeof ALL)}>
              <option value={ALL}>All</option>
              <option value="consistent">Consistent</option>
              <option value="mismatch">Mismatch</option>
              <option value="untraceable">Not traceable</option>
              <option value="warn">Has a warning</option>
            </select>
          </label>
          <span className="pb-6 text-12 text-adm-muted" aria-live="polite">
            {shown.length} of {rows.length} numbers
          </span>
        </div>

        {/* Desktop: a table. */}
        <div className="hidden min-w-0 overflow-x-auto lg:block">
          <table className="w-full text-left text-13">
            <thead>
              <tr className="border-b border-adm-line text-11 text-adm-muted">
                <th scope="col" className="py-6 pr-12 font-semibold">Number</th>
                <th scope="col" className="py-6 pr-12 font-semibold">Report</th>
                <th scope="col" className="py-6 pr-12 text-right font-semibold">Value</th>
                <th scope="col" className="py-6 pr-12 font-semibold">Since last</th>
                <th scope="col" className="py-6 pr-12 font-semibold">Quality</th>
                <th scope="col" className="py-6 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.def.id} data-metric={r.def.id} onClick={() => open(detailOf(r))} className="cursor-pointer border-b border-adm-line align-top last:border-0 hover:bg-adm-hover">
                  <td className="py-8 pr-12">
                    <button type="button" onClick={(e) => { e.stopPropagation(); open(detailOf(r)) }} className="inline-flex items-start gap-6 text-left font-medium text-adm-ink hover:underline focus-visible:outline-2 focus-visible:outline-adm-accent">
                      {r.def.label}
                      <PanelRightOpen size={13} aria-hidden="true" className="mt-2 shrink-0 text-adm-muted" />
                    </button>
                  </td>
                  <td className="py-8 pr-12 text-12 text-adm-ink-2">{REPORT_NAME[r.def.report]}</td>
                  <td className="py-8 pr-12 text-right font-semibold tabular-nums text-adm-ink">
                    {formatValue(r.def.unit, r.value)}
                    {r.quality === 'mismatch' && <span className="block text-11 font-normal text-adm-critical">data: {formatValue(r.def.unit, r.recomputed)}</span>}
                  </td>
                  <td className="py-8 pr-12">
                    <TrendCell r={r} />
                  </td>
                  <td className="py-8 pr-12">
                    <span className="flex flex-wrap items-center gap-4">
                      <QualityPill q={r.quality} />
                      {warnCount(r) > 0 && r.quality === 'consistent' && <Badge tone="warning">{warnCount(r)} check{warnCount(r) === 1 ? '' : 's'}</Badge>}
                    </span>
                  </td>
                  <td className="max-w-[260px] py-8 font-mono text-11 break-words text-adm-muted">{r.def.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Below lg: one card per number. */}
        <ul className="flex flex-col gap-8 lg:hidden">
          {shown.map((r) => (
            <li key={r.def.id}>
              <button type="button" data-metric={r.def.id} onClick={() => open(detailOf(r))} className="flex w-full min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-10 text-left hover:bg-adm-hover">
                <span className="text-13 font-medium text-adm-ink">{r.def.label}</span>
                <span className="text-11 text-adm-muted">{REPORT_NAME[r.def.report]}</span>
                <span className="flex flex-wrap items-center gap-8">
                  <span className="text-15 font-semibold tabular-nums text-adm-ink">{formatValue(r.def.unit, r.value)}</span>
                  <TrendCell r={r} />
                  <QualityPill q={r.quality} />
                  {warnCount(r) > 0 && r.quality === 'consistent' && <Badge tone="warning">{warnCount(r)} check{warnCount(r) === 1 ? '' : 's'}</Badge>}
                </span>
                {r.quality === 'mismatch' && <span className="text-11 text-adm-critical">The data gives {formatValue(r.def.unit, r.recomputed)}</span>}
              </button>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="text-13 text-adm-muted">No numbers match these filters.</p>}
      </section>

      <p className="text-11 text-adm-muted">
        <RichText text="Every value in the table is read from the report itself, then {{recomputed|worked out again}} here from the answers, personas and prices underneath. Nothing on this page is typed in." />
      </p>
      <DataSources route="/admin/reports/metrics" full />
      </PageTabs>
    </div>
  )
}
