/**
 * The sleep StateFlip's formulas (U140, J202): "chapters to flip" and "chance
 * it works", made transparent, and a cohort of the v4 personas whose need is
 * sleep, followed chapter by chapter. It explains and improves on the spec's
 * flat constants (42 chapters, 54%) without changing costModel: it reads
 * costModel and personaConditionV4, never writes to them.
 *
 * Every constant here carries a label (Spec, Assumption, Computed) in FACTORS,
 * and every per-person number comes with the formula filled in (`why`).
 * Pure: no React, deterministic, no randomness. The cohort is an expected-value
 * model: each person contributes probabilities, not coin flips, so the same
 * code gives the same chart on every machine.
 */

import { DEFAULT_GOAL, PRESETS, STAGES, adherenceFactor, clamp, conditionFactor, goal, presetInputs, total, chapterCost, type Stage } from './costModel'
import { conditionForBuyer, perWeekOf, type Acuity, type ConditionV4, type Helper } from './personaConditionV4'
import type { PersonaV4 } from './personasV4'
import { BAD_SCORE, GOOD_SCORE, MILESTONES, layerAt, whoHasIt, type Layer, type MilestoneId, type NumLabel, type Severity } from './stateFlipSleep'

/* ------------------------------------------------------------- The factors */

/** How much faster or slower each causal layer moves than the spec's average uplift (assumption, from the DOJO layers' time scales). */
export const PHASE_MULT: Record<Layer, number> = { mood: 1.6, habit: 1.05, skill: 0.72 }
/** A recent problem shifts faster than a long-standing one (assumption). */
export const ACUITY_SPEED: Record<Acuity, number> = { acute: 1.1, ongoing: 1, 'long-standing': 0.9 }
/** Worse sleep makes a flip less likely (assumption). */
export const SEVERITY_CHANCE: Record<Severity, number> = { mild: 1.1, moderate: 1, severe: 0.85 }
/** An audio programme suits people whom audio, breath or music already helps (assumption). */
export const AUDIO_HELPERS: Helper[] = ['sleep audio', 'voice guidance', 'breath', 'music']
export const FIT = { audio: 1.05, other: 0.95 }
/** Readiness factor = READY_BASE + READY_SLOPE × readiness (0–1, from conditionForBuyer). */
export const READY_BASE = 0.75
export const READY_SLOPE = 0.5
/** No prediction is allowed above 90% or below 5% (assumption). */
export const CHANCE_CAP = 0.9
export const CHANCE_FLOOR = 0.05
/** Share of the people a journey fails who fail by stopping, not by staying without improving (assumption). */
export const DROPOUT_SHARE = 0.6
/** People who stay but do not respond improve at this share of the speed and stall below Y (assumption). */
export const NONRESPONDER_SPEED = 0.5
export const NONRESPONDER_CEILING = 64
/** The chart follows the cohort this many chapters at most. */
export const HORIZON = 80

export interface Factor {
  id: string
  name: string
  value: string
  label: NumLabel
  why: string
}

export function factors(stage: Stage = 1): Factor[] {
  const s = STAGES[stage]
  return [
    { id: 'uplift', name: 'Average uplift per chapter', value: `${s.uplift} points`, label: 'spec', why: `The spec’s ${s.name} figure: on average a chapter adds ${s.uplift} points to the sleep score.` },
    { id: 'success', name: 'Base chance it works', value: `${Math.round(s.success * 100)}%`, label: 'spec', why: `The spec’s ${s.name} success rate. Used as the starting point, then adjusted per person.` },
    { id: 'phase', name: 'Speed by causal layer', value: `mood ×${PHASE_MULT.mood}, habit ×${PHASE_MULT.habit}, skill ×${PHASE_MULT.skill}`, label: 'assumption', why: 'DOJO says moods move in hours to days, habits in days to weeks, skills in weeks to months. The three numbers are set so that 25 → 85 with everything else average still takes the spec’s 42 chapters.' },
    { id: 'condition', name: 'Starting point', value: '1 + 0.6 × (start − 25) ÷ 100, 0.7–1.3', label: 'assumption', why: 'costModel’s condition factor, reused unchanged: a better start moves a little faster per chapter.' },
    { id: 'acuity', name: 'How long it has gone on', value: 'acute ×1.1, ongoing ×1, long-standing ×0.9', label: 'assumption', why: 'From the persona’s condition (acuity). A problem of weeks shifts faster than one of years.' },
    { id: 'adherence', name: 'Adherence', value: '(chapters a week ÷ 3)^0.4, at most 1.1', label: 'assumption', why: 'costModel’s adherence factor, reused unchanged. Chapters a week come from the persona’s daily minutes.' },
    { id: 'readiness', name: 'Readiness to change', value: `${READY_BASE} + ${READY_SLOPE} × readiness`, label: 'assumption', why: 'Readiness (0–1) is the persona’s stage of change × confidence, as the buyer agent reads it. Half-ready gives ×1.' },
    { id: 'severity', name: 'Severity', value: 'mild ×1.1, moderate ×1, severe ×0.85', label: 'assumption', why: 'From the starting sleep score: under 40 severe, 40–64 moderate, 65–84 mild.' },
    { id: 'fit', name: 'Fit', value: `×${FIT.audio} if audio, breath or music helps them, else ×${FIT.other}`, label: 'assumption', why: 'Aurelia is audio. The persona’s top helper says whether that suits them.' },
    { id: 'cap', name: 'Limits', value: `${Math.round(CHANCE_FLOOR * 100)}%–${Math.round(CHANCE_CAP * 100)}%`, label: 'assumption', why: 'No prediction this early may promise more than 90%, or write anyone off below 5%.' },
    { id: 'dropout', name: 'Failures that are drop-outs', value: `${Math.round(DROPOUT_SHARE * 100)}%`, label: 'assumption', why: 'Of the people a journey does not help, 6 in 10 stop using it; the rest stay but stall below Y. App retention studies show most failures are people stopping.' },
    { id: 'stall', name: 'People who stay but do not respond', value: `half speed, stall at ${NONRESPONDER_CEILING}`, label: 'assumption', why: 'They reach X but not Y. After the chapters a responder would need, the journey stops and they are offered something else.' },
  ]
}

/* ----------------------------------------------------- Chapters to flip */

export const upliftAt = (score: number, stageUplift: number, cond: number, acuity: number) => stageUplift * PHASE_MULT[layerAt(score)] * cond * acuity

/** Score after each chapter, 0 = the start; stops when the target is reached or at the horizon. */
export function trajectory(start: number, opts: { stage?: Stage; acuity?: Acuity; speed?: number; ceiling?: number; target?: number; maxChapters?: number } = {}): number[] {
  const stage = opts.stage ?? 1
  const target = opts.target ?? GOOD_SCORE
  const ceiling = opts.ceiling ?? 100
  const cond = conditionFactor(start)
  const ac = ACUITY_SPEED[opts.acuity ?? 'ongoing']
  const speed = opts.speed ?? 1
  const max = opts.maxChapters ?? 200
  const out = [start]
  let s = start
  while (s < target && out.length <= max) {
    s = Math.min(ceiling, s + upliftAt(s, STAGES[stage].uplift, cond, ac) * speed)
    out.push(Math.round(s * 100) / 100)
    if (s >= ceiling && ceiling < target) {
      while (out.length <= max) out.push(s)
      break
    }
  }
  return out
}

/** The first chapter at which a trajectory reaches a score; Infinity if never. */
export function chapterReaching(traj: number[], threshold: number): number {
  const i = traj.findIndex((s) => s >= threshold)
  return i < 0 ? Infinity : i
}

/** Chapters from start to the good state, by the layered curve. */
export const chaptersToFlip = (start: number, stage: Stage = 1, acuity: Acuity = 'ongoing') => chapterReaching(trajectory(start, { stage, acuity }), GOOD_SCORE)

/* ------------------------------------------------------------ Chance it works */

export interface ChanceParts {
  base: number
  adherence: number
  readiness: number
  severity: number
  fit: number
  raw: number
  chance: number
  capped: boolean
}

export function chanceOf(input: { stage?: Stage; perWeek: number; readiness: number; severity: Severity; topHelper: Helper }): ChanceParts {
  const base = STAGES[input.stage ?? 1].success
  const adherence = adherenceFactor(input.perWeek)
  const readiness = READY_BASE + READY_SLOPE * input.readiness
  const severity = SEVERITY_CHANCE[input.severity]
  const fit = AUDIO_HELPERS.includes(input.topHelper) ? FIT.audio : FIT.other
  const raw = base * adherence * readiness * severity * fit
  const chance = clamp(raw, CHANCE_FLOOR, CHANCE_CAP)
  return { base, adherence, readiness, severity, fit, raw, chance, capped: chance !== raw }
}

/* ------------------------------------------------------------- One person */

export interface PersonFlip {
  id: string
  name: string
  age: number
  country: string
  scenario: string
  start: number
  severity: Severity
  acuity: Acuity
  perWeek: number
  readiness: number
  topHelper: Helper
  chance: ChanceParts
  /** Responder's chapters to reach X, Y, Z (Z = the flip). */
  reach: Record<MilestoneId, number>
  chapters: number
  weeks: number
  /** Probability of still being in the journey at its end. */
  survival: number
  /** Per-chapter chance of stopping. */
  hazard: number
  /** Share of those who stay to the end who flip. */
  responder: number
  responderPath: number[]
  stallPath: number[]
  why: string[]
}

const r2 = (x: number) => Math.round(x * 100) / 100
const pct = (x: number) => `${Math.round(x * 100)}%`

export function personFlip(p: PersonaV4, c: ConditionV4, start: number, severity: Severity, stage: Stage = 1): PersonFlip {
  const buyer = conditionForBuyer(p, c)
  const perWeek = perWeekOf(c.minutesPerDay)
  const chance = chanceOf({ stage, perWeek, readiness: buyer.readiness, severity, topHelper: c.helpers[0] })
  const responderPath = trajectory(start, { stage, acuity: c.acuity })
  const chapters = chapterReaching(responderPath, GOOD_SCORE)
  const stallPath = trajectory(start, { stage, acuity: c.acuity, speed: NONRESPONDER_SPEED, ceiling: Math.max(NONRESPONDER_CEILING, Math.min(GOOD_SCORE - 1, start + 5)), maxChapters: chapters })
  const survival = 1 - DROPOUT_SHARE * (1 - chance.chance)
  const hazard = chapters > 0 ? 1 - Math.pow(survival, 1 / chapters) : 0
  const responder = chance.chance / survival
  const reach = Object.fromEntries(MILESTONES.map((m) => [m.id, chapterReaching(responderPath, m.threshold)])) as Record<MilestoneId, number>
  const cond = conditionFactor(start)
  const ac = ACUITY_SPEED[c.acuity]
  const u = STAGES[stage].uplift
  return {
    id: p.id, name: p.name, age: p.age, country: p.country, scenario: p.scenario, start, severity, acuity: c.acuity, perWeek, readiness: buyer.readiness, topHelper: c.helpers[0],
    chance, reach, chapters, weeks: chapters / perWeek, survival, hazard, responder, responderPath, stallPath,
    why: [
      `Uplift per chapter = ${u} (spec) × layer (mood ${PHASE_MULT.mood} / habit ${PHASE_MULT.habit} / skill ${PHASE_MULT.skill}) × start ${r2(cond)} × ${c.acuity} ${ac} = ${r2(u * PHASE_MULT.mood * cond * ac)} / ${r2(u * PHASE_MULT.habit * cond * ac)} / ${r2(u * PHASE_MULT.skill * cond * ac)} points`,
      `Chapters: ${start} → 45 (X) in ${reach.X}, → 65 (Y) in ${reach.Y}, → 85 (Z, the flip) in ${chapters}; at ${perWeek} a week that is ${r2(chapters / perWeek)} weeks`,
      `Chance = ${chance.base} (spec) × adherence ${r2(chance.adherence)} (${perWeek} a week) × readiness ${r2(chance.readiness)} (${buyer.readiness}) × severity ${chance.severity} (${severity}) × fit ${chance.fit} (${c.helpers[0]}) = ${r2(chance.raw)}${chance.capped ? `, limited to ${r2(chance.chance)}` : ''} → ${pct(chance.chance)}`,
      `Still going at the end = 1 − ${DROPOUT_SHARE} × (1 − ${r2(chance.chance)}) = ${pct(survival)}, so ${(hazard * 100).toFixed(2)}% stop at each chapter; of those who stay, ${pct(responder)} flip`,
    ],
  }
}

/* --------------------------------------------------------- The spec, flat */

const BALANCED = PRESETS.find((x) => x.id === 'balanced')!

/** The spec's journey as costModel computes it today (unchanged): 25 → 85, 10-minute chapters, 3 a week, Stage 1. */
export function specFlat(stage: Stage = 1) {
  const g = goal({ ...DEFAULT_GOAL, stage }, presetInputs(BALANCED, 10))
  return { chapters: g.chapters, chance: g.flipProbability, costPerChapter: g.costPerChapter, costPerFlip: g.costPerFlip, specChapters: STAGES[stage].specChapters }
}

/* ---------------------------------------------------------------- Cohort */

export interface ChapterRow {
  chapter: number
  /** Still in the journey (not flipped, not stopped), share of everyone who started. */
  active: number
  /** Stopped using it before the end. */
  dropped: number
  /** Played every chapter a responder would need without flipping, and was offered something else. */
  notHelped: number
  flipped: number
  reached: Record<MilestoneId, number>
  /** Average score of the people still in the journey. */
  scoreActive: number
  /** Average score of everyone who started: stopped people at their last score, flipped people at their flip score. */
  scoreAll: number
  layer: Layer
  /** Of the people still going, the share in each layer's stretch. */
  layerMix: Record<Layer, number>
}

export interface Cohort {
  people: PersonFlip[]
  rows: ChapterRow[]
  horizon: number
  meanChance: number
  medianChapters: number
  meanChapters: number
  /** Expected chapters played per person who starts. */
  chaptersPlayed: number
  costPerChapter: number
  /** Cost per chapter × chapters played ÷ share flipped. */
  costPerFlip: number
  flippedAt: (n: number) => number
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

let cohortCache: Cohort | null = null

/**
 * Follow the sleep cohort chapter by chapter. For each person, each chapter:
 *   stays with probability (1 − hazard); a responder (share `responder`) follows
 *   the layered curve and flips at `chapters`; a non-responder improves at half
 *   speed, stalls below Y, and stops being offered chapters at `chapters`.
 * Every share is the cohort mean of those per-person probabilities.
 */
export function sleepCohort(stage: Stage = 1): Cohort {
  if (stage === 1 && cohortCache) return cohortCache
  const who = whoHasIt()
  const people = who.cohort.map((x) => personFlip(x.p, x.c, x.score, x.severity, stage))
  const horizon = Math.min(HORIZON, Math.max(...people.map((p) => p.chapters)))
  const n = people.length
  const rows: ChapterRow[] = []
  for (let t = 0; t <= horizon; t++) {
    let active = 0
    let flipped = 0
    let notHelped = 0
    let wScore = 0
    let allScore = 0
    const reached = { X: 0, Y: 0, Z: 0 } as Record<MilestoneId, number>
    const mix = { mood: 0, habit: 0, skill: 0 } as Record<Layer, number>
    for (const p of people) {
      const q = 1 - p.hazard
      const N = p.chapters
      const sR = (k: number) => p.responderPath[Math.min(k, p.responderPath.length - 1)]
      const sN = (k: number) => p.stallPath[Math.min(k, p.stallPath.length - 1)]
      const inR = t < N ? p.responder * q ** t : 0
      const inN = t < N ? (1 - p.responder) * q ** t : 0
      active += inR + inN
      wScore += inR * sR(t) + inN * sN(t)
      mix[layerAt(sR(t))] += inR
      mix[layerAt(sN(t))] += inN
      const fl = t >= N ? p.responder * q ** N : 0
      flipped += fl
      if (t >= N) notHelped += (1 - p.responder) * q ** N
      for (const m of MILESTONES) {
        const kR = chapterReaching(p.responderPath, m.threshold)
        const kN = chapterReaching(p.stallPath, m.threshold)
        if (t >= kR) reached[m.id] += p.responder * q ** kR
        if (t >= kN && kN <= N) reached[m.id] += (1 - p.responder) * q ** kN
      }
      // Everyone who started: still going at today's score, flipped at the flip score, stopped at the score they stopped on;
      // non-responders who reached the end without flipping keep their last score.
      let all = inR * sR(t) + inN * sN(t) + fl * sR(N)
      const last = Math.min(t, N)
      for (let k = 1; k <= last; k++) {
        const stop = q ** (k - 1) * (1 - q)
        all += stop * (p.responder * sR(k - 1) + (1 - p.responder) * sN(k - 1))
      }
      if (t >= N) all += (1 - p.responder) * q ** N * sN(N)
      allScore += all
    }
    const reachedShare = { X: reached.X / n, Y: reached.Y / n, Z: reached.Z / n }
    const scoreActive = active > 0 ? wScore / active : NaN
    rows.push({
      chapter: t,
      active: active / n,
      flipped: flipped / n,
      dropped: 1 - active / n - flipped / n - notHelped / n,
      notHelped: notHelped / n,
      reached: reachedShare,
      scoreActive,
      scoreAll: allScore / n,
      layer: layerAt(Number.isFinite(scoreActive) ? scoreActive : GOOD_SCORE),
      layerMix: { mood: active ? mix.mood / active : 0, habit: active ? mix.habit / active : 0, skill: active ? mix.skill / active : 0 },
    })
  }
  const meanChance = people.reduce((t, p) => t + p.chance.chance, 0) / n
  const chaptersPlayed = people.reduce((t, p) => {
    const q = 1 - p.hazard
    let played = 0
    for (let k = 1; k <= p.chapters; k++) played += q ** k
    return t + played
  }, 0) / n
  const costPerChapter = total(chapterCost(presetInputs(BALANCED, 10))) * STAGES[stage].costFactor
  const out: Cohort = {
    people, rows, horizon, meanChance,
    medianChapters: median(people.map((p) => p.chapters)),
    meanChapters: people.reduce((t, p) => t + p.chapters, 0) / n,
    chaptersPlayed,
    costPerChapter,
    costPerFlip: (costPerChapter * chaptersPlayed) / meanChance,
    flippedAt: (k: number) => rows[Math.min(k, rows.length - 1)].flipped,
  }
  if (stage === 1) cohortCache = out
  return out
}

/* -------------------------------------------------------- Worked examples */

/** One person per severity (mild, moderate, severe): the one whose chance is nearest their group's median. */
export function examplePeople(c: Cohort = sleepCohort()): { severity: Severity; person: PersonFlip }[] {
  const out: { severity: Severity; person: PersonFlip }[] = []
  for (const sev of ['mild', 'moderate', 'severe'] as Severity[]) {
    const group = c.people.filter((p) => p.severity === sev)
    if (!group.length) continue
    const m = median(group.map((p) => p.chance.chance))
    const person = [...group].sort((a, b) => Math.abs(a.chance.chance - m) - Math.abs(b.chance.chance - m) || a.id.localeCompare(b.id))[0]
    out.push({ severity: sev, person })
  }
  return out
}

/** The spec's 25 → 85 journey through the layered curve with every person factor at 1 (computed calibration). */
export const calibrationChapters = (stage: Stage = 1) => chaptersToFlip(BAD_SCORE, stage, 'ongoing')

/** What drives each stretch of the journey, for the chart's annotations. */
export function driverOf(layer: Layer) {
  return MILESTONES.find((m) => m.layer === layer)!
}

/* ------------------------------------------------ Any StateFlip (U141, J203) */

/** The headline numbers of any StateFlip's group, from its people alone (no chapter-by-chapter rows). */
export interface FlipSummary {
  people: number
  medianChapters: number
  meanChance: number
  /** Expected chapters played per person who starts. */
  chaptersPlayed: number
  costPerChapter: number
  costPerFlip: number
}

/**
 * The same formulas as `sleepCohort`, generalised to any StateFlip: the
 * median of each person's chapters to 85, the mean chance, chapters played
 * (Σ survival to each chapter) and cost per flip. On the sleep group it gives
 * sleepCohort's numbers exactly (pinned in stateFlips.test.ts).
 */
export function summarise(people: PersonFlip[], stage: Stage = 1): FlipSummary {
  const costPerChapter = total(chapterCost(presetInputs(BALANCED, 10))) * STAGES[stage].costFactor
  const n = people.length
  if (!n) return { people: 0, medianChapters: NaN, meanChance: NaN, chaptersPlayed: NaN, costPerChapter, costPerFlip: NaN }
  const meanChance = people.reduce((t, p) => t + p.chance.chance, 0) / n
  const chaptersPlayed = people.reduce((t, p) => {
    const q = 1 - p.hazard
    let played = 0
    for (let k = 1; k <= p.chapters; k++) played += q ** k
    return t + played
  }, 0) / n
  return { people: n, medianChapters: median(people.map((p) => p.chapters)), meanChance, chaptersPlayed, costPerChapter, costPerFlip: (costPerChapter * chaptersPlayed) / meanChance }
}
