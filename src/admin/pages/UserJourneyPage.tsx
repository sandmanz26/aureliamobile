import { DataSources } from './reports/DataSources'
import { AlertCircle, CircleHelp, Download, ExternalLink, ImagePlus, MoreHorizontal, Pencil, Plus, RotateCcw, Smartphone, Upload, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepTab, usePageTab } from '../components/pageTab'
import { PageSummary, PageTabs } from '../components/PageTabs'
import { GuideTour, type TourStep } from '../components/GuideTour'
import { Modal } from '../components/Modal'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, FormField, PageHeader, inputClass, textareaClass, type Tone } from '../components/ui'
import { parseAnyImport, toBundle } from '../data/journeyBundle'
import { generatePersonas } from '../data/personas'
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
  allMoments,
  linkHref,
  removeItem,
  screensFor,
  screensOnSurfaces,
  surfacesOf,
  upgradeJourney,
  allScreens,
  servedMoments,
  toggleMoment,
  unlinkMoment,
  updateItem,
  updateStage,
  type ItemKind,
  type JourneyMap,
  type JourneyScreen,
} from '../data/userJourney'
import { readJson, readString, writeJson, writeString } from '../../lib/storage'
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
  /** A moment or a screen; only a screen carries `momentIds` and `link`. */
  item: JourneyScreen
  assignment: Assignment
  isNew: boolean
}

/** How many of the 300 personas hit each moment: demand, for deciding what matters (U105). */
const DEMAND = (() => {
  const m = new Map<string, number>()
  for (const p of generatePersonas()) for (const id of p.moments) m.set(id, (m.get(id) ?? 0) + 1)
  return m
})()
const GUIDE_KEY = 'aurelia.admin.journeyGuide'

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
  const [, setTab] = usePageTab()
  const requested = params.get('view') as View | null
  const view: View = tagsOn && requested && VIEWS.some((v) => v.id === requested) ? requested : 'map'

  const [map, setMap] = useState<JourneyMap>(() => upgradeJourney(readJson(STORAGE_KEY, JourneyMapSchema, INITIAL_JOURNEY)))
  // adminNav2 (U142): the tour no longer opens by itself over the page; the Tour button opens it.
  const [guide, setGuide] = useState(() => !RELEASES.adminNav2 && readString(GUIDE_KEY) !== 'seen')
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
  const surfaceGroup = tags.groups.find((g) => g.id === 'surface')
  /** With tags on, a moment's screens come from its Product surface tags (U105); without, from the screen's own list. */
  const screensOf = (momentId: string, tagIds?: string[]) =>
    tagsOn ? screensOnSurfaces(map, surfacesOf(tagIds ?? byId.get(momentId)?.assignment.tags ?? [])) : screensFor(map, momentId)
  const usersOfSurface = (surface: string) => moments.filter((m) => m.assignment.tags.includes(`surface:${surface}`))

  function closeGuide() {
    setGuide(false)
    writeString(GUIDE_KEY, 'seen')
  }

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
    setParams((prev) => keepTab(prev, next === 'map' ? {} : { view: next }), { replace: true })
  }

  function openItem(kind: ItemKind, stageId: string, item: JourneyScreen) {
    setEditing({ kind, stageId, item, assignment: byId.get(item.id)?.assignment ?? EMPTY, isNew: false })
  }

  function openNew(kind: ItemKind, stageId: string, surface?: string) {
    setEditing({
      kind,
      stageId,
      item: { id: uid(), title: '', description: '', feature: '', image: kind === 'moments' ? NEW_MOMENT_IMAGE : '', ...(surface ? { surface } : {}) },
      assignment: EMPTY,
      isNew: true,
    })
  }

  function saveEditing(e: Editing) {
    const base = { ...e.item, title: e.item.title.trim() || (e.kind === 'moments' ? 'Untitled moment' : 'Untitled screen'), description: e.item.description.trim(), feature: e.item.feature.trim() }
    // Only a screen keeps what it serves and where it lives; a moment saves as it always did.
    const { momentIds, link, surface, ...plain } = base
    const item: JourneyScreen = e.kind === 'screens' ? { ...plain, momentIds: momentIds ?? [], link: link?.trim() ?? '', ...(surface ? { surface } : {}) } : plain
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
    const removed = removeItem(map, e.stageId, e.kind, e.item.id)
    // A deleted moment leaves no dangling link on the screens that served it.
    const ok = saveMap(e.kind === 'moments' ? unlinkMoment(removed, e.item.id) : removed)
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
  // Summary (U142): the moment most personas hit that has no screen behind it.
  const gaps = moments
    .filter((m) => screensOf(m.id).length === 0)
    .map((m) => ({ m, demand: DEMAND.get(m.id) ?? 0 }))
    .sort((a, b) => b.demand - a.demand)
  const topGap = gaps[0]

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="User journey"
        description="When, where and why people reach for Aurelia, and what serves each moment. Use it to decide what to design or build next: a moment many personas hit, with no screen or only a concept behind it, is the gap. New here? Open the guide."
        actions={
          <div className="relative flex gap-8">
            <Button
              size="sm"
              icon={<CircleHelp size={13} />}
              onClick={() => {
                if (RELEASES.adminNav2) setTab('detail')
                setGuide(true)
              }}
              data-tour="guide"
            >
              {RELEASES.adminNav2 ? 'Tour' : 'Guide'}
            </Button>
            <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => openNew('moments', stageFilter ?? map.stages[0].id)}>
              Add moment
            </Button>
            <Button size="sm" icon={<MoreHorizontal size={14} />} aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)} data-tour="more">
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

      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
          <PageSummary
            purpose="seeing when people reach for Aurelia, and which of those moments still has no screen."
            question="Which moment should we design or build for next?"
            answer={
              topGap
                ? `“${topGap.m.title}” is the biggest gap: ${topGap.demand} of 300 personas hit it and no screen serves it yet.`
                : 'Every moment has at least one screen behind it.'
            }
            stats={[
              { label: 'Moments', value: String(counts.moments), note: `in ${map.stages.length} stages` },
              { label: 'Moments with no screen', value: String(gaps.length) },
              { label: 'Screens', value: String(counts.screens) },
            ]}
            next={[
              ...(topGap ? [{ text: `Open “${topGap.m.title}” in Detail and decide what should serve it.` }] : []),
              { text: 'Check the tags and the review status of each moment (Detail → Tags).' },
              { text: 'Export the journey and share it with the team when it changes.' },
            ]}
            note="Demand counts the 300 synthetic personas, not real users. Edits are saved in this browser only."
            onDetail={() => setTab('detail')}
          />
            <DataSources route="/admin/user-journey" />
          </div>
        }
      >
      {tagsOn && (
        <div className="flex flex-wrap items-center justify-between gap-10">
          <div className="flex flex-wrap gap-2 rounded-12 border border-adm-line bg-adm-surface p-4" role="tablist" aria-label="View" data-tour="views">
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
          <div className="flex flex-wrap items-center gap-8" data-tour="filters">
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

          {/* relative: the scroller contains its absolute children (sr-only labels), or they widen the page. */}
          <div className="relative min-w-0 overflow-x-auto rounded-12 border border-adm-line bg-adm-surface">
            <div className="grid" style={grid}>
              {stages.map((s) => {
                const shown = s.moments.filter((m) => !tagFilter || byId.get(m.id)?.assignment.tags.includes(tagFilter))
                return (
                  <section key={s.id} className="flex flex-col border-r border-adm-line last:border-r-0" aria-label={`${s.title} stage`}>
                    <header className="relative border-b border-adm-line px-16 pb-14 pt-16" data-tour={stages.indexOf(s) === 0 ? 'stage' : undefined}>
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
                        const served = screensOf(m.id).length
                        const demand = DEMAND.get(m.id) ?? 0
                        return (
                          <button
                            key={m.id}
                            type="button"
                            data-tour={stages.indexOf(s) === 0 && shown.indexOf(m) === 0 ? 'moment' : undefined}
                            onClick={() => openItem('moments', s.id, m)}
                            className="group flex flex-col gap-6 rounded-12 border border-adm-line bg-adm-surface p-8 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-adm-accent"
                          >
                            <span className="block aspect-[16/9] overflow-hidden rounded-8 bg-adm-hover">
                              {m.image && <img src={m.image} alt="" loading="lazy" className="size-full object-cover" />}
                            </span>
                            <span className="flex items-start justify-between gap-6 px-2">
                              <span className="text-13 font-semibold text-adm-ink">{m.title}</span>
                              {served > 0 && (
                                <span className="mt-2 inline-flex shrink-0 items-center gap-2 text-11 tabular-nums text-adm-muted" title={`${served} screen${served === 1 ? '' : 's'} serve this moment`}>
                                  <Smartphone size={11} aria-hidden="true" />
                                  {served}
                                  <span className="sr-only">{served === 1 ? 'screen' : 'screens'}</span>
                                </span>
                              )}
                            </span>
                            {m.description && <span className="line-clamp-3 px-2 text-12 leading-[18px] text-adm-ink-2">{m.description}</span>}
                            {demand > 0 && (
                              <span className="inline-flex items-center gap-4 px-2 text-11 tabular-nums text-adm-muted" title="Personas whose day includes this moment, of 300">
                                <Users size={11} aria-hidden="true" /> {demand} of 300 personas
                              </span>
                            )}
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
                    {showScreens && tagsOn && (
                      <div className="border-t border-adm-line p-12">
                        <p className="mb-8 text-10 font-semibold uppercase tracking-widest text-adm-muted">Screens these moments use</p>
                        <div className="flex flex-wrap gap-10">
                          {(() => {
                            const seen = new Map<string, { stageId: string; screen: JourneyScreen }>()
                            for (const m of shown) for (const x of screensOf(m.id)) seen.set(x.screen.id, x)
                            const list = [...seen.values()]
                            if (!list.length) return <p className="text-11 text-adm-critical">No moment here is tagged with a surface that has a screen.</p>
                            return list.map(({ stageId, screen: sc }) => (
                              <button key={sc.id} type="button" onClick={() => openItem('screens', stageId, sc)} className="group flex w-[84px] flex-col gap-4 text-left">
                                <span className="block h-[168px] w-[80px] rounded-[14px] bg-adm-sidebar p-3 transition-transform group-hover:-translate-y-2">
                                  <span className="flex size-full items-center justify-center overflow-hidden rounded-[11px] bg-adm-surface">
                                    {sc.image ? <img src={sc.image} alt="" loading="lazy" className="size-full object-cover object-top" /> : <ImagePlus size={14} className="text-adm-muted" />}
                                  </span>
                                </span>
                                <span className="text-11 font-medium leading-[14px] text-adm-ink">{sc.title}</span>
                              </button>
                            ))
                          })()}
                        </div>
                      </div>
                    )}
                    {showScreens && !tagsOn && (
                      <div className="border-t border-adm-line p-12">
                        <p className="mb-8 text-10 font-semibold uppercase tracking-widest text-adm-muted">Screens</p>
                        <div className="flex flex-wrap gap-10">
                          {s.screens.map((sc) => {
                            const serves = servedMoments(map, sc).length
                            return (
                            <button key={sc.id} type="button" onClick={() => openItem('screens', s.id, sc)} className="group flex w-[84px] flex-col gap-4 text-left">
                              <span className="block h-[168px] w-[80px] rounded-[14px] bg-adm-sidebar p-3 transition-transform group-hover:-translate-y-2">
                                <span className="flex size-full items-center justify-center overflow-hidden rounded-[11px] bg-adm-surface">
                                  {sc.image ? <img src={sc.image} alt="" loading="lazy" className="size-full object-cover object-top" /> : <ImagePlus size={14} className="text-adm-muted" />}
                                </span>
                              </span>
                              <span className="text-11 font-medium leading-[14px] text-adm-ink">{sc.title}</span>
                              <span className={`text-10 leading-[12px] ${serves ? 'text-adm-muted' : 'text-adm-critical'}`}>{serves ? `Serves ${serves} moment${serves === 1 ? '' : 's'}` : 'No moment linked'}</span>
                            </button>
                            )
                          })}
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
          {tagsOn && surfaceGroup && (
            <section className="flex flex-col gap-12 rounded-12 border border-adm-line bg-adm-surface p-16" data-tour="surfaces" aria-label="Product surfaces">
              <div>
                <h2 className="text-15 font-semibold text-adm-ink">Product surfaces</h2>
                <p className="mt-2 text-12 text-adm-muted">
                  The parts of the app that serve moments, each with its screen. A moment shows the screen of every surface it is tagged with, so the tag and the picture always agree. Change which surfaces exist in Tag setup.
                </p>
              </div>
              <div className="flex flex-wrap gap-14">
                {surfaceGroup.tags.map((t) => {
                  const list = allScreens(map).filter((x) => x.screen.surface === t.id)
                  const used = usersOfSurface(t.id).length
                  return (
                    <div key={t.id} className="flex flex-col gap-6">
                      <p className="text-12 font-medium text-adm-ink">{t.label}</p>
                      <div className="flex gap-8">
                        {list.map(({ stageId, screen: sc }) => (
                          <button key={sc.id} type="button" onClick={() => openItem('screens', stageId, sc)} className="group flex w-[84px] flex-col gap-4 text-left" aria-label={`${t.label}: ${sc.title}`}>
                            <span className="block h-[168px] w-[80px] rounded-[14px] bg-adm-sidebar p-3 transition-transform group-hover:-translate-y-2">
                              <span className="flex size-full items-center justify-center overflow-hidden rounded-[11px] bg-adm-surface">
                                {sc.image ? <img src={sc.image} alt="" loading="lazy" className="size-full object-cover object-top" /> : <ImagePlus size={14} className="text-adm-muted" />}
                              </span>
                            </span>
                            <span className="text-11 font-medium leading-[14px] text-adm-ink">{sc.title}</span>
                          </button>
                        ))}
                        {list.length === 0 && (
                          <button
                            type="button"
                            onClick={() => openNew('screens', map.stages[0].id, t.id)}
                            className="flex h-[168px] w-[80px] flex-col items-center justify-center gap-4 rounded-[14px] border border-dashed border-adm-critical px-4 text-center text-10 text-adm-critical hover:bg-adm-hover"
                          >
                            <ImagePlus size={14} /> Add its screen
                          </button>
                        )}
                      </div>
                      <p className={`text-10 ${used ? 'text-adm-muted' : 'text-adm-critical'}`}>{used ? `Serves ${used} moment${used === 1 ? '' : 's'}` : 'No moment tagged'}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
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
      <DataSources route="/admin/user-journey" full />
      </PageTabs>

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
          surfaces={tagsOn ? (surfaceGroup?.tags ?? []) : null}
          surfaceUsers={(surface) => usersOfSurface(surface).map((m) => m.title)}
          screensOf={screensOf}
          demand={DEMAND}
          onClose={() => setEditing(null)}
          onSave={saveEditing}
          onDelete={deleteEditing}
          onOpenScreen={(stageId, screen) => openItem('screens', stageId, screen)}
        />
      )}

      {guide && <GuideTour steps={guideSteps(tagsOn)} onClose={closeGuide} />}

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
  surfaces,
  surfaceUsers,
  screensOf,
  demand,
  onClose,
  onSave,
  onDelete,
  onOpenScreen,
}: {
  editing: Editing
  map: JourneyMap
  groups: TagGroup[] | null
  /** With tags on: the Product surface tags a screen can show. */
  surfaces: { id: string; label: string }[] | null
  surfaceUsers: (surface: string) => string[]
  screensOf: (momentId: string, tagIds?: string[]) => { stageId: string; screen: JourneyScreen }[]
  demand: Map<string, number>
  onClose: () => void
  onSave: (e: Editing) => void
  onDelete: (e: Editing) => void
  onOpenScreen: (stageId: string, screen: JourneyScreen) => void
}) {
  const [draft, setDraft] = useState(editing)
  const [error, setError] = useState<string | null>(null)
  const moment = draft.kind === 'moments'
  const noun = moment ? 'moment' : 'screen'
  const set = (patch: Partial<JourneyScreen>) => setDraft({ ...draft, item: { ...draft.item, ...patch } })

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
      description={!moment ? 'A product screen, the moments it serves and where it lives.' : groups ? 'Details, then tags and review.' : 'What happens, and the feature it suggests.'}
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
        {moment && (
          <p className="inline-flex items-center gap-6 text-12 text-adm-ink-2">
            <Users size={13} aria-hidden="true" /> {demand.get(draft.item.id) ?? 0} of the 300 personas have this moment in their day.
          </p>
        )}
        {moment ? (
          <MomentScreens map={map} screens={screensOf(draft.item.id, draft.assignment.tags)} bySurface={!!surfaces} onOpen={onOpenScreen} />
        ) : surfaces ? (
          <ScreenSurface draft={draft.item} surfaces={surfaces} users={draft.item.surface ? surfaceUsers(draft.item.surface) : []} onChange={set} />
        ) : (
          <ScreenLinks map={map} draft={draft.item} onChange={set} />
        )}
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

/** Read-only: the screens that serve a moment. None is the signal a design is missing. */
function MomentScreens({
  map,
  screens,
  bySurface,
  onOpen,
}: {
  map: JourneyMap
  screens: { stageId: string; screen: JourneyScreen }[]
  bySurface: boolean
  onOpen: (stageId: string, screen: JourneyScreen) => void
}) {
  return (
    <div className="flex flex-col gap-8 border-t border-adm-line pt-16">
      <div>
        <h3 className="text-13 font-semibold text-adm-ink">Screens</h3>
        <p className="mt-2 text-12 text-adm-muted">
          {bySurface ? 'From the Product surface tags below: tag a surface and its screen appears here.' : "The product screens that serve this moment. Link one from the screen's own panel."}
        </p>
      </div>
      {screens.length === 0 ? (
        <p className="inline-flex items-center gap-6 rounded-8 border border-dashed border-adm-line px-10 py-8 text-12 text-adm-critical">
          <AlertCircle size={13} aria-hidden="true" /> No screen yet
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {screens.map(({ stageId, screen }) => (
            <li key={screen.id}>
              <button type="button" onClick={() => onOpen(stageId, screen)} className="flex w-full items-center gap-10 rounded-8 border border-adm-line p-6 text-left hover:bg-adm-hover">
                <span className="flex h-[52px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-4 bg-adm-hover">
                  {screen.image ? <img src={screen.image} alt="" className="size-full object-cover object-top" /> : <ImagePlus size={11} className="text-adm-muted" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-12 font-medium text-adm-ink">{screen.title}</span>
                  <span className="block text-11 text-adm-muted">{map.stages.find((s) => s.id === stageId)?.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** With tags on (U105): the surface a screen shows, the moments tagged with it, and where it lives. */
function ScreenSurface({
  draft,
  surfaces,
  users,
  onChange,
}: {
  draft: JourneyScreen
  surfaces: { id: string; label: string }[]
  users: string[]
  onChange: (patch: Partial<JourneyScreen>) => void
}) {
  const href = linkHref(draft.link)
  return (
    <div className="flex flex-col gap-14 border-t border-adm-line pt-16">
      <FormField label="Product surface" hint="The part of the app this screen shows. Moments tagged with it show this screen.">
        <select className={inputClass} value={draft.surface ?? ''} onChange={(e) => onChange({ surface: e.target.value || undefined })}>
          <option value="">Not chosen</option>
          {surfaces.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </FormField>
      <div className="flex flex-col gap-4">
        <span className="text-12 font-medium text-adm-ink-2">Serves</span>
        {users.length ? (
          <ul className="flex list-disc flex-col gap-2 pl-16 text-12 text-adm-ink">
            {users.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        ) : (
          <p className="text-12 text-adm-critical">{draft.surface ? 'No moment is tagged with this surface yet.' : 'Choose a surface to link this screen to moments.'}</p>
        )}
      </div>
      <FormField label="Link" hint="Where it lives: app route or Figma URL">
        <div className="flex gap-8">
          <input aria-label="Link" className={`${inputClass} min-w-0 flex-1`} value={draft.link ?? ''} placeholder="/play/… or https://www.figma.com/…" onChange={(e) => onChange({ link: e.target.value })} />
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-4 rounded-8 border border-adm-line px-10 text-12 font-medium text-adm-ink hover:bg-adm-hover">
              <ExternalLink size={12} aria-hidden="true" /> Open
            </a>
          )}
        </div>
      </FormField>
    </div>
  )
}

/** A screen's moments (any stage) and where it lives. */
function ScreenLinks({ map, draft, onChange }: { map: JourneyMap; draft: JourneyScreen; onChange: (patch: Partial<JourneyScreen>) => void }) {
  const chosen = new Set(draft.momentIds ?? [])
  const all = allMoments(map)
  const href = linkHref(draft.link)
  const selected = servedMoments(map, draft).length
  return (
    <div className="flex flex-col gap-14 border-t border-adm-line pt-16">
      <fieldset className="flex min-w-0 flex-col gap-10">
        <legend className="text-13 font-semibold text-adm-ink">Serves these moments</legend>
        <p className="text-12 text-adm-muted">{selected ? `${selected} selected, from any stage.` : 'None yet. Pick the moments this screen answers, in any stage.'}</p>
        {map.stages.map((s) => {
          const items = all.filter((m) => m.stageId === s.id)
          if (items.length === 0) return null
          return (
            <div key={s.id} className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-6 text-10 font-semibold uppercase tracking-widest text-adm-muted">
                <span className="size-6 rounded-full" style={{ background: s.color }} aria-hidden="true" /> {s.title}
              </span>
              {items.map(({ moment: m }) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-8 rounded-8 px-6 py-4 text-12 text-adm-ink hover:bg-adm-hover">
                  <input type="checkbox" checked={chosen.has(m.id)} onChange={(e) => onChange({ momentIds: toggleMoment(draft, m.id, e.target.checked).momentIds })} />
                  <span className="min-w-0 flex-1">{m.title}</span>
                </label>
              ))}
            </div>
          )
        })}
      </fieldset>
      <FormField label="Link" hint="Where it lives: app route or Figma URL">
        <div className="flex gap-8">
          <input aria-label="Link" className={`${inputClass} min-w-0 flex-1`} value={draft.link ?? ''} placeholder="/play/… or https://www.figma.com/…" onChange={(e) => onChange({ link: e.target.value })} />
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-4 rounded-8 border border-adm-line px-10 text-12 font-medium text-adm-ink hover:bg-adm-hover">
              <ExternalLink size={12} aria-hidden="true" /> Open
            </a>
          )}
        </div>
      </FormField>
    </div>
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

/** The guide for this page (U105). Tag steps only where tags are on. */
function guideSteps(tagsOn: boolean): TourStep[] {
  const steps: (TourStep | false)[] = [
    {
      title: 'What this map is for',
      body: (
        <>
          It maps the <b>moments</b> people reach for Aurelia: when, where and why. It also shows what in the product serves each one. Use it to decide what to design or build next. A moment that many personas have, with no screen or only a concept behind it, is a gap.
        </>
      ),
    },
    { target: 'stage', title: 'Four stages', body: 'Moments are grouped by the role they play in someone’s day: Reflect, Create, Experience, Share. Each stage answers the question under its name. Rename the stages from More.' },
    {
      target: 'moment',
      title: 'Reading a moment',
      body: 'What happens, and the feature it suggests. How many of the 300 personas have it in their day (demand). How ready that feature is (Live, Partly built, Concept). Whether the team has agreed on it, and how many screens serve it. Select a moment to edit everything about it in one panel.',
    },
    tagsOn && {
      target: 'views',
      title: 'Tags, review and coverage',
      body: 'Tags & review classifies every moment the same way (time, context, trigger, need, state, time available, surface, readiness), and marks it Agreed or To discuss. Coverage shows the tags no moment covers yet: the gaps. Tag setup holds the groups and their tags.',
    },
    tagsOn && {
      target: 'surfaces',
      title: 'Screens are product surfaces',
      body: 'Each surface has its screen. A moment shows the screen of every surface it is tagged with, so the tag and the picture cannot disagree. A red dashed card is a surface with no screenshot yet; a red line under one means no moment uses it.',
    },
    { target: 'filters', title: 'Narrow it down', body: tagsOn ? 'Show one stage, or only the moments with one tag (Night, for example), to see everything that serves it. Hide the screens to read the moments alone.' : 'Show one stage at a time, or hide the screens to read the moments alone.' },
    { target: 'more', title: 'Saving and sharing', body: 'Edits are saved in this browser only, until there is a backend. Export a JSON file to share it with the team, Import theirs, or Restore the original to start again.' },
    {
      title: 'A working session, in five steps',
      body: (
        <ol className="flex list-decimal flex-col gap-4 pl-18">
          <li>Pick a stage.</li>
          <li>Open each moment: check what happens and its feature{tagsOn ? ', tag it, and set Agreed or To discuss with a note' : ''}.</li>
          <li>{tagsOn ? 'Open Coverage and note the gaps.' : 'Check each moment has a screen.'}</li>
          <li>{tagsOn ? 'Check every product surface has a real screenshot.' : 'Add the screens that are missing.'}</li>
          <li>Export, and share the file with the team.</li>
        </ol>
      ),
    },
    { target: 'guide', title: 'Open this again', body: 'The Guide button runs this tour again whenever you need it.' },
  ]
  return steps.filter((x): x is TourStep => !!x)
}
