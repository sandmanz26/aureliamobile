import { Check, Minus, Pencil } from 'lucide-react'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard } from '../components/ui'
import type { CoinPack, RegionPrice } from '../data/commerce'
import { COIN_PACKS, PLANS, REGION_PRICING } from '../data/commerce'

const money = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'IDR' || currency === 'JPY' ? 0 : 2 }).format(value)

const ENTITLEMENTS = [
  { key: 'sessionsPerMonth', label: 'Sessions / month' },
  { key: 'aiModel', label: 'Generation model' },
  { key: 'voiceInput', label: 'Voice input' },
  { key: 'communityPublish', label: 'Publish to community' },
  { key: 'offlineDownload', label: 'Offline download' },
  { key: 'prioritySupport', label: 'Priority support' },
] as const

export function PricingPage() {
  const live = PLANS.filter((plan) => plan.status !== 'draft')
  const mrr = PLANS.reduce((sum, plan) => sum + plan.mrrUsd, 0)
  const paid = PLANS.filter((p) => p.id !== 'free').reduce((sum, p) => sum + p.subscribers, 0)
  const total = PLANS.reduce((sum, p) => sum + p.subscribers, 0)
  const iapRevenue = COIN_PACKS.reduce((sum, pack) => sum + pack.priceUsd * pack.soldLast30d, 0)

  const regionColumns: Column<RegionPrice>[] = [
    { key: 'region', header: 'Region', render: (row) => <span className="font-medium text-adm-ink">{row.region}</span> },
    { key: 'currency', header: 'Currency' },
    { key: 'plusMonthly', header: 'Plus / mo', numeric: true, render: (row) => money(row.plusMonthly, row.currency) },
    { key: 'proMonthly', header: 'Pro / mo', numeric: true, render: (row) => money(row.proMonthly, row.currency) },
    {
      key: 'pppAdjusted',
      header: 'PPP',
      render: (row) => (row.pppAdjusted ? <Badge tone="info">adjusted</Badge> : <span className="text-adm-muted">list</span>),
    },
    { key: 'taxMode', header: 'Tax', render: (row) => <Badge tone="neutral">{row.taxMode}</Badge> },
  ]

  const packColumns: Column<CoinPack>[] = [
    { key: 'name', header: 'Pack', render: (row) => <span className="font-medium text-adm-ink">{row.name}</span> },
    { key: 'coins', header: 'Coins', numeric: true, render: (row) => row.coins.toLocaleString() },
    { key: 'priceUsd', header: 'Price', numeric: true, render: (row) => money(row.priceUsd) },
    {
      key: 'id',
      header: 'Per 1k coins',
      numeric: true,
      sortable: false,
      render: (row) => money((row.priceUsd / row.coins) * 1000),
    },
    { key: 'soldLast30d', header: 'Sold (30d)', numeric: true, render: (row) => row.soldLast30d.toLocaleString() },
    {
      key: 'soldLast30d',
      header: 'Revenue (30d)',
      numeric: true,
      sortable: false,
      render: (row) => <span className="font-medium">{money(row.priceUsd * row.soldLast30d)}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        title="Pricing"
        description="Plan catalogue, what each tier entitles a user to, regional price points, and the coin pack in-app purchases."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Subscription MRR" value={money(mrr)} delta={9.6} hint="30d" />
        <StatCard label="Paid subscribers" value={paid.toLocaleString()} delta={7.2} />
        <StatCard label="Paid conversion" value={`${((paid / total) * 100).toFixed(1)}%`} delta={0.8} hint="of all users" />
        <StatCard label="Coin pack revenue" value={money(iapRevenue)} delta={4.3} hint="30d, one-off" />
      </div>

      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-8 rounded-10 border border-adm-line bg-adm-surface p-16">
            <div className="flex items-start justify-between gap-8">
              <div>
                <h3 className="text-15 font-semibold text-adm-ink">{plan.name}</h3>
                <p className="mt-2 text-12 text-adm-ink-2">{plan.tagline}</p>
              </div>
              <Badge tone={plan.status === 'live' ? 'good' : plan.status === 'draft' ? 'neutral' : 'warning'}>
                {plan.status}
              </Badge>
            </div>
            <p className="text-26 font-semibold tabular-nums leading-none text-adm-ink">
              {plan.monthlyUsd === 0 ? 'Free' : money(plan.monthlyUsd)}
              {plan.monthlyUsd > 0 && <span className="text-13 font-normal text-adm-muted"> /mo</span>}
            </p>
            {plan.yearlyUsd > 0 && (
              <p className="text-12 text-adm-muted">
                {money(plan.yearlyUsd)}/yr — saves {Math.round((1 - plan.yearlyUsd / (plan.monthlyUsd * 12)) * 100)}%
              </p>
            )}
            <dl className="mt-auto flex flex-col gap-2 border-t border-adm-line pt-8 text-12">
              <div className="flex justify-between">
                <dt className="text-adm-muted">Subscribers</dt>
                <dd className="tabular-nums text-adm-ink">{plan.subscribers.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-adm-muted">MRR</dt>
                <dd className="tabular-nums text-adm-ink">{money(plan.mrrUsd)}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="flex h-30 items-center justify-center gap-6 rounded-8 border border-adm-line text-12 font-medium text-adm-ink hover:bg-adm-hover"
            >
              <Pencil size={12} />
              Edit plan
            </button>
          </div>
        ))}
      </div>

      <Panel
        title="Entitlement matrix"
        description="What the app enforces per tier. Changing a limit here takes effect at the next entitlement refresh."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line">
                <th className="px-10 py-8 text-left text-11 font-semibold uppercase tracking-wider text-adm-muted">
                  Entitlement
                </th>
                {live.map((plan) => (
                  <th key={plan.id} className="px-10 py-8 text-center text-11 font-semibold uppercase tracking-wider text-adm-muted">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENTITLEMENTS.map((entitlement) => (
                <tr key={entitlement.key} className="border-b border-adm-line last:border-0">
                  <td className="px-10 py-9 text-adm-ink">{entitlement.label}</td>
                  {live.map((plan) => {
                    const value = plan[entitlement.key]
                    return (
                      <td key={plan.id} className="px-10 py-9 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check size={14} className="mx-auto text-adm-good" aria-label="Included" />
                          ) : (
                            <Minus size={14} className="mx-auto text-adm-muted" aria-label="Not included" />
                          )
                        ) : value === null ? (
                          <span className="text-adm-ink">Unlimited</span>
                        ) : typeof value === 'number' ? (
                          <span className="tabular-nums text-adm-ink">{value}</span>
                        ) : (
                          <code className="text-11 text-adm-ink-2">{String(value)}</code>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Regional pricing"
        description="Purchasing-power-adjusted price points. PPP markets are where the pricing experiment is currently running."
      >
        <DataTable rows={REGION_PRICING} columns={regionColumns} exportName="aurelia-regional-pricing" pageSize={10} />
      </Panel>

      <Panel title="Coin packs" description="One-off in-app purchases. Coins are also earned; see Coins & rewards for the ledger.">
        <DataTable rows={COIN_PACKS} columns={packColumns} exportName="aurelia-coin-packs" pageSize={10} />
      </Panel>
    </>
  )
}
