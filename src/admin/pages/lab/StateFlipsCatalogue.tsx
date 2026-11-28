import { PanelRightOpen } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Panel, inputClass } from '../../components/ui'
import { FAMILIES, FAMILY, akpById, akpByIdAny, akpSummary, akps, akpsForFlip, akpsWithDeleted, type Akp, type AkpFamily } from '../../data/akps'
import { AKP_LINK_TYPES, makeEdit, nextAkpId, usedForLine } from '../../data/akpEdits'
import { useAkpEdits } from '../../data/akpEditsSync'
import { AkpEditBar, AkpEditPanel, AkpExplainer } from './AkpEditor'
import { FAMILY_LOOK, GOAL_LOOK, MODALITY_LOOK } from './akpStyle'
import { DIMENSION_LABEL, type Dimension } from '../../data/personaConditionV4'
import { generatePersonasV4 } from '../../data/personasV4'
import { DRAFTED, STATEFLIP_DIMENSIONS, flipNumbers, stateFlipById, stateFlipSummary, stateFlips, type StateFlip } from '../../data/stateFlips'
import { LAYER_TEXT, type Layer } from '../../data/stateFlipSleep'
import { useDetail } from '../reports/DetailDrawer'
import { CHAPTER_GOAL, CHAPTER_LINKS, CHAPTER_LINK_TEXT, CHAPTER_MODALITIES, CHAPTER_PHASES, chapterNodeById, chapterNodes, type ChapterModality } from '../../data/akpChapterGraph'
import { AkpGraph, Mark, type GraphEditing, type GraphLink, type GraphNode, type LinkStyle } from './AkpGraph'

/*
 * Admin → Product lab → StateFlips, tabs "All StateFlips" and "AKP catalogue"
 * (U141, J203): the 125 StateFlips with filters and a drawer for each, and
 * the draft catalogue of about 1,000 AKPs with filters, search, counts and a
 * small view of one StateFlip's AKPs. Data: data/stateFlips.ts, data/akps.ts.
 */

const pct = (x: number) => (Number.isFinite(x) ? `${Math.round(x * 100)}%` : '–')
const usd = (x: number) => (Number.isFinite(x) ? `$${x.toFixed(2)}` : '–')
const num = (x: number) => (Number.isFinite(x) ? `${x}` : '–')
const flipTitle = (id: string) => stateFlipById(id)?.title

function SourceBadge({ source }: { source: string }) {
  const drafted = source === DRAFTED || source.startsWith('drafted')
  return (
    <span title={source}>
      <Badge tone={drafted ? 'serious' : 'good'}>{drafted ? 'Drafted' : 'From file'}</Badge>
    </span>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-adm-line pt-10">
      <h3 className="text-12 font-semibold text-adm-ink">{title}</h3>
      {children}
    </section>
  )
}

/* -------------------------------------------------------- StateFlip drawer */

function FlipDetail({ f }: { f: StateFlip }) {
  const n = flipNumbers(f)
  const linked = akpsForFlip(f.id).filter((a) => a.kind === 'strategy')
  const people = useMemo(() => {
    const byId = new Map(generatePersonasV4().map((p) => [p.id, p]))
    return n.ids.slice(0, 8).map((id) => byId.get(id)!)
  }, [n.ids])
  const open = useDetail()
  return (
    <div className="flex flex-col gap-10 text-12 text-adm-ink-2" data-flip-detail>
      <Sub title="Bad and good state">
        <p>
          <span className="font-semibold text-adm-ink">Bad:</span> {f.bad}. <span className="font-semibold text-adm-ink">Good:</span> {f.good}.
        </p>
        <p>
          Universal need: {f.need.label} {f.need.id && <span className="text-adm-muted">({f.need.id})</span>}. <SourceBadge source={f.need.source} />
        </p>
        <p className="text-11 text-adm-muted">Source: {f.source}</p>
      </Sub>
      <Sub title="Steps X → Y → Z">
        <ol className="flex flex-col gap-4">
          {f.milestones.map((m) => (
            <li key={m.id}>
              <span className="font-semibold text-adm-ink">
                {m.id} · {m.title}
              </span>{' '}
              <span className="text-adm-muted">(score {m.threshold}, {LAYER_TEXT[m.layer].name.toLowerCase()})</span>: {m.what}
            </li>
          ))}
        </ol>
        <p className="text-11 text-adm-muted">
          Main causal layer: {LAYER_TEXT[f.layer].name} ({LAYER_TEXT[f.layer].pace}). {f.layerSource === DRAFTED ? 'Drafted by us — to review.' : f.layerSource}
        </p>
      </Sub>
      <Sub title="Check-in after each chapter">
        <p>{f.measure.scale}</p>
        <ul className="flex flex-col gap-4">
          {f.measure.markers.map((m) => (
            <li key={m.label}>
              <span className="font-semibold text-adm-ink">{m.label}:</span> {m.question} <span className="text-adm-muted">Bad {m.bad}; good {m.good}.</span>
            </li>
          ))}
        </ul>
        <p className="text-11 text-adm-muted">Source: {f.measure.source}</p>
      </Sub>
      <Sub title="Who has it (1,000 v4 personas)">
        <p>
          {n.withIssue} have this issue in their {DIMENSION_LABEL[f.dimension].toLowerCase()} condition; for {n.mainNeed} it is the main need. The numbers follow {n.group}: {n.basis}
        </p>
        <p className="text-11 text-adm-muted">
          Prevalence: {f.prevalence} ({f.prevalenceSource})
        </p>
        {people.length > 0 && (
          <ul className="flex flex-wrap gap-4" aria-label="People in the group">
            {people.map((p) => (
              <li key={p.id} className="rounded-8 border border-adm-line px-6 py-2 text-11">
                {p.name}, {p.age}, {p.country}
              </li>
            ))}
            {n.ids.length > people.length && <li className="px-6 py-2 text-11 text-adm-muted">+ {n.ids.length - people.length} more</li>}
          </ul>
        )}
      </Sub>
      <Sub title="DOJO links">
        <p>Concepts: {f.dojo.concepts.join(', ') || 'none matched'}. Duals: {f.dojo.duals.join(', ') || 'none matched'}. Skills: {f.dojo.skills.join(', ')}.</p>
      </Sub>
      <Sub title={`Strategy AKPs that serve it (${linked.length})`}>
        <ul className="flex flex-wrap gap-4">
          {linked.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => open(akpItem(a.id))} className="inline-flex items-center gap-4 rounded-8 border border-adm-line px-6 py-2 text-11 text-adm-ink hover:bg-adm-hover">
                <Mark look={FAMILY_LOOK[a.family]} />
                {a.id} {a.name}
              </button>
            </li>
          ))}
        </ul>
      </Sub>
    </div>
  )
}

function flipItem(f: StateFlip) {
  const n = flipNumbers(f)
  return {
    kicker: `${f.id} · ${DIMENSION_LABEL[f.dimension]}`,
    title: f.title,
    summary: `${n.group} people in the v4 set would follow this StateFlip. Half of them would get there within ${num(n.medianChapters)} chapters if it works for them; on average it works for ${pct(n.meanChance)}.`,
    numbers: [
      { label: 'People (group)', value: `${n.group}` },
      { label: 'Chapters, middle person', value: num(n.medianChapters) },
      { label: 'Chance it works', value: pct(n.meanChance) },
      { label: 'Cost per flip (stage 1)', value: usd(n.costPerFlip) },
    ],
    extra: <FlipDetail f={f} />,
  }
}

/* ------------------------------------------------------------ AKP drawer */

function AkpDetail({ id }: { id: string }) {
  const open = useDetail()
  useAkpEdits()
  const a = akpByIdAny(id)
  if (!a) return <p className="text-12 text-adm-muted">This AKP no longer exists: it was added in the admin and its edits were reverted.</p>
  return (
    <div className="flex flex-col gap-10 text-12 text-adm-ink-2" data-akp-detail>
      <p className="rounded-8 bg-adm-bg p-8 text-13 text-adm-ink" data-used-for>
        {usedForLine(a, flipTitle)}
      </p>
      <p>{a.description || <span className="text-adm-muted">No description yet.</span>}</p>
      <p className="text-11 text-adm-muted">Causal role: {a.causalRole || '–'}</p>
      <p className="text-11 text-adm-muted">
        Source: {a.source} · status {a.status}
        {a.edited ? ' · edited in the admin' : ''}
      </p>
      <Sub title={`StateFlips it serves (${a.flips.length})`}>
        {a.flips.length ? (
          <ul className="flex flex-wrap gap-4">
            {a.flips.map((fid) => {
              const f = stateFlipById(fid)
              if (!f) return null
              return (
                <li key={fid}>
                  <button type="button" onClick={() => open(flipItem(f))} className="rounded-8 border border-adm-line px-6 py-2 text-11 text-adm-ink hover:bg-adm-hover">
                    {fid} {f.title}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-adm-muted">None linked yet{a.family === 'product' ? ': product AKPs serve the app, not one goal.' : '.'}</p>
        )}
      </Sub>
      <Sub title="Edit">
        <AkpEditPanel key={JSON.stringify(a)} a={a} onSaved={(x) => open(akpItem(x))} onOpenAkp={(x) => open(akpItem(x))} />
      </Sub>
    </div>
  )
}

function akpItem(id: string) {
  const a = akpByIdAny(id)
  if (!a) return { title: id, extra: <AkpDetail id={id} /> }
  return {
    kicker: `${a.id} · ${FAMILY[a.family].label} · ${a.kind === 'goal' ? 'Goal AKP' : 'Strategy / tactic AKP'}${a.deleted ? ' · deleted' : ''}`,
    title: a.name,
    numbers: [
      { label: 'Layer', value: a.layer || '–' },
      { label: 'Modality', value: a.modality },
      { label: 'Function', value: a.fn },
      { label: 'Source', value: a.added ? 'Added in the admin' : a.fromFile ? 'From file' : 'Drafted' },
    ],
    extra: <AkpDetail id={id} />,
  }
}

/** Adds a blank AKP (serving one StateFlip when given) and returns its id. */
function addAkp(store: ReturnType<typeof useAkpEdits>, flip?: string): string {
  const family: AkpFamily = 'script'
  const id = nextAkpId(family, (x) => !!akpByIdAny(x))
  store.commit([...store.edits, makeEdit('add', id, store.who, { value: { name: 'New AKP', family, layer: 'Concepts', modality: 'Script', flips: flip ? [flip] : [] } })])
  return id
}

/* ------------------------------------------------------- All StateFlips */

export function AllStateFlips() {
  const open = useDetail()
  const fs = stateFlips()
  const s = stateFlipSummary()
  const [dim, setDim] = useState('all')
  const [layer, setLayer] = useState('all')
  const [origin, setOrigin] = useState('all')
  const [q, setQ] = useState('')
  const rows = useMemo(() => fs.map((f) => ({ f, n: flipNumbers(f) })), [fs])
  const shown = rows.filter(({ f }) => (dim === 'all' || f.dimension === dim) && (layer === 'all' || f.layer === layer) && (origin === 'all' || f.origin === origin) && (!q || `${f.id} ${f.title} ${f.need.label}`.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="flex min-w-0 flex-col gap-16" data-all-stateflips>
      <section aria-label="Summary" className="flex min-w-0 flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
        <p className="max-w-[860px] text-16 font-semibold leading-snug text-adm-ink">
          {s.total} StateFlips, 25 in each dimension. {s.fromIssues} come from the persona condition issues, {s.fromUN} from the Deeksha universal needs and {s.fromDuals} from the DOJO duals; {s.linkedToUN} are tied to a universal need.
        </p>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {STATEFLIP_DIMENSIONS.map((d) => (
            <div key={d.id} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg p-10">
              <dt className="text-11 text-adm-muted">{d.label}</dt>
              <dd className="text-20 font-semibold tabular-nums text-adm-ink">{s.byDim[d.id]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-12 text-adm-ink-2">
          Main causal layer: mood {s.byLayer.mood}, habit {s.byLayer.habit}, skill {s.byLayer.skill}. The steps and check-in questions of every StateFlip but sleep are drafted by us from one template, to review. Chapters, chance and cost use the sleep formulas on the personas whose condition has the issue; StateFlips 11–25 borrow the people of their closest issue, so several share the same numbers.
        </p>
      </section>
      <Panel title="All StateFlips" description="Filter, then open a row for the full detail, the AKPs that serve it and who has it.">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <Select label="Dimension" value={dim} onChange={setDim} options={[['all', 'All'], ...STATEFLIP_DIMENSIONS.map((d) => [d.id, d.label] as [string, string])]} />
          <Select label="Causal layer" value={layer} onChange={setLayer} options={[['all', 'All'], ...(['mood', 'habit', 'skill'] as Layer[]).map((l) => [l, LAYER_TEXT[l].name] as [string, string])]} />
          <Select label="Comes from" value={origin} onChange={setOrigin} options={[['all', 'All'], ['issue', 'Condition issues'], ['workbook', 'Workbook rows']]} />
          <label className="flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted">
            Search
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. trust" className={inputClass} />
          </label>
        </div>
        <p className="text-12 text-adm-muted" aria-live="polite">
          {shown.length} of {fs.length}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-12" data-flips-table>
            <thead>
              <tr className="border-b border-adm-line text-11 text-adm-muted">
                <th className="py-6 pr-10 font-medium">StateFlip</th>
                <th className="py-6 pr-10 font-medium">Dimension</th>
                <th className="py-6 pr-10 font-medium">Layer</th>
                <th className="py-6 pr-10 font-medium">Need</th>
                <th className="py-6 pr-10 text-right font-medium">People</th>
                <th className="py-6 pr-10 text-right font-medium">Chapters</th>
                <th className="py-6 pr-10 text-right font-medium">Chance</th>
                <th className="py-6 text-right font-medium">Cost / flip</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ f, n }) => (
                <tr key={f.id} className="border-b border-adm-line last:border-0">
                  <td className="py-6 pr-10">
                    <button type="button" onClick={() => open(flipItem(f))} className="group inline-flex items-start gap-6 text-left text-adm-ink hover:underline">
                      <span className="shrink-0 tabular-nums text-adm-muted">{f.id}</span>
                      <span>{f.title}</span>
                      <PanelRightOpen size={12} aria-hidden="true" className="mt-2 shrink-0 text-adm-muted" />
                    </button>
                  </td>
                  <td className="py-6 pr-10 text-adm-ink-2">{DIMENSION_LABEL[f.dimension as Dimension]}</td>
                  <td className="py-6 pr-10 text-adm-ink-2">{LAYER_TEXT[f.layer].name}</td>
                  <td className="py-6 pr-10 text-adm-ink-2">{f.need.id || '–'}</td>
                  <td className="py-6 pr-10 text-right tabular-nums">{n.group}</td>
                  <td className="py-6 pr-10 text-right tabular-nums">{num(n.medianChapters)}</td>
                  <td className="py-6 pr-10 text-right tabular-nums">{pct(n.meanChance)}</td>
                  <td className="py-6 text-right tabular-nums">{usd(n.costPerFlip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------- AKP catalogue */

const MOD_LOOK = MODALITY_LOOK as Record<ChapterModality, (typeof MODALITY_LOOK)[string]>

const LINK_STYLES: Record<string, LinkStyle> = {
  drives: { label: 'Drives', cls: 'stroke-adm-ink', width: 2 },
  serves: { label: 'Serves', cls: 'stroke-adm-ink', width: 1.5 },
  'part-of': { label: 'Part of', cls: 'stroke-adm-muted', width: 1.5 },
  'step-of': { label: 'Step of', cls: 'stroke-adm-muted', width: 1.5 },
  syncs: { label: 'Keeps time with', cls: 'stroke-adm-muted', width: 1.5, dash: '6 4' },
  reinforces: { label: 'Reinforces', cls: 'stroke-adm-muted', width: 1.25, dash: '2 3' },
  cues: { label: 'Cues', cls: 'stroke-adm-axis', width: 1.5, dash: '1 4' },
  supports: { label: 'Supports', cls: 'stroke-adm-muted', width: 1.25, dash: '2 3' },
  feeds: { label: 'Feeds', cls: 'stroke-adm-muted', width: 1.25 },
  'fed-by': { label: 'Is fed by', cls: 'stroke-adm-muted', width: 1.25, dash: '6 4' },
  mirrors: { label: 'Mirrors', cls: 'stroke-adm-axis', width: 1.5, dash: '1 4' },
}

const CHAPTER = 'chapter-1'
const MAX_FLIP_NODES = 40

function chapterItem(id: string) {
  const n = chapterNodeById(id)!
  const out = CHAPTER_LINKS.filter((l) => l.from === id)
  const inc = CHAPTER_LINKS.filter((l) => l.to === id)
  const phases = CHAPTER_PHASES.filter((p) => p.drivers.includes(id))
  const name = (x: string) => (x === CHAPTER_GOAL.id ? CHAPTER_GOAL.name : chapterNodeById(x)?.name ?? x)
  return {
    kicker: `${n.id} · ${n.modality} · Sleep, chapter 1`,
    title: n.name,
    numbers: [
      { label: 'Layer', value: n.layer },
      { label: 'Modality', value: n.modality },
      { label: 'Links', value: `${out.length + inc.length}` },
      { label: 'Source', value: n.inCatalogue ? 'Catalogue' : 'Drafted' },
    ],
    extra: (
      <div className="flex flex-col gap-10 text-12 text-adm-ink-2" data-chapter-node>
        <p>{n.role}</p>
        <p className="text-11 text-adm-muted">Source: {n.source}</p>
        <Sub title="Drives the uplift in">
          <p>{phases.map((p) => `${p.name} (minutes ${p.minutes[0]}–${p.minutes[1]})`).join(', ')}</p>
        </Sub>
        <Sub title="Links">
          <ul className="flex flex-col gap-2">
            {out.map((l) => (
              <li key={`o${l.to}`}>
                {CHAPTER_LINK_TEXT[l.type].verb} <span className="font-medium text-adm-ink">{name(l.to)}</span>
              </li>
            ))}
            {inc.map((l) => (
              <li key={`i${l.from}`}>
                <span className="font-medium text-adm-ink">{name(l.from)}</span> {CHAPTER_LINK_TEXT[l.type].verb} this
              </li>
            ))}
          </ul>
        </Sub>
      </div>
    ),
  }
}

function chapterGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  return {
    nodes: [
      { id: CHAPTER_GOAL.id, label: CHAPTER_GOAL.name, group: 'Goal', look: GOAL_LOOK, goal: true },
      ...chapterNodes().map((n) => ({ id: n.id, label: n.name, group: `${n.modality} · ${n.layer}`, look: MOD_LOOK[n.modality], draft: !n.inCatalogue })),
    ],
    links: CHAPTER_LINKS.map((l) => ({ ...l })),
  }
}

/** `_version` only ties the memo to the edits in force; the data comes from akps(). */
function flipGraph(flipId: string, _version = 0): { nodes: GraphNode[]; links: GraphLink[] } {
  const goalId = flipId.replace(/^SF-/, 'WG-')
  const goal = akpById(goalId) ?? akpByIdAny(goalId)!
  const steps = ['X', 'Y', 'Z'].map((m) => akpById(`${goalId}-${m}`)).filter((a) => a !== undefined)
  const strategy = akps().filter((a) => a.kind === 'strategy' && a.flips.includes(flipId)).slice(0, MAX_FLIP_NODES)
  const set = new Set([goalId, ...steps.map((a) => a.id), ...strategy.map((a) => a.id)])
  const node = (a: Akp & { edited?: boolean; added?: boolean }, tier: number): GraphNode => ({ id: a.id, label: tier === 0 ? a.id.replace('WG-', '') : a.name, group: `${FAMILY[a.family].label} · ${a.layer || 'no layer'}`, look: FAMILY_LOOK[a.family], goal: tier === 0, draft: !a.fromFile && !a.added, edited: a.edited, tier })
  const links: GraphLink[] = [
    ...steps.map((a) => ({ from: a.id, to: goalId, type: 'step-of' })),
    ...strategy.map((a) => ({ from: a.id, to: goalId, type: 'serves' })),
    ...[...steps, ...strategy].flatMap((a) => a.links.filter((l) => set.has(l.to) && !(l.to === goalId && l.type === 'step-of')).map((l) => ({ from: a.id, to: l.to, type: l.type }))),
  ]
  return { nodes: [node(goal, 0), ...steps.map((a) => node(a, 1)), ...strategy.map((a) => node(a, 2))], links }
}

function Chip({ on, onClick, dot, children }: { on: boolean; onClick: () => void; dot?: ReactNode; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`inline-flex items-center gap-4 rounded-full border px-10 py-4 text-11 font-medium ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink-2 hover:bg-adm-hover'}`}>
      {dot}
      {children}
    </button>
  )
}

function StatCard({ dot, label, value, sub }: { dot?: ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg p-10">
      <dt className="inline-flex min-w-0 items-center gap-4 text-11 text-adm-muted">
        {dot}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="text-20 font-semibold tabular-nums text-adm-ink">{value.toLocaleString('en')}</dd>
      {sub && <dd className="text-11 text-adm-muted">{sub}</dd>}
    </div>
  )
}

function ChapterPhases() {
  const open = useDetail()
  return (
    <ol className="grid gap-8 lg:grid-cols-4" data-chapter-phases>
      {CHAPTER_PHASES.map((p) => (
        <li key={p.id} className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12">
          <span className="text-12 font-semibold text-adm-ink">
            {p.name} · minutes {p.minutes[0]}–{p.minutes[1]}
          </span>
          <span className="text-12 text-adm-ink-2">{p.what}</span>
          <span className="text-11 text-adm-muted">About {pct(p.share)} of the chapter’s uplift (assumption)</span>
          <ul className="flex flex-wrap gap-4">
            {p.drivers.map((id) => {
              const n = chapterNodeById(id)!
              return (
                <li key={id}>
                  <button type="button" onClick={() => open(chapterItem(id))} className="inline-flex items-center gap-4 rounded-full border border-adm-line px-8 py-2 text-11 text-adm-ink hover:bg-adm-hover">
                    <Mark look={MOD_LOOK[n.modality]} />
                    {n.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )
}

function RelationshipGraph() {
  const open = useDetail()
  const store = useAkpEdits()
  const [focus, setFocus] = useState(CHAPTER_GOAL.flip)
  const [mods, setMods] = useState<string[]>([])
  const [layer, setLayer] = useState('all')
  const isChapter = focus === CHAPTER
  const editsNow = store.edits
  const base = useMemo(() => (isChapter ? chapterGraph() : flipGraph(focus, editsNow.length)), [focus, isChapter, editsNow])
  const modOf = (n: GraphNode) => n.group.split(' · ')[0]
  const layerOf = (n: GraphNode) => n.group.split(' · ').slice(1).join(' · ')
  const modalities = [...new Set(base.nodes.filter((n) => !n.goal).map(modOf))]
  const layers = [...new Set(base.nodes.filter((n) => !n.goal).map(layerOf))].sort()
  const data = useMemo(() => {
    const nodes = base.nodes.filter((n) => n.goal || ((!mods.length || mods.includes(modOf(n))) && (layer === 'all' || layerOf(n) === layer)))
    const ids = new Set(nodes.map((n) => n.id))
    return { nodes, links: base.links.filter((l) => ids.has(l.from) && ids.has(l.to)) }
  }, [base, mods, layer])
  const legend = isChapter ? CHAPTER_MODALITIES.map((m) => ({ label: m, look: MOD_LOOK[m] })) : modalities.map((m) => ({ label: m, look: FAMILY_LOOK[FAMILIES.find((f) => FAMILY[f].label === m) ?? 'script'] }))
  const onOpen = (id: string) => {
    if (isChapter && id !== CHAPTER_GOAL.id) return open(chapterItem(id))
    if (akpByIdAny(id)) open(akpItem(id))
  }
  const editing: GraphEditing | undefined = isChapter
    ? undefined
    : {
        linkTypes: AKP_LINK_TYPES.map((t) => [t, LINK_STYLES[t]?.label ?? t]),
        onLink: (from, to, type) => {
          const a = akpById(from)
          const t = AKP_LINK_TYPES.find((x) => x === type)
          if (!a || !t || a.links.some((l) => l.to === to && l.type === t)) return
          store.commit([...store.edits, makeEdit('link-add', from, store.who, { to, type: t })])
        },
        onNew: () => open(akpItem(addAkp(store, focus))),
      }
  const f = isChapter ? stateFlipById(CHAPTER_GOAL.flip)! : stateFlipById(focus)!
  return (
    <Panel
      title="How AKPs relate"
      description="Pick a StateFlip to see its goal AKP in the middle and the strategy AKPs serving it around it, or sleep chapter 1 (read only). Zoom and pan; Follow the path walks StateFlip → goal AKPs → strategy AKPs. Click a node to edit it; drag from one node to another to link them."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,220px)]">
        <Select
          label="Focus"
          value={focus}
          onChange={(v) => {
            setFocus(v)
            setMods([])
            setLayer('all')
          }}
          options={[...stateFlips().map((x) => [x.id, `${x.id} ${x.title}`] as [string, string]), [CHAPTER, 'Sleep · chapter 1 (AKP Graph Explorer, read only)']]}
        />
        <Select label="Layer" value={layer} onChange={setLayer} options={[['all', 'All layers'], ...layers.map((l) => [l, l] as [string, string])]} />
      </div>
      <div className="flex flex-wrap items-center gap-6" role="group" aria-label="Modality">
        <span className="text-11 font-medium text-adm-muted">{isChapter ? 'Modality' : 'Family'}</span>
        <Chip on={!mods.length} onClick={() => setMods([])}>
          All
        </Chip>
        {modalities.map((m) => (
          <Chip key={m} on={mods.includes(m)} dot={<Mark look={legend.find((g) => g.label === m)?.look ?? FAMILY_LOOK.script} />} onClick={() => setMods(mods.includes(m) ? mods.filter((x) => x !== m) : [...mods, m])}>
            {m}
          </Chip>
        ))}
      </div>
      <p className="text-12 text-adm-ink-2">
        {isChapter ? (
          <>
            <span className="font-semibold text-adm-ink">Sleep, chapter 1:</span> 20 strategy AKPs and 30 typed links across script, music, voice and image, all driving the first step of {f.id} ({f.title}). Script, music and image AKPs come from the catalogue; the four voice AKPs are drafted (dashed outline). Links and timings are drafted by us — to review.
          </>
        ) : (
          <>
            <span className="font-semibold text-adm-ink">{f.id}</span> {f.title}: its goal AKP, its X / Y / Z steps and the strategy AKPs linked to it by the catalogue
            {base.nodes.length - 4 >= MAX_FLIP_NODES ? ` (first ${MAX_FLIP_NODES})` : ''}. Dashed outline: drafted by us; solid ring: edited in the admin. Links made here are saved as edits.
          </>
        )}
      </p>
      <AkpGraph key={focus} nodes={data.nodes} links={data.links} linkStyles={LINK_STYLES} legend={legend} onOpen={onOpen} editing={editing} aria={`Network graph of ${data.nodes.length} AKPs and ${data.links.length} links for ${isChapter ? 'sleep chapter 1' : focus}`} />
      {isChapter && (
        <>
          <h3 className="text-13 font-semibold text-adm-ink">Which AKPs drive each phase of the chapter</h3>
          <ChapterPhases />
        </>
      )}
    </Panel>
  )
}

const PAGE = 40
const MODALITY_LIST = ['Script', 'Music', 'Image', 'Video', '—'] as const

export function AkpCatalogue() {
  const open = useDetail()
  const store = useAkpEdits()
  const all = akps()
  const s = akpSummary()
  const [status, setStatus] = useState('all')
  const [families, setFamilies] = useState<AkpFamily[]>([])
  const [layer, setLayer] = useState('all')
  const [modality, setModality] = useState('all')
  const [src, setSrc] = useState('all')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const layers = useMemo(() => [...new Set(all.filter((a) => !families.length || families.includes(a.family)).map((a) => a.layer))].sort(), [all, families])
  const topLayers = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of all) if (a.kind === 'strategy') m.set(a.layer, (m.get(a.layer) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [all])
  const ql = q.trim().toLowerCase()
  const pool = status === 'deleted' ? akpsWithDeleted().filter((a) => a.deleted) : all
  const shown = pool.filter(
    (a) =>
      (status === 'all' || status === 'deleted' || (status === 'edited' ? a.edited : a.status === status)) &&
      (!families.length || families.includes(a.family)) && (layer === 'all' || a.layer === layer) && (modality === 'all' || a.modality === modality) &&
      (src === 'all' || (src === 'file') === a.fromFile) && (!ql || `${a.id} ${a.name} ${a.description}`.toLowerCase().includes(ql)),
  )
  const reset = <T,>(f: (v: T) => void) => (v: T) => {
    f(v)
    setLimit(PAGE)
  }
  const toggleFamily = (f: AkpFamily) => {
    setFamilies(families.includes(f) ? families.filter((x) => x !== f) : [...families, f])
    setLayer('all')
    setLimit(PAGE)
  }
  return (
    <div className="flex min-w-0 flex-col gap-16" data-akp-catalogue>
      <AkpExplainer />
      <AkpEditBar onNew={() => open(akpItem(addAkp(store)))} />
      <section aria-label="Summary" className="flex min-w-0 flex-col gap-12 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
        <p className="max-w-[860px] text-16 font-semibold leading-snug text-adm-ink">
          {s.total.toLocaleString('en')} AKPs: {s.byKind.goal} goal AKPs (what to reach) and {s.byKind.strategy} strategy and tactic AKPs (how). {s.fromFile} come straight from the workbooks; {s.drafted} are drafted by us, mostly the X / Y / Z steps. {s.flipsCovered} of {s.flips} StateFlips are served by at least one strategy AKP ({s.flipsCoveredBeyondSkills} by more than a skill).
        </p>
        <h3 className="text-12 font-semibold text-adm-ink">By family</h3>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-7">
          {FAMILIES.map((f) => (
            <StatCard key={f} dot={<Mark look={FAMILY_LOOK[f]} />} label={`${FAMILY[f].label} (${FAMILY[f].prefix}-)`} value={s.byFamily[f]} sub={FAMILY[f].kind === 'goal' ? 'goal' : 'strategy'} />
          ))}
        </dl>
        <div className="grid min-w-0 gap-12 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-8">
            <h3 className="text-12 font-semibold text-adm-ink">By modality (strategy AKPs)</h3>
            <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {(['Script', 'Music', 'Image', 'Video'] as const).map((m) => (
                <StatCard key={m} label={m} value={all.filter((a) => a.modality === m).length} />
              ))}
            </dl>
          </div>
          <div className="flex min-w-0 flex-col gap-8">
            <h3 className="text-12 font-semibold text-adm-ink">Biggest strategy layers</h3>
            <ul className="flex flex-col gap-4" data-layer-bars>
              {topLayers.map(([l, n]) => (
                <li key={l} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_36px] items-center gap-8 text-11 text-adm-ink-2">
                  <span className="truncate" title={l}>
                    {l}
                  </span>
                  <span className="h-8 rounded-full bg-adm-hover">
                    <span className="block h-8 rounded-full bg-adm-s1" style={{ width: `${(n / topLayers[0][1]) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-12 text-adm-ink-2">
          By function: wellness {s.byFunction.wellness}, product {s.byFunction.product}, identity {s.byFunction.identity}, brand {s.byFunction.brand} (waiting for the marketing sheet). {s.links} typed links between AKPs. Status: {all.filter((a) => a.status === 'draft').length} draft, {all.filter((a) => a.status === 'reviewed').length} reviewed, {all.filter((a) => a.status === 'approved').length} approved. Every count here includes the edits made in the admin.
        </p>
      </section>

      <RelationshipGraph />

      <Panel title="All AKPs" description="Search, or narrow by family, layer, modality and source. Open one for its definition, links, the StateFlips it serves and its source.">
        <label className="flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted">
          Search
          <input value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="e.g. breath, rain, calm" className={inputClass} />
        </label>
        <div className="flex flex-wrap items-center gap-6" role="group" aria-label="Family">
          <Chip on={!families.length} onClick={() => reset(setFamilies)([])}>
            All families
          </Chip>
          {FAMILIES.map((f) => (
            <Chip key={f} on={families.includes(f)} dot={<Mark look={FAMILY_LOOK[f]} />} onClick={() => toggleFamily(f)}>
              {FAMILY[f].label}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <Select label="Status" value={status} onChange={reset(setStatus)} options={[['all', 'All'], ['draft', 'Draft'], ['reviewed', 'Reviewed'], ['approved', 'Approved'], ['edited', 'Edited in the admin'], ['deleted', 'Deleted (restorable)']]} />
          <Select label="Layer" value={layer} onChange={reset(setLayer)} options={[['all', 'All'], ...layers.map((l) => [l, l] as [string, string])]} />
          <Select label="Modality" value={modality} onChange={reset(setModality)} options={[['all', 'All'], ...MODALITY_LIST.map((m) => [m, m === '—' ? 'None' : m] as [string, string])]} />
          <Select label="Source" value={src} onChange={reset(setSrc)} options={[['all', 'All'], ['file', 'From file'], ['drafted', 'Drafted by us']]} />
        </div>
        <p className="text-12 text-adm-muted" aria-live="polite">
          {shown.length.toLocaleString('en')} of {pool.length.toLocaleString('en')}
        </p>
        <ul className="flex flex-col divide-y divide-adm-line rounded-8 border border-adm-line" data-akp-list>
          {shown.slice(0, limit).map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => open(akpItem(a.id))} className="flex w-full min-w-0 flex-col gap-6 px-12 py-10 text-left hover:bg-adm-hover lg:flex-row lg:items-center lg:gap-12">
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="inline-flex min-w-0 items-center gap-6 text-13 font-semibold text-adm-ink">
                    <Mark look={FAMILY_LOOK[a.family]} size={12} />
                    <span className="min-w-0 truncate">{a.name}</span>
                  </span>
                  <span className="text-12 text-adm-ink-2" data-used-for>
                    {usedForLine(a, flipTitle)}
                  </span>
                  <span className="truncate text-11 text-adm-muted">
                    {a.id} · {a.description}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-4 lg:justify-end">
                  <span className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink-2">{FAMILY[a.family].label}</span>
                  <span className="max-w-[200px] truncate rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink-2" title={a.layer}>
                    {a.layer}
                  </span>
                  {a.modality !== '—' && <span className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink-2">{a.modality}</span>}
                  {a.flips.length > 0 && <span className="rounded-full bg-adm-hover px-8 py-2 text-11 tabular-nums text-adm-ink-2">{a.flips.length} {a.flips.length === 1 ? 'goal' : 'goals'}</span>}
                  {a.status !== 'draft' && <Badge tone="good">{a.status === 'approved' ? 'Approved' : 'Reviewed'}</Badge>}
                  {a.deleted ? <Badge tone="critical">Deleted</Badge> : a.edited && <Badge tone="neutral">{a.added ? 'Added' : 'Edited'}</Badge>}
                  <SourceBadge source={a.source} />
                </span>
              </button>
            </li>
          ))}
          {!shown.length && <li className="px-12 py-10 text-12 text-adm-muted">No AKP matches. Clear a filter or the search.</li>}
        </ul>
        {shown.length > limit && (
          <button type="button" onClick={() => setLimit(limit + PAGE)} className="self-start rounded-8 border border-adm-line px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
            Show {Math.min(PAGE, shown.length - limit)} more
          </button>
        )}
      </Panel>
    </div>
  )
}
