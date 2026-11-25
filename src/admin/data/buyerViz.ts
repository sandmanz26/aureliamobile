import { THEME_LABEL, type BuyerAnswer, type Theme, type Verdict } from './buyerRuns'
import { APP_PLUS, byId2 } from './buyerPlay'
import { RUN_V3, V3_CHANGES } from './buyerRunV3'
import { RUN_V5 } from './buyerRunV5'
import { RUN_V6, V6_CHANGES } from './buyerRunV6'
import { RUN_V7 } from './buyerRunV7'
import type { Persona } from './personas'

/*
 * The buyer agent report's charts (U130, J183), as data. Every figure here
 * is counted from the run modules' answers; nothing is typed. All of it is
 * about simulated people: a prediction, never a measurement.
 */

export type VizTestId = 'v5' | 'v6' | 'v7'

/** One answer as a chart reads it: the verdicts on the offer the test led with. */
export interface VizRow {
  personaId: string
  persona: Persona
  tries: Verdict
  pays: Verdict
  /** null when the test did not ask it for this offer. */
  day30: Verdict | null
  answer: BuyerAnswer
}

export interface VizTest {
  id: VizTestId
  label: string
  /** The offer the test led with, in plain words. */
  offer: string
  rows: VizRow[]
}

const rowsOf = (answers: BuyerAnswer[], pick: (a: BuyerAnswer) => { tries: Verdict; pays: Verdict; day30: Verdict | null }): VizRow[] =>
  answers.map((a) => ({ personaId: a.personaId, persona: byId2(a.personaId), answer: a, ...pick(a) }))

/** Tests 5–7 on the offer each led with (the same choice as the success trend). */
export function vizTests(): VizTest[] {
  return [
    { id: 'v5', label: 'Test 5', offer: `Today’s app at $${APP_PLUS.monthly} a month`, rows: rowsOf(RUN_V5.answers, (a) => ({ tries: a.tries, pays: a.pays, day30: a.day30 ?? null })) },
    // Test 6 led with plain freemium (its offer A); day 30 was only asked of the retreat.
    { id: 'v6', label: 'Test 6', offer: 'Today’s app, free to start', rows: rowsOf(RUN_V6.answers, (a) => ({ tries: a.control!.tries, pays: a.control!.pays, day30: null })) },
    { id: 'v7', label: 'Test 7', offer: 'Free to start, plus a free library', rows: rowsOf(RUN_V7.answers, (a) => ({ tries: a.tries, pays: a.pays, day30: a.day30 ?? null })) },
  ]
}

/* ---------------------------------------------------------------- Funnel */

export interface FunnelStep {
  key: 'saw' | 'tries' | 'pays' | 'day30'
  label: string
  /** null: not asked in this test. */
  count: number | null
  n: number
}

export function funnel(t: VizTest): FunnelStep[] {
  const n = t.rows.length
  const asked30 = t.rows.some((r) => r.day30 !== null)
  return [
    { key: 'saw', label: 'Saw it', count: n, n },
    { key: 'tries', label: 'Would try', count: t.rows.filter((r) => r.tries === 'yes').length, n },
    { key: 'pays', label: 'Would pay', count: t.rows.filter((r) => r.pays === 'yes').length, n },
    { key: 'day30', label: 'Still using at day 30', count: asked30 ? t.rows.filter((r) => r.day30 === 'yes').length : null, n },
  ]
}

/* ------------------------------------------------------------- Heat map */

export type SegmentKey = 'ageBand' | 'region' | 'condition' | 'found' | 'aiTrust'

export const SEGMENT_LABEL: Record<SegmentKey, string> = {
  ageBand: 'Age',
  region: 'Region',
  condition: 'Sleep / stress at the start',
  found: 'How they found Aurelia',
  aiTrust: 'Trust in AI',
}

const ORDER: Partial<Record<SegmentKey, string[]>> = {
  condition: ['mild', 'moderate', 'severe'],
  aiTrust: ['high', 'medium', 'low', 'none'],
  found: ['creator follower', 'organic', 'employer'],
}

export interface HeatCell {
  segment: SegmentKey
  value: string
  n: number
  tries: number
  pays: number
}

const valueOf = (r: VizRow, k: SegmentKey) => (k === 'ageBand' || k === 'region' ? r.persona[k] : (r.answer.vars?.[k] ?? '–'))

/** Who would try and who would pay (yes), per segment value; only the segments the test recorded. */
export function heat(t: VizTest): HeatCell[] {
  const keys = (Object.keys(SEGMENT_LABEL) as SegmentKey[]).filter((k) => k === 'ageBand' || k === 'region' || t.rows.some((r) => r.answer.vars?.[k]))
  return keys.flatMap((k) => {
    const m = new Map<string, VizRow[]>()
    for (const r of t.rows) m.set(valueOf(r, k), [...(m.get(valueOf(r, k)) ?? []), r])
    const order = ORDER[k]
    return [...m.entries()]
      .sort(([a], [b]) => (order ? order.indexOf(a) - order.indexOf(b) : a.localeCompare(b)))
      .map(([value, rs]) => ({ segment: k, value, n: rs.length, tries: rs.filter((r) => r.tries === 'yes').length, pays: rs.filter((r) => r.pays === 'yes').length }))
  })
}

/* ---------------------------------------------------------------- Price */

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export interface PriceLadder {
  tooCheap: number
  bargain: number
  expensive: number
  tooExpensive: number
  /** How many put Aurelia's monthly price at or past "getting expensive". */
  overExpensive: number
  n: number
}

/** The middle answer to each of the four price questions, in US dollars a month. */
export function priceLadder(t: VizTest): PriceLadder {
  const ps = t.rows.map((r) => r.answer.prices)
  return {
    tooCheap: median(ps.map((p) => p.tooCheap)),
    bargain: median(ps.map((p) => p.bargain)),
    expensive: median(ps.map((p) => p.expensive)),
    tooExpensive: median(ps.map((p) => p.tooExpensive)),
    overExpensive: ps.filter((p) => p.expensive <= APP_PLUS.monthly).length,
    n: ps.length,
  }
}

/* ---------------------------------------------------------- Objections */

export interface Objection {
  theme: Theme
  label: string
  count: number
  /** Of the people who would not pay (said no or maybe). */
  n: number
  quotes: { personaId: string; name: string; quote: string; objection: string }[]
}

/** The main reason given by everyone who would not pay yes, ranked. */
export function objections(t: VizTest): Objection[] {
  const no = t.rows.filter((r) => r.pays !== 'yes')
  const m = new Map<Theme, VizRow[]>()
  for (const r of no) m.set(r.answer.theme, [...(m.get(r.answer.theme) ?? []), r])
  return [...m.entries()]
    .map(([theme, rs]) => ({
      theme,
      label: THEME_LABEL[theme],
      count: rs.length,
      n: no.length,
      quotes: rs.slice(0, 3).map((r) => ({ personaId: r.personaId, name: r.persona.name, quote: r.answer.quote, objection: r.answer.objection })),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/* ------------------------------------------------------- What moves people */

export interface Slope {
  key: string
  theme: string
  change: string
  test: string
  /** People whose answer this change moved. */
  moved: number
  n: number
  /** Of the moved people: how many would try (yes) without it, and with it. */
  before: number
  after: number
}

const slopeOf = (answers: BuyerAnswer[], key: string, theme: string, change: string, test: string): Slope => {
  const moved = answers.filter((a) => a.movedBy?.includes(key))
  return {
    key,
    theme,
    change,
    test,
    moved: moved.length,
    n: answers.length,
    before: moved.filter((a) => a.control?.tries === 'yes').length,
    after: moved.filter((a) => a.tries === 'yes').length,
  }
}

/** The six changes that flipped answers, each before and after, among the people it moved. */
export function slopes(): Slope[] {
  return [
    slopeOf(RUN_V3.answers, 'no-account', 'No account for the first session', V3_CHANGES['no-account'].label, 'Test 3'),
    slopeOf(RUN_V3.answers, 'language', 'Their own language', V3_CHANGES.language.label, 'Test 3'),
    slopeOf(RUN_V3.answers, 'data-line', 'A clear data promise', V3_CHANGES['data-line'].label, 'Test 3'),
    slopeOf(RUN_V3.answers, 'local-price', 'A price in local money', V3_CHANGES['local-price'].label, 'Test 3'),
    slopeOf(RUN_V7.answers, 'free-library', 'A free library', V6_CHANGES['free-library']?.label ?? 'Free core library', 'Test 7'),
    slopeOf(RUN_V6.answers, 'creator-voice', 'A coach’s own voice', V6_CHANGES['creator-voice']?.label ?? 'Creator voice', 'Test 6'),
  ].sort((a, b) => b.moved / b.n - a.moved / a.n)
}
