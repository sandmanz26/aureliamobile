// Well-being outcomes per user (U056) — "how well has each user improved
// their well-being?", asked for by Eugene on the admin blueprint.
//
// No backend, so this is seeded mock data like the rest of `mock.ts`, but
// the shape is the one the real pipeline would need to return:
//
// - WHO-5, the five-question well-being index (0–100), asked at the start
//   and then every two weeks — the same rhythm as the consumer app's
//   two-week report (v5). A 10-point change is the threshold the index's
//   authors treat as meaningful, so "improved" and "declined" use it; a
//   latest score of 28 or below is the index's own cue for a follow-up,
//   flagged here for a human to look at rather than for Aurelia to act on.
// - The after-session check-ins (1–5) the app already collects.
// - A wearable signal where one is connected (resting heart rate).
//
// Self-reported and observational: it says how people changed while using
// Aurelia, not that Aurelia caused it, and it is not a clinical assessment.

import type { Tone } from '../components/ui'
import type { AdminUser } from './mock'

export type Outcome = 'improved' | 'steady' | 'declined' | 'too early'

export const GOALS = ['Sleep better', 'Feel calmer', 'Clear my mind', 'Focus', 'Regulate my body', 'More energy'] as const
export const WEARABLES = ['Apple Watch', 'Whoop', 'Oura Ring'] as const

export const OUTCOME_TONE: Record<Outcome, Tone> = {
  improved: 'good',
  steady: 'neutral',
  declined: 'critical',
  'too early': 'info',
}

/** The WHO-5 change its authors treat as meaningful. */
export const MEANINGFUL_CHANGE = 10
/** At or below this, the WHO-5 suggests someone should check in with the person. */
export const FOLLOW_UP_AT = 28

export interface UserOutcome {
  userId: string
  name: string
  goal: string
  chapters: number
  /** WHO-5 assessments so far, oldest first (0–100). */
  who5: number[]
  /** Average after-session check-in (1–5) over the first and the last three. */
  moodStart: number | null
  moodLatest: number | null
  wearable: string | null
  /** Resting heart rate, bpm: first week vs the last. */
  restingHrStart: number | null
  restingHrLatest: number | null
}

export function who5Change(o: Pick<UserOutcome, 'who5'>): number | null {
  return o.who5.length < 2 ? null : o.who5[o.who5.length - 1] - o.who5[0]
}

export function outcomeOf(o: Pick<UserOutcome, 'who5'>): Outcome {
  const change = who5Change(o)
  if (change === null) return 'too early'
  if (change >= MEANINGFUL_CHANGE) return 'improved'
  if (change <= -MEANINGFUL_CHANGE) return 'declined'
  return 'steady'
}

export function needsFollowUp(o: Pick<UserOutcome, 'who5'>): boolean {
  return o.who5.length > 0 && o.who5[o.who5.length - 1] <= FOLLOW_UP_AT
}

export interface OutcomeSummary {
  measured: number
  improved: number
  steady: number
  declined: number
  tooEarly: number
  /** Mean WHO-5 change over the users with two or more assessments. */
  averageChange: number | null
  followUp: number
}

export function summarise(list: UserOutcome[]): OutcomeSummary {
  const changes = list.map(who5Change).filter((c): c is number => c !== null)
  const count = (kind: Outcome) => list.filter((o) => outcomeOf(o) === kind).length
  return {
    measured: changes.length,
    improved: count('improved'),
    steady: count('steady'),
    declined: count('declined'),
    tooEarly: count('too early'),
    averageChange: changes.length ? changes.reduce((s, c) => s + c, 0) / changes.length : null,
    followUp: list.filter(needsFollowUp).length,
  }
}

function makeRng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const round1 = (n: number) => Math.round(n * 10) / 10

/** Sample outcomes for every member account (staff roles are not users of the app). */
export function buildOutcomes(users: AdminUser[], seed = 7): UserOutcome[] {
  const rng = makeRng(seed)
  return users
    .filter((u) => u.role === 'member')
    .map((u) => {
      const goal = GOALS[Math.floor(rng() * GOALS.length)]
      const chapters = Math.floor(rng() * 44)
      // One WHO-5 at the start, then one every 14 days of use (~1 chapter a day).
      const assessments = chapters === 0 ? 0 : 1 + Math.floor(chapters / 14)
      const start = Math.round(24 + rng() * 40)
      // Most drift up a little, some a lot, a few go down — a plausible spread, not a claim.
      const drift = (rng() - 0.25) * 40
      const who5 = Array.from({ length: assessments }, (_, i) =>
        clamp(Math.round(start + (drift * i) / Math.max(1, assessments - 1) + (rng() - 0.5) * 6), 0, 100),
      )
      const checked = chapters > 0
      const moodStart = checked ? round1(clamp(2.4 + rng() * 1.4, 1, 5)) : null
      const moodLatest = checked && moodStart !== null ? round1(clamp(moodStart + drift / 25 + (rng() - 0.5) * 0.4, 1, 5)) : null
      const wearable = rng() > 0.45 ? WEARABLES[Math.floor(rng() * WEARABLES.length)] : null
      const hr = wearable ? Math.round(58 + rng() * 18) : null
      return {
        userId: u.id,
        name: u.name,
        goal,
        chapters,
        who5,
        moodStart,
        moodLatest,
        wearable,
        restingHrStart: hr,
        restingHrLatest: hr !== null && chapters >= 7 ? Math.round(hr - drift / 6 + (rng() - 0.5) * 2) : null,
      }
    })
}
