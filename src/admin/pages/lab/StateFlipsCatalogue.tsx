import { PanelRightOpen } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Panel, inputClass } from '../../components/ui'
import { FAMILIES, FAMILY, LINK_TEXT, akpById, akpSummary, akps, akpsForFlip, type Akp, type AkpFamily } from '../../data/akps'
import { DIMENSION_LABEL, type Dimension } from '../../data/personaConditionV4'
import { generatePersonasV4 } from '../../data/personasV4'
import { DRAFTED, STATEFLIP_DIMENSIONS, flipNumbers, stateFlipById, stateFlipSummary, stateFlips, type StateFlip } from '../../data/stateFlips'
import { LAYER_TEXT, type Layer } from '../../data/stateFlipSleep'
import { useDetail } from '../reports/DetailDrawer'

/*
 * Admin → Product lab → StateFlips, tabs "All StateFlips" and "AKP catalogue"
 * (U141, J203): the 125 StateFlips with filters and a drawer for each, and
 * the draft catalogue of about 1,000 AKPs with filters, search, counts and a
 * small view of one StateFlip's AKPs. Data: data/stateFlips.ts, data/akps.ts.
 */

const pct = (x: number) => (Number.isFinite(x) ? `${Math.round(x * 100)}%` : '–')
const usd = (x: number) => (Number.isFinite(x) ? `$${x.toFixed(2)}` : '–')
const num = (x: number) => (Number.isFinite(x) ? `${x}` : '–')
const FAMILY_BG: Record<AkpFamily, string> = { goal: 'bg-adm-s1', identity: 'bg-adm-s2', script: 'bg-adm-s3', music: 'bg-adm-s4', image: 'bg-adm-good', video: 'bg-adm-warning', product: 'bg-adm-serious' }
const FAMILY_FILL: Record<AkpFamily, string> = { goal: 'fill-adm-s1', identity: 'fill-adm-s2', script: 'fill-adm-s3', music: 'fill-adm-s4', image: 'fill-adm-good', video: 'fill-adm-warning', product: 'fill-adm-serious' }

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
              <button type="button" onClick={() => open(akpItem(a))} className="inline-flex items-center gap-4 rounded-8 border border-adm-line px-6 py-2 text-11 text-adm-ink hover:bg-adm-hover">
                <span className={`size-8 rounded-full ${FAMILY_BG[a.family]}`} aria-hidden="true" />
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

function AkpDetail({ a }: { a: Akp }) {
  const open = useDetail()
  const incoming = useMemo(() => akps().filter((x) => x.links.some((l) => l.to === a.id)), [a.id])
  return (
    <div className="flex flex-col gap-10 text-12 text-adm-ink-2" data-akp-detail>
      <p>{a.description}</p>
      <p className="text-11 text-adm-muted">Causal role: {a.causalRole || '–'}</p>
      <p className="text-11 text-adm-muted">
        Source: {a.source} · status {a.status}
      </p>
      <Sub title={`StateFlips it serves (${a.flips.length})`}>
        {a.flips.length ? (
          <ul className="flex flex-wrap gap-4">
            {a.flips.map((id) => {
              const f = stateFlipById(id)!
              return (
                <li key={id}>
                  <button type="button" onClick={() => open(flipItem(f))} className="rounded-8 border border-adm-line px-6 py-2 text-11 text-adm-ink hover:bg-adm-hover">
                    {id} {f.title}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-adm-muted">None linked yet{a.family === 'product' ? ': product AKPs serve the app, not one goal.' : '.'}</p>
        )}
      </Sub>
      <Sub title="Links">
        <ul className="flex flex-col gap-2">
          {a.links.map((l) => (
            <li key={`o${l.to}`}>
              {LINK_TEXT[l.type]} <span className="font-medium text-adm-ink">{l.to}</span> {akpById(l.to)?.name}
            </li>
          ))}
          {incoming.slice(0, 12).map((x) => (
            <li key={`i${x.id}`}>
              <span className="font-medium text-adm-ink">{x.id}</span> {x.name} {LINK_TEXT[x.links.find((l) => l.to === a.id)!.type]} this
            </li>
          ))}
          {incoming.length > 12 && <li className="text-adm-muted">+ {incoming.length - 12} more linking here</li>}
          {!a.links.length && !incoming.length && <li className="text-adm-muted">No typed links.</li>}
        </ul>
      </Sub>
    </div>
  )
}

function akpItem(a: Akp) {
  return {
    kicker: `${a.id} · ${FAMILY[a.family].label} · ${a.kind === 'goal' ? 'Goal AKP' : 'Strategy / tactic AKP'}`,
    title: a.name,
    numbers: [
      { label: 'Layer', value: a.layer },
      { label: 'Modality', value: a.modality },
      { label: 'Function', value: a.fn },
      { label: 'Source', value: a.fromFile ? 'From file' : 'Drafted' },
    ],
    extra: <AkpDetail a={a} />,
  }
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

function FlipGraph({ flipId }: { flipId: string }) {
  const open = useDetail()
  const f = stateFlipById(flipId)!
  const linked = akpsForFlip(flipId).filter((a) => a.kind === 'strategy' || a.id.startsWith(flipId.replace(/^SF-/, 'WG-') + '-'))
  const groups = FAMILIES.map((fam) => ({ fam, items: linked.filter((a) => a.family === fam) })).filter((g) => g.items.length)
  const W = 520
  const H = 300
  const cx = W / 2
  const cy = H / 2
  const n = linked.length || 1
  let k = 0
  const nodes = groups.flatMap((g) =>
    g.items.map((a) => {
      const t = (k++ / n) * Math.PI * 2 - Math.PI / 2
      return { a, x: cx + Math.cos(t) * 200, y: cy + Math.sin(t) * 115 }
    }),
  )
  return (
    <div className="flex min-w-0 flex-col gap-8" data-flip-graph>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[640px]" role="img" aria-label={`${linked.length} AKPs linked to ${f.id}, grouped by family`}>
        {nodes.map(({ a, x, y }) => (
          <line key={`l${a.id}`} x1={cx} y1={cy} x2={x} y2={y} className="stroke-adm-grid" strokeWidth={1} />
        ))}
        <circle cx={cx} cy={cy} r={30} className="fill-adm-ink" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-adm-surface text-11 font-semibold">
          {f.id.replace('SF-', '')}
        </text>
        {nodes.map(({ a, x, y }) => (
          <g key={a.id} role="button" tabIndex={0} aria-label={`${a.id} ${a.name}`} className="cursor-pointer" onClick={() => open(akpItem(a))} onKeyDown={(e) => e.key === 'Enter' && open(akpItem(a))}>
            <title>{`${a.id} ${a.name}`}</title>
            <circle cx={x} cy={y} r={9} className={FAMILY_FILL[a.family]} />
          </g>
        ))}
      </svg>
      <ul className="flex flex-wrap gap-8 text-11 text-adm-ink-2">
        {groups.map((g) => (
          <li key={g.fam} className="inline-flex items-center gap-4">
            <span className={`size-8 rounded-full ${FAMILY_BG[g.fam]}`} aria-hidden="true" />
            {FAMILY[g.fam].label} {g.items.length}
          </li>
        ))}
      </ul>
    </div>
  )
}

const PAGE = 50

export function AkpCatalogue() {
  const open = useDetail()
  const all = akps()
  const s = akpSummary()
  const [family, setFamily] = useState('all')
  const [layer, setLayer] = useState('all')
  const [modality, setModality] = useState('all')
  const [src, setSrc] = useState('all')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [flip, setFlip] = useState('SF-PHY-01')
  const layers = useMemo(() => [...new Set(all.filter((a) => family === 'all' || a.family === family).map((a) => a.layer))].sort(), [all, family])
  const shown = all.filter(
    (a) =>
      (family === 'all' || a.family === family) && (layer === 'all' || a.layer === layer) && (modality === 'all' || a.modality === modality) &&
      (src === 'all' || (src === 'file') === a.fromFile) && (!q || `${a.id} ${a.name} ${a.description}`.toLowerCase().includes(q.toLowerCase())),
  )
  const reset = (f: (v: string) => void) => (v: string) => {
    f(v)
    setLimit(PAGE)
  }
  return (
    <div className="flex min-w-0 flex-col gap-16" data-akp-catalogue>
      <section aria-label="Summary" className="flex min-w-0 flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
        <p className="max-w-[860px] text-16 font-semibold leading-snug text-adm-ink">
          {s.total.toLocaleString('en')} draft AKPs: {s.byKind.goal} goal AKPs (what to reach) and {s.byKind.strategy} strategy and tactic AKPs (how). {s.fromFile} come straight from the workbooks; {s.drafted} are drafted by us, mostly the X / Y / Z steps. Every StateFlip is served by at least one strategy AKP ({s.flipsCovered} of {s.flips}; {s.flipsCoveredBeyondSkills} by more than a skill).
        </p>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-7">
          {FAMILIES.map((f) => (
            <div key={f} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg p-10">
              <dt className="inline-flex items-center gap-4 text-11 text-adm-muted">
                <span className={`size-8 rounded-full ${FAMILY_BG[f]}`} aria-hidden="true" />
                {FAMILY[f].label} ({FAMILY[f].prefix}-)
              </dt>
              <dd className="text-20 font-semibold tabular-nums text-adm-ink">{s.byFamily[f]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-12 text-adm-ink-2">
          By function: wellness {s.byFunction.wellness}, product {s.byFunction.product}, identity {s.byFunction.identity}, brand {s.byFunction.brand} (waiting for the marketing sheet). {s.links} typed links between AKPs. All are status “draft”.
        </p>
      </section>

      <Panel title="One StateFlip’s AKPs" description="The strategy AKPs linked to one StateFlip, and its own steps, coloured by family. Tap a dot for its detail.">
        <div className="max-w-[420px]">
          <Select label="StateFlip" value={flip} onChange={setFlip} options={stateFlips().map((f) => [f.id, `${f.id} ${f.title}`] as [string, string])} />
        </div>
        <FlipGraph flipId={flip} />
      </Panel>

      <Panel title="AKP catalogue" description="Filter by family, layer, modality and source, or search. Open a row for its links and the StateFlips it serves.">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <Select label="Family" value={family} onChange={(v) => { reset(setFamily)(v); setLayer('all') }} options={[['all', 'All'], ...FAMILIES.map((f) => [f, FAMILY[f].label] as [string, string])]} />
          <Select label="Layer" value={layer} onChange={reset(setLayer)} options={[['all', 'All'], ...layers.map((l) => [l, l] as [string, string])]} />
          <Select label="Modality" value={modality} onChange={reset(setModality)} options={[['all', 'All'], ['Script', 'Script'], ['Music', 'Music'], ['Image', 'Image'], ['Video', 'Video'], ['—', 'None']]} />
          <Select label="Source" value={src} onChange={reset(setSrc)} options={[['all', 'All'], ['file', 'From file'], ['drafted', 'Drafted by us']]} />
          <label className="col-span-2 flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted lg:col-span-1">
            Search
            <input value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="e.g. breath" className={inputClass} />
          </label>
        </div>
        <p className="text-12 text-adm-muted" aria-live="polite">
          {shown.length} of {all.length}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-12" data-akp-table>
            <thead>
              <tr className="border-b border-adm-line text-11 text-adm-muted">
                <th className="py-6 pr-10 font-medium">AKP</th>
                <th className="py-6 pr-10 font-medium">Family</th>
                <th className="py-6 pr-10 font-medium">Layer</th>
                <th className="py-6 pr-10 text-right font-medium">Goals served</th>
                <th className="py-6 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, limit).map((a) => (
                <tr key={a.id} className="border-b border-adm-line last:border-0">
                  <td className="py-6 pr-10">
                    <button type="button" onClick={() => open(akpItem(a))} className="inline-flex items-start gap-6 text-left text-adm-ink hover:underline">
                      <span className="shrink-0 tabular-nums text-adm-muted">{a.id}</span>
                      <span>{a.name}</span>
                    </button>
                  </td>
                  <td className="py-6 pr-10 text-adm-ink-2">
                    <span className="inline-flex items-center gap-4">
                      <span className={`size-8 shrink-0 rounded-full ${FAMILY_BG[a.family]}`} aria-hidden="true" />
                      {FAMILY[a.family].label}
                    </span>
                  </td>
                  <td className="py-6 pr-10 text-adm-ink-2">{a.layer}</td>
                  <td className="py-6 pr-10 text-right tabular-nums">{a.flips.length}</td>
                  <td className="py-6">
                    <SourceBadge source={a.source} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length > limit && (
          <button type="button" onClick={() => setLimit(limit + PAGE)} className="self-start rounded-8 border border-adm-line px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
            Show {Math.min(PAGE, shown.length - limit)} more
          </button>
        )}
      </Panel>
    </div>
  )
}
