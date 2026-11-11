// The feedback-group study (U058): 30 people, each with one issue the app
// targets (bad sleep → good sleep, mental fog → clarity, …), using Aurelia
// for 8 weeks so we can see whether it helps. Eugene's brief: "a section in
// admin where we can track and measure the feedback group in validation of
// therapeutic outcomes to our MVP".
//
// The design is a single-arm, pre-registered pilot. What it can show is
// whether people improve on validated measures while using Aurelia, how many,
// and whether they keep using it. It cannot show that Aurelia caused it,
// because there is no control group. The admin page and the protocol PDF
// (docs/reviews/Aurelia-Feedback-Group-Study-2026-11-10.pdf) both say so.
//
// No backend yet, so participants are seeded sample data like mock.ts. The
// shapes, the schedule and the rules are the real ones: the page computes
// everything from them, so they are pure functions with tests.

import type { Tone } from '../components/ui'

const DAY = 24 * 60 * 60_000

export const STUDY = {
  id: 'fg-2026-01',
  name: 'Feedback group · therapeutic outcomes pilot',
  startsOn: '2026-10-13',
  weeks: 8,
  target: 30,
} as const

export type CohortId = 'sleep' | 'clarity' | 'calm' | 'focus' | 'energy' | 'regulate'

export interface ConditionMeasure {
  id: 'isi' | 'promis_cog' | 'gad7' | 'promis_fatigue' | 'pss10'
  name: string
  short: string
  min: number
  max: number
  /** Which direction is better. */
  better: 'lower' | 'higher'
  /** The change treated as meaningful for one person. */
  mcid: number
}

export interface Cohort {
  id: CohortId
  label: string
  /** The app goal a participant in this cohort sets in onboarding. */
  goal: string
  size: number
  measure: ConditionMeasure
}

const ISI: ConditionMeasure = { id: 'isi', name: 'Insomnia Severity Index', short: 'ISI', min: 0, max: 28, better: 'lower', mcid: 6 }
const COG: ConditionMeasure = { id: 'promis_cog', name: 'PROMIS Cognitive Function 4a (T-score)', short: 'PROMIS Cog', min: 20, max: 80, better: 'higher', mcid: 5 }
const GAD7: ConditionMeasure = { id: 'gad7', name: 'GAD-7 anxiety', short: 'GAD-7', min: 0, max: 21, better: 'lower', mcid: 4 }
const FATIGUE: ConditionMeasure = { id: 'promis_fatigue', name: 'PROMIS Fatigue 4a (T-score)', short: 'PROMIS Fatigue', min: 30, max: 80, better: 'lower', mcid: 5 }
const PSS: ConditionMeasure = { id: 'pss10', name: 'Perceived Stress Scale (PSS-10)', short: 'PSS-10', min: 0, max: 40, better: 'lower', mcid: 4 }

export const COHORTS: Cohort[] = [
  { id: 'sleep', label: 'Bad sleep → good sleep', goal: 'Sleep better', size: 6, measure: ISI },
  { id: 'calm', label: 'Anxious → calm', goal: 'Feel calmer', size: 6, measure: GAD7 },
  { id: 'clarity', label: 'Mental fog → clarity', goal: 'Clear my mind', size: 5, measure: COG },
  { id: 'energy', label: 'Low energy → energy', goal: 'More energy', size: 5, measure: FATIGUE },
  { id: 'focus', label: 'Distracted → focused', goal: 'Focus', size: 4, measure: COG },
  { id: 'regulate', label: 'Stressed body → regulated', goal: 'Regulate my body', size: 4, measure: PSS },
]

export const cohortOf = (id: CohortId) => COHORTS.find((c) => c.id === id) as Cohort

/** WHO-5 every two weeks; the condition measure and PHQ-9 at start, middle and end. */
export const WHO5_WEEKS = [0, 2, 4, 6, 8] as const
export const CONDITION_WEEKS = [0, 4, 8] as const

/** WHO-5 thresholds: the authors' meaningful change, and the follow-up cue. */
export const WHO5_MCID = 10
export const WHO5_FOLLOW_UP = 28

/** What is collected, when, from where, and whether the app can do it yet. */
export interface Measure {
  id: string
  name: string
  what: string
  when: string
  source: 'in-app survey' | 'in-app event' | 'wearable' | 'interview' | 'research team'
  role: 'primary' | 'secondary' | 'safety' | 'engagement' | 'experience'
  /** Does production collect it today? */
  inApp: 'yes' | 'partly' | 'no'
  build: string
}

export const MEASURES: Measure[] = [
  { id: 'who5', name: 'WHO-5 Well-Being Index', what: '5 questions, 0–100. Meaningful change: 10 points.', when: 'Weeks 0, 2, 4, 6, 8', source: 'in-app survey', role: 'primary', inApp: 'no', build: 'Survey screen + reminder; POST /studies/{id}/assessments' },
  { id: 'condition', name: 'Condition measure (one per cohort)', what: 'ISI (sleep), GAD-7 (calm), PROMIS Cognitive Function (clarity, focus), PROMIS Fatigue (energy), PSS-10 (regulate).', when: 'Weeks 0, 4, 8', source: 'in-app survey', role: 'primary', inApp: 'no', build: 'Same survey component, one instrument per cohort' },
  { id: 'phq9', name: 'PHQ-9 (safety screen)', what: 'Depression screen. Item 9 > 0 or total ≥ 20 → same-day human follow-up.', when: 'Screening, weeks 4, 8', source: 'in-app survey', role: 'safety', inApp: 'no', build: 'Survey + alert to the study lead; never shown as a score to the participant' },
  { id: 'checkin', name: 'After-session check-in', what: '"How do you feel now?" 1–5 after each session.', when: 'Every session', source: 'in-app event', role: 'secondary', inApp: 'yes', build: 'Exists (v4/v5); needs persistence (D2) and the study id' },
  { id: 'pre', name: 'Before-session state', what: 'The same 1–5 question before pressing play, so each session has a before/after.', when: 'Every session', source: 'in-app event', role: 'secondary', inApp: 'no', build: 'One tap on the player before play' },
  { id: 'diary', name: 'Sleep diary (sleep cohort)', what: 'Bedtime, minutes to fall asleep, night wakings, wake time (Consensus Sleep Diary core).', when: 'Every morning', source: 'in-app survey', role: 'secondary', inApp: 'no', build: 'Morning card on Create for the sleep cohort' },
  { id: 'wearable', name: 'Wearable signals (optional)', what: 'Sleep duration, resting heart rate, HRV (RMSSD), nightly.', when: 'Daily, if consented', source: 'wearable', role: 'secondary', inApp: 'partly', build: 'v5 asks which wearable; the real connection needs the backend (P2)' },
  { id: 'engagement', name: 'Engagement', what: 'Sessions played, minutes, chapters completed, builds, journal entries, days active.', when: 'Continuous', source: 'in-app event', role: 'engagement', inApp: 'partly', build: 'Events session_played, checkin_answered, returned (J039 §8); click insights has views/taps only' },
  { id: 'weekly', name: 'Weekly one-liner', what: '"What helped this week? What got in the way?"', when: 'Weekly', source: 'in-app survey', role: 'experience', inApp: 'no', build: 'Journal prompt tagged to the study' },
  { id: 'interview', name: 'Interviews', what: '30 minutes, think-aloud on their own phone.', when: 'Weeks 0, 4, 8', source: 'interview', role: 'experience', inApp: 'no', build: 'Research team; notes linked to the participant' },
  { id: 'pmf', name: 'Value question', what: 'Sean Ellis "How would you feel if you could no longer use Aurelia?" + would recommend.', when: 'Week 8', source: 'in-app survey', role: 'experience', inApp: 'no', build: 'Final survey' },
  { id: 'ae', name: 'Adverse events', what: 'Anything that felt worse, at any time; reviewed by a person.', when: 'Any time', source: 'research team', role: 'safety', inApp: 'no', build: '"Something felt wrong" in Help + weekly check by the study lead' },
]

export type ParticipantStatus = 'active' | 'paused' | 'withdrawn' | 'completed'

export interface Participant {
  id: string
  cohort: CohortId
  enrolledOn: string
  status: ParticipantStatus
  wearable: string | null
  /** WHO-5 at WHO5_WEEKS; null = not collected (missed or not yet due). */
  who5: (number | null)[]
  /** Condition measure at CONDITION_WEEKS. */
  condition: (number | null)[]
  /** PHQ-9 item 9 above zero at any point: a same-day follow-up was required. */
  phq9Alert: boolean
  /** Sessions played per study week, index 0 = week 1. */
  sessionsByWeek: number[]
  checkIns: number
  /** Average after-minus-before mood per session (1–5 scale). */
  moodLift: number | null
  lastActiveAt: string
}

/* ------------------------------------------------------------------ rules */

export function studyWeek(now: number, startsOn: string = STUDY.startsOn): number {
  const start = Date.parse(startsOn + 'T00:00:00Z')
  return Math.max(0, Math.min(STUDY.weeks, Math.floor((now - start) / (7 * DAY))))
}

export function weekDate(week: number, startsOn: string = STUDY.startsOn): string {
  return new Date(Date.parse(startsOn + 'T00:00:00Z') + week * 7 * DAY).toISOString()
}

const last = (xs: (number | null)[]) => {
  for (let i = xs.length - 1; i >= 0; i--) if (xs[i] !== null) return { value: xs[i] as number, index: i }
  return null
}

/** Latest minus baseline; null without a baseline and a later score. */
export function who5Change(p: Pick<Participant, 'who5'>): number | null {
  const base = p.who5[0]
  const latest = last(p.who5)
  return base === null || base === undefined || !latest || latest.index === 0 ? null : latest.value - base
}

export function isWho5Responder(p: Pick<Participant, 'who5'>): boolean | null {
  const change = who5Change(p)
  return change === null ? null : change >= WHO5_MCID
}

/** Improvement on the cohort's own measure, in the "better" direction. */
export function conditionImprovement(p: Pick<Participant, 'condition' | 'cohort'>): number | null {
  const base = p.condition[0]
  const latest = last(p.condition)
  if (base === null || base === undefined || !latest || latest.index === 0) return null
  const raw = latest.value - base
  return cohortOf(p.cohort).measure.better === 'lower' ? -raw : raw
}

export function isConditionResponder(p: Pick<Participant, 'condition' | 'cohort'>): boolean | null {
  const imp = conditionImprovement(p)
  return imp === null ? null : imp >= cohortOf(p.cohort).measure.mcid
}

/** Share of elapsed weeks with at least 3 sessions. */
export function adherence(p: Pick<Participant, 'sessionsByWeek'>, week: number): number | null {
  const weeks = p.sessionsByWeek.slice(0, week)
  return weeks.length ? weeks.filter((n) => n >= 3).length / weeks.length : null
}

/** Assessments that should exist by `week` (an assessment is due at the start of its week). */
export function dueCount(week: number) {
  return WHO5_WEEKS.filter((w) => w <= week).length + CONDITION_WEEKS.filter((w) => w <= week).length
}

export function collectedCount(p: Pick<Participant, 'who5' | 'condition'>, week: number) {
  const who5 = WHO5_WEEKS.filter((w, i) => w <= week && p.who5[i] !== null).length
  const cond = CONDITION_WEEKS.filter((w, i) => w <= week && p.condition[i] !== null).length
  return who5 + cond
}

export function completeness(p: Pick<Participant, 'who5' | 'condition'>, week: number): number {
  const due = dueCount(week)
  return due ? collectedCount(p, week) / due : 1
}

export function followUpReasons(p: Participant): string[] {
  const reasons: string[] = []
  if (p.phq9Alert) reasons.push('PHQ-9 item 9')
  const latest = last(p.who5)
  if (latest && latest.value <= WHO5_FOLLOW_UP) reasons.push(`WHO-5 ${latest.value}`)
  if (p.status === 'paused') reasons.push('Paused')
  return reasons
}

/** The pre-registered success criteria, evaluated on what exists so far. */
export interface Criterion {
  id: string
  label: string
  target: string
  value: number | null
  display: string
  status: 'on_track' | 'at_risk' | 'not_yet'
  note: string
}

const pct = (x: number) => `${Math.round(x * 100)}%`

export function evaluateCriteria(ps: Participant[], week: number): Criterion[] {
  const enrolled = ps.length
  const notWithdrawn = ps.filter((p) => p.status !== 'withdrawn')
  const measured = ps.map(isWho5Responder).filter((r): r is boolean => r !== null)
  const condMeasured = ps.map(isConditionResponder).filter((r): r is boolean => r !== null)
  const adh = notWithdrawn.map((p) => adherence(p, week)).filter((a): a is number => a !== null)
  const adherent = adh.filter((a) => a >= 0.6).length
  const complete = ps.length ? ps.reduce((s, p) => s + completeness(p, week), 0) / ps.length : 0
  const status = (ok: boolean, have: boolean): Criterion['status'] => (!have ? 'not_yet' : ok ? 'on_track' : 'at_risk')
  // Outcome lines are a week-8 test: before then the figure is shown, but it
  // is not a verdict either way (people improve over weeks, not days).
  const outcome = (ok: boolean, have: boolean): Criterion['status'] => (week < STUDY.weeks ? 'not_yet' : status(ok, have))

  const who5Rate = measured.length ? measured.filter(Boolean).length / measured.length : null
  const condRate = condMeasured.length ? condMeasured.filter(Boolean).length / condMeasured.length : null
  const retention = enrolled ? notWithdrawn.length / enrolled : null
  const adhRate = adh.length ? adherent / adh.length : null

  return [
    { id: 'who5', label: 'Well-being improves meaningfully', target: '≥ 50% gain ≥ 10 WHO-5 points by week 8', value: who5Rate, display: who5Rate === null ? '—' : `${pct(who5Rate)} of ${measured.length}`, status: outcome((who5Rate ?? 0) >= 0.5, who5Rate !== null), note: week < 8 ? `Interim, week ${week}` : 'Final' },
    { id: 'condition', label: 'Their own issue improves', target: '≥ 40% reach the change that matters on their cohort measure', value: condRate, display: condRate === null ? '—' : `${pct(condRate)} of ${condMeasured.length}`, status: outcome((condRate ?? 0) >= 0.4, condRate !== null), note: week < 8 ? `Interim, week ${week}; final at week 8` : 'Final' },
    { id: 'retention', label: 'People stay in the study', target: '≥ 70% still enrolled at week 8', value: retention, display: retention === null ? '—' : pct(retention), status: status((retention ?? 0) >= 0.7, retention !== null), note: `${enrolled - notWithdrawn.length} withdrawn` },
    { id: 'adherence', label: 'People actually use it', target: '≥ 60% play 3+ sessions in at least 60% of weeks', value: adhRate, display: adhRate === null ? '—' : pct(adhRate), status: status((adhRate ?? 0) >= 0.6, adhRate !== null), note: 'Sessions are counted only when played' },
    { id: 'data', label: 'We have the data to judge', target: '≥ 85% of due assessments collected', value: complete, display: pct(complete), status: status(complete >= 0.85, true), note: 'Missing data weakens every other line' },
    { id: 'safety', label: 'No one is harmed', target: 'No serious adverse event; every alert followed up the same day', value: null, display: `${ps.filter((p) => p.phq9Alert).length} alerts`, status: 'on_track', note: 'Reviewed by the study lead' },
  ]
}

export const CRITERION_TONE: Record<Criterion['status'], Tone> = { on_track: 'good', at_risk: 'warning', not_yet: 'neutral' }
export const STATUS_TONE: Record<ParticipantStatus, Tone> = { active: 'good', paused: 'warning', withdrawn: 'critical', completed: 'info' }

/** Mean WHO-5 per assessment week, per cohort (only weeks reached). */
export function who5Trajectory(ps: Participant[], week: number) {
  return WHO5_WEEKS.filter((w) => w <= week).map((w, i) => {
    const row: Record<string, number | string> = { date: weekDate(w), week: w }
    for (const c of COHORTS) {
      const vals = ps.filter((p) => p.cohort === c.id).map((p) => p.who5[i]).filter((v): v is number => v !== null)
      row[c.id] = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
    }
    return row
  })
}

/* --------------------------------------------------------- sample cohort */

function makeRng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const WEARABLES = ['Apple Watch', 'Oura Ring', 'Whoop']

/**
 * 30 sample participants, data filled up to `week`. Pseudonymous ids only:
 * names and contact details live with the research team, never in this tool.
 */
export function buildParticipants(week: number, seed = 11): Participant[] {
  const rng = makeRng(seed)
  const out: Participant[] = []
  let n = 1
  for (const c of COHORTS) {
    for (let k = 0; k < c.size; k++) {
      const id = `P${String(n++).padStart(2, '0')}`
      const withdrawAt = rng() < 0.1 ? 1 + Math.floor(rng() * Math.max(1, week)) : null
      const paused = !withdrawAt && rng() < 0.07
      const effect = (rng() - 0.25) * 1.4 // most improve somewhat, some a lot, a few get worse
      const missRate = 0.08
      const baseWho5 = Math.round(28 + rng() * 26)
      const who5 = WHO5_WEEKS.map((w) => {
        if (w > week || (withdrawAt !== null && w >= withdrawAt) || (w > 0 && rng() < missRate)) return null
        return clamp(Math.round(baseWho5 + effect * 22 * (w / 8) * 1.6 + (rng() - 0.5) * 8), 0, 100)
      })
      const m = c.measure
      const span = m.max - m.min
      const baseCond = m.better === 'lower' ? m.min + span * (0.45 + rng() * 0.3) : m.min + span * (0.25 + rng() * 0.2)
      const condition = CONDITION_WEEKS.map((w) => {
        if (w > week || (withdrawAt !== null && w >= withdrawAt) || (w > 0 && rng() < missRate)) return null
        const move = effect * m.mcid * 1.5 * (w / 8) * 1.6 + (rng() - 0.5) * m.mcid * 0.6
        return clamp(Math.round(m.better === 'lower' ? baseCond - move : baseCond + move), m.min, m.max)
      })
      const sessionsByWeek = Array.from({ length: week }, (_, i) =>
        withdrawAt !== null && i + 1 >= withdrawAt ? 0 : Math.max(0, Math.round(2 + effect * 2.5 + rng() * 3 - (paused && i >= week - 1 ? 3 : 0))),
      )
      const played = sessionsByWeek.reduce((s, v) => s + v, 0)
      const activeDaysAgo = withdrawAt !== null ? (week - withdrawAt) * 7 + 3 : paused ? 9 : Math.floor(rng() * 3)
      out.push({
        id,
        cohort: c.id,
        enrolledOn: STUDY.startsOn,
        status: withdrawAt !== null ? 'withdrawn' : paused ? 'paused' : week >= STUDY.weeks ? 'completed' : 'active',
        wearable: rng() > 0.4 ? WEARABLES[Math.floor(rng() * WEARABLES.length)] : null,
        who5,
        condition,
        phq9Alert: rng() < 0.05,
        sessionsByWeek,
        checkIns: Math.round(played * (0.7 + rng() * 0.3)),
        moodLift: played ? Math.round((0.3 + effect * 0.6 + (rng() - 0.5) * 0.4) * 10) / 10 : null,
        lastActiveAt: new Date(Date.parse(weekDate(week)) - activeDaysAgo * DAY).toISOString(),
      })
    }
  }
  return out
}

/* ------------------------------------------------- v2: wins and weekly ops */
//
// Version 2 of the section (U060) reads the study the way Eugene put it:
// "solve and win them" — bad sleep to good sleep. A change of the meaningful
// size is progress; arriving in the healthy band of the measure is a win.
// Bands are the published severity cut-points for each instrument (PROMIS:
// the usual 5/10/20-point distances from the population mean of 50).

export type Band = { label: string; tone: Tone; healthy: boolean }

interface BandRule {
  /** Upper bounds (inclusive) for lower-is-better scales, lower bounds for higher-is-better. */
  cut: number
  band: Band
}

const HEALTHY = (label: string): Band => ({ label, tone: 'good', healthy: true })
const MILD = (label: string): Band => ({ label, tone: 'info', healthy: false })
const MODERATE = (label: string): Band => ({ label, tone: 'warning', healthy: false })
const SEVERE = (label: string): Band => ({ label, tone: 'critical', healthy: false })

/** Ordered from the healthiest band down. */
const BANDS: Record<ConditionMeasure['id'] | 'who5', { better: 'lower' | 'higher'; rules: BandRule[] }> = {
  isi: { better: 'lower', rules: [{ cut: 7, band: HEALTHY('No insomnia') }, { cut: 14, band: MILD('Subthreshold') }, { cut: 21, band: MODERATE('Moderate') }, { cut: 28, band: SEVERE('Severe') }] },
  gad7: { better: 'lower', rules: [{ cut: 4, band: HEALTHY('Minimal') }, { cut: 9, band: MILD('Mild') }, { cut: 14, band: MODERATE('Moderate') }, { cut: 21, band: SEVERE('Severe') }] },
  pss10: { better: 'lower', rules: [{ cut: 13, band: HEALTHY('Low stress') }, { cut: 26, band: MODERATE('Moderate') }, { cut: 40, band: SEVERE('High') }] },
  promis_fatigue: { better: 'lower', rules: [{ cut: 54, band: HEALTHY('Within normal') }, { cut: 59, band: MILD('Mild') }, { cut: 69, band: MODERATE('Moderate') }, { cut: 80, band: SEVERE('Severe') }] },
  promis_cog: { better: 'higher', rules: [{ cut: 45, band: HEALTHY('Within normal') }, { cut: 40, band: MILD('Mild') }, { cut: 30, band: MODERATE('Moderate') }, { cut: 0, band: SEVERE('Severe') }] },
  who5: { better: 'higher', rules: [{ cut: 50, band: HEALTHY('Good') }, { cut: 29, band: MODERATE('Low') }, { cut: 0, band: SEVERE('Very low') }] },
}

export function bandOf(measure: ConditionMeasure['id'] | 'who5', score: number): Band {
  const { better, rules } = BANDS[measure]
  const hit = better === 'lower' ? rules.find((r) => score <= r.cut) : rules.find((r) => score >= r.cut)
  return (hit ?? rules[rules.length - 1]).band
}

export function bandsFor(measure: ConditionMeasure['id'] | 'who5'): Band[] {
  return BANDS[measure].rules.map((r) => r.band)
}

export type WinStatus = 'won' | 'improving' | 'steady' | 'worse' | 'too early' | 'started healthy'

export const WIN_TONE: Record<WinStatus, Tone> = {
  won: 'good',
  improving: 'info',
  steady: 'neutral',
  worse: 'critical',
  'too early': 'neutral',
  'started healthy': 'warning',
}

/**
 * On the cohort's own measure: won = started outside the healthy band and is
 * in it now; improving = a meaningful change but not there yet; worse = a
 * meaningful change the wrong way. "Started healthy" is a recruitment signal,
 * not a result — they had little to win.
 */
export function winStatus(p: Pick<Participant, 'condition' | 'cohort'>): WinStatus {
  const m = cohortOf(p.cohort).measure
  const base = p.condition[0]
  if (base === null || base === undefined) return 'too early'
  if (bandOf(m.id, base).healthy) return 'started healthy'
  const imp = conditionImprovement(p)
  if (imp === null) return 'too early'
  const latest = [...p.condition].reverse().find((v) => v !== null) as number
  if (bandOf(m.id, latest).healthy) return 'won'
  if (imp >= m.mcid) return 'improving'
  if (imp <= -m.mcid) return 'worse'
  return 'steady'
}

/** Baseline vs latest band counts for one cohort (only people with both). */
export function bandShift(ps: Participant[], cohort: CohortId) {
  const m = cohortOf(cohort).measure
  const bands = bandsFor(m.id)
  const rows = ps.filter((p) => p.cohort === cohort && p.condition[0] !== null)
  const count = (pick: (p: Participant) => number | null) =>
    bands.map((b) => rows.filter((p) => { const v = pick(p); return v !== null && bandOf(m.id, v).label === b.label }).length)
  const latestOf = (p: Participant) => { const later = p.condition.slice(1).reverse().find((v) => v !== null); return later ?? null }
  const withLatest = rows.filter((p) => latestOf(p) !== null)
  return {
    bands,
    start: count((p) => (withLatest.includes(p) ? p.condition[0] : null)),
    now: count(latestOf),
    n: withLatest.length,
  }
}

/** Does more use go with more change? WHO-5 change by average sessions per week. */
export function doseBuckets(ps: Participant[], week: number) {
  const buckets = [
    { label: 'Under 2 a week', min: 0, max: 2 },
    { label: '2–3 a week', min: 2, max: 4 },
    { label: '4 or more a week', min: 4, max: Infinity },
  ]
  return buckets.map((b) => {
    const inB = ps.filter((p) => {
      const weeks = p.sessionsByWeek.slice(0, week)
      const avg = weeks.length ? weeks.reduce((s, v) => s + v, 0) / weeks.length : 0
      return avg >= b.min && avg < b.max
    })
    const changes = inB.map(who5Change).filter((c): c is number => c !== null)
    return { label: b.label, n: inB.length, meanChange: changes.length ? Math.round((changes.reduce((s, c) => s + c, 0) / changes.length) * 10) / 10 : null }
  })
}

export type TaskKind = 'questionnaire' | 'reminder' | 'follow-up' | 'nudge' | 'interview'

export interface WeekTask {
  id: string
  kind: TaskKind
  participantId: string
  text: string
  done: boolean
}

/** The study team's list for `week`: what is due, missed, at risk or scheduled. */
export function weekTasks(ps: Participant[], week: number): WeekTask[] {
  const tasks: WeekTask[] = []
  const live = ps.filter((p) => p.status === 'active' || p.status === 'paused')
  const who5i = (WHO5_WEEKS as readonly number[]).indexOf(week)
  const condi = (CONDITION_WEEKS as readonly number[]).indexOf(week)
  for (const p of ps) {
    for (const r of followUpReasons(p)) tasks.push({ id: `${p.id}-fu-${r}`, kind: 'follow-up', participantId: p.id, text: `Call today: ${r}`, done: false })
  }
  for (const p of live) {
    const m = cohortOf(p.cohort).measure
    if (who5i >= 0) tasks.push({ id: `${p.id}-who5-${week}`, kind: 'questionnaire', participantId: p.id, text: `WHO-5 (week ${week})`, done: p.who5[who5i] !== null })
    if (condi >= 0) {
      tasks.push({ id: `${p.id}-cond-${week}`, kind: 'questionnaire', participantId: p.id, text: `${m.short} + PHQ-9 (week ${week})`, done: p.condition[condi] !== null })
      tasks.push({ id: `${p.id}-int-${week}`, kind: 'interview', participantId: p.id, text: `Interview ${condi + 1} of 3 (30 min)`, done: false })
    }
    const missed = [
      ...WHO5_WEEKS.filter((w, i) => w < week && p.who5[i] === null).map((w) => `WHO-5 wk ${w}`),
      ...CONDITION_WEEKS.filter((w, i) => w < week && p.condition[i] === null).map((w) => `${m.short} wk ${w}`),
    ]
    if (missed.length) tasks.push({ id: `${p.id}-miss`, kind: 'reminder', participantId: p.id, text: `Remind: ${missed.join(', ')}${missed.length >= 2 ? ' — call, two misses' : ''}`, done: false })
    const lastWeek = p.sessionsByWeek[week - 1]
    if (week > 0 && lastWeek !== undefined && lastWeek < 2) tasks.push({ id: `${p.id}-nudge`, kind: 'nudge', participantId: p.id, text: `Only ${lastWeek} session${lastWeek === 1 ? '' : 's'} last week — check in`, done: false })
  }
  const order: TaskKind[] = ['follow-up', 'reminder', 'questionnaire', 'nudge', 'interview']
  return tasks.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || Number(a.done) - Number(b.done))
}
