import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Button, FormField, PageHeader, StatCard, inputClass, textareaClass } from '../components/ui'
import type { ChallengeRecord } from '../data/challenges'
import {
  CHALLENGE_PHOTOS,
  GRADIENT_PRESETS,
  challengeStatus,
  cloneChallenges,
  emptyChallenge,
  slugify,
  withRewardAt,
} from '../data/challenges'

const STATUS_TONE = { active: 'good', upcoming: 'info', closed: 'neutral' } as const

/** Challenge status is derived (endsInDays / joined), not a stored field —
 *  this adds it onto each row so the table's sort, search and CSV export
 *  all see the same value the Status badge renders instead of falling back
 *  to a raw field underneath it. */
type ChallengeRow = ChallengeRecord & { status: ReturnType<typeof challengeStatus> }

/** The create/edit form. Leaderboard and session links are read-only here —
 *  those are earned by members playing the challenge, not something an
 *  admin writes by hand — but everything an admin actually sets up (the
 *  copy, the pacing, the three reward tiers) is editable. */
function ChallengeForm({
  initial,
  existingSlugs,
  onSave,
  onClose,
}: {
  initial: ChallengeRecord
  existingSlugs: string[]
  onSave: (challenge: ChallengeRecord) => void
  onClose: () => void
}) {
  const isNew = !existingSlugs.includes(initial.slug)
  const [draft, setDraft] = useState<ChallengeRecord>(initial)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (!draft.title.trim()) {
      setError('A challenge needs a title.')
      return
    }
    const slug = isNew ? slugify(draft.title) : draft.slug
    if (isNew && existingSlugs.includes(slug)) {
      setError('A challenge with that title already exists.')
      return
    }
    onSave({ ...draft, slug })
  }

  return (
    <div className="flex flex-col gap-16">
      {error && (
        <p className="rounded-8 bg-adm-critical/10 px-10 py-8 text-12 text-adm-critical">{error}</p>
      )}

      <FormField label="Title">
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="30-Day Nervous System Reset"
          className={inputClass}
        />
      </FormField>

      <FormField label="Summary" hint="One line — shown under the title on Explore and the challenge card.">
        <textarea
          value={draft.summary}
          onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
          placeholder="Slow down and build a calmer daily rhythm."
          className={textareaClass}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-12">
        <FormField label="Cover photo">
          <select
            value={draft.photo}
            onChange={(event) => setDraft({ ...draft, photo: event.target.value as ChallengeRecord['photo'] })}
            className={inputClass}
          >
            {CHALLENGE_PHOTOS.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Gradient (fallback, no network)">
          <select
            value={draft.gradient}
            onChange={(event) => setDraft({ ...draft, gradient: event.target.value })}
            className={inputClass}
          >
            {GRADIENT_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.value}>{preset.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-12">
        <FormField label="Total days">
          <input
            type="number"
            min={1}
            value={draft.totalDays}
            onChange={(event) => setDraft({ ...draft, totalDays: Number(event.target.value) || 0 })}
            className={inputClass}
          />
        </FormField>
        <FormField label="Ends in (days)">
          <input
            type="number"
            min={0}
            value={draft.endsInDays}
            onChange={(event) => setDraft({ ...draft, endsInDays: Number(event.target.value) || 0 })}
            className={inputClass}
          />
        </FormField>
        <FormField label="Minutes / day">
          <input
            type="number"
            min={1}
            value={draft.minutesPerDay}
            onChange={(event) => setDraft({ ...draft, minutesPerDay: Number(event.target.value) || 0 })}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Completion points" hint="Coins awarded for finishing every day — Explore has this hard-coded per challenge.">
        <input
          type="number"
          min={0}
          value={draft.points}
          onChange={(event) => setDraft({ ...draft, points: Number(event.target.value) || 0 })}
          className={inputClass}
        />
      </FormField>

      <div>
        <p className="mb-8 text-12 font-medium text-adm-ink-2">Rewards (top 3)</p>
        <div className="flex flex-col gap-8">
          {draft.rewards.map((reward) => (
            <div key={reward.rank} className="flex items-center gap-8">
              <span className="flex size-28 shrink-0 items-center justify-center rounded-8 bg-adm-hover text-12 font-semibold text-adm-ink">
                #{reward.rank}
              </span>
              <input
                type="number"
                min={0}
                value={reward.coins}
                onChange={(event) =>
                  setDraft({ ...draft, rewards: withRewardAt(draft.rewards, reward.rank, { coins: Number(event.target.value) || 0 }) })
                }
                className={`${inputClass} w-[110px] shrink-0`}
                aria-label={`Rank ${reward.rank} coins`}
              />
              <input
                value={reward.prize}
                onChange={(event) =>
                  setDraft({ ...draft, rewards: withRewardAt(draft.rewards, reward.rank, { prize: event.target.value }) })
                }
                placeholder="Prize description"
                className={inputClass}
                aria-label={`Rank ${reward.rank} prize`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-8 border-t border-adm-line pt-16">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>{isNew ? 'Create challenge' : 'Save changes'}</Button>
      </div>
    </div>
  )
}

function DeleteConfirm({ challenge, onConfirm, onClose }: { challenge: ChallengeRecord; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Delete challenge?" onClose={onClose} width={400}>
      <p className="text-13 text-adm-ink-2">
        <span className="font-medium text-adm-ink">{challenge.title}</span> will be removed from Explore immediately.
        Its leaderboard and the sessions made for it are not deleted, only unlinked from a challenge.
      </p>
      <div className="mt-20 flex justify-end gap-8">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" icon={<Trash2 size={13} />} onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  )
}

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeRecord[]>(cloneChallenges)
  const [editing, setEditing] = useState<ChallengeRecord | null>(null)
  const [deleting, setDeleting] = useState<ChallengeRecord | null>(null)

  function save(challenge: ChallengeRecord) {
    setChallenges((current) => {
      const exists = current.some((item) => item.slug === challenge.slug)
      return exists ? current.map((item) => (item.slug === challenge.slug ? challenge : item)) : [challenge, ...current]
    })
    setEditing(null)
  }

  function remove(slug: string) {
    setChallenges((current) => current.filter((item) => item.slug !== slug))
    setDeleting(null)
  }

  const rows: ChallengeRow[] = challenges.map((challenge) => ({ ...challenge, status: challengeStatus(challenge) }))
  const active = rows.filter((row) => row.status === 'active').length
  const totalJoined = challenges.reduce((sum, c) => sum + (Number(c.joined.replace(/[^0-9.]/g, '')) || 0), 0)

  const columns: Column<ChallengeRow>[] = [
    {
      key: 'title',
      header: 'Challenge',
      render: (row) => (
        <div>
          <p className="font-medium text-adm-ink">{row.title}</p>
          <p className="truncate text-12 text-adm-muted">{row.summary}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
    },
    { key: 'totalDays', header: 'Days', numeric: true, render: (row) => `${row.totalDays}d · ${row.minutesPerDay}m/day` },
    { key: 'endsInDays', header: 'Ends in', numeric: true, render: (row) => (row.endsInDays > 0 ? `${row.endsInDays}d` : '—') },
    { key: 'points', header: 'Points', numeric: true },
    { key: 'joined', header: 'Joined' },
    {
      key: 'leaderboard',
      header: 'Entries',
      numeric: true,
      sortable: false,
      render: (row) => row.leaderboard.length,
    },
    {
      key: 'slug',
      header: '',
      sortable: false,
      render: (row) => (
        <div className="flex justify-end gap-4">
          <Button variant="ghost" size="sm" icon={<Pencil size={12} />} onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} onClick={() => setDeleting(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Challenges"
        description="The community's time-boxed programmes — pacing, rewards and copy. Leaderboards and session entries come from real play and aren't editable here."
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditing(emptyChallenge())}>
            New challenge
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Challenges" value={challenges.length.toString()} />
        <StatCard label="Active now" value={active.toString()} hint={`of ${challenges.length}`} />
        <StatCard label="Total joined" value={totalJoined.toLocaleString()} hint="across all challenges" />
        <StatCard
          label="Reward pool"
          value={challenges.reduce((sum, c) => sum + c.rewards.reduce((s, r) => s + r.coins, 0), 0).toLocaleString()}
          hint="coins, top-3 tiers"
        />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        exportName="aurelia-challenges"
        searchKeys={['title', 'summary']}
        emptyMessage="No challenges yet — create one to populate Explore."
      />

      {editing && (
        <Modal
          title={challenges.some((c) => c.slug === editing.slug) ? 'Edit challenge' : 'New challenge'}
          onClose={() => setEditing(null)}
          width={560}
        >
          <ChallengeForm
            initial={editing}
            existingSlugs={challenges.map((c) => c.slug)}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <DeleteConfirm challenge={deleting} onConfirm={() => remove(deleting.slug)} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}

