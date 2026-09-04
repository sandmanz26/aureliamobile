import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, StatCard } from '../components/ui'
import type { CoinTx } from '../data/mock'
import { COIN_TX, USERS } from '../data/mock'

export function CoinsPage() {
  const columns: Column<CoinTx>[] = [
    { key: 'id', header: 'Tx', width: '100px', render: (row) => <code className="text-12 text-adm-ink-2">{row.id}</code> },
    { key: 'user', header: 'User' },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge tone={row.type === 'spend' ? 'warning' : row.type === 'grant' ? 'info' : 'good'}>{row.type}</Badge>
      ),
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      render: (row) => (
        <span className={`font-medium ${row.amount < 0 ? 'text-adm-critical' : 'text-adm-good'}`}>
          {row.amount > 0 ? '+' : ''}{row.amount.toLocaleString()}
        </span>
      ),
    },
    { key: 'balanceAfter', header: 'Balance', numeric: true, render: (row) => row.balanceAfter.toLocaleString() },
    { key: 'at', header: 'When', render: (row) => new Date(row.at).toLocaleDateString('en-GB') },
  ]

  const circulating = USERS.reduce((sum, user) => sum + user.coins, 0)
  const earned = COIN_TX.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)
  const spent = Math.abs(COIN_TX.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0))

  return (
    <>
      <PageHeader
        title="Coins & rewards"
        description="The in-app economy ledger. Manual grants require the coins.adjust permission and are always audited."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Coins circulating" value={circulating.toLocaleString()} delta={4.8} hint="30d" />
        <StatCard label="Earned (30d)" value={earned.toLocaleString()} delta={7.1} />
        <StatCard label="Spent (30d)" value={spent.toLocaleString()} delta={12.9} />
        <StatCard
          label="Redemption rate"
          value={`${((spent / earned) * 100).toFixed(0)}%`}
          hint="spent ÷ earned"
        />
      </div>

      <DataTable
        rows={COIN_TX}
        columns={columns}
        exportName="aurelia-coin-ledger"
        searchKeys={['id', 'user', 'reason', 'type']}
        filters={[
          { key: 'type', label: 'Type', options: ['earn', 'spend', 'grant', 'refund'] },
          { key: 'reason', label: 'Reason', options: [...new Set(COIN_TX.map((tx) => tx.reason))] },
        ]}
      />
    </>
  )
}
