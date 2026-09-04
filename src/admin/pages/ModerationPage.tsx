import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { PageHeader, StatCard, StatusBadge } from '../components/ui'
import type { Report } from '../data/mock'
import { REPORTS } from '../data/mock'

export function ModerationPage() {
  const columns: Column<Report>[] = [
    { key: 'id', header: 'Report', width: '110px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    { key: 'sessionTitle', header: 'Session', render: (row) => <span className="font-medium text-adm-ink">{row.sessionTitle}</span> },
    { key: 'reason', header: 'Reason' },
    { key: 'severity', header: 'Severity', render: (row) => <StatusBadge status={row.severity} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'reportedBy', header: 'Reported by' },
    {
      key: 'slaHoursLeft',
      header: 'SLA',
      numeric: true,
      render: (row) =>
        row.status === 'resolved' || row.status === 'dismissed' ? (
          <span className="text-adm-muted">—</span>
        ) : (
          <span className={row.slaHoursLeft < 0 ? 'font-medium text-adm-critical' : 'text-adm-ink'}>
            {row.slaHoursLeft < 0 ? `${Math.abs(row.slaHoursLeft).toFixed(1)}h over` : `${row.slaHoursLeft.toFixed(1)}h left`}
          </span>
        ),
    },
    { key: 'reportedAt', header: 'Reported', render: (row) => new Date(row.reportedAt).toLocaleDateString('en-GB') },
  ]

  const open = REPORTS.filter((r) => r.status === 'open' || r.status === 'in_review')
  const critical = open.filter((r) => r.severity === 'critical')
  const breached = open.filter((r) => r.slaHoursLeft < 0)

  return (
    <>
      <PageHeader
        title="Moderation"
        description="Reported sessions and community content. Self-harm and crisis reports are routed to the on-call reviewer regardless of queue position."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Open reports" value={open.length.toLocaleString()} delta={-8.2} inverse />
        <StatCard label="Critical" value={critical.length.toLocaleString()} hint="self-harm risk" />
        <StatCard label="SLA breached" value={breached.length.toLocaleString()} hint="past target" />
        <StatCard label="Resolved (30d)" value={REPORTS.filter((r) => r.status === 'resolved').length.toLocaleString()} delta={11.5} />
      </div>

      <DataTable
        rows={REPORTS}
        columns={columns}
        exportName="aurelia-moderation-reports"
        searchKeys={['id', 'sessionTitle', 'reason', 'reportedBy']}
        filters={[
          { key: 'status', label: 'Status', options: ['open', 'in_review', 'resolved', 'dismissed'] },
          { key: 'severity', label: 'Severity', options: ['critical', 'serious', 'warning'] },
          { key: 'reason', label: 'Reason', options: [...new Set(REPORTS.map((r) => r.reason))] },
        ]}
      />
    </>
  )
}
