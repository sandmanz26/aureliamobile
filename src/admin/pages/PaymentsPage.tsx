import { RotateCcw } from 'lucide-react'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard, StatusBadge } from '../components/ui'
import type { DunningItem, Payment } from '../data/commerce'
import { DUNNING, PAYMENTS } from '../data/commerce'

const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function PaymentsPage() {
  const succeeded = PAYMENTS.filter((p) => p.status === 'succeeded')
  const failed = PAYMENTS.filter((p) => p.status === 'failed')
  const refunded = PAYMENTS.filter((p) => p.status === 'refunded')
  const disputed = PAYMENTS.filter((p) => p.status === 'disputed')

  const gross = succeeded.reduce((sum, p) => sum + p.gross, 0)
  const fees = succeeded.reduce((sum, p) => sum + p.fee, 0)
  const refundedTotal = refunded.reduce((sum, p) => sum + p.gross, 0)
  const net = gross - fees - refundedTotal
  const attempted = succeeded.length + failed.length
  const recovered = DUNNING.filter((d) => d.outcome === 'recovered')
  const settled = DUNNING.filter((d) => d.outcome !== 'retrying')

  const columns: Column<Payment>[] = [
    { key: 'id', header: 'Payment', width: '120px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-adm-ink">{row.customer}</p>
          <p className="truncate text-12 text-adm-muted">{row.email}</p>
        </div>
      ),
    },
    { key: 'description', header: 'Description' },
    { key: 'gross', header: 'Gross', numeric: true, render: (row) => money(row.gross) },
    { key: 'fee', header: 'Fee', numeric: true, render: (row) => (row.fee ? `−${money(row.fee)}` : '—') },
    {
      key: 'net',
      header: 'Net',
      numeric: true,
      render: (row) => (
        <span className={`font-medium ${row.net < 0 ? 'text-adm-critical' : row.net === 0 ? 'text-adm-muted' : ''}`}>
          {row.net === 0 ? '—' : money(row.net)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (row) => (
        <span className="whitespace-nowrap text-adm-ink-2">
          {row.method.replace('_', ' ')}
          {row.brand !== '—' && <span className="text-adm-muted"> · {row.brand}</span>}
        </span>
      ),
    },
    { key: 'country', header: 'Country' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-col gap-2">
          <StatusBadge status={row.status} />
          {row.failureReason && <code className="text-11 text-adm-muted">{row.failureReason}</code>}
        </div>
      ),
    },
    { key: 'at', header: 'Date', render: (row) => date(row.at) },
  ]

  const dunningColumns: Column<DunningItem>[] = [
    { key: 'customer', header: 'Customer', render: (row) => <span className="font-medium text-adm-ink">{row.customer}</span> },
    { key: 'plan', header: 'Plan' },
    { key: 'amount', header: 'Amount', numeric: true, render: (row) => money(row.amount) },
    { key: 'reason', header: 'Failure', render: (row) => <code className="text-12 text-adm-ink-2">{row.reason}</code> },
    {
      key: 'attempt',
      header: 'Retry',
      numeric: true,
      render: (row) => (
        <span className="tabular-nums">
          {row.attempt}/{row.maxAttempts}
        </span>
      ),
    },
    { key: 'channel', header: 'Outreach', render: (row) => <Badge tone="info">{row.channel}</Badge> },
    { key: 'gracePeriodEndsAt', header: 'Grace ends', render: (row) => date(row.gracePeriodEndsAt) },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (row) => (
        <Badge tone={row.outcome === 'recovered' ? 'good' : row.outcome === 'lapsed' ? 'critical' : 'warning'}>
          {row.outcome}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every charge, refund and dispute, plus the dunning queue that recovers failed cards before they become churn."
        actions={
          <button
            type="button"
            className="flex h-34 items-center gap-6 rounded-8 border border-adm-line px-14 text-13 font-medium text-adm-ink hover:bg-adm-hover"
          >
            <RotateCcw size={14} />
            Sync with gateway
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Gross (30d)" value={money(gross)} delta={9.1} />
        <StatCard label="Net (30d)" value={money(net)} delta={8.4} hint="after fees & refunds" />
        <StatCard label="Processing fees" value={money(fees)} delta={9.0} inverse hint="≈2.9% + $0.30" />
        <StatCard
          label="Payment success"
          value={`${((succeeded.length / attempted) * 100).toFixed(1)}%`}
          delta={-1.2}
          hint={`${failed.length} failed`}
        />
        <StatCard label="Refunded" value={money(refundedTotal)} delta={2.6} inverse hint={`${refunded.length} refunds`} />
        <StatCard label="Disputes" value={disputed.length.toString()} inverse hint="chargebacks open" />
      </div>

      <Panel
        title="Dunning queue"
        description="Failed recurring charges under automated retry. Involuntary churn is typically 20–40% of all subscription churn, and most of it is recoverable."
        actions={
          <div className="flex items-center gap-14 text-12">
            <span className="text-adm-muted">
              Recovery rate{' '}
              <span className="font-medium tabular-nums text-adm-good">
                {settled.length ? ((recovered.length / settled.length) * 100).toFixed(0) : 0}%
              </span>
            </span>
            <span className="text-adm-muted">
              Recovered{' '}
              <span className="font-medium tabular-nums text-adm-ink">
                {money(recovered.reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </span>
          </div>
        }
      >
        <DataTable
          rows={DUNNING}
          columns={dunningColumns}
          exportName="aurelia-dunning-queue"
          pageSize={8}
          searchKeys={['customer', 'plan', 'reason']}
          filters={[
            { key: 'outcome', label: 'Outcome', options: ['retrying', 'recovered', 'lapsed'] },
            { key: 'reason', label: 'Failure', options: [...new Set(DUNNING.map((d) => d.reason))] },
          ]}
        />
      </Panel>

      <Panel title="Transactions" description="All payment attempts across subscriptions and coin packs.">
        <DataTable
          rows={PAYMENTS}
          columns={columns}
          exportName="aurelia-payments"
          pageSize={12}
          searchKeys={['id', 'customer', 'email', 'description', 'country']}
          filters={[
            { key: 'status', label: 'Status', options: ['succeeded', 'failed', 'refunded', 'pending', 'disputed'] },
            { key: 'method', label: 'Method', options: ['card', 'apple_pay', 'google_pay', 'paypal'] },
            { key: 'plan', label: 'Product', options: [...new Set(PAYMENTS.map((p) => p.plan))] },
            { key: 'country', label: 'Country', options: [...new Set(PAYMENTS.map((p) => p.country))].sort() },
          ]}
        />
      </Panel>
    </>
  )
}
