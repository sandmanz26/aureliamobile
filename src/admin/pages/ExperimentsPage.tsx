import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard } from '../components/ui'
import type { Experiment } from '../data/commerce'
import { EXPERIMENTS } from '../data/commerce'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

export function ExperimentsPage() {
  const running = EXPERIMENTS.filter((e) => e.status === 'running')
  const conclusive = EXPERIMENTS.filter((e) => e.significance >= 0.95)
  const exposed = EXPERIMENTS.reduce((sum, e) => sum + e.exposed, 0)

  const columns: Column<Experiment>[] = [
    {
      key: 'name',
      header: 'Experiment',
      render: (row) => (
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate font-medium text-adm-ink">{row.name}</p>
          <p className="truncate text-12 text-adm-muted">{row.hypothesis}</p>
        </div>
      ),
    },
    { key: 'surface', header: 'Surface', render: (row) => <Badge tone="info">{row.surface}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'running' ? 'good' : row.status === 'stopped' ? 'critical' : row.status === 'ready' ? 'warning' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'variants', header: 'Arms', numeric: true },
    { key: 'exposed', header: 'Exposed', numeric: true, render: (row) => row.exposed.toLocaleString() },
    { key: 'metric', header: 'Primary metric' },
    {
      key: 'lift',
      header: 'Lift',
      numeric: true,
      render: (row) =>
        row.exposed === 0 ? (
          <span className="text-adm-muted">—</span>
        ) : (
          <span className={`font-medium ${row.lift >= 0 ? 'text-adm-good' : 'text-adm-critical'}`}>
            {row.lift >= 0 ? '+' : ''}{row.lift.toFixed(1)}%
          </span>
        ),
    },
    {
      key: 'significance',
      header: 'Confidence',
      numeric: true,
      render: (row) =>
        row.exposed === 0 ? (
          <span className="text-adm-muted">—</span>
        ) : (
          <span className={row.significance >= 0.95 ? 'font-medium text-adm-ink' : 'text-adm-muted'}>
            {(row.significance * 100).toFixed(0)}%
          </span>
        ),
    },
    { key: 'startedAt', header: 'Started', render: (row) => date(row.startedAt) },
  ]

  return (
    <>
      <PageHeader
        title="Experiments"
        description="A/B tests across onboarding, the cockpit, paywall and notifications. Assignment is server-side, which keeps behavioural experiments off the cookie-consent path."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Running" value={running.length.toString()} />
        <StatCard label="Conclusive (≥95%)" value={conclusive.length.toString()} hint="ready to ship or kill" />
        <StatCard label="Users exposed" value={`${(exposed / 1000).toFixed(1)}k`} />
        <StatCard label="Shipped this quarter" value="4" delta={33.0} />
      </div>

      <Panel
        title="Reading the results"
        description="Only the first and third rows below have crossed the 95% bar. The streak-reminder test has run 34 days at 62% confidence — that is a null result, not a pending one, and should be stopped."
      >
        <DataTable
          rows={EXPERIMENTS}
          columns={columns}
          exportName="aurelia-experiments"
          pageSize={10}
          searchKeys={['name', 'hypothesis', 'surface', 'metric']}
          filters={[
            { key: 'status', label: 'Status', options: ['running', 'ready', 'draft', 'stopped'] },
            { key: 'surface', label: 'Surface', options: [...new Set(EXPERIMENTS.map((e) => e.surface))] },
          ]}
        />
      </Panel>
    </>
  )
}
