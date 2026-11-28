import { personalChapter, type ChapterPrefs, type PersonalChapter, type Regulation } from './akpAssembly'
import { V8_K, V8_OBJECTION_LABEL, V8_PRICE, expectedPaid, runV8, type V8Count, type V8Objection, type V8Verdict } from './buyerRunV8'
import { V9_CHANGE } from './runChanges'
import { DIMENSIONS, DIMENSION_LABEL, conditionForBuyer, conditionsV4, sessionMinutesOf, type BuyerCondition, type Dimension } from './personaConditionV4'
import { identitiesV4, type Archetype, type IdentityV4 } from './personaIdentityV4'
import { generatePersonasV4, type PersonaV4 } from './personasV4'

/**
 * Buyer agent test 9 (U150, J208): a rules-based run on persona set v4 (the
 * 975 who are not risk-flagged, as in test 8).
 *
 * A = test 8's B: "A journey for your StateFlip X: free first week, then
 *     $10/month". Played by test 8's own rules, so A here is exactly test 8's
 *     B, person by person (tested).
 * B = the same journey, but the offer shows the person their first chapter,
 *     assembled from AKPs matched to their Wellness Identity and condition
 *     (akpAssembly.ts personalChapter): "Your first chapter: 4-7-8 breathing,
 *     warm low voice at 110 words a minute, 55 BPM tanpura drone, warm amber
 *     colours, 10 min." Same price, same free week.
 *
 * What the preview can change, each written out in V9_RULES:
 * - fit: their StateFlip named (0.8) → named and the chapter matched to them (0.9);
 * - doubt: a concrete chapter can be judged before it is trusted, so the
 *   scepticism term shrinks by 20% (5% for people who distrust AI);
 * - time: the preview states their own length, so the "journey asks too much"
 *   load for people with under 5 minutes a day falls to a library's (0.05);
 * - put-off: people who distrust AI read "picked for you" as automation (0.03).
 * A prediction from written rules, not a measurement.
 */

export const V9_VERSION = 9 as const
export const V9_DATE = '2026-11-28'
export const V9_OFFER_A = 'Test 8’s B: a journey for your StateFlip X, free first week, then $10/month'
export const V9_OFFER_B_TEMPLATE = 'The same journey, showing your first chapter built for you: “Your first chapter: technique, voice, music, colours, minutes”; free first week, then $10/month'

export type V9Objection = V8Objection | 'style'
export const V9_OBJECTION_LABEL: Record<V9Objection, string> = { ...V8_OBJECTION_LABEL, style: '“Picked for me by an AI” feels automated' }

export const V9_K = {
  fitPreview: 0.9,
  doubtCut: 0.2,
  doubtCutDistrustful: 0.05,
  putOff: 0.03,
} as const

export const V9_RULES: { label: string; formula: string }[] = [
  { label: 'A', formula: 'Test 8’s B with test 8’s rules, unchanged (buyerRunV8.ts V8_RULES).' },
  { label: 'Fit (B)', formula: `${V8_K.fitB} → ${V9_K.fitPreview}: the StateFlip is named and the first chapter is matched to their voice, tempo, colour and regulation style.` },
  { label: 'Doubt (B)', formula: `${V8_K.wDoubt} × scepticism/100 × (1 − ${V9_K.doubtCut}); × (1 − ${V9_K.doubtCutDistrustful}) for people who distrust AI. A concrete chapter can be judged before it is trusted.` },
  { label: 'Time (B)', formula: `Under ${V8_K.shortDay} minutes a day: ${V8_K.timeB} → ${V8_K.timeA} when the chapter shown is no longer than their daily time (it always is: the length is theirs).` },
  { label: 'Put-off (B)', formula: `${V9_K.putOff} for people who distrust AI: “picked for you” reads as automation. Counted as the objection “${V9_OBJECTION_LABEL.style}”.` },
  { label: 'Try, pay, chance, price', formula: 'As test 8: try score, would try at 0.35 / 0.22, pay score = try + 0.2 × chance shown − price load, would pay at 0.45 / 0.3, never surer than would try.' },
]

/** Which parts of B an offer has: A none, B all three. The split adds them in this order. */
export interface V9Parts {
  matched: boolean
  judged: boolean
  length: boolean
}
export const V9_PARTS_A: V9Parts = { matched: false, judged: false, length: false }
export const V9_PARTS_B: V9Parts = { matched: true, judged: true, length: true }

export interface V9Side {
  fit: number
  tryScore: number
  tries: V8Verdict
  chanceShown: number
  payScore: number
  pays: V8Verdict
  objection: V9Objection
}

export interface V9Answer {
  personaId: string
  name: string
  country: string
  mainNeed: Dimension
  archetype: Archetype
  flipId: string
  flipTitle: string
  chapter: PersonalChapter
  a: V9Side
  b: V9Side
  why: string[]
}

const r2 = (x: number) => Math.round(x * 100) / 100
const verdict = (s: number, yes: number, maybe: number): V8Verdict => (s >= yes ? 'yes' : s >= maybe ? 'maybe' : 'no')

/** The person's chapter preferences, read from their identity (personaIdentityV4's own words). */
export function prefsOf(id: IdentityV4, dimension: Dimension, minutes: number): ChapterPrefs {
  const pref = id.dims.preferences
  const voice = /chapters, (.+) voice$/.exec(pref.value)?.[1] ?? 'clear, mid-range'
  const tempo = /Tempo ([^;]+);/.exec(pref.detail)?.[1] ?? '60–72 bpm'
  const palette = /palette ([^;]+);/.exec(pref.detail)?.[1] ?? ''
  return {
    dimension, voice, tempo, palette, minutes, regulation: id.dims.regulation.value as Regulation,
    noBreathHolds: id.flags.some((f) => f.startsWith('no breath holds')), secularOnly: id.spiritual === 'secular only',
  }
}

function side(parts: V9Parts, p: PersonaV4, b: BuyerCondition, minutes: number, chance: number, weeks: number, priceLoad: number): V9Side {
  const K = V8_K
  const distrust = p.aiAttitude === 'distrustful'
  const fit = parts.matched ? V9_K.fitPreview : K.fitB
  const putOff = parts.matched && distrust ? V9_K.putOff : 0
  const short = b.timeBudget < K.shortDay
  const time = short ? (parts.length && minutes <= Math.max(b.timeBudget, 3) ? K.timeA : K.timeB) : 0
  const lang = p.language !== 'English' && !p.readsEnglish ? K.language : 0
  const doubt = K.wDoubt * (b.scepticism / 100) * (parts.judged ? 1 - (distrust ? V9_K.doubtCutDistrustful : V9_K.doubtCut) : 1)
  const tryScore = K.wNeed * (b.needIntensity / 100) + K.wUrgency * (b.urgency / 100) + K.wReady * b.readiness + K.wFit * fit - doubt - time - lang - putOff
  const tries = verdict(tryScore, K.tryYes, K.tryMaybe)
  const chanceShown = chance * (1 - b.scepticism / 100) * (weeks <= K.nearWeeks ? 1 : K.farFactor)
  const payScore = tryScore + K.wChance * chanceShown - priceLoad
  const raw = verdict(payScore, K.payYes, K.payMaybe)
  const pays: V8Verdict = tries === 'no' ? 'no' : tries === 'maybe' && raw === 'yes' ? 'maybe' : raw
  const terms: [V9Objection, number][] = [
    ['trust', doubt],
    ['price', priceLoad],
    ['time', time],
    ['language', lang],
    ['fit', 0.25 * (1 - fit)],
    ['style', putOff],
  ]
  const objection = terms.sort((x, y) => y[1] - x[1])[0][0]
  return { fit, tryScore: r2(tryScore), tries, chanceShown: r2(chanceShown), payScore: r2(payScore), pays, objection }
}

interface Ctx {
  p: PersonaV4
  b: BuyerCondition
  minutes: number
  chance: number
  weeks: number
  priceLoad: number
}

let CACHE: { answers: V9Answer[]; ctx: Map<string, Ctx>; excluded: number; total: number } | undefined

/** Plays the same 975 people as test 8 against A (test 8's B) and B (with the first-chapter preview). */
export function runV9() {
  if (CACHE) return CACHE
  const v8 = runV8()
  const ps = new Map(generatePersonasV4().map((p) => [p.id, p]))
  const cs = conditionsV4()
  const ids = identitiesV4()
  const ctx = new Map<string, Ctx>()
  const answers = v8.answers.map((r8): V9Answer => {
    const p = ps.get(r8.personaId)!
    const c = cs.get(p.id)!
    const id = ids.get(p.id)!
    const b = conditionForBuyer(p, c)
    const minutes = sessionMinutesOf(c.minutesPerDay)
    const chapter = personalChapter(r8.flipId, prefsOf(id, c.mainNeed, minutes))
    const x: Ctx = { p, b, minutes, chance: r8.chance, weeks: r8.weeks, priceLoad: r8.priceLoad }
    ctx.set(p.id, x)
    const a = side(V9_PARTS_A, p, b, minutes, x.chance, x.weeks, x.priceLoad)
    const bb = side(V9_PARTS_B, p, b, minutes, x.chance, x.weeks, x.priceLoad)
    return {
      personaId: p.id, name: p.name, country: p.country, mainNeed: c.mainNeed, archetype: id.archetype, flipId: r8.flipId, flipTitle: r8.flipTitle, chapter, a, b: bb,
      why: [
        `StateFlip ${r8.flipId} (${r8.flipTitle}); own chance ${Math.round(r8.chance * 100)}%, about ${Math.round(r8.weeks)} weeks`,
        `B shows: ${chapter.preview}`,
        `Matched on: ${chapter.pieces.map((q) => `${q.role} ${q.akp.id} (${q.matched})`).join('; ')}`,
        `Try A = ${a.tryScore} (fit ${a.fit}) → ${a.tries}; try B = ${bb.tryScore} (fit ${bb.fit}${p.aiAttitude === 'distrustful' ? `, put-off ${V9_K.putOff}` : ''}) → ${bb.tries}`,
        `Pay A = ${a.payScore} → ${a.pays}; pay B = ${bb.tryScore} + ${V8_K.wChance} × ${bb.chanceShown} − ${x.priceLoad} = ${bb.payScore} → ${bb.pays}`,
      ],
    }
  })
  return (CACHE = { answers, ctx, excluded: v8.excluded, total: v8.total })
}

const count = (xs: V8Verdict[]): V8Count => ({ yes: xs.filter((x) => x === 'yes').length, maybe: xs.filter((x) => x === 'maybe').length, no: xs.filter((x) => x === 'no').length })
const ORDER: V8Verdict[] = ['no', 'maybe', 'yes']

export interface V9GroupRow {
  key: string
  label: string
  n: number
  tryA: number
  tryB: number
  payA: number
  payB: number
  topObjectionB: V9Objection | null
  topObjectionCount: number
}

function objectionsOf(rows: V9Answer[], key: 'a' | 'b'): [V9Objection, number][] {
  const m = new Map<V9Objection, number>()
  for (const r of rows) if (r[key].pays !== 'yes') m.set(r[key].objection, (m.get(r[key].objection) ?? 0) + 1)
  return [...m.entries()].sort((x, y) => y[1] - x[1])
}

function group(rows: V9Answer[], key: string, label: string): V9GroupRow {
  const top = objectionsOf(rows, 'b')[0]
  return {
    key, label, n: rows.length,
    tryA: rows.filter((x) => x.a.tries === 'yes').length, tryB: rows.filter((x) => x.b.tries === 'yes').length,
    payA: rows.filter((x) => x.a.pays === 'yes').length, payB: rows.filter((x) => x.b.pays === 'yes').length,
    topObjectionB: top?.[0] ?? null, topObjectionCount: top?.[1] ?? 0,
  }
}

const ARCHETYPES: Archetype[] = ['Explorer', 'Caregiver', 'Achiever', 'Seeker', 'Rebuilder', 'Guardian']

/** Every headline, computed from the answers. */
export function v9Tallies() {
  const { answers, excluded, total } = runV9()
  const n = answers.length
  const payA = count(answers.map((x) => x.a.pays))
  const payB = count(answers.map((x) => x.b.pays))
  const tryA = count(answers.map((x) => x.a.tries))
  const tryB = count(answers.map((x) => x.b.tries))
  return {
    total, excluded, n, tryA, tryB, payA, payB,
    paidA: expectedPaid(payA), paidB: expectedPaid(payB),
    dims: DIMENSIONS.map((d) => group(answers.filter((x) => x.mainNeed === d), d, DIMENSION_LABEL[d])),
    archetypes: ARCHETYPES.map((k) => group(answers.filter((x) => x.archetype === k), k, k)).filter((g) => g.n),
    objectionsA: objectionsOf(answers, 'a'),
    objectionsB: objectionsOf(answers, 'b'),
    payUp: answers.filter((x) => ORDER.indexOf(x.b.pays) > ORDER.indexOf(x.a.pays)),
    payDown: answers.filter((x) => ORDER.indexOf(x.b.pays) < ORDER.indexOf(x.a.pays)),
    tryUp: answers.filter((x) => ORDER.indexOf(x.b.tries) > ORDER.indexOf(x.a.tries)),
    tryDown: answers.filter((x) => ORDER.indexOf(x.b.tries) < ORDER.indexOf(x.a.tries)),
    distinctPreviews: new Set(answers.map((x) => x.chapter.preview)).size,
    akpsUsed: new Set(answers.flatMap((x) => x.chapter.pieces.map((q) => q.akp.id))).size,
  }
}

/** B's effect split into its parts on the same people: A → + matched → + can be judged → + their own length (= B). */
export function v9Split(): { label: string; payYes: number; paid: number; step: number }[] {
  const { answers, ctx } = runV9()
  const steps: [string, V9Parts][] = [
    ['A: test 8’s B', V9_PARTS_A],
    ['+ the chapter is matched to them (fit, and the AI put-off)', { matched: true, judged: false, length: false }],
    ['+ they can judge it before trusting it (less doubt)', { matched: true, judged: true, length: false }],
    ['+ it shows their own length (= B)', V9_PARTS_B],
  ]
  let prev = 0
  return steps.map(([label, parts], i) => {
    const c = count(answers.map((r) => {
      const x = ctx.get(r.personaId)!
      return side(parts, x.p, x.b, x.minutes, x.chance, x.weeks, x.priceLoad).pays
    }))
    const paid = expectedPaid(c)
    const step = i === 0 ? 0 : paid - prev
    prev = paid
    return { label, payYes: c.yes, paid, step }
  })
}

const pct = (k: number, n: number) => `${Math.round((k / Math.max(1, n)) * 100)}%`
const rate = (g: V9GroupRow) => (g.payB - g.payA) / Math.max(1, g.n)

/** The headline findings, in plain words, from the tallies. */
export function v9Findings(): string[] {
  const x = v9Tallies()
  const bestD = [...x.dims].sort((a, b) => rate(b) - rate(a))[0]
  const bestA = [...x.archetypes].sort((a, b) => rate(b) - rate(a))[0]
  const worstA = [...x.archetypes].sort((a, b) => rate(a) - rate(b))[0]
  const topB = x.objectionsB[0]
  const style = x.objectionsB.find(([k]) => k === 'style')?.[1] ?? 0
  return [
    `Prediction on ${x.n} people (set v4, ${x.excluded} risk-flagged left out): would try A ${x.tryA.yes} (${pct(x.tryA.yes, x.n)}) → B ${x.tryB.yes} (${pct(x.tryB.yes, x.n)}); would pay A ${x.payA.yes} → B ${x.payB.yes}; expected paid plans (yes 1, maybe ½) ${x.paidA} → ${x.paidB}.`,
    `Why B moves answers: the offer stops being a promise and becomes a chapter they can picture, built from ${x.akpsUsed} catalogue AKPs into ${x.distinctPreviews} different previews. Fit rises (${V8_K.fitB} → ${V9_K.fitPreview}), doubt shrinks by a fifth, and people short of time see their own length. ${x.payUp.length} people pay more readily on B, ${x.payDown.length} less.`,
    `By dimension, B gains most for ${bestD.label.toLowerCase()} (${bestD.payA} → ${bestD.payB} of ${bestD.n}). By archetype, most for ${bestA.label} (${bestA.payA} → ${bestA.payB} of ${bestA.n}), least for ${worstA.label} (${worstA.payA} → ${worstA.payB} of ${worstA.n}).`,
    `Top objection to B among those who would not pay: ${topB ? `${V9_OBJECTION_LABEL[topB[0]].toLowerCase()} (${topB[1]})` : 'none'}. ${style ? `${style} people who distrust AI now name “picked for me by an AI” first.` : 'Nobody names the AI put-off first: it is smaller than their other doubts.'} The preview answers part of the doubt; it does nothing about price, which did not change.`,
    `Stated intent from written rules: the size of the preview's effect is our assumption (fit +0.1, doubt −20%), not a measurement. A real test shows half the visitors the preview.`,
  ]
}

/** What changed and why, test 8 → test 9 (V9_CHANGE in runChanges.ts). */
export function v9Change() {
  const x = v9Tallies()
  const split = v9Split()
  return {
    declaration: V9_CHANGE,
    split,
    lines: [
      `What was tested: test 8 showed A “v7’s best offer” and B “a journey for your StateFlip X, free first week, then $10/month”; test 9 shows A = test 8’s B and B = the same journey with the person’s own first chapter, assembled from AKPs.`,
      `Who was asked: ${V9_CHANGE.panel.note}`,
      `The rules: ${V9_CHANGE.rules.note}`,
      `Same offer, same people, same rules: A in test 9 is test 8’s B person by person (would pay ${x.payA.yes} of ${x.n} in both), so the whole difference below is the preview.`,
      `Different offer, same people (measured): expected paid plans ${x.paidA} → ${x.paidB}; ${split.slice(1).map((s) => `${s.label.replace(/^\+ /, '').replace(/ \(.*\)$/, '')} ${s.step >= 0 ? '+' : '−'}${Math.abs(s.step)}`).join(', ')}. The steps add up to the change.`,
    ],
  }
}

export { V8_PRICE as V9_PRICE }
