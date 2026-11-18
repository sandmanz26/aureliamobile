import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { Badge, Button, FormField, Panel, inputClass } from '../../components/ui'
import {
  STATUS_LABEL,
  STATUS_TONE,
  coverage,
  labelOf,
  slug,
  toggleTag,
  type Assignment,
  type ReviewStatus,
  type TagGroup,
  type TaggedMoment,
} from '../../data/journeyTags'
import type { JourneyStage } from '../../data/userJourney'

const chip = (on: boolean) =>
  `rounded-full border px-10 py-4 text-12 ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`

/** The tag chips and review controls for one moment, used inside the moment panel. */
export function TagFields({ groups, value, onChange }: { groups: TagGroup[]; value: Assignment; onChange: (a: Assignment) => void }) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((grp) => (
        <div key={grp.id} className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-8">
            <span className="text-12 font-semibold text-adm-ink">{grp.name}</span>
            <span className="text-11 text-adm-muted">{grp.multi ? 'Choose any' : 'Choose one'}</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {grp.tags.map((t) => {
              const on = value.tags.includes(`${grp.id}:${t.id}`)
              return (
                <button key={t.id} type="button" aria-pressed={on} onClick={() => onChange({ ...value, tags: toggleTag(value.tags, grp, t.id) })} className={chip(on)}>
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
            <button key={s} type="button" aria-pressed={value.status === s} onClick={() => onChange({ ...value, status: s })} className={chip(value.status === s)}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>
      <FormField label="Review note" hint="Why a tag is right or wrong, or what to decide">
        <textarea className={`${inputClass} h-auto min-h-[64px] resize-y py-8`} value={value.note} onChange={(e) => onChange({ ...value, note: e.target.value })} />
      </FormField>
    </div>
  )
}

/** Every moment as a row, every tag group as a column. */
export function TagsTable({
  moments,
  groups,
  stages,
  onOpen,
}: {
  moments: TaggedMoment[]
  groups: TagGroup[]
  stages: JourneyStage[]
  onOpen: (m: TaggedMoment) => void
}) {
  const [stage, setStage] = useState('')
  const [tag, setTag] = useState('')
  const [status, setStatus] = useState('')
  const shown = moments.filter((m) => (!stage || m.stageId === stage) && (!tag || m.assignment.tags.includes(tag)) && (!status || m.assignment.status === status))
  const select = `${inputClass} h-30 w-auto! text-12`
  return (
    <Panel
      title="Tags and review"
      description="Every moment with its tags. Select a row to change them, mark the review, or leave a note."
      actions={
        <div className="flex flex-wrap gap-8">
          <select aria-label="Stage" className={select} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <select aria-label="Tag" className={select} value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">Any tag</option>
            {groups.map((grp) => (
              <optgroup key={grp.id} label={grp.name}>
                {grp.tags.map((t) => (
                  <option key={t.id} value={`${grp.id}:${t.id}`}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select aria-label="Review status" className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any review</option>
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
              {groups.map((grp) => (
                <th key={grp.id} className="px-8 py-8 font-medium">
                  {grp.name}
                </th>
              ))}
              <th className="px-8 py-8 font-medium">Review</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id} className="border-b border-adm-line align-top last:border-b-0 hover:bg-adm-hover">
                <td className="py-10 pr-12">
                  <button type="button" className="flex items-center gap-10 text-left" onClick={() => onOpen(m)}>
                    {m.image ? <img src={m.image} alt="" className="size-40 shrink-0 rounded-8 object-cover" /> : <span className="size-40 shrink-0 rounded-8 bg-adm-hover" />}
                    <span className="flex flex-col gap-2">
                      <span className="font-semibold text-adm-ink underline-offset-2 hover:underline">{m.title}</span>
                      <span className="inline-flex items-center gap-4 text-11 text-adm-muted">
                        <span className="size-6 rounded-full" style={{ background: m.stageColor }} aria-hidden="true" />
                        {m.stageTitle}
                      </span>
                    </span>
                  </button>
                </td>
                {groups.map((grp) => {
                  const own = m.assignment.tags.filter((t) => t.startsWith(`${grp.id}:`))
                  return (
                    <td key={grp.id} className="px-8 py-10">
                      {own.length ? (
                        <span className="flex flex-wrap gap-4">
                          {own.map((t) => (
                            <span key={t} className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink">
                              {labelOf(groups, t)}
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
                <td colSpan={groups.length + 2} className="py-24 text-center text-adm-muted">
                  No moment matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

/** For each tag group, how many moments carry each tag; tags with none are gaps. */
export function CoverageView({ moments, groups }: { moments: TaggedMoment[]; groups: TagGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      {groups.map((grp) => {
        const rows = coverage(grp, moments)
        const gaps = rows.filter((r) => r.moments.length === 0).length
        return (
          <Panel key={grp.id} title={grp.name} description={grp.description} actions={gaps ? <Badge tone="warning">{gaps === 1 ? '1 gap' : `${gaps} gaps`}</Badge> : <Badge tone="good">Covered</Badge>}>
            <ul className="flex flex-col gap-10">
              {rows.map((r) => (
                <li key={r.tag.id} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-8 text-12">
                    <span className="font-medium text-adm-ink">{r.tag.label}</span>
                    <span className={`tabular-nums ${r.moments.length ? 'text-adm-ink-2' : 'text-adm-critical'}`}>{r.moments.length ? `${r.moments.length} of ${moments.length}` : 'No moment yet'}</span>
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
  )
}

/** The tag groups and their tags, editable. */
export function TagSetupView({ groups, onEdit, onAdd }: { groups: TagGroup[]; onEdit: (g: TagGroup) => void; onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-12">
      <p className="text-12 text-adm-muted">The groups every moment is tagged in. Change them only when the team agrees; removing a tag removes it from every moment.</p>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {groups.map((grp) => (
          <Panel
            key={grp.id}
            title={grp.name}
            description={grp.description}
            actions={
              <div className="flex items-center gap-6">
                <Badge>{grp.multi ? 'Several allowed' : 'One per moment'}</Badge>
                <Button size="sm" variant="ghost" aria-label={`Edit ${grp.name}`} onClick={() => onEdit(grp)}>
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
      <Button className="self-start" icon={<Plus size={13} />} onClick={onAdd}>
        Add a tag group
      </Button>
    </div>
  )
}

export function GroupEditor({
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
    onSave({ id: group?.id ?? slug(trimmed, takenIds), name: trimmed, description: description.trim(), multi, tags: tags.map((t) => ({ ...t, label: t.label.trim() || t.id })) })
  }

  return (
    <Modal title={group ? `Edit ${group.name}` : 'New tag group'} description="Removing a tag also removes it from every moment." onClose={onClose} width={520}>
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
              <input aria-label={`Tag ${i + 1}`} className={inputClass} value={t.label} onChange={(e) => setTags(tags.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x)))} />
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
