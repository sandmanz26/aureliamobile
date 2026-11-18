import { Download, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { Badge, Button, FormField, PageHeader, Panel, inputClass, textareaClass, type Tone } from '../components/ui'
import {
  INITIAL_TAGS,
  JourneyTagsSchema,
  STATUS_LABEL,
  TAGS_STORAGE_KEY,
  coverage,
  labelOf,
  missingGroups,
  removeGroup,
  saveGroup,
  setAssignment,
  slug,
  taggedMoments,
  toggleTag,
  type Assignment,
  type JourneyTags,
  type ReviewStatus,
  type TagGroup,
  type TaggedMoment,
} from '../data/journeyTags'
import { INITIAL_JOURNEY, JourneyMapSchema, STORAGE_KEY as JOURNEY_KEY } from '../data/userJourney'
import { readJson, writeJson } from '../../lib/storage'

type View = 'moments' | 'coverage' | 'taxonomy'

const STATUS_TONE: Record<ReviewStatus, Tone> = { proposed: 'neutral', agreed: 'good', discuss: 'warning' }

/**
 * Journey tags (U089): one classification for every moment in the user
 * journey map. The moments come from Product → User journey, so a moment
 * added there appears here untagged. The groups and the first tagging are a
 * product proposal; each moment carries a review status and a note so the
 * team can agree or question it.
 */
export function JourneyTagsPage() {
  const journey = useMemo(() => readJson(JOURNEY_KEY, JourneyMapSchema, INITIAL_JOURNEY), [])
  const [data, setData] = useState<JourneyTags>(() => readJson(TAGS_STORAGE_KEY, JourneyTagsSchema, INITIAL_TAGS))
  const [view, setView] = useState<View>('moments')
  const [stage, setStage] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<TaggedMoment | null>(null)
  const [editingGroup, setEditingGroup] = useState<TagGroup | 'new' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(t)
  }, [notice])

  function commit(next: JourneyTags, message = 'Saved in this browser') {
    setData(next)
    setNotice(writeJson(TAGS_STORAGE_KEY, next) ? message : 'Browser storage is full.')
  }

  const moments = useMemo(() => taggedMoments(journey, data), [journey, data])
  const shown = moments.filter(
    (m) => (!stage || m.stageId === stage) && (!tagFilter || m.assignment.tags.includes(tagFilter)) && (!status || m.assignment.status === status),
  )
  const complete = moments.filter((m) => missingGroups(data.groups, m.assignment.tags).length === 0).length
  const agreed = moments.filter((m) => m.assignment.status === 'agreed').length
  const discuss = moments.filter((m) => m.assignment.status === 'discuss').length

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'aurelia-journey-tags.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Exported aurelia-journey-tags.json')
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JourneyTagsSchema.safeParse(JSON.parse(await file.text()))
      if (parsed.success) commit(parsed.data, 'Imported')
      else setNotice('That file is not a journey tags export.')
    } catch {
      setNotice('That file is not a journey tags export.')
    }
  }

  const segment = (id: View, label: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={view === id}
      onClick={() => setView(id)}
      className={`rounded-8 px-12 py-6 text-12 font-medium ${view === id ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Journey tags"
        description="One classification for every moment in the user journey: when it happens, where, what triggers it, what the person needs, how they feel, how much time they have, which part of Aurelia serves it, and how much of that exists today. The first tagging is a proposal for review."
        actions={
          <div className="flex flex-wrap gap-8">
            <Button size="sm" icon={<Upload size={13} />} onClick={() => importInput.current?.click()}>
              Import
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={exportJson}>
              Export
            </Button>
            <Button
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={() => {
                if (window.confirm('Restore the proposed tags? Your changes in this browser will be lost.')) commit(INITIAL_TAGS, 'Restored the proposal')
              }}
            >
              Restore proposal
            </Button>
            <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={importJson} />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Chip value={moments.length} label="moments" />
        <Chip value={data.groups.length} label="tag groups" />
        <Chip value={complete} label="fully tagged" />
        <Chip value={agreed} label="agreed" />
        <Chip value={discuss} label="need discussion" />
        <span className="text-adm-muted">
          Moments come from <Link to="/admin/user-journey" className="underline hover:text-adm-ink">User journey</Link>. Edits are saved in this browser.
        </span>
      </div>

      <div className="flex flex-wrap gap-4 self-start rounded-12 border border-adm-line bg-adm-surface p-6" role="group" aria-label="View">
        {segment('moments', 'Tagged moments')}
        {segment('coverage', 'Coverage')}
        {segment('taxonomy', 'Taxonomy')}
      </div>

      {view === 'moments' && (
        <Panel
          title="Tagged moments"
          description="Select a moment to change its tags, its review status or the note."
          actions={
            <div className="flex flex-wrap gap-8">
              <select aria-label="Stage" className={`${inputClass} h-30 w-auto! text-12`} value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="">All stages</option>
                {journey.stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <select aria-label="Tag" className={`${inputClass} h-30 w-auto! text-12`} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="">Any tag</option>
                {data.groups.map((grp) => (
                  <optgroup key={grp.id} label={grp.name}>
                    {grp.tags.map((t) => (
                      <option key={t.id} value={`${grp.id}:${t.id}`}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <select aria-label="Review status" className={`${inputClass} h-30 w-auto! text-12`} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Any status</option>
                {(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-12">
              <thead>
                <tr className="border-b border-adm-line text-11 uppercase tracking-wider text-adm-muted">
                  <th className="py-8 pr-12 font-medium">Moment</th>
                  {data.groups.map((grp) => (
                    <th key={grp.id} className="px-8 py-8 font-medium">
                      {grp.name}
                    </th>
                  ))}
                  <th className="px-8 py-8 font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.id} onClick={() => setEditing(m)} className="cursor-pointer border-b border-adm-line align-top last:border-b-0 hover:bg-adm-hover">
                    <td className="py-10 pr-12">
                      <button type="button" className="flex items-center gap-10 text-left" onClick={() => setEditing(m)}>
                        {m.image ? <img src={m.image} alt="" className="size-40 shrink-0 rounded-8 object-cover" /> : <span className="size-40 shrink-0 rounded-8 bg-adm-hover" />}
                        <span className="flex flex-col gap-2">
                          <span className="font-semibold text-adm-ink">{m.title}</span>
                          <span className="inline-flex items-center gap-4 text-11 text-adm-muted">
                            <span className="size-6 rounded-full" style={{ background: m.stageColor }} aria-hidden="true" />
                            {m.stageTitle}
                          </span>
                        </span>
                      </button>
                    </td>
                    {data.groups.map((grp) => {
                      const own = m.assignment.tags.filter((t) => t.startsWith(`${grp.id}:`))
                      return (
                        <td key={grp.id} className="px-8 py-10">
                          {own.length ? (
                            <span className="flex flex-wrap gap-4">
                              {own.map((t) => (
                                <span key={t} className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink">
                                  {labelOf(data.groups, t)}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-11 text-adm-critical">Not tagged</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-8 py-10">
                      <Badge tone={STATUS_TONE[m.assignment.status]}>{STATUS_LABEL[m.assignment.status]}</Badge>
                      {m.assignment.note && <p className="mt-4 max-w-[180px] text-11 text-adm-muted">{m.assignment.note}</p>}
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={data.groups.length + 2} className="py-24 text-center text-adm-muted">
                      No moment matches these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {view === 'coverage' && (
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {data.groups.map((grp) => {
            const rows = coverage(grp, moments)
            const gaps = rows.filter((r) => r.moments.length === 0).length
            return (
              <Panel
                key={grp.id}
                title={grp.name}
                description={grp.description}
                actions={gaps ? <Badge tone="warning">{gaps === 1 ? '1 gap' : `${gaps} gaps`}</Badge> : <Badge tone="good">Covered</Badge>}
              >
                <ul className="flex flex-col gap-10">
                  {rows.map((r) => (
                    <li key={r.tag.id} className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-8 text-12">
                        <span className="font-medium text-adm-ink">{r.tag.label}</span>
                        <span className={`tabular-nums ${r.moments.length ? 'text-adm-ink-2' : 'text-adm-critical'}`}>
                          {r.moments.length ? `${r.moments.length} of ${moments.length}` : 'No moment yet'}
                        </span>
                      </div>
                      <div className="h-6 overflow-hidden rounded-full bg-adm-hover">
                        <div className="h-full rounded-full bg-adm-s1" style={{ width: `${moments.length ? (r.moments.length / moments.length) * 100 : 0}%` }} />
                      </div>
                      {r.moments.length > 0 && <span className="text-11 text-adm-muted">{r.moments.map((m) => m.title).join(' · ')}</span>}
                    </li>
                  ))}
                </ul>
              </Panel>
            )
          })}
        </div>
      )}

      {view === 'taxonomy' && (
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {data.groups.map((grp) => (
              <Panel
                key={grp.id}
                title={grp.name}
                description={grp.description}
                actions={
                  <div className="flex items-center gap-6">
                    <Badge>{grp.multi ? 'Several allowed' : 'One per moment'}</Badge>
                    <Button size="sm" variant="ghost" aria-label={`Edit ${grp.name}`} onClick={() => setEditingGroup(grp)}>
                      <Pencil size={13} />
                    </Button>
                  </div>
                }
              >
                <div className="flex flex-wrap gap-6">
                  {grp.tags.map((t) => (
                    <span key={t.id} className="rounded-full border border-adm-line px-10 py-4 text-12 text-adm-ink">
                      {t.label}
                    </span>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
          <Button className="self-start" icon={<Plus size={13} />} onClick={() => setEditingGroup('new')}>
            Add a tag group
          </Button>
        </div>
      )}

      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-8 bg-adm-ink px-14 py-10 text-12 text-adm-surface shadow-lg">
          {notice}
        </div>
      )}

      {editing && (
        <TagEditor
          moment={editing}
          groups={data.groups}
          onClose={() => setEditing(null)}
          onSave={(asg) => {
            commit(setAssignment(data, editing.id, asg))
            setEditing(null)
          }}
        />
      )}

      {editingGroup && (
        <GroupEditor
          group={editingGroup === 'new' ? null : editingGroup}
          takenIds={data.groups.map((x) => x.id)}
          onClose={() => setEditingGroup(null)}
          onSave={(grp) => {
            commit(saveGroup(data, grp), 'Tag group saved')
            setEditingGroup(null)
          }}
          onDelete={(id) => {
            commit(removeGroup(data, id), 'Tag group deleted')
            setEditingGroup(null)
          }}
        />
      )}
    </div>
  )
}

function Chip({ value, label }: { value: number; label: string }) {
  return (
    <span className="rounded-full border border-adm-line bg-adm-surface px-10 py-4">
      <b className="tabular-nums text-adm-ink">{value}</b> {label}
    </span>
  )
}

function TagEditor({
  moment,
  groups,
  onClose,
  onSave,
}: {
  moment: TaggedMoment
  groups: TagGroup[]
  onClose: () => void
  onSave: (a: Assignment) => void
}) {
  const [draft, setDraft] = useState<Assignment>(moment.assignment)
  return (
    <Modal title={moment.title} description={`${moment.stageTitle} stage`} onClose={onClose} width={600}>
      <div className="flex flex-col gap-16">
        {groups.map((grp) => (
          <div key={grp.id} className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between gap-8">
              <span className="text-12 font-semibold text-adm-ink">{grp.name}</span>
              <span className="text-11 text-adm-muted">{grp.multi ? 'Choose any' : 'Choose one'}</span>
            </div>
            <div className="flex flex-wrap gap-6">
              {grp.tags.map((t) => {
                const on = draft.tags.includes(`${grp.id}:${t.id}`)
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft({ ...draft, tags: toggleTag(draft.tags, grp, t.id) })}
                    className={`rounded-full border px-10 py-4 text-12 ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-6 border-t border-adm-line pt-14">
          <span className="text-12 font-semibold text-adm-ink">Review</span>
          <div className="flex flex-wrap gap-6">
            {(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={draft.status === s}
                onClick={() => setDraft({ ...draft, status: s })}
                className={`rounded-full border px-10 py-4 text-12 ${draft.status === s ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Note" hint="Why a tag is right or wrong, or what to decide">
          <textarea className={textareaClass} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </FormField>
        <div className="flex gap-8 border-t border-adm-line pt-14">
          <Button variant="primary" onClick={() => onSave({ ...draft, note: draft.note.trim() })}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

function GroupEditor({
  group,
  takenIds,
  onClose,
  onSave,
  onDelete,
}: {
  group: TagGroup | null
  takenIds: string[]
  onClose: () => void
  onSave: (g: TagGroup) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [multi, setMulti] = useState(group?.multi ?? true)
  const [tags, setTags] = useState(group?.tags ?? [])
  const [newTag, setNewTag] = useState('')

  function addTag() {
    const label = newTag.trim()
    if (!label) return
    setTags([...tags, { id: slug(label, tags.map((t) => t.id)), label }])
    setNewTag('')
  }

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({
      id: group?.id ?? slug(trimmed, takenIds),
      name: trimmed,
      description: description.trim(),
      multi,
      tags: tags.map((t) => ({ ...t, label: t.label.trim() || t.id })),
    })
  }

  return (
    <Modal
      title={group ? `Edit ${group.name}` : 'New tag group'}
      description="Removing a tag also removes it from every moment."
      onClose={onClose}
      width={520}
    >
      <div className="flex flex-col gap-14">
        <FormField label="Name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="What it answers">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <label className="flex items-center gap-8 text-12 text-adm-ink">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} />
          A moment can have several tags from this group
        </label>
        <div className="flex flex-col gap-6">
          <span className="text-12 font-medium text-adm-ink-2">Tags</span>
          {tags.map((t, i) => (
            <div key={t.id} className="flex items-center gap-6">
              <input
                aria-label={`Tag ${i + 1}`}
                className={inputClass}
                value={t.label}
                onChange={(e) => setTags(tags.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x)))}
              />
              <Button size="sm" variant="ghost" aria-label={`Remove ${t.label}`} onClick={() => setTags(tags.filter((x) => x.id !== t.id))}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-6">
            <input
              aria-label="New tag"
              placeholder="New tag"
              className={inputClass}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
              Add
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-8 border-t border-adm-line pt-14">
          <Button variant="primary" onClick={save} disabled={!name.trim()}>
            Save group
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          {group && (
            <Button
              variant="ghost"
              className="ml-auto text-adm-critical"
              onClick={() => {
                if (window.confirm(`Delete the group “${group.name}” and its tags on every moment?`)) onDelete(group.id)
              }}
            >
              Delete group
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
