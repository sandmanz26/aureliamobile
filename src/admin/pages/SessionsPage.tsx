import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Modal } from '../components/Modal'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Button, FormField, PageHeader, StatCard, StatusBadge, inputClass } from '../components/ui'
import { useAdminData } from '../data/AdminDataContext'
import type { ContentSession } from '../data/mock'

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_OPTIONS: ContentSession['status'][] = ['published', 'draft', 'under_review', 'removed']
const TYPE_OPTIONS: ContentSession['type'][] = ['Meditation', 'Soundscape', 'Breathwork', 'Affirmation']

/** The edit sheet a row's "Edit" action opens — title, type, length and the
 *  status that actually governs where the session shows up. Plays,
 *  recreations and mood delta are measured, not set, so they stay read-only
 *  display here rather than fields a person could silently rewrite. */
function EditSessionForm({
  session,
  onSave,
  onClose,
}: {
  session: ContentSession
  onSave: (session: ContentSession) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(session)

  return (
    <div className="flex flex-col gap-16">
      <FormField label="Title">
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          className={inputClass}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-12">
        <FormField label="Type">
          <select
            value={draft.type}
            onChange={(event) => setDraft({ ...draft, type: event.target.value as ContentSession['type'] })}
            className={inputClass}
          >
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Length (minutes)">
          <input
            type="number"
            min={1}
            value={draft.durationMin}
            onChange={(event) => setDraft({ ...draft, durationMin: Number(event.target.value) || 0 })}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField
        label="Status"
        hint="Unpublishing removes it from Explore and the community feed but keeps it in the author's library."
      >
        <select
          value={draft.status}
          onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentSession['status'] })}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status.replace('_', ' ')}</option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-3 gap-12 rounded-8 bg-adm-hover px-12 py-10 text-12 text-adm-ink-2">
        <span>Plays<br /><span className="tabular-nums text-adm-ink">{draft.plays.toLocaleString()}</span></span>
        <span>Recreates<br /><span className="tabular-nums text-adm-ink">{draft.recreations.toLocaleString()}</span></span>
        <span>Mood Δ<br /><span className="tabular-nums text-adm-ink">{draft.moodDelta >= 0 ? '+' : ''}{draft.moodDelta.toFixed(1)}%</span></span>
      </div>

      <div className="mt-4 flex justify-end gap-8 border-t border-adm-line pt-16">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(draft)}>Save changes</Button>
      </div>
    </div>
  )
}

export function SessionsPage() {
  const { sessions, saveSession, toggleSessionStatus } = useAdminData()
  const [editing, setEditing] = useState<ContentSession | null>(null)

  function save(updated: ContentSession) {
    saveSession(updated)
    setEditing(null)
  }

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
    {
      key: 'id',
      header: '',
      sortable: false,
      render: (row) => (
        <div className="flex justify-end gap-4">
          {(row.status === 'published' || row.status === 'draft') && (
            <Button variant="ghost" size="sm" onClick={() => toggleSessionStatus(row.id)}>
              {row.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={<Pencil size={12} />} onClick={() => setEditing(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  const published = sessions.filter((s) => s.status === 'published')
  const plays = sessions.reduce((sum, s) => sum + s.plays, 0)
  const avgMood = sessions.reduce((sum, s) => sum + s.moodDelta, 0) / sessions.length

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Every generated session on the platform. Unpublishing removes it from Explore and the community feed but keeps it in the author's library."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Total sessions" value={sessions.length.toLocaleString()} delta={14.7} hint="30d" />
        <StatCard label="Published" value={published.length.toLocaleString()} hint={`${((published.length / sessions.length) * 100).toFixed(0)}% of catalogue`} />
        <StatCard label="Total plays" value={`${(plays / 1000).toFixed(1)}k`} delta={9.3} hint="30d" />
        <StatCard label="Avg mood Δ" value={`${avgMood >= 0 ? '+' : ''}${avgMood.toFixed(1)}%`} hint="self-reported" />
      </div>

      <DataTable
        rows={sessions}
        columns={columns}
        exportName="aurelia-sessions"
        searchKeys={['title', 'author', 'type']}
        filters={[
          { key: 'status', label: 'Status', options: ['published', 'draft', 'under_review', 'removed'] },
          { key: 'type', label: 'Type', options: ['Meditation', 'Soundscape', 'Breathwork', 'Affirmation'] },
        ]}
      />

      {editing && (
        <Modal title="Edit session" description={editing.title} onClose={() => setEditing(null)} width={480}>
          <EditSessionForm session={editing} onSave={save} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  )
}
