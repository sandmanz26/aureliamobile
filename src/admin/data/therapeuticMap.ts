import { DEFAULT_GOAL, PRESETS, STAGES, goal, presetInputs } from './costModel'
import { funnelMetrics } from './businessFunnel'

/**
 * Admin → Product lab → Therapeutic map (U131, J183). How a person moves from
 * a bad state to a good one, and how that ties to the product and the
 * business: the Product · Business · Wellness triangle, each corner with its
 * core targets, the links between corners, the bad-to-good process for sleep
 * as the app runs it, and the five wellness worlds. "Therapeutic" is an
 * internal metric name only; every claim here is wellness.
 *
 * Numbers come from the existing models and are labelled by kind: the buyer
 * agents' run (simulated), the cost model's stage 1 (assumption), the app's
 * own prices (measured, in the sense of "this is what the app says"), or
 * not measured.
 */

export type ValueKind = 'measured' | 'simulated' | 'assumption' | 'not-measured'

export const VALUE_KIND_TEXT: Record<ValueKind, string> = {
  measured: 'Measured',
  simulated: 'Simulated',
  assumption: 'Assumption',
  'not-measured': 'Not measured',
}

export type CornerId = 'product' | 'business' | 'wellness'

export interface CoreTarget {
  label: string
  target: string
  value: string
  kind: ValueKind
  source: string
}

export interface Corner {
  id: CornerId
  title: string
  /** One line: what this corner is about. */
  about: string
  parts: string[]
  targets: CoreTarget[]
}

export interface CornerLink {
  from: CornerId
  to: CornerId
  title: string
  how: string
}

const pct = (x: number) => `${Math.round(x * 100)}%`

/** The middle supplier option, 10-minute chapters, the default sleep goal (25 → 85). */
export function sleepJourney() {
  return goal(DEFAULT_GOAL, presetInputs(PRESETS[1], 10))
}

export function triangle(): { corners: Corner[]; links: CornerLink[] } {
  // The buyer agents' latest run on production v3, as Business funnel defaults to.
  const m = Object.fromEntries(funnelMetrics(3, 3, 1).map((x) => [x.id, x]))
  const j = sleepJourney()
  const sim = (id: string, label: string): CoreTarget => ({
    label,
    target: pct(m[id].target),
    value: pct(m[id].agent),
    kind: 'simulated',
    source: 'Buyer agents, run 3 on production v3 (Business funnel)',
  })
  const corners: Corner[] = [
    {
      id: 'product',
      title: 'Product',
      about: 'What the person does in the app: the moments of the user journey and the features that serve them.',
      parts: ['Check-in before', 'One sentence → a session', 'Change this session (building blocks)', 'Listen to the end', 'Check-in after', 'Next chapter'],
      targets: [
        sim('activation', 'Hears a session on the first visit'),
        sim('completion', 'Finishes their own first session'),
        { label: 'Checks in after a session', target: 'not set yet', value: '—', kind: 'not-measured', source: 'Needs session-end events; nothing records them yet' },
      ],
    },
    {
      id: 'business',
      title: 'Business',
      about: 'How Aurelia earns: the funnel from a free start to Aurelia Plus, and the revenue behind it.',
      parts: ['Frictionless entry', 'The aha moment', 'The free limit', 'Aurelia Plus', 'Staying'],
      targets: [
        sim('plus', 'Chooses Plus at the limit'),
        sim('d7', 'Back after a week'),
        { label: 'Plus price', target: '$10 a month', value: '$10 a month · $100 a year', kind: 'measured', source: 'The app’s Upgrade screen (nothing can be bought yet)' },
        { label: 'Revenue per flip', target: '$19.99', value: `$${(19.99 * j.flipProbability).toFixed(2)} expected`, kind: 'assumption', source: 'The spec’s $19.99 per flip × the stage 1 flip chance' },
      ],
    },
    {
      id: 'wellness',
      title: 'Wellness',
      about: 'The state the person is in: bad → building blocks → good, told by their own check-ins.',
      parts: ['Bad state (check-in 25/100)', 'Building blocks', 'Good state (85/100)'],
      targets: [
        { label: 'Uplift per chapter', target: `+${STAGES[3].uplift.toFixed(2)} points (stage 3)`, value: `+${j.uplift.toFixed(2)} points`, kind: 'assumption', source: 'Cost model, stage 1 (the business owner’s scenario)' },
        { label: 'Chapters to flip', target: `${STAGES[3].specChapters} (stage 3)`, value: `${j.chapters}`, kind: 'assumption', source: 'Cost model: gap ÷ uplift per chapter' },
        { label: 'Flip chance', target: `${pct(STAGES[3].success)} (stage 3)`, value: pct(j.flipProbability), kind: 'assumption', source: 'Cost model, stage 1 success × three chapters a week' },
        { label: 'Real people feel better', target: pct(m.felt.target), value: '—', kind: 'not-measured', source: 'The feedback group has not started' },
      ],
    },
  ]
  const links: CornerLink[] = [
    { from: 'wellness', to: 'product', title: 'A session that helps is a reason to come back', how: `Each chapter's uplift (+${j.uplift.toFixed(2)} points, assumption) shows in the check-in after. A better check-in is the aha moment: the person finishes, checks in and plays the next chapter.` },
    { from: 'product', to: 'business', title: 'Coming back fills the free limit', how: 'Finishing sessions and returning uses up the free sends. At the limit, the offer is Plus, so the user journey feeds the business funnel.' },
    { from: 'business', to: 'wellness', title: 'Plus pays for the rest of the journey', how: `Plus removes the limit so the person can reach the good state: ${j.chapters} chapters at stage 1 (assumption). Revenue only lasts while they keep feeling better.` },
  ]
  return { corners, links }
}

export interface ProcessStep {
  id: string
  title: string
  inApp: string
  metric: string
  value: string
  kind: ValueKind
}

/** The bad-to-good process for sleep, as the app runs it today. */
export function sleepProcess(): ProcessStep[] {
  const j = sleepJourney()
  return [
    { id: 'pre', title: 'Check-in before', inApp: 'Daily check-in: “How do you feel?” on a 0–100 scale', metric: 'Starting score', value: `${DEFAULT_GOAL.baseline}/100`, kind: 'assumption' },
    { id: 'session', title: 'Session, chapter 1', inApp: 'One sentence on Home becomes a session; a journey has chapters', metric: 'Cost per chapter', value: `$${j.costPerChapter.toFixed(2)}`, kind: 'assumption' },
    { id: 'bites', title: 'Change this session', inApp: 'Building blocks for sleep: Slow breath, Warm, dim, Voice fades', metric: 'Blocks tried per chapter', value: '—', kind: 'not-measured' },
    { id: 'version', title: 'New version', inApp: 'The chosen blocks make a new version of the chapter', metric: 'Versions per chapter', value: '—', kind: 'not-measured' },
    { id: 'listen', title: 'Listen', inApp: 'The player, to the end', metric: 'Finishes the session', value: pct(funnelMetrics(3, 3, 1).find((x) => x.id === 'completion')!.agent), kind: 'simulated' },
    { id: 'post', title: 'Check-in after', inApp: '“How do you feel now?”', metric: 'Uplift per chapter', value: `+${j.uplift.toFixed(2)} points`, kind: 'assumption' },
    { id: 'next', title: 'Next chapter', inApp: 'The next chapter uses what helped; repeat until the flip', metric: 'Chapters to flip · flip chance', value: `${j.chapters} · ${pct(j.flipProbability)}`, kind: 'assumption' },
  ]
}

export interface World {
  id: 'sleep' | 'mental' | 'emotional' | 'relational' | 'spiritual'
  title: string
  bad: string
  good: string
  chapters: [number, number]
  costPerFlip: [number, number]
  success: [number, number]
}

/** The spec PDF §5, stage 1 → stage 3: the business owner's scenario, not measured. */
export const WORLDS: World[] = [
  { id: 'sleep', title: 'Physical and sleep', bad: 'Poor sleep', good: 'Deep sleep', chapters: [42, 22], costPerFlip: [4.62, 0.63], success: [0.54, 0.89] },
  { id: 'mental', title: 'Mental', bad: 'Brain fog', good: 'Focus', chapters: [18, 9], costPerFlip: [1.52, 0.2], success: [0.62, 0.92] },
  { id: 'emotional', title: 'Emotional', bad: 'Acute stress', good: 'Calm', chapters: [24, 12], costPerFlip: [2.23, 0.29], success: [0.58, 0.905] },
  { id: 'relational', title: 'Relational', bad: 'Conflict', good: 'Repair', chapters: [30, 15], costPerFlip: [3.04, 0.4], success: [0.51, 0.85] },
  { id: 'spiritual', title: 'Spiritual', bad: 'Disconnection', good: 'Purpose', chapters: [36, 18], costPerFlip: [4.27, 0.56], success: [0.49, 0.84] },
]
