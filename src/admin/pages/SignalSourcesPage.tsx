import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  CircleDot,
  CloudSun,
  MapPin,
  MessagesSquare,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  Watch,
} from 'lucide-react'
import { Modal } from '../components/Modal'
import { Badge, Button, FormField, PageHeader, Panel, StatCard, inputClass, textareaClass } from '../components/ui'
import type { SignalGroup, SignalSource } from '../../lib/signals'
import { SIGNAL_GROUPS, SIGNAL_SOURCES } from '../../lib/signals'

/** A curated icon set a non-engineer can pick from, rather than a free-text
 *  component name. Covers the shapes the real sources already use plus a
 *  couple of spares for whatever gets added next. */
const ICONS: Record<string, LucideIcon> = {
  Watch, CircleDot, CalendarDays, MessagesSquare, CloudSun, MapPin, Smartphone,
}

function emptySource(): SignalSource {
  return { id: '', name: '', group: 'Biological', icon: Watch, defaultOn: false, reads: '' }
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'source'
}

function iconName(icon: LucideIcon) {
  return Object.keys(ICONS).find((key) => ICONS[key] === icon) ?? 'Smartphone'
}

/** The create/edit form. `reads` is not a description — it is the consent
 *  text a member actually sees and agrees to on My Wellness, so this is a
 *  legal surface more than a copy one. */
function SourceForm({
  initial,
  existingIds,
  onSave,
  onClose,
}: {
  initial: SignalSource
  existingIds: string[]
  onSave: (source: SignalSource) => void
  onClose: () => void
}) {
  const isNew = !existingIds.includes(initial.id)
  const [draft, setDraft] = useState<SignalSource>(initial)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (!draft.name.trim() || !draft.reads.trim()) {
      setError('Name and the consent text ("reads") are both required.')
      return
    }
    const id = isNew ? slugify(draft.name) : draft.id
    if (isNew && existingIds.includes(id)) {
      setError('A source with that name already exists.')
      return
    }
    onSave({ ...draft, id })
  }

  return (
    <div className="flex flex-col gap-16">
      {error && <p className="rounded-8 bg-adm-critical/10 px-10 py-8 text-12 text-adm-critical">{error}</p>}

      <FormField label="Name">
        <input
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          placeholder="Garmin Watch"
          className={inputClass}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-12">
        <FormField label="Group">
          <select
            value={draft.group}
            onChange={(event) => setDraft({ ...draft, group: event.target.value as SignalGroup })}
            className={inputClass}
          >
            {SIGNAL_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Icon">
          <select
            value={iconName(draft.icon)}
            onChange={(event) => setDraft({ ...draft, icon: ICONS[event.target.value] })}
            className={inputClass}
          >
            {Object.keys(ICONS).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="What Aurelia reads from it"
        hint="This is the consent text shown on My Wellness, word for word — not a summary for this page."
      >
        <textarea
          value={draft.reads}
          onChange={(event) => setDraft({ ...draft, reads: event.target.value })}
          placeholder="Heart rate, sleep stages, activity"
          className={textareaClass}
        />
      </FormField>

      <label className="flex items-center gap-8 text-13 text-adm-ink">
        <input
          type="checkbox"
          checked={draft.defaultOn}
          onChange={(event) => setDraft({ ...draft, defaultOn: event.target.checked })}
        />
        Connected by default, before a visitor touches anything
      </label>

      <div className="mt-4 flex justify-end gap-8 border-t border-adm-line pt-16">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>{isNew ? 'Add source' : 'Save changes'}</Button>
      </div>
    </div>
  )
}

function SourceRow({ source, onEdit, onDelete }: { source: SignalSource; onEdit: () => void; onDelete: () => void }) {
  const Icon = source.icon
  return (
    <div className="flex items-center gap-12 py-10">
      <span className="flex size-32 shrink-0 items-center justify-center rounded-8 bg-adm-hover text-adm-ink-2">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-8">
          <p className="truncate text-13 font-medium text-adm-ink">{source.name}</p>
          {source.defaultOn ? <Badge tone="good">on by default</Badge> : <Badge tone="neutral">off by default</Badge>}
        </div>
        <p className="truncate text-12 text-adm-muted">{source.reads}</p>
      </div>
      <div className="flex shrink-0 gap-4">
        <Button variant="ghost" size="sm" icon={<Pencil size={12} />} onClick={onEdit}>Edit</Button>
        <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )
}

export function SignalSourcesPage() {
  const [sources, setSources] = useState<SignalSource[]>(SIGNAL_SOURCES)
  const [editing, setEditing] = useState<SignalSource | null>(null)
  const [deleting, setDeleting] = useState<SignalSource | null>(null)

  function save(source: SignalSource) {
    setSources((current) => {
      const exists = current.some((item) => item.id === source.id)
      return exists ? current.map((item) => (item.id === source.id ? source : item)) : [...current, source]
    })
    setEditing(null)
  }

  function remove(id: string) {
    setSources((current) => current.filter((item) => item.id !== id))
    setDeleting(null)
  }

  const onByDefault = sources.filter((s) => s.defaultOn).length

  return (
    <>
      <PageHeader
        title="Signal sources"
        description="The integrations My Wellness can read from, consent-gated per source. What's in “Reads” is the exact text a member agrees to — this is a consent record, not marketing copy."
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditing(emptySource())}>
            Add source
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Sources" value={sources.length.toString()} />
        <StatCard label="On by default" value={onByDefault.toString()} hint={`of ${sources.length}`} />
        {SIGNAL_GROUPS.slice(0, 2).map((group) => (
          <StatCard key={group} label={group} value={sources.filter((s) => s.group === group).length.toString()} />
        ))}
      </div>

      {SIGNAL_GROUPS.map((group) => {
        const inGroup = sources.filter((source) => source.group === group)
        if (!inGroup.length) return null
        return (
          <Panel key={group} title={group} description={`Signal sources grouped under ${group.toLowerCase()}.`}>
            <div className="flex flex-col divide-y divide-adm-line">
              {inGroup.map((source) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  onEdit={() => setEditing(source)}
                  onDelete={() => setDeleting(source)}
                />
              ))}
            </div>
          </Panel>
        )
      })}

      {editing && (
        <Modal
          title={sources.some((s) => s.id === editing.id) ? 'Edit signal source' : 'Add signal source'}
          onClose={() => setEditing(null)}
          width={480}
        >
          <SourceForm
            initial={editing}
            existingIds={sources.map((s) => s.id)}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title="Remove signal source?" onClose={() => setDeleting(null)} width={400}>
          <p className="text-13 text-adm-ink-2">
            <span className="font-medium text-adm-ink">{deleting.name}</span> will no longer be offered on My
            Wellness. Anyone currently connected to it loses that signal.
          </p>
          <div className="mt-20 flex justify-end gap-8">
            <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" icon={<Trash2 size={13} />} onClick={() => remove(deleting.id)}>Remove</Button>
          </div>
        </Modal>
      )}
    </>
  )
}
