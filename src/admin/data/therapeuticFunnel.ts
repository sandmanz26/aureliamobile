/**
 * Admin → AI brain → Therapeutic funnel (U148, J206). Per StateFlip, the
 * stages a person passes on the way from a bad state to a good one that lasts:
 * has the problem → starts → finishes chapter 1 → reaches X → Y → Z (the flip)
 * → stays good, with how many people reach each, the drop-off, the reason for
 * it and the levers (AKPs and features) that move it.
 *
 * Read-only on stateFlips.ts and stateFlipFormulas.ts: it rebuilds each
 * StateFlip's group the way `flipNumbers` does (sleep: `sleepCohort`) and
 * reads each person's own probabilities (hazard, responder share, milestone
 * chapters), so the funnel's flip share is the same "chance it works" the
 * StateFlips page shows. One stage, "stays good", has no model anywhere yet:
 * it is an assumption, labelled so.
 *
 * Pure: no React, deterministic.
 */

import { akpsForFlip, type Akp } from './akps'
import { conditionsV4 } from './personaConditionV4'
import { generatePersonasV4 } from './personasV4'
import { chapterReaching, personFlip, sleepCohort, type PersonFlip } from './stateFlipFormulas'
import { stateFlipById, stateFlips, type StateFlip } from './stateFlips'
import { severityOf, whoHasIt, type MilestoneId, type NumLabel } from './stateFlipSleep'

export const DEFAULT_FLIP = 'SF-PHY-01'

/**
 * Share of people who flip and are still in the good state 12 weeks later.
 * Assumption: no source in the spec, the workbooks or our research. It is a
 * placeholder so the last stage is visible; the 4- and 12-week follow-up
 * check-ins of the pilot replace it.
 */
export const HOLD_12_WEEKS = 0.8

export type StageId = 'problem' | 'starts' | 'chapter1' | 'X' | 'Y' | 'Z' | 'holds'

export interface FunnelStage {
  id: StageId
  title: string
  /** Expected number of people at this stage (sum of per-person probabilities). */
  people: number
  /** Share of everyone with the problem. */
  ofProblem: number
  /** Share of the stage before (1 for the first stage). */
  ofPrevious: number
  /** Expected number lost between the stage before and this one. */
  lost: number
  label: NumLabel
  /** How the number is worked out, in one sentence. */
  how: string
  /** Why people are lost before this stage. */
  why: string
  /** What moves this stage: features and AKP families. */
  levers: string[]
  /** AKP ids from the catalogue that work on this stage. */
  akps: string[]
}

export interface Funnel {
  flip: StateFlip
  stages: FunnelStage[]
  /** The stage that loses the most people after the start. */
  biggestDrop: FunnelStage
  group: number
  riskFlagged: number
  /** How the group was chosen. */
  basis: string
}

interface Group {
  people: PersonFlip[]
  /** People with the problem who are excluded from the journey for a risk flag. */
  riskFlagged: number
  basis: string
}

function groupFor(f: StateFlip): Group {
  if (f.id === 'SF-PHY-01') {
    const w = whoHasIt()
    return {
      people: sleepCohort().people,
      riskFlagged: w.sleepNeedRisk,
      basis: `The sleep cohort of the StateFlips page: ${w.sleepNeed} of the ${w.personas.toLocaleString('en-GB')} v4 personas have a sleep need; ${w.sleepNeedRisk} carry a risk flag and are not started.`,
    }
  }
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const people: PersonFlip[] = []
  let risk = 0
  for (const p of ps) {
    const c = cs.get(p.id)!
    const dim = c.dims[f.dimension]
    if (!f.issues.includes(dim.issue) || dim.band === 'good') continue
    if (c.excluded) {
      risk++
      continue
    }
    people.push(personFlip(p, c, dim.score, severityOf(dim.score)))
  }
  return {
    people,
    riskFlagged: risk,
    basis: `v4 personas whose ${f.dimension} issue is ${f.issues.join(', ')} and whose band is not good, as on the StateFlips page; ${risk} carry a risk flag and are not started.`,
  }
}

/** Probability a person reaches a score at or after chapter 1 (they must finish chapter 1 to count). */
function reachShare(p: PersonFlip, threshold: number): number {
  const q = 1 - p.hazard
  const N = p.chapters
  const kR = Math.max(1, chapterReaching(p.responderPath, threshold))
  const kN = Math.max(1, chapterReaching(p.stallPath, threshold))
  let s = 0
  if (kR <= N) s += p.responder * q ** kR
  if (kN <= N && Number.isFinite(kN)) s += (1 - p.responder) * q ** kN
  return s
}

const milestoneAkps = (all: Akp[], m: MilestoneId) => all.filter((a) => a.id.endsWith(`-${m}`)).map((a) => a.id)
const byLayer = (all: Akp[], layer: string) => all.filter((a) => a.kind === 'strategy' && a.layer.toLowerCase().includes(layer)).map((a) => a.id)

const CACHE = new Map<string, Funnel>()

export function therapeuticFunnel(flipId: string = DEFAULT_FLIP): Funnel {
  const hit = CACHE.get(flipId)
  if (hit) return hit
  const flip = stateFlipById(flipId) ?? stateFlipById(DEFAULT_FLIP)!
  const g = groupFor(flip)
  const n = g.people.length
  const sum = (fn: (p: PersonFlip) => number) => g.people.reduce((t, p) => t + fn(p), 0)
  const ms = Object.fromEntries(flip.milestones.map((m) => [m.id, m])) as Record<MilestoneId, StateFlip['milestones'][number]>
  const all = akpsForFlip(flip.id)
  const goal = all.find((a) => a.id === `WG-${flip.id.slice(3)}`)?.id
  const concepts = byLayer(all, 'concept')
  const skills = byLayer(all, 'skill')

  const problem = n + g.riskFlagged
  const chapter1 = sum((p) => (p.chapters >= 1 ? 1 - p.hazard : 1))
  const X = sum((p) => reachShare(p, ms.X.threshold))
  const Y = sum((p) => reachShare(p, ms.Y.threshold))
  const Z = sum((p) => p.chance.chance)
  const holds = Z * HOLD_12_WEEKS

  const raw: Omit<FunnelStage, 'ofProblem' | 'ofPrevious' | 'lost'>[] = [
    {
      id: 'problem', title: 'Has the problem', people: problem, label: 'computed',
      how: g.basis,
      why: '—',
      levers: ['Who it is for: intake asks the StateFlip’s check-in questions', 'The free plan and Quick Start bring people in (Business funnel)'],
      akps: goal ? [goal] : [],
    },
    {
      id: 'starts', title: 'Starts', people: n, label: 'assumption',
      how: 'Everyone without a risk flag is counted as starting chapter 1. How many really start is the Business funnel’s question (first visit → first session), not this one.',
      why: 'A risk flag (for example a crisis signal or a diagnosed condition) means Aurelia points to professional help instead of starting a journey. Wellness only, by design.',
      levers: ['Safety check on the first sentence, with local help lines', 'Clear wellness-only promise at intake'],
      akps: [],
    },
    {
      id: 'chapter1', title: 'Finishes chapter 1', people: chapter1, label: 'computed',
      how: 'Each person stays past a chapter with chance 1 − their per-chapter stop rate (from “still going at the end” = 1 − 60% × (1 − chance it works), spread over their chapters).',
      why: 'The first chapter does not land: the voice, the length or the timing is wrong, or the person was only curious.',
      levers: ['A first chapter built from their own sentence', 'Chapter length 3, 5 or 10 minutes', '“Change this session” (Lego bites) after the first play'],
      akps: concepts.slice(0, 3),
    },
    {
      id: 'X', title: `Reaches X: ${ms.X.title.toLowerCase()}`, people: X, label: 'computed',
      how: `Responders follow the layered curve and reach ${ms.X.threshold} at their own chapter; non-responders improve at half speed. Each counts with the chance of still being there by that chapter. People who start above ${ms.X.threshold} count once they finish chapter 1.`,
      why: `Mood layer (${ms.X.layer}): the fastest to move, so most losses here are people who stop, not people it does not help.`,
      levers: ['Morning check-in that shows the score moving', 'Calendar reminder for the next chapter', `Goal step ${ms.X.id} and the concepts that serve it`],
      akps: [...milestoneAkps(all, 'X'), ...concepts.slice(0, 2)],
    },
    {
      id: 'Y', title: `Reaches Y: ${ms.Y.title.toLowerCase()}`, people: Y, label: 'computed',
      how: `As for X, at ${ms.Y.threshold}. Non-responders stall below ${ms.Y.threshold} (their ceiling is 64), so only responders, or people who started high, get here.`,
      why: `Habit layer: slower. People it does not help stall below ${ms.Y.threshold} and are offered something else; others stop before the habit forms.`,
      levers: ['Journey chapters that follow the person’s goal', 'Tournaments: the AKPs that move people further are used more', 'Causal AI stage 2 (better uplift per chapter)'],
      akps: [...milestoneAkps(all, 'Y'), ...concepts.slice(2)],
    },
    {
      id: 'Z', title: 'Reaches Z: the flip', people: Z, label: 'computed',
      how: 'Equals each person’s chance it works: 54% (spec) × adherence × readiness × severity × fit, kept between 5% and 90%.',
      why: 'Skill layer: the slowest. Fewer chapters a week and low readiness are the two biggest drags.',
      levers: ['Chapters a week (adherence)', 'Skill AKPs in the later chapters', 'Progress told in words from their own check-ins'],
      akps: [...milestoneAkps(all, 'Z'), ...skills],
    },
    {
      id: 'holds', title: 'Stays good (12 weeks)', people: holds, label: 'assumption',
      how: `${Math.round(HOLD_12_WEEKS * 100)}% of people who flip, assumed. Nothing in the spec, the workbooks or our research gives a figure.`,
      why: 'Old patterns return after stress, travel or illness. Unknown until measured.',
      levers: ['Maintenance chapters once a week', 'Check-in at 4 and 12 weeks after the flip', 'A nudge when the score drops below Y'],
      akps: skills.slice(0, 2),
    },
  ]
  const stages: FunnelStage[] = raw.map((s, i) => {
    const prev = i ? raw[i - 1].people : s.people
    return { ...s, ofProblem: problem ? s.people / problem : 0, ofPrevious: prev ? s.people / prev : 0, lost: Math.max(0, prev - s.people) }
  })
  const biggestDrop = stages.slice(2).reduce((a, b) => (b.lost > a.lost ? b : a))
  const out: Funnel = { flip, stages, biggestDrop, group: n, riskFlagged: g.riskFlagged, basis: g.basis }
  CACHE.set(flipId, out)
  return out
}

/** The StateFlips for the selector, sleep first. */
export function funnelOptions(): { id: string; label: string }[] {
  const fs = stateFlips()
  const sleep = fs.find((f) => f.id === DEFAULT_FLIP)
  return [sleep!, ...fs.filter((f) => f.id !== DEFAULT_FLIP)].map((f) => ({ id: f.id, label: `${f.id} · ${f.title}` }))
}
