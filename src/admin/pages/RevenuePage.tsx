import { LineChart } from '../components/Charts'
import { Legend, PageHeader, Panel, StatCard } from '../components/ui'
import { MRR_MONTHS, COHORTS, PLANS } from '../data/commerce'

const money = (value: number) =>
  `$${Math.round(value).toLocaleString('en-US')}`
const monthLabel = (iso: string) =>
  new Date(`${iso}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })

const MRR_SERIES = [{ key: 'ending', label: 'Ending MRR', color: 'var(--color-adm-s1)' }]

export function RevenuePage() {
  const latest = MRR_MONTHS[MRR_MONTHS.length - 1]
  const prior = MRR_MONTHS[MRR_MONTHS.length - 2]

  // Net revenue retention — the elite benchmark for consumer subscription is
  // well below SaaS's 115–125%; consumer rarely has expansion revenue.
  const nrr = ((latest.starting + latest.expansion + latest.contraction + latest.churn) / latest.starting) * 100
  const grossChurn = (Math.abs(latest.churn) / latest.starting) * 100
  const arpu = latest.ending / latest.subscribers
  const ltv = arpu / (grossChurn / 100)

  const waterfall = [
    { label: 'Starting MRR', value: latest.starting, kind: 'base' as const },
    { label: 'New', value: latest.newMrr, kind: 'up' as const },
    { label: 'Expansion', value: latest.expansion, kind: 'up' as const },
    { label: 'Contraction', value: latest.contraction, kind: 'down' as const },
    { label: 'Churn', value: latest.churn, kind: 'down' as const },
    { label: 'Ending MRR', value: latest.ending, kind: 'base' as const },
  ]
  const scale = Math.max(...waterfall.map((step) => Math.abs(step.value)))

  return (
    <>
      <PageHeader
        title="Revenue"
        description="Recurring revenue movement, retention and unit economics. MRR is split into new, expansion, contraction and churn so growth and decay are never netted into one number."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="MRR" value={money(latest.ending)} delta={((latest.ending - prior.ending) / prior.ending) * 100} />
        <StatCard label="ARR (run-rate)" value={money(latest.ending * 12)} delta={9.4} />
        <StatCard label="Net revenue retention" value={`${nrr.toFixed(1)}%`} delta={1.6} hint="incl. expansion" />
        <StatCard label="Gross MRR churn" value={`${grossChurn.toFixed(1)}%`} delta={-0.6} inverse hint="monthly" />
        <StatCard label="ARPU" value={`$${arpu.toFixed(2)}`} delta={1.1} hint="per paying user" />
        <StatCard label="Est. LTV" value={money(ltv)} delta={2.4} hint="ARPU ÷ churn" />
      </div>

      <div className="grid gap-16 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="MRR over time"
          description="Twelve months of ending monthly recurring revenue."
          actions={<Legend items={MRR_SERIES.map((s) => ({ label: s.label, color: s.color }))} />}
        >
          <LineChart
            data={MRR_MONTHS.map((row) => ({ ...row, date: `${row.month}-01` }))}
            xKey="date"
            series={MRR_SERIES}
            format={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </Panel>

        <Panel title={`MRR movement — ${monthLabel(latest.month)}`} description="Where this month's revenue came from and went.">
          <div className="flex flex-col gap-8">
            {waterfall.map((step) => {
              const width = (Math.abs(step.value) / scale) * 100
              const color =
                step.kind === 'base' ? 'var(--color-adm-s1)' : step.kind === 'up' ? 'var(--color-adm-good)' : 'var(--color-adm-critical)'
              return (
                <div key={step.label} className="flex items-center gap-10">
                  <span className="w-[104px] shrink-0 text-12 text-adm-ink-2">{step.label}</span>
                  <div className="h-16 flex-1 rounded-4 bg-adm-hover">
                    <div className="h-full rounded-4" style={{ width: `${width}%`, background: color }} />
                  </div>
                  <span
                    className={`w-[76px] shrink-0 text-right text-12 font-medium tabular-nums ${
                      step.kind === 'down' ? 'text-adm-critical' : 'text-adm-ink'
                    }`}
                  >
                    {step.value < 0 ? '−' : step.kind === 'up' ? '+' : ''}
                    {money(Math.abs(step.value))}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title="Cohort retention"
        description="Percentage of each signup cohort still subscribed N months later. Read down a column to compare cohorts at the same age."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-12">
            <thead>
              <tr className="border-b border-adm-line">
                <th className="px-8 py-8 text-left text-11 font-semibold uppercase tracking-wider text-adm-muted">Cohort</th>
                <th className="px-8 py-8 text-right text-11 font-semibold uppercase tracking-wider text-adm-muted">Size</th>
                {Array.from({ length: 9 }, (_, i) => (
                  <th key={i} className="px-8 py-8 text-center text-11 font-semibold uppercase tracking-wider text-adm-muted">
                    M{i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((cohort) => (
                <tr key={cohort.cohort} className="border-b border-adm-line last:border-0">
                  <td className="whitespace-nowrap px-8 py-8 font-medium text-adm-ink">{monthLabel(cohort.cohort)}</td>
                  <td className="px-8 py-8 text-right tabular-nums text-adm-ink-2">{cohort.size.toLocaleString()}</td>
                  {cohort.retention.map((value, i) => (
                    <td key={i} className="px-4 py-4 text-center">
                      {value === null ? (
                        <span className="text-adm-muted">·</span>
                      ) : (
                        // Single-hue sequential ramp: light = near zero, dark = high.
                        <span
                          className="inline-block w-full rounded-4 px-6 py-4 tabular-nums"
                          style={{
                            background: `color-mix(in oklab, var(--color-adm-s1) ${Math.round(value * 0.9)}%, transparent)`,
                            color: value > 55 ? '#ffffff' : 'var(--color-adm-ink)',
                          }}
                        >
                          {value}%
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-12 text-adm-muted">
          Month-1 drop is the dominant loss in every cohort — the retention problem is onboarding, not long-term fatigue.
        </p>
      </Panel>

      <Panel title="Revenue by plan" description="Contribution of each tier to total MRR.">
        <div className="flex flex-col gap-8">
          {PLANS.filter((plan) => plan.mrrUsd > 0).map((plan) => {
            const total = PLANS.reduce((sum, p) => sum + p.mrrUsd, 0)
            const share = (plan.mrrUsd / total) * 100
            return (
              <div key={plan.id} className="flex items-center gap-10">
                <span className="w-[104px] shrink-0 text-12 text-adm-ink-2">{plan.name}</span>
                <div className="h-16 flex-1 rounded-4 bg-adm-hover">
                  <div className="h-full rounded-4" style={{ width: `${share}%`, background: 'var(--color-adm-s1)' }} />
                </div>
                <span className="w-[120px] shrink-0 text-right text-12 tabular-nums text-adm-ink">
                  {money(plan.mrrUsd)} · {share.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </Panel>
    </>
  )
}
