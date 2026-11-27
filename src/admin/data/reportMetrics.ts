import { buildIterations, type Iteration } from './buyerAgentReport'
import { byId2 } from './buyerPlay'
import { BUYER_RUNS, personasOf, wellnessOf, type BuyerAnswer, type BuyerRun, type Verdict } from './buyerRuns'
import { RUN_V5 } from './buyerRunV5'
import { RUN_V6 } from './buyerRunV6'
import { RUN_V7 } from './buyerRunV7'
import { report } from './buyerSim'
import { CHANNELS, FEATURES as B2B_FEATURES, b2b2cSummary } from './b2b2cReport'
import { DEFAULT_DECISIONS } from './businessFunnel'
import { ASSUME, DEFAULT_GOAL, MEASURED_2025, PERSONAL_FACTOR, PRESETS, STAGES, adherenceFactor, chapterCost, conditionFactor, lengthFactor, presetInputs, type Media, type Stage } from './costModel'
import { generatePersonas, incoherence, type Persona } from './personas'
import { TARGETS, generatePersonasV4, type PersonaV4 } from './personasV4'
import { DIMENSIONS, DIMENSION_LABEL, DIMENSION_WEIGHT, conditionForBuyer, perWeekOf, conditionForCost, conditionIncoherence, conditionSummary, conditionsV4, populationCost, type Dimension } from './personaConditionV4'
import { buyerSummary, combinationSummary, costSummary, uxFeedbackSummary, type ReportSummary } from './reportSummaries'
import { CARD, OFFERS, OUTCOMES, PLUS_NET_YEAR1, VAT } from './retreatFunnel'
import { buildParticipants, type Participant } from './study'
import { CHANCE_CAP, CHANCE_FLOOR, DROPOUT_SHARE, calibrationChapters, chanceOf, chaptersToFlip, sleepCohort } from './stateFlipFormulas'
import { isSleepNeed, personaSleepScore, severityOf } from './stateFlipSleep'
import { akpSummary, akps } from './akps'
import { identitiesV4, identityIncoherence, identitySummary } from './personaIdentityV4'
import { stateFlipSummary, stateFlips } from './stateFlips'

/**
 * Admin → Reports → Report metrics (U135, J186). Every headline number the
 * reports show, with the formula that makes it, the data it is made from,
 * and an audit: the number the report displays is read from the report's
 * own output, then the number is worked out again here from the raw data
 * (each simulated person's answers, each persona, each cost component). If
 * the two agree the metric is Consistent; if not, both are shown as a
 * Mismatch; a number with no data behind it is Not traceable and labelled
 * an assumption. Pure: no React, so it can be tested and reused.
 */

export type MetricReport = 'buyer' | 'personas' | 'combination' | 'cost' | 'b2b2c' | 'retreat' | 'ux' | 'stateflips'

export const REPORT_NAME: Record<MetricReport, string> = {
  buyer: 'Buyer agent report',
  personas: 'Personas',
  combination: 'Combination report',
  cost: 'Cost report',
  b2b2c: 'B2B2C report',
  retreat: 'Creator retreat (business funnel)',
  ux: 'UX feedback report',
  stateflips: 'StateFlips (sleep)',
}

export const REPORT_LINK: Record<MetricReport, string> = {
  buyer: '/admin/reports/buyer-agent',
  personas: '/admin/personas',
  combination: '/admin/reports/combination',
  cost: '/admin/reports/cost',
  b2b2c: '/admin/reports/b2b2c',
  retreat: '/admin/business-funnel',
  ux: '/admin/reports/ux-feedback',
  stateflips: '/admin/stateflips',
}

export type Unit = 'share' | 'count' | 'usd' | 'eur' | 'number'
export type Good = 'up' | 'down' | 'none'
export type Quality = 'consistent' | 'mismatch' | 'untraceable'

export const QUALITY_TEXT: Record<Quality, string> = { consistent: 'Consistent', mismatch: 'Mismatch', untraceable: 'Not traceable' }

/** One number a metric is made from, and where it lives. */
export interface MetricInput {
  label: string
  value: string
  /** The data module (or document) the value is read from. */
  source: string
  /** Persona, answer or row ids the value counts, when it counts some. */
  ids?: string[]
}

/** A per-person (or per-item) table: who counted, and with what. */
export interface Breakdown {
  title: string
  columns: string[]
  rows: { id: string; cells: string[]; flag?: string }[]
  /** Lines under the table: totals, mean, median. */
  footer?: string[]
}

export interface Check {
  level: 'ok' | 'warn' | 'fail'
  text: string
}

/** The number worked out again from the data. */
export interface Derivation {
  value: number
  inputs: MetricInput[]
  /** The calculation, step by step, with the actual numbers in it. */
  steps: string[]
  breakdown?: Breakdown
  /** How many people (or items) the number rests on. */
  n?: number
  checks?: Check[]
}

export interface Series {
  id: string
  label: string
  /** The iteration's name: "Test 3", "Stage 2", "Generator 2". */
  step: string
  order: number
}

export interface MetricDef {
  id: string
  report: MetricReport
  label: string
  unit: Unit
  /** Which way is better. */
  good: Good
  /** The formula, in plain words. */
  formula: string
  /** Where the reports show it, in a few words. */
  shownAt: string
  /** The code module the displayed number comes from. */
  source: string
  /** The number as the report displays it, read from the report's own output; null when it is not shown as a number. */
  displayed: () => number | null
  /** Re-derives the number from the underlying data. Missing: nothing to derive it from. */
  compute?: () => Derivation
  /** Why the number has no data behind it (for Not traceable). */
  assumption?: string
  series?: Series
  /** Allowed gap between displayed and recomputed; defaults by unit (rounding of what is shown). */
  tolerance?: number
}

export interface Trend {
  previous: number
  previousStep: string
  delta: number
  /** true better, false worse, null no change or no good direction. */
  better: boolean | null
}

export interface MetricResult {
  def: MetricDef
  displayed: number | null
  derivation: Derivation | null
  recomputed: number | null
  /** What the table shows: the displayed number, or the recomputed one when nothing is displayed. */
  value: number | null
  quality: Quality
  checks: Check[]
  trend: Trend | null
}

/* ------------------------------------------------------------------ Format */

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d

export function formatValue(unit: Unit, v: number | null): string {
  if (v === null || !isFinite(v)) return '—'
  switch (unit) {
    case 'share':
      return `${round(v * 100, 1)}%`
    case 'count':
      return Number.isInteger(v) ? `${v}` : v.toFixed(1)
    case 'usd':
      return `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`
    case 'eur':
      return `${v < 0 ? '−' : ''}€${Math.abs(v).toFixed(2)}`
    case 'number':
      return `${round(v, 2)}`
  }
}

/** A change between two values, in the metric's unit: points for shares. */
export function formatDelta(unit: Unit, d: number): string {
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±'
  const a = Math.abs(d)
  if (unit === 'share') return `${sign}${round(a * 100, 1)} pts`
  if (unit === 'usd') return `${sign}$${a.toFixed(2)}`
  if (unit === 'eur') return `${sign}€${a.toFixed(2)}`
  return `${sign}${round(a, 2)}`
}

const DEFAULT_TOLERANCE: Record<Unit, number> = { share: 0.0051, count: 0.001, usd: 0.0051, eur: 0.0051, number: 0.051 }

/* ------------------------------------------------------- Reading displays */

/** "8 of 10" → [8, 10]. */
export function parseOf(s: string | undefined): [number, number] | null {
  const m = /(\d+(?:\.\d+)?) of (\d+)/.exec(s ?? '')
  return m ? [Number(m[1]), Number(m[2])] : null
}
const ofShare = (s: string | undefined) => {
  const p = parseOf(s)
  return p && p[1] ? p[0] / p[1] : null
}
/** "45%" → 0.45. */
export const parsePct = (s: string | undefined) => {
  const m = /(\d+(?:\.\d+)?)%/.exec(s ?? '')
  return m ? Number(m[1]) / 100 : null
}
/** Every number in a string, signs kept ("−$16.56" → -16.56). */
export function numbersIn(s: string | undefined): number[] {
  return [...(s ?? '').matchAll(/([−-]?)\$?€?(\d+(?:[.,]\d+)?)/g)].map((m) => (m[1] ? -1 : 1) * Number(m[2].replace(',', '')))
}

let iterationsCache: Iteration[] | null = null
const iterations = () => (iterationsCache ??= buildIterations())
const headline = (id: Iteration['id'], label: string) => iterations().find((i) => i.id === id)?.headline.find((h) => h.label === label)?.value
const tile = (s: ReportSummary, label: string) => s.tiles.find((t) => t.label === label)?.value
const finding = (run: BuyerRun, re: RegExp) => {
  for (const f of run.findings) {
    const m = re.exec(f)
    if (m) return m
  }
  return null
}

/* -------------------------------------------------------------- Helpers */

const runOf = (v: number): BuyerRun => (v === 5 ? RUN_V5 : v === 6 ? RUN_V6 : v === 7 ? RUN_V7 : BUYER_RUNS.find((r) => r.version === v)!)
const peopleOf = (v: number): ((id: string) => Persona) => {
  if (v <= 3) {
    const m = personasOf(runOf(v))
    return (id) => m.get(id)!
  }
  return byId2
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
export const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const usd = (x: number) => formatValue('usd', x)
const pctText = (x: number) => formatValue('share', x)
const BUYER_SRC = (v: number) => (v <= 3 ? 'src/admin/data/buyerRuns.ts' + (v === 1 ? '' : ` (run v${v})`) : `src/admin/data/buyerRunV${v}.ts`)

type Side = 'B' | 'A' | 'ALT'
/** The verdict of one answer, on the offer side a report leads with. */
const verdictOf = (a: BuyerAnswer, side: Side, key: 'tries' | 'pays'): Verdict => (side === 'A' ? a.control![key] : side === 'ALT' ? a.alt![key] : a[key])

const SIDE_NAME: Record<number, Partial<Record<Side, string>>> = {
  3: { A: 'today’s offer (A)', B: 'the proposed offer (B)' },
  5: { B: 'today’s app' },
  6: { A: 'the free app', B: 'the €19.99 retreat', ALT: 'the €39 retreat' },
  7: { A: 'v6’s best offer', B: 'v6’s best plus quick wins (free library)' },
}

/** Count of a verdict across a run, with every person listed. */
function verdictCount(v: number, side: Side, key: 'tries' | 'pays', want: Verdict = 'yes'): Derivation {
  const run = runOf(v)
  const person = peopleOf(v)
  const rows = run.answers.map((a) => {
    const p = person(a.personaId)
    const verdict = verdictOf(a, side, key)
    return { id: a.personaId, cells: [a.personaId, p?.name ?? '—', p?.country ?? '—', verdict, verdict === want ? 'counted' : ''] }
  })
  const k = rows.filter((r) => r.cells[3] === want).length
  const n = run.answers.length
  const sideName = SIDE_NAME[v]?.[side]
  const what = key === 'tries' ? 'would try' : 'would pay'
  return {
    value: n ? k / n : 0,
    n,
    inputs: [
      { label: `Answers in test ${v}${sideName ? `, ${sideName}` : ''}`, value: `${n} simulated people`, source: BUYER_SRC(v), ids: run.answers.map((a) => a.personaId) },
      { label: `Answered “${want}” to “${what}”`, value: `${k}`, source: BUYER_SRC(v), ids: rows.filter((r) => r.cells[3] === want).map((r) => r.id) },
    ],
    steps: [`Count the people whose answer is “${want}”: ${k}.`, `Count everyone asked: ${n}.`, `${k} ÷ ${n} = ${pctText(n ? k / n : 0)}.`],
    breakdown: { title: `Each simulated person’s answer (${what})`, columns: ['Persona', 'Name', 'Country', 'Answer', ''], rows, footer: [`${k} of ${n} answered “${want}”.`] },
  }
}

/** What a persona says they would pay, as a monthly ceiling in US dollars. "More if it clearly works" counts as at least $10. */
export const STATED_CEILING: Record<string, number> = { 'free only': 0, 'up to $5 a month': 5, 'up to $10 a month': 10, 'more if it clearly works': 10 }

/**
 * The owner's rule (J186): a reported willingness to pay has to sit inside
 * what the people themselves said. Two people at $50 cannot give $2.
 * `stated` are each person's own figure; `reported` the report's number.
 */
export function checkWtp(stated: number[], reported: number): Check[] {
  if (!stated.length) return [{ level: 'fail', text: 'Nobody stated a price, so no price can be reported.' }]
  const lo = Math.min(...stated)
  const hi = Math.max(...stated)
  const med = median(stated)
  const out: Check[] = []
  if (reported < lo || reported > hi) out.push({ level: 'fail', text: `Reported ${usd(reported)} lies outside what the people said themselves (${usd(lo)}–${usd(hi)}).` })
  else out.push({ level: 'ok', text: `Reported ${usd(reported)} lies inside what the people said themselves (${usd(lo)}–${usd(hi)}).` })
  if (med > 0 && reported < med / 2) out.push({ level: 'warn', text: `Reported ${usd(reported)} is less than half the median the people stated (${usd(med)}).` })
  return out
}

/** The fair price band's top ("getting expensive", median) of one run, with every person's own stated limit beside it. */
function fairTop(v: number): Derivation {
  const run = runOf(v)
  const person = peopleOf(v)
  const answers = run.answers
  const rows = answers.map((a) => {
    const p = person(a.personaId)
    const ceiling = STATED_CEILING[p.willingnessToPay] ?? null
    const low = ceiling !== null && ceiling > 0 && a.prices.expensive < ceiling / 2
    return {
      id: a.personaId,
      cells: [a.personaId, p.country, p.income, p.willingnessToPay, ceiling === null ? '—' : usd(ceiling), usd(a.prices.bargain), usd(a.prices.expensive), usd(a.prices.tooExpensive)],
      flag: low ? `Says ${usd(a.prices.expensive)} is getting expensive while stating “${p.willingnessToPay}”.` : undefined,
    }
  })
  const exp = answers.map((a) => a.prices.expensive)
  const bargains = answers.map((a) => a.prices.bargain)
  const value = median(exp)
  const ceilings = answers.map((a) => STATED_CEILING[person(a.personaId).willingnessToPay]).filter((x): x is number => x !== undefined)
  const paying = ceilings.filter((c) => c > 0)
  const sorted = [...exp].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const flagged = rows.filter((r) => r.flag)
  const checks: Check[] = [
    ...checkWtp(exp, value).slice(0, 1),
    ...(paying.length ? [checkWtp(paying, value)[0].level === 'fail' && value < Math.min(...paying) ? { level: 'warn' as const, text: `Below every stated paying limit (lowest ${usd(Math.min(...paying))}).` } : { level: 'ok' as const, text: `Inside the stated paying limits of the ${paying.length} who would pay something (${usd(Math.min(...paying))}–${usd(Math.max(...paying))}).` }] : []),
    flagged.length
      ? { level: 'warn', text: `${flagged.length} of ${answers.length} people call a price “getting expensive” that is under half the limit they stated themselves (${flagged.map((r) => r.id).join(', ')}). The run lowers prices by country and income; read those rows.` }
      : { level: 'ok', text: 'No one calls a price “getting expensive” that is under half their own stated limit.' },
  ]
  return {
    value,
    n: answers.length,
    inputs: [
      { label: '“Getting expensive” answers, one per person', value: `${answers.length} answers, ${usd(Math.min(...exp))}–${usd(Math.max(...exp))}`, source: BUYER_SRC(v), ids: answers.map((a) => a.personaId) },
      { label: 'Their stated willingness to pay (persona profile)', value: `${ceilings.filter((c) => c === 0).length} free only, ${ceilings.filter((c) => c === 5).length} up to $5, ${ceilings.filter((c) => c === 10).length} up to $10 or more`, source: v <= 3 ? 'src/admin/data/personas.ts' : 'src/admin/data/personas.ts (generator 2)', ids: answers.map((a) => a.personaId) },
    ],
    steps: [
      `Each person gives four prices a month; the band uses two: “a bargain” and “getting expensive”.`,
      `Sort the ${answers.length} “getting expensive” answers: ${sorted.map((x) => usd(x)).join(', ')}.`,
      sorted.length % 2 ? `The middle one (number ${mid + 1}) is ${usd(value)}.` : `The middle two are ${usd(sorted[mid - 1])} and ${usd(sorted[mid])}; their average is ${usd(value)}.`,
      `For comparison: the mean is ${usd(mean(exp))}; the band’s bottom (median “a bargain”) is ${usd(median(bargains))}.`,
      `The people’s own stated limits: median ${usd(median(ceilings))}, mean ${usd(mean(ceilings))} (“free only” counts as $0, “more if it clearly works” as $10).`,
    ],
    breakdown: {
      title: 'Each person’s stated limit and price answers (US dollars a month)',
      columns: ['Persona', 'Country', 'Income', 'Says they would pay', 'Limit', 'A bargain', 'Getting expensive', 'Too expensive'],
      rows,
      footer: [`Median “getting expensive”: ${usd(value)} · mean ${usd(mean(exp))}`, `Median stated limit: ${usd(median(ceilings))} · mean ${usd(mean(ceilings))}`],
    },
    checks,
  }
}

const sizeCheck = (n: number, what = 'people'): Check[] => (n < 30 ? [{ level: 'warn', text: `Small sample: ${n} ${what}. Under 30 is too few to read it as more than a direction.` }] : [])

/* -------------------------------------------------------------- Buyer runs */

const TEST = (v: number) => `Test ${v}`

function buyerMetrics(): MetricDef[] {
  const tryDisplayed: Record<number, () => number | null> = {
    1: () => ofShare(headline('it-v1', 'Would try')),
    2: () => ofShare(headline('it-v2', 'Would try')),
    3: () => ofShare(headline('it-v3', 'Would try, proposed offer (B)')),
    5: () => ofShare(headline('it-v5', 'Would try (prediction)')),
    6: () => {
      const s = headline('it-v6', 'Would try: freemium / retreat €19.99')
      const m = /(\d+) \/ (\d+) of (\d+)/.exec(s ?? '')
      return m ? Number(m[1]) / Number(m[3]) : null
    },
    7: () => {
      const m = /(\d+) → (\d+) of (\d+)/.exec(headline('it-v7', 'Would try: v6’s best → + quick wins') ?? '')
      return m ? Number(m[2]) / Number(m[3]) : null
    },
  }
  const trySide: Record<number, Side> = { 1: 'B', 2: 'B', 3: 'B', 5: 'B', 6: 'A', 7: 'B' }
  const tries: MetricDef[] = [1, 2, 3, 5, 6, 7].map((v) => ({
    id: `buyer-try-v${v}`,
    report: 'buyer',
    label: `Would try Aurelia · ${TEST(v)}${SIDE_NAME[v]?.[trySide[v]] ? ` (${SIDE_NAME[v]![trySide[v]]})` : ''}`,
    unit: 'share',
    good: 'up',
    formula: 'People who answered “yes, I would try it” ÷ everyone asked.',
    shownAt: `Buyer agent report, report v${v} headline`,
    source: BUYER_SRC(v),
    displayed: tryDisplayed[v],
    compute: () => {
      const d = verdictCount(v, trySide[v], 'tries')
      return { ...d, checks: sizeCheck(d.n!) }
    },
    series: { id: 'buyer-try', label: 'Would try', step: TEST(v), order: v },
  }))

  const payDisplayed: Record<number, () => number | null> = {
    1: () => ofShare(headline('it-v1', 'Would pay for Plus')),
    2: () => ofShare(headline('it-v2', 'Would pay for Plus')),
    3: () => {
      const m = /(\d+) yes/.exec(headline('it-v3', 'Would pay, B') ?? '')
      return m ? Number(m[1]) / runOf(3).answers.length : null
    },
    5: () => ofShare(headline('it-v5', 'Would pay $10 / $100 (prediction)')),
    7: () => parsePct(buyerSummary().rows?.[2]?.figures.find((f) => f.label === 'Would pay, with the free library')?.value),
  }
  const pays: MetricDef[] = [1, 2, 3, 5, 7].map((v) => ({
    id: `buyer-pay-v${v}`,
    report: 'buyer',
    label: `Would pay for the paid plan · ${TEST(v)}`,
    unit: 'share',
    good: 'up',
    formula: 'People who answered “yes, I would pay” (not “maybe”) ÷ everyone asked.',
    shownAt: v === 7 ? 'Buyer agent report summary, Latest test row' : `Buyer agent report, report v${v} headline`,
    source: BUYER_SRC(v),
    displayed: payDisplayed[v],
    compute: () => {
      const d = verdictCount(v, 'B', 'pays')
      return { ...d, checks: sizeCheck(d.n!) }
    },
    series: { id: 'buyer-pay', label: 'Would pay', step: TEST(v), order: v },
    tolerance: v === 7 ? 0.0051 : undefined,
  }))

  const fairDisplayed: Record<number, () => number | null> = {
    1: () => numbersIn(headline('it-v1', 'Fair price band'))[1] ?? null,
    2: () => numbersIn(headline('it-v2', 'Fair price band'))[1] ?? null,
    3: () => {
      const m = /\(\$(\d+)–(\d+) a month\)/.exec(runOf(3).findings.join(' '))
      return m ? Number(m[2]) : null
    },
    5: () => numbersIn(headline('it-v5', 'Fair price band'))[1] ?? null,
    6: () => {
      const m = finding(RUN_V6, /Price band \$([\d.]+)–\$([\d.]+)/)
      return m ? Number(m[2]) : null
    },
    7: () => {
      const m = finding(RUN_V7, /Price band \$([\d.]+)–\$([\d.]+)/)
      return m ? Number(m[2]) : null
    },
  }
  const fair: MetricDef[] = [1, 2, 3, 5, 6, 7].map((v) => ({
    id: `buyer-fair-v${v}`,
    report: 'buyer',
    label: `Fair price, top of the band · ${TEST(v)}`,
    unit: 'usd',
    good: 'up',
    formula: 'The middle (median) of every person’s “getting expensive” price, in US dollars a month. Checked against what each person says they would pay.',
    shownAt: v === 3 ? 'Report v3 findings (“the fair band ($3–6 a month)”)' : v >= 6 ? `Report v${v} findings (“Price band”)` : `Report v${v} headline, Fair price band`,
    source: BUYER_SRC(v),
    displayed: fairDisplayed[v],
    compute: () => fairTop(v),
    series: { id: 'buyer-fair', label: 'Fair price, top', step: TEST(v), order: v },
  }))

  const d30Displayed: Record<number, () => number | null> = {
    3: () => ofShare(headline('it-v3', 'Sure to use at day 30, B')),
    5: () => ofShare(headline('it-v5', 'Sure at day 30 (prediction)')),
    7: () => {
      const m = /(\d+) → (\d+) of (\d+)/.exec(headline('it-v7', 'Sure at day 30 (prediction)') ?? '')
      return m ? Number(m[2]) / Number(m[3]) : null
    },
  }
  const d30: MetricDef[] = [3, 5, 7].map((v) => ({
    id: `buyer-d30-v${v}`,
    report: 'buyer',
    label: `Sure to still use it after a month · ${TEST(v)}`,
    unit: 'share',
    good: 'up',
    formula: 'People whose day-30 answer is “yes” ÷ everyone asked. The category keeps 3–5% of installs.',
    shownAt: `Report v${v} headline`,
    source: BUYER_SRC(v),
    displayed: d30Displayed[v],
    compute: () => {
      const run = runOf(v)
      const person = peopleOf(v)
      const rows = run.answers.map((a) => ({ id: a.personaId, cells: [a.personaId, person(a.personaId).name, a.day30 ?? '—', a.day30 === 'yes' ? 'counted' : ''] }))
      const k = rows.filter((r) => r.cells[3]).length
      const n = rows.length
      const share = k / n
      return {
        value: share,
        n,
        inputs: [
          { label: 'Answers with a day-30 verdict', value: `${n}`, source: BUYER_SRC(v), ids: rows.map((r) => r.id) },
          { label: 'Answered “yes” at day 30', value: `${k}`, source: BUYER_SRC(v), ids: rows.filter((r) => r.cells[3]).map((r) => r.id) },
        ],
        steps: [`Count “yes” at day 30: ${k}.`, `${k} ÷ ${n} = ${pctText(share)}.`],
        breakdown: { title: 'Each person’s day-30 answer', columns: ['Persona', 'Name', 'Day 30', ''], rows, footer: [`${k} of ${n}`] },
        checks: share > 0.2 ? [{ level: 'warn', text: `${pctText(share)} is far above the 3–5% the category keeps at day 30: read it as an upper bound.` }] : [],
      }
    },
    series: { id: 'buyer-d30', label: 'Sure at day 30', step: TEST(v), order: v },
  }))

  /** Expected paying people (yes 1, maybe ½), from the run's answers. */
  const expected = (v: number, side: Side): Derivation => {
    const run = runOf(v)
    const rows = run.answers.map((a) => {
      const verdict = verdictOf(a, side, 'pays')
      return { id: a.personaId, cells: [a.personaId, verdict, verdict === 'yes' ? '1' : verdict === 'maybe' ? '½' : '0'] }
    })
    const yes = rows.filter((r) => r.cells[1] === 'yes').length
    const maybe = rows.filter((r) => r.cells[1] === 'maybe').length
    const value = yes + maybe / 2
    return {
      value,
      n: rows.length,
      inputs: [
        { label: `“Yes, I would pay” on ${SIDE_NAME[v]?.[side] ?? 'the offer'}`, value: `${yes}`, source: BUYER_SRC(v), ids: rows.filter((r) => r.cells[1] === 'yes').map((r) => r.id) },
        { label: '“Maybe”', value: `${maybe}`, source: BUYER_SRC(v), ids: rows.filter((r) => r.cells[1] === 'maybe').map((r) => r.id) },
      ],
      steps: [`A yes counts 1, a maybe counts ½ (the agent’s own weighting).`, `${yes} × 1 + ${maybe} × ½ = ${value}.`, `Out of ${rows.length} people.`],
      breakdown: { title: 'Each person’s answer to paying', columns: ['Persona', 'Answer', 'Counts as'], rows, footer: [`${yes} yes + ${maybe} maybe ÷ 2 = ${value}`] },
    }
  }
  const plusParts = (s: string | undefined) => numbersIn(s)
  const plus: MetricDef[] = [
    { v: 6, side: 'A' as Side, i: 0, label: 'Expected paying people, free app · Test 6', shown: 'Report v6 headline; B2B2C summary tile' },
    { v: 6, side: 'B' as Side, i: 1, label: 'Expected paying people, €19.99 retreat · Test 6', shown: 'Report v6 headline; B2B2C summary tile' },
    { v: 6, side: 'ALT' as Side, i: 2, label: 'Expected paying people, €39 retreat · Test 6', shown: 'Report v6 headline' },
    { v: 7, side: 'A' as Side, i: 0, label: 'Expected paying people, v6’s best · Test 7', shown: 'Report v7 headline' },
    { v: 7, side: 'B' as Side, i: 1, label: 'Expected paying people, with quick wins · Test 7', shown: 'Report v7 headline' },
  ].map((x) => ({
    id: `buyer-plus-v${x.v}-${x.side}`,
    report: 'buyer' as const,
    label: x.label,
    unit: 'number' as const,
    good: 'up' as const,
    formula: 'People who would pay “yes” + half of those who said “maybe”.',
    shownAt: x.shown,
    source: BUYER_SRC(x.v),
    displayed: () => plusParts(headline(x.v === 6 ? 'it-v6' : 'it-v7', 'Expected Plus (yes 1, maybe ½)'))[x.i] ?? null,
    compute: () => expected(x.v, x.side),
  }))
  return [...tries, ...pays, ...fair, ...d30, ...plus]
}

/* ---------------------------------------------- Figures typed into findings */

/** Numbers written by hand into run findings and the decision log: checked against the answers they describe. */
function typedMetrics(): MetricDef[] {
  const r1 = runOf(1)
  const r2 = runOf(2)
  const r3 = runOf(3)
  const segment = (v: number, label: string, pick: (p: Persona) => boolean, side: Side = 'B'): Derivation => {
    const run = runOf(v)
    const person = peopleOf(v)
    const inSeg = run.answers.filter((a) => pick(person(a.personaId)))
    const rows = inSeg.map((a) => ({ id: a.personaId, cells: [a.personaId, person(a.personaId).name, `${person(a.personaId).age}`, verdictOf(a, side, 'tries'), verdictOf(a, side, 'tries') === 'yes' ? 'counted' : ''] }))
    const k = rows.filter((r) => r.cells[4]).length
    return {
      value: k,
      n: inSeg.length,
      inputs: [
        { label: label, value: `${inSeg.length} people`, source: BUYER_SRC(v), ids: inSeg.map((a) => a.personaId) },
        { label: 'Of them, would try', value: `${k}`, source: BUYER_SRC(v), ids: rows.filter((r) => r.cells[4]).map((r) => r.id) },
      ],
      steps: [`Pick the people in the group: ${inSeg.length}.`, `Count those who would try: ${k} of ${inSeg.length}.`],
      breakdown: { title: label, columns: ['Persona', 'Name', 'Age', 'Would try', ''], rows },
      checks: sizeCheck(inSeg.length),
    }
  }
  const issueCount = (v: number): Derivation => {
    const run = runOf(v)
    const rows = run.answers.filter((a) => a.personaIssue).map((a) => ({ id: a.personaId, cells: [a.personaId, a.personaIssue!] }))
    return {
      value: rows.length,
      n: run.answers.length,
      inputs: [{ label: 'Answers where the agent noted a persona that does not hold together', value: `${rows.length} of ${run.answers.length}`, source: BUYER_SRC(v), ids: rows.map((r) => r.id) }],
      steps: [`Count the answers with a persona issue noted: ${rows.length}.`],
      breakdown: { title: 'Personas that did not hold together', columns: ['Persona', 'What was wrong'], rows },
    }
  }
  const verdictTotal = (v: number, key: 'tries' | 'pays', want: Verdict, side: Side = 'B'): Derivation => {
    const d = verdictCount(v, side, key, want)
    const k = Math.round(d.value * d.n!)
    return { ...d, value: k, steps: [...d.steps.slice(0, 2)] }
  }
  return [
    {
      id: 'typed-v1-try', report: 'buyer', label: 'Would try, as written in test 1’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes, I would try” answers.', shownAt: 'Test 1 findings: “8 of 10 would try it”', source: BUYER_SRC(1),
      displayed: () => (finding(r1, /(\d+) of 10 would try/) ? Number(finding(r1, /(\d+) of 10 would try/)![1]) : null),
      compute: () => ({ ...verdictTotal(1, 'tries', 'yes'), checks: sizeCheck(10) }),
    },
    {
      id: 'typed-v1-yearly', report: 'buyer', label: 'Yearly plan per month, as written in test 1’s findings', unit: 'usd', good: 'none',
      formula: 'The yearly price shown to test 1 ÷ 12.', shownAt: 'Test 1 findings: “The yearly plan ($6.58 a month)”', source: BUYER_SRC(1),
      displayed: () => {
        const m = finding(r1, /yearly plan \(\$([\d.]+) a month\)/)
        return m ? Number(m[1]) : null
      },
      compute: () => {
        const offer = r1.stimulus.offer.join(' ')
        const year = Number(/\$(\d+(?:\.\d+)?) a year/.exec(offer)?.[1] ?? NaN)
        return { value: year / 12, inputs: [{ label: 'Yearly price shown in test 1', value: usd(year), source: 'src/admin/data/buyerRuns.ts (stimulus offer)' }], steps: [`${usd(year)} ÷ 12 = ${usd(year / 12)} a month.`] }
      },
    },
    {
      id: 'typed-v1-issues', report: 'personas', label: 'Personas that did not hold together · Test 1', unit: 'count', good: 'down',
      formula: 'Answers where the agent noted a broken persona.', shownAt: 'Test 1 findings: “three personas that do not hold together”', source: BUYER_SRC(1),
      displayed: () => (finding(r1, /found three personas/) ? 3 : null),
      compute: () => issueCount(1),
    },
    {
      id: 'typed-v2-try', report: 'buyer', label: 'Would try, as written in test 2’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes, I would try” answers.', shownAt: 'Test 2 findings: “15 of 36 would try it”', source: BUYER_SRC(2),
      displayed: () => Number(finding(r2, /(\d+) of 36 would try it/)?.[1] ?? NaN),
      compute: () => verdictTotal(2, 'tries', 'yes'),
    },
    {
      id: 'typed-v2-pay', report: 'buyer', label: 'Would pay, as written in test 2’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes, I would pay” answers.', shownAt: 'Test 2 findings: “1 would pay for Plus”', source: BUYER_SRC(2),
      displayed: () => Number(finding(r2, /(\d+) would pay for Plus/)?.[1] ?? NaN),
      compute: () => verdictTotal(2, 'pays', 'yes'),
    },
    {
      id: 'typed-v2-coping', report: 'buyer', label: 'Coping people who would try · Test 2', unit: 'count', good: 'up',
      formula: 'Among people whose wellness is “coping”, those who would try.', shownAt: 'Test 2 findings: “Coping people: 0 of 5 try”', source: BUYER_SRC(2),
      displayed: () => Number(finding(r2, /Coping people: (\d+) of/)?.[1] ?? NaN),
      compute: () => segment(2, 'People whose wellness reads “coping”', (p) => wellnessOf(p).level === 'coping'),
    },
    {
      id: 'typed-v2-65', report: 'buyer', label: 'People 65 or over who would try · Test 2', unit: 'count', good: 'up',
      formula: 'Among people aged 65+, those who would try.', shownAt: 'Test 2 findings: “Age is a cliff at 65: 0 of 6”', source: BUYER_SRC(2),
      displayed: () => Number(finding(r2, /cliff at 65: (\d+) of/)?.[1] ?? NaN),
      compute: () => segment(2, 'People aged 65 or over', (p) => p.age >= 65),
    },
    {
      id: 'typed-v2-issues', report: 'personas', label: 'Personas that did not hold together · Test 2', unit: 'count', good: 'down',
      formula: 'Answers where the agent noted a broken persona.', shownAt: 'Test 2 findings: “13 of 36”', source: BUYER_SRC(2),
      displayed: () => Number(finding(r2, /hold together: (\d+) of 36/)?.[1] ?? NaN),
      compute: () => issueCount(2),
    },
    {
      id: 'typed-v3-try', report: 'buyer', label: 'Would try offer B, as written in test 3’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes, I would try” answers to offer B.', shownAt: 'Test 3 findings: “Would try: 13 → 25”', source: BUYER_SRC(3),
      displayed: () => Number(finding(r3, /Would try: \d+ → (\d+)/)?.[1] ?? NaN),
      compute: () => verdictTotal(3, 'tries', 'yes'),
    },
    {
      id: 'typed-v3-try-a', report: 'buyer', label: 'Would try today’s offer A, as written in test 3’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes, I would try” answers to offer A.', shownAt: 'Test 3 findings: “Would try: 13 → 25”', source: BUYER_SRC(3),
      displayed: () => Number(finding(r3, /Would try: (\d+) →/)?.[1] ?? NaN),
      compute: () => verdictTotal(3, 'tries', 'yes', 'A'),
    },
    {
      id: 'typed-v3-lang', report: 'buyer', label: 'Not first-language English, would try B · Test 3', unit: 'count', good: 'up',
      formula: 'Among people whose first language is not English, those who would try offer B.', shownAt: 'Test 3 findings: “trying went from 4 to 11”', source: BUYER_SRC(3),
      displayed: () => Number(finding(r3, /trying went from \d+ to (\d+)/)?.[1] ?? NaN),
      compute: () => segment(3, 'People whose first language is not English', (p) => p.language !== 'English'),
    },
    {
      id: 'typed-v3-d30', report: 'buyer', label: 'Sure at day 30, as written in test 3’s findings', unit: 'count', good: 'up',
      formula: 'The count of “yes” at day 30.', shownAt: 'Test 3 findings: “4 of 36 (11%)”', source: BUYER_SRC(3),
      displayed: () => Number(finding(r3, /(\d+) of 36 \(\d+%\) still using/)?.[1] ?? NaN),
      compute: () => {
        const ids = r3.answers.filter((a) => a.day30 === 'yes').map((a) => a.personaId)
        return { value: ids.length, n: r3.answers.length, inputs: [{ label: 'Answered “yes” at day 30', value: `${ids.length}`, source: BUYER_SRC(3), ids }], steps: [`Count “yes” at day 30: ${ids.length} of ${r3.answers.length}.`] }
      },
    },
    {
      id: 'typed-v3-account', report: 'combination', label: 'Answers moved by “no account first” · Test 3', unit: 'count', good: 'up',
      formula: 'Answers whose list of changes that moved them includes “no account”.', shownAt: 'Test 3 findings and decision d1: “16 of 36”', source: BUYER_SRC(3) + '; src/admin/data/businessFunnel.ts',
      displayed: () => {
        const d1 = DEFAULT_DECISIONS.find((d) => d.id === 'd1')?.finding
        return Number(/\((\d+) of 36\)/.exec(d1 ?? '')?.[1] ?? NaN)
      },
      compute: () => {
        const ids = r3.answers.filter((a) => a.movedBy?.includes('no-account')).map((a) => a.personaId)
        return { value: ids.length, n: r3.answers.length, inputs: [{ label: 'Answers moved by “no account”', value: `${ids.length}`, source: BUYER_SRC(3), ids }], steps: [`Count the answers that name “no account” as what changed them: ${ids.length} of ${r3.answers.length}.`] }
      },
    },
    {
      id: 'typed-rerun-back', report: 'combination', label: '“Nothing brings them back” leavers · re-run', unit: 'count', good: 'down',
      formula: 'Walks (agent v3 rules × production v3) whose reason for leaving is “Nothing brings them back”.', shownAt: 'Decision d7: “8 of 36”', source: 'src/admin/data/buyerSim.ts; src/admin/data/businessFunnel.ts',
      displayed: () => Number(/\((\d+) of 36/.exec(DEFAULT_DECISIONS.find((d) => d.id === 'd7')?.finding ?? '')?.[1] ?? NaN),
      compute: () => {
        const walks = report(3, 3).walks
        const ids = walks.filter((w) => w.leaveTheme === 'Nothing brings them back').map((w) => w.personaId)
        return { value: ids.length, n: walks.length, inputs: [{ label: 'Walks leaving because nothing brings them back', value: `${ids.length} of ${walks.length}`, source: 'src/admin/data/buyerSim.ts', ids }], steps: [`Walk each of the ${walks.length} people through production v3 with agent v3’s rules.`, `Count those whose leave reason is “Nothing brings them back”: ${ids.length}.`] }
      },
    },
    {
      id: 'typed-gen1-broken', report: 'personas', label: 'Broken personas · Generator 1', unit: 'count', good: 'down',
      formula: 'Personas of 300 where the coherence check finds a contradiction.', shownAt: 'Test 3 findings: “(generator 1: 144)”', source: 'src/admin/data/personas.ts',
      displayed: () => Number(finding(r3, /generator 1: (\d+)/)?.[1] ?? NaN),
      compute: () => brokenCount(1),
      series: { id: 'persona-broken', label: 'Broken personas', step: 'Generator 1', order: 1 },
    },
    {
      id: 'typed-gen2-broken', report: 'personas', label: 'Broken personas · Generator 2', unit: 'count', good: 'down',
      formula: 'Personas of 300 where the coherence check finds a contradiction.', shownAt: 'Test 3 findings: “0 of 300 broken”', source: 'src/admin/data/personas.ts',
      displayed: () => Number(finding(r3, /finds (\d+) of 300 broken/)?.[1] ?? NaN),
      compute: () => brokenCount(2),
      series: { id: 'persona-broken', label: 'Broken personas', step: 'Generator 2', order: 2 },
    },
  ]
}

function brokenCount(gen: 1 | 2): Derivation {
  const ps = generatePersonas(300, undefined, gen)
  const bad = ps.filter((p) => incoherence(p).length)
  return {
    value: bad.length,
    n: ps.length,
    inputs: [{ label: `Generator ${gen} personas`, value: `${ps.length}`, source: 'src/admin/data/personas.ts' }, { label: 'With at least one contradiction', value: `${bad.length}`, source: 'incoherence() in src/admin/data/personas.ts', ids: bad.map((p) => p.id) }],
    steps: [`Run the coherence check on each of the ${ps.length} personas.`, `Count those with a contradiction: ${bad.length}.`],
    breakdown: bad.length ? { title: 'First contradictions found', columns: ['Persona', 'Contradiction'], rows: bad.slice(0, 25).map((p) => ({ id: p.id, cells: [p.id, incoherence(p)[0]] })), footer: bad.length > 25 ? [`and ${bad.length - 25} more`] : undefined } : undefined,
  }
}

/* --------------------------------------------------------------- Personas v4 */

function personaV4Metrics(): MetricDef[] {
  let cache: PersonaV4[] | null = null
  const all = () => (cache ??= generatePersonasV4())
  const rows: { key: keyof typeof TARGETS; label: string; pick: (p: PersonaV4) => boolean }[] = [
    { key: 'riskFlag', label: 'Share with a risk flag', pick: (p) => p.riskFlag },
    { key: 'caregiving', label: 'Share who are caregivers', pick: (p) => p.caregiving },
    { key: 'chronicPain', label: 'Share with chronic pain', pick: (p) => p.chronicPain },
    { key: 'priorApp', label: 'Share who used a wellness app before', pick: (p) => p.priorApp !== 'none' },
    { key: 'stressedYesterday', label: 'Share stressed yesterday', pick: (p) => p.wellness.stress.stressedYesterday },
  ]
  return [
    ...rows.map((r) => ({
      id: `personas-v4-${r.key}`,
      report: 'personas' as const,
      label: `${r.label} · Persona set v4`,
      unit: 'share' as const,
      good: 'none' as const,
      formula: 'Personas with the trait ÷ all 1,000. The target is the published rate the set is built to match.',
      shownAt: 'Personas, set v4: the target figure in its sources',
      source: 'src/admin/data/personasV4.ts (TARGETS)',
      displayed: () => TARGETS[r.key],
      tolerance: 0.03,
      compute: (): Derivation => {
        const ps = all()
        const k = ps.filter(r.pick).length
        const value = k / ps.length
        return {
          value,
          n: ps.length,
          inputs: [{ label: 'Personas in set v4', value: `${ps.length}`, source: 'src/admin/data/personasV4.ts' }, { label: 'With the trait', value: `${k}`, source: 'src/admin/data/personasV4.ts' }, { label: 'Target (published rate)', value: pctText(TARGETS[r.key]), source: 'personasV4.ts SOURCES' }],
          steps: [`Count personas with the trait: ${k}.`, `${k} ÷ ${ps.length} = ${pctText(value)}.`, `Target ${pctText(TARGETS[r.key])}: ${Math.abs(value - TARGETS[r.key]) <= 0.03 ? 'within' : 'outside'} 3 points.`],
        }
      },
    })),
    {
      id: 'personas-v4-broken', report: 'personas', label: 'Broken personas · Persona set v4', unit: 'count', good: 'down',
      formula: 'Personas of 1,000 where the coherence check finds a contradiction.', shownAt: 'Personas, set v4 (tests hold it at zero)', source: 'src/admin/data/personasV4.ts',
      displayed: () => 0,
      compute: () => {
        const bad = all().filter((p) => incoherence(p).length)
        return { value: bad.length, n: all().length, inputs: [{ label: 'Set v4 personas', value: `${all().length}`, source: 'src/admin/data/personasV4.ts' }, { label: 'With a contradiction', value: `${bad.length}`, source: 'incoherence()', ids: bad.map((p) => p.id) }], steps: [`Check each of the ${all().length} personas; ${bad.length} contradict themselves.`] }
      },
      series: { id: 'persona-broken', label: 'Broken personas', step: 'Set v4', order: 3 },
    },
  ]
}

/* ----------------------------------------------- Personas v4: current condition */

function conditionMetrics(): MetricDef[] {
  const src = 'src/admin/data/personaConditionV4.ts'
  const people = () => generatePersonasV4()
  const cond = (p: PersonaV4) => conditionsV4().get(p.id)!
  const shown = 'Personas, set v4: Current condition'
  const dimMean = (d: Dimension): MetricDef => ({
    id: `personas-v4-cond-${d}`, report: 'personas', label: `${DIMENSION_LABEL[d]} score, average · Persona set v4`, unit: 'number', good: 'up',
    formula: `Mean of the ${d} score (0–100, 0 worst) over all 1,000 people.`, shownAt: shown, source: src,
    displayed: () => conditionSummary().meanByDim[d], tolerance: 0.05,
    compute: () => {
      const ps = people()
      const sum = ps.reduce((t, p) => t + cond(p).dims[d].score, 0)
      return { value: sum / ps.length, n: ps.length, inputs: [{ label: 'People', value: `${ps.length}`, source: src }, { label: `Sum of ${d} scores`, value: `${sum}`, source: 'conditionOf()' }], steps: [`${sum} ÷ ${ps.length} = ${(sum / ps.length).toFixed(1)}.`] }
    },
  })
  return [
    ...DIMENSIONS.map(dimMean),
    {
      id: 'personas-v4-cond-overall', report: 'personas', label: 'Overall condition, average · Persona set v4', unit: 'number', good: 'up',
      formula: `Overall = ${DIMENSIONS.map((d) => `${DIMENSION_WEIGHT[d]} × ${d}`).join(' + ')} per person (rounded), then the mean over 1,000.`, shownAt: shown, source: src,
      displayed: () => conditionSummary().meanOverall, tolerance: 0.05,
      compute: () => {
        const ps = people()
        const sum = ps.reduce((t, p) => t + cond(p).overall, 0)
        return { value: sum / ps.length, n: ps.length, inputs: [{ label: 'People', value: `${ps.length}`, source: src }, { label: 'Sum of overall scores', value: `${sum}`, source: 'overallOf()' }], steps: [`Weighted overall per person, summed: ${sum}.`, `${sum} ÷ ${ps.length} = ${(sum / ps.length).toFixed(1)}.`] }
      },
    },
    {
      id: 'personas-v4-cond-main-physical', report: 'personas', label: 'Main need is physical · Persona set v4', unit: 'share', good: 'none',
      formula: 'People whose weakest dimension is physical ÷ 1,000 (ties go to the earlier of mental, emotional, relational, spiritual, physical).', shownAt: shown, source: src,
      displayed: () => conditionSummary().mainNeed.physical / 1000,
      compute: () => {
        const ps = people()
        const counts = DIMENSIONS.map((d) => [d, ps.filter((p) => cond(p).mainNeed === d).length] as const)
        const k = counts.find(([d]) => d === 'physical')![1]
        return { value: k / ps.length, n: ps.length, inputs: counts.map(([d, n]) => ({ label: `Main need ${d}`, value: `${n}`, source: 'mainNeedOf()' })), steps: [`${k} ÷ ${ps.length} = ${pctText(k / ps.length)}.`] }
      },
    },
    {
      id: 'personas-v4-cond-ready', report: 'personas', label: 'Ready to change (preparing, acting or maintaining) · Persona set v4', unit: 'share', good: 'up',
      formula: 'People at the preparing, acting or maintaining stage ÷ 1,000.', shownAt: shown, source: src,
      displayed: () => conditionSummary().readyShare,
      compute: () => {
        const ps = people()
        const k = ps.filter((p) => ['preparing', 'acting', 'maintaining'].includes(cond(p).readiness)).length
        return { value: k / ps.length, n: ps.length, inputs: [{ label: 'People', value: `${ps.length}`, source: src }, { label: 'Preparing, acting or maintaining', value: `${k}`, source: 'readinessOf()' }], steps: [`${k} ÷ ${ps.length} = ${pctText(k / ps.length)}.`] }
      },
    },
    {
      id: 'personas-v4-cond-cost', report: 'personas', label: 'Average cost per person to reach the target · Persona set v4', unit: 'usd', good: 'down',
      formula: 'Per person: chapters = main need’s costModel.goal() chapters + 0.5 × the other dimensions’; cost = chapters × the Balanced chapter cost at stage 1. Mean over people without a risk flag.', shownAt: `${shown} (not yet on the Cost report)`, source: src,
      displayed: () => populationCost().averageCost, tolerance: 0.01,
      compute: () => {
        const rows = people().filter((p) => !p.riskFlag).map((p) => ({ p, c: conditionForCost(p, cond(p)) }))
        const sum = rows.reduce((t, r) => t + r.c.costPerPerson, 0)
        return {
          value: sum / rows.length, n: rows.length,
          inputs: [{ label: 'People counted (no risk flag)', value: `${rows.length}`, source: src }, { label: 'Left out (risk flag)', value: `${people().length - rows.length}`, source: 'personasV4.ts riskFlag' }, { label: 'Sum of cost per person', value: `$${sum.toFixed(2)}`, source: 'conditionForCost()' }],
          steps: [`Sum $${sum.toFixed(2)} ÷ ${rows.length} people = $${(sum / rows.length).toFixed(2)}.`],
          breakdown: { title: 'First 25 people', columns: ['Persona', 'Main need', 'Chapters', 'Cost'], rows: rows.slice(0, 25).map(({ p, c }) => ({ id: p.id, cells: [p.id, c.mainNeed, `${c.chapters}`, `$${c.costPerPerson.toFixed(2)}`] })) },
        }
      },
    },
    {
      id: 'personas-v4-cond-broken', report: 'personas', label: 'Conditions that contradict their person · Persona set v4', unit: 'count', good: 'down',
      formula: 'People whose condition fails a coherence rule (issue fits the person, bands, caps, safety, readiness, coping). Tests hold it at zero.', shownAt: shown, source: src,
      displayed: () => conditionSummary().incoherent,
      compute: () => {
        const bad = people().filter((p) => conditionIncoherence(p, cond(p)).length)
        return { value: bad.length, n: people().length, inputs: [{ label: 'People checked', value: `${people().length}`, source: src }, { label: 'With a contradiction', value: `${bad.length}`, source: 'conditionIncoherence()', ids: bad.map((p) => p.id) }], steps: [`Check each of the ${people().length} conditions; ${bad.length} contradict their person.`] }
      },
    },
  ]
}

/* --------------------------------------------------------------- Combination */

function combinationMetrics(week: number): MetricDef[] {
  const summary = () => combinationSummary(week)
  const walks = () => report(3, 3).walks
  const people = () => personasOf(runOf(3))
  const walkRows = (f: (w: ReturnType<typeof walks>[number]) => string[]) => { const m = people(); return walks().map((w) => ({ id: w.personaId, cells: [w.personaId, m.get(w.personaId)?.name ?? '—', ...f(w)] })) }
  return [
    {
      id: 'combo-activation', report: 'combination', label: 'Listen to a session on the first visit', unit: 'share', good: 'up',
      formula: 'Simulated people who hear a session on their first visit ÷ everyone who arrives (agent v3 rules × production v3).', shownAt: 'Combination report summary tile', source: 'src/admin/data/buyerSim.ts',
      displayed: () => parsePct(tile(summary(), 'Listen to a session on their first visit')),
      compute: () => {
        const ws = walks()
        const k = ws.filter((w) => w.activated).length
        return { value: k / ws.length, n: ws.length, inputs: [{ label: 'Walks (people × production v3)', value: `${ws.length}`, source: 'src/admin/data/buyerSim.ts' }, { label: 'Heard a session on the first visit', value: `${k}`, source: 'src/admin/data/buyerSim.ts', ids: ws.filter((w) => w.activated).map((w) => w.personaId) }], steps: [`${k} of ${ws.length} heard a session.`, `${k} ÷ ${ws.length} = ${pctText(k / ws.length)}.`], breakdown: { title: 'Each walk', columns: ['Persona', 'Name', 'Heard one'], rows: walkRows((w) => [w.activated ? 'yes' : 'no']) } }
      },
    },
    {
      id: 'combo-plus', report: 'combination', label: 'Start paying when the free sessions run out', unit: 'share', good: 'up',
      formula: 'Sum over people of (chance to hit the free limit × chance to choose the paid plan) ÷ sum of chances to hit the limit.', shownAt: 'Combination report summary tile', source: 'src/admin/data/buyerSim.ts',
      displayed: () => parsePct(tile(summary(), 'Start paying when the free sessions run out')),
      compute: () => {
        const ws = walks()
        const cap = ws.reduce((s, w) => s + w.capChance, 0)
        const both = ws.reduce((s, w) => s + w.capChance * w.plusChance, 0)
        const value = cap ? both / cap : 0
        return {
          value, n: ws.length,
          inputs: [{ label: 'Sum of chances to hit the free limit', value: round(cap, 2).toString(), source: 'src/admin/data/buyerSim.ts' }, { label: 'Sum of (hit the limit × choose the paid plan)', value: round(both, 2).toString(), source: 'src/admin/data/buyerSim.ts' }],
          steps: [`Add up each person’s chance to hit the limit: ${round(cap, 2)}.`, `Add up chance to hit it × chance to pay: ${round(both, 2)}.`, `${round(both, 2)} ÷ ${round(cap, 2)} = ${pctText(value)}.`],
          breakdown: { title: 'Each walk', columns: ['Persona', 'Name', 'Hits the limit', 'Then pays'], rows: walkRows((w) => [pctText(w.capChance), pctText(w.plusChance)]) },
        }
      },
    },
    {
      id: 'combo-d30', report: 'combination', label: 'Still using Aurelia after a month', unit: 'share', good: 'up',
      formula: 'The average of each person’s chance to still use it at day 30.', shownAt: 'Combination report summary tile', source: 'src/admin/data/buyerSim.ts',
      displayed: () => parsePct(tile(summary(), 'Still using Aurelia after a month')),
      compute: () => {
        const ws = walks()
        const value = mean(ws.map((w) => w.d30))
        return { value, n: ws.length, inputs: [{ label: 'Day-30 chance per walk', value: `${ws.length} values`, source: 'src/admin/data/buyerSim.ts' }], steps: [`Add the ${ws.length} chances: ${round(ws.reduce((s, w) => s + w.d30, 0), 2)}.`, `÷ ${ws.length} = ${pctText(value)}.`], breakdown: { title: 'Each walk', columns: ['Persona', 'Name', 'Day 30'], rows: walkRows((w) => [pctText(w.d30)]) } }
      },
    },
    {
      id: 'combo-target-activation', report: 'combination', label: 'Goal: listen to a session on the first visit', unit: 'share', good: 'up',
      formula: 'A goal the team set for this step.', shownAt: 'Combination report summary tile (Target)', source: 'src/admin/data/businessFunnel.ts',
      displayed: () => parsePct(/Target\}\} (\d+%)/.exec(summary().tiles.find((t) => t.label === 'Listen to a session on their first visit')?.delta ?? '')?.[1]),
      assumption: 'A target, not a result: the team’s goal for this step. The page lets the team change it.',
    },
    {
      id: 'combo-steps', report: 'combination', label: 'Steps of the journey that reach their goal', unit: 'count', good: 'up',
      formula: 'Stages whose worst metric is at or above its target.', shownAt: 'Combination report summary tile', source: 'src/admin/data/businessFunnel.ts',
      displayed: () => parseOf(tile(summary(), 'Steps that reach their goal'))?.[0] ?? null,
      compute: () => {
        const r = report(3, 3)
        const ws = r.walks
        const done = ws.filter((w) => w.completed && w.activated)
        const felt = done.length ? mean(done.map((w) => w.feltBetter)) : 0
        const m: [string, string, number, number][] = [
          ['entry', 'Hears a session on the first visit', r.activation, 0.7],
          ['aha', 'Finishes their own first session', r.completion, 0.6],
          ['aha', 'Feels better after a session', felt, 0.6],
          ['cap', 'Hits the free limit in week one', r.capHit, 0.3],
          ['upsell', 'Chooses the paid plan at the limit', r.capToPlus, 0.15],
          ['stay', 'Back after a week', r.d7, 0.15],
          ['stay', 'Still using after a month', r.d30, 0.05],
          ['stay', '“Very disappointed” without it', r.ellis, 0.4],
        ]
        const stages = [...new Set(m.map((x) => x[0]))]
        const on = stages.filter((s) => m.filter((x) => x[0] === s).every((x) => x[2] >= x[3]))
        return {
          value: on.length, n: stages.length,
          inputs: m.map(([s, l, v, t]) => ({ label: `${s}: ${l}`, value: `${pctText(v)} (goal ${pctText(t)})`, source: 'src/admin/data/businessFunnel.ts' })),
          steps: [`A stage reaches its goal when every one of its figures does.`, `Reached: ${on.join(', ') || 'none'} = ${on.length} of ${stages.length}.`],
        }
      },
    },
  ]
}

/* --------------------------------------------------------------------- Cost */

const BALANCED = PRESETS.find((p) => p.id === 'balanced')!

function costDerivation(stage: Stage) {
  const inputs = presetInputs(BALANCED, 10)
  const media = chapterCost(inputs)
  const parts = (['script', 'voice', 'music', 'image', 'video'] as Media[]).filter((m) => media[m] > 0)
  const raw = parts.reduce((s, m) => s + media[m], 0)
  const s = STAGES[stage]
  const chapter = raw * s.costFactor
  const gap = DEFAULT_GOAL.target - DEFAULT_GOAL.baseline
  const uplift = s.uplift * conditionFactor(DEFAULT_GOAL.baseline) * lengthFactor(10) * PERSONAL_FACTOR[BALANCED.personalisation]
  const chapters = Math.ceil(gap / uplift)
  const flip = Math.min(0.97, s.success * adherenceFactor(DEFAULT_GOAL.chaptersPerWeek))
  const journey = chapter * chapters
  const costPerFlip = journey / flip
  const revenue = 19.99 * flip
  const profitPerFlip = (revenue - journey) / flip
  return { media, parts, raw, chapter, gap, uplift, chapters, flip, journey, costPerFlip, revenue, profitPerFlip, s }
}

function costMetrics(): MetricDef[] {
  const sum = () => costSummary()
  const mediaInputs = (d: ReturnType<typeof costDerivation>): MetricInput[] => d.parts.map((m) => ({ label: m === 'script' ? 'Script (written by AI)' : m === 'voice' ? 'Voice' : m === 'music' ? 'Music' : m === 'image' ? 'Picture' : 'Video', value: usd(d.media[m]), source: `src/admin/data/costModel.ts (supplier ${BALANCED.models[m]})` }))
  const perFlip = (stage: Stage): MetricDef => ({
    id: `cost-flip-s${stage}`, report: 'cost', label: `Cost to help one person sleep well · Stage ${stage}`, unit: 'usd', good: 'down',
    formula: 'Cost per session × sessions needed ÷ chance it works.',
    shownAt: stage === 2 ? 'Cost report, the three learning stages' : 'Cost report summary tile', source: 'src/admin/data/costModel.ts',
    displayed: () => (stage === 2 ? null : numbersIn(tile(sum(), 'Cost to help one person sleep well'))[stage === 1 ? 0 : 1] ?? null),
    compute: () => {
      const d = costDerivation(stage)
      return {
        value: d.costPerFlip,
        inputs: [...mediaInputs(d), { label: 'Discount as the AI learns', value: `× ${d.s.costFactor}`, source: 'costModel.ts STAGES (business owner’s plan)' }, { label: 'Score gain per session', value: round(d.uplift, 3).toString(), source: 'costModel.ts STAGES (assumption)' }, { label: 'Chance it works', value: pctText(d.flip), source: 'costModel.ts STAGES (assumption)' }],
        steps: [
          `Cost per session: ${d.parts.map((m) => usd(d.media[m])).join(' + ')} = ${usd(d.raw)}, × ${d.s.costFactor} = ${usd(d.chapter)}.`,
          `Sessions needed: sleep score ${DEFAULT_GOAL.baseline} → ${DEFAULT_GOAL.target} is ${d.gap} points; ${d.gap} ÷ ${round(d.uplift, 3)} a session, rounded up = ${d.chapters}.`,
          `All sessions for one person: ${usd(d.chapter)} × ${d.chapters} = ${usd(d.journey)}.`,
          `Divide by the chance it works: ${usd(d.journey)} ÷ ${pctText(d.flip)} = ${usd(d.costPerFlip)}.`,
        ],
        checks: [
          d.chapters === d.s.specChapters ? { level: 'ok', text: `Sessions needed (${d.chapters}) match the business owner’s plan.` } : { level: 'warn', text: `Sessions needed: ${d.chapters} here, ${d.s.specChapters} in the plan.` },
          Math.abs(d.costPerFlip - d.s.specCostPerFlip) / d.s.specCostPerFlip > 0.25
            ? { level: 'warn', text: `The business owner’s plan says ${usd(d.s.specCostPerFlip)}; suppliers’ prices give ${usd(d.costPerFlip)} (${round(d.costPerFlip / d.s.specCostPerFlip, 1)}×). The plan’s figure has no cost breakdown behind it.` }
            : { level: 'ok', text: `Close to the plan’s ${usd(d.s.specCostPerFlip)}.` },
        ],
      }
    },
    series: { id: 'cost-flip', label: 'Cost per person helped', step: `Stage ${stage}`, order: stage },
  })
  return [
    {
      id: 'cost-chapter', report: 'cost', label: 'Cost to make one 10-minute session', unit: 'usd', good: 'down',
      formula: 'Script + voice + music + picture, each from the supplier’s price page × our length and reuse estimates.', shownAt: 'Cost report summary tile', source: 'src/admin/data/costModel.ts',
      displayed: () => numbersIn(tile(sum(), 'Cost to make one 10-minute session'))[0] ?? null,
      compute: () => {
        const d = costDerivation(1)
        return { value: d.chapter, inputs: [...mediaInputs(d), { label: 'Words a minute', value: '105', source: 'costModel.ts' }, { label: 'Reused across people', value: `${ASSUME.reuseAcross}`, source: 'costModel.ts ASSUME (estimate)' }, { label: 'Music and pictures reused', value: pctText(BALANCED.cacheHit), source: 'costModel.ts PRESETS (estimate)' }], steps: [`${d.parts.map((m) => `${m} ${usd(d.media[m])}`).join(' + ')} = ${usd(d.raw)}.`, `Stage 1 discount × ${d.s.costFactor} = ${usd(d.chapter)}.`] }
      },
    },
    perFlip(1),
    perFlip(2),
    perFlip(3),
    {
      id: 'cost-profit-s1', report: 'cost', label: 'Profit per person helped, today', unit: 'usd', good: 'up',
      formula: '($19.99 × chance it works − cost of all sessions) ÷ chance it works.', shownAt: 'Cost report summary tile', source: 'src/admin/data/costModel.ts',
      displayed: () => numbersIn(tile(sum(), 'Profit per person helped, today'))[0] ?? null,
      compute: () => {
        const d = costDerivation(1)
        return { value: d.profitPerFlip, inputs: [{ label: 'Price per person helped', value: '$19.99', source: 'costModel.ts ANCHORS (business owner’s plan)' }, { label: 'Chance it works', value: pctText(d.flip), source: 'costModel.ts STAGES' }, { label: 'Cost of all sessions', value: usd(d.journey), source: 'costModel.ts' }], steps: [`Revenue per person who starts: $19.99 × ${pctText(d.flip)} = ${usd(d.revenue)}.`, `Minus cost of all sessions: ${usd(d.revenue)} − ${usd(d.journey)} = ${usd(d.revenue - d.journey)}.`, `Per person helped: ÷ ${pctText(d.flip)} = ${usd(d.profitPerFlip)}.`] }
      },
    },
    {
      id: 'cost-measured-avg', report: 'cost', label: 'Last year’s real bills, per session', unit: 'eur', good: 'down',
      formula: 'The average of the ten biggest batches’ totals in the old system.', shownAt: 'Cost report summary tile note', source: 'src/admin/data/costModel.ts (MEASURED_2025)',
      displayed: () => {
        const n = tile(sum(), 'Cost to make one 10-minute session') && sum().tiles[0].note
        return Number(/€([\d.]+) a session/.exec(n || '')?.[1] ?? NaN)
      },
      compute: () => {
        const c = MEASURED_2025.campaigns
        const total = c.reduce((s, x) => s + x.total, 0)
        const bad = c.filter((x) => Math.abs(x.script + x.voice + x.image + x.music + x.video - x.total) > 0.015)
        return {
          value: total / c.length, n: c.length,
          inputs: c.map((x, i) => ({ label: `Batch ${i + 1}: ${x.name}`, value: formatValue('eur', x.total), source: 'costModel.ts MEASURED_2025 (old admin export)' })),
          steps: [`Add the ${c.length} totals: €${total.toFixed(2)}.`, `÷ ${c.length} = €${(total / c.length).toFixed(2)}.`],
          breakdown: { title: 'Each batch (euros)', columns: ['Batch', 'Script', 'Voice', 'Picture', 'Music', 'Video', 'Total'], rows: c.map((x, i) => ({ id: `${i}`, cells: [x.name, x.script, x.voice, x.image, x.music, x.video, x.total].map((v) => (typeof v === 'number' ? v.toFixed(2) : v)) })) },
          checks: [
            ...sizeCheck(c.length, 'batches'),
            bad.length ? { level: 'warn', text: `${bad.length} batch totals differ from their parts by more than a cent.` } : { level: 'ok', text: 'Every batch’s parts add up to its total (within a cent).' },
          ],
        }
      },
    },
    {
      id: 'cost-measured-total', report: 'cost', label: 'Last year’s real bills, total', unit: 'eur', good: 'none',
      formula: 'Script + voice + music + picture + video, as billed.', shownAt: 'Cost report, How sure are we', source: 'src/admin/data/costModel.ts (MEASURED_2025)',
      displayed: () => MEASURED_2025.total,
      tolerance: 0.015,
      compute: () => {
        const b = MEASURED_2025.byMedia
        const v = b.script + b.voice + b.music + b.image + b.video
        return { value: v, inputs: Object.entries(b).map(([k, x]) => ({ label: k, value: `€${x.toFixed(2)}`, source: 'costModel.ts MEASURED_2025.byMedia' })), steps: [`€${b.script} + €${b.voice} + €${b.music} + €${b.image} + €${b.video} = €${v.toFixed(2)}.`, `Shown: €${MEASURED_2025.total.toFixed(2)}; a cent of rounding.`] }
      },
    },
    {
      id: 'cost-success-s1', report: 'cost', label: 'Chance it works · Stage 1', unit: 'share', good: 'up',
      formula: 'Taken from the business owner’s plan; no data behind it yet.', shownAt: 'Cost report, the three learning stages', source: 'src/admin/data/costModel.ts (STAGES)',
      displayed: () => STAGES[1].success,
      assumption: 'The plan states 54% success at stage 1. Nobody has measured it: no real person has used Aurelia to sleep better yet.',
    },
  ]
}

/* ------------------------------------------------------------------ B2B2C */

function b2b2cMetrics(): MetricDef[] {
  const r6 = RUN_V6
  const creator = CHANNELS.find((c) => c.id === 'creator')!
  return [
    {
      id: 'b2b2c-employer', report: 'b2b2c', label: 'Would buy if their employer paid · Test 6', unit: 'count', good: 'up',
      formula: 'People in test 6 whose profile lists “their employer paying for it” as a reason to buy.', shownAt: 'B2B2C report: channels, features and sources (“21 of 60”)', source: 'src/admin/data/b2b2cReport.ts; buyerRunV6.ts',
      displayed: () => Number(/(\d+) of 60 people named/.exec(CHANNELS.find((c) => c.id === 'employer')!.changed)?.[1] ?? NaN),
      compute: () => {
        const ps = r6.answers.map((a) => byId2(a.personaId))
        const yes = ps.filter((p) => p.profile.testing.buyTriggers.includes('their employer paying for it'))
        return { value: yes.length, n: ps.length, inputs: [{ label: 'People in test 6', value: `${ps.length}`, source: 'buyerRunV6.ts' }, { label: 'Listing “their employer paying for it”', value: `${yes.length}`, source: 'personas.ts (buy triggers)', ids: yes.map((p) => p.id) }], steps: [`Read each person’s reasons to buy; ${yes.length} of ${ps.length} list their employer paying.`], breakdown: { title: 'People who would buy if work paid', columns: ['Persona', 'Name', 'Country'], rows: yes.map((p) => ({ id: p.id, cells: [p.id, p.name, p.country] })) } }
      },
    },
    {
      id: 'b2b2c-work', report: 'b2b2c', label: 'Heard of Aurelia through work · Test 6', unit: 'count', good: 'up',
      formula: 'People in test 6 whose “how they found it” is their employer.', shownAt: 'B2B2C feature board (“only 4 heard of Aurelia through work”)', source: 'src/admin/data/b2b2cReport.ts; buyerRunV6.ts',
      displayed: () => {
        const f = /only (\d+) heard of Aurelia through work/.exec(B2B_FEATURES.find((x) => x.id === 'ask-employer')?.evidence ?? '')
        return f ? Number(f[1]) : null
      },
      compute: () => {
        const ids = r6.answers.filter((a) => a.vars?.found === 'employer').map((a) => a.personaId)
        return { value: ids.length, n: r6.answers.length, inputs: [{ label: 'Found it through their employer', value: `${ids.length}`, source: 'buyerRunV6.ts (persona variable “found”)', ids }], steps: [`Count the people whose “found” is employer: ${ids.length} of ${r6.answers.length}.`], checks: sizeCheck(ids.length) }
      },
    },
    {
      id: 'b2b2c-free-plus', report: 'b2b2c', label: 'Expected paying people: free app vs ticket · Test 6', unit: 'number', good: 'up',
      formula: 'Free app: yes + ½ maybe, on the 60 people of test 6.', shownAt: 'B2B2C summary tile', source: 'src/admin/data/b2b2cReport.ts',
      displayed: () => numbersIn(tile(b2b2cSummary(), 'What the tests with {{simulated|simulated people}} say'))[0] ?? null,
      compute: () => {
        const yes = r6.answers.filter((a) => a.control!.pays === 'yes').length
        const maybe = r6.answers.filter((a) => a.control!.pays === 'maybe').length
        return { value: yes + maybe / 2, n: r6.answers.length, inputs: [{ label: 'Yes on the free app', value: `${yes}`, source: 'buyerRunV6.ts' }, { label: 'Maybe', value: `${maybe}`, source: 'buyerRunV6.ts' }], steps: [`${yes} + ${maybe} ÷ 2 = ${yes + maybe / 2}.`] }
      },
    },
    {
      id: 'b2b2c-creator-score', report: 'b2b2c', label: 'Creator journey score (of 21)', unit: 'count', good: 'up',
      formula: 'Our 18-point judgement score + up to 3 points from the buyer tests.', shownAt: 'B2B2C summary tile, Best channel', source: 'src/admin/data/b2b2cReport.ts (CHANNELS)',
      displayed: () => creator.score18 + creator.sim,
      assumption: `The ${creator.score18} of 18 is the team’s judgement against six criteria, and the ${creator.sim} test points are a judgement of the tests too. No data produces either score.`,
    },
  ]
}


/* ---------------------------------------------------------------- Retreat */

function retreatMetrics(): MetricDef[] {
  const spec = OFFERS.find((o) => o.id === 'spec')!
  const red = OFFERS.find((o) => o.id === 'redesign')!
  const middle = OUTCOMES.find((o) => o.id === 'middle')!
  return [
    {
      id: 'retreat-plus-net', report: 'retreat', label: 'Year-1 net of one yearly paid plan', unit: 'usd', good: 'up',
      formula: '$100 a year ÷ (1 + VAT) × (1 − store fee).', shownAt: 'Business funnel, Creator retreat', source: 'src/admin/data/retreatFunnel.ts (PLUS_NET_YEAR1)',
      displayed: () => PLUS_NET_YEAR1,
      compute: () => {
        const v = (100 / (1 + VAT)) * (1 - 0.15)
        return { value: v, inputs: [{ label: 'Yearly price', value: '$100', source: 'UpgradePage (app)' }, { label: 'VAT', value: pctText(VAT), source: 'retreatFunnel.ts' }, { label: 'Store fee', value: '15%', source: 'retreatFunnel.ts (small business rate)' }], steps: [`$100 ÷ ${1 + VAT} = ${usd(100 / (1 + VAT))}.`, `× 0.85 = ${usd(v)}.`] }
      },
    },
    {
      id: 'retreat-ai-spec', report: 'retreat', label: 'AI cost per ticket buyer, spec as written', unit: 'usd', good: 'down',
      formula: '24 personalised sessions × the middle voice tier’s cost per session ($0.13, as the note states).', shownAt: 'Business funnel, Creator retreat (offer note)', source: 'src/admin/data/retreatFunnel.ts (OFFERS)',
      displayed: () => spec.aiPerBuyer,
      compute: () => {
        const m = /(\d+) × \$([\d.]+)/.exec(spec.aiNote)
        const n = Number(m?.[1] ?? NaN)
        const each = Number(m?.[2] ?? NaN)
        return { value: n * each, inputs: [{ label: 'Sessions per buyer', value: `${n}`, source: 'retreatFunnel.ts aiNote' }, { label: 'Cost per session', value: `$${each}`, source: 'retreatFunnel.ts aiNote' }], steps: [`${n} × $${each} = $${(n * each).toFixed(2)}.`, `Shown: ${spec.aiPerBuyer.toFixed(2)}.`], checks: [{ level: 'warn', text: `The note prices it in US dollars, but the ticket sums subtract it from euro amounts (a €${spec.price} ticket). $${(n * each).toFixed(2)} is about €${((n * each) / 1.08).toFixed(2)}.` }] }
      },
    },
    {
      id: 'retreat-aurelia-share', report: 'retreat', label: 'Aurelia’s share of one €19.99 ticket (redesign)', unit: 'eur', good: 'up',
      formula: '(Price ÷ (1 + VAT) − card fee) × (1 − creator’s share).', shownAt: 'Business funnel, Creator retreat', source: 'src/admin/data/retreatFunnel.ts',
      displayed: () => null,
      compute: () => {
        const exVat = red.price / (1 + VAT)
        const fee = red.price * CARD.pct + CARD.fixed
        const net = exVat - fee
        const v = net * (1 - red.creatorShare)
        return { value: v, inputs: [{ label: 'Ticket', value: `€${red.price}`, source: 'retreatFunnel.ts OFFERS' }, { label: 'VAT', value: pctText(VAT), source: 'retreatFunnel.ts' }, { label: 'Card fee', value: `${pctText(CARD.pct)} + €${CARD.fixed}`, source: 'retreatFunnel.ts' }, { label: 'Creator’s share', value: pctText(red.creatorShare), source: 'retreatFunnel.ts (approved 24 Nov)' }], steps: [`€${red.price} ÷ ${1 + VAT} = €${exVat.toFixed(2)}.`, `Card fee: €${red.price} × ${CARD.pct} + €${CARD.fixed} = €${fee.toFixed(2)}.`, `Net €${net.toFixed(2)} × ${1 - red.creatorShare} = €${v.toFixed(2)}.`] }
      },
    },
    {
      id: 'retreat-active8', report: 'retreat', label: 'Active at week 8, “plan on this” outcome', unit: 'share', good: 'up',
      formula: 'Set by the team as the middle outcome to plan on.', shownAt: 'Business funnel, Creator retreat', source: 'src/admin/data/retreatFunnel.ts (OUTCOMES)',
      displayed: () => middle.activeWeek8,
      assumption: 'A planning figure between the low (20%) and the spec (76.5%) outcomes. No cohort has run, so nothing measures it.',
    },
  ]
}

/* ---------------------------------------------------------------------- UX */

function uxMetrics(week: number): MetricDef[] {
  let cache: Participant[] | null = null
  const ps = () => (cache ??= buildParticipants(week))
  const s = () => uxFeedbackSummary(ps(), week)
  return [
    {
      id: 'ux-retention', report: 'ux', label: 'Still in the study (sample data)', unit: 'share', good: 'up',
      formula: 'Participants not withdrawn ÷ everyone enrolled.', shownAt: 'UX feedback report summary tile', source: 'src/admin/data/study.ts',
      displayed: () => parsePct(tile(s(), 'Still in the study')),
      compute: () => {
        const all = ps()
        const stay = all.filter((p) => p.status !== 'withdrawn')
        return { value: stay.length / all.length, n: all.length, inputs: [{ label: 'Enrolled (sample)', value: `${all.length}`, source: 'study.ts buildParticipants' }, { label: 'Not withdrawn', value: `${stay.length}`, source: 'study.ts', ids: stay.map((p) => p.id) }], steps: [`${stay.length} ÷ ${all.length} = ${pctText(stay.length / all.length)}.`], breakdown: { title: 'Each participant (sample)', columns: ['Participant', 'Group', 'Status'], rows: all.map((p) => ({ id: p.id, cells: [p.id, p.cohort, p.status] })) } }
      },
    },
    {
      id: 'ux-adherence', report: 'ux', label: 'Use it three times a week or more (sample data)', unit: 'share', good: 'up',
      formula: 'Participants who played 3+ sessions in at least 60% of weeks so far ÷ participants still in the study.', shownAt: 'UX feedback report summary tile', source: 'src/admin/data/study.ts',
      displayed: () => parsePct(tile(s(), 'Use it three times a week or more')),
      compute: () => {
        const stay = ps().filter((p) => p.status !== 'withdrawn')
        const rows = stay.map((p) => {
          const weeks = p.sessionsByWeek.slice(0, week)
          const good = weeks.filter((n) => n >= 3).length
          return { p, weeks: weeks.length, good, ok: weeks.length > 0 && good / weeks.length >= 0.6 }
        }).filter((r) => r.weeks > 0)
        const k = rows.filter((r) => r.ok).length
        return { value: rows.length ? k / rows.length : 0, n: rows.length, inputs: [{ label: 'Participants still in, with a week played', value: `${rows.length}`, source: 'study.ts' }, { label: 'Played 3+ in ≥ 60% of weeks', value: `${k}`, source: 'study.ts', ids: rows.filter((r) => r.ok).map((r) => r.p.id) }], steps: [`For each person: weeks with 3+ sessions ÷ weeks so far (${week}).`, `${k} of ${rows.length} reach 60%: ${pctText(rows.length ? k / rows.length : 0)}.`], breakdown: { title: 'Each participant (sample)', columns: ['Participant', 'Weeks with 3+', 'Weeks so far', ''], rows: rows.map((r) => ({ id: r.p.id, cells: [r.p.id, `${r.good}`, `${r.weeks}`, r.ok ? 'counted' : ''] })) } }
      },
    },
  ]
}

/* ------------------------------------------------------------ StateFlips */

/**
 * Product lab → StateFlips (U140, J202). The page's headline numbers, each
 * worked out again here from the personas with the formulas called one by one,
 * not read from the cohort object.
 */
function stateFlipMetrics(): MetricDef[] {
  const SRC = 'src/admin/data/stateFlipFormulas.ts; stateFlipSleep.ts'
  const rows = () => {
    const ps = generatePersonasV4()
    const cs = conditionsV4()
    return ps.filter((p) => isSleepNeed(p, cs.get(p.id)!) && !cs.get(p.id)!.excluded).map((p) => {
      const c = cs.get(p.id)!
      const start = personaSleepScore(p)
      const b = conditionForBuyer(p, c)
      const chance = chanceOf({ perWeek: perWeekOf(c.minutesPerDay), readiness: b.readiness, severity: severityOf(start), topHelper: c.helpers[0] }).chance
      return { p, c, start, chapters: chaptersToFlip(start, 1, c.acuity), chance }
    })
  }
  return [
    {
      id: 'sf-cohort', report: 'stateflips', label: 'People whose main need is sleep (risk-flagged left out)', unit: 'count', good: 'none',
      formula: 'v4 personas with poor or very poor sleep, main need physical with a sleep issue (poor sleep, body clock, habits), sleep score under 85, no risk flag.', shownAt: 'StateFlips summary and Who has it', source: SRC,
      displayed: () => sleepCohort().people.length,
      compute: () => {
        const ps = generatePersonasV4()
        const cs = conditionsV4()
        const need = ps.filter((p) => isSleepNeed(p, cs.get(p.id)!))
        const ok = need.filter((p) => !cs.get(p.id)!.excluded)
        return { value: ok.length, n: ps.length, inputs: [{ label: 'v4 personas', value: `${ps.length}`, source: 'personasV4.ts' }, { label: 'Sleep is the main need', value: `${need.length}`, source: 'personaConditionV4.ts (main need, physical issue)' }, { label: 'Risk-flagged, left out', value: `${need.length - ok.length}`, source: 'personaConditionV4.ts (excluded)', ids: need.filter((p) => cs.get(p.id)!.excluded).map((p) => p.id) }], steps: [`${need.length} with sleep as the main need − ${need.length - ok.length} risk-flagged = ${ok.length}.`] }
      },
    },
    {
      id: 'sf-calibration', report: 'stateflips', label: 'Chapters from 25 to 85, everything average', unit: 'count', good: 'down',
      formula: 'Add one chapter at a time: 1.43 × layer speed (mood 1.6 below 45, habit 1.05 to 65, skill 0.72 to 85) until the score passes 85.', shownAt: 'StateFlips, how it is worked out', source: SRC,
      displayed: () => STAGES[1].specChapters,
      compute: () => {
        const v = calibrationChapters()
        return { value: v, inputs: [{ label: 'Spec uplift', value: `${STAGES[1].uplift}`, source: 'costModel.ts STAGES (spec)' }, { label: 'Layer speeds', value: '1.6 / 1.05 / 0.72', source: 'stateFlipFormulas.ts PHASE_MULT (assumption)' }], steps: [`20 ÷ (1.43 × 1.6) + 20 ÷ (1.43 × 1.05) + 20 ÷ (1.43 × 0.72) ≈ 8.7 + 13.3 + 19.4, stepped chapter by chapter = ${v}.`, `The spec says ${STAGES[1].specChapters}.`] }
      },
    },
    {
      id: 'sf-median-chapters', report: 'stateflips', label: 'Chapters to flip, middle person', unit: 'count', good: 'down',
      formula: 'The median, over the sleep group, of each person’s chapters from their own starting score to 85 on the layered curve.', shownAt: 'StateFlips summary tile', source: SRC,
      displayed: () => sleepCohort().medianChapters,
      compute: () => {
        const xs = rows()
        const v = median(xs.map((r) => r.chapters))
        return { value: v, n: xs.length, inputs: [{ label: 'People', value: `${xs.length}`, source: 'personasV4.ts + personaConditionV4.ts' }], steps: ['Each person: starting score from their sleep facts; chapters = chaptersToFlip(start, stage 1, acuity).', `Median of ${xs.length} = ${v}.`], breakdown: { title: 'Each person', columns: ['Persona', 'Start', 'Acuity', 'Chapters'], rows: xs.map((r) => ({ id: r.p.id, cells: [r.p.id, `${r.start}`, r.c.acuity, `${r.chapters}`] })) } }
      },
    },
    {
      id: 'sf-mean-chance', report: 'stateflips', label: 'Chance it works, sleep group average', unit: 'share', good: 'up',
      formula: `Mean of each person’s 54% × adherence × readiness × severity × fit, kept between ${CHANCE_FLOOR * 100}% and ${CHANCE_CAP * 100}%.`, shownAt: 'StateFlips summary tile', source: SRC,
      displayed: () => sleepCohort().meanChance,
      compute: () => {
        const xs = rows()
        const v = xs.reduce((t, r) => t + r.chance, 0) / xs.length
        return { value: v, n: xs.length, inputs: [{ label: 'Base (spec)', value: pctText(STAGES[1].success), source: 'costModel.ts STAGES' }, { label: 'People', value: `${xs.length}`, source: 'personasV4.ts' }], steps: [`Σ chance ÷ ${xs.length} = ${pctText(v)}.`], breakdown: { title: 'Each person', columns: ['Persona', 'Start', 'Chance'], rows: xs.map((r) => ({ id: r.p.id, cells: [r.p.id, `${r.start}`, pctText(r.chance)] })) } }
      },
    },
    {
      id: 'sf-flipped-42', report: 'stateflips', label: 'Sleeping well by chapter 42 (share of the group)', unit: 'share', good: 'up',
      formula: 'Mean over people of: chance it works if their chapters to flip ≤ 42, else 0 (a responder flips exactly at their chapters to flip).', shownAt: 'StateFlips summary tile and chart', source: SRC,
      displayed: () => sleepCohort().flippedAt(42),
      compute: () => {
        const xs = rows()
        const v = xs.reduce((t, r) => t + (r.chapters <= 42 ? r.chance : 0), 0) / xs.length
        return { value: v, n: xs.length, inputs: [{ label: 'Flip by 42', value: `${xs.filter((r) => r.chapters <= 42).length} people`, source: 'stateFlipFormulas.ts' }], steps: [`Σ chance of those with chapters ≤ 42 ÷ ${xs.length} = ${pctText(v)}.`] }
      },
    },
    {
      id: 'sf-dropped', report: 'stateflips', label: 'Stopped before the end (share of the group)', unit: 'share', good: 'down',
      formula: `Mean of ${DROPOUT_SHARE} × (1 − chance it works): the drop-out share of the people it does not help (assumption).`, shownAt: 'StateFlips summary tile and chart', source: SRC,
      displayed: () => sleepCohort().rows[sleepCohort().rows.length - 1].dropped,
      compute: () => {
        const xs = rows()
        const v = xs.reduce((t, r) => t + DROPOUT_SHARE * (1 - r.chance), 0) / xs.length
        return { value: v, n: xs.length, inputs: [{ label: 'Drop-out share of failures', value: pctText(DROPOUT_SHARE), source: 'stateFlipFormulas.ts (assumption)' }], steps: [`Σ ${DROPOUT_SHARE} × (1 − chance) ÷ ${xs.length} = ${pctText(v)}.`] }
      },
    },
    {
      id: 'sf-cost-flip', report: 'stateflips', label: 'Cost per flip, sleep group (stage 1)', unit: 'usd', good: 'down',
      formula: 'Cost per chapter (middle option, 10 min) × chapters played per person on average ÷ average chance it works.', shownAt: 'StateFlips, under the cohort table', source: SRC,
      displayed: () => sleepCohort().costPerFlip,
      compute: () => {
        const c = sleepCohort()
        const played = c.people.reduce((t, p) => {
          let k = 0
          for (let i = 1; i <= p.chapters; i++) k += (1 - p.hazard) ** i
          return t + k
        }, 0) / c.people.length
        const v = (c.costPerChapter * played) / c.meanChance
        return { value: v, n: c.people.length, inputs: [{ label: 'Cost per chapter', value: usd(c.costPerChapter), source: 'costModel.ts (balanced, 10 min, stage 1)' }, { label: 'Chapters played', value: played.toFixed(1), source: 'stateFlipFormulas.ts' }, { label: 'Average chance', value: pctText(c.meanChance), source: 'stateFlipFormulas.ts' }], steps: [`${usd(c.costPerChapter)} × ${played.toFixed(1)} ÷ ${pctText(c.meanChance)} = ${usd(v)}.`] }
      },
    },
    // U141 (J203): all 125 StateFlips, the draft AKP catalogue and the personas' wellness identity.
    {
      id: 'sf-all', report: 'stateflips', label: 'StateFlips defined (5 dimensions × 25)', unit: 'count', good: 'none',
      formula: 'The 50 persona condition issues plus 15 per dimension from the Deeksha universal needs or the DOJO duals.', shownAt: 'StateFlips, All StateFlips summary', source: 'src/admin/data/stateFlips.ts',
      displayed: () => stateFlipSummary().total,
      compute: () => {
        const fs = stateFlips()
        const by = (o: string) => fs.filter((f) => f.origin === o).length
        return { value: fs.length, inputs: [{ label: 'From condition issues', value: `${by('issue')}`, source: 'personaConditionV4.ts ISSUES' }, { label: 'From workbook rows', value: `${by('workbook')}`, source: 'Deeksha UN, DOJO_C_Duals' }], steps: [`${by('issue')} + ${by('workbook')} = ${fs.length}.`] }
      },
    },
    {
      id: 'akp-total', report: 'stateflips', label: 'Draft AKPs in the catalogue', unit: 'count', good: 'none',
      formula: 'Goal AKPs (125 StateFlips, their 375 steps, 47 identity dimensions) plus strategy and tactic AKPs (script, music, image, video, product).', shownAt: 'StateFlips, AKP catalogue summary', source: 'src/admin/data/akps.ts',
      displayed: () => akpSummary().total,
      compute: () => {
        const as = akps()
        const goal = as.filter((a) => a.kind === 'goal').length
        const file = as.filter((a) => a.source.startsWith('from ')).length
        return { value: as.length, inputs: [{ label: 'Goal AKPs', value: `${goal}`, source: 'akps.ts' }, { label: 'Strategy and tactic AKPs', value: `${as.length - goal}`, source: 'akps.ts' }, { label: 'From the workbooks', value: `${file}`, source: 'generated/akpSource.ts' }], steps: [`${goal} + ${as.length - goal} = ${as.length}; ${file} from files, ${as.length - file} drafted by us.`] }
      },
    },
    {
      id: 'akp-coverage', report: 'stateflips', label: 'StateFlips served by a strategy AKP', unit: 'share', good: 'up',
      formula: 'StateFlips that at least one strategy or tactic AKP lists among the goals it serves ÷ 125.', shownAt: 'StateFlips, AKP catalogue summary', source: 'src/admin/data/akps.ts',
      displayed: () => akpSummary().flipsCovered / akpSummary().flips,
      compute: () => {
        const fs = stateFlips()
        const served = new Set(akps().filter((a) => a.kind === 'strategy').flatMap((a) => a.flips))
        const v = fs.filter((f) => served.has(f.id)).length / fs.length
        return { value: v, n: fs.length, inputs: [{ label: 'StateFlips served', value: `${served.size}`, source: 'akps.ts' }], steps: [`${served.size} ÷ ${fs.length} = ${pctText(v)}.`] }
      },
    },
    {
      id: 'identity-incoherent', report: 'stateflips', label: 'Persona identities that do not hold together', unit: 'count', good: 'down',
      formula: 'v4 personas whose wellness identity contradicts their profile or condition (risk flag, chapter length, caregiver, spiritual language, StateFlip).', shownAt: 'Personas, Wellness identity in the drawer', source: 'src/admin/data/personaIdentityV4.ts',
      displayed: () => identitySummary().incoherent,
      compute: () => {
        const ps = generatePersonasV4()
        const cs = conditionsV4()
        const ids = identitiesV4()
        const bad = ps.filter((p) => identityIncoherence(p, cs.get(p.id)!, ids.get(p.id)!).length)
        return { value: bad.length, n: ps.length, inputs: [{ label: 'Identities', value: `${ids.size}`, source: 'personaIdentityV4.ts' }], steps: [`${bad.length} of ${ps.length} fail a coherence rule.`] }
      },
    },
  ]
}

/* ------------------------------------------------------------ The registry */

export function metricDefs(week = 1): MetricDef[] {
  return [...buyerMetrics(), ...typedMetrics(), ...personaV4Metrics(), ...conditionMetrics(), ...combinationMetrics(week), ...costMetrics(), ...b2b2cMetrics(), ...retreatMetrics(), ...uxMetrics(week), ...stateFlipMetrics()]
}

/** Audits one metric: displayed against recomputed, plus its sanity checks. */
export function auditMetric(def: MetricDef): Omit<MetricResult, 'trend'> {
  const shown = def.displayed()
  const displayed = shown === null || Number.isNaN(shown) ? null : shown
  const derivation = def.compute ? def.compute() : null
  const recomputed = derivation ? derivation.value : null
  const tol = def.tolerance ?? DEFAULT_TOLERANCE[def.unit]
  let quality: Quality
  if (!derivation) quality = 'untraceable'
  else if (displayed === null) quality = 'consistent'
  else quality = Math.abs(displayed - recomputed!) <= tol ? 'consistent' : 'mismatch'
  const checks: Check[] = [...(derivation?.checks ?? [])]
  if (def.unit === 'share' && ((displayed ?? 0) > 1 || (recomputed ?? 0) > 1)) checks.push({ level: 'fail', text: 'A share above 100%.' })
  if (derivation && displayed === null) checks.push({ level: 'ok', text: 'The report shows this inside a calculation, not as one number; the value here is worked out from the data.' })
  if (quality === 'mismatch') checks.unshift({ level: 'fail', text: `Shown ${formatValue(def.unit, displayed)}, but the data gives ${formatValue(def.unit, recomputed)}.` })
  if (quality === 'untraceable') checks.unshift({ level: 'warn', text: `Assumption: ${def.assumption ?? 'no data behind it.'}` })
  return { def, displayed, derivation, recomputed, value: displayed ?? recomputed, quality, checks }
}

/** Previous → current along each series (v1 → v7, stage 1 → 3, generator 1 → set v4). */
export function withTrends(rows: Omit<MetricResult, 'trend'>[]): MetricResult[] {
  return rows.map((r) => {
    const s = r.def.series
    if (!s || r.value === null) return { ...r, trend: null }
    const prev = rows
      .filter((x) => x.def.series?.id === s.id && x.def.series.order < s.order && x.value !== null)
      .sort((a, b) => b.def.series!.order - a.def.series!.order)[0]
    if (!prev) return { ...r, trend: null }
    const delta = r.value - prev.value!
    const better = Math.abs(delta) < 1e-9 || r.def.good === 'none' ? null : r.def.good === 'up' ? delta > 0 : delta < 0
    return { ...r, trend: { previous: prev.value!, previousStep: prev.def.series!.step, delta, better } }
  })
}

export function buildMetrics(week = 1): MetricResult[] {
  return withTrends(metricDefs(week).map(auditMetric))
}

export interface MetricsSummary {
  total: number
  consistent: number
  mismatch: number
  untraceable: number
  traceable: number
  withTrend: number
  improved: number
  worse: number
  warnings: number
  failures: number
}

/** The summary-first top of the page, and the card on the Reports overview. */
export function metricsReportSummary(rows: MetricResult[]): ReportSummary {
  const s = summarize(rows)
  const mism = rows.filter((r) => r.quality === 'mismatch')
  const fair = rows.filter((r) => r.def.series?.id === 'buyer-fair')
  const lastFair = fair[fair.length - 1]
  return {
    intro: 'Every number our reports show, with the formula behind it and the data it comes from. Click a row to see the calculation.',
    goal: 'Helps the business owner trust the reports: every number has a formula and data behind it, and we can see whether it got better.',
    detail: { to: '/admin/reports/metrics', label: 'Report metrics' },
    question: 'Does every number in the reports come from the data, and are the results getting better?',
    headline: `${s.traceable} of ${s.total} numbers {{traceable|trace back to data}}; ${s.consistent} match the data exactly${s.mismatch ? `, ${s.mismatch} ${s.mismatch === 1 ? 'does' : 'do'} not` : ''} and ${s.untraceable} ${s.untraceable === 1 ? 'is an' : 'are'} assumption${s.untraceable === 1 ? '' : 's'}. ${s.improved} of ${s.withTrend} numbers we can compare improved since the last test, ${s.worse} got worse.`,
    status: s.mismatch ? 'at-risk' : 'on-track',
    statusNote: s.mismatch ? `${s.mismatch} number${s.mismatch === 1 ? ' shown differs' : 's shown differ'} from the data` : 'Every number shown matches its data',
    sure: 'This page checks our arithmetic, not reality. The data underneath is still made-up people, estimates and assumptions.',
    tiles: [
      { label: 'Numbers that trace back to data', value: `${s.traceable} of ${s.total}`, badge: 'measured', note: `${s.untraceable} ${s.untraceable === 1 ? 'is' : 'are'} an {{assumption}} with nothing to recompute from.` },
      { label: 'Shown number differs from the data', value: `${s.mismatch}`, badge: 'measured', note: mism.length ? mism.map((r) => r.def.label).join('; ') : 'None.' },
      { label: 'Improved since the last test', value: `${s.improved} of ${s.withTrend}`, badge: 'prediction', note: `${s.worse} got worse. Panels changed between tests: compare shares, not head counts.` },
      { label: 'Fair price, latest test', value: lastFair ? formatValue('usd', lastFair.value) : '—', badge: 'prediction', note: `The {{median}} “getting expensive” answer, checked against each person’s {{stated-wtp|stated willingness to pay}}.` },
    ],
    actions: [
      { text: 'Open each Mismatch and decide which number is right: the one shown or the one from the data.', to: '#metrics-table', linkLabel: 'The table' },
      { text: 'Read the warnings on the fair price: some people call a price expensive that is far below what they said they would pay.', to: '#metrics-table', linkLabel: 'The table' },
      { text: 'Replace the assumptions with measurements once real users arrive.', to: '#metrics-table', linkLabel: 'The table' },
    ],
    confidence: {
      measured: 'Only the check itself: whether each number shown can be worked out again from its data.',
      predicted: 'Most numbers underneath: AI played the people who answered.',
      assumed: 'The numbers marked Not traceable, and every target.',
    },
  }
}

export function summarize(rows: MetricResult[]): MetricsSummary {
  const by = (q: Quality) => rows.filter((r) => r.quality === q).length
  const trends = rows.filter((r) => r.trend)
  return {
    total: rows.length,
    consistent: by('consistent'),
    mismatch: by('mismatch'),
    untraceable: by('untraceable'),
    traceable: rows.length - by('untraceable'),
    withTrend: trends.length,
    improved: trends.filter((r) => r.trend!.better === true).length,
    worse: trends.filter((r) => r.trend!.better === false).length,
    warnings: rows.filter((r) => r.checks.some((c) => c.level === 'warn')).length,
    failures: rows.filter((r) => r.checks.some((c) => c.level === 'fail')).length,
  }
}
