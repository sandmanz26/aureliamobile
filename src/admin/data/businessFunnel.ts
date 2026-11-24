import { z } from 'zod'
import { report, type AgentId, type DesignId, type StepId } from './buyerSim'
import { buildParticipants } from './study'

/**
 * Business funnel (U108, J153): Eugene's lighthouse, "Moving from Bad to
 * Good" (entry → AI aha → usage cap → Aurelia Plus), adapted to the app as it
 * is, plus the result all four serve (staying). Each stage carries the
 * metrics from the measurement review (J150) with a target, the buyer agents'
 * prediction (buyerSim) and the feedback group's measurement (study.ts,
 * sample until there is a backend). The stage furthest below target is what
 * to fix next; the decision log is the loop's memory.
 */

export type StageId = 'entry' | 'aha' | 'cap' | 'upsell' | 'stay'

export interface Stage {
  id: StageId
  title: string
  /** Eugene's description, from the lighthouse. */
  eugene: string
  /** What the stage is in Aurelia today. */
  aurelia: string
  /** The buyer agents' steps it covers (buyerSim). */
  steps: StepId[]
  /** User journey moments where it happens (userJourney.ts ids). */
  moments: string[]
  /** Metrics from the J150 shortlist that belong here but need a backend to measure. */
  later: string[]
}

export const STAGES: Stage[] = [
  {
    id: 'entry',
    title: 'Frictionless entry',
    eugene: 'Quick daily check-ins and basic tracking. Zero barrier to start.',
    aurelia: 'Home, a Quick Start session before any account, then the daily check-in.',
    steps: ['land', 'quick-play', 'sign-in'],
    moments: ['r1'],
    later: ['Time to first play'],
  },
  {
    id: 'aha',
    title: 'The AI “aha” moment',
    eugene: 'The AI connects the dots during a bad state and gives a tailored micro-plan.',
    aurelia: 'One sentence becomes their own session; they finish it, and the check-in says they feel better.',
    steps: ['onboarding', 'first-build', 'finish', 'check-in'],
    moments: ['r2', 'e2', 'e5'],
    later: ['Drop-off point inside a session', 'Building-block effect (which voice, technique or length helps)'],
  },
  {
    id: 'cap',
    title: 'The usage cap',
    eugene: 'After X free AI messages, the user hits a usage threshold mid-momentum.',
    aurelia: 'The free limit: 3 sends, then 30 minutes, counted after the first build (production v2 and v3).',
    steps: ['hits-cap'],
    moments: ['c1', 'c2'],
    later: [],
  },
  {
    id: 'upsell',
    title: 'The upsell: Aurelia Plus',
    eugene: 'A prompt right at the limit; paying removes the cap so they can reach the good state.',
    aurelia: 'The Upgrade screen, “Aurelia AI Plus”: $10 a month or $100 a year. Nothing can be bought yet.',
    steps: ['upgrade'],
    moments: ['h1'],
    later: ['Subscribes within 7 days of the limit (once Plus can be bought)'],
  },
  {
    id: 'stay',
    title: 'Staying in the good state',
    eugene: 'The result the four stages serve: they keep coming back as things improve.',
    aurelia: 'The next chapter, progress told in their own words, and the check-in, week after week.',
    steps: ['come-back'],
    moments: ['e1', 'r1'],
    later: ['Day 1 return, measured', '7-day consistency (“4 of 7”)', 'Time to flip: first low check-in to a steady good one'],
  },
]

export interface FunnelMetric {
  id: string
  stage: StageId
  label: string
  /** Default target, 0–1; the team can change it. */
  target: number
  agent: number
  /** The feedback group's measurement; null when the study does not measure it. */
  human: number | null
  /** Where the human number comes from, or why there is none. */
  humanNote: string
  /** How to read it, where below target does not mean what it seems. */
  reading?: string
}

/** The feedback group study's participants at a given study week (sample data, 30 people). */
function study(week: number) {
  const ps = buildParticipants(Math.max(1, week))
  const enrolled = ps.filter((p) => p.status !== 'withdrawn' || p.sessionsByWeek.some((n) => n > 0))
  const share = (f: (p: (typeof ps)[number]) => boolean) => (enrolled.length ? enrolled.filter(f).length / enrolled.length : 0)
  const w = Math.max(1, Math.min(8, week))
  return {
    n: enrolled.length,
    playedWeek1: share((p) => (p.sessionsByWeek[0] ?? 0) > 0),
    feltBetter: share((p) => (p.moodLift ?? 0) > 0),
    activeLatest: share((p) => (p.sessionsByWeek[w - 1] ?? 0) > 0),
    activeWeek5: w >= 5 ? share((p) => p.sessionsByWeek.slice(4).some((n) => n > 0)) : null,
  }
}

/** Every metric, with the chosen buyer agent run and the study at `week`. */
export function funnelMetrics(agent: AgentId, design: DesignId, week: number): FunnelMetric[] {
  const r = report(agent, design)
  const s = study(week)
  const done = r.walks.filter((w) => w.completed && w.activated)
  const felt = done.length ? done.reduce((sum, w) => sum + w.feltBetter, 0) / done.length : 0
  const fg = `Feedback group (sample, ${s.n} people, study week ${Math.max(1, Math.min(8, week))})`
  return [
    { id: 'activation', stage: 'entry', label: 'Hears a session on the first visit', target: 0.7, agent: r.activation, human: s.playedWeek1, humanNote: `${fg}: played a session in week 1` },
    { id: 'completion', stage: 'aha', label: 'Finishes their own first session', target: 0.6, agent: r.completion, human: null, humanNote: 'Needs session-end events; click insights records taps, not listening' },
    { id: 'felt', stage: 'aha', label: 'Feels better after a session', target: 0.6, agent: felt, human: s.feltBetter, humanNote: `${fg}: average check-in after minus before is above zero` },
    { id: 'cap', stage: 'cap', label: 'Hits the free limit in week one', target: 0.3, agent: r.capHit, human: null, humanNote: 'Not measured: the study does not use the free plan', reading: 'Below target means too few use it enough to want more, so the aha is not strong enough yet.' },
    { id: 'plus', stage: 'upsell', label: 'Chooses Plus at the limit', target: 0.15, agent: r.capToPlus, human: null, humanNote: 'Not measured: nothing can be bought yet' },
    { id: 'd7', stage: 'stay', label: 'Back after a week', target: 0.15, agent: r.d7, human: s.activeLatest, humanNote: `${fg}: played this study week` },
    { id: 'd30', stage: 'stay', label: 'Still using after a month', target: 0.05, agent: r.d30, human: s.activeWeek5, humanNote: s.activeWeek5 === null ? 'The study has not reached week 5 yet' : `${fg}: played in week 5 or later` },
    { id: 'ellis', stage: 'stay', label: '“Very disappointed” without it', target: 0.4, agent: r.ellis, human: null, humanNote: 'Not asked yet: add the question to the week-8 survey' },
  ]
}

export type Status = 'on-track' | 'below' | 'unmeasured'

/**
 * How a stage stands: the worst of its metrics against target, on the buyer
 * agents' prediction for the chosen version. The feedback group is shown
 * beside it but not used here: it is a recruited, supported group, so its
 * numbers run far above an app's open funnel and would hide the leaks.
 */
export function stageStatus(metrics: FunnelMetric[], targets: Record<string, number>, stage: StageId) {
  const own = metrics.filter((m) => m.stage === stage)
  const ratios = own.map((m) => m.agent / Math.max(0.0001, targets[m.id] ?? m.target))
  const worst = Math.min(...ratios)
  const status: Status = worst >= 1 ? 'on-track' : 'below'
  return { worst, status, measuredByPeople: own.some((m) => m.human !== null) }
}

/** The stage furthest below its target: what to fix next. */
export function biggestLeak(metrics: FunnelMetric[], targets: Record<string, number>): StageId | null {
  let best: { id: StageId; worst: number } | null = null
  for (const s of STAGES) {
    const { worst } = stageStatus(metrics, targets, s.id)
    if (worst < 1 && (!best || worst < best.worst)) best = { id: s.id, worst }
  }
  return best?.id ?? null
}

/* ------------------------------------------------------------ Decision log */

export const DECISION_STATUSES = ['proposed', 'decided', 'building', 'shipped', 'measured'] as const
export type DecisionStatus = (typeof DECISION_STATUSES)[number]

export const DecisionSchema = z.object({
  id: z.string(),
  date: z.string(),
  stage: z.enum(['entry', 'aha', 'cap', 'upsell', 'stay']),
  finding: z.string(),
  change: z.string(),
  source: z.string(),
  status: z.enum(DECISION_STATUSES),
  version: z.string(),
  result: z.string(),
})
export type Decision = z.infer<typeof DecisionSchema>
export const DecisionsSchema = z.array(DecisionSchema)
export const DECISIONS_KEY = 'aurelia.admin.funnelDecisions'
export const TARGETS_KEY = 'aurelia.admin.funnelTargets'
export const TargetsSchema = z.record(z.string(), z.number().min(0).max(1))

/** The loop so far: real findings from the buyer agents, the research and the shipped versions. */
export const DEFAULT_DECISIONS: Decision[] = [
  {
    id: 'd1',
    date: '2026-11-19',
    stage: 'entry',
    finding: 'An account before their own session loses 5–7 people in every version; it moved the most answers in run v3 (16 of 36).',
    change: 'Let the first personal session start without an account.',
    source: 'Buyer agent v3 and the re-run (J135, J139)',
    status: 'proposed',
    version: '',
    result: '',
  },
  {
    id: 'd2',
    date: '2026-11-19',
    stage: 'aha',
    finding: 'Production v3’s extra onboarding question (the wearable) costs impatient people before their own session: completion 53% against 63%.',
    change: 'Ask for the wearable after the first session.',
    source: 'Re-run, agent v3 × production v3 (O42)',
    status: 'proposed',
    version: '',
    result: '',
  },
  {
    id: 'd3',
    date: '2026-11-19',
    stage: 'entry',
    finding: 'English only fails people over 65 who read another language first, and slows most non-English speakers.',
    change: 'Sessions in the panel’s main languages, starting with Spanish, Portuguese and Indonesian.',
    source: 'Buyer agent v2 and v3 (J134, J135)',
    status: 'proposed',
    version: '',
    result: '',
  },
  {
    id: 'd4',
    date: '2026-11-23',
    stage: 'upsell',
    finding: 'The Upgrade screen lists features; nothing on it is about the person. The brief’s model sells the relief of reaching the good state.',
    change: 'At the limit, show their own progress from their check-ins (never an invented number), then the offer.',
    source: 'The freemium brief and the lighthouse (J148)',
    status: 'proposed',
    version: '',
    result: '',
  },
  {
    id: 'd7',
    date: '2026-11-23',
    stage: 'stay',
    finding: 'Nothing brings them back is the top reason agents leave after a good first week (8 of 36, agent v3 × production v3). The calendar reminder is offered once, in the player, and easy to pass.',
    change: 'Make the next chapter’s time part of the check-in: they pick it, and a calendar or notification reminder is set. Forgiving, no streaks.',
    source: 'Re-run leave reasons (J139, J153); research on streaks (J094)',
    status: 'proposed',
    version: '',
    result: '',
  },
  {
    id: 'd8',
    date: '2026-11-24',
    stage: 'entry',
    finding: 'Retreat-in-a-Box as written loses money on every ticket (24 personalised sessions and a physical box cost more than Aurelia’s €6.45 share), asks creators to give up 40% where course platforms take 0–10%, and plans on 76.5% active at week 8 where mindfulness apps keep 4.7% at day 30.',
    change: 'Redesign the offer: 70/30 plus a share of the Plus each cohort drives, a journey produced once in the creator’s voice with personal inserts, a digital kit, €39 tested against €19.99; plan on 20–50% at week 8 and measure Plus per ticket buyer.',
    source: 'B2B2C research (J154, /wiki/b2b2c); approved by the product owner (J159)',
    status: 'decided',
    version: '',
    result: '',
  },
  {
    id: 'd5',
    date: '2026-10-27',
    stage: 'cap',
    finding: 'The free limit counted from the first message, so it could stop people before their own session.',
    change: 'Count the limit only from the first build.',
    source: 'First-time review (J039)',
    status: 'shipped',
    version: 'Production v2 and v3',
    result: 'The re-run sees the cap stop people before their session only in production v1.',
  },
  {
    id: 'd6',
    date: '2026-11-13',
    stage: 'stay',
    finding: 'Interviewed users distrusted sample analytics; skeptical people want proof that is theirs.',
    change: 'Tell progress in words from their own check-ins; a Why on every suggestion.',
    source: 'First user interviews (J049)',
    status: 'measured',
    version: 'Production v3',
    result: 'Re-run, v2 rules: back after a week 10% on production v3 against 8% on v2.',
  },
]

/** A stored log keeps its edits; defaults added since it was saved are appended. */
export function withNewDefaults(stored: Decision[]): Decision[] {
  const have = new Set(stored.map((d) => d.id))
  return [...stored, ...DEFAULT_DECISIONS.filter((d) => !have.has(d.id))]
}

export const STATUS_LABEL: Record<DecisionStatus, string> = {
  proposed: 'Proposed',
  decided: 'Decided',
  building: 'Building',
  shipped: 'Shipped',
  measured: 'Measured',
}
