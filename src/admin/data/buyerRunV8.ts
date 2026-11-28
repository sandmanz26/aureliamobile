import { APP_PLUS, withQuickWins } from './buyerPlay'
import { RUN_V7, v7A } from './buyerRunV7'
import { V8_CHANGE } from './runChanges'
import { DIMENSIONS, DIMENSION_LABEL, conditionForBuyer, conditionsV4, type BuyerCondition, type ConditionV4, type Dimension } from './personaConditionV4'
import { flipForIssue } from './personaIdentityV4'
import { generatePersonasV4, type PersonaV4 } from './personasV4'
import { personFlip } from './stateFlipFormulas'
import { severityOf } from './stateFlipSleep'
import { stateFlipById } from './stateFlips'

/**
 * Buyer agent test 8 (U147, J206), the business owner's B4: a rules-based
 * run on persona set v4 (1,000 people; the 25 risk-flagged left out, they
 * get "Need help now?" and never an offer). Each person is read through
 * conditionForBuyer (need, urgency, readiness, scepticism, time) and the
 * StateFlip matched to their main need (flipForIssue).
 *
 * A = v7's best offer: v6's best offer for the person's channel plus the
 *     Insight-Timer-style quick wins. Everyone in set v4 came organically,
 *     so A is the same offer for all.
 * B = "A journey for your StateFlip X: free first week, then $10/month."
 *
 * Every formula is written out below (V8_RULES) and every person's answer
 * carries its own numbers, so a reader can redo any of them by hand.
 * A prediction from written rules, not a measurement.
 */

export const V8_VERSION = 8 as const
export const V8_DATE = '2026-11-27'
export const V8_PRICE = APP_PLUS.monthly

export const V8_OFFER_A = withQuickWins(v7A('organic'))
export const V8_OFFER_B_TEMPLATE = 'A journey for your StateFlip “X”: free first week, then $10/month'

export type V8Verdict = 'yes' | 'maybe' | 'no'
export type V8Objection = 'trust' | 'price' | 'time' | 'language' | 'fit'

export const V8_OBJECTION_LABEL: Record<V8Objection, string> = {
  trust: 'Does it work for me? (doubt)',
  price: '$10 a month is a lot for me',
  time: 'No time for a journey',
  language: 'Not in my language',
  fit: 'Not about my problem',
}

/** The constants of the rules, so the page and the tests read the same numbers. */
export const V8_K = {
  wNeed: 0.3,
  wUrgency: 0.2,
  wReady: 0.25,
  wFit: 0.25,
  wDoubt: 0.35,
  /** Fit: how well the offer names the person's own problem. */
  fitA: { physical: 0.45, mental: 0.45, other: 0.3 },
  fitB: 0.8,
  /** Under 5 minutes a day: a free library is easy to dip into, a journey asks for three chapters a week. */
  timeA: 0.05,
  timeB: 0.1,
  shortDay: 5,
  language: 0.1,
  tryYes: 0.35,
  tryMaybe: 0.22,
  /** Weight of the visible chance to reach the flip (B only). */
  wChance: 0.2,
  /** The chance counts in full when the flip is 8 weeks away or less, at 0.7 beyond. */
  nearWeeks: 8,
  farFactor: 0.7,
  priceMult: 6,
  priceCap: 0.3,
  /** A free core library is enough for some, so they never pay (A only). */
  freeEnoughA: 0.08,
  payYes: 0.45,
  payMaybe: 0.3,
} as const

export const V8_RULES: { label: string; formula: string }[] = [
  { label: 'Fit', formula: `A (a general library): ${V8_K.fitA.physical} when the main need is physical or mental, ${V8_K.fitA.other} otherwise. B (names their own StateFlip): ${V8_K.fitB}.` },
  { label: 'Try score', formula: `${V8_K.wNeed} × need/100 + ${V8_K.wUrgency} × urgency/100 + ${V8_K.wReady} × readiness + ${V8_K.wFit} × fit − ${V8_K.wDoubt} × scepticism/100 − time − language` },
  { label: 'Time', formula: `Only when they have under ${V8_K.shortDay} minutes a day: A ${V8_K.timeA}, B ${V8_K.timeB} (a journey asks for three chapters a week).` },
  { label: 'Language', formula: `${V8_K.language} when they need their own language (both offers are English only).` },
  { label: 'Would try', formula: `yes at ${V8_K.tryYes} or more, maybe at ${V8_K.tryMaybe} or more, otherwise no.` },
  { label: 'Pay score', formula: `try score + ${V8_K.wChance} × chance shown − price load − free enough (only for those who would try or might)` },
  { label: 'Chance shown', formula: `B only: their own chance to reach the flip (StateFlips formula: 54% × adherence × readiness × severity × fit) × (1 − scepticism/100), because a doubter discounts a promise; × ${V8_K.farFactor} if the flip is more than ${V8_K.nearWeeks} weeks away. A promises no outcome: 0.` },
  { label: 'Price load', formula: `min(${V8_K.priceCap}, $${V8_PRICE} ÷ monthly income × ${V8_K.priceMult})` },
  { label: 'Free enough', formula: `A only: ${V8_K.freeEnoughA} (the free core library is enough for some). B: 0, the free week ends.` },
  { label: 'Would pay', formula: `yes at ${V8_K.payYes} or more, maybe at ${V8_K.payMaybe} or more, otherwise no; never surer than would try (a maybe-tryer pays at most maybe).` },
  { label: 'Objection', formula: 'The largest of: doubt (0.35 × scepticism/100), price load, time, language, missing fit (0.25 × (1 − fit)).' },
]

export interface V8Side {
  fit: number
  tryScore: number
  tries: V8Verdict
  chanceShown: number
  payScore: number
  pays: V8Verdict
  objection: V8Objection
}

export interface V8Answer {
  personaId: string
  name: string
  country: string
  mainNeed: Dimension
  flipId: string
  flipTitle: string
  buyer: BuyerCondition
  /** Their own chance to reach the flip and the weeks it takes (StateFlips formulas, stage 1). */
  chance: number
  weeks: number
  priceLoad: number
  a: V8Side
  b: V8Side
  /** The numbers, written out. */
  why: string[]
}

const r2 = (x: number) => Math.round(x * 100) / 100
const verdict = (s: number, yes: number, maybe: number): V8Verdict => (s >= yes ? 'yes' : s >= maybe ? 'maybe' : 'no')

/** Which parts of B an offer has: A has none, B all three. Used to split B's effect into its parts. */
export interface V8Parts {
  /** Names their own StateFlip (fit B, and a journey's time ask). */
  named: boolean
  /** Shows their own chance to reach it. */
  chance: boolean
  /** The free part ends after a week (no free library to stay on). */
  freeWeek: boolean
}
export const PARTS_A: V8Parts = { named: false, chance: false, freeWeek: false }
export const PARTS_B: V8Parts = { named: true, chance: true, freeWeek: true }

function side(offer: 'A' | 'B' | V8Parts, p: PersonaV4, b: BuyerCondition, chance: number, weeks: number, priceLoad: number): V8Side {
  const K = V8_K
  const parts0 = offer === 'A' ? PARTS_A : offer === 'B' ? PARTS_B : offer
  const fit = parts0.named ? K.fitB : b.mainNeed === 'physical' || b.mainNeed === 'mental' ? K.fitA.physical : K.fitA.other
  const time = b.timeBudget < K.shortDay ? (parts0.named ? K.timeB : K.timeA) : 0
  const lang = p.language !== 'English' && !p.readsEnglish ? K.language : 0
  const doubt = K.wDoubt * (b.scepticism / 100)
  const tryScore = K.wNeed * (b.needIntensity / 100) + K.wUrgency * (b.urgency / 100) + K.wReady * b.readiness + K.wFit * fit - doubt - time - lang
  const tries = verdict(tryScore, K.tryYes, K.tryMaybe)
  const chanceShown = parts0.chance ? chance * (1 - b.scepticism / 100) * (weeks <= K.nearWeeks ? 1 : K.farFactor) : 0
  const free = parts0.freeWeek ? 0 : K.freeEnoughA
  const payScore = tryScore + K.wChance * chanceShown - priceLoad - free
  const raw = verdict(payScore, K.payYes, K.payMaybe)
  // Nobody pays more surely than they try: a maybe-tryer pays at most maybe.
  const pays: V8Verdict = tries === 'no' ? 'no' : tries === 'maybe' && raw === 'yes' ? 'maybe' : raw
  const parts: [V8Objection, number][] = [
    ['trust', doubt],
    ['price', priceLoad],
    ['time', time],
    ['language', lang],
    ['fit', 0.25 * (1 - fit)],
  ]
  const objection = parts.sort((x, y) => y[1] - x[1])[0][0]
  return { fit, tryScore: r2(tryScore), tries, chanceShown: r2(chanceShown), payScore: r2(payScore), pays, objection }
}

const priceLoadOf = (p: PersonaV4) => r2(Math.min(V8_K.priceCap, (V8_PRICE / Math.max(1, p.incomeUsdMonth)) * V8_K.priceMult))

function answerOf(p: PersonaV4, c: ConditionV4): V8Answer {
  const b = conditionForBuyer(p, c)
  const flipId = flipForIssue(c)
  const flip = stateFlipById(flipId)
  const start = c.dims[c.mainNeed].score
  const pf = personFlip(p, c, start, severityOf(start))
  const priceLoad = priceLoadOf(p)
  const chance = r2(pf.chance.chance)
  const weeks = Math.round(pf.weeks * 10) / 10
  const a = side('A', p, b, chance, weeks, priceLoad)
  const bb = side('B', p, b, chance, weeks, priceLoad)
  return {
    personaId: p.id,
    name: p.name,
    country: p.country,
    mainNeed: c.mainNeed,
    flipId,
    flipTitle: flip?.title ?? flipId,
    buyer: b,
    chance,
    weeks,
    priceLoad,
    a,
    b: bb,
    why: [
      ...b.why,
      `Main need ${DIMENSION_LABEL[c.mainNeed].toLowerCase()} → StateFlip ${flipId}${flip ? ` (${flip.title})` : ''}; own chance ${Math.round(chance * 100)}%, about ${Math.round(weeks)} weeks to the flip`,
      `Try A = ${a.tryScore} (fit ${a.fit}) → ${a.tries}; try B = ${bb.tryScore} (fit ${bb.fit}) → ${bb.tries}`,
      `Price load = min(${V8_K.priceCap}, $${V8_PRICE} ÷ $${p.incomeUsdMonth} × ${V8_K.priceMult}) = ${priceLoad}`,
      `Pay A = ${a.tryScore} − ${priceLoad} − ${V8_K.freeEnoughA} = ${a.payScore} → ${a.pays}; pay B = ${bb.tryScore} + ${V8_K.wChance} × ${bb.chanceShown} (chance after doubt) − ${priceLoad} = ${bb.payScore} → ${bb.pays}`,
    ],
  }
}

/**
 * B's effect on "would pay" split into its three parts, adding them one at a
 * time on the same people: A → + names their StateFlip → + shows their chance
 * → + free week instead of a free library (= B). The steps add up exactly to
 * B − A. The order is fixed and said, so the split is reproducible.
 */
export function v8Split(): { label: string; payYes: number; paid: number; step: number }[] {
  const ps = new Map(generatePersonasV4().map((p) => [p.id, p]))
  const cs = conditionsV4()
  const steps: [string, V8Parts][] = [
    ['A: v7’s best offer', PARTS_A],
    ['+ names their own StateFlip', { named: true, chance: false, freeWeek: false }],
    ['+ shows their own chance to reach it', { named: true, chance: true, freeWeek: false }],
    ['+ free first week instead of a free library (= B)', PARTS_B],
  ]
  const rows = runV8().answers
  let prev = 0
  return steps.map(([label, parts], i) => {
    const sides = rows.map((r) => {
      const p = ps.get(r.personaId)!
      return side(parts, p, conditionForBuyer(p, cs.get(p.id)!), r.chance, r.weeks, r.priceLoad)
    })
    const c = count(sides.map((x) => x.pays))
    const paid = expectedPaid(c)
    const step = i === 0 ? 0 : paid - prev
    prev = paid
    return { label, payYes: c.yes, paid, step }
  })
}

let CACHE: { answers: V8Answer[]; excluded: number; total: number } | undefined

/** Plays every v4 persona who is not risk-flagged against A and B. */
export function runV8() {
  if (CACHE) return CACHE
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const answers: V8Answer[] = []
  let excluded = 0
  for (const p of ps) {
    const c = cs.get(p.id)!
    if (c.excluded) {
      excluded++
      continue
    }
    answers.push(answerOf(p, c))
  }
  return (CACHE = { answers, excluded, total: ps.length })
}

export interface V8Count {
  yes: number
  maybe: number
  no: number
}
const count = (xs: V8Verdict[]): V8Count => ({ yes: xs.filter((x) => x === 'yes').length, maybe: xs.filter((x) => x === 'maybe').length, no: xs.filter((x) => x === 'no').length })
/** Expected paid plans: yes counts 1, maybe ½ (the same rule as tests 5–7). */
export const expectedPaid = (c: V8Count) => c.yes + c.maybe / 2

export interface V8DimRow {
  dimension: Dimension
  label: string
  n: number
  tryA: number
  tryB: number
  payA: number
  payB: number
  topObjectionB: V8Objection | null
  topObjectionCount: number
}

function topObjection(rows: V8Answer[], key: 'a' | 'b'): [V8Objection, number] | null {
  const m = new Map<V8Objection, number>()
  for (const r of rows) if (r[key].pays !== 'yes') m.set(r[key].objection, (m.get(r[key].objection) ?? 0) + 1)
  return [...m.entries()].sort((x, y) => y[1] - x[1])[0] ?? null
}

/** Every headline, computed from the answers (never typed). */
export function v8Tallies() {
  const { answers, excluded, total } = runV8()
  const n = answers.length
  const tryA = count(answers.map((x) => x.a.tries))
  const tryB = count(answers.map((x) => x.b.tries))
  const payA = count(answers.map((x) => x.a.pays))
  const payB = count(answers.map((x) => x.b.pays))
  const dims: V8DimRow[] = DIMENSIONS.map((d) => {
    const rows = answers.filter((x) => x.mainNeed === d)
    const top = topObjection(rows, 'b')
    return {
      dimension: d,
      label: DIMENSION_LABEL[d],
      n: rows.length,
      tryA: rows.filter((x) => x.a.tries === 'yes').length,
      tryB: rows.filter((x) => x.b.tries === 'yes').length,
      payA: rows.filter((x) => x.a.pays === 'yes').length,
      payB: rows.filter((x) => x.b.pays === 'yes').length,
      topObjectionB: top?.[0] ?? null,
      topObjectionCount: top?.[1] ?? 0,
    }
  })
  const objections = (key: 'a' | 'b') => {
    const m = new Map<V8Objection, number>()
    for (const r of answers) if (r[key].pays !== 'yes') m.set(r[key].objection, (m.get(r[key].objection) ?? 0) + 1)
    return [...m.entries()].sort((x, y) => y[1] - x[1])
  }
  const order: V8Verdict[] = ['no', 'maybe', 'yes']
  const up = answers.filter((x) => order.indexOf(x.b.pays) > order.indexOf(x.a.pays))
  const down = answers.filter((x) => order.indexOf(x.b.pays) < order.indexOf(x.a.pays))
  const tryUp = answers.filter((x) => order.indexOf(x.b.tries) > order.indexOf(x.a.tries))
  const tryDown = answers.filter((x) => order.indexOf(x.b.tries) < order.indexOf(x.a.tries))
  const meanChance = answers.reduce((s, x) => s + x.chance, 0) / n
  const flipsUsed = new Set(answers.map((x) => x.flipId)).size
  return {
    total,
    excluded,
    n,
    tryA,
    tryB,
    payA,
    payB,
    paidA: expectedPaid(payA),
    paidB: expectedPaid(payB),
    dims,
    objectionsA: objections('a'),
    objectionsB: objections('b'),
    payUp: up,
    payDown: down,
    tryUp,
    tryDown,
    meanChance,
    flipsUsed,
  }
}

const pct = (k: number, n: number) => `${Math.round((k / n) * 100)}%`

/** The headline findings, in plain words, from the tallies. */
export function v8Findings(): string[] {
  const x = v8Tallies()
  const best = [...x.dims].sort((a, b) => b.payB / Math.max(1, b.n) - b.payA / Math.max(1, b.n) - (a.payB / Math.max(1, a.n) - a.payA / Math.max(1, a.n)))[0]
  const topB = x.objectionsB[0]
  const topA = x.objectionsA[0]
  return [
    `Prediction on ${x.n} people (set v4, ${x.excluded} risk-flagged left out): would try A ${x.tryA.yes} (${pct(x.tryA.yes, x.n)}) → B ${x.tryB.yes} (${pct(x.tryB.yes, x.n)}); would pay A ${x.payA.yes} → B ${x.payB.yes} yes; expected paid plans (yes 1, maybe ½) ${x.paidA} → ${x.paidB}.`,
    `Why B moves answers: it names the person’s own StateFlip (fit ${V8_K.fitA.other}–${V8_K.fitA.physical} → ${V8_K.fitB}) and shows their own chance to reach it (average ${Math.round(x.meanChance * 100)}%), and the free week ends, so the free library no longer replaces paying. ${x.payUp.length} people pay more readily on B, ${x.payDown.length} less.`,
    `By dimension, B gains most for ${best.label.toLowerCase()} (${best.payA} → ${best.payB} of ${best.n} would pay): a general library fits that need least.`,
    `Top objection to B among those who would not pay: ${topB ? `${V8_OBJECTION_LABEL[topB[0]].toLowerCase()} (${topB[1]})` : 'none'}; for A it was ${topA ? `${V8_OBJECTION_LABEL[topA[0]].toLowerCase()} (${topA[1]})` : 'none'}. A specific promise does not answer doubt; only a real result does.`,
    x.tryDown.length
      ? `B loses ${x.tryDown.length} who would have tried A: people with under ${V8_K.shortDay} minutes a day, for whom a journey of three chapters a week asks too much.`
      : `Nobody tries B less than A: the extra time a journey asks (${V8_K.timeB} against ${V8_K.timeA}, only under ${V8_K.shortDay} minutes a day) is smaller than what naming their own StateFlip adds. Stated intent from rules, so read the size of the jump with care.`,
  ]
}

/* ------------------------------------------- What changed against test 7 */

/**
 * What changed and why, test 7 → test 8 (the declaration is V8_CHANGE in
 * runChanges.ts). A is v7's B again, so A is the like-for-like side: its
 * whole change is the panel and the rules together, which cannot be told
 * apart (set v4 cannot be played by v7's rules). B against A is on the same
 * people, so the offer effect is measured, and v8Split breaks it into parts.
 */
export function v8Change() {
  const x = v8Tallies()
  const v7n = RUN_V7.answers.length
  const v7try = RUN_V7.answers.filter((a) => a.tries === 'yes').length
  const v7pay = RUN_V7.answers.filter((a) => a.pays === 'yes').length
  const split = v8Split()
  return {
    declaration: V8_CHANGE,
    v7: { n: v7n, tries: v7try, pays: v7pay },
    split,
    lines: [
      `What was tested: test 7 showed A “v6’s best offer for each channel” and B “the same + quick wins”; test 8 shows A = test 7’s B, and B “${V8_OFFER_B_TEMPLATE}”.`,
      `Who was asked: ${V8_CHANGE.panel.note}`,
      `The rules: ${V8_CHANGE.rules.note}`,
      `Same offer, different panel and rules: would try ${v7try} of ${v7n} (${pct(v7try, v7n)}) in test 7 → ${x.tryA.yes} of ${x.n} (${pct(x.tryA.yes, x.n)}) for A in test 8. Not separable: the drop is the new people and the new rules together (set v4 reads need, readiness and doubt that generator 2 did not have).`,
      `Different offer, same people (measured): expected paid plans ${x.paidA} → ${x.paidB}; ${split.slice(1).map((s) => `${s.label.replace(/^\+ /, '')} ${s.step >= 0 ? '+' : '−'}${Math.abs(s.step)}`).join(', ')}. The steps add up to the change.`,
    ],
  }
}
