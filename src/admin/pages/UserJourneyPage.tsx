import { AlertCircle, Download, ImagePlus, MoreHorizontal, Pencil, Plus, RotateCcw, Upload } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, FormField, PageHeader, inputClass, textareaClass, type Tone } from '../components/ui'
import { parseAnyImport, toBundle } from '../data/journeyBundle'
import {
  INITIAL_TAGS,
  JourneyTagsSchema,
  STATUS_LABEL,
  STATUS_TONE,
  TAGS_STORAGE_KEY,
  missingGroups,
  removeGroup,
  saveGroup,
  setAssignment,
  taggedMoments,
  type Assignment,
  type JourneyTags,
  type TagGroup,
} from '../data/journeyTags'
import {
  INITIAL_JOURNEY,
  JourneyMapSchema,
  NEW_MOMENT_IMAGE,
  STORAGE_KEY,
  removeItem,
  updateItem,
  updateStage,
  type ItemKind,
  type JourneyItem,
  type JourneyMap,
} from '../data/userJourney'
import { readJson, writeJson } from '../../lib/storage'
import { RELEASES } from '../../versions/releases'
import { CoverageView, GroupEditor, TagFields, TagSetupView, TagsTable } from './journey/TagViews'

type View = 'map' | 'tags' | 'coverage' | 'setup'
const VIEWS: { id: View; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'tags', label: 'Tags & review' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'setup', label: 'Tag setup' },
]

/** What the side panel is editing. `isNew`: not in the map until saved. */
interface Editing {
  kind: ItemKind
  stageId: string
  item: JourneyItem
  assignment: Assignment
  isNew: boolean
}

const READINESS_TONE: Record<string, Tone> = { live: 'good', partial: 'info', concept: 'warning' }
const EMPTY: Assignment = { tags: [], status: 'proposed', note: '' }
const uid = () => Math.random().toString(36).slice(2, 10)

/** Shrinks an uploaded image so a few of them fit in browser storage. */
function readCompressed(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', 0.8))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * User journey (U088, reworked in U092 after user feedback): when people
 * reach for Aurelia, in four stages, with the moments that bring them, the
 * feature each moment suggests, the screens that serve it, and (on staging,
 * `RELEASES.journeyTags`) one classification of every moment with a review
 * status. One page, one panel for everything about a moment.
 */
export function UserJourneyPage() {
  const tagsOn = RELEASES.journeyTags
  const [params, setParams] = useSearchParams()
  const requested = params.get('view') as View | null
  const view: View = tagsOn && requested && VIEWS.some((v) => v.id === requested) ? requested : 'map'

  const [map, setMap] = useState<JourneyMap>(() => readJson(STORAGE_KEY, JourneyMapSchema, INITIAL_JOURNEY))
  const [tags, setTags] = useState<JourneyTags>(() => readJson(TAGS_STORAGE_KEY, JourneyTagsSchema, INITIAL_TAGS))
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState('')
  const [showScreens, setShowScreens] = useState(true)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [stagesOpen, setStagesOpen] = useState(false)
  const [groupEditing, setGroupEditing] = useState<TagGroup | 'new' | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(t)
  }, [notice])

  const moments = useMemo(() => taggedMoments(map, tags), [map, tags])
  const byId = useMemo(() => new Map(moments.map((m) => [m.id, m])), [moments])

  function saveMap(next: JourneyMap) {
    setMap(next)
    return writeJson(STORAGE_KEY, next)
  }
  function saveTags(next: JourneyTags) {
    setTags(next)
    return writeJson(TAGS_STORAGE_KEY, next)
  }
  const report = (ok: boolean, message = 'Saved in this browser') => setNotice(ok ? message : 'Browser storage is full. Export a backup, or use smaller images.')

  function setView(next: View) {
    setParams(next === 'map' ? {} : { view: next }, { replace: true })
  }

  function openItem(kind: ItemKind, stageId: string, item: JourneyItem) {
    setEditing({ kind, stageId, item, assignment: byId.get(item.id)?.assignment ?? EMPTY, isNew: false })
  }

  function openNew(kind: ItemKind, stageId: string) {
    setEditing({
      kind,
      stageId,
      item: { id: uid(), title: '', description: '', feature: '', image: kind === 'moments' ? NEW_MOMENT_IMAGE : '' },
      assignment: EMPTY,
      isNew: true,
    })
  }

  function saveEditing(e: Editing) {
    const item = { ...e.item, title: e.item.title.trim() || (e.kind === 'moments' ? 'Untitled moment' : 'Untitled screen'), description: e.item.description.trim(), feature: e.item.feature.trim() }
    let next = map
    if (e.isNew) {
      next = { ...map, stages: map.stages.map((s) => (s.id === e.stageId ? { ...s, [e.kind]: [...s[e.kind], item] } : s)) }
    } else {
      // The stage may have changed in the panel: move the item.
      const from = map.stages.find((s) => s[e.kind].some((x) => x.id === item.id))
      next = from && from.id !== e.stageId ? removeItem(map, from.id, e.kind, item.id) : map
      next = from && from.id !== e.stageId
        ? { ...next, stages: next.stages.map((s) => (s.id === e.stageId ? { ...s, [e.kind]: [...s[e.kind], item] } : s)) }
        : updateItem(next, e.stageId, e.kind, item)
    }
    let ok = saveMap(next)
    if (tagsOn && e.kind === 'moments') ok = saveTags(setAssignment(tags, item.id, { ...e.assignment, note: e.assignment.note.trim() })) && ok
    report(ok, e.isNew ? 'Added' : 'Saved in this browser')
    setEditing(null)
  }

  function deleteEditing(e: Editing) {
    const ok = saveMap(removeItem(map, e.stageId, e.kind, e.item.id))
    if (tagsOn && tags.assignments[e.item.id]) {
      const rest = { ...tags.assignments }
      delete rest[e.item.id]
      saveTags({ ...tags, assignments: rest })
    }
    report(ok, 'Deleted')
    setEditing(null)
  }

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(toBundle(map, tagsOn ? tags : undefined), null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'aurelia-user-journey.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Exported aurelia-user-journey.json')
  }

  function restoreOriginal() {
    if (!window.confirm('Restore the original journey and tags? Your edits in this browser will be lost.')) return
    let ok = saveMap(INITIAL_JOURNEY)
    if (tagsOn) ok = saveTags(INITIAL_TAGS) && ok
    report(ok, 'Restored the original')
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const found = parseAnyImport(await file.text())
    if (!found) return setNotice('That file is not a user journey export.')
    let ok = true
    if (found.journey) ok = saveMap(found.journey) && ok
    if (found.tags && tagsOn) ok = saveTags(found.tags) && ok
    report(ok, 'Imported')
  }

  const counts = {
    moments: moments.length,
    screens: map.stages.reduce((n, s) => n + s.screens.length, 0),
    agreed: moments.filter((m) => m.assignment.status === 'agreed').length,
    toTag: moments.filter((m) => missingGroups(tags.groups, m.assignment.tags).length > 0).length,
  }
  const stages = map.stages.filter((s) => !stageFilter || s.id === stageFilter)
  const grid: CSSProperties = { gridTemplateColumns: `repeat(${stages.length}, minmax(220px, 1fr))` }
  const readiness = tags.groups.find((g) => g.id === 'readiness')

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="User journey"
        description="When people reach for Aurelia, in four stages: the moments that bring them, the feature each moment suggests, and the screens that serve it. Select any moment to edit it."
        actions={
          <div className="relative flex gap-8">
            <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => openNew('moments', stageFilter ?? map.stages[0].id)}>
              Add moment
            </Button>
            <Button size="sm" icon={<MoreHorizontal size={14} />} aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)}>
              More
            </Button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} aria-hidden="true" />
                <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-40 flex w-[220px] flex-col rounded-12 border border-adm-line bg-adm-surface p-6 shadow-lg">
                  {[
                    { label: 'Edit stage names', icon: <Pencil size={13} />, run: () => setStagesOpen(true) },
                    { label: 'Export (JSON)', icon: <Download size={13} />, run: exportJson },
                  ].map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreOpen(false)
                        a.run()
                      }}
                      className="flex items-center gap-8 rounded-8 px-10 py-8 text-left text-13 text-adm-ink hover:bg-adm-hover"
                    >
                      <span className="text-adm-muted">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                  <label role="menuitem" className="flex cursor-pointer items-center gap-8 rounded-8 px-10 py-8 text-13 text-adm-ink hover:bg-adm-hover">
                    <span className="text-adm-muted">
                      <Upload size={13} />
                    </span>
                    Import (JSON)
                    <input
                      type="file"
                      accept=".json,application/json"
                      hidden
                      onChange={(e) => {
                        setMoreOpen(false)
                        void importJson(e)
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false)
                      restoreOriginal()
                    }}
                    className="mt-4 flex items-center gap-8 rounded-8 border-t border-adm-line px-10 py-8 text-left text-13 text-adm-critical hover:bg-adm-hover"
                  >
                    <RotateCcw size={13} />
                    Restore the original
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />

      {tagsOn && (
        <div className="flex flex-wrap items-center justify-between gap-10">
          <div className="flex flex-wrap gap-2 rounded-12 border border-adm-line bg-adm-surface p-4" role="tablist" aria-label="View">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded-8 px-12 py-6 text-12 font-medium ${view === v.id ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="text-12 text-adm-ink-2">
            <b className="tabular-nums text-adm-ink">{counts.moments}</b> moments · <b className="tabular-nums text-adm-ink">{counts.agreed}</b> agreed ·{' '}
            <b className={`tabular-nums ${counts.toTag ? 'text-adm-critical' : 'text-adm-ink'}`}>{counts.toTag}</b> still to tag
          </p>
        </div>
      )}

      {view === 'map' && (
        <>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-wrap gap-4" role="group" aria-label="Stage">
              {[{ id: null as string | null, title: 'All stages', color: '' }, ...map.stages].map((s) => (
                <button
                  key={s.id ?? 'all'}
                  type="button"
                  aria-pressed={stageFilter === s.id}
                  onClick={() => setStageFilter(s.id)}
                  className={`inline-flex items-center gap-6 rounded-full border px-10 py-4 text-12 ${stageFilter === s.id ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line bg-adm-surface text-adm-ink-2 hover:text-adm-ink'}`}
                >
                  {s.color && <span className="size-8 rounded-full" style={{ background: s.color }} aria-hidden="true" />}
                  {s.title}
                </button>
              ))}
            </div>
            {tagsOn && (
              <select aria-label="Show moments with tag" className={`${inputClass} h-30 w-auto! text-12`} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="">Any tag</option>
                {tags.groups.map((grp) => (
                  <optgroup key={grp.id} label={grp.name}>
                    {grp.tags.map((t) => (
                      <option key={t.id} value={`${grp.id}:${t.id}`}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            <label className="ml-auto flex items-center gap-6 text-12 text-adm-ink-2">
              <input type="checkbox" checked={showScreens} onChange={(e) => setShowScreens(e.target.checked)} />
              Show product screens
            </label>
          </div>

          <div className="min-w-0 overflow-x-auto rounded-12 border border-adm-line bg-adm-surface">
            <div className="grid" style={grid}>
              {stages.map((s) => {
                const shown = s.moments.filter((m) => !tagFilter || byId.get(m.id)?.assignment.tags.includes(tagFilter))
                return (
                  <section key={s.id} className="flex flex-col border-r border-adm-line last:border-r-0" aria-label={`${s.title} stage`}>
                    <header className="relative border-b border-adm-line px-16 pb-14 pt-16">
                      <span className="text-10 font-semibold uppercase tracking-widest text-adm-muted">Stage {String(map.stages.indexOf(s) + 1).padStart(2, '0')}</span>
                      <h2 className="mt-4 text-19 font-semibold text-adm-ink">{s.title}</h2>
                      <p className="mt-2 text-12 leading-[18px] text-adm-muted">{s.question}</p>
                      <span className="absolute bottom-0 left-16 h-3 w-40 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                    </header>
                    <div className="flex flex-1 flex-col gap-12 p-12">
                      {shown.map((m) => {
                        const a = byId.get(m.id)?.assignment ?? EMPTY
                        const ready = a.tags.find((t) => t.startsWith('readiness:'))?.split(':')[1]
                        const untagged = tagsOn && missingGroups(tags.groups, a.tags).length > 0
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => openItem('moments', s.id, m)}
                            className="group flex flex-col gap-6 rounded-12 border border-adm-line bg-adm-surface p-8 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-adm-accent"
                          >
                            <span className="block aspect-[16/9] overflow-hidden rounded-8 bg-adm-hover">
                              {m.image && <img src={m.image} alt="" loading="lazy" className="size-full object-cover" />}
                            </span>
                            <span className="px-2 text-13 font-semibold text-adm-ink">{m.title}</span>
                            {m.description && <span className="line-clamp-3 px-2 text-12 leading-[18px] text-adm-ink-2">{m.description}</span>}
                            {m.feature && (
                              <span className="rounded-8 bg-adm-bg px-8 py-6 text-12 text-adm-ink">
                                <span className="block text-10 font-semibold uppercase tracking-wider text-adm-muted">Potential feature</span>
                                {m.feature}
                              </span>
                            )}
                            {tagsOn && (
                              <span className="flex flex-wrap items-center gap-4 px-2">
                                {ready && readiness && <Badge tone={READINESS_TONE[ready] ?? 'neutral'}>{readiness.tags.find((t) => t.id === ready)?.label ?? ready}</Badge>}
                                <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                                {untagged && (
                                  <span className="inline-flex items-center gap-2 text-11 text-adm-critical">
                                    <AlertCircle size={11} /> Tags missing
                                  </span>
                                )}
                              </span>
                            )}
                          </button>
                        )
                      })}
                      {shown.length === 0 && tagFilter && <p className="py-8 text-center text-12 text-adm-muted">No moment with this tag.</p>}
                      <button
                        type="button"
                        onClick={() => openNew('moments', s.id)}
                        className="flex h-40 items-center justify-center gap-6 rounded-12 border border-dashed border-adm-line text-12 font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
                      >
                        <Plus size={13} /> Add a moment
                      </button>
                    </div>
                    {showScreens && (
                      <div className="border-t border-adm-line p-12">
                        <p className="mb-8 text-10 font-semibold uppercase tracking-widest text-adm-muted">Screens</p>
                        <div className="flex flex-wrap gap-10">
                          {s.screens.map((sc) => (
                            <button key={sc.id} type="button" onClick={() => openItem('screens', s.id, sc)} className="group flex w-[84px] flex-col gap-4 text-left">
                              <span className="block h-[168px] w-[80px] rounded-[14px] bg-adm-sidebar p-3 transition-transform group-hover:-translate-y-2">
                                <span className="flex size-full items-center justify-center overflow-hidden rounded-[11px] bg-adm-surface">
                                  {sc.image ? <img src={sc.image} alt="" loading="lazy" className="size-full object-cover object-top" /> : <ImagePlus size={14} className="text-adm-muted" />}
                                </span>
                              </span>
                              <span className="text-11 font-medium leading-[14px] text-adm-ink">{sc.title}</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => openNew('screens', s.id)}
                            aria-label={`Add a screen to ${s.title}`}
                            className="flex h-[168px] w-[80px] items-center justify-center rounded-[14px] border border-dashed border-adm-line text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
          <p className="text-11 text-adm-muted">Edits are saved in this browser. Use More → Export to share them with the team.</p>
        </>
      )}

      {view === 'tags' && (
        <TagsTable
          moments={moments}
          groups={tags.groups}
          stages={map.stages}
          onOpen={(m) => {
            const found = map.stages.find((s) => s.id === m.stageId)?.moments.find((x) => x.id === m.id)
            if (found) openItem('moments', m.stageId, found)
          }}
        />
      )}
      {view === 'coverage' && <CoverageView moments={moments} groups={tags.groups} />}
      {view === 'setup' && <TagSetupView groups={tags.groups} onEdit={setGroupEditing} onAdd={() => setGroupEditing('new')} />}

      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-8 bg-adm-ink px-14 py-10 text-12 text-adm-surface shadow-lg">
          {notice}
        </div>
      )}

      {editing && (
        <ItemPanel
          key={editing.item.id}
          editing={editing}
          map={map}
          groups={tagsOn && editing.kind === 'moments' ? tags.groups : null}
          onClose={() => setEditing(null)}
          onSave={saveEditing}
          onDelete={deleteEditing}
        />
      )}

      {stagesOpen && (
        <StageNames
          map={map}
          onClose={() => setStagesOpen(false)}
          onSave={(drafts) => report(saveMap(drafts.reduce((m, d) => updateStage(m, d.id, d), map)), 'Stages saved')}
        />
      )}

      {groupEditing && (
        <GroupEditor
          group={groupEditing === 'new' ? null : groupEditing}
          takenIds={tags.groups.map((g) => g.id)}
          onClose={() => setGroupEditing(null)}
          onSave={(g) => {
            report(saveTags(saveGroup(tags, g)), 'Tag group saved')
            setGroupEditing(null)
          }}
          onDelete={(id) => {
            report(saveTags(removeGroup(tags, id)), 'Tag group deleted')
            setGroupEditing(null)
          }}
        />
      )}
    </div>
  )
}

/** Everything about one moment or screen, in one place, saved with one button. */
function ItemPanel({
  editing,
  map,
  groups,
  onClose,
  onSave,
  onDelete,
}: {
  editing: Editing
  map: JourneyMap
  groups: TagGroup[] | null
  onClose: () => void
  onSave: (e: Editing) => void
  onDelete: (e: Editing) => void
}) {
  const [draft, setDraft] = useState(editing)
  const [error, setError] = useState<string | null>(null)
  const moment = draft.kind === 'moments'
  const noun = moment ? 'moment' : 'screen'
  const set = (patch: Partial<JourneyItem>) => setDraft({ ...draft, item: { ...draft.item, ...patch } })

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      set({ image: await readCompressed(file, moment ? 1100 : 900) })
      setError(null)
    } catch {
      setError('That image could not be read.')
    }
  }

  return (
    <SidePanel
      title={editing.isNew ? `New ${noun}` : editing.item.title || `Untitled ${noun}`}
      description={!moment ? 'A product screen that serves this stage.' : groups ? 'Details, then tags and review.' : 'What happens, and the feature it suggests.'}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={() => onSave(draft)}>
            {editing.isNew ? `Add ${noun}` : 'Save'}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          {!editing.isNew && (
            <Button
              variant="ghost"
              className="ml-auto text-adm-critical"
              onClick={() => {
                if (window.confirm(`Delete “${editing.item.title}”?`)) onDelete(editing)
              }}
            >
              Delete
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-14">
        <FormField label="Stage">
          <select className={inputClass} value={draft.stageId} onChange={(e) => setDraft({ ...draft, stageId: e.target.value })}>
            {map.stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Title">
          <input className={inputClass} value={draft.item.title} placeholder={moment ? 'e.g. Before a difficult call' : 'e.g. Check-in sheet'} onChange={(e) => set({ title: e.target.value })} autoFocus={editing.isNew} />
        </FormField>
        <FormField label={moment ? 'What happens' : 'What it shows'}>
          <textarea className={textareaClass} value={draft.item.description} onChange={(e) => set({ description: e.target.value })} />
        </FormField>
        <FormField label="Potential feature" hint="The opportunity or capability this suggests">
          <input className={inputClass} value={draft.item.feature} onChange={(e) => set({ feature: e.target.value })} />
        </FormField>
        <div className="flex flex-col gap-6">
          <span className="text-12 font-medium text-adm-ink-2">{moment ? 'Illustration' : 'Screenshot'}</span>
          {draft.item.image && <img src={draft.item.image} alt="" className={`rounded-8 border border-adm-line bg-adm-hover object-contain ${moment ? 'max-h-[180px]' : 'max-h-[240px] self-start'}`} />}
          <div className="flex flex-wrap gap-8">
            <label className="inline-flex h-30 cursor-pointer items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-10 text-12 font-medium text-adm-ink hover:bg-adm-hover">
              <ImagePlus size={13} /> {draft.item.image ? 'Replace image' : 'Choose image'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pick} />
            </label>
            {draft.item.image && (
              <Button size="sm" variant="ghost" onClick={() => set({ image: '' })}>
                Remove image
              </Button>
            )}
          </div>
          {error && <span className="text-11 text-adm-critical">{error}</span>}
        </div>
        {groups && (
          <div className="flex flex-col gap-12 border-t border-adm-line pt-16">
            <div>
              <h3 className="text-13 font-semibold text-adm-ink">Tags and review</h3>
              <p className="mt-2 text-12 text-adm-muted">How this moment is classified, and whether the team agrees.</p>
            </div>
            <TagFields groups={groups} value={draft.assignment} onChange={(assignment) => setDraft({ ...draft, assignment })} />
          </div>
        )}
      </div>
    </SidePanel>
  )
}

function StageNames({ map, onClose, onSave }: { map: JourneyMap; onClose: () => void; onSave: (stages: { id: string; title: string; question: string }[]) => void }) {
  const [drafts, setDrafts] = useState(() => map.stages.map((s) => ({ id: s.id, title: s.title, question: s.question, color: s.color })))
  return (
    <Modal title="Stage names" description="The four stages and the question each answers." onClose={onClose} width={560}>
      <div className="flex flex-col gap-16">
        {drafts.map((d, i) => (
          <div key={d.id} className="flex flex-col gap-8">
            <span className="inline-flex items-center gap-6 text-11 font-semibold uppercase tracking-widest text-adm-muted">
              <span className="size-8 rounded-full" style={{ background: d.color }} aria-hidden="true" /> Stage {String(i + 1).padStart(2, '0')}
            </span>
            <input aria-label={`Stage ${i + 1} name`} className={inputClass} value={d.title} onChange={(e) => setDrafts(drafts.map((x) => (x.id === d.id ? { ...x, title: e.target.value } : x)))} />
            <input aria-label={`Stage ${i + 1} question`} className={inputClass} value={d.question} onChange={(e) => setDrafts(drafts.map((x) => (x.id === d.id ? { ...x, question: e.target.value } : x)))} />
          </div>
        ))}
        <div className="flex gap-8 border-t border-adm-line pt-14">
          <Button
            variant="primary"
            onClick={() => {
              onSave(drafts)
              onClose()
            }}
          >
            Save stages
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
