import { Check, Copy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageSummary, PageTabs } from '../components/PageTabs'
import { usePageTab } from '../components/pageTab'
import { Badge, PageHeader, Panel } from '../components/ui'
import {
  CORE_FNS,
  EFFORT_COST,
  FUNCTION_LABEL,
  STATED_TO_REAL,
  brainMetrics,
  functionChance,
  mvpChance,
  pct,
  prototypeMap,
  rankFeatures,
  stageChance,
  topThreeEffect,
  weeklyReport,
  type BrainMetric,
  type FunctionId,
} from '../data/aiBrain'
import { akpSummary, akps } from '../data/akps'
import { STAGES } from '../data/businessFunnel'
import { v8Tallies } from '../data/buyerRunV8'
import { stateFlipSummary } from '../data/stateFlips'
import { DataSourceTypeBadge, DataSources } from './reports/DataSources'

/*
 * Admin → AI brain (U147, J206): the business owner's five functions as one
 * model. All numbers and formulas come from data/aiBrain.ts.
 */

const fmt = (m: BrainMetric, v: number) => (m.unit === 'usd' ? `$${v.toFixed(2)}` : m.unit === 'count' ? `${Math.round(v)}` : `${Math.round(v * 100)}%`)

const FN_TEXT: Record<FunctionId, string> = {
  wellness: 'Solving bad to good: the StateFlips, the AKPs that build them, the cohort’s chance to flip and what a flip costs.',
  product: 'The experience that gets someone from first visit to feeling better: product AKPs (PR-), the user journey and the features to build next.',
  business: 'From the usage cap to paying and staying: the business funnel stages, their MVP targets and the buyer agents’ results.',
  brand: 'Placeholder: waiting for the marketing AKP sheet (campaign goals, audience states, voices, channels). Nothing is computed until it comes.',
  analysis: 'MicroBite “Maxwell” and TheraGPS “Governor”: the two engines that learn from every person. Placeholder data until real outcomes exist.',
}

export function AiBrainPage() {
  const metrics = useMemo(() => brainMetrics(), [])
  const ranked = useMemo(() => rankFeatures(), [])
  const top3 = useMemo(() => topThreeEffect(), [])
  const proto = useMemo(() => prototypeMap(), [])
  const report = useMemo(() => weeklyReport(), [])
  const x = useMemo(() => v8Tallies(), [])
  const [, setTab] = usePageTab()
  const mvp = mvpChance(metrics)
  const weakest = [...CORE_FNS].sort((a, b) => functionChance(metrics, a) - functionChance(metrics, b))[0]

  return (
    <div className="flex flex-col gap-16">
      <PageHeader title="AI brain" description="Wellness, Product, Business, Brand and Analysis as one model: each function’s metrics, MVP targets, a transparent chance to reach them, and the features that would raise it most." />
      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
            <PageSummary
              purpose="seeing, in one place, how close each function of the AI brain is to its MVP target, and which features would move it most."
              question="What is the chance we reach the MVP targets, and what should ship next to raise it?"
              answer={`All three core functions together: ${pct(mvp)}. ${FUNCTION_LABEL[weakest]} is furthest from target (${pct(functionChance(metrics, weakest))}). If the top 3 features ship (${top3.top.map((f) => f.name.toLowerCase()).join('; ')}), the chance goes from ${pct(top3.mvpBefore)} to ${pct(top3.mvpAfter)}.`}
              stats={CORE_FNS.map((f) => ({ label: `${FUNCTION_LABEL[f]}: chance to reach target`, value: pct(functionChance(metrics, f)), note: 'Product of stage chances' }))}
              next={[
                { text: 'Read how each chance is worked out, metric by metric.', to: '?tab=detail#functions', linkLabel: 'Functions' },
                { text: 'See the feature ranking and the top 3’s effect.', to: '?tab=detail#features', linkLabel: 'Feature ranking' },
                { text: 'Copy this week’s plain-language report.', to: '?tab=detail#weekly', linkLabel: 'Weekly report' },
              ]}
              note="Every number is simulated or assumed until real users exist; a stage chance is “how close to target”, not a measured probability."
              onDetail={() => setTab('detail')}
            />
            <DataSources route="/admin/ai-brain" />
          </div>
        }
      >
        <Panel title="How the chance is worked out" description="Plain formulas, so every number on this page can be redone by hand.">
          <ul className="flex flex-col gap-6 text-13 text-adm-ink-2">
            <li><span className="font-semibold text-adm-ink">Stage chance</span> = min(1, current ÷ target); for a cost, min(1, target ÷ current).</li>
            <li><span className="font-semibold text-adm-ink">Function chance</span> = the product of its stage chances.</li>
            <li><span className="font-semibold text-adm-ink">MVP chance</span> = Wellness × Product × Business. Brand and Analysis have no target yet.</li>
            <li><span className="font-semibold text-adm-ink">Feature score</span> = impact × confidence ÷ effort (S {EFFORT_COST.S}, M {EFFORT_COST.M}, L {EFFORT_COST.L}); impact = the rise in the three function chances when the feature’s assumed lift is applied.</li>
          </ul>
        </Panel>

        <section id="functions" className="grid min-w-0 scroll-mt-16 gap-16 lg:grid-cols-2">
          {CORE_FNS.map((fn) => (
            <FunctionCard key={fn} fn={fn} metrics={metrics.filter((m) => m.fn === fn)} extra={<FunctionExtra fn={fn} paid={`${x.payB.yes} of ${x.n}`} />} />
          ))}
          <PlaceholderCard fn="brand" />
        </section>

        <section id="analysis" className="scroll-mt-16">
          <Panel title="Analysis: Maxwell and TheraGPS" description={FN_TEXT.analysis}>
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12">
                <span className="text-13 font-semibold text-adm-ink">MicroBite “Maxwell”: resonance dynamics</span>
                <p className="text-12 text-adm-ink-2">As the business owner describes it: learns which small building blocks (bites of voice, music, image, script) resonate with which person, and makes the next chapter from the ones that worked. In our terms: the learned link strengths of the Healing map, which today are all “learned from users: none yet”.</p>
                <p className="text-12 text-adm-muted">Prototype: 4,870 AKPs. Ours: 0 learned links (placeholder until check-ins are recorded).</p>
              </div>
              <div className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12">
                <span className="text-13 font-semibold text-adm-ink">TheraGPS “Governor”: therapeutic precision</span>
                <p className="text-12 text-adm-ink-2">Routes each person to their StateFlip and steers chapter by chapter, like a navigation system re-routing. In our terms: main need → StateFlip (used for {x.n} people in test 8, {x.flipsUsed} StateFlips), the chance and weeks to the flip, and the safety route (the {x.excluded} risk-flagged go to Need help now?).</p>
                <p className="text-12 text-adm-muted">Prototype: 10,497 AKPs. Ours: the routing rule is live; no AKPs of its own yet.</p>
              </div>
            </div>
          </Panel>
        </section>

        <section id="connections" className="scroll-mt-16">
          <Panel title="How the functions feed each other" description="When wellness flips more people, they feel better and come back; that feeds paying and revenue, which funds product. Brand brings people in; Analysis learns from all of it.">
            <BrainDiagram />
          </Panel>
        </section>

        <section id="features" className="scroll-mt-16">
          <Panel title={`Feature ranking: if the top 3 ship, the MVP chance goes from ${pct(top3.mvpBefore)} to ${pct(top3.mvpAfter)}`} description={`Candidate features from the B2B2C features list and the journey. Lifts are assumptions; test 8’s stated lift is multiplied by ${STATED_TO_REAL} to read as a real one. A feature that lifts a metric already on target scores 0.`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-12">
                <thead className="text-11 uppercase tracking-wider text-adm-muted">
                  <tr className="border-b border-adm-line">
                    <th className="py-6 pr-12 font-semibold">#</th>
                    <th className="py-6 pr-12 font-semibold">Feature</th>
                    <th className="py-6 pr-12 font-semibold">Lifts (assumed)</th>
                    <th className="py-6 pr-12 font-semibold">Impact</th>
                    <th className="py-6 pr-12 font-semibold">Conf.</th>
                    <th className="py-6 pr-12 font-semibold">Effort</th>
                    <th className="py-6 pr-12 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((f, i) => (
                    <tr key={f.id} className={`border-b border-adm-line align-top last:border-0 ${i < 3 ? 'bg-adm-s2/10' : ''}`}>
                      <td className="py-8 pr-12 tabular-nums">{i + 1}</td>
                      <td className="py-8 pr-12">
                        <span className="font-semibold text-adm-ink">{f.name}</span>
                        <span className="block text-adm-muted">{f.from} · {f.evidence}</span>
                      </td>
                      <td className="py-8 pr-12 text-adm-ink-2">{f.lifts.length ? f.lifts.map((l) => `${metrics.find((m) => m.id === l.metric)?.label ?? l.metric} +${Math.round(l.by * 100)} pts`).join('; ') : 'None (a floor)'}</td>
                      <td className="py-8 pr-12 tabular-nums">+{(f.impactTotal * 100).toFixed(1)} pts</td>
                      <td className="py-8 pr-12 tabular-nums">{f.confidence}</td>
                      <td className="py-8 pr-12">{f.effort}</td>
                      <td className="py-8 pr-12 font-semibold tabular-nums">{(f.score * 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="grid gap-8 sm:grid-cols-3">
              {CORE_FNS.map((f) => (
                <div key={f} className="rounded-8 border border-adm-line bg-adm-bg p-12">
                  <dt className="text-12 text-adm-muted">{FUNCTION_LABEL[f]} after the top 3</dt>
                  <dd className="text-18 font-semibold tabular-nums text-adm-ink">{pct(top3.before[f])} → {pct(top3.after[f])}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </section>

        <section id="prototype" className="scroll-mt-16">
          <Panel title="Map of the business owner’s 5 functions: prototype against ours" description="Prototype values are display only (his Figma Make, no logic behind them). Ours are counted from the AKP catalogue (akps.ts).">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-12">
                <thead className="text-11 uppercase tracking-wider text-adm-muted">
                  <tr className="border-b border-adm-line">
                    <th className="py-6 pr-12 font-semibold">Function</th>
                    <th className="py-6 pr-12 font-semibold">Prototype value</th>
                    <th className="py-6 pr-12 font-semibold">In our catalogue</th>
                    <th className="py-6 pr-12 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {proto.map((r) => (
                    <tr key={r.fn} className="border-b border-adm-line last:border-0">
                      <td className="py-8 pr-12 font-semibold text-adm-ink">{r.fn}</td>
                      <td className="py-8 pr-12 tabular-nums">{r.prototype === null ? '—' : r.prototype.toLocaleString('en-US')} {r.prototype !== null && <Badge tone="warning">prototype</Badge>}</td>
                      <td className="py-8 pr-12 tabular-nums">{r.ours.toLocaleString('en-US')} <Badge tone="info">ours</Badge></td>
                      <td className="py-8 pr-12 text-adm-ink-2">{r.oursNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-12 text-adm-muted">Prototype Command Center total: 10,087 AKPs (4,590 + 1,847 + 1,970 + 1,680). Ours: {akpSummary().total.toLocaleString('en-US')} AKPs, all draft.</p>
          </Panel>
        </section>

        <section id="weekly" className="scroll-mt-16">
          <WeeklyReport text={report} />
        </section>

        <DataSources route="/admin/ai-brain" full />
      </PageTabs>
    </div>
  )
}

function FunctionCard({ fn, metrics, extra }: { fn: FunctionId; metrics: BrainMetric[]; extra?: ReactNode }) {
  const p = metrics.reduce((t, m) => t * stageChance(m), 1)
  return (
    <section className="flex min-w-0 flex-col gap-12 rounded-12 border border-adm-line bg-adm-surface p-16">
      <header className="flex flex-wrap items-baseline justify-between gap-8">
        <h2 className="text-15 font-semibold text-adm-ink">{FUNCTION_LABEL[fn]}</h2>
        <span className="text-13 text-adm-ink-2">Chance to reach target <span className="font-semibold tabular-nums text-adm-ink">{pct(p)}</span></span>
      </header>
      <p className="text-12 text-adm-ink-2">{FN_TEXT[fn]}</p>
      <ul className="flex flex-col">
        {metrics.map((m) => (
          <li key={m.id} className="flex min-w-0 flex-col gap-4 border-t border-adm-line py-8 first:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-8">
              <span className="text-13 text-adm-ink">{m.label}</span>
              <DataSourceTypeBadge type={m.source} />
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-2 text-12 tabular-nums text-adm-ink-2">
              <span>Now <span className="font-semibold text-adm-ink">{fmt(m, m.current)}</span></span>
              <span>MVP target {fmt(m, m.target)}</span>
              <span>Stage chance {pct(stageChance(m))}</span>
            </div>
            <span className="text-11 text-adm-muted">{m.sourceNote}</span>
          </li>
        ))}
      </ul>
      <p className="text-12 text-adm-muted">= {metrics.map((m) => stageChance(m).toFixed(2)).join(' × ')} = {pct(p)}</p>
      {extra}
    </section>
  )
}

function FunctionExtra({ fn, paid }: { fn: FunctionId; paid: string }) {
  if (fn === 'wellness') {
    const s = stateFlipSummary()
    return <p className="text-12 text-adm-ink-2">{s.total} StateFlips across 5 dimensions; {akpSummary().byFunction.wellness} wellness AKPs. <Link className="font-medium underline" to="/admin/stateflips">Open StateFlips</Link></p>
  }
  if (fn === 'product') return <p className="text-12 text-adm-ink-2">{akps().filter((a) => a.id.startsWith('PR-')).length} product AKPs (PR-). <Link className="font-medium underline" to="/admin/user-journey">Open the user journey</Link></p>
  return <p className="text-12 text-adm-ink-2">Stages: {STAGES.map((s) => s.title).join(' → ')}. Test 8 would pay: {paid}. <Link className="font-medium underline" to="/admin/business-funnel">Open the business funnel</Link></p>
}

function PlaceholderCard({ fn }: { fn: FunctionId }) {
  return (
    <section className="flex min-w-0 flex-col gap-8 rounded-12 border border-dashed border-adm-line bg-adm-surface p-16">
      <header className="flex flex-wrap items-baseline justify-between gap-8">
        <h2 className="text-15 font-semibold text-adm-ink">{FUNCTION_LABEL[fn]}</h2>
        <Badge>Waiting for data</Badge>
      </header>
      <p className="text-12 text-adm-ink-2">{FN_TEXT[fn]}</p>
      <p className="text-12 text-adm-muted">Prototype: 1,847 brand AKPs, 43 champions (display only). Ours: {akpSummary().byFunction.brand}. No MVP target and no chance until the sheet arrives.</p>
    </section>
  )
}

const NODES: { id: string; label: string; x: number; y: number }[] = [
  { id: 'brand', label: 'Brand', x: 80, y: 60 },
  { id: 'wellness', label: 'Wellness', x: 300, y: 60 },
  { id: 'product', label: 'Product', x: 520, y: 60 },
  { id: 'business', label: 'Business', x: 410, y: 200 },
  { id: 'analysis', label: 'Analysis', x: 190, y: 200 },
]
const EDGES: [string, string, string][] = [
  ['brand', 'wellness', 'brings people in'],
  ['wellness', 'product', 'flips → felt better'],
  ['product', 'business', 'comes back → pays'],
  ['business', 'wellness', 'revenue funds flips'],
  ['analysis', 'wellness', 'learns what works'],
  ['business', 'analysis', 'outcomes'],
]

function BrainDiagram() {
  const at = (id: string) => NODES.find((n) => n.id === id)!
  return (
    <svg viewBox="0 0 600 260" role="img" aria-label="Brand brings people in to Wellness; wellness flips make Product’s felt-better; Product’s returning users pay in Business; revenue funds flips; Analysis learns from outcomes and feeds Wellness." className="h-auto w-full max-w-[720px]">
      <defs>
        <marker id="brain-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-adm-muted)" />
        </marker>
      </defs>
      {EDGES.map(([a, b, label]) => {
        const p = at(a)
        const q = at(b)
        const dx = q.x - p.x
        const dy = q.y - p.y
        const d = Math.hypot(dx, dy)
        const k = 48 / d
        return (
          <g key={`${a}-${b}`}>
            <line x1={p.x + dx * k} y1={p.y + dy * k} x2={q.x - dx * k} y2={q.y - dy * k} stroke="var(--color-adm-muted)" strokeWidth="1.5" markerEnd="url(#brain-arrow)" />
            <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 6} textAnchor="middle" fontSize="11" fill="var(--color-adm-ink-2)">{label}</text>
          </g>
        )
      })}
      {NODES.map((n) => (
        <g key={n.id}>
          <rect x={n.x - 46} y={n.y - 18} width="92" height="36" rx="8" fill="var(--color-adm-surface)" stroke="var(--color-adm-ink)" strokeWidth="1.5" strokeDasharray={n.id === 'brand' ? '4 3' : undefined} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-adm-ink)">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

function WeeklyReport({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <Panel
      title="Weekly report"
      description="Written from this week’s numbers and the latest run’s change declaration. Copy it into a message."
      actions={
        <button type="button" onClick={copy} className="inline-flex items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      }
    >
      <pre className="whitespace-pre-wrap break-words rounded-8 bg-adm-bg p-12 font-sans text-12 text-adm-ink">{text}</pre>
    </Panel>
  )
}
