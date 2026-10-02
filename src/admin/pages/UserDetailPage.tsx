import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge, Panel, StatCard, StatusBadge } from '../components/ui'
import { useAdminData } from '../data/AdminDataContext'
import { AUDIT_LOG, COIN_TX, ROLES } from '../data/mock'

const roleName = (id: string) => ROLES.find((role) => role.id === id)?.name ?? 'Member'
const dateTime = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/**
 * One account's own view — "did we actually model this user, or just a row
 * in a table?" Everything here is filtered from the same datasets Sessions,
 * Coins and Audit already show, by `authorId` / `userId` / `actorId` rather
 * than by matching names, so it reads as this specific account's own history
 * rather than whatever else happens to share a name. The same pattern the
 * consumer app's own /profile/:person already uses for a creator.
 */
function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('')
}

export function UserDetailPage() {
  const { id } = useParams()
  const { users, sessions: allSessions } = useAdminData()
  const user = users.find((u) => u.id === id)
  if (!user) return <Navigate to="/admin/users" replace />

  const sessions = allSessions.filter((session) => session.authorId === user.id)
  const coinTx = COIN_TX.filter((tx) => tx.userId === user.id)
  const auditEntries = AUDIT_LOG.filter((entry) => entry.actorId === user.id || entry.target === user.id)

  return (
    <>
      <div className="flex items-center gap-12 border-b border-adm-line pb-16">
        <Link
          to="/admin/users"
          aria-label="Back to users"
          className="flex size-32 shrink-0 items-center justify-center rounded-8 border border-adm-line text-adm-ink-2 hover:bg-adm-hover"
        >
          <ArrowLeft size={16} />
        </Link>
        <span
          className="flex size-44 shrink-0 items-center justify-center rounded-full text-15 font-semibold text-adm-ink"
          style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-8">
            <h1 className="text-19 font-semibold text-adm-ink">{user.name}</h1>
            <Badge tone="info">{roleName(user.role)}</Badge>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-2 text-13 text-adm-ink-2">{user.email} · {user.country} · joined {date(user.joinedAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Plan" value={user.plan} />
        <StatCard label="Coins" value={user.coins.toLocaleString()} />
        <StatCard label="Sessions created" value={sessions.length.toString()} />
        <StatCard label="Last active" value={date(user.lastActiveAt)} />
      </div>

      <Panel title="Sessions created" description="Everything in the catalogue authored by this account.">
        {sessions.length ? (
          <div className="flex flex-col divide-y divide-adm-line">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-12 py-10">
                <div className="min-w-0">
                  <p className="truncate text-13 font-medium text-adm-ink">{session.title}</p>
                  <p className="text-12 text-adm-muted">{session.type} · {session.durationMin}m · {date(session.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-12">
                  <span className="text-12 tabular-nums text-adm-ink-2">{session.plays.toLocaleString()} plays</span>
                  <StatusBadge status={session.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-13 text-adm-muted">No sessions created yet.</p>
        )}
      </Panel>

      <Panel title="Coin activity" description="Earnings, spends and grants posted to this account.">
        {coinTx.length ? (
          <div className="flex flex-col divide-y divide-adm-line">
            {coinTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-12 py-10">
                <div className="min-w-0">
                  <p className="text-13 font-medium text-adm-ink">{tx.reason}</p>
                  <p className="text-12 text-adm-muted">{dateTime(tx.at)} · balance after: {tx.balanceAfter.toLocaleString()}</p>
                </div>
                <span className={`shrink-0 text-13 font-medium tabular-nums ${tx.amount >= 0 ? 'text-adm-good' : 'text-adm-critical'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-13 text-adm-muted">No coin activity yet.</p>
        )}
      </Panel>

      <Panel title="Audit history" description="Privileged actions this account took, and actions taken on it.">
        {auditEntries.length ? (
          <div className="flex flex-col divide-y divide-adm-line">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-12 py-10">
                <div className="min-w-0">
                  <code className="text-12 text-adm-ink">{entry.action}</code>
                  <p className="text-12 text-adm-muted">
                    {entry.actorId === user.id ? 'by this account' : 'about this account'} · {dateTime(entry.at)}
                  </p>
                </div>
                <StatusBadge status={entry.result} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-13 text-adm-muted">No audit entries for this account yet.</p>
        )}
      </Panel>
    </>
  )
}
