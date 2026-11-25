import { DEFAULT_DECISIONS, STAGES as FUNNEL_STAGES, biggestLeak, funnelMetrics, stageStatus, type StageId } from './businessFunnel'
import { movedBy, runTallies } from './buyerAgentReport'
import { BUYER_RUNS } from './buyerRuns'
import { V3_CHANGES } from './buyerRunV3'
import { v5Tallies } from './buyerRunV5'
import { V6_CHANGES, v6Tallies } from './buyerRunV6'
import { v7Tallies } from './buyerRunV7'
import { report } from './buyerSim'
import { ANCHORS, ASSUME, DEFAULT_GOAL, MEASURED_2025, MEDIA, PRESETS, STAGES as COST_STAGES, chapterCost, goal, measuredAverage, presetInputs, supplier, total, type Media, type Stage } from './costModel'
import type { SourceLabel } from './reportSources'

/**
 * Admin → Reports, summary first (U126, J179). The answer, the KPI tiles,
 * the next moves and the confidence strip of each report, derived from the
 * same models the details read. Nothing in a headline is typed in: every
 * number comes from a run, a funnel metric or the cost model, so a change in
 * the data changes the summary. `reportSummaries.test.ts` pins that.
 */

export type SummaryStatus = 'on-track' | 'at-risk' | 'not-measured'

export interface Tile {
  label: string
  value: string
  badge: SourceLabel
  /** Against the previous comparable figure; omitted when there is none. */
  delta?: string
  /** True when the delta is good news. */
  deltaGood?: boolean
  note?: string
}

export interface NextAction {
  text: string
  to: string
  linkLabel: string
}

export interface Confidence {
  measured: string
  predicted: string
  assumed: string
}

export interface ReportSummary {
  question: string
  headline: string
  status: SummaryStatus
  statusNote: string
  tiles: Tile[]
  actions: NextAction[]
  confidence: Confidence
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const share = (k: number, n: number) => (n ? k / n : 0)
const pts = (a: number, b: number) => {
  const d = Math.round((b - a) * 100)
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} pts`
}
const money = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`
const decision = (id: string) => DEFAULT_DECISIONS.find((d) => d.id === id)!

/* ------------------------------------------------------------ Buyer agents */

export interface TrendPoint {
  id: string
  name: string
  /** Share of the panel, 0–1; null when the report did not ask it. */
  tries: number | null
  pays: number | null
  sure30: number | null
  n: number
  /** What changed in this report's inputs, in a few words. */
  change: string
}

/** Try, pay and sure-at-day-30 per report, on the offer each report led with. */
export function buyerTrend(): TrendPoint[] {
  const run = (v: number) => runTallies(BUYER_RUNS.find((r) => r.version === v)!.answers)
  const [t1, t2, t3] = [run(1), run(2), run(3)]
  const x5 = v5Tallies()
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  const best = report(3, 3)
  return [
    { id: 'it-v1', name: 'v1', n: t1.n, tries: share(t1.tries.yes, t1.n), pays: share(t1.pays.yes, t1.n), sure30: share(t1.sureDay30, t1.n), change: 'First run, 10 people, agent too agreeable' },
    { id: 'it-v2', name: 'v2', n: t2.n, tries: share(t2.tries.yes, t2.n), pays: share(t2.pays.yes, t2.n), sure30: share(t2.sureDay30, t2.n), change: 'Calibrated agent, 36 people, local prices' },
    { id: 'it-v3', name: 'v3', n: t3.n, tries: share(t3.tries.yes, t3.n), pays: share(t3.pays.yes, t3.n), sure30: share(t3.sureDay30, t3.n), change: 'Proposal B (not built): no account, languages' },
    { id: 'it-rerun', name: 'v4', n: best.walks.length, tries: null, pays: null, sure30: best.d30, change: 'Walked real screens; day 30 = back after a month' },
    { id: 'it-v5', name: 'v5', n: x5.t.n, tries: share(x5.t.tries.yes, x5.t.n), pays: share(x5.t.pays.yes, x5.t.n), sure30: share(x5.day30, x5.t.n), change: 'Today’s product at today’s $10 price' },
    { id: 'it-v6', name: 'v6', n: x6.A.n, tries: share(x6.A.tries.yes, x6.A.n), pays: share(x6.A.pays.yes, x6.A.n), sure30: null, change: '60 people; freemium beat the creator retreat' },
    { id: 'it-v7', name: 'v7', n: x7.B.n, tries: share(x7.B.tries.yes, x7.B.n), pays: share(x7.B.pays.yes, x7.B.n), sure30: share(x7.day30B, x7.B.n), change: '100 people; + free library and quick wins' },
  ]
}

export interface Lever {
  theme: string
  change: string
  report: string
  moved: number
  n: number
  share: number
}

/** The changes that moved most answers, one per theme, from reports v3, v6 and v7. */
export function buyerLevers(): Lever[] {
  const r3 = BUYER_RUNS.find((r) => r.version === 3)!
  const n3 = r3.answers.length
  const m3 = new Map(movedBy(r3))
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  const m6 = new Map(x6.moved)
  const m7 = new Map(x7.moved)
  const rows: Omit<Lever, 'share'>[] = [
    { theme: 'Account-first', change: V3_CHANGES['no-account'].label, report: 'v3', moved: m3.get('no-account') ?? 0, n: n3 },
    { theme: 'Language', change: V3_CHANGES.language.label, report: 'v3', moved: m3.get('language') ?? 0, n: n3 },
    { theme: 'Trust', change: V3_CHANGES['data-line'].label, report: 'v3', moved: m3.get('data-line') ?? 0, n: n3 },
    { theme: 'Price / regional', change: V3_CHANGES['local-price'].label, report: 'v3', moved: m3.get('local-price') ?? 0, n: n3 },
    { theme: 'Free library', change: V6_CHANGES['free-library']?.label ?? 'Free core library', report: 'v7', moved: m7.get('free-library') ?? 0, n: x7.B.n },
    { theme: 'Creator voice', change: V6_CHANGES['creator-voice']?.label ?? 'Creator voice', report: 'v6', moved: m6.get('creator-voice') ?? 0, n: x6.A.n },
  ]
  return rows.map((r) => ({ ...r, share: share(r.moved, r.n) })).sort((a, b) => b.share - a.share)
}

export function buyerSummary(): ReportSummary {
  const x5 = v5Tallies()
  const x7 = v7Tallies()
  const n = x5.t.n
  const tryShare = share(x5.t.tries.yes, n)
  const payShare = share(x5.t.pays.yes, n)
  const v3ATry = share(x5.v3A.tries.yes, x5.v3A.n)
  const v3APay = share(x5.v3A.pays.yes, x5.v3A.n)
  const tryA7 = share(x7.A.tries.yes, x7.A.n)
  const tryB7 = share(x7.B.tries.yes, x7.B.n)
  const lift = x7.moved[0]
  const liftLabel = lift ? (V6_CHANGES[lift[0]]?.label ?? lift[0]).replace(/^A /, '').split(',')[0] : 'none'
  const objection = x5.themes[0]?.[0] ?? '—'
  const lever = buyerLevers()[0]
  const status: SummaryStatus = payShare >= 0.15 && x5.band.high >= 10 ? 'on-track' : 'at-risk'
  return {
    question: 'How likely is Aurelia to succeed with what we have now?',
    headline: `On today’s product, ${pct(tryShare)} of buyer agents would try Aurelia and ${pct(payShare)} would pay $10 a month, but they call ${money(x5.band.low)}–${money(x5.band.high)} fair; a ${liftLabel.toLowerCase()} (report v7) lifts trying to ${pct(tryB7)} in the best tested alternative.`,
    status,
    statusNote: status === 'at-risk' ? `Pay intent below 15%; fair price under $10` : 'Pay intent and price on target',
    tiles: [
      { label: 'Would try today (v5)', value: pct(tryShare), badge: 'prediction', delta: `${pts(v3ATry, tryShare)} vs v3 offer A`, deltaGood: tryShare >= v3ATry, note: `${x5.t.tries.yes} of ${n}` },
      { label: 'Would pay $10 (v5)', value: pct(payShare), badge: 'prediction', delta: `${pts(v3APay, payShare)} vs v3 offer A`, deltaGood: payShare >= v3APay, note: `${x5.t.pays.yes} of ${n}; top objection: ${objection}` },
      { label: 'Fair price band vs $10', value: `${money(x5.band.low)}–${money(x5.band.high)}`, badge: 'prediction', note: 'a month; $10 is above the band' },
      { label: 'Best tested lift (v7)', value: `${pct(tryA7)} → ${pct(tryB7)}`, badge: 'prediction', delta: pts(tryA7, tryB7), deltaGood: tryB7 >= tryA7, note: `would try with a ${liftLabel.toLowerCase()}` },
    ],
    actions: [
      { text: `${decision('d1').change} (${lever.theme.toLowerCase()} moved ${lever.moved} of ${lever.n} answers)`, to: '/admin/business-funnel', linkLabel: 'Decision d1' },
      { text: decision('d3').change, to: '/admin/business-funnel', linkLabel: 'Decision d3' },
      { text: `Test a price inside the fair band (${money(x5.band.low)}–${money(x5.band.high)}) or regional prices before charging $10.`, to: '#what-moves', linkLabel: 'What moves success' },
    ],
    confidence: {
      measured: 'Nothing: no real person answered.',
      predicted: 'Every try, pay and price figure: synthetic personas played by one agent.',
      assumed: 'Inputs differ between reports (panel, product, price), so compare shares, not counts.',
    },
  }
}

/* ------------------------------------------------------------ Combination */

export interface StageCell {
  id: StageId
  title: string
  status: 'on-track' | 'below'
  metric: string
  value: number
  target: number
  isGap: boolean
}

/** One cell per funnel stage: its worst metric against target (agent v3 × production v3). */
export function stageStrip(week: number): StageCell[] {
  const metrics = funnelMetrics(3, 3, week)
  const leak = biggestLeak(metrics, {})
  return FUNNEL_STAGES.map((s) => {
    const own = metrics.filter((m) => m.stage === s.id)
    const worst = own.reduce((a, b) => (b.agent / b.target < a.agent / a.target ? b : a))
    return { id: s.id, title: s.title, status: stageStatus(metrics, {}, s.id).status === 'on-track' ? 'on-track' : 'below', metric: worst.label, value: worst.agent, target: worst.target, isGap: s.id === leak }
  })
}

const SHORT: Record<StageId, string> = { entry: 'Entry', aha: 'Aha', cap: 'Cap', upsell: 'Upsell', stay: 'Stay' }
export const stageShort = (id: StageId) => SHORT[id]

/** The next move per stage, from the combination report's readings. */
const STAGE_DECISION: Partial<Record<StageId, string>> = { entry: 'd1', aha: 'd2', upsell: 'd4', stay: 'd7' }

export function combinationSummary(week: number): ReportSummary {
  const strip = stageStrip(week)
  const on = strip.filter((s) => s.status === 'on-track')
  const gap = strip.find((s) => s.isGap)
  const metrics = funnelMetrics(3, 3, week)
  const m = (id: string) => metrics.find((x) => x.id === id)!
  const gapDecision = gap && STAGE_DECISION[gap.id] ? decision(STAGE_DECISION[gap.id]!) : null
  const below = strip.filter((s) => s.status === 'below' && !s.isGap && STAGE_DECISION[s.id]).slice(0, 2)
  return {
    question: 'Where does Aurelia stand, stage by stage, and what do we fix first?',
    headline: gap
      ? `${on.length} of ${strip.length} stages are on track by prediction; the biggest gap is ${gap.title.toLowerCase()} (${gap.metric.toLowerCase()}: ${pct(gap.value)} against ${pct(gap.target)}), so fix that first.`
      : `All ${strip.length} stages are on track by prediction.`,
    status: on.length === strip.length ? 'on-track' : 'at-risk',
    statusNote: `${strip.length - on.length} of ${strip.length} stages below target`,
    tiles: [
      { label: 'Stages on track', value: `${on.length} of ${strip.length}`, badge: 'prediction', note: on.map((s) => stageShort(s.id)).join(', ') || 'none' },
      { label: 'Hears a session, first visit', value: pct(m('activation').agent), badge: 'prediction', delta: `target ${pct(m('activation').target)}`, deltaGood: m('activation').agent >= m('activation').target },
      { label: 'Chooses Plus at the limit', value: pct(m('plus').agent), badge: 'prediction', delta: `target ${pct(m('plus').target)}`, deltaGood: m('plus').agent >= m('plus').target },
      { label: 'Still using after a month', value: pct(m('d30').agent), badge: 'prediction', delta: `target ${pct(m('d30').target)}`, deltaGood: m('d30').agent >= m('d30').target },
    ],
    actions: [
      ...(gap ? [{ text: gapDecision ? gapDecision.change : 'Pick one definition of the free limit, then fix the aha first.', to: gapDecision ? '/admin/business-funnel' : `#stage-${gap.id}`, linkLabel: gapDecision ? `Decision ${gapDecision.id}` : `Stage: ${stageShort(gap.id)}` }] : []),
      ...below.map((s) => ({ text: decision(STAGE_DECISION[s.id]!).change, to: `#stage-${s.id}`, linkLabel: `Stage: ${stageShort(s.id)}` })),
    ],
    confidence: {
      measured: 'Nothing on real use; three interviews say what matters, not how many.',
      predicted: 'Every stage figure: buyer agents (v3 rules) on production v3.',
      assumed: 'Targets are the team’s defaults; the feedback group is sample data.',
    },
  }
}

/* ------------------------------------------------------------------- Cost */

const BALANCED = PRESETS.find((p) => p.id === 'balanced')!

export type CostSourceId = 'suppliers' | 'estimates' | 'measured-2025' | 'spec'

export interface CostTerm {
  id: string
  label: string
  value: string
  source: CostSourceId
  /** Where in that source, in a few words. */
  from: string
  /** A result term (right column) rather than an input (middle). */
  result?: boolean
}

export interface CostFunction {
  terms: CostTerm[]
  chapter: number
  chapters: number
  journey: number
  flip: number
  costPerFlip: number
  revenue: number
  profitPerFlip: number
  measuredPerSessionEur: number
}

const usd = (x: number) => (!isFinite(x) ? '—' : `${x < 0 ? '−' : ''}$${Math.abs(x) < 0.1 && x !== 0 ? Math.abs(x).toFixed(3) : Math.abs(x).toFixed(2)}`)

/** The cost function on the Balanced preset, 10-minute chapters, the spec's 25 → 85 journey at a stage. */
export function costFunction(stage: Stage = 1): CostFunction {
  const inputs = presetInputs(BALANCED, 10)
  const media = chapterCost(inputs)
  const noCache = chapterCost({ ...inputs, cacheHit: 0 })
  const g = goal({ ...DEFAULT_GOAL, stage }, inputs)
  const term = (m: Media): CostTerm => {
    const s = supplier(BALANCED.models[m])
    return { id: m, label: m === 'script' ? 'Script' : m === 'voice' ? 'Voice' : m === 'music' ? 'Music' : 'Image', value: usd(media[m]), source: s.label === 'estimate' ? 'estimates' : 'suppliers', from: `${s.name}, ${s.date.split(' (')[0]}` }
  }
  const saving = total(noCache) - total(media)
  const terms: CostTerm[] = [
    ...(['script', 'voice', 'music', 'image'] as Media[]).map(term),
    { id: 'cache', label: 'Minus cache / reuse', value: `−${usd(saving)}`, source: 'estimates', from: `${pct(BALANCED.cacheHit)} of music and images reused` },
    { id: 'stage', label: 'Stage cost factor', value: `× ${COST_STAGES[stage].costFactor}`, source: 'spec', from: `${COST_STAGES[stage].name}, the spec PDF` },
    { id: 'chapters', label: 'Chapters to flip', value: `${g.chapters}`, source: 'spec', from: `${DEFAULT_GOAL.baseline} → ${DEFAULT_GOAL.target}, uplift ${COST_STAGES[stage].uplift} a chapter` },
    { id: 'flip', label: 'Flip probability', value: pct(g.flipProbability), source: 'spec', from: `stage success ${pct(COST_STAGES[stage].success)}` },
    { id: 'price', label: 'Price', value: usd(g.revenuePerJourney), source: 'spec', from: `${ANCHORS[DEFAULT_GOAL.anchor].label} × P(flip)` },
    { id: 'fees', label: 'Fees', value: '$0 (not modelled)', source: 'estimates', from: 'store, payment and creator fees not counted yet' },
    { id: 'r-chapter', label: 'Chapter cost', value: usd(g.costPerChapter), source: 'estimates', from: 'script + voice + music + image − reuse', result: true },
    { id: 'r-journey', label: 'Journey cost', value: usd(g.costPerJourney), source: 'estimates', from: 'chapters × chapter cost', result: true },
    { id: 'r-flip', label: 'Cost per flip', value: usd(g.costPerFlip), source: 'estimates', from: 'journey ÷ flip probability', result: true },
    { id: 'r-profit', label: 'Profit per flip', value: usd(g.profitPerFlip), source: 'spec', from: 'price − cost per flip − fees, per flip', result: true },
    { id: 'r-2025', label: '2025 measured, per session', value: `€${measuredAverage().toFixed(2)}`, source: 'measured-2025', from: `top ${MEASURED_2025.campaigns.length} old-admin campaigns, incl. video`, result: true },
  ]
  return { terms, chapter: g.costPerChapter, chapters: g.chapters, journey: g.costPerJourney, flip: g.flipProbability, costPerFlip: g.costPerFlip, revenue: g.revenuePerJourney, profitPerFlip: g.profitPerFlip, measuredPerSessionEur: measuredAverage() }
}

export const COST_SOURCES: { id: CostSourceId; title: string; label: SourceLabel; lines: string[] }[] = [
  {
    id: 'suppliers',
    title: 'Supplier price pages',
    label: 'company-price',
    lines: MEDIA.filter((m) => m !== 'video').map((m) => {
      const s = supplier(BALANCED.models[m])
      return `${s.name}: ${s.price} (${s.date.split(' (')[0]})`
    }),
  },
  { id: 'estimates', title: 'Our estimates', label: 'estimate', lines: [`${ASSUME.charsPerWord} characters and ${ASSUME.tokensPerWord} tokens a word; 105 words a minute`, `Reuse: one chapter shared by ${ASSUME.reuseAcross}; cache share per preset`, 'Fees, hosting and CAC not counted'] },
  { id: 'measured-2025', title: '2025 old admin (measured)', label: 'measured', lines: [`€${MEASURED_2025.total.toFixed(2)} vendor cost, Mar 2025 – Apr 2026`, `Voice €${MEASURED_2025.byMedia.voice.toFixed(2)}, video €${MEASURED_2025.byMedia.video.toFixed(2)} of it`] },
  { id: 'spec', title: 'The business owner’s spec (scenario)', label: 'scenario', lines: ['Causal AI stages 1–3: uplift, success, cost factor', `$19.99 per flip; journey ${DEFAULT_GOAL.baseline} → ${DEFAULT_GOAL.target}`] },
]

/** The first stage at which a flip makes money, or null. */
export function breakEvenStage(): Stage | null {
  return ([1, 2, 3] as Stage[]).find((s) => costFunction(s).profitPerFlip >= 0) ?? null
}

export function costSummary(): ReportSummary {
  const s1 = costFunction(1)
  const s3 = costFunction(3)
  const be = breakEvenStage()
  const status: SummaryStatus = s1.profitPerFlip >= 0 ? 'on-track' : 'at-risk'
  return {
    question: 'What does it cost to move someone from bad to good, and when does it pay?',
    headline: `A 10-minute chapter costs about ${usd(s1.chapter)}, so one successful flip costs ${usd(s1.costPerFlip)} today and ${usd(s3.costPerFlip)} once the AI has learned; at ${ANCHORS[DEFAULT_GOAL.anchor].label} ${be ? `it pays from stage ${be}` : 'it never pays'}.`,
    status,
    statusNote: status === 'on-track' ? `Profitable from stage 1 (scenario)` : `Loses money at stage 1 (scenario)`,
    tiles: [
      { label: 'Cost per 10-min chapter (Balanced)', value: usd(s1.chapter), badge: 'estimate', note: `2025 measured: €${s1.measuredPerSessionEur.toFixed(2)} a session` },
      { label: 'Cost per flip, stage 1 → 3', value: `${usd(s1.costPerFlip)} → ${usd(s3.costPerFlip)}`, badge: 'estimate', note: `${s1.chapters} → ${s3.chapters} chapters` },
      { label: 'Profit per flip, stage 1', value: usd(s1.profitPerFlip), badge: 'scenario', delta: `stage 3: ${usd(s3.profitPerFlip)}`, deltaGood: s3.profitPerFlip >= s1.profitPerFlip, note: ANCHORS[DEFAULT_GOAL.anchor].label },
      { label: 'Break-even stage', value: be ? `Stage ${be}` : 'None', badge: 'scenario', note: be ? COST_STAGES[be].sessions : 'at this price' },
    ],
    actions: [
      { text: 'Pick the voice first: it is the largest line of every chapter.', to: '#cost-function', linkLabel: 'Cost function' },
      { text: 'Measure real flips on the first cohort: every uplift and success rate here is the spec’s scenario.', to: '#goal-graph', linkLabel: 'Bad-to-good graph' },
      { text: 'Choose the price anchor (per flip, Plus or retreat) before comparing profit.', to: '#goal-stages', linkLabel: 'Stages' },
    ],
    confidence: {
      measured: `Only the 2025 vendor costs (€${MEASURED_2025.total.toFixed(2)}).`,
      predicted: 'Chapter cost: supplier prices × our word and reuse estimates.',
      assumed: 'Uplift, flip rate and stage cost factor: the spec’s scenario.',
    },
  }
}
