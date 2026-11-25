import { STAGES as FUNNEL_STAGES, biggestLeak, funnelMetrics, stageStatus, type StageId } from './businessFunnel'
import { movedBy, runTallies } from './buyerAgentReport'
import { BUYER_RUNS } from './buyerRuns'
import { V3_CHANGES } from './buyerRunV3'
import { v5Tallies } from './buyerRunV5'
import { V6_CHANGES, v6Tallies } from './buyerRunV6'
import { v7Tallies } from './buyerRunV7'
import { report } from './buyerSim'
import { evaluateCriteria, weekTasks, winStatus, type Participant } from './study'
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
  /** A decision-log id: the drawer shows that decision (U129). */
  decision?: string
}

export interface Confidence {
  measured: string
  predicted: string
  assumed: string
}

/** One clearly based row of figures: which test, how many people (U129). */
export interface SummaryRow {
  label: string
  base: string
  figures: { label: string; value: string }[]
}

export interface ReportSummary {
  /** The decision this report helps make, and for whom, in one sentence (U129). Shown above the answer as "Goal". */
  goal: string
  /** Where the full detail lives, for the drawer's "Open full page" (U129). */
  detail: { to: string; label: string }
  /** Separate rows when the figures come from different tests (U129). */
  rows?: SummaryRow[]
  /**
   * "What is this report?" in one everyday line (U128). Text fields of a
   * summary may carry `{{termId|shown}}` glossary marks; see data/glossary.ts.
   */
  intro?: string
  question: string
  headline: string
  status: SummaryStatus
  statusNote: string
  tiles: Tile[]
  actions: NextAction[]
  confidence: Confidence
  /** "How sure are we", in one plain sentence (U128). */
  sure?: string
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const share = (k: number, n: number) => (n ? k / n : 0)
const pts = (a: number, b: number) => {
  const d = Math.round((b - a) * 100)
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} pts`
}
const money = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`

/* ------------------------------------------------------------ Buyer agents */

export interface TrendPoint {
  id: string
  name: string
  /** The name a reader sees: "Test 1" rather than "v1" (U128). */
  label: string
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
    { id: 'it-v1', name: 'v1', label: 'Test 1', n: t1.n, tries: share(t1.tries.yes, t1.n), pays: share(t1.pays.yes, t1.n), sure30: share(t1.sureDay30, t1.n), change: 'First try: 10 people. The AI was too eager to say yes.' },
    { id: 'it-v2', name: 'v2', label: 'Test 2', n: t2.n, tries: share(t2.tries.yes, t2.n), pays: share(t2.pays.yes, t2.n), sure30: share(t2.sureDay30, t2.n), change: 'A stricter AI, 36 people, prices in local money.' },
    { id: 'it-v3', name: 'v3', label: 'Test 3', n: t3.n, tries: share(t3.tries.yes, t3.n), pays: share(t3.pays.yes, t3.n), sure30: share(t3.sureDay30, t3.n), change: 'An idea not yet built: no account, more languages.' },
    { id: 'it-rerun', name: 'v4', label: 'Test 4', n: best.walks.length, tries: null, pays: null, sure30: best.d30, change: 'The AI used the real app screens. Asked only: back after a month?' },
    { id: 'it-v5', name: 'v5', label: 'Test 5', n: x5.t.n, tries: share(x5.t.tries.yes, x5.t.n), pays: share(x5.t.pays.yes, x5.t.n), sure30: share(x5.day30, x5.t.n), change: 'Today’s app at today’s $10 a month.' },
    { id: 'it-v6', name: 'v6', label: 'Test 6', n: x6.A.n, tries: share(x6.A.tries.yes, x6.A.n), pays: share(x6.A.pays.yes, x6.A.n), sure30: null, change: '60 people. A free basic app beat a paid retreat.' },
    { id: 'it-v7', name: 'v7', label: 'Test 7', n: x7.B.n, tries: share(x7.B.tries.yes, x7.B.n), pays: share(x7.B.pays.yes, x7.B.n), sure30: share(x7.day30B, x7.B.n), change: '100 people. Added a free library of sessions.' },
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
    { theme: 'No account needed', change: V3_CHANGES['no-account'].label, report: 'v3', moved: m3.get('no-account') ?? 0, n: n3 },
    { theme: 'Own language', change: V3_CHANGES.language.label, report: 'v3', moved: m3.get('language') ?? 0, n: n3 },
    { theme: 'Clear data promise', change: V3_CHANGES['data-line'].label, report: 'v3', moved: m3.get('data-line') ?? 0, n: n3 },
    { theme: 'Local prices', change: V3_CHANGES['local-price'].label, report: 'v3', moved: m3.get('local-price') ?? 0, n: n3 },
    { theme: 'Free library', change: V6_CHANGES['free-library']?.label ?? 'Free core library', report: 'v7', moved: m7.get('free-library') ?? 0, n: x7.B.n },
    { theme: 'Coach’s own voice', change: V6_CHANGES['creator-voice']?.label ?? 'Creator voice', report: 'v6', moved: m6.get('creator-voice') ?? 0, n: x6.A.n },
  ]
  return rows.map((r) => ({ ...r, share: share(r.moved, r.n) })).sort((a, b) => b.share - a.share)
}

/** The main reasons not to try, in everyday words. */
const OBJECTION: Record<string, string> = {
  access: 'the app is only in English, or hard to set up',
  price: 'the price',
  trust: 'what happens to their data',
}

/** The tested changes, in everyday words (the run's own labels stay in Details). */
const LIFT_PLAIN: Record<string, string> = {
  'free-library': 'free library of ready-made sessions',
  'creator-voice': '8-week programme in a coach’s own voice',
}

/** Plain next moves, keyed by the decision log's ids (the ids stay in the log). */
const PLAIN_MOVE: Record<string, string> = {
  d1: 'Let people start their first session without making an account.',
  d2: 'Ask about a sleep tracker only after the first session.',
  d3: 'Offer sessions in Spanish, Portuguese and Indonesian first.',
  d4: 'When the free sessions run out, show the person their own progress, then the price.',
  d7: 'After each session, let people pick the time of the next one and set a reminder.',
}

export function buyerSummary(): ReportSummary {
  const x5 = v5Tallies()
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  const n = x5.t.n
  const tryShare = share(x5.t.tries.yes, n)
  const payShare = share(x5.t.pays.yes, n)
  const v3ATry = share(x5.v3A.tries.yes, x5.v3A.n)
  const v3APay = share(x5.v3A.pays.yes, x5.v3A.n)
  const tryA7 = share(x7.A.tries.yes, x7.A.n)
  const tryB7 = share(x7.B.tries.yes, x7.B.n)
  const lift = x7.moved[0]
  const liftLabel = lift ? (LIFT_PLAIN[lift[0]] ?? (V6_CHANGES[lift[0]]?.label ?? lift[0]).replace(/^A /, '').split(',')[0].toLowerCase()) : 'change'
  const objection = OBJECTION[x5.themes[0]?.[0] ?? ''] ?? x5.themes[0]?.[0] ?? 'none given'
  const lever = buyerLevers()[0]
  const fair = `${money(x5.band.low)}–${money(x5.band.high)}`
  const status: SummaryStatus = payShare >= 0.15 && x5.band.high >= 10 ? 'on-track' : 'at-risk'
  const points = (a: number, b: number) => `${pts(a, b).replace(' pts', '')} {{points}}`
  const people = (k: number) => `${k} {{simulated|simulated people}}`
  return {
    intro: 'We asked made-up people, played by AI, whether they would use and pay for Aurelia. They are not real users.',
    goal: 'Helps the business owner decide whether people would pay for Aurelia, and at what price, before real users arrive.',
    detail: { to: '/admin/buyer-agent', label: 'Every answer, in detail' },
    question: 'Would people try Aurelia, and would they pay for it?',
    headline: `In today’s app ({{test}} 5), ${x5.t.tries.yes} of ${n} {{simulated|simulated people}} would try Aurelia. Only ${x5.t.pays.yes} would pay $10 a month. Most called ${fair} a month {{fair-price|a fair price}}. In the latest {{test}} (7, ${x7.B.n} people), a ${liftLabel} raised trying from ${pct(tryA7)} to ${pct(tryB7)}.`,
    status,
    statusNote: status === 'at-risk' ? 'Too few would pay, and $10 is above the fair price.' : 'Enough would pay, at a price they call fair.',
    sure: 'Nothing here is measured on real users yet. Every figure is an AI simulation.',
    rows: [
      {
        label: `Today’s app ({{test}} 5, ${n} people)`,
        base: people(n),
        figures: [
          { label: 'Would try', value: pct(tryShare) },
          { label: 'Would pay $10 a month', value: pct(payShare) },
          { label: 'Fair price, per month', value: fair },
        ],
      },
      {
        label: `Retreat vs free plan ({{test}} 6, ${x6.A.n} people)`,
        base: people(x6.A.n),
        figures: [
          { label: 'Would try the free plan', value: pct(share(x6.A.tries.yes, x6.A.n)) },
          { label: 'Would try the €19.99 retreat', value: pct(share(x6.B.tries.yes, x6.B.n)) },
          { label: 'Would buy the retreat', value: pct(share(x6.B.pays.yes, x6.B.n)) },
        ],
      },
      {
        label: `Latest {{test}} ({{test}} 7, ${x7.B.n} people)`,
        base: people(x7.B.n),
        figures: [
          { label: 'Would try, without → with a free library', value: `${pct(tryA7)} → ${pct(tryB7)}` },
          { label: 'Would pay, with the free library', value: pct(share(x7.B.pays.yes, x7.B.n)) },
          { label: 'Back after a month', value: pct(share(x7.day30B, x7.B.n)) },
        ],
      },
    ],
    tiles: [
      { label: 'Would try Aurelia today', value: pct(tryShare), badge: 'prediction', delta: `${points(v3ATry, tryShare)} vs. the offer in {{test}} 3`, deltaGood: tryShare >= v3ATry, note: `{{test|Test}} 5: ${x5.t.tries.yes} of ${n} {{simulated|simulated people}}` },
      { label: 'Would pay $10 a month', value: pct(payShare), badge: 'prediction', delta: `${points(v3APay, payShare)} vs. the offer in {{test}} 3`, deltaGood: payShare >= v3APay, note: `{{test|Test}} 5: ${x5.t.pays.yes} of ${n} {{simulated|simulated people}}. Main worry: ${objection}.` },
      { label: 'Price they call fair, per month', value: fair, badge: 'prediction', note: '{{test|Test}} 5. Our planned $10 a month is above this range.' },
      { label: 'Would try, if we add a free library', value: `${pct(tryA7)} → ${pct(tryB7)}`, badge: 'prediction', delta: `${points(tryA7, tryB7)}`, deltaGood: tryB7 >= tryA7, note: `{{test|Test}} 7: ${x7.B.n} {{simulated|simulated people}}, without → with the ${liftLabel}.` },
    ],
    actions: [
      { text: `${PLAIN_MOVE.d1} It changed ${lever.moved} of ${lever.n} answers.`, to: '/admin/business-funnel', linkLabel: 'See the decision', decision: 'd1' },
      { text: PLAIN_MOVE.d3, to: '/admin/business-funnel', linkLabel: 'See the decision', decision: 'd3' },
      { text: `Try a price between ${fair} a month, or prices per country, before charging $10.`, to: '#what-moves', linkLabel: 'What changes answers' },
    ],
    confidence: {
      measured: 'Nothing. No real person has answered yet.',
      predicted: 'Every try, pay and price figure. AI played each made-up person.',
      assumed: 'The people, product and price changed between tests. Compare percentages, not head counts.',
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

/** Each funnel metric as what a person does, in everyday words (U128); the funnel's own labels stay in Details. */
const METRIC_PLAIN: Record<string, string> = {
  activation: 'Listen to a session on the first visit',
  completion: 'Finish their own first session',
  felt: 'Feel better after a session',
  cap: 'Use up the free sessions in week one',
  plus: 'Start paying when the free sessions run out',
  d7: 'Come back after a week',
  d30: 'Still using after a month',
  ellis: 'Would be very disappointed without it',
}

/** One cell per funnel stage: its worst metric against target (agent v3 × production v3). */
export function stageStrip(week: number): StageCell[] {
  const metrics = funnelMetrics(3, 3, week)
  const leak = biggestLeak(metrics, {})
  return FUNNEL_STAGES.map((s) => {
    const own = metrics.filter((m) => m.stage === s.id)
    const worst = own.reduce((a, b) => (b.agent / b.target < a.agent / a.target ? b : a))
    return { id: s.id, title: s.title, status: stageStatus(metrics, {}, s.id).status === 'on-track' ? 'on-track' : 'below', metric: METRIC_PLAIN[worst.id] ?? worst.label, value: worst.agent, target: worst.target, isGap: s.id === leak }
  })
}

/** Each funnel stage as the step a person takes, in everyday words (U128). */
const SHORT: Record<StageId, string> = { entry: 'Arrives', aha: 'Enjoys a first session', cap: 'Uses up the free sessions', upsell: 'Starts paying', stay: 'Keeps using' }
export const stageShort = (id: StageId) => SHORT[id]

/** The next move per stage, from the combination report's readings. */
const STAGE_DECISION: Partial<Record<StageId, string>> = { entry: 'd1', aha: 'd2', upsell: 'd4', stay: 'd7' }

export function combinationSummary(week: number): ReportSummary {
  const strip = stageStrip(week)
  const on = strip.filter((s) => s.status === 'on-track')
  const gap = strip.find((s) => s.isGap)
  const metrics = funnelMetrics(3, 3, week)
  const m = (id: string) => metrics.find((x) => x.id === id)!
  const gapDecision = gap && STAGE_DECISION[gap.id] ? STAGE_DECISION[gap.id]! : null
  const below = strip.filter((s) => s.status === 'below' && !s.isGap && STAGE_DECISION[s.id]).slice(0, 2)
  const vsTarget = (id: string) => {
    const x = m(id)
    return `{{target|Target}} ${pct(x.target)}: ${x.agent >= x.target ? 'reached' : 'not reached'}`
  }
  return {
    intro: 'We follow made-up people, played by AI, through five steps of using Aurelia. We compare each step with our goal.',
    goal: 'Helps the team decide which step of the customer journey to fix first, by joining every source we have.',
    detail: { to: '/admin/business-funnel', label: 'The business funnel and its decision log' },
    question: 'At which step do we lose people, and what do we fix first?',
    headline: gap
      ? `${on.length} of ${strip.length} steps of the {{journey|customer journey}} reach their {{target}}. The weakest step is “${stageShort(gap.id).toLowerCase()}”: ${pct(gap.value)} ${gap.metric.toLowerCase()}, against a goal of ${pct(gap.target)}. Fix that first.`
      : `All ${strip.length} steps of the {{journey|customer journey}} reach their {{target}}.`,
    status: on.length === strip.length ? 'on-track' : 'at-risk',
    statusNote: `${strip.length - on.length} of ${strip.length} steps miss their goal`,
    sure: 'Nothing here is measured on real users yet. Three real interviews tell us what matters, not how many.',
    tiles: [
      { label: 'Steps that reach their goal', value: `${on.length} of ${strip.length}`, badge: 'prediction', note: on.length ? `Reached: ${on.map((s) => stageShort(s.id)).join(', ')}` : 'None reached' },
      { label: 'Listen to a session on their first visit', value: pct(m('activation').agent), badge: 'prediction', delta: vsTarget('activation'), deltaGood: m('activation').agent >= m('activation').target, note: 'Of all {{simulated|simulated people}} who arrive' },
      { label: 'Start paying when the free sessions run out', value: pct(m('plus').agent), badge: 'prediction', delta: vsTarget('plus'), deltaGood: m('plus').agent >= m('plus').target, note: 'Of those who reach the {{free-limit|free limit}}' },
      { label: 'Still using Aurelia after a month', value: pct(m('d30').agent), badge: 'prediction', delta: vsTarget('d30'), deltaGood: m('d30').agent >= m('d30').target, note: 'Of all {{simulated|simulated people}} who arrive' },
    ],
    actions: [
      ...(gap ? [{ text: gapDecision ? PLAIN_MOVE[gapDecision] : 'Agree what the free limit is, then make the first session feel good.', to: gapDecision ? '/admin/business-funnel' : `#stage-${gap.id}`, linkLabel: gapDecision ? 'See the decision' : `Step: ${stageShort(gap.id)}`, ...(gapDecision ? { decision: gapDecision } : {}) }] : []),
      ...below.map((s) => ({ text: PLAIN_MOVE[STAGE_DECISION[s.id]!], to: `#stage-${s.id}`, linkLabel: `Step: ${stageShort(s.id)}` })),
    ],
    confidence: {
      measured: 'Nothing on real use. Three real interviews say what matters, not how many.',
      predicted: 'Every step figure. AI played made-up people on today’s app.',
      assumed: 'The goals are the team’s own. The test-group figures are invented examples.',
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
    return { id: m, label: m === 'script' ? 'Script (written by AI)' : m === 'voice' ? 'Voice' : m === 'music' ? 'Music' : 'Picture', value: usd(media[m]), source: s.label === 'estimate' ? 'estimates' : 'suppliers', from: `${s.name}, ${s.date.split(' (')[0]}` }
  }
  const saving = total(noCache) - total(media)
  const terms: CostTerm[] = [
    ...(['script', 'voice', 'music', 'image'] as Media[]).map(term),
    { id: 'cache', label: 'Minus reused music and pictures', value: `−${usd(saving)}`, source: 'estimates', from: `${pct(BALANCED.cacheHit)} of music and pictures made once, used again` },
    { id: 'stage', label: 'Discount as the AI learns', value: `× ${COST_STAGES[stage].costFactor}`, source: 'spec', from: `Learning stage ${stage}, from the business owner’s plan` },
    { id: 'chapters', label: 'Sessions until sleep is good', value: `${g.chapters}`, source: 'spec', from: `Sleep score ${DEFAULT_GOAL.baseline} → ${DEFAULT_GOAL.target} of 100, +${COST_STAGES[stage].uplift} a session` },
    { id: 'flip', label: 'Chance it works', value: pct(g.flipProbability), source: 'spec', from: `${pct(COST_STAGES[stage].success)} success at this learning stage` },
    { id: 'price', label: 'Price', value: usd(g.revenuePerJourney), source: 'spec', from: `${ANCHORS[DEFAULT_GOAL.anchor].label.replace('per flip (spec)', 'per person helped')} × chance it works` },
    { id: 'fees', label: 'Fees', value: '$0 (not modelled)', source: 'estimates', from: 'App store, payment and coach fees not counted yet' },
    { id: 'r-chapter', label: 'Cost per session', value: usd(g.costPerChapter), source: 'estimates', from: 'Script + voice + music + picture − reuse', result: true },
    { id: 'r-journey', label: 'Cost of all sessions, one person', value: usd(g.costPerJourney), source: 'estimates', from: 'Sessions × cost per session', result: true },
    { id: 'r-flip', label: 'Cost per person helped', value: usd(g.costPerFlip), source: 'estimates', from: 'All sessions ÷ chance it works', result: true },
    { id: 'r-profit', label: 'Profit per person helped', value: usd(g.profitPerFlip), source: 'spec', from: 'Price − cost − fees, per person helped', result: true },
    { id: 'r-2025', label: 'Last year’s real bills, per session', value: `€${measuredAverage().toFixed(2)}`, source: 'measured-2025', from: `The ${MEASURED_2025.campaigns.length} biggest batches in the old system, video included`, result: true },
  ]
  return { terms, chapter: g.costPerChapter, chapters: g.chapters, journey: g.costPerJourney, flip: g.flipProbability, costPerFlip: g.costPerFlip, revenue: g.revenuePerJourney, profitPerFlip: g.profitPerFlip, measuredPerSessionEur: measuredAverage() }
}

export const COST_SOURCES: { id: CostSourceId; title: string; label: SourceLabel; lines: string[] }[] = [
  {
    id: 'suppliers',
    title: 'Suppliers’ own price pages',
    label: 'company-price',
    lines: MEDIA.filter((m) => m !== 'video').map((m) => {
      const s = supplier(BALANCED.models[m])
      return `${s.name}: ${s.price} (${s.date.split(' (')[0]})`
    }),
  },
  { id: 'estimates', title: 'Our estimates', label: 'estimate', lines: [`${ASSUME.charsPerWord} characters and ${ASSUME.tokensPerWord} AI text units a word; 105 words a minute`, `Reuse: one session shared by ${ASSUME.reuseAcross} people; some music and pictures made once`, 'Fees, hosting and advertising not counted'] },
  { id: 'measured-2025', title: 'Last year’s real bills (measured)', label: 'measured', lines: [`€${MEASURED_2025.total.toFixed(2)} paid to suppliers, Mar 2025 – Apr 2026`, `Of it: voice €${MEASURED_2025.byMedia.voice.toFixed(2)}, video €${MEASURED_2025.byMedia.video.toFixed(2)}`] },
  { id: 'spec', title: 'The business owner’s plan (assumptions)', label: 'scenario', lines: ['Learning stages 1–3: how fast sleep improves, how often it works, the cost discount', `$19.99 per person helped; sleep score ${DEFAULT_GOAL.baseline} → ${DEFAULT_GOAL.target} of 100`] },
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
  const price = usd(s1.revenue / s1.flip)
  const pays = be === 1 ? 'We make money from the start.' : be ? `We lose money today and make money from {{learning-stage|learning stage}} ${be}.` : 'We never make money at this price.'
  return {
    intro: 'What the AI suppliers charge us to make Aurelia’s audio sessions. And whether helping one person sleep well earns more than it costs.',
    goal: 'Helps the business owner choose AI suppliers and a price, by showing what helping one person sleep well costs.',
    detail: { to: '#cost-function', label: 'How the cost adds up' },
    question: 'What does it cost to help one person sleep well, and when do we make money?',
    headline: `One 10-minute {{chapter|audio session}} costs us about ${usd(s1.chapter)} to make. Helping one person sleep well costs ${usd(s1.costPerFlip)} today. It falls to ${usd(s3.costPerFlip)} once the AI has learned. At ${price} per {{person-helped|person helped}}, ${pays.charAt(0).toLowerCase()}${pays.slice(1)}`,
    status,
    statusNote: status === 'on-track' ? 'Makes money from the start (business owner’s assumptions)' : 'Loses money today (business owner’s assumptions)',
    sure: 'Only last year’s supplier bills are measured. Everything else is an estimate or an assumption.',
    tiles: [
      { label: 'Cost to make one 10-minute session', value: usd(s1.chapter), badge: 'estimate', note: `With the {{preset|middle option}} of AI suppliers. Last year’s real bills: €${s1.measuredPerSessionEur.toFixed(2)} a session.` },
      { label: 'Cost to help one person sleep well', value: `${usd(s1.costPerFlip)} → ${usd(s3.costPerFlip)}`, badge: 'estimate', note: `Today → once the AI has learned. ${s1.chapters} → ${s3.chapters} sessions per person.` },
      { label: 'Profit per person helped, today', value: usd(s1.profitPerFlip), badge: 'scenario', delta: `Once the AI has learned: ${usd(s3.profitPerFlip)}`, deltaGood: s3.profitPerFlip >= s1.profitPerFlip, note: `If each {{person-helped|person helped}} pays ${price}.` },
      { label: 'When we start making money', value: be ? `{{learning-stage|Stage}} ${be} of 3` : 'Never', badge: 'scenario', note: be ? `{{learning-stage|Learning stage}} ${be}: after ${COST_STAGES[be].sessions.replace(/ sessions$/, '')} sessions` : 'Not at this price' },
    ],
    actions: [
      { text: 'Choose the voice supplier first. The voice is the biggest cost in every session.', to: '#cost-function', linkLabel: 'How the cost adds up' },
      { text: 'Measure how many real people sleep better. Today every success rate here is assumed.', to: '#goal-graph', linkLabel: 'Bad-to-good sleep graph' },
      { text: 'Decide how people pay: per result, monthly, or a retreat ticket. Then compare profit.', to: '#goal-stages', linkLabel: 'The three learning stages' },
    ],
    confidence: {
      measured: `Only last year’s supplier bills (€${MEASURED_2025.total.toFixed(2)} in total).`,
      predicted: 'The session cost: suppliers’ prices times our guesses about length and reuse.',
      assumed: 'How fast sleep improves and how often it works: the business owner’s plan.',
    },
  }
}

/* ------------------------------------------------------------ UX feedback */

/** How the feedback group is doing, for the UX feedback report (U129). Sample data until the study runs. */
export function uxFeedbackSummary(participants: Participant[], week: number): ReportSummary {
  const statuses = participants.map(winStatus)
  const count = (st: ReturnType<typeof winStatus>) => statuses.filter((x) => x === st).length
  const judged = statuses.filter((st) => st !== 'too early' && st !== 'started healthy').length
  const won = count('won')
  const improving = count('improving')
  const criteria = evaluateCriteria(participants, week)
  const c = (id: string) => criteria.find((x) => x.id === id)!
  const retention = c('retention')
  const adherence = c('adherence')
  const tasks = weekTasks(participants, week).length
  return {
    intro: 'How the people in the {{feedback-group|feedback group}} are doing with Aurelia, week by week. Every figure is {{sample|sample data}} for now.',
    goal: 'Helps the product team decide what to change in the app, from how real people feel while using it.',
    detail: { to: '/admin/experimentation', label: 'The study plan and every person' },
    question: 'Does Aurelia help the people who use it, and do they keep using it?',
    headline: `${won} of ${judged} people with a later score reached the healthy range. ${improving} more are getting better. All of it is {{sample|sample data}} until the real study runs.`,
    status: 'not-measured',
    statusNote: 'Sample data. The real study has not started.',
    sure: 'Nothing here is real yet. Every person and score is made up to look real.',
    tiles: [
      { label: 'Reached the healthy range', value: `${won} of ${judged}`, badge: 'sample', note: 'People with a score after their first one' },
      { label: 'Getting better, not there yet', value: `${improving}`, badge: 'sample', note: 'A change that matters, still below healthy' },
      { label: 'Still in the study', value: retention.display, badge: 'sample', note: `Goal: 70% or more. ${retention.note}.` },
      { label: 'Use it three times a week or more', value: adherence.display, badge: 'sample', note: 'Goal: 60% or more' },
    ],
    actions: [
      { text: 'Recruit 30 real people and run the study with real accounts, so these numbers become real.', to: '/admin/experimentation', linkLabel: 'The study plan' },
      { text: `Do the ${tasks} follow-ups due in week ${week}: calls first, then missed check-ins.`, to: '#ux-views', linkLabel: 'This week' },
      { text: 'Check whether people who use it more also feel better. It hints, it does not prove.', to: '#ux-views', linkLabel: 'How much they use it' },
    ],
    confidence: {
      measured: 'Nothing. No real person has joined the study yet.',
      predicted: 'None. These are not AI answers either.',
      assumed: 'All 30 people, their scores and their sessions are invented to look real.',
    },
  }
}
