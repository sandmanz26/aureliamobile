import { akpSummary, akps } from './akps'
import { funnelMetrics, type FunnelMetric } from './businessFunnel'
import { V8_OBJECTION_LABEL, v8Change, v8Findings, v8Tallies } from './buyerRunV8'
import { ALL_RUN_DECLARATIONS } from './runChanges'
import { STAGES } from './costModel'
import { sleepCohort } from './stateFlipFormulas'
import { stateFlipSummary } from './stateFlips'
import type { DataSourceType } from './dataSources'

/*
 * Admin → AI brain (U147, J206): the business owner's five functions
 * (Wellness, Product, Business, Brand, Analysis) as one model. Each function
 * has core metrics with an MVP target, a current value with its source type,
 * and a transparent prediction "chance to reach the MVP target":
 *
 *   stage chance p = min(1, current ÷ target)      (higher is better)
 *                  = min(1, target ÷ current)      (lower is better, e.g. cost)
 *   function chance P = Π p over the function's metrics
 *   MVP chance = P(wellness) × P(product) × P(business)
 *
 * p is not a measured probability: it reads "how close the prediction is to
 * the target" as the chance that stage meets it. Crude on purpose, so that
 * every step can be checked by hand. Every value is simulated or assumed
 * until real users exist; the page says which.
 *
 * Feature ranking: each candidate feature lifts named metrics by an assumed
 * amount. impact = the rise in the function chances when that lift is
 * applied; score = impact × confidence ÷ effort (S 1, M 2, L 4).
 */

export type FunctionId = 'wellness' | 'product' | 'business' | 'brand' | 'analysis'
export const FUNCTION_LABEL: Record<FunctionId, string> = { wellness: 'Wellness', product: 'Product', business: 'Business', brand: 'Brand', analysis: 'Analysis' }

export interface BrainMetric {
  id: string
  fn: FunctionId
  label: string
  target: number
  current: number
  unit: 'share' | 'usd' | 'count'
  better: 'up' | 'down'
  source: DataSourceType
  sourceNote: string
}

export const stageChance = (m: Pick<BrainMetric, 'target' | 'current' | 'better'>) =>
  m.better === 'up' ? Math.min(1, m.target > 0 ? m.current / m.target : 1) : Math.min(1, m.current > 0 ? m.target / m.current : 1)

/** The funnel's metrics with the default buyer agent and design (as the Business funnel page opens). */
function funnel(): FunnelMetric[] {
  return funnelMetrics(3, 3, 1)
}

const FUNNEL_FN: Record<string, FunctionId> = { activation: 'product', completion: 'product', felt: 'product', cap: 'business', plus: 'business', d7: 'business', d30: 'business', ellis: 'business' }

export function brainMetrics(): BrainMetric[] {
  const c = sleepCohort()
  const sf = stateFlipSummary()
  const ak = akpSummary()
  const x = v8Tallies()
  const out: BrainMetric[] = [
    { id: 'w-chance', fn: 'wellness', label: 'Chance a person reaches their StateFlip (sleep group)', target: 0.54, current: c.meanChance, unit: 'share', better: 'up', source: 'simulated', sourceNote: 'StateFlips formulas on persona set v4; target = the spec’s stage 1 success (54%)' },
    { id: 'w-cover', fn: 'wellness', label: 'StateFlips with at least one strategy AKP', target: 1, current: ak.flips ? ak.flipsCovered / ak.flips : 0, unit: 'share', better: 'up', source: 'assumed', sourceNote: `akps.ts: ${ak.flipsCovered} of ${sf.total} StateFlips; target: every StateFlip can be built` },
    { id: 'w-cost', fn: 'wellness', label: 'Cost per flip (sleep, stage 1)', target: STAGES[1].specCostPerFlip, current: c.costPerFlip, unit: 'usd', better: 'down', source: 'assumed', sourceNote: `Cost model; target = the spec’s stage 1 cost per flip ($${STAGES[1].specCostPerFlip}); his $1 floor is a later-stage thesis` },
  ]
  for (const m of funnel()) out.push({ id: `f-${m.id}`, fn: FUNNEL_FN[m.id], label: m.label, target: m.target, current: m.agent, unit: 'share', better: 'up', source: 'simulated', sourceNote: 'Business funnel: buyer agent prediction against the funnel target' })
  out.push({ id: 'b-paid', fn: 'business', label: 'Would pay after the free week (test 8, StateFlip journey)', target: 0.15, current: x.payB.yes / x.n, unit: 'share', better: 'up', source: 'simulated', sourceNote: `Buyer agent test 8: ${x.payB.yes} of ${x.n}; target = the funnel’s “chooses Plus” 15%` })
  return out
}

export const CORE_FNS: FunctionId[] = ['wellness', 'product', 'business']

export function functionChance(metrics: BrainMetric[], fn: FunctionId): number {
  return metrics.filter((m) => m.fn === fn).reduce((p, m) => p * stageChance(m), 1)
}

export const mvpChance = (metrics: BrainMetric[]) => CORE_FNS.reduce((p, f) => p * functionChance(metrics, f), 1)

/* ---------------------------------------------------------- Feature ranking */

export type Effort = 'S' | 'M' | 'L'
export const EFFORT_COST: Record<Effort, number> = { S: 1, M: 2, L: 4 }

export interface Feature {
  id: string
  name: string
  from: string
  /** Assumed lift of named metrics, in the metric's unit (share points as 0.05). */
  lifts: { metric: string; by: number }[]
  confidence: number
  effort: Effort
  evidence: string
}

/** Stated intent from synthetic buyers is discounted to a real-world lift by this factor (assumption). */
export const STATED_TO_REAL = 0.2

export function candidateFeatures(): Feature[] {
  const x = v8Tallies()
  const v8lift = Math.round(((x.payB.yes - x.payA.yes) / x.n) * STATED_TO_REAL * 100) / 100
  return [
    { id: 'sf-journey', name: 'A journey named after their StateFlip, free first week, then $10/month', from: 'Buyer agent test 8 (B)', lifts: [{ metric: 'f-plus', by: v8lift }, { metric: 'b-paid', by: v8lift }], confidence: 0.4, effort: 'M', evidence: `Test 8: would pay ${x.payA.yes} → ${x.payB.yes} of ${x.n}, × ${STATED_TO_REAL} for stated → real = +${Math.round(v8lift * 100)} pts.` },
    { id: 'free-week', name: 'A free first week of every journey, no card', from: 'B2B2C features, top 1', lifts: [{ metric: 'f-activation', by: 0.05 }, { metric: 'f-plus', by: 0.03 }], confidence: 0.5, effort: 'M', evidence: 'Test 6: free app 17.5 expected paid plans against 1 for a ticket; longer trials convert better (RevenueCat 2026).' },
    { id: 'creator-voice', name: 'The creator’s page with a 60-second sample in their own voice', from: 'B2B2C features, top 2', lifts: [{ metric: 'f-activation', by: 0.06 }], confidence: 0.4, effort: 'M', evidence: 'Test 6: trust was the top objection; the creator’s voice moved 5 answers.' },
    { id: 'refund', name: 'Full refund until week 4, said before paying', from: 'B2B2C features, top 3', lifts: [{ metric: 'f-plus', by: 0.02 }], confidence: 0.3, effort: 'S', evidence: 'Maven’s guarantee badge; lowers the risk of paying.' },
    { id: 'progress-upgrade', name: 'Upgrade offer that names their own progress', from: 'Business funnel decision d4', lifts: [{ metric: 'f-plus', by: 0.03 }], confidence: 0.4, effort: 'S', evidence: 'The one funnel decision not built; test 8 shows a visible chance moves payers.' },
    { id: 'persist', name: 'Sign-in that persists for pilot accounts', from: 'Product opportunities 1.13', lifts: [{ metric: 'f-d7', by: 0.05 }, { metric: 'f-d30', by: 0.02 }], confidence: 0.6, effort: 'M', evidence: 'Without it nobody can come back as themselves; day-7 and day-30 cannot be measured.' },
    { id: 'checkin-once', name: 'One check-in a day at most, never a streak', from: 'Insight Timer quick wins (test 7)', lifts: [{ metric: 'f-d7', by: 0.02 }], confidence: 0.4, effort: 'S', evidence: 'Tests 6 and 7: daily pressure was a deal breaker for many followers.' },
    { id: 'data-line', name: 'One plain line on what we keep and who sees it', from: 'B2B2C features', lifts: [{ metric: 'f-activation', by: 0.02 }], confidence: 0.4, effort: 'S', evidence: 'Test 7: 8 of 17 very protective people would try; data was still their first question.' },
    { id: 'bahasa', name: 'Bahasa Indonesia and a rupiah price', from: 'B2B2C features', lifts: [{ metric: 'f-activation', by: 0.03 }], confidence: 0.3, effort: 'L', evidence: `Test 8: “${V8_OBJECTION_LABEL.language}” was the objection of ${x.objectionsB.find(([k]) => k === 'language')?.[1] ?? 0} people.` },
    { id: 'adaptive', name: 'Chapters that adapt to the milestone reached (X → Y → Z)', from: 'StateFlips, journey items', lifts: [{ metric: 'w-chance', by: 0.05 }, { metric: 'f-felt', by: 0.04 }], confidence: 0.3, effort: 'L', evidence: 'StateFlips: the chance rises with fit and adherence; an assumption until chapters exist.' },
    { id: 'calendar', name: 'Next-chapter reminder in the calendar', from: 'User journey (v4 journey)', lifts: [{ metric: 'f-d7', by: 0.02 }], confidence: 0.3, effort: 'S', evidence: 'The app already makes .ics reminders; forgetting is a top reason to stop.' },
    { id: 'need-help', name: '“Need help now?” on every feelings screen', from: 'B2B2C features (safety floor)', lifts: [], confidence: 1, effort: 'M', evidence: 'Moves no target, required regardless: crisis handling is a legal floor in some markets.' },
  ]
}

export function applyLifts(metrics: BrainMetric[], features: Feature[]): BrainMetric[] {
  return metrics.map((m) => {
    const by = features.flatMap((f) => f.lifts).filter((l) => l.metric === m.id).reduce((s, l) => s + l.by, 0)
    if (!by) return m
    const current = m.better === 'up' ? (m.unit === 'share' ? Math.min(1, m.current + by) : m.current + by) : Math.max(0, m.current - by)
    return { ...m, current }
  })
}

export interface RankedFeature extends Feature {
  impact: Record<FunctionId, number>
  impactTotal: number
  score: number
}

export function rankFeatures(): RankedFeature[] {
  const base = brainMetrics()
  return candidateFeatures()
    .map((f) => {
      const after = applyLifts(base, [f])
      const impact = Object.fromEntries((Object.keys(FUNCTION_LABEL) as FunctionId[]).map((fn) => [fn, CORE_FNS.includes(fn) ? functionChance(after, fn) - functionChance(base, fn) : 0])) as Record<FunctionId, number>
      const impactTotal = CORE_FNS.reduce((s, fn) => s + impact[fn], 0)
      return { ...f, impact, impactTotal, score: (impactTotal * f.confidence) / EFFORT_COST[f.effort] }
    })
    .sort((a, b) => b.score - a.score)
}

export function topThreeEffect() {
  const base = brainMetrics()
  const top = rankFeatures().slice(0, 3)
  const after = applyLifts(base, top)
  return {
    top,
    before: Object.fromEntries(CORE_FNS.map((f) => [f, functionChance(base, f)])) as Record<FunctionId, number>,
    after: Object.fromEntries(CORE_FNS.map((f) => [f, functionChance(after, f)])) as Record<FunctionId, number>,
    mvpBefore: mvpChance(base),
    mvpAfter: mvpChance(after),
  }
}

/* --------------------------------------------------- The prototype, mapped */

export interface PrototypeRow {
  fn: string
  prototype: number | null
  ours: number
  oursNote: string
}

/** His Figma Make numbers (display only, no logic) beside our catalogue (akps.ts). */
export function prototypeMap(): PrototypeRow[] {
  const s = akpSummary()
  const product = akps().filter((a) => a.id.startsWith('PR-')).length
  return [
    { fn: 'Wellness', prototype: 4590, ours: s.byFunction.wellness, oursNote: 'Goal and strategy AKPs (WG, WS, WM, WI, WV)' },
    { fn: 'Brand', prototype: 1847, ours: s.byFunction.brand, oursNote: 'Waiting for the marketing AKP sheet' },
    { fn: 'Product', prototype: 1970, ours: product, oursNote: 'Product AKPs (PR-)' },
    { fn: 'Business', prototype: 1680, ours: 0, oursNote: 'None yet: the business AKP sheet has not come' },
    { fn: 'Identity (persona mindspace)', prototype: null, ours: s.byFunction.identity, oursNote: 'Wellness Identity AKPs (ID-); not a prototype function' },
    { fn: 'MicroBite “Maxwell”', prototype: 4870, ours: 0, oursNote: 'No learned links yet: needs real outcomes' },
    { fn: 'TheraGPS “Governor”', prototype: 10497, ours: 0, oursNote: 'Routing rule live (main need → StateFlip), no AKPs of its own' },
  ]
}

/* ------------------------------------------------------------ Weekly report */

export const pct = (x: number) => (x > 0 && x < 0.1 ? `${(x * 100).toFixed(1)}%` : `${Math.round(x * 100)}%`)

export function weeklyReport(): string {
  const m = brainMetrics()
  const t3 = topThreeEffect()
  const ch = v8Change()
  const last = ALL_RUN_DECLARATIONS[ALL_RUN_DECLARATIONS.length - 1]
  const ak = akpSummary()
  return [
    'Aurelia weekly report (generated from the admin; every figure is simulated or assumed until real users exist)',
    '',
    'This week',
    `- Buyer agent test ${last.version}: ${v8Findings()[0]}`,
    `- What changed against test ${last.previous}: offer — ${last.offer.note} Panel — ${last.panel.note}`,
    `- ${ch.lines[4]}`,
    `- AKP catalogue: ${ak.total} AKPs (${ak.fromFile} from the sheets, ${ak.drafted} drafted by us); ${ak.flipsCovered} of ${ak.flips} StateFlips have a strategy AKP.`,
    '',
    'Chance to reach the MVP targets (product of stage chances)',
    ...CORE_FNS.map((f) => `- ${FUNCTION_LABEL[f]}: ${pct(functionChance(m, f))}`),
    `- All three together: ${pct(mvpChance(m))}`,
    '',
    `If the top 3 features ship (${t3.top.map((f) => f.name).join('; ')}): ${pct(t3.mvpBefore)} → ${pct(t3.mvpAfter)}.`,
    '',
    'Waiting on: the marketing AKP sheet (Brand), real users for Analysis, the feature lock for the API.',
  ].join('\n')
}
