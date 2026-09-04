import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, StatCard, StatusBadge } from '../components/ui'
import type { AuditEntry } from '../data/mock'
import { AUDIT_LOG, ROLES } from '../data/mock'

const roleName = (id: string) => ROLES.find((role) => role.id === id)?.name ?? id

export function AuditPage() {
  const columns: Column<AuditEntry>[] = [
    {
      key: 'at',
      header: 'Timestamp',
      width: '170px',
      render: (row) => (
        <span className="whitespace-nowrap tabular-nums text-adm-ink-2">
          {new Date(row.at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' })}
        </span>
      ),
    },
    { key: 'actor', header: 'Actor', render: (row) => <span className="font-medium text-adm-ink">{row.actor}</span> },
    { key: 'actorRole', header: 'Role', render: (row) => <Badge tone="info">{roleName(row.actorRole)}</Badge> },
    { key: 'action', header: 'Action', render: (row) => <code className="text-12 text-adm-ink">{row.action}</code> },
    { key: 'target', header: 'Target', render: (row) => <code className="text-12 text-adm-ink-2">{row.target}</code> },
    { key: 'ip', header: 'IP', render: (row) => <code className="text-12 text-adm-muted">{row.ip}</code> },
    { key: 'result', header: 'Result', render: (row) => <StatusBadge status={row.result} /> },
  ]

  const denied = AUDIT_LOG.filter((entry) => entry.result === 'denied')
  const actors = new Set(AUDIT_LOG.map((entry) => entry.actor)).size
  const today = AUDIT_LOG.filter((entry) => Date.now() - new Date(entry.at).getTime() < 86400000 * 2)

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Immutable history of every privileged action. Entries are append-only and cannot be edited or deleted from this panel — export for long-term retention."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Entries (30d)" value={AUDIT_LOG.length.toLocaleString()} />
        <StatCard label="Last 48h" value={today.length.toLocaleString()} />
        <StatCard label="Denied attempts" value={denied.length.toLocaleString()} hint="failed auth or permission" />
        <StatCard label="Distinct actors" value={actors.toLocaleString()} />
      </div>

      <DataTable
        rows={AUDIT_LOG}
        columns={columns}
        exportName="aurelia-audit-log"
        pageSize={15}
        searchKeys={['actor', 'action', 'target', 'ip']}
        filters={[
          { key: 'action', label: 'Action', options: [...new Set(AUDIT_LOG.map((e) => e.action))].sort() },
          { key: 'actorRole', label: 'Role', options: [...new Set(AUDIT_LOG.map((e) => e.actorRole))] },
          { key: 'result', label: 'Result', options: ['success', 'denied'] },
        ]}
      />
    </>
  )
}
