/**
 * The three metric lines over time (A31; U146, J206), as the spec asks: compute
 * cost (cost per flip), Causal AI (density and velocity) and therapeutic (the
 * share of the sleep cohort that flips). "Time" is the spec's three Causal AI
 * stages, from under 1,000 sessions to 100,000+: there is no calendar data yet.
 *
 * Everything is worked out from costModel.ts (STAGES, goal(), the Balanced
 * preset at 10 minutes, 3 chapters a week) and the sleep cohort in
 * stateFlipSleep.ts. Nothing here is measured: the stage figures are the
 * business owner's spec and the people are simulated.
 */
import { DEFAULT_GOAL, PRESETS, STAGES, goal, presetInputs, type GoalInputs, type Stage } from './costModel'
import { GOOD_SCORE, whoHasIt } from './stateFlipSleep'

export const LINE_STAGES: Stage[] = [1, 2, 3]
/** A cohort member counts as flipped when the journey fits the 8-week study; weighted by the chance it works. */
export const FLIP_WINDOW_WEEKS = 8

export interface MetricPoint {
  stage: Stage
  sessions: string
  /** Mean cost per flip over the sleep cohort, in US dollars. */
  costPerFlip: number
  /** Cost per flip as a share of stage 1's, 0–1, so it shares the chart's axis. */
  costIndex: number
  density: number
  velocity: number
  /** Expected share of the sleep cohort that flips within the window, 0–1. */
  flipped: number
}

const balanced10 = () => presetInputs(PRESETS.find((p) => p.id === 'balanced')!, 10)

export function metricLines(): MetricPoint[] {
  const cohort = whoHasIt().cohort
  const c = balanced10()
  const raw = LINE_STAGES.map((stage) => {
    let cost = 0
    let flipped = 0
    for (const m of cohort) {
      const g = goal({ ...DEFAULT_GOAL, baseline: m.score, target: GOOD_SCORE, stage }, c)
      cost += g.costPerFlip
      if (g.weeks <= FLIP_WINDOW_WEEKS) flipped += g.flipProbability
    }
    const n = Math.max(1, cohort.length)
    return { stage, sessions: STAGES[stage].sessions, costPerFlip: cost / n, density: STAGES[stage].density, velocity: STAGES[stage].velocity, flipped: flipped / n }
  })
  return raw.map((p) => ({ ...p, costIndex: p.costPerFlip / raw[0].costPerFlip }))
}

export interface Driver {
  id: string
  label: string
  /** The two settings compared, worst first. */
  from: string
  to: string
  /** Cost per flip at each, US dollars. */
  costFrom: number
  costTo: number
  /** Relative change, −1 to +∞; negative is cheaper. */
  change: number
}

/** Top Causal AI drivers: how far each input of goal() moves cost per flip from the default journey, largest first. */
export function topDrivers(): Driver[] {
  const base: GoalInputs = { ...DEFAULT_GOAL }
  const c = balanced10()
  const cost = (g: Partial<GoalInputs>, ci = c) => goal({ ...base, ...g }, ci).costPerFlip
  const lean = presetInputs(PRESETS.find((p) => p.id === 'lean')!, 10)
  const premium = presetInputs(PRESETS.find((p) => p.id === 'premium')!, 10)
  const rows: Omit<Driver, 'change'>[] = [
    { id: 'stage', label: 'Causal AI stage (cost factor, uplift, success)', from: 'Stage 1', to: 'Stage 3', costFrom: cost({ stage: 1 }), costTo: cost({ stage: 3 }) },
    { id: 'models', label: 'Model tier and reuse', from: 'Premium', to: 'Lean', costFrom: cost({}, premium), costTo: cost({}, lean) },
    { id: 'personal', label: 'Personalisation', from: 'Fully generated', to: 'Personal inserts', costFrom: cost({}, { ...c, personalisation: 'full' }), costTo: cost({}, { ...c, personalisation: 'inserts' }) },
    { id: 'adherence', label: 'Chapters a week (adherence)', from: '1 a week', to: '3 a week', costFrom: cost({ chaptersPerWeek: 1 }), costTo: cost({ chaptersPerWeek: 3 }) },
    { id: 'severity', label: 'Starting severity', from: 'Score 15', to: 'Score 45', costFrom: cost({ baseline: 15 }), costTo: cost({ baseline: 45 }) },
    { id: 'length', label: 'Chapter length', from: '3 minutes', to: '10 minutes', costFrom: cost({}, { ...c, minutes: 3 }), costTo: cost({}, c) },
  ]
  return rows.map((r) => ({ ...r, change: r.costTo / r.costFrom - 1 })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}
