import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, StatCard, StatusBadge } from '../components/ui'
import type { ContentSession } from '../data/mock'
import { SESSIONS } from '../data/mock'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function SessionsPage() {
  const columns: Column<ContentSession>[] = [
    { key: 'title', header: 'Session', render: (row) => <span className="font-medium text-adm-ink">{row.title}</span> },
    { key: 'author', header: 'Author' },
    { key: 'type', header: 'Type', render: (row) => <Badge tone="info">{row.type}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'durationMin', header: 'Length', numeric: true, render: (row) => `${row.durationMin}m` },
    { key: 'plays', header: 'Plays', numeric: true, render: (row) => row.plays.toLocaleString() },
    { key: 'recreations', header: 'Recreates', numeric: true, render: (row) => row.recreations.toLocaleString() },
    {
      key: 'moodDelta',
      header: 'Mood Δ',
      numeric: true,
      render: (row) => (
        <span className={row.moodDelta >= 0 ? 'text-adm-good' : 'text-adm-critical'}>
          {row.moodDelta >= 0 ? '+' : ''}{row.moodDelta.toFixed(1)}%
        </span>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (row) => date(row.createdAt) },
  ]

  const published = SESSIONS.filter((s) => s.status === 'published')
  const plays = SESSIONS.reduce((sum, s) => sum + s.plays, 0)
  const avgMood = SESSIONS.reduce((sum, s) => sum + s.moodDelta, 0) / SESSIONS.length

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Every generated session on the platform. Unpublishing removes it from Explore and the community feed but keeps it in the author's library."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Total sessions" value={SESSIONS.length.toLocaleString()} delta={14.7} hint="30d" />
        <StatCard label="Published" value={published.length.toLocaleString()} hint={`${((published.length / SESSIONS.length) * 100).toFixed(0)}% of catalogue`} />
        <StatCard label="Total plays" value={`${(plays / 1000).toFixed(1)}k`} delta={9.3} hint="30d" />
        <StatCard label="Avg mood Δ" value={`${avgMood >= 0 ? '+' : ''}${avgMood.toFixed(1)}%`} hint="self-reported" />
      </div>

      <DataTable
        rows={SESSIONS}
        columns={columns}
        exportName="aurelia-sessions"
        searchKeys={['title', 'author', 'type']}
        filters={[
          { key: 'status', label: 'Status', options: ['published', 'draft', 'under_review', 'removed'] },
          { key: 'type', label: 'Type', options: ['Meditation', 'Soundscape', 'Breathwork', 'Affirmation'] },
        ]}
      />
    </>
  )
}
