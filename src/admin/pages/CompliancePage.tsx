import { ShieldAlert } from 'lucide-react'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard, StatusBadge } from '../components/ui'
import type { DsarRequest } from '../data/commerce'
import { CONSENT, DSAR, RETENTION_POLICY } from '../data/commerce'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function CompliancePage() {
  const open = DSAR.filter((r) => r.status !== 'completed' && r.status !== 'rejected')
  const overdue = open.filter((r) => r.dueInDays < 0)
  const deletions = DSAR.filter((r) => r.type === 'deletion')
  const specialCategory = CONSENT.filter((c) => c.specialCategory)

  const columns: Column<DsarRequest>[] = [
    { key: 'id', header: 'Request', width: '110px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    {
      key: 'user',
      header: 'Subject',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-adm-ink">{row.user}</p>
          <p className="truncate text-12 text-adm-muted">{row.email}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Right', render: (row) => <Badge tone="info">{row.type}</Badge> },
    { key: 'jurisdiction', header: 'Regime' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'dueInDays',
      header: 'Statutory due',
      numeric: true,
      render: (row) =>
        row.status === 'completed' || row.status === 'rejected' ? (
          <span className="text-adm-muted">—</span>
        ) : (
          <span className={row.dueInDays < 0 ? 'font-medium text-adm-critical' : 'text-adm-ink'}>
            {row.dueInDays < 0 ? `${Math.abs(row.dueInDays)}d overdue` : `${row.dueInDays}d left`}
          </span>
        ),
    },
    { key: 'handledBy', header: 'Owner' },
    { key: 'receivedAt', header: 'Received', render: (row) => date(row.receivedAt) },
  ]

  return (
    <>
      <PageHeader
        title="Compliance & privacy"
        description="Aurelia processes mood, sleep and voice data — special-category personal data under GDPR Art. 9. Each purpose is consented separately and must be revocable, and subject requests carry a statutory clock."
      />

      {overdue.length > 0 && (
        <div className="flex items-start gap-10 rounded-10 border border-adm-critical/40 bg-adm-critical/8 p-14">
          <ShieldAlert size={16} className="mt-1 shrink-0 text-adm-critical" />
          <div>
            <p className="text-13 font-medium text-adm-ink">
              {overdue.length} subject request{overdue.length > 1 ? 's' : ''} past the statutory deadline
            </p>
            <p className="mt-2 text-12 text-adm-ink-2">
              GDPR allows one month to respond, extendable by two for complex requests — but the extension must be
              communicated inside the first month. These are already past due.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Open requests" value={open.length.toString()} hint="DSAR queue" />
        <StatCard label="Overdue" value={overdue.length.toString()} inverse hint="past statutory clock" />
        <StatCard label="Deletion requests" value={deletions.length.toString()} hint="30d" />
        <StatCard
          label="Special-category opt-in"
          value={`${((specialCategory.reduce((s, c) => s + c.optedIn, 0) / specialCategory.reduce((s, c) => s + c.optedIn + c.optedOut, 0)) * 100).toFixed(0)}%`}
          hint="Art. 9 purposes"
        />
      </div>

      <Panel
        title="Data subject requests"
        description="Export, deletion, rectification and restriction requests with their statutory deadlines."
      >
        <DataTable
          rows={DSAR}
          columns={columns}
          exportName="aurelia-dsar-queue"
          searchKeys={['id', 'user', 'email', 'handledBy']}
          filters={[
            { key: 'type', label: 'Right', options: ['export', 'deletion', 'rectification', 'restriction'] },
            { key: 'status', label: 'Status', options: ['new', 'verifying', 'in_progress', 'completed', 'rejected'] },
            { key: 'jurisdiction', label: 'Regime', options: ['GDPR', 'CCPA', 'UK GDPR', 'PDP (ID)'] },
          ]}
        />
      </Panel>

      <Panel
        title="Consent ledger"
        description="Per-purpose consent state across the user base. Withdrawal must be as easy as granting — each row maps to one toggle in the app's privacy settings."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 text-left font-semibold">Purpose</th>
                <th className="px-10 py-8 text-left font-semibold">Lawful basis</th>
                <th className="px-10 py-8 text-right font-semibold">Opted in</th>
                <th className="px-10 py-8 text-right font-semibold">Opted out</th>
                <th className="px-10 py-8 text-right font-semibold">Opt-in rate</th>
                <th className="px-10 py-8 text-right font-semibold">Withdrawn 30d</th>
              </tr>
            </thead>
            <tbody>
              {CONSENT.map((row) => {
                const rate = (row.optedIn / (row.optedIn + row.optedOut)) * 100
                return (
                  <tr key={row.id} className="border-b border-adm-line last:border-0">
                    <td className="px-10 py-10">
                      <p className="text-adm-ink">{row.purpose}</p>
                      {row.specialCategory && (
                        <span className="mt-2 inline-block">
                          <Badge tone="serious">special category</Badge>
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-10 text-adm-ink-2">{row.basis}</td>
                    <td className="px-10 py-10 text-right tabular-nums">{row.optedIn.toLocaleString()}</td>
                    <td className="px-10 py-10 text-right tabular-nums text-adm-muted">{row.optedOut.toLocaleString()}</td>
                    <td className="px-10 py-10 text-right font-medium tabular-nums">{rate.toFixed(0)}%</td>
                    <td className="px-10 py-10 text-right tabular-nums text-adm-ink-2">{row.withdrawnLast30d.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Retention schedule" description="How long each data class is kept, and what happens at the end of the period.">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 text-left font-semibold">Data class</th>
                <th className="px-10 py-8 text-left font-semibold">Retention period</th>
                <th className="px-10 py-8 text-left font-semibold">At end of period</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION_POLICY.map((row) => (
                <tr key={row.data} className="border-b border-adm-line last:border-0">
                  <td className="px-10 py-10 text-adm-ink">{row.data}</td>
                  <td className="px-10 py-10 tabular-nums text-adm-ink-2">{row.period}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{row.afterwards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
