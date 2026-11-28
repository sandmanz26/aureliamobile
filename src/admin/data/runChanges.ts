import { PROD_V3, answer, placeFactor, play, priceAnswersWith, varsOf, withQuickWins, type Offer } from './buyerPlay'
import { BUYER_RUNS, THEME_LABEL, personasOf, type BuyerAnswer, type BuyerRun, type Theme, type Verdict } from './buyerRuns'
import { V6_A, V6_B } from './buyerRunV6'
import { v7A } from './buyerRunV7'
import type { Persona } from './personas'

/*
 * What changed between buyer runs, and why (U137, J189).
 *
 * The business owner saw "Would try B" go from 2 of 60 to 61 of 100 and
 * could not find why anywhere. Every headline of a run is compared here with
 * the run before it, and the change is attributed to causes, with numbers:
 *
 * - what was tested (offer A and offer B of each run, named exactly),
 * - the panel (size, seed, generator, and the mix that matters),
 * - the rules (which variables the rules count, run v5 → v7),
 * - the price rule (stated willingness to pay scaled by country and income).
 *
 * Runs v5–v7 are played by rules (buyerPlay.ts), so the split is measured by
 * counterfactual: the previous offer is played on the new panel and the new
 * offer on the previous panel, and the offer and panel effects are the
 * average over both orders (so neither order is favoured); the rules effect
 * is the new offer on the new panel at the old rules against the new rules.
 * The steps add up exactly to the change. Runs v1–v3 were written by hand and
 * cannot be replayed, so their changes are attributed only from documented
 * differences, and say so.
 *
 * RUN_CHANGES is the rule for the future: every run must declare what
 * changed against its predecessor (offer, panel, rules). runChanges.test.ts
 * fails `npm run check` for a run without one.
 */

/* ---------------------------------------------------- Declarations (the rule) */

export interface RunOffers {
  /** Offer A, when the run compared two offers. */
  a?: string
  /** Offer B, or the one offer the run showed. */
  b: string
}

/** Which side of the previous run each side repeats exactly, when one does (v3's A is v2's offer). */
export type SameAs = Partial<Record<'a' | 'b', 'a' | 'b'>>

export interface RunChangeDeclaration {
  version: number
  previous: number
  /** What was tested in this run, by name, and what that means against the previous run. */
  offers: RunOffers
  /** A side that is the previous run's offer again: the like-for-like comparison. */
  sameAs?: SameAs
  offer: { changed: boolean; note: string }
  panel: { changed: boolean; note: string }
  rules: { changed: boolean; note: string }
  /** Both runs are played by rules, so the split is measured; false: attributed from documented differences only. */
  reproducible: boolean
}

/** Declares what a new run changed against its predecessor. Throws on an empty reason, so a run cannot ship without one. */
export function declareRunChange(d: RunChangeDeclaration): RunChangeDeclaration {
  for (const k of ['offer', 'panel', 'rules'] as const) if (!d[k].note.trim()) throw new Error(`Run v${d.version}: say what changed in the ${k}, or that nothing did.`)
  if (!d.offers.b.trim()) throw new Error(`Run v${d.version}: name what offer B was.`)
  if (d.previous >= d.version) throw new Error(`Run v${d.version}: the previous run must come before it.`)
  return d
}

/** The first run has nothing before it; its offer is named here so v2 can be compared with it. */
export const FIRST_RUN_OFFERS: RunOffers = { b: 'Aurelia Plus at $9.99, the same US price for everyone' }

export const RUN_CHANGES: RunChangeDeclaration[] = [
  declareRunChange({
    version: 2,
    previous: 1,
    offers: { b: 'Aurelia Plus at local prices (seven countries; $9.99 elsewhere)' },
    offer: { changed: true, note: 'Local prices in seven countries replace one US price for everyone. Same app, same free plan.' },
    panel: { changed: true, note: '10 → 36 people (seed 2026 → 2027), both on persona generator 1; now one per region × age band.' },
    rules: { changed: true, note: 'Calibration rules added; region, price seen, wellness and first-week use now count (v1 did not take them into account).' },
    reproducible: false,
  }),
  declareRunChange({
    version: 3,
    previous: 2,
    offers: { a: 'Aurelia today (the v2 offer)', b: 'The proposal from the business owner’s documents and the research (no sign-up first, eight languages, yearly first)' },
    sameAs: { a: 'b' },
    offer: { changed: true, note: 'B is a new offer (ten changes). A is v2’s offer again, so A is the like-for-like comparison with v2.' },
    panel: { changed: true, note: '36 → 36 people, seed 2027 → 2028, persona generator 1 → 2 (generator 2 fixes the 144 of 300 broken profiles).' },
    rules: { changed: true, note: 'The agent read the research first and calibrated against its figures (day-30 retention 3–5%).' },
    reproducible: false,
  }),
  declareRunChange({
    version: 5,
    previous: 3,
    offers: { b: 'Production v3 as it is (freemium, $10 a month or $100 a year in US dollars everywhere, English only)' },
    offer: { changed: true, note: 'One offer, the app as built, instead of v3’s proposal; Plus at $10 everywhere instead of local prices.' },
    panel: { changed: false, note: 'The same 36 people as v3 (generator 2, seed 2028).' },
    rules: { changed: true, note: 'Hand-written answers replaced by written rules (buyerPlay.ts): every answer is now worked out, and prices come from the price rule.' },
    reproducible: false,
  }),
  declareRunChange({
    version: 6,
    previous: 5,
    offers: { a: 'Production v3 as it is (freemium), the same offer v5 tested', b: 'Creator retreat at €19.99 (a ticket up front, 8 weeks)' },
    sameAs: { a: 'b' },
    offer: { changed: true, note: 'A is v5’s offer again. B is a different product: a paid ticket, sold through a creator.' },
    panel: { changed: true, note: '36 → 60 people, drawn anew (seed 2028 → 2031), generator 2.' },
    rules: { changed: true, note: 'Same written rules; four more variables count (how they found Aurelia, why they left their last app, budget, …).' },
    reproducible: true,
  }),
  declareRunChange({
    version: 7,
    previous: 6,
    offers: { a: 'v6’s best offer for each person’s channel', b: 'v6’s best offer for their channel + quick wins (free core library, one check-in a day, Need help now?)' },
    offer: { changed: true, note: 'B is no longer the €19.99 retreat: it is v6’s best offer per channel plus four quick wins.' },
    panel: { changed: true, note: '60 → 100 people, seed 2031 → 2032, generator 2.' },
    rules: { changed: true, note: 'Same written rules; five more variables count (life stage, when they need it, trust in AI, privacy, culture).' },
    reproducible: true,
  }),
]

/**
 * Test 8 (U147, J206) declares its change here too. It is kept out of
 * RUN_CHANGES because its panel is persona set v4, which v5–v7's rules
 * (buyerPlay, persona generator 2) cannot replay, so the headline split
 * above does not apply; buyerRunV8.ts measures B against A on the same
 * people instead (v8Split) and says that the step from v7 is not separable.
 */
export const V8_CHANGE: RunChangeDeclaration = declareRunChange({
  version: 8,
  previous: 7,
  offers: {
    a: 'v7’s best offer: v6’s best for the channel + Insight-Timer-style quick wins (everyone in set v4 came organically)',
    b: 'A journey for your StateFlip X: free first week, then $10/month',
  },
  sameAs: { a: 'b' },
  offer: { changed: true, note: 'A is v7’s B again, the like-for-like side. B is new: one journey named after the person’s own StateFlip (matched to their main need), a free first week, then $10 a month.' },
  panel: { changed: true, note: '100 people from persona generator 2 (seed 2032) → 975 of persona set v4 (seed 20264): all 1,000 minus the 25 risk-flagged, who get Need help now? and no offer.' },
  rules: { changed: true, note: 'v5–v7’s written rules (buyerPlay.ts) → v8’s rules from conditionForBuyer: need, urgency, readiness, scepticism and time, plus fit, the chance to reach the StateFlip, price load and language. Every formula is in buyerRunV8.ts.' },
  reproducible: false,
})

/**
 * Test 9 (U150, J208): A is test 8's B, played by test 8's rules, so A is
 * like-for-like with test 8 person by person; B adds the person's own first
 * chapter assembled from AKPs (akpAssembly.ts). buyerRunV9.ts measures B
 * against A on the same people and splits the effect into its parts.
 */
export const V9_CHANGE: RunChangeDeclaration = declareRunChange({
  version: 9,
  previous: 8,
  offers: {
    a: 'Test 8’s B: a journey for your StateFlip X, free first week, then $10/month',
    b: 'The same journey, showing the person’s own first chapter built from AKPs matched to their identity and condition (“breath 4-7-8, warm low voice, 55 BPM drone, 10 min”); free first week, then $10/month',
  },
  sameAs: { a: 'b' },
  offer: { changed: true, note: 'A is test 8’s B again, the like-for-like side. B adds one thing: a concrete preview of their first chapter, assembled from catalogue AKPs (technique, StateFlip focus, voice, pace, tempo, music bed, colours, minutes) by written matching rules. Price and free week unchanged.' },
  panel: { changed: false, note: 'Unchanged: the same 975 of persona set v4 (seed 20264; the 25 risk-flagged get Need help now? and no offer).' },
  rules: { changed: true, note: 'Test 8’s rules for A, unchanged. For B four written terms are added: fit 0.8 → 0.9, the doubt term × 0.8 (× 0.95 for people who distrust AI), the short-day time load 0.1 → 0.05 when the chapter fits their day, and a 0.03 put-off for people who distrust AI. Every formula is in buyerRunV9.ts.' },
  reproducible: false,
})

/** Every declaration, test 9 included. */
export const ALL_RUN_DECLARATIONS: RunChangeDeclaration[] = [...RUN_CHANGES, V8_CHANGE, V9_CHANGE]

export const offersOf = (version: number): RunOffers => (version === BUYER_RUNS[0].version ? FIRST_RUN_OFFERS : RUN_CHANGES.find((d) => d.version === version)!.offers)

/* ------------------------------------------------------------- Headlines */

export type HeadlineId = 'tryA' | 'tryB' | 'payA' | 'payB' | 'fairLow' | 'fairHigh' | 'pass' | 'risk' | 'fail' | 'objection'
type Side = 'A' | 'B'

export const HEADLINE_LABEL: Record<HeadlineId, string> = {
  tryA: 'Would try A',
  tryB: 'Would try B',
  payA: 'Would pay A',
  payB: 'Would pay B',
  fairLow: 'Fair price, low end',
  fairHigh: 'Fair price, high end',
  pass: 'Test cases passed',
  risk: 'Test cases at risk',
  fail: 'Test cases failed',
  objection: 'Top objection',
}

const SIDE: Partial<Record<HeadlineId, Side>> = { tryA: 'A', payA: 'A' }
const sideOf = (id: HeadlineId): Side => SIDE[id] ?? 'B'
const isUsd = (id: HeadlineId) => id === 'fairLow' || id === 'fairHigh'

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

type Row = Pick<BuyerAnswer, 'tries' | 'pays' | 'prices' | 'scenarios' | 'theme'>

const topTheme = (rows: Row[]): [Theme, number] => {
  const m = new Map<Theme, number>()
  for (const r of rows) m.set(r.theme, (m.get(r.theme) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]
}

/** A headline as a number: a share for counts, US dollars for prices; `theme` picks which objection to count. */
function metric(id: HeadlineId, rows: Row[], theme?: Theme): number {
  const n = rows.length
  switch (id) {
    case 'tryA':
    case 'tryB':
      return rows.filter((r) => r.tries === 'yes').length / n
    case 'payA':
    case 'payB':
      return rows.filter((r) => r.pays === 'yes').length / n
    case 'fairLow':
      return median(rows.map((r) => r.prices.bargain))
    case 'fairHigh':
      return median(rows.map((r) => r.prices.expensive))
    case 'objection':
      return rows.filter((r) => r.theme === (theme ?? topTheme(rows)[0])).length / n
    default: {
      const all = rows.flatMap((r) => r.scenarios)
      return all.filter((s) => s.outcome === id).length / all.length
    }
  }
}

/** The count a headline shows (people, or test cases), for "x of n". */
function countOf(id: HeadlineId, rows: Row[], theme?: Theme): { k: number; n: number } | null {
  if (isUsd(id)) return null
  if (id === 'pass' || id === 'risk' || id === 'fail') {
    const all = rows.flatMap((r) => r.scenarios)
    return { k: all.filter((s) => s.outcome === id).length, n: all.length }
  }
  return { k: Math.round(metric(id, rows, theme) * rows.length), n: rows.length }
}

const rowsOf = (run: BuyerRun, side: Side): Row[] | null => {
  if (side === 'B') return run.answers
  if (!run.answers.some((a) => a.control)) return null
  return run.answers.map((a) => ({ ...a, tries: a.control!.tries, pays: a.control!.pays }))
}

/** The headlines a run shows: A only where it had one. */
export const headlinesOf = (run: BuyerRun): HeadlineId[] =>
  (['tryA', 'tryB', 'payA', 'payB', 'fairLow', 'fairHigh', 'pass', 'risk', 'fail', 'objection'] as HeadlineId[]).filter((id) => rowsOf(run, sideOf(id)))

/* ------------------------------------------------------- Reproducible runs */

type Level = 5 | 6 | 7
interface Repro {
  level: Level
  offer: Partial<Record<Side, (p: Persona) => Offer>>
}

const REPRO: Record<number, Repro> = {
  5: { level: 5, offer: { B: () => PROD_V3 } },
  6: { level: 6, offer: { A: () => V6_A, B: () => V6_B } },
  7: { level: 7, offer: { A: (p) => v7A(varsOf(p).found), B: (p) => withQuickWins(v7A(varsOf(p).found)) } },
}

export const isReproducible = (version: number) => version in REPRO

/** The offer a run showed on a side; a run with one offer shows it on both. */
const offerFn = (version: number, side: Side) => REPRO[version].offer[side] ?? REPRO[version].offer.B!

const runOf = (version: number) => BUYER_RUNS.find((r) => r.version === version)!
const peopleOf = (run: BuyerRun): Persona[] => {
  const m = personasOf(run)
  return run.answers.map((a) => m.get(a.personaId)!)
}

/** The previous run's side a headline is compared with: the one this side repeats, the same side, or the previous run's only offer. */
function prevSide(decl: RunChangeDeclaration, prevRun: BuyerRun, side: Side): Side {
  const s = decl.sameAs?.[side === 'A' ? 'a' : 'b']
  if (s) return s === 'a' ? 'A' : 'B'
  return rowsOf(prevRun, side) ? side : 'B'
}

const cellCache = new Map<string, BuyerAnswer[]>()
/** Plays a panel against an offer at a rules level. */
function cell(panelOf: number, offerOf: number, side: Side, level: Level): BuyerAnswer[] {
  const key = `${panelOf}|${offerOf}|${side}|${level}`
  let rows = cellCache.get(key)
  if (!rows) {
    const f = offerFn(offerOf, side)
    rows = peopleOf(runOf(panelOf)).map((p) => answer(p, f(p), level))
    cellCache.set(key, rows)
  }
  return rows
}

/* ------------------------------------------------------------ Panel mix */

export interface MixDiff {
  dimension: string
  group: string
  prev: number
  cur: number
}

const DIMENSIONS: [string, (p: Persona) => string][] = [
  ['Region', (p) => p.region],
  ['Country', (p) => p.country],
  ['Income', (p) => `${p.income} income`],
  ['Age band', (p) => p.ageBand],
  ['Used an app before', (p) => (p.apps.length ? 'used one' : 'never used one')],
  ['First language', (p) => (p.language === 'English' ? 'English' : 'not English')],
  ['Would pay (profile)', (p) => p.willingnessToPay],
]

const shares = (people: Persona[], key: (p: Persona) => string) => {
  const m = new Map<string, number>()
  for (const p of people) m.set(key(p), (m.get(key(p)) ?? 0) + 1)
  return new Map([...m].map(([k, v]) => [k, v / people.length]))
}

/** The groups whose share moved by 8 points or more, largest first. */
export function mixDiffs(prev: Persona[], cur: Persona[], min = 0.08): MixDiff[] {
  const out: MixDiff[] = []
  for (const [dimension, key] of DIMENSIONS) {
    const a = shares(prev, key)
    const b = shares(cur, key)
    for (const g of new Set([...a.keys(), ...b.keys()])) {
      const d = { dimension, group: g, prev: a.get(g) ?? 0, cur: b.get(g) ?? 0 }
      if (Math.abs(d.cur - d.prev) >= min) out.push(d)
    }
  }
  return out.sort((x, y) => Math.abs(y.cur - y.prev) - Math.abs(x.cur - x.prev))
}

const meanPlace = (people: Persona[]) => people.reduce((s, p) => s + placeFactor(p.country), 0) / people.length
const scaledShare = (people: Persona[]) => people.filter((p) => placeFactor(p.country) < 1).length / people.length

/* --------------------------------------------------------------- Changes */

export type EffectKind = 'offer' | 'panel' | 'rules' | 'price-wtp' | 'price-place' | 'price-income' | 'method' | 'together'

export interface Effect {
  kind: EffectKind
  label: string
  /** In the headline's unit (share or US dollars); the steps add up to the change. */
  value: number
  /** True when the number is measured by replaying; false when it is everything that changed at once. */
  measured: boolean
  text: string
}

export interface Flip {
  personaId: string
  name: string
  cause: 'offer' | 'rules' | 'same person'
  before: string
  after: string
  reason: string
}

export interface HeadlineChange {
  id: HeadlineId
  label: string
  unit: 'share' | 'usd'
  prev: number
  cur: number
  delta: number
  prevCount: { k: number; n: number } | null
  curCount: { k: number; n: number } | null
  /** For the objection headline: which theme each run led with. */
  prevTheme?: string
  curTheme?: string
  likeForLike: boolean
  /** Said in plain words when the comparison is not of the same thing. */
  warning?: string
  measured: boolean
  steps: Effect[]
  flips: Flip[]
  /** One plain line: the change and its main causes. */
  why: string
}

export interface RunChange {
  version: number
  previous: number
  declaration: RunChangeDeclaration
  prevOffers: RunOffers
  mix: MixDiff[]
  panel: { prevSize: number; curSize: number; prevSeed: number; curSeed: number; prevGenerator: number; curGenerator: number; samePeople: number; prevPlace: number; curPlace: number; prevScaled: number; curScaled: number; prevIndonesia: number; curIndonesia: number }
  headlines: HeadlineChange[]
  notLikeForLike: string[]
  summary: string[]
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const r1 = (x: number) => Math.round(x * 10) / 10
export const money = (x: number) => `${x < 0 ? '−' : ''}$${Math.abs(x) % 1 ? Math.abs(x).toFixed(2) : Math.abs(x)}`
/** A change in the headline's unit: "+12 points" or "+$0.50". */
export function formatChange(unit: 'share' | 'usd', d: number): string {
  if (unit === 'usd') return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${money(Math.abs(d))}`
  const v = r1(d * 100)
  return `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v)} pts`
}
export const formatValue = (unit: 'share' | 'usd', v: number) => (unit === 'usd' ? money(v) : pct(v))

const VERDICT_WORD: Record<Verdict, string> = { yes: 'yes', maybe: 'maybe', no: 'no' }
const firstReason = (because: string[]) => because.find((b) => !/^Does not try|^A deal breaker is hit/.test(b)) ?? because[0] ?? ''

function flipsFor(id: HeadlineId, prevRun: BuyerRun, curRun: BuyerRun, decl: RunChangeDeclaration): Flip[] {
  const key: 'tries' | 'pays' | 'theme' | null = id.startsWith('try') ? 'tries' : id.startsWith('pay') ? 'pays' : id === 'objection' ? 'theme' : null
  if (!key) return []
  const side = sideOf(id)
  const out: Flip[] = []
  const people = personasOf(curRun)
  const word = (v: string) => (key === 'theme' ? THEME_LABEL[v as Theme] : VERDICT_WORD[v as Verdict])
  // The same person in both runs (v3 → v5): their own answer before and after.
  const replayable = isReproducible(prevRun.version) && isReproducible(curRun.version)
  if (!replayable && prevRun.generator === curRun.generator) {
    const prevRows = rowsOf(prevRun, prevSide(decl, prevRun, side))!
    const curRows = rowsOf(curRun, side)!
    prevRun.answers.forEach((pa, i) => {
      const ci = curRun.answers.findIndex((c) => c.personaId === pa.personaId)
      if (ci < 0) return
      const b = prevRows[i][key] as string
      const a = curRows[ci][key] as string
      if (a === b) return
      const ca = curRun.answers[ci]
      out.push({ personaId: pa.personaId, name: people.get(pa.personaId)!.name, cause: 'same person', before: word(b), after: word(a), reason: side === 'A' && ca.control ? ca.control.why : ca.objection })
    })
  }
  if (replayable) {
    const P = offerFn(prevRun.version, prevSide(decl, prevRun, side))
    const C = offerFn(curRun.version, side)
    const lp = REPRO[prevRun.version].level
    const lc = REPRO[curRun.version].level
    for (const p of peopleOf(curRun)) {
      const before = play(p, P(p), lc)
      const after = play(p, C(p), lc)
      if (before[key] !== after[key]) out.push({ personaId: p.id, name: p.name, cause: 'offer', before: `${word(before[key])} (${prevRun.version === 5 ? 'v5' : `v${prevRun.version}`}’s offer)`, after: word(after[key]), reason: firstReason(after.because) })
      const old = play(p, C(p), lp)
      if (old[key] !== after[key]) out.push({ personaId: p.id, name: p.name, cause: 'rules', before: `${word(old[key])} (v${prevRun.version}’s rules)`, after: word(after[key]), reason: firstReason(after.because) })
    }
  }
  return out
}

function headlineChange(id: HeadlineId, prevRun: BuyerRun, curRun: BuyerRun, decl: RunChangeDeclaration): HeadlineChange {
  const side = sideOf(id)
  const unit = isUsd(id) ? 'usd' : 'share'
  const pside = prevSide(decl, prevRun, side)
  const prevRows = rowsOf(prevRun, pside)!
  const curRows = rowsOf(curRun, side)!
  const curTheme = id === 'objection' ? topTheme(curRows)[0] : undefined
  const prevTheme = id === 'objection' ? topTheme(prevRows)[0] : undefined
  // The objection headline is the share of the current top objection, in both runs.
  const prev = metric(id, prevRows, curTheme)
  const cur = metric(id, curRows, curTheme)
  const delta = cur - prev
  const po = offersOf(prevRun.version)
  const co = offersOf(curRun.version)
  const prevName = pside === 'A' ? po.a! : po.b
  const curName = side === 'A' ? co.a! : co.b
  const sameOffer = !!decl.sameAs?.[side === 'A' ? 'a' : 'b'] || prevName === curName
  const likeForLike = sameOffer || isUsd(id)
  const pv = `v${prevRun.version}`
  const cv = `v${curRun.version}`
  const warning = !sameOffer && !isUsd(id) ? `Not like for like: ${side} in ${pv} was “${prevName}”, ${side} in ${cv} is “${curName}”. “${HEADLINE_LABEL[id]} went ${delta >= 0 ? 'up' : 'down'}” is not a trend; it compares two different things.` : undefined

  const steps: Effect[] = []
  let measured = false
  const prevPeople = peopleOf(prevRun)
  const curPeople = peopleOf(curRun)
  const same = prevRun.generator === curRun.generator && prevPeople.length === curPeople.length && prevPeople.every((p, i) => p.id === curPeople[i].id)

  if (isReproducible(prevRun.version) && isReproducible(curRun.version)) {
    measured = true
    const lp = REPRO[prevRun.version].level
    const lc = REPRO[curRun.version].level
    const m = (panel: number, offer: number, level: Level) => metric(id, cell(panel, offer, offer === X ? pside : side, level), curTheme)
    const X = prevRun.version
    const Y = curRun.version
    const offer = ((m(X, Y, lp) - m(X, X, lp)) + (m(Y, Y, lp) - m(Y, X, lp))) / 2
    const panel = ((m(Y, X, lp) - m(X, X, lp)) + (m(Y, Y, lp) - m(X, Y, lp))) / 2
    const rules = m(Y, Y, lc) - m(Y, Y, lp)
    steps.push({ kind: 'offer', label: 'What was tested', value: offer, measured: true, text: `${cv}’s offer played on ${pv}’s people, and ${pv}’s offer on ${cv}’s people: ${formatChange(unit, offer)} on average.` })
    if (isUsd(id)) {
      const parts = priceSplit(id, prevPeople, curPeople)
      steps.push(...parts)
    } else {
      steps.push({ kind: 'panel', label: 'Who was asked', value: panel, measured: true, text: `The same offers on ${cv}’s ${curPeople.length} people instead of ${pv}’s ${prevPeople.length}: ${formatChange(unit, panel)} on average.` })
    }
    steps.push({ kind: 'rules', label: 'The rules', value: rules, measured: true, text: `${cv}’s offer on ${cv}’s people, played with ${pv}’s variables and then with ${cv}’s: ${formatChange(unit, rules)}.` })
  } else if (same) {
    // v3 → v5: the same people, so the panel did nothing; offer and method changed together.
    measured = true
    steps.push({ kind: 'panel', label: 'Who was asked', value: 0, measured: true, text: `The same ${curPeople.length} people in both runs: the panel explains none of the change.` })
    if (isUsd(id)) {
      steps.push({ kind: 'method', label: 'How prices were answered', value: delta, measured: true, text: `${pv}’s price answers were written by hand; ${cv}’s come from the price rule (stated willingness to pay × country × income). The offer does not enter the price rule, so all of ${formatChange(unit, delta)} is the method.` })
    } else {
      steps.push({ kind: 'together', label: 'Offer and method together', value: delta, measured: false, text: `${pv} was written by hand and cannot be replayed, so the offer change and the switch to written rules cannot be told apart: ${formatChange(unit, delta)} together.` })
    }
  } else {
    steps.push({ kind: 'together', label: 'Everything that changed', value: delta, measured: false, text: `${pv} and ${cv} were written by hand and cannot be replayed, so the change is not split. Documented differences: offer — ${decl.offer.note} Panel — ${decl.panel.note} Rules — ${decl.rules.note}` })
  }

  const flips = flipsFor(id, prevRun, curRun, decl)
  const main = [...steps].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).filter((s) => Math.abs(s.value) > 1e-9)
  const causes = measured ? main.map((s) => `${s.label.toLowerCase()} ${formatChange(unit, s.value)}`).join(', ') : 'not separable (hand-written runs)'
  const pc = countOf(id, prevRows, curTheme)
  const cc = countOf(id, curRows, curTheme)
  const head =
    id === 'objection'
      ? `Top objection: ${THEME_LABEL[prevTheme!]} ${countOf(id, prevRows, prevTheme)!.k} of ${prevRows.length} → ${THEME_LABEL[curTheme!]} ${cc!.k} of ${curRows.length}${prevTheme !== curTheme ? ` (${THEME_LABEL[curTheme!]} was ${pc!.k} of ${prevRows.length})` : ''}.`
      : `${HEADLINE_LABEL[id]}: ${formatValue(unit, prev)} → ${formatValue(unit, cur)} (${formatChange(unit, delta)}).`
  const why = `${head} ${warning ? 'Different offers. ' : ''}${main.length || !measured ? `Because: ${causes || 'nothing measurable'}.` : 'No change.'}`

  return {
    id,
    label: HEADLINE_LABEL[id],
    unit,
    prev,
    cur,
    delta,
    prevCount: pc,
    curCount: cc,
    prevTheme: prevTheme && THEME_LABEL[prevTheme],
    curTheme: curTheme && THEME_LABEL[curTheme],
    likeForLike,
    warning,
    measured,
    steps,
    flips,
    why,
  }
}

/** Splits a fair-price change by panel into stated willingness to pay, the country scaling and the income scaling. */
function priceSplit(id: 'fairLow' | 'fairHigh', prev: Persona[], cur: Persona[]): Effect[] {
  const key = id === 'fairLow' ? 'bargain' : 'expensive'
  const m = (people: Persona[], use: { place?: boolean; income?: boolean }) => median(people.map((p) => priceAnswersWith(p, use)[key]))
  const none = m(cur, { place: false, income: false }) - m(prev, { place: false, income: false })
  const place = m(cur, { income: false }) - m(prev, { income: false }) - none
  const income = m(cur, {}) - m(prev, {}) - none - place
  return [
    { kind: 'price-wtp', label: 'What people say they would pay', value: none, measured: true, text: `The new people’s stated willingness to pay and pain, before any country or income scaling: ${formatChange('usd', none)}.` },
    { kind: 'price-place', label: 'Country scaling', value: place, measured: true, text: `The price rule scales by country (Indonesia, India, the Philippines and Nigeria ×0.45; Brazil, Mexico, South Africa ×0.6; Spain ×0.85). The new country mix through that scaling: ${formatChange('usd', place)}.` },
    { kind: 'price-income', label: 'Income scaling', value: income, measured: true, text: `Low income ×0.8, high ×1.25. The new income mix through that scaling: ${formatChange('usd', income)}.` },
  ]
}

const cache = new Map<number, RunChange>()

/** What changed between a run and the one before it, with every headline's causes. */
export function runChange(version: number): RunChange | null {
  const decl = RUN_CHANGES.find((d) => d.version === version)
  if (!decl) return null
  const hit = cache.get(version)
  if (hit) return hit
  const prevRun = runOf(decl.previous)
  const curRun = runOf(version)
  const prevPeople = peopleOf(prevRun)
  const curPeople = peopleOf(curRun)
  const headlines = headlinesOf(curRun).map((id) => headlineChange(id, prevRun, curRun, decl))
  const prevOffers = offersOf(decl.previous)
  const samePeople = prevRun.generator === curRun.generator ? curPeople.filter((p) => prevPeople.some((q) => q.id === p.id)).length : 0
  const indo = (ps: Persona[]) => ps.filter((p) => p.country === 'Indonesia').length / ps.length
  const panel = {
    prevSize: prevPeople.length,
    curSize: curPeople.length,
    prevSeed: prevRun.panel.seed,
    curSeed: curRun.panel.seed,
    prevGenerator: prevRun.generator,
    curGenerator: curRun.generator,
    samePeople,
    prevPlace: meanPlace(prevPeople),
    curPlace: meanPlace(curPeople),
    prevScaled: scaledShare(prevPeople),
    curScaled: scaledShare(curPeople),
    prevIndonesia: indo(prevPeople),
    curIndonesia: indo(curPeople),
  }
  const mix = mixDiffs(prevPeople, curPeople)
  const notLikeForLike = [...new Set(headlines.filter((h) => h.warning).map((h) => sideOf(h.id)))].map((s) => {
    const a = s === 'A' ? (prevOffers.a ?? prevOffers.b) : prevOffers.b
    const b = s === 'A' ? (decl.offers.a ?? decl.offers.b) : decl.offers.b
    return `${s} is not the same offer: in v${decl.previous} it was “${a}”; in v${version} it is “${b}”. A rise or fall in ${s} compares two different products, not a trend.`
  })
  const tryB = headlines.find((h) => h.id === 'tryB')!
  const fair = headlines.find((h) => h.id === 'fairHigh')!
  const lead = (h: HeadlineChange) => {
    const s = [...h.steps].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0]
    return h.measured && s ? `${s.label.toLowerCase()} (${formatChange(h.unit, s.value)})` : 'everything that changed at once (not separable)'
  }
  const summary = [
    `What was tested: v${decl.previous} showed ${prevOffers.a ? `A “${prevOffers.a}” and B “${prevOffers.b}”` : `“${prevOffers.b}”`}; v${version} shows ${decl.offers.a ? `A “${decl.offers.a}” and B “${decl.offers.b}”` : `“${decl.offers.b}”`}.`,
    `Who was asked: ${panel.prevSize} → ${panel.curSize} people (seed ${panel.prevSeed} → ${panel.curSeed}, generator ${panel.prevGenerator} → ${panel.curGenerator})${samePeople ? `; ${samePeople} are the same people` : ''}.${mix.length ? ` Biggest shifts: ${mix.slice(0, 3).map((d) => `${d.group} ${pct(d.prev)} → ${pct(d.cur)}`).join(', ')}.` : ''}`,
    `The rules: ${decl.rules.note}`,
    `Would try B ${formatChange('share', tryB.delta)}, mostly from ${lead(tryB)}. Fair price, high end ${formatChange('usd', fair.delta)}, mostly from ${lead(fair)}.`,
    decl.reproducible ? 'Measured by replaying: the steps add up exactly to each change.' : `Not measured: v${decl.previous}${decl.previous <= 3 ? ' was written by hand' : ''} and cannot be replayed, so causes come from the documented differences.`,
  ]
  const out: RunChange = { version, previous: decl.previous, declaration: decl, prevOffers, mix, panel, headlines, notLikeForLike, summary }
  cache.set(version, out)
  return out
}

/** Every transition, oldest first. */
export const allRunChanges = (): RunChange[] => RUN_CHANGES.map((d) => runChange(d.version)!)

/** The tile line: "vs v6: +58 pts" for a run's headline, or null for the first run. */
export function headlineDelta(version: number, id: HeadlineId): HeadlineChange | null {
  return runChange(version)?.headlines.find((h) => h.id === id) ?? null
}

/**
 * The headline behind a Report metrics trend row (buyer-try-v6, buyer-pay-v7,
 * buyer-fair-v5), so its drawer can show why the number moved. Test 6's
 * "would try" leads with the free app (A); every other test with B.
 */
export function trendHeadline(metricId: string): { version: number; previous: number; id: HeadlineId } | null {
  const m = /^buyer-(try|pay|fair)-v(\d+)$/.exec(metricId)
  if (!m) return null
  const version = Number(m[2])
  const c = runChange(version)
  if (!c) return null
  const id: HeadlineId = m[1] === 'fair' ? 'fairHigh' : m[1] === 'try' ? (version === 6 ? 'tryA' : 'tryB') : 'payB'
  return { version, previous: c.previous, id }
}
