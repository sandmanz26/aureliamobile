import { UserPlus } from 'lucide-react'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, StatCard, StatusBadge } from '../components/ui'
import type { AdminUser } from '../data/mock'
import { ROLES, USERS } from '../data/mock'

const roleName = (id: string) => ROLES.find((role) => role.id === id)?.name ?? 'Member'
const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function UsersPage() {
  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-10">
          <span
            className="flex size-28 shrink-0 items-center justify-center rounded-full text-11 font-semibold text-adm-ink"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            {row.name.split(' ').map((part) => part[0]).join('')}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-adm-ink">{row.name}</p>
            <p className="truncate text-12 text-adm-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (row) => <Badge tone="info">{roleName(row.role)}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'plan', header: 'Plan', render: (row) => <Badge tone={row.plan === 'free' ? 'neutral' : 'good'}>{row.plan}</Badge> },
    { key: 'country', header: 'Country' },
    { key: 'sessionsCreated', header: 'Sessions', numeric: true },
    { key: 'coins', header: 'Coins', numeric: true, render: (row) => row.coins.toLocaleString() },
    { key: 'joinedAt', header: 'Joined', render: (row) => date(row.joinedAt) },
    { key: 'lastActiveAt', header: 'Last active', render: (row) => date(row.lastActiveAt) },
  ]

  const active = USERS.filter((user) => user.status === 'active').length
  const paid = USERS.filter((user) => user.plan !== 'free').length
  const staff = USERS.filter((user) => user.role !== 'member').length

  return (
    <>
      <PageHeader
        title="Users"
        description="Every account on the platform, including staff. Role changes and suspensions are written to the audit log."
        actions={
          <button
            type="button"
            className="flex h-34 items-center gap-6 rounded-8 bg-adm-ink px-14 text-13 font-medium text-adm-surface"
          >
            <UserPlus size={14} />
            Invite user
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Total users" value={USERS.length.toLocaleString()} delta={6.2} hint="30d" />
        <StatCard label="Active" value={active.toLocaleString()} hint={`${((active / USERS.length) * 100).toFixed(0)}% of base`} />
        <StatCard label="Paid plans" value={paid.toLocaleString()} delta={3.4} hint={`${((paid / USERS.length) * 100).toFixed(0)}% conversion`} />
        <StatCard label="Staff accounts" value={staff.toLocaleString()} hint="non-member roles" />
      </div>

      <DataTable
        rows={USERS}
        columns={columns}
        exportName="aurelia-users"
        searchKeys={['name', 'email', 'country', 'role']}
        filters={[
          { key: 'status', label: 'Status', options: ['active', 'suspended', 'pending'] },
          { key: 'plan', label: 'Plan', options: ['free', 'plus', 'pro'] },
          { key: 'role', label: 'Role', options: [...new Set(USERS.map((user) => user.role))] },
          { key: 'country', label: 'Country', options: [...new Set(USERS.map((user) => user.country))].sort() },
        ]}
      />
    </>
  )
}
