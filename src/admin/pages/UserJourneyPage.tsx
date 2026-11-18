import { Download, ImagePlus, Minus, Pencil, Plus, RotateCcw, Settings2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { Modal } from '../components/Modal'
import { Button, FormField, PageHeader, inputClass, textareaClass } from '../components/ui'
import {
  INITIAL_JOURNEY,
  JourneyMapSchema,
  STORAGE_KEY,
  addItem,
  counts,
  parseImport,
  removeItem,
  updateItem,
  updateStage,
  type ItemKind,
  type JourneyItem,
  type JourneyMap,
} from '../data/userJourney'
import { readJson, writeJson } from '../../lib/storage'

type Layer = 'all' | 'moments' | 'screens'
type Editing = { stageId: string; kind: ItemKind; item: JourneyItem }

const ZOOM_MIN = 60
const ZOOM_MAX = 130
const COL = 248

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

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * User journey (U088): when people reach for Aurelia, in four stages
 * (Reflect, Create, Experience, Share). Each stage has illustrated moments
 * with the feature each suggests, and the product screens that serve it.
 * Ported from the owner's "Aurelia journey blueprint" page. Edits are saved
 * in this browser; Export and Import move them between browsers.
 */
export function UserJourneyPage() {
  const [map, setMap] = useState<JourneyMap>(() => readJson(STORAGE_KEY, JourneyMapSchema, INITIAL_JOURNEY))
  const [layer, setLayer] = useState<Layer>('all')
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [managing, setManaging] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(t)
  }, [notice])

  function commit(next: JourneyMap, message = 'Saved in this browser') {
    setMap(next)
    setNotice(writeJson(STORAGE_KEY, next) ? message : 'Browser storage is full. Export a backup, or use smaller images.')
  }

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'aurelia-user-journey.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Exported aurelia-user-journey.json')
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const parsed = parseImport(await file.text())
    if (parsed) {
      commit(parsed, 'Imported')
      setManaging(false)
    } else setNotice('That file is not a user journey export.')
  }

  function add(stageId: string, kind: ItemKind) {
    const id = uid()
    const next = addItem(map, stageId, kind, id)
    commit(next)
    const item = next.stages.find((s) => s.id === stageId)?.[kind].find((x) => x.id === id)
    if (item) setEditing({ stageId, kind, item })
  }

  const total = counts(map)
  const stages = map.stages.filter((s) => !stageFilter || s.id === stageFilter)
  const grid: CSSProperties = { gridTemplateColumns: `repeat(${stages.length}, minmax(${COL - 18}px, 1fr))` }

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="User journey"
        description="When people reach for Aurelia, in four stages. Each stage has the moments that bring someone to the app, the feature each moment suggests, and the product screens that serve it."
        actions={
          <div className="flex flex-wrap gap-8">
            <Button size="sm" icon={<Upload size={13} />} onClick={() => importInput.current?.click()}>
              Import
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={exportJson}>
              Export
            </Button>
            <Button size="sm" variant="primary" icon={<Settings2 size={13} />} onClick={() => setManaging(true)}>
              Manage stages
            </Button>
            <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={importJson} />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <span className="rounded-full border border-adm-line bg-adm-surface px-10 py-4">
          <b className="tabular-nums text-adm-ink">{total.stages}</b> stages
        </span>
        <span className="rounded-full border border-adm-line bg-adm-surface px-10 py-4">
          <b className="tabular-nums text-adm-ink">{total.moments}</b> moments
        </span>
        <span className="rounded-full border border-adm-line bg-adm-surface px-10 py-4">
          <b className="tabular-nums text-adm-ink">{total.screens}</b> screens
        </span>
        <span className="text-adm-muted">Edits are saved in this browser. Export to share them.</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-10 rounded-12 border border-adm-line bg-adm-surface p-8">
        <div className="flex flex-wrap gap-4" role="group" aria-label="Show">
          {(
            [
              ['all', 'All layers'],
              ['moments', 'Moments'],
              ['screens', 'Product screens'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={layer === id}
              onClick={() => setLayer(id)}
              className={`rounded-8 px-10 py-6 text-12 font-medium ${layer === id ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}
            >
              {label}
            </button>
          ))}
          <span className="mx-4 w-px self-stretch bg-adm-line" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={stageFilter === null}
            onClick={() => setStageFilter(null)}
            className={`rounded-8 px-10 py-6 text-12 font-medium ${stageFilter === null ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}
          >
            All stages
          </button>
          {map.stages.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={stageFilter === s.id}
              onClick={() => setStageFilter(stageFilter === s.id ? null : s.id)}
              className={`inline-flex items-center gap-6 rounded-8 px-10 py-6 text-12 font-medium ${stageFilter === s.id ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}
            >
              <span className="size-8 rounded-full" style={{ background: s.color }} aria-hidden="true" />
              {s.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-12 text-adm-muted">
          <span className="mr-4">Zoom</span>
          <Button size="sm" variant="ghost" aria-label="Zoom out" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 10))}>
            <Minus size={13} />
          </Button>
          <span className="w-40 text-center tabular-nums text-adm-ink">{zoom}%</span>
          <Button size="sm" variant="ghost" aria-label="Zoom in" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 10))}>
            <Plus size={13} />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Reset zoom" onClick={() => setZoom(100)}>
            <RotateCcw size={13} />
          </Button>
        </div>
      </div>

      <div className="min-w-0 overflow-auto rounded-12 border border-adm-line bg-adm-surface">
        <div style={{ zoom: zoom / 100, minWidth: stages.length * COL }}>
          <div className="grid" style={grid}>
            {stages.map((s) => (
              <div key={s.id} className="relative border-b border-r border-adm-line px-18 pb-18 pt-20 last:border-r-0">
                <span className="text-10 font-semibold uppercase tracking-widest text-adm-muted">
                  Stage {String(map.stages.indexOf(s) + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-6 text-22 font-semibold text-adm-ink">{s.title}</h2>
                <p className="mt-2 text-12 leading-[18px] text-adm-muted">{s.question}</p>
                <span className="absolute bottom-0 left-18 h-3 w-40 rounded-full" style={{ background: s.color }} aria-hidden="true" />
              </div>
            ))}
          </div>

          {layer !== 'screens' && (
            <>
              <RowHeading title="Moments" hint="Select a moment to edit it" />
              <div className="grid" style={grid}>
                {stages.map((s) => (
                  <div key={s.id} className="flex flex-col gap-16 border-r border-adm-line p-14 last:border-r-0">
                    {s.moments.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setEditing({ stageId: s.id, kind: 'moments', item: m })}
                        className="group flex flex-col gap-6 rounded-8 text-left focus-visible:outline-2 focus-visible:outline-adm-accent"
                      >
                        <span className="relative block aspect-[16/10] overflow-hidden rounded-8 bg-adm-hover">
                          {m.image && <img src={m.image} alt="" loading="lazy" className="size-full object-cover transition-transform group-hover:scale-[1.02]" />}
                          <span className="absolute bottom-6 right-6 hidden items-center gap-4 rounded-8 bg-adm-surface/95 px-8 py-4 text-11 text-adm-ink group-hover:inline-flex">
                            <Pencil size={11} /> Edit
                          </span>
                        </span>
                        <span className="text-13 font-semibold text-adm-ink">{m.title}</span>
                        {m.description && <span className="text-12 leading-[18px] text-adm-ink-2">{m.description}</span>}
                        {m.feature && (
                          <span className="flex flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg px-10 py-8">
                            <span className="text-10 font-semibold uppercase tracking-wider text-adm-muted">Potential feature</span>
                            <span className="text-12 font-medium text-adm-ink">{m.feature}</span>
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => add(s.id, 'moments')}
                      className="flex h-44 items-center justify-center gap-6 rounded-8 border border-dashed border-adm-line text-12 font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
                    >
                      <Plus size={13} /> Add a moment
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {layer !== 'moments' && (
            <>
              <RowHeading title="Product screens" hint="Select a screen to replace its screenshot" bordered={layer === 'all'} />
              <div className="grid" style={grid}>
                {stages.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-start gap-14 border-r border-adm-line p-14 last:border-r-0">
                    {s.screens.map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setEditing({ stageId: s.id, kind: 'screens', item: sc })}
                        className="group flex w-[112px] flex-col gap-6 text-left"
                      >
                        <span className="block h-[224px] w-[108px] rounded-[18px] bg-adm-sidebar p-4 shadow-md transition-transform group-hover:-translate-y-2">
                          <span className="flex size-full items-center justify-center overflow-hidden rounded-[14px] bg-adm-surface">
                            {sc.image ? (
                              <img src={sc.image} alt="" loading="lazy" className="size-full object-cover object-top" />
                            ) : (
                              <span className="flex flex-col items-center gap-6 text-10 text-adm-muted">
                                <ImagePlus size={16} /> Add screenshot
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="text-12 font-semibold text-adm-ink">{sc.title}</span>
                        {sc.feature && <span className="text-11 leading-[15px] text-adm-muted">{sc.feature}</span>}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => add(s.id, 'screens')}
                      className="flex h-[224px] w-[108px] flex-col items-center justify-center gap-6 rounded-[18px] border border-dashed border-adm-line text-11 font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
                    >
                      <Plus size={16} /> Add screen
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-8 bg-adm-ink px-14 py-10 text-12 text-adm-surface shadow-lg">
          {notice}
        </div>
      )}

      {editing && (
        <ItemEditor
          editing={editing}
          stageTitle={map.stages.find((s) => s.id === editing.stageId)?.title ?? ''}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            commit(updateItem(map, editing.stageId, editing.kind, item))
            setEditing(null)
          }}
          onDelete={() => {
            commit(removeItem(map, editing.stageId, editing.kind, editing.item.id), 'Deleted')
            setEditing(null)
          }}
        />
      )}

      {managing && (
        <ManageStages
          map={map}
          onClose={() => setManaging(false)}
          onSaveStage={(id, title, question) => commit(updateStage(map, id, { title, question }), 'Stage saved')}
          onExport={exportJson}
          onImport={() => importInput.current?.click()}
          onReset={() => {
            commit(INITIAL_JOURNEY, 'Restored the original journey')
            setManaging(false)
          }}
        />
      )}
    </div>
  )
}

function RowHeading({ title, hint, bordered }: { title: string; hint: string; bordered?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-12 border-b border-adm-line px-18 py-12 ${bordered ? 'border-t' : ''}`}>
      <span className="text-11 font-semibold uppercase tracking-widest text-adm-ink-2">{title}</span>
      <span className="text-11 text-adm-muted">{hint}</span>
    </div>
  )
}

function ItemEditor({
  editing,
  stageTitle,
  onClose,
  onSave,
  onDelete,
}: {
  editing: Editing
  stageTitle: string
  onClose: () => void
  onSave: (item: JourneyItem) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState(editing.item)
  const [error, setError] = useState<string | null>(null)
  const moment = editing.kind === 'moments'

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const image = await readCompressed(file, moment ? 1100 : 900)
      setDraft((d) => ({ ...d, image }))
      setError(null)
    } catch {
      setError('That image could not be read.')
    }
  }

  return (
    <Modal title={moment ? 'Edit moment' : 'Edit product screen'} description={`${stageTitle} stage`} onClose={onClose} width={520}>
      <div className="flex flex-col gap-14">
        <FormField label="Title">
          <input className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea className={textareaClass} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </FormField>
        <FormField label="Potential feature" hint="The opportunity or capability this suggests">
          <input className={inputClass} value={draft.feature} onChange={(e) => setDraft({ ...draft, feature: e.target.value })} />
        </FormField>
        <div className="flex flex-col gap-6">
          <span className="text-12 font-medium text-adm-ink-2">{moment ? 'Illustration' : 'Screenshot'}</span>
          {draft.image && (
            <img
              src={draft.image}
              alt=""
              className={`rounded-8 border border-adm-line bg-adm-hover object-contain ${moment ? 'max-h-[200px]' : 'max-h-[260px] self-start'}`}
            />
          )}
          <div className="flex flex-wrap gap-8">
            <label className="inline-flex h-30 cursor-pointer items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-10 text-12 font-medium text-adm-ink hover:bg-adm-hover">
              <ImagePlus size={13} /> {draft.image ? 'Replace image' : 'Choose image'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pick} />
            </label>
            {draft.image && (
              <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, image: '' })}>
                Remove image
              </Button>
            )}
          </div>
          <span className="text-11 text-adm-muted">PNG, JPG, WebP or GIF. Resized and kept in this browser.</span>
          {error && <span className="text-11 text-adm-critical">{error}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-8 border-t border-adm-line pt-14">
          <Button variant="primary" onClick={() => onSave({ ...draft, title: draft.title.trim() || 'Untitled', description: draft.description.trim(), feature: draft.feature.trim() })}>
            Save changes
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="ghost"
            className="ml-auto text-adm-critical"
            onClick={() => {
              if (window.confirm(`Delete “${editing.item.title}”?`)) onDelete()
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ManageStages({
  map,
  onClose,
  onSaveStage,
  onExport,
  onImport,
  onReset,
}: {
  map: JourneyMap
  onClose: () => void
  onSaveStage: (id: string, title: string, question: string) => void
  onExport: () => void
  onImport: () => void
  onReset: () => void
}) {
  const [stageId, setStageId] = useState(map.stages[0].id)
  const stage = map.stages.find((s) => s.id === stageId) ?? map.stages[0]
  const [title, setTitle] = useState(stage.title)
  const [question, setQuestion] = useState(stage.question)

  function choose(id: string) {
    const s = map.stages.find((x) => x.id === id)
    setStageId(id)
    setTitle(s?.title ?? '')
    setQuestion(s?.question ?? '')
  }

  return (
    <Modal title="Manage stages" description="Rename a stage, back the journey up, or start again." onClose={onClose} width={520}>
      <div className="flex flex-col gap-18">
        <section className="flex flex-col gap-12">
          <h3 className="text-13 font-semibold text-adm-ink">Stage name and question</h3>
          <FormField label="Stage">
            <select className={inputClass} value={stageId} onChange={(e) => choose(e.target.value)}>
              {map.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Guiding question">
            <input className={inputClass} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </FormField>
          <Button variant="primary" className="self-start" onClick={() => onSaveStage(stageId, title, question)}>
            Save stage
          </Button>
        </section>
        <section className="flex flex-col gap-8 border-t border-adm-line pt-16">
          <h3 className="text-13 font-semibold text-adm-ink">Back up and move</h3>
          <p className="text-12 text-adm-muted">
            Export saves the journey, uploaded images included, as a JSON file. Import restores it in another browser, and also reads a file
            exported from the original blueprint page.
          </p>
          <div className="flex gap-8">
            <Button size="sm" icon={<Download size={13} />} onClick={onExport}>
              Export JSON
            </Button>
            <Button size="sm" icon={<Upload size={13} />} onClick={onImport}>
              Import JSON
            </Button>
          </div>
        </section>
        <section className="flex flex-col gap-8 border-t border-adm-line pt-16">
          <h3 className="text-13 font-semibold text-adm-ink">Start again</h3>
          <p className="text-12 text-adm-muted">Restores the original four stages, moments and screens. Your edits in this browser are lost.</p>
          <Button
            size="sm"
            variant="danger"
            className="self-start"
            onClick={() => {
              if (window.confirm('Restore the original journey? Your edits in this browser will be lost.')) onReset()
            }}
          >
            Restore original
          </Button>
        </section>
      </div>
    </Modal>
  )
}
