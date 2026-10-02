import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminUser, ContentSession } from './mock'
import { SESSIONS, USERS } from './mock'
import type { ChallengeRecord } from './challenges'
import { cloneChallenges } from './challenges'

/**
 * The one place admin pages read and write Users, Sessions and Challenges —
 * so a role change on Users shows up the moment you open that user's detail
 * page, and a session edited from Sessions is the same session a Challenge
 * links to. Before this, each page held its own `useState` copy of the same
 * mock array, which meant an edit in one tab of the admin was invisible from
 * any other screen reading the "same" data.
 *
 * It is also the seam a real backend plugs into. Every mutation here is
 * already an isolated, named function (`setUserRole`, `toggleSuspendUser`,
 * `saveSession`, …) rather than an inline `setState` scattered through a
 * page's JSX — the day there is a server, each of these becomes a function
 * that calls an API and updates state from the response (optimistically or
 * after it resolves), and nothing that calls them has to change. Read-only
 * data that nothing in the admin mutates yet (Audit log, Coin ledger) stays a
 * plain import from `./mock` — there is no local-state seam to build for a
 * list nothing writes to.
 */
interface AdminDataContextValue {
  users: AdminUser[]
  inviteUser: (user: AdminUser) => void
  setUserRole: (id: string, role: string) => void
  toggleSuspendUser: (id: string) => void

  sessions: ContentSession[]
  saveSession: (session: ContentSession) => void
  toggleSessionStatus: (id: string) => void

  challenges: ChallengeRecord[]
  saveChallenge: (challenge: ChallengeRecord) => void
  deleteChallenge: (slug: string) => void
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(USERS)
  const [sessions, setSessions] = useState<ContentSession[]>(SESSIONS)
  const [challenges, setChallenges] = useState<ChallengeRecord[]>(cloneChallenges)

  const value = useMemo<AdminDataContextValue>(
    () => ({
      users,
      inviteUser: (user) => setUsers((current) => [user, ...current]),
      setUserRole: (id, role) =>
        setUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user))),
      toggleSuspendUser: (id) =>
        setUsers((current) =>
          current.map((user) =>
            user.id === id ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' } : user,
          ),
        ),

      sessions,
      saveSession: (session) =>
        setSessions((current) => current.map((row) => (row.id === session.id ? session : row))),
      toggleSessionStatus: (id) =>
        setSessions((current) =>
          current.map((row) =>
            row.id === id ? { ...row, status: row.status === 'published' ? 'draft' : 'published' } : row,
          ),
        ),

      challenges,
      saveChallenge: (challenge) =>
        setChallenges((current) => {
          const exists = current.some((item) => item.slug === challenge.slug)
          return exists
            ? current.map((item) => (item.slug === challenge.slug ? challenge : item))
            : [challenge, ...current]
        }),
      deleteChallenge: (slug) => setChallenges((current) => current.filter((item) => item.slug !== slug)),
    }),
    [users, sessions, challenges],
  )

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider')
  return context
}
