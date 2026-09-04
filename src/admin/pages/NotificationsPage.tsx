import { Send } from 'lucide-react'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard } from '../components/ui'
import type { Campaign } from '../data/commerce'
import { CAMPAIGNS, CONSENT } from '../data/commerce'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const pct = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '—')

export function NotificationsPage() {
  const sent = CAMPAIGNS.filter((c) => c.status === 'sent')
  const delivered = sent.reduce((sum, c) => sum + c.delivered, 0)
  const opened = sent.reduce((sum, c) => sum + c.opened, 0)
  const converted = sent.reduce((sum, c) => sum + c.converted, 0)
  const pushConsent = CONSENT.find((c) => c.id === 'marketing_push')

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      header: 'Campaign',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-adm-ink">{row.name}</p>
          <p className="truncate text-12 text-adm-muted">{row.segment}</p>
        </div>
      ),
    },
    { key: 'channel', header: 'Channel', render: (row) => <Badge tone="info">{row.channel}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'sent' ? 'good' : row.status === 'paused' ? 'warning' : 'neutral'}>{row.status}</Badge>
      ),
    },
    {
      key: 'consentGated',
      header: 'Consent',
      render: (row) =>
        row.consentGated ? (
          <Badge tone="neutral">marketing — opt-in</Badge>
        ) : (
          <Badge tone="info">transactional</Badge>
        ),
    },
    { key: 'audience', header: 'Audience', numeric: true, render: (row) => row.audience.toLocaleString() },
    { key: 'delivered', header: 'Delivered', numeric: true, render: (row) => row.delivered.toLocaleString() },
    { key: 'opened', header: 'Open rate', numeric: true, render: (row) => pct(row.opened, row.delivered) },
    { key: 'converted', header: 'Conv. rate', numeric: true, render: (row) => pct(row.converted, row.opened) },
    { key: 'sentAt', header: 'Date', render: (row) => date(row.sentAt) },
  ]

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Push, email and in-app campaigns. Marketing sends are gated on the notification consent flag; transactional sends (payment failures, security) are not."
        actions={
          <button
            type="button"
            className="flex h-34 items-center gap-6 rounded-8 bg-adm-ink px-14 text-13 font-medium text-adm-surface"
          >
            <Send size={14} />
            New campaign
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Delivered (30d)" value={delivered.toLocaleString()} delta={5.7} />
        <StatCard label="Open rate" value={pct(opened, delivered)} delta={2.3} />
        <StatCard label="Conversion" value={pct(converted, opened)} delta={1.4} hint="of opens" />
        <StatCard
          label="Push opt-in"
          value={pushConsent ? `${((pushConsent.optedIn / (pushConsent.optedIn + pushConsent.optedOut)) * 100).toFixed(0)}%` : '—'}
          delta={-2.1}
          hint={`${pushConsent?.withdrawnLast30d.toLocaleString()} withdrew 30d`}
        />
      </div>

      <Panel
        title="Campaigns"
        description="Sending to a marketing segment requires an opt-in on record; the audience figure already excludes opted-out users."
      >
        <DataTable
          rows={CAMPAIGNS}
          columns={columns}
          exportName="aurelia-campaigns"
          pageSize={10}
          searchKeys={['name', 'segment', 'channel']}
          filters={[
            { key: 'channel', label: 'Channel', options: ['push', 'email', 'in-app'] },
            { key: 'status', label: 'Status', options: ['sent', 'scheduled', 'draft', 'paused'] },
          ]}
        />
      </Panel>
    </>
  )
}
