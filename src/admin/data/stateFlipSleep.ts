/**
 * Admin → Product lab → StateFlips (U140, J202). The sleep StateFlip, complete:
 * the bad and the good state in measurable terms, the path X → Y → Z with its
 * score thresholds, the per-chapter check-in that measures it, who has it in
 * the 1,000 v4 personas, and the DOJO workbook rows it draws on (cited by ID).
 *
 * Pure data and functions, no React, so `stateFlipSleep.test.ts` can pin them.
 * The formulas that turn this into chapters, chance and a cohort live in
 * `stateFlipFormulas.ts`. Nothing here is measured on Aurelia users: there are
 * none yet. Ranges from published scales are labelled Research, our own
 * choices Assumption, the business owner's plan Spec, and anything worked out
 * from those Computed.
 */

import { generatePersonasV4, type PersonaV4 } from './personasV4'
import { conditionsV4, type ConditionV4 } from './personaConditionV4'

export type NumLabel = 'spec' | 'assumption' | 'computed' | 'research'
export const NUM_LABEL_TEXT: Record<NumLabel, string> = { spec: 'Spec', assumption: 'Assumption', computed: 'Computed', research: 'Research' }
export const NUM_LABEL_MEANING: Record<NumLabel, string> = {
  spec: 'From the business owner’s plan (the spec PDF). Not measured.',
  assumption: 'Our own choice, stated so it can be argued with and changed.',
  computed: 'Worked out here from the other numbers and the 1,000 personas.',
  research: 'A range from a published sleep scale or guideline.',
}

/* ------------------------------------------------------------- The score */

/** The sleep score: 0–100, higher is better, the sum of four 25-point markers a check-in asks about. */
export const BAD_SCORE = 25
export const GOOD_SCORE = 85

export interface Marker {
  id: 'latency' | 'wakings' | 'hours' | 'energy'
  label: string
  question: string
  unit: string
  bad: string
  good: string
  /** The published range the bad/good descriptions follow. */
  basis: string
  label2: NumLabel
  /** Points out of 25 for an answer. */
  points: (x: number) => number
}

export const MARKERS: Marker[] = [
  {
    id: 'latency', label: 'Time to fall asleep', question: 'Last night, about how long did it take you to fall asleep?', unit: 'minutes',
    bad: '45–60 minutes most nights', good: '20 minutes or less',
    basis: 'More than 30 minutes is the usual insomnia cut-off (ISI, PSQI component 2); 30 minutes or less is good sleep quality (National Sleep Foundation, Ohayon 2017).',
    label2: 'research',
    points: (m) => (m <= 20 ? 22 : m <= 30 ? 18 : m <= 45 ? 10 : m <= 60 ? 5 : 0),
  },
  {
    id: 'wakings', label: 'Night wakings', question: 'How many times did you wake up for more than 5 minutes?', unit: 'times',
    bad: '3 or more', good: '1 or none',
    basis: 'One or no awakening longer than 5 minutes is good sleep quality (National Sleep Foundation, Ohayon 2017).',
    label2: 'research',
    points: (n) => (n <= 0 ? 25 : n === 1 ? 19 : n === 2 ? 12 : n === 3 ? 6 : 0),
  },
  {
    id: 'hours', label: 'Hours asleep', question: 'About how many hours did you actually sleep?', unit: 'hours',
    bad: 'Under 6 hours', good: '7–9 hours',
    basis: 'Adults need 7 hours or more (AASM and Sleep Research Society, Watson 2015); under 6 hours scores 2–3 on PSQI component 3.',
    label2: 'research',
    points: (h) => (h >= 7 ? 25 : h >= 6 ? 17 : h >= 5 ? 8 : 3),
  },
  {
    id: 'energy', label: 'Morning energy', question: 'How rested did you feel this morning? (1 = exhausted, 5 = fully rested)', unit: '1–5',
    bad: '1–2: dragging through the morning', good: '4–5: rested',
    basis: 'Our own 1–5 check-in question, like PSQI component 7 (daytime dysfunction). The cut-offs are ours.',
    label2: 'assumption',
    points: (e) => ((Math.min(5, Math.max(1, e)) - 1) / 4) * 25,
  },
]

export interface Answers {
  latency: number
  wakings: number
  hours: number
  energy: number
}

/** The sleep score from one check-in's four answers. */
export function sleepScore(a: Answers): number {
  const by = { latency: a.latency, wakings: a.wakings, hours: a.hours, energy: a.energy }
  return Math.round(MARKERS.reduce((t, m) => t + m.points(by[m.id]), 0))
}

/** The bad and the good state as a concrete night, and their scores. */
export const BAD_NIGHT: Answers = { latency: 50, wakings: 3, hours: 5.5, energy: 2 }
export const GOOD_NIGHT: Answers = { latency: 20, wakings: 1, hours: 7.5, energy: 4 }

export const STATES = {
  bad: {
    title: 'Bad sleep',
    story: 'Lies awake for most of an hour, mind going over the day. Wakes three times or more. Gets five or six hours and drags through the morning.',
    scales: 'Matches PSQI global 10 or more (poor sleep is above 5) and ISI 15–21 (moderate insomnia).',
  },
  good: {
    title: 'Good sleep',
    story: 'Falls asleep within 20 minutes, sleeps through or wakes once, gets 7–9 hours and wakes rested most days.',
    scales: 'Matches PSQI global 5 or less and ISI 0–7 (no insomnia worth treating).',
  },
}

export const SCALE_SOURCES = [
  { id: 'psqi', name: 'Pittsburgh Sleep Quality Index (PSQI)', cite: 'Buysse et al., 1989. Global 0–21; above 5 means poor sleep.', url: 'https://doi.org/10.1016/0165-1781(89)90047-4' },
  { id: 'isi', name: 'Insomnia Severity Index (ISI)', cite: 'Morin et al., 2011. 0–7 none, 8–14 subthreshold, 15–21 moderate, 22–28 severe.', url: 'https://doi.org/10.1093/sleep/34.5.601' },
  { id: 'nsf', name: 'National Sleep Foundation sleep quality', cite: 'Ohayon et al., 2017. Good: asleep within 30 min, at most 1 waking over 5 min, efficiency 85% or more.', url: 'https://doi.org/10.1016/j.sleh.2016.11.006' },
  { id: 'aasm', name: 'AASM / Sleep Research Society', cite: 'Watson et al., 2015. Adults should sleep 7 hours or more a night.', url: 'https://doi.org/10.5665/sleep.4716' },
]

/* -------------------------------------------------------- The path X → Y → Z */

export type Layer = 'mood' | 'habit' | 'skill'
export type MilestoneId = 'X' | 'Y' | 'Z'

export interface Milestone {
  id: MilestoneId
  title: string
  /** The score from which this step counts as reached. */
  threshold: number
  what: string
  /** What the check-in shows at this step. */
  shows: string
  /** The DOJO causal layer that moves most in the stretch leading to it. */
  layer: Layer
  /** DOJO ids, see DOJO_LINKS. */
  dojo: string[]
  /** The therapeutic metric that moves in this stretch. */
  metric: string
}

export const MILESTONES: Milestone[] = [
  {
    id: 'X', title: 'Winds down before bed', threshold: 45, layer: 'mood',
    what: 'Relaxes in the hour before bed instead of carrying the day into it.',
    shows: 'Falls asleep within about 30–45 minutes; morning energy 2–3.',
    dojo: ['DOJO_M LU 0-1', 'DOJO_M LU 0-2', 'DOJO_M BL 1-1', 'Causal layering N5'],
    metric: 'Minutes to fall asleep, and how calm the evening feels',
  },
  {
    id: 'Y', title: 'Falls asleep faster', threshold: 65, layer: 'habit',
    what: 'Keeps a wind-down routine and a regular bedtime most nights.',
    shows: 'Asleep within 20–30 minutes on most nights; wakings down to about 2.',
    dojo: ['DOJO_M HT 0-3', 'DOJO_C_Duals DI003', 'Causal layering P002'],
    metric: 'Minutes to fall asleep, nights a week with the routine',
  },
  {
    id: 'Z', title: 'Sleeps through and wakes rested', threshold: 85, layer: 'skill',
    what: 'Settles back after a waking without effort; sleep is steady even on a stressful day.',
    shows: 'At most 1 waking, 7 hours or more, morning energy 4–5. This is the StateFlip.',
    dojo: ['DOJO_M HT 1-3', 'DOJO_M HT 2-3', 'Causal layering DI005', 'DB-skills SK9', 'DB-skills SK10'],
    metric: 'Night wakings, hours asleep, morning energy',
  },
]

export const LAYER_TEXT: Record<Layer, { name: string; pace: string; plain: string }> = {
  mood: { name: 'Mood', pace: 'hours to days', plain: 'How the evening feels: calmer, less wound up. Moves first and fastest.' },
  habit: { name: 'Habit', pace: 'days to weeks', plain: 'What the person does every night: a routine, a regular bedtime. Moves steadily.' },
  skill: { name: 'Skill', pace: 'weeks to months', plain: 'What they can now do without trying: settle back to sleep, sleep well under stress. Slowest.' },
}

/** The step a score has reached; null below X. */
export const milestoneOf = (score: number): MilestoneId | null => (score >= 85 ? 'Z' : score >= 65 ? 'Y' : score >= 45 ? 'X' : null)

/** The causal layer that moves most at a score: mood below X, habit from X to Y, skill from Y to Z. */
export const layerAt = (score: number): Layer => (score < 45 ? 'mood' : score < 65 ? 'habit' : 'skill')

/* --------------------------------------------------- The per-chapter check-in */

export const CHECK_IN = {
  when: 'The morning after each chapter, before the next one starts (about 20 seconds).',
  how: 'The four questions above, each scored out of 25; the sleep score is their sum. A person is at X, Y or Z when the score of their last two check-ins (averaged) passes 45, 65 or 85.',
  weekly: 'Once a week the full 7-question ISI as a cross-check (Research, Morin 2011): the 4-question score should fall as ISI falls.',
}

/* ------------------------------------------------------------ The DOJO links */

export interface DojoLink {
  id: string
  sheet: string
  name: string
  /** The issue → wellness dual or objective as the workbook states it. */
  says: string
  layer: Layer
  milestone: MilestoneId
}

/**
 * Rows of docs/briefs/2026-11-26-dojo-objective-learning.xlsx that apply to
 * sleep, cited by sheet and ID. Evolutionary frames are written as the sheet
 * means them (0-1, 1-3…); Excel had stored some as dates.
 */
export const DOJO_LINKS: DojoLink[] = [
  { id: 'DOJO_M LU 0-1', sheet: 'DOJO_M', name: 'Respiratory Awareness (Lung meridian, frame 0-1)', says: 'Inattention → Awareness: notice the breath. The first wind-down step.', layer: 'mood', milestone: 'X' },
  { id: 'DOJO_M LU 0-2', sheet: 'DOJO_M', name: 'Breath Synchronization (Lung meridian, frame 0-2)', says: 'Disruption → Synchronization: slow, even breathing that calms the body before bed.', layer: 'mood', milestone: 'X' },
  { id: 'DOJO_M BL 1-1', sheet: 'DOJO_M', name: 'Relaxation Routines (Bladder meridian, frame 1-1)', says: 'Embed relaxation into the daily routine.', layer: 'mood', milestone: 'X' },
  { id: 'Causal layering N5', sheet: 'Causal layering', name: 'Nuance N5 Restorative Routines', says: 'Hindered by inconsistent sleep habits and stress carry-over; helped by sleep hygiene, relaxation, a dark room.', layer: 'mood', milestone: 'X' },
  { id: 'DOJO_M HT 0-3', sheet: 'DOJO_M', name: 'Sleep Hygiene (Heart meridian, frame 0-3)', says: 'Chronic insomnia → sleep hygiene: establish a healthy sleep pattern.', layer: 'habit', milestone: 'Y' },
  { id: 'DOJO_C_Duals DI003', sheet: 'DOJO_C_Duals', name: 'Dual DI003 Improving Sleep Quality (Root, frame 0-1)', says: 'Insomnia → restful sleep; emotional fatigue → resilience. Obstacle: poor sleep hygiene. Melatonin and circadian rhythm.', layer: 'habit', milestone: 'Y' },
  { id: 'Causal layering P002', sheet: 'Causal layering', name: 'P002 Restorative Routines (nuance)', says: 'Tension → relaxation through sleep hygiene, stretching, progressive relaxation.', layer: 'habit', milestone: 'Y' },
  { id: 'DOJO_M HT 1-3', sheet: 'DOJO_M', name: 'Sleep Quality (Heart meridian, frame 1-3)', says: 'Sleep disorders → sleep quality: improve the quality of sleep.', layer: 'skill', milestone: 'Z' },
  { id: 'DOJO_M HT 2-3', sheet: 'DOJO_M', name: 'Sleep Optimization (Heart meridian, frame 2-3)', says: 'Sleep abnormalities → optimal sleep for overall wellness.', layer: 'skill', milestone: 'Z' },
  { id: 'Causal layering DI005', sheet: 'Causal layering', name: 'Dual DI005 / P001 Achieving Restful Recovery', says: 'Physical stress and poor recovery → physical restfulness: circadian stabilisation, melatonin, lower cortisol at night.', layer: 'skill', milestone: 'Z' },
  { id: 'DB-skills SK9', sheet: 'DB-skills', name: 'Skill SK9 Stress Recovery', says: 'Restoration through focused relaxation and recovery techniques.', layer: 'skill', milestone: 'Z' },
  { id: 'DB-skills SK10', sheet: 'DB-skills', name: 'Skill SK10 Mind-Body Synchronization', says: 'Calm and ready under pressure: keeps sleep steady on hard days.', layer: 'skill', milestone: 'Z' },
]

/** The workbook's own definition of the layers (Objective Learning System KB). */
export const DOJO_LAYER_SOURCE = 'DOJO workbook, sheet “Objective Learning System KB”: States seconds to hours, Moods hours to days, Habits days to weeks, Skills weeks to months; ranked Skills > Habits > Moods > States.'

/* ------------------------------------------------------------- Who has it */

/** The physical-dimension issues that are about sleep (personaConditionV4 ISSUES.physical). */
export const SLEEP_ISSUES = ['poor-sleep', 'body-clock', 'habits'] as const

export type Severity = 'severe' | 'moderate' | 'mild'
/** Sleep severity from the sleep score (assumption, the same cut-offs as the wellness score). */
export const severityOf = (score: number): Severity => (score < 40 ? 'severe' : score < 65 ? 'moderate' : 'mild')

/** A persona's sleep score from the sleep facts their profile already has. */
export const personaSleepScore = (p: PersonaV4) => sleepScore({ latency: p.wellness.sleep.latencyMin, wakings: p.wellness.sleep.wakeUps, hours: p.wellness.sleep.hours, energy: p.wellness.energy })

/** In the sleep cohort: poor or very poor sleep, main need physical with a sleep issue, a score under 85. Risk-flag is checked separately. */
export const isSleepNeed = (p: PersonaV4, c: ConditionV4) =>
  p.wellness.sleep.band !== 'good' && c.mainNeed === 'physical' && (SLEEP_ISSUES as readonly string[]).includes(c.dims.physical.issue) && personaSleepScore(p) < GOOD_SCORE

export interface WhoHasIt {
  personas: number
  poorSleepBand: number
  poorSleepBandRisk: number
  sleepNeed: number
  sleepNeedRisk: number
  /** The cohort: sleep need, risk-flagged excluded. */
  cohort: { p: PersonaV4; c: ConditionV4; score: number; severity: Severity }[]
  bySeverity: Record<Severity, number>
  byIssue: Record<(typeof SLEEP_ISSUES)[number], number>
  meanScore: number
}

let whoCache: WhoHasIt | null = null

/** Who has the sleep StateFlip in the 1,000 v4 personas (computed). */
export function whoHasIt(): WhoHasIt {
  if (whoCache) return whoCache
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const poor = ps.filter((p) => p.wellness.sleep.band !== 'good')
  const need = ps.filter((p) => isSleepNeed(p, cs.get(p.id)!))
  const cohort = need.filter((p) => !cs.get(p.id)!.excluded).map((p) => {
    const score = personaSleepScore(p)
    return { p, c: cs.get(p.id)!, score, severity: severityOf(score) }
  })
  const bySeverity = { severe: 0, moderate: 0, mild: 0 } as Record<Severity, number>
  const byIssue = { 'poor-sleep': 0, 'body-clock': 0, habits: 0 } as WhoHasIt['byIssue']
  for (const x of cohort) {
    bySeverity[x.severity]++
    byIssue[x.c.dims.physical.issue as keyof typeof byIssue]++
  }
  whoCache = {
    personas: ps.length,
    poorSleepBand: poor.length,
    poorSleepBandRisk: poor.filter((p) => cs.get(p.id)!.excluded).length,
    sleepNeed: need.length,
    sleepNeedRisk: need.length - cohort.length,
    cohort,
    bySeverity,
    byIssue,
    meanScore: cohort.reduce((t, x) => t + x.score, 0) / Math.max(1, cohort.length),
  }
  return whoCache
}

/* ------------------------------------------------------------- Key terms */

/** The shared vocabulary, shown as "Key terms" on the page and repeated in the wiki's How Aurelia heals. */
export const KEY_TERMS: { term: string; plain: string }[] = [
  { term: 'Dimension', plain: 'One of the five areas of life Aurelia works on: mental (thoughts), emotional (feelings), relational (people), spiritual (meaning and purpose) and physical (sleep, energy, body). Every person has a score in each.' },
  { term: 'Universal need', plain: 'Something every person needs inside a dimension, like restful sleep (physical) or feeling connected (relational). There are hundreds; each can be in a bad or a good state.' },
  { term: 'StateFlip', plain: 'One concrete change of a universal need from a bad state to a good one, with steps on the way: X, then Y, then Z. Bad sleep (25 of 100) to good sleep (85) is the first one built out in full. The plan starts with 125: 25 in each dimension.' },
  { term: 'DOJO', plain: 'The business owner’s knowledge workbook. VES lists body areas (7 chakras, 12 meridians). Each has concepts arranged by evolutionary frame, like belt levels (0-1, 0-2 … 2-3). Duals pair an issue with its wellness state (insomnia → restful sleep). Causal layers say how fast things change: moods in days, habits in weeks, skills in months.' },
  { term: 'AKP', plain: 'Atomic knowledge point: one small building block of a chapter, like a breath pattern, a mood, a story or a music tempo. Goal AKPs say what to reach (the StateFlips). Strategy and tactic AKPs say how (concepts, skills, methods, techniques). In tournaments the blocks compete, and the ones that move people further are used more.' },
  { term: 'Chapter', plain: 'One sitting: a single audio of about 10 minutes, made for one person. The Cost report calls it a session.' },
  { term: 'Session', plain: 'A programme of chapters towards one goal, like better sleep. In this page a sleep session has about 10 to 50 chapters.' },
  { term: 'Check-in', plain: 'Four questions the morning after each chapter (how long to fall asleep, wakings, hours, morning energy). Their answers add up to the sleep score.' },
  { term: 'Chance it works', plain: 'Our prediction of the share of people who reach the good state. It starts from the plan’s 54% and is adjusted per person for how often they use it, how ready they are, how bad their sleep is, and whether audio suits them.' },
  { term: 'Cost per flip', plain: 'The AI cost of the chapters for one person who reaches the good state, counting the chapters of the people it does not help: cost per chapter × chapters played ÷ chance it works.' },
  { term: 'Causal AI stage', plain: 'How much the AI has learned from real use. Stage 1 is today (under 1,000 sessions), stage 2 after 10,000, stage 3 after 100,000. The plan expects chapters to work better and cost less at each stage.' },
]
