import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Button, FormField, PageHeader, StatCard, StatusBadge, inputClass } from '../components/ui'
import { useAdminData } from '../data/AdminDataContext'
import type { AdminUser } from '../data/mock'
import { ROLES } from '../data/mock'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function InviteUserForm({ onInvite, onClose }: { onInvite: (user: AdminUser) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are both required.')
      return
    }
    onInvite({
      id: `usr_${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'pending',
      plan: 'free',
      coins: 0,
      sessionsCreated: 0,
      country: '—',
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-16">
      {error && <p className="rounded-8 bg-adm-critical/10 px-10 py-8 text-12 text-adm-critical">{error}</p>}
      <FormField label="Name">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Lee" className={inputClass} />
      </FormField>
      <FormField label="Email">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jordan.lee@example.com"
          className={inputClass}
        />
      </FormField>
      <FormField label="Role" hint="Sent an invite email with a sign-up link for this role. Staff roles can also view /admin.">
        <select value={role} onChange={(event) => setRole(event.target.value)} className={inputClass}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
          <option value="member">Member</option>
        </select>
      </FormField>
      <div className="mt-4 flex justify-end gap-8 border-t border-adm-line pt-16">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>Send invite</Button>
      </div>
    </div>
  )
}

export function UsersPage() {
  const { users, inviteUser, setUserRole, toggleSuspendUser } = useAdminData()
  const [inviting, setInviting] = useState(false)

  function invite(user: AdminUser) {
    inviteUser(user)
    setInviting(false)
  }

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
            <Link to={`/admin/users/${row.id}`} className="block truncate font-medium text-adm-ink hover:underline">
              {row.name}
            </Link>
            <p className="truncate text-12 text-adm-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <select
          value={row.role}
          onChange={(event) => setUserRole(row.id, event.target.value)}
          className="h-26 rounded-6 border border-adm-line bg-adm-surface px-6 text-11 text-adm-ink outline-none focus:border-adm-accent"
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
          <option value="member">Member</option>
        </select>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'plan', header: 'Plan', render: (row) => <Badge tone={row.plan === 'free' ? 'neutral' : 'good'}>{row.plan}</Badge> },
    { key: 'country', header: 'Country' },
    { key: 'sessionsCreated', header: 'Sessions', numeric: true },
    { key: 'coins', header: 'Coins', numeric: true, render: (row) => row.coins.toLocaleString() },
    { key: 'joinedAt', header: 'Joined', render: (row) => date(row.joinedAt) },
    { key: 'lastActiveAt', header: 'Last active', render: (row) => date(row.lastActiveAt) },
    {
      key: 'id',
      header: '',
      sortable: false,
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => toggleSuspendUser(row.id)}>
            {row.status === 'suspended' ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      ),
    },
  ]

  const active = users.filter((user) => user.status === 'active').length
  const paid = users.filter((user) => user.plan !== 'free').length
  const staff = users.filter((user) => user.role !== 'member').length

  return (
    <>
      <PageHeader
        title="Users"
        description="Every account on the platform, including staff. Role changes and suspensions take effect immediately for this session."
        actions={
          <Button variant="primary" icon={<UserPlus size={14} />} onClick={() => setInviting(true)}>
            Invite user
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Total users" value={users.length.toLocaleString()} delta={6.2} hint="30d" />
        <StatCard label="Active" value={active.toLocaleString()} hint={`${((active / users.length) * 100).toFixed(0)}% of base`} />
        <StatCard label="Paid plans" value={paid.toLocaleString()} delta={3.4} hint={`${((paid / users.length) * 100).toFixed(0)}% conversion`} />
        <StatCard label="Staff accounts" value={staff.toLocaleString()} hint="non-member roles" />
      </div>

      <DataTable
        rows={users}
        columns={columns}
        exportName="aurelia-users"
        searchKeys={['name', 'email', 'country', 'role']}
        filters={[
          { key: 'status', label: 'Status', options: ['active', 'suspended', 'pending'] },
          { key: 'plan', label: 'Plan', options: ['free', 'plus', 'pro'] },
          { key: 'role', label: 'Role', options: [...new Set(users.map((user) => user.role))] },
          { key: 'country', label: 'Country', options: [...new Set(users.map((user) => user.country))].sort() },
        ]}
      />

      {inviting && (
        <Modal title="Invite user" onClose={() => setInviting(false)} width={420}>
          <InviteUserForm onInvite={invite} onClose={() => setInviting(false)} />
        </Modal>
      )}
    </>
  )
}
