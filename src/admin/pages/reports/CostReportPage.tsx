import { AlertTriangle, ExternalLink } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Badge, PageHeader, Panel, inputClass, type Tone } from '../../components/ui'
import {
  ANCHORS, ASSUME, DEFAULT_GOAL, DEFAULT_WPM, GRAPH_EDGES, GRAPH_NODES, LENGTHS, MEASURED_2025, MEDIA, MEDIA_LABEL,
  NUMBER_LABEL_TEXT, PERSONALISATION_LABEL, PRESETS, STAGES, SUPPLIERS, chapterCost, conditionName, dominant, downstream,
  goal, measuredAverage, presetInputs, supplier, total,
  type Anchor, type CostInputs, type GoalInputs, type Media, type MediaCost, type NodeId, type NumberLabel, type Personalisation, type Stage,
} from '../../data/costModel'
import { COST_FINDINGS } from '../../data/reportSources'
import { SourceGraph, SourcesSection } from './ReportParts'

/*
 * Admin → Reports → Cost report (U117, J172). Part 1: what a chapter costs,
 * by media and supplier, in several variations, against the 2025 measured
 * costs. Part 2: the bad-to-good sleep journey as a connected graph. Every
 * formula lives in data/costModel.ts; this page only lays it out.
 */

const MEDIA_FILL: Record<Media, string> = { script: 'fill-adm-s1', voice: 'fill-adm-s2', music: 'fill-adm-s3', image: 'fill-adm-s4', video: 'fill-adm-ink-2' }
const MEDIA_BG: Record<Media, string> = { script: 'bg-adm-s1', voice: 'bg-adm-s2', music: 'bg-adm-s3', image: 'bg-adm-s4', video: 'bg-adm-ink-2' }
const NUM_TONE: Record<NumberLabel, Tone> = { measured: 'good', 'company-price': 'info', 'third-party': 'neutral', estimate: 'serious', scenario: 'critical' }

function NumBadge({ label }: { label: NumberLabel }) {
  return <Badge tone={NUM_TONE[label]}>{NUMBER_LABEL_TEXT[label]}</Badge>
}

const usd = (x: number) => (!isFinite(x) ? '—' : `${x < 0 ? '−' : ''}$${Math.abs(x) < 0.1 && x !== 0 ? Math.abs(x).toFixed(4) : Math.abs(x).toFixed(2)}`)
const eur = (x: number) => `€${x.toFixed(2)}`
const pct = (x: number) => `${Math.round(x * 100)}%`

interface State {
  cost: CostInputs
  goal: GoalInputs
}

const INITIAL: State = {
  cost: { minutes: 10, wordsPerMinute: DEFAULT_WPM, models: PRESETS[1].models, personalisation: 'full', cacheHit: 0.5 },
  goal: DEFAULT_GOAL,
}

function nodeValues(s: State): Record<NodeId, string> {
  const r = goal(s.goal, s.cost)
  const m = s.cost.models
  return {
    condition: `${s.goal.baseline} → ${s.goal.target} (${conditionName(s.goal.baseline)})`,
    adherence: `${s.goal.chaptersPerWeek} a week`,
    length: `${s.cost.minutes} min · ${s.cost.minutes * s.cost.wordsPerMinute} words`,
    personalisation: PERSONALISATION_LABEL[s.cost.personalisation],
    models: `${supplier(m.script).name.replace('Claude ', '')} · ${supplier(m.voice).name.split(' (')[0]}`,
    stage: `${STAGES[s.goal.stage].name}, ${STAGES[s.goal.stage].sessions}`,
    uplift: `+${r.uplift.toFixed(2)} points`,
    chapters: `${r.chapters} chapters`,
    flip: pct(r.flipProbability),
    weeks: `${r.weeks.toFixed(1)} weeks`,
    costChapter: usd(r.costPerChapter),
    costJourney: usd(r.costPerJourney),
    costFlip: usd(r.costPerFlip),
    anchor: `${ANCHORS[s.goal.anchor].label} → ${usd(r.revenuePerJourney)}`,
    profit: usd(r.profitPerFlip),
  }
}

export function CostReportPage() {
  const [state, setState] = useState<State>(INITIAL)
  const [changed, setChanged] = useState<{ from: NodeId | null; nodes: Set<NodeId> }>({ from: null, nodes: new Set() })
  const [selected, setSelected] = useState<NodeId>('costFlip')

  function update(from: NodeId, next: State) {
    const before = nodeValues(state)
    const after = nodeValues(next)
    const nodes = new Set((Object.keys(after) as NodeId[]).filter((k) => after[k] !== before[k] && downstream(from).has(k)))
    setChanged({ from, nodes })
    setState(next)
  }
  const setCost = (from: NodeId, patch: Partial<CostInputs>) => update(from, { ...state, cost: { ...state.cost, ...patch } })
  const setGoal = (from: NodeId, patch: Partial<GoalInputs>) => update(from, { ...state, goal: { ...state.goal, ...patch } })
  const setModel = (m: Media, id: string) => setCost('models', { models: { ...state.cost.models, [m]: id } })

  const result = goal(state.goal, state.cost)
  const values = nodeValues(state)
  const stages = ([1, 2, 3] as Stage[]).map((st) => ({ st, r: goal({ ...state.goal, stage: st }, state.cost) }))

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Cost report"
        description="What it costs Aurelia to make a chapter, by media and supplier, and what it might cost to move someone from bad sleep to good sleep. Prices are the suppliers’ own where we could read them; everything about uplift, flips and the Causal AI stages is the business owner’s scenario, not measured. There are no real users yet."
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <span className="font-medium text-adm-ink">Every number is labelled:</span>
        {(Object.keys(NUMBER_LABEL_TEXT) as NumberLabel[]).map((l) => (
          <NumBadge key={l} label={l} />
        ))}
      </div>

      <Panel title="How this report was made" description="Where each part of this report comes from. Each line is a source feeding a section.">
        <SourceGraph findings={COST_FINDINGS} label="Graph: the sources on the left feed the report’s sections on the right." />
      </Panel>

      <h2 className="mt-8 text-18 font-semibold text-adm-ink">Part 1 · Cost</h2>

      <section id="cost-catalogue" className="scroll-mt-16">
        <Panel title="Supplier catalogue" description="Candidate models for each media element of a chapter, with the price as stated, its date and source, and what each is good and bad at. “Use” puts it in your selection below.">
          <div className="flex flex-col gap-16">
            {MEDIA.map((m) => (
              <div key={m} className="flex flex-col gap-8">
                <h3 className="flex items-center gap-8 text-13 font-semibold text-adm-ink">
                  <span className={`size-10 rounded-2 ${MEDIA_BG[m]}`} aria-hidden="true" />
                  {MEDIA_LABEL[m]}
                  {m === 'video' && <span className="text-11 font-normal text-adm-muted">optional, off by default</span>}
                </h3>
                <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {SUPPLIERS.filter((s) => s.media === m).map((s) => {
                    const on = state.cost.models[m] === s.id
                    return (
                      <li key={s.id} className={`flex min-w-0 flex-col gap-6 rounded-8 border p-12 ${on ? 'border-adm-ink bg-adm-bg' : 'border-adm-line'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-6">
                          <div className="min-w-0">
                            <p className="text-13 font-semibold text-adm-ink">{s.name}</p>
                            <p className="text-11 text-adm-muted">{s.vendor}</p>
                          </div>
                          <NumBadge label={s.label} />
                        </div>
                        <p className="text-12 font-semibold tabular-nums text-adm-ink">{s.price}</p>
                        <p className="text-11 text-adm-muted">
                          {s.date} ·{' '}
                          <a href={s.sourceUrl} target={s.sourceUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="inline-flex items-center gap-2 underline decoration-adm-axis underline-offset-2 hover:text-adm-ink">
                            {s.source} <ExternalLink size={10} aria-hidden="true" />
                          </a>
                        </p>
                        <div className="grid grid-cols-2 gap-8 text-11">
                          <ul className="flex flex-col gap-2 text-adm-ink-2">
                            <li className="font-semibold text-adm-good">Pros</li>
                            {s.pros.map((p) => <li key={p}>+ {p}</li>)}
                          </ul>
                          <ul className="flex flex-col gap-2 text-adm-ink-2">
                            <li className="font-semibold text-adm-critical">Cons</li>
                            {s.cons.map((p) => <li key={p}>− {p}</li>)}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModel(m, s.id)}
                          aria-pressed={on}
                          className={`mt-auto self-start rounded-8 border px-10 py-4 text-11 font-medium ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`}
                        >
                          {on ? 'In your selection' : 'Use'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="cost-variations" className="scroll-mt-16 flex flex-col gap-16">
        <Panel title="Your selection" description="Change the variables; the chapter cost, the variations and Part 2 all follow. Estimates: supplier prices × the assumptions listed under the chart.">
          <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Chapter length">
              <Segmented options={LENGTHS.map((l) => ({ v: l, t: `${l} min` }))} value={state.cost.minutes} onChange={(v) => setCost('length', { minutes: v })} />
            </Field>
            <Field label={`Words per minute: ${state.cost.wordsPerMinute}`} hint="Spoken slowly with pauses; the wiki notes put a 10-minute session at 900–1,200 words.">
              <input type="range" min={70} max={150} step={5} value={state.cost.wordsPerMinute} onChange={(e) => setCost('length', { wordsPerMinute: Number(e.target.value) })} className="w-full accent-adm-ink" aria-label="Words per minute" />
            </Field>
            <Field label="Personalisation" hint={`Inserts: ${pct(ASSUME.insertShare)} of the words personal, the rest shared by ${ASSUME.reuseAcross} people. Cached: one chapter for ${ASSUME.reuseAcross}.`}>
              <select className={inputClass} value={state.cost.personalisation} onChange={(e) => setCost('personalisation', { personalisation: e.target.value as Personalisation })} aria-label="Personalisation">
                {(Object.keys(PERSONALISATION_LABEL) as Personalisation[]).map((p) => (
                  <option key={p} value={p}>{PERSONALISATION_LABEL[p]}</option>
                ))}
              </select>
            </Field>
            <Field label={`Cache hit, music and image: ${pct(state.cost.cacheHit)}`} hint="The share of music and images served again instead of generated.">
              <input type="range" min={0} max={1} step={0.05} value={state.cost.cacheHit} onChange={(e) => setCost('models', { cacheHit: Number(e.target.value) })} className="w-full accent-adm-ink" aria-label="Cache hit rate" />
            </Field>
            {MEDIA.map((m) => (
              <Field key={m} label={MEDIA_LABEL[m]}>
                <select className={inputClass} value={state.cost.models[m]} onChange={(e) => setModel(m, e.target.value)} aria-label={`Model for ${MEDIA_LABEL[m]}`}>
                  {SUPPLIERS.filter((s) => s.media === m).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
          <SelectionSummary cost={state.cost} />
        </Panel>

        <Panel title="Cost per chapter, several variations" description="One chapter for one person, split by media, at 3, 5 and 10 minutes. Lean, Balanced and Premium are fixed presets at your words per minute; “Your selection” follows the controls. Estimates.">
          <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
            {[...PRESETS.map((p) => ({ id: p.id, name: p.name, blurb: p.blurb, make: (min: number) => presetInputs(p, min, state.cost.wordsPerMinute) })), { id: 'yours', name: 'Your selection', blurb: `${PERSONALISATION_LABEL[state.cost.personalisation]}, ${pct(state.cost.cacheHit)} cache hit.`, make: (min: number) => ({ ...state.cost, minutes: min }) }].map((v) => (
              <VariationCard key={v.id} name={v.name} blurb={v.blurb} costs={LENGTHS.map((min) => ({ min, c: chapterCost(v.make(min)) }))} />
            ))}
          </div>
          <MediaLegend />
          <Measured2025 />
          <p className="text-12 text-adm-ink-2">
            Assumptions (estimates): {ASSUME.charsPerWord} characters and {ASSUME.tokensPerWord} output tokens a word, {ASSUME.promptTokens.toLocaleString('en-US')} prompt tokens, {ASSUME.imagesPerChapter} image a chapter, one Stable Audio generation covers 3 minutes, a video clip is {ASSUME.videoSeconds} seconds. TTS bills characters, so pauses are free. Hosting, storage, CDN, licences and payment fees are not included.
          </p>
        </Panel>
      </section>

      <h2 className="mt-8 text-18 font-semibold text-adm-ink">Part 2 · From bad to good (the goal)</h2>

      <section id="goal-graph" className="scroll-mt-16">
        <Panel title="Bad sleep to good sleep, as a connected graph" description="Use case: sleep on a 0–100 scale, default 25 → 85 (+60) from the spec. Change a variable: every node downstream updates and the changed path lights up. Click a node for its formula and source. Chapter length, personalisation and models come from Part 1.">
          <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-5">
            <Field label={`Starting level: ${state.goal.baseline} (${conditionName(state.goal.baseline)})`} hint="The user’s condition today, 0 = worst sleep.">
              <input type="range" min={0} max={80} step={5} value={state.goal.baseline} onChange={(e) => setGoal('condition', { baseline: Number(e.target.value) })} className="w-full accent-adm-ink" aria-label="Starting level" />
            </Field>
            <Field label={`Target: ${state.goal.target}`} hint="Good sleep. The spec uses 85.">
              <input type="range" min={50} max={100} step={5} value={state.goal.target} onChange={(e) => setGoal('condition', { target: Number(e.target.value) })} className="w-full accent-adm-ink" aria-label="Target level" />
            </Field>
            <Field label={`Adherence: ${state.goal.chaptersPerWeek} chapters a week`}>
              <input type="range" min={1} max={7} step={1} value={state.goal.chaptersPerWeek} onChange={(e) => setGoal('adherence', { chaptersPerWeek: Number(e.target.value) })} className="w-full accent-adm-ink" aria-label="Chapters a week" />
            </Field>
            <Field label="Causal AI stage (scenario)">
              <Segmented options={([1, 2, 3] as Stage[]).map((s) => ({ v: s, t: `Stage ${s}` }))} value={state.goal.stage} onChange={(v) => setGoal('stage', { stage: v })} />
            </Field>
            <Field label="Price anchor">
              <select className={inputClass} value={state.goal.anchor} onChange={(e) => setGoal('anchor', { anchor: e.target.value as Anchor })} aria-label="Price anchor">
                {(Object.keys(ANCHORS) as Anchor[]).map((a) => (
                  <option key={a} value={a}>{ANCHORS[a].label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-8 text-12">
            <span className="text-adm-muted">Quick condition:</span>
            {[{ t: 'Severe (15)', v: 15 }, { t: 'Moderate (40)', v: 40 }, { t: 'Mild (60)', v: 60 }, { t: 'Spec default (25)', v: 25 }].map((q) => (
              <button key={q.t} type="button" onClick={() => setGoal('condition', { baseline: q.v })} className="rounded-full border border-adm-line px-10 py-2 text-adm-ink hover:bg-adm-hover">{q.t}</button>
            ))}
          </div>
          <ConnectedGraph values={values} changed={changed.nodes} from={changed.from} selected={selected} onSelect={setSelected} />
          <NodeExplain id={selected} value={values[selected]} />
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat label="Chapters to flip" value={`${result.chapters}`} note={`${result.weeks.toFixed(1)} weeks`} lab="scenario" />
            <Stat label="Flip probability" value={pct(result.flipProbability)} lab="scenario" />
            <Stat label="Cost per flip" value={usd(result.costPerFlip)} note={`journey ${usd(result.costPerJourney)}`} lab="estimate" />
            <Stat label="Profit per flip" value={usd(result.profitPerFlip)} note={`${ANCHORS[state.goal.anchor].label}; before fees, CAC, fixed costs`} lab="scenario" />
          </dl>
        </Panel>
      </section>

      <section id="goal-stages" className="scroll-mt-16">
        <Panel title="As the Causal AI learns: cost falls, uplift rises, profit appears" description="The same journey at the three stages of the spec (scenario: the business owner’s assumptions until real sessions exist), with your variables. The spec’s own figures are beside ours for comparison.">
          <StageChart stages={stages} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Stage</th>
                  <th className="py-6 pr-12 font-semibold">Uplift / chapter</th>
                  <th className="py-6 pr-12 font-semibold">Chapters (spec)</th>
                  <th className="py-6 pr-12 font-semibold">Flip probability</th>
                  <th className="py-6 pr-12 font-semibold">Cost / chapter</th>
                  <th className="py-6 pr-12 font-semibold">Cost / flip (spec)</th>
                  <th className="py-6 font-semibold">Profit / flip</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(({ st, r }) => (
                  <tr key={st} className="border-b border-adm-line last:border-0 tabular-nums">
                    <td className="py-8 pr-12 text-adm-ink">{STAGES[st].name} <span className="text-adm-muted">· {STAGES[st].sessions}</span></td>
                    <td className="py-8 pr-12">+{r.uplift.toFixed(2)}</td>
                    <td className="py-8 pr-12">{r.chapters} <span className="text-adm-muted">({STAGES[st].specChapters})</span></td>
                    <td className="py-8 pr-12">{pct(r.flipProbability)}</td>
                    <td className="py-8 pr-12">{usd(r.costPerChapter)}</td>
                    <td className="py-8 pr-12">{usd(r.costPerFlip)} <span className="text-adm-muted">({usd(STAGES[st].specCostPerFlip)})</span></td>
                    <td className="py-8 font-semibold">{usd(r.profitPerFlip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-12 text-adm-ink-2">
            The spec’s cost per flip is lower or higher than ours because its chapter cost is fixed at its own model mix ($0.059–0.178 a chapter); ours follows your selection. {ANCHORS[state.goal.anchor].note}
          </p>
        </Panel>
      </section>

      <section id="metric-lines" className="scroll-mt-16">
        <MetricLines stages={stages} />
      </section>

      <Panel title="Read this first" description="Plain-language notes.">
        <ul className="flex list-disc flex-col gap-6 pl-18 text-13 text-adm-ink-2">
          <li>“Therapeutic”, “flip” and “medical range” are internal metric names. Nothing on this page is a medical claim; public copy stays wellness.</li>
          <li>The stage curve (uplift 1.43 → 2.73, success 54 → 89%, cost × 1 → 0.26) is the business owner’s assumption from the spec until real sessions exist. It is shown to see where it leads, not as a finding.</li>
          <li>The only measured costs are the 2025 test sessions (€40.27). Every 2026 cost is a supplier price times our assumptions.</li>
          <li>Voice is the largest cost in almost every variation: TTS is billed per character and a chapter is mostly words. Choosing the voice decides more than choosing the script model.</li>
        </ul>
      </Panel>

      <SourcesSection
        findings={COST_FINDINGS}
        labels={['measured', 'company-price', 'third-party', 'estimate', 'scenario', 'document']}
        limits={[
          'No real user has heard a chapter, so no uplift, flip or therapeutic figure here is measured.',
          'Prices change often; each is dated. Google TTS and OpenAI’s per-image price could not be read and are estimates.',
          'Cost covers model calls only: not hosting, storage, CDN, music licences, people, payment or store fees, or CAC.',
          'The 2025 campaigns did not record their length, so the measured baseline is per session, not per minute.',
          'The condition, length, personalisation and adherence factors are this report’s assumptions, chosen to be simple and visible.',
          'Profit per flip uses the whole price; a retreat ticket is shared with the creator.',
        ]}
      />
    </div>
  )
}

/* ----------------------------------------------------------------- Parts */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-4 text-12">
      <span className="font-medium text-adm-ink">{label}</span>
      {children}
      {hint && <span className="text-11 text-adm-muted">{hint}</span>}
    </label>
  )
}

function Segmented<T extends number>({ options, value, onChange }: { options: { v: T; t: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-8 border border-adm-line p-2" role="group">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={o.v === value}
          onClick={() => onChange(o.v)}
          className={`rounded-4 px-10 py-4 text-12 font-medium ${o.v === value ? 'bg-adm-ink text-adm-surface' : 'text-adm-ink-2 hover:bg-adm-hover'}`}
        >
          {o.t}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value, note, lab }: { label: string; value: string; note?: string; lab: NumberLabel }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-8 bg-adm-bg p-10">
      <dt className="flex flex-wrap items-center justify-between gap-4 text-11 text-adm-muted">
        {label} <NumBadge label={lab} />
      </dt>
      <dd className="text-18 font-semibold tabular-nums text-adm-ink">{value}</dd>
      {note && <dd className="text-11 text-adm-ink-2">{note}</dd>}
    </div>
  )
}

function SelectionSummary({ cost }: { cost: CostInputs }) {
  const c = chapterCost(cost)
  const d = dominant(c)
  return (
    <div className="flex flex-wrap items-baseline gap-x-16 gap-y-4 border-t border-adm-line pt-12 text-13">
      <span className="text-adm-ink">
        One {cost.minutes}-minute chapter: <strong className="tabular-nums">{usd(total(c))}</strong> <NumBadge label="estimate" />
      </span>
      <span className="text-adm-ink-2">
        {MEDIA.filter((m) => c[m] > 0).map((m) => `${MEDIA_LABEL[m].split(' ')[0]} ${usd(c[m])}`).join(' · ')}
      </span>
      {total(c) > 0 && <span className="text-adm-ink-2">Largest: {MEDIA_LABEL[d.media]} at {pct(d.share)}.</span>}
    </div>
  )
}

function MediaLegend() {
  return (
    <div className="flex flex-wrap gap-x-14 gap-y-4 text-12 text-adm-ink-2">
      {MEDIA.map((m) => (
        <span key={m} className="inline-flex items-center gap-6">
          <span className={`size-8 rounded-2 ${MEDIA_BG[m]}`} aria-hidden="true" />
          {MEDIA_LABEL[m]}
        </span>
      ))}
    </div>
  )
}

function StackedBar({ c, max, label }: { c: MediaCost; max: number; label: string }) {
  const W = 200
  const xs = MEDIA.map((_, i) => MEDIA.slice(0, i).reduce((s, m) => s + (max ? (c[m] / max) * W : 0), 0))
  return (
    <svg viewBox={`0 0 ${W} 14`} className="block h-14 w-full" role="img" aria-label={label} preserveAspectRatio="none">
      <rect x={0} y={0} width={W} height={14} rx={2} className="fill-adm-hover" />
      {MEDIA.map((m, i) => (
        <rect key={m} x={xs[i]} y={0} width={max ? (c[m] / max) * W : 0} height={14} className={MEDIA_FILL[m]} />
      ))}
    </svg>
  )
}

function VariationCard({ name, blurb, costs }: { name: string; blurb: string; costs: { min: number; c: MediaCost }[] }) {
  const max = Math.max(...costs.map((x) => total(x.c)))
  const d = dominant(costs[costs.length - 1].c)
  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12">
      <div className="flex items-center justify-between gap-6">
        <h3 className="text-13 font-semibold text-adm-ink">{name}</h3>
        <NumBadge label="estimate" />
      </div>
      <p className="text-11 text-adm-ink-2">{blurb}</p>
      {costs.map(({ min, c }) => (
        <div key={min} className="flex flex-col gap-2">
          <div className="flex justify-between text-12">
            <span className="text-adm-muted">{min} min</span>
            <span className="font-semibold tabular-nums text-adm-ink">{usd(total(c))}</span>
          </div>
          <StackedBar c={c} max={max} label={`${name}, ${min} minutes: ${usd(total(c))}`} />
        </div>
      ))}
      <p className="text-11 text-adm-ink-2">
        {total(costs[0].c) > 0 ? `Dominated by ${MEDIA_LABEL[d.media].toLowerCase()} (${pct(d.share)} at ${costs[costs.length - 1].min} min).` : 'Nothing generated.'}
      </p>
    </div>
  )
}

function Measured2025() {
  const avg = measuredAverage()
  const t = MEASURED_2025.total
  return (
    <div className="flex flex-col gap-8 rounded-8 border border-adm-good/40 p-12">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h3 className="text-13 font-semibold text-adm-ink">2025 measured: the real baseline from the old admin</h3>
        <NumBadge label="measured" />
      </div>
      <p className="text-12 text-adm-ink-2">
        {eur(t)} for all 2025 test sessions; the ten costliest averaged {eur(avg)} a session. Length was not recorded. Voice {pct(MEASURED_2025.byMedia.voice / t)} and video {pct(MEASURED_2025.byMedia.video / t)} of the total: the 2026 variations above leave video out by default for that reason.
      </p>
      <StackedBar c={MEASURED_2025.byMedia} max={t} label={`2025 measured, ${eur(t)} by media`} />
      <p className="text-11 text-adm-ink-2">{MEDIA.map((m) => `${MEDIA_LABEL[m].split(' ')[0]} ${eur(MEASURED_2025.byMedia[m])}`).join(' · ')}</p>
      <details className="text-12">
        <summary className="cursor-pointer font-medium text-adm-ink-2 hover:text-adm-ink">The ten costliest campaigns (a campaign is a session)</summary>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left tabular-nums">
            <thead className="text-11 uppercase tracking-wider text-adm-muted">
              <tr className="border-b border-adm-line">
                {['Campaign', 'Text', 'Voice', 'Image', 'Music', 'Video', 'Total'].map((h) => <th key={h} className="py-4 pr-10 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {MEASURED_2025.campaigns.map((c, i) => (
                <tr key={i} className="border-b border-adm-line last:border-0">
                  <td className="py-4 pr-10 text-adm-ink">{c.name}</td>
                  {[c.script, c.voice, c.image, c.music, c.video].map((v, j) => <td key={j} className="py-4 pr-10 text-adm-ink-2">{eur(v)}</td>)}
                  <td className="py-4 font-semibold text-adm-ink">{eur(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

/* ------------------------------------------------------ The connected graph */

const GW = 1180
const NW = 196
const NH = 54
const COLX = [8, 262, 516, 770, 980]
const rowY = (r: number) => 40 + r * 70

function ConnectedGraph({ values, changed, from, selected, onSelect }: { values: Record<NodeId, string>; changed: Set<NodeId>; from: NodeId | null; selected: NodeId; onSelect: (id: NodeId) => void }) {
  const pos = new Map(GRAPH_NODES.map((n) => [n.id, { x: COLX[n.col], y: rowY(n.row) }]))
  const H = rowY(5) + NH + 16
  const hot = (id: NodeId) => changed.has(id) || id === from
  return (
    <div className="overflow-x-auto rounded-8 border border-adm-line bg-adm-bg">
      <svg viewBox={`0 0 ${GW} ${H}`} width={GW} height={H} role="img" aria-label="Graph: the variables on the left feed uplift, chapters, flip probability and cost, then cost per flip, the price anchor and profit per flip." className="block min-w-[1100px] max-w-none">
        <text x={8} y={22} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">Variables</text>
        <text x={COLX[1]} y={22} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">Per chapter</text>
        <text x={COLX[2]} y={22} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">Per journey</text>
        <text x={COLX[3]} y={22} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">Per flip</text>
        <text x={COLX[4]} y={22} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">Outcome</text>
        {GRAPH_EDGES.map(([a, b]) => {
          const p = pos.get(a)!
          const q = pos.get(b)!
          const back = q.x <= p.x
          const x1 = back ? p.x + NW / 2 : p.x + NW
          const y1 = back ? p.y : p.y + NH / 2
          const x2 = back ? q.x + NW / 2 : q.x
          const y2 = back ? q.y + NH : q.y + NH / 2
          const mid = (x1 + x2) / 2
          const lit = hot(a) && hot(b)
          const d = back ? `M ${x1} ${y1} C ${x1} ${y1 - 30}, ${x2} ${y2 + 30}, ${x2} ${y2}` : `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
          return <path key={`${a}-${b}`} d={d} fill="none" className={lit ? 'stroke-adm-s2' : 'stroke-adm-axis'} strokeWidth={lit ? 2.5 : 1.25} opacity={lit ? 1 : 0.8} />
        })}
        {GRAPH_NODES.map((n) => {
          const p = pos.get(n.id)!
          const isHot = hot(n.id)
          const isSel = selected === n.id
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-label={`${n.label}: ${values[n.id]}. Show its formula.`}
              aria-pressed={isSel}
              onClick={() => onSelect(n.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(n.id)
                }
              }}
              className="cursor-pointer outline-none"
            >
              <rect x={p.x} y={p.y} width={NW} height={NH} rx={8} className={`${n.input ? 'fill-adm-surface' : 'fill-adm-hover'} ${isHot ? 'stroke-adm-s2' : isSel ? 'stroke-adm-ink' : 'stroke-adm-line'}`} strokeWidth={isHot || isSel ? 2 : 1} />
              <text x={p.x + 10} y={p.y + 20} className="fill-adm-muted text-11 font-semibold">{n.label}</text>
              <text x={p.x + 10} y={p.y + 40} className="fill-adm-ink text-12 font-semibold">{values[n.id].length > 28 ? `${values[n.id].slice(0, 27)}…` : values[n.id]}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function NodeExplain({ id, value }: { id: NodeId; value: string }) {
  const n = GRAPH_NODES.find((x) => x.id === id)!
  return (
    <div className="flex flex-col gap-4 rounded-8 border border-adm-line p-12 text-12" aria-live="polite">
      <div className="flex flex-wrap items-center gap-8">
        <span className="text-13 font-semibold text-adm-ink">{n.label}</span>
        <span className="font-semibold tabular-nums text-adm-ink">{value}</span>
        <NumBadge label={n.label2} />
      </div>
      <p className="text-adm-ink-2"><span className="font-medium text-adm-ink">Formula: </span>{n.formula}</p>
      <p className="text-adm-muted">Source: {n.source}</p>
      <p className="text-11 text-adm-muted">Orange boxes and lines: what your last change moved.</p>
    </div>
  )
}

/* ------------------------------------------------------------ Stage chart */

function StageChart({ stages }: { stages: { st: Stage; r: ReturnType<typeof goal> }[] }) {
  const W = 640
  const H = 220
  const L = 56
  const R = 48
  const B = 30
  const T = 16
  const vals = stages.flatMap(({ r }) => [r.costPerFlip, r.profitPerFlip].filter(isFinite))
  const maxV = Math.max(1, ...vals)
  const minV = Math.min(0, ...vals)
  const y = (v: number) => T + ((maxV - v) / (maxV - minV)) * (H - T - B)
  const maxU = Math.max(...stages.map((s) => s.r.uplift)) * 1.2
  const yU = (u: number) => T + (1 - u / maxU) * (H - T - B)
  const slot = (W - L - R) / stages.length
  const bw = 34
  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-[720px] min-w-[480px]" role="img" aria-label="Chart: cost per flip and profit per flip in dollars as bars, uplift per chapter as a line, for stages 1 to 3.">
          {[minV, 0, maxV / 2, maxV].map((v, i) => (
            <g key={i}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? 'stroke-adm-axis' : 'stroke-adm-grid'} />
              <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-10 tabular-nums">{usd(v)}</text>
            </g>
          ))}
          <text x={W - R + 6} y={T + 4} className="fill-adm-muted text-10">pts</text>
          {stages.map(({ st, r }, i) => {
            const cx = L + slot * i + slot / 2
            const cost = isFinite(r.costPerFlip) ? r.costPerFlip : 0
            const prof = isFinite(r.profitPerFlip) ? r.profitPerFlip : 0
            return (
              <g key={st}>
                <rect x={cx - bw - 2} y={Math.min(y(cost), y(0))} width={bw} height={Math.abs(y(0) - y(cost))} className="fill-adm-s2" />
                <rect x={cx + 2} y={Math.min(y(prof), y(0))} width={bw} height={Math.abs(y(0) - y(prof))} className={prof >= 0 ? 'fill-adm-s3' : 'fill-adm-critical'} />
                <text x={cx} y={H - 10} textAnchor="middle" className="fill-adm-ink text-11 font-medium">{STAGES[st].name}</text>
              </g>
            )
          })}
          <polyline
            fill="none"
            className="stroke-adm-s1"
            strokeWidth={2.5}
            points={stages.map(({ r }, i) => `${L + slot * i + slot / 2},${yU(r.uplift)}`).join(' ')}
          />
          {stages.map(({ st, r }, i) => (
            <g key={st}>
              <circle cx={L + slot * i + slot / 2} cy={yU(r.uplift)} r={4} className="fill-adm-s1" />
              <text x={L + slot * i + slot / 2 + 8} y={yU(r.uplift) - 6} className="fill-adm-s1 text-11 font-semibold">+{r.uplift.toFixed(2)}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-14 gap-y-4 text-12 text-adm-ink-2">
        <span className="inline-flex items-center gap-6"><span className="size-8 rounded-2 bg-adm-s2" aria-hidden="true" />Cost per flip (estimate × scenario)</span>
        <span className="inline-flex items-center gap-6"><span className="size-8 rounded-2 bg-adm-s3" aria-hidden="true" />Profit per flip (scenario)</span>
        <span className="inline-flex items-center gap-6"><span className="h-2 w-12 bg-adm-s1" aria-hidden="true" />Uplift per chapter, points (scenario)</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ Metric lines */

function MetricLines({ stages }: { stages: { st: Stage; r: ReturnType<typeof goal> }[] }) {
  const s = (f: (x: (typeof stages)[number]) => string) => stages.map(f).join(' → ')
  const rows: { line: string; metric: string; now: string; target: string; measurable: string; lab: NumberLabel }[] = [
    { line: '1 · Compute cost', metric: 'Cost per chapter', now: s((x) => usd(x.r.costPerChapter)), target: 'Falls with the stage cost factor 1 → 0.58 → 0.26', measurable: 'Yes, once the backend logs supplier calls (2025 admin did: €40.27)', lab: 'estimate' },
    { line: '1 · Compute cost', metric: 'Cost per flip', now: s((x) => usd(x.r.costPerFlip)), target: 'Spec: $4.98 → $2.04 → $0.58', measurable: 'Cost yes; “per flip” needs real flips', lab: 'estimate' },
    { line: '1 · Compute cost', metric: 'Cost per uplift point', now: s((x) => usd(x.r.costPerPoint)), target: 'Spec: $0.0829 → $0.0340 → $0.0097', measurable: 'No: needs real check-ins', lab: 'scenario' },
    { line: '2 · Causal AI', metric: 'Chapters to flip', now: s((x) => `${x.r.chapters}`), target: 'Spec: 42 → 32 → 22', measurable: 'No: needs real journeys', lab: 'scenario' },
    { line: '2 · Causal AI', metric: 'Density (DCI, 0–1)', now: s((x) => STAGES[x.st].density.toFixed(2)), target: 'Spec: 0.22 → 0.61 → 0.91 (assumed; no definition we can compute yet)', measurable: 'No: not defined', lab: 'scenario' },
    { line: '2 · Causal AI', metric: 'Velocity (VCI, 0–1)', now: s((x) => STAGES[x.st].velocity.toFixed(2)), target: 'Spec: 0.35 → 0.72 → 0.94 (assumed)', measurable: 'No: not defined', lab: 'scenario' },
    { line: '3 · Therapeutic', metric: 'Flip rate', now: s((x) => pct(x.r.flipProbability)), target: 'Spec: 54% → 74.5% → 89%', measurable: 'No: no real users yet', lab: 'scenario' },
    { line: '3 · Therapeutic', metric: 'Uplift per chapter', now: s((x) => `+${x.r.uplift.toFixed(2)}`), target: 'Spec: +1.43 → +1.88 → +2.73', measurable: 'No: needs pre- and post-session scores', lab: 'scenario' },
    { line: '3 · Therapeutic', metric: 'Real-user outcome', now: '—', target: 'A measured flip in the feedback group', measurable: 'No: the study’s numbers are sample data', lab: 'scenario' },
  ]
  return (
    <Panel title="Three metric lines, with targets" description="Compute cost, Causal AI and therapeutic, as the business owner asked. Values at stage 1 → 2 → 3 with your variables. None of the therapeutic line is measurable yet.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-12">
          <thead className="text-11 uppercase tracking-wider text-adm-muted">
            <tr className="border-b border-adm-line">
              {['Line', 'Metric', 'This model, stage 1 → 2 → 3', 'Target', 'Measurable now?', 'Label'].map((h) => <th key={h} className="py-6 pr-12 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.metric} className="border-b border-adm-line align-top last:border-0">
                <td className="py-8 pr-12 text-adm-muted">{r.line}</td>
                <td className="py-8 pr-12 font-medium text-adm-ink">{r.metric}</td>
                <td className="py-8 pr-12 tabular-nums text-adm-ink">{r.now}</td>
                <td className="py-8 pr-12 text-adm-ink-2">{r.target}</td>
                <td className="py-8 pr-12 text-adm-ink-2">
                  {r.measurable.startsWith('No') && <AlertTriangle size={11} className="mr-4 inline text-adm-serious" aria-hidden="true" />}
                  {r.measurable}
                </td>
                <td className="py-8"><NumBadge label={r.lab} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
