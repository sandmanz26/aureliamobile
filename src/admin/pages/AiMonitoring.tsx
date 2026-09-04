import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { LineChart, StackedBars } from '../components/Charts'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Legend, PageHeader, Panel, StatCard, StatusBadge } from '../components/ui'
import type { SafetyEvent, Trace } from '../data/mock'
import { AI_TIMESERIES, EVAL_SCORES, MODEL_STATS, SAFETY_EVENTS, TRACES } from '../data/mock'

const usd = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const ms = (value: number) => `${Math.round(value).toLocaleString()}ms`

const COST_SERIES = [
  { key: 'opus', label: 'claude-opus-5', color: 'var(--color-adm-s1)' },
  { key: 'sonnet', label: 'claude-sonnet-5', color: 'var(--color-adm-s2)' },
  { key: 'haiku', label: 'claude-haiku-4-5', color: 'var(--color-adm-s3)' },
]

const LATENCY_SERIES = [
  { key: 'p50', label: 'p50', color: 'var(--color-adm-s3)' },
  { key: 'p95', label: 'p95', color: 'var(--color-adm-s2)' },
  { key: 'p99', label: 'p99', color: 'var(--color-adm-s1)' },
]

const RANGES = ['7d', '14d', '30d'] as const

export function AiMonitoring() {
  const [range, setRange] = useState<(typeof RANGES)[number]>('30d')
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
  const window = AI_TIMESERIES.slice(-days)

  const spend = window.reduce((sum, day) => sum + day.opus + day.sonnet + day.haiku, 0)
  const requests = window.reduce((sum, day) => sum + day.requests, 0)
  const errors = window.reduce((sum, day) => sum + day.errors, 0)
  const refusals = window.reduce((sum, day) => sum + day.refusals, 0)
  const avgP95 = window.reduce((sum, day) => sum + day.p95, 0) / window.length
  const totalTokens = MODEL_STATS.reduce((sum, m) => sum + m.inputTokens + m.outputTokens, 0)
  const judged = EVAL_SCORES.reduce((sum, band) => sum + band.count, 0)
  const weighted = EVAL_SCORES.reduce((sum, band, i) => sum + band.count * (i + 1), 0)

  const traceColumns: Column<Trace>[] = [
    { key: 'id', header: 'Trace', width: '120px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    { key: 'intent', header: 'Intent' },
    { key: 'model', header: 'Model', render: (row) => <code className="text-12">{row.model}</code> },
    { key: 'inputTokens', header: 'In', numeric: true, render: (row) => row.inputTokens.toLocaleString() },
    { key: 'outputTokens', header: 'Out', numeric: true, render: (row) => row.outputTokens.toLocaleString() },
    { key: 'costUsd', header: 'Cost', numeric: true, render: (row) => `$${row.costUsd.toFixed(4)}` },
    { key: 'ttftMs', header: 'TTFT', numeric: true, render: (row) => ms(row.ttftMs) },
    { key: 'latencyMs', header: 'Latency', numeric: true, render: (row) => ms(row.latencyMs) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'judgeScore',
      header: 'Judge',
      numeric: true,
      render: (row) => (row.judgeScore === null ? <span className="text-adm-muted">—</span> : row.judgeScore.toFixed(1)),
    },
  ]

  const safetyColumns: Column<SafetyEvent>[] = [
    { key: 'id', header: 'Event', width: '110px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    { key: 'category', header: 'Category' },
    { key: 'severity', header: 'Severity', render: (row) => <StatusBadge status={row.severity} /> },
    { key: 'action', header: 'Action', render: (row) => <Badge tone="info">{row.action}</Badge> },
    { key: 'model', header: 'Model', render: (row) => <code className="text-12">{row.model}</code> },
    { key: 'handledBy', header: 'Handled by' },
    { key: 'at', header: 'When', render: (row) => new Date(row.at).toLocaleString('en-GB') },
  ]

  return (
    <>
      <PageHeader
        title="AI monitoring"
        description="Cost, latency, reliability, output quality and safety for every model call Aurelia makes. Quality scores come from an LLM-as-judge rubric run asynchronously on a sampled slice of production traffic."
        actions={
          <div className="flex items-center gap-2 rounded-8 border border-adm-line bg-adm-surface p-2">
            {RANGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`rounded-6 px-12 py-6 text-12 font-medium transition-colors ${
                  range === option ? 'bg-adm-ink text-adm-surface' : 'text-adm-ink-2 hover:bg-adm-hover'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label={`Spend (${range})`} value={usd(spend)} delta={12.4} inverse hint="vs prior" />
        <StatCard label="Requests" value={`${(requests / 1000).toFixed(1)}k`} delta={8.1} hint="vs prior" />
        <StatCard label="p95 latency" value={ms(avgP95)} delta={6.9} inverse hint="vs prior" />
        <StatCard label="Error rate" value={`${((errors / requests) * 100).toFixed(2)}%`} delta={-0.4} inverse />
        <StatCard label="Refusal rate" value={`${((refusals / requests) * 100).toFixed(2)}%`} delta={0.2} inverse />
        <StatCard label="Avg judge score" value={(weighted / judged).toFixed(2)} delta={1.8} hint={`n=${judged.toLocaleString()}`} />
      </div>

      {avgP95 > 2900 && (
        <div className="flex items-start gap-10 rounded-10 border border-adm-serious/40 bg-adm-serious/10 p-14">
          <AlertTriangle size={16} className="mt-1 shrink-0 text-adm-serious" />
          <div>
            <p className="text-13 font-medium text-adm-ink">p95 latency above the 2.9s objective</p>
            <p className="mt-2 text-12 text-adm-ink-2">
              The last five days show sustained p95 growth on session generation. Opus traffic rose without a matching
              cache-hit increase — check prompt-prefix stability before raising the budget.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-16 xl:grid-cols-2">
        <Panel
          title="Daily spend by model"
          description="Stacked, in USD. Reconciles to list price per 1M tokens."
          actions={<Legend items={COST_SERIES.map((s) => ({ label: s.label, color: s.color }))} />}
        >
          <StackedBars data={window} xKey="date" series={COST_SERIES} format={(v) => `$${v.toFixed(0)}`} />
        </Panel>

        <Panel
          title="Latency percentiles"
          description="End-to-end generation time per day."
          actions={<Legend items={LATENCY_SERIES.map((s) => ({ label: s.label, color: s.color }))} />}
        >
          <LineChart data={window} xKey="date" series={LATENCY_SERIES} format={(v) => `${(v / 1000).toFixed(1)}s`} />
        </Panel>
      </div>

      <Panel title="Model breakdown" description="Usage and unit economics per model over the selected window.">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 text-left font-semibold">Model</th>
                <th className="px-10 py-8 text-right font-semibold">Requests</th>
                <th className="px-10 py-8 text-right font-semibold">Input tok</th>
                <th className="px-10 py-8 text-right font-semibold">Output tok</th>
                <th className="px-10 py-8 text-right font-semibold">Cost</th>
                <th className="px-10 py-8 text-right font-semibold">$/1k req</th>
                <th className="px-10 py-8 text-right font-semibold">p50</th>
                <th className="px-10 py-8 text-right font-semibold">p95</th>
                <th className="px-10 py-8 text-right font-semibold">Errors</th>
                <th className="px-10 py-8 text-right font-semibold">Cache hit</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_STATS.map((row) => (
                <tr key={row.model} className="border-b border-adm-line last:border-0">
                  <td className="px-10 py-10">
                    <code className="text-12 text-adm-ink">{row.model}</code>
                  </td>
                  <td className="px-10 py-10 text-right tabular-nums">{row.requests.toLocaleString()}</td>
                  <td className="px-10 py-10 text-right tabular-nums">{(row.inputTokens / 1e6).toFixed(1)}M</td>
                  <td className="px-10 py-10 text-right tabular-nums">{(row.outputTokens / 1e6).toFixed(1)}M</td>
                  <td className="px-10 py-10 text-right font-medium tabular-nums">{usd(row.costUsd)}</td>
                  <td className="px-10 py-10 text-right tabular-nums">
                    ${((row.costUsd / row.requests) * 1000).toFixed(2)}
                  </td>
                  <td className="px-10 py-10 text-right tabular-nums">{ms(row.p50Ms)}</td>
                  <td className="px-10 py-10 text-right tabular-nums">{ms(row.p95Ms)}</td>
                  <td className="px-10 py-10 text-right tabular-nums">{row.errorRate.toFixed(1)}%</td>
                  <td className="px-10 py-10 text-right tabular-nums">{row.cacheHitRate.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="text-13 font-semibold">
                <td className="px-10 py-10">Total</td>
                <td className="px-10 py-10 text-right tabular-nums">
                  {MODEL_STATS.reduce((s, r) => s + r.requests, 0).toLocaleString()}
                </td>
                <td className="px-10 py-10 text-right tabular-nums">
                  {(MODEL_STATS.reduce((s, r) => s + r.inputTokens, 0) / 1e6).toFixed(1)}M
                </td>
                <td className="px-10 py-10 text-right tabular-nums">
                  {(MODEL_STATS.reduce((s, r) => s + r.outputTokens, 0) / 1e6).toFixed(1)}M
                </td>
                <td className="px-10 py-10 text-right tabular-nums">
                  {usd(MODEL_STATS.reduce((s, r) => s + r.costUsd, 0))}
                </td>
                <td colSpan={5} className="px-10 py-10 text-right text-12 font-normal text-adm-muted">
                  {(totalTokens / 1e6).toFixed(0)}M tokens total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid items-start gap-16 xl:grid-cols-[1fr_1.4fr]">
        <Panel
          title="Output quality"
          description="LLM-as-judge score distribution, 1–5 rubric, on 4% sampled traffic."
        >
          <div className="flex flex-col gap-8">
            {EVAL_SCORES.map((band) => {
              const share = (band.count / judged) * 100
              const weak = band.band.startsWith('1') || band.band.startsWith('2')
              return (
                <div key={band.band} className="flex items-center gap-10">
                  <span className="w-[112px] shrink-0 text-12 text-adm-ink-2">{band.band}</span>
                  <div className="h-16 flex-1 rounded-4 bg-adm-hover">
                    <div
                      className="h-full rounded-4"
                      style={{ width: `${share}%`, background: weak ? 'var(--color-adm-critical)' : 'var(--color-adm-s1)' }}
                    />
                  </div>
                  <span className="w-[74px] shrink-0 text-right text-12 tabular-nums text-adm-ink">
                    {band.count.toLocaleString()} · {share.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-12 text-adm-muted">
            {(((EVAL_SCORES[0].count + EVAL_SCORES[1].count) / judged) * 100).toFixed(1)}% of sampled generations scored
            below “acceptable”. Those traces are queued for review.
          </p>
        </Panel>

        <Panel
          title="Safety & guardrails"
          description="Guardrail interventions on generated content. Critical categories page the on-call reviewer."
        >
          <DataTable
            rows={SAFETY_EVENTS}
            columns={safetyColumns}
            exportName="aurelia-safety-events"
            pageSize={6}
            filters={[
              { key: 'severity', label: 'Severity', options: ['critical', 'serious', 'warning'] },
              { key: 'action', label: 'Action', options: ['blocked', 'rerouted', 'escalated', 'logged'] },
            ]}
          />
        </Panel>
      </div>

      <Panel
        title="Request traces"
        description="Per-request drill-down with tokens, cost and latency inline — the unit an engineer debugs from."
      >
        <DataTable
          rows={TRACES}
          columns={traceColumns}
          exportName="aurelia-ai-traces"
          searchKeys={['id', 'intent', 'model', 'user', 'status']}
          filters={[
            { key: 'model', label: 'Model', options: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'] },
            { key: 'status', label: 'Status', options: ['ok', 'error', 'refusal', 'timeout'] },
            { key: 'intent', label: 'Intent', options: [...new Set(TRACES.map((t) => t.intent))] },
          ]}
        />
      </Panel>
    </>
  )
}
