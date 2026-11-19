import { BUYER_RUNS, personasOf, priceSeen, wellnessOf, type BuyerRun, type Verdict } from './buyerRuns'
import type { Persona } from './personas'

/**
 * Buyer agent re-run on the production design versions (U104, J139).
 *
 * Runs v1–v3 were played by hand against a description of the offer. This
 * re-run walks each persona through the real screens of production v1, v2
 * and v3 (staging v3, v4, v5), step by step, using the rules each agent
 * version played by, written down as code so 3 agents × 3 designs × their
 * panels (246 walks) are answered the same way every time. The rules were
 * written from the hand-played runs and are checked against them
 * (`agreement`). Every figure is a prediction, never a measurement.
 */

export type DesignId = 1 | 2 | 3
export type AgentId = 1 | 2 | 3
export type StepId = 'land' | 'quick-play' | 'sign-in' | 'onboarding' | 'first-build' | 'finish' | 'check-in' | 'come-back'
export type StepOutcome = 'pass' | 'stall' | 'leave' | 'skip'

export interface Design {
  id: DesignId
  staging: 3 | 4 | 5
  name: string
  /** What differs on screen, from the code (versions.ts, HomePage, ChatPage). */
  facts: string[]
}

export const DESIGNS: Design[] = [
  {
    id: 1,
    staging: 3,
    name: 'Production v1 (staging v3)',
    facts: [
      'Nothing plays before sign-in: Quick Start’s Play and the first sentence both ask for an account first.',
      'The chat opens on the demo conversation, not one of your own.',
      'The free limit (3 sends, then 30 minutes) counts from your first message.',
      'No onboarding. The player and Progress show sample numbers, not yours.',
      'The drawer menu instead of tabs.',
    ],
  },
  {
    id: 2,
    staging: 4,
    name: 'Production v2 (staging v4)',
    facts: [
      'Quick Start plays a session before sign-in.',
      'Onboarding after the first sign-in: five steps, each with Skip; your sentence from Home becomes your first session.',
      'Your own thread; the free limit counts only after your first build.',
      'After listening: “How do you feel now?”, then “Chapter 2 is ready tomorrow” with a calendar reminder; Home leads with your next chapter.',
      'Four tabs. Progress still shows sample numbers.',
    ],
  },
  {
    id: 3,
    staging: 5,
    name: 'Production v3 (staging v5), the production default',
    facts: [
      'Everything in production v2.',
      'Onboarding asks one more question: which wearable you use, and what it would read.',
      'Progress in words from your own check-ins; no sample numbers anywhere.',
      'A Why on every suggested change; after a check-in, Aurelia says what it will change next.',
      'An optional journal; community without rankings; Home says plainly what Aurelia is.',
    ],
  },
]

/** In every version (from the code), so every walk meets them. */
export const ALL_VERSIONS = [
  'English only.',
  'A personal session needs an account, asked for when the sentence is sent.',
  'The daily check-in sheet opens on every sign-in while the app is a demo.',
  'No voice or sound choice before the first session, and no data statement before typing.',
  'No pricing screen: paying is asked as a question, at the planned price.',
]

export const STEP_LABEL: Record<StepId, string> = {
  land: 'Lands on Home',
  'quick-play': 'Plays a Quick Start session',
  'sign-in': 'Signs in',
  onboarding: 'Onboarding',
  'first-build': 'Builds their own session',
  finish: 'Finishes the first session',
  'check-in': 'The check-in',
  'come-back': 'Comes back',
}
export const STEPS: StepId[] = ['land', 'quick-play', 'sign-in', 'onboarding', 'first-build', 'finish', 'check-in', 'come-back']

export const AGENT_RULES: Record<AgentId, { name: string; rules: string }> = {
  1: { name: 'Agent v1 rules', rules: 'As in run v1: no calibration. Only someone who cannot read the screen leaves; every other problem only slows them down. Kept to show how far an uncalibrated agent overstates.' },
  2: { name: 'Agent v2 rules', rules: 'As in run v2: look for the no first. A deal breaker the screen hits makes them leave; distrust of AI leaves at the pitch; language and age fail the first screen.' },
  3: { name: 'Agent v3 rules', rules: 'As in run v3: v2’s rules, plus the research evidence. Questions before the first play cost impatient people (the top leave reason at Insight Timer), and return rates are held near the category baseline (day 30 about 3–5% of installs).' },
}

export interface Step {
  id: StepId
  outcome: StepOutcome
  reason: string
}

export interface Walk {
  personaId: string
  steps: Step[]
  /** Heard a session on the first visit. */
  activated: boolean
  tries: Verdict
  completed: boolean
  /** Predicted probabilities. */
  d1: number
  d7: number
  d30: number
  /** Sessions in the first week. */
  plays: number
  feltBetter: number
  ellis: 'very' | 'somewhat' | 'not'
  pays: Verdict
  prices: { tooCheap: number; bargain: number; expensive: number; tooExpensive: number }
  recommends: boolean
  /** Why they left or stopped coming back. */
  leaveReason: string
  leaveTheme: LeaveTheme
  leftAt?: StepId
}

export type LeaveTheme = 'AI distrust' | 'Language' | 'Account first' | 'Too many questions' | 'Voice and sound' | 'Data and privacy' | 'Nagging prompts' | 'Not their numbers' | 'Price' | 'Nothing brings them back' | 'Stays'

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const r2 = (v: number) => Math.round(v * 100) / 100

export function walk(p: Persona, design: DesignId, agent: AgentId, run: Pick<BuyerRun, 'version'>): Walk {
  const t = p.profile.testing
  const w = wellnessOf(p)
  const deal = (x: string) => p.profile.dealBreakers.includes(x)
  const bar = (x: string) => p.barriers.includes(x)
  const english = p.language === 'English' && !p.flags.includes('reads English as a second language')
  const cannotRead = !english && p.age >= 65 && p.techComfort === 'low'
  const strugglesToRead = !english && !cannotRead && (p.age >= 60 || p.techComfort === 'low')
  const distrust = p.aiAttitude === 'distrustful'
  const account = deal('having to create an account first')
  const impulse = p.profile.decides.startsWith('installs on impulse')
  const voiceRisk = bar('finds most meditation voices irritating') || deal('a voice that sounds fake or salesy')
  const sound = p.flags.includes('autistic, sensitive to sound')
  const nag = bar('gave up on apps that nag with notifications') || deal('notifications every day')
  const privacy = p.privacy === 'very protective' || deal('sharing data with third parties')
  const wantsProof = t.buyTriggers.includes('seeing their own sleep or mood improve in the app') || p.aiAttitude === 'skeptical'
  const soft = agent === 1

  const steps: Step[] = []
  let gone = false
  let leftAt: StepId | undefined
  let leaveReason = ''
  let leaveTheme: LeaveTheme = 'Stays'
  let activated = false
  let stalls = 0
  const add = (id: StepId, outcome: StepOutcome, reason: string, theme?: LeaveTheme) => {
    if (gone) return steps.push({ id, outcome: 'skip', reason: 'Left earlier.' })
    let o = outcome
    if (o === 'leave' && soft && theme !== 'Language') o = 'stall'
    steps.push({ id, outcome: o, reason })
    if (o === 'stall') {
      stalls += 1
    }
    if (o === 'leave') {
      gone = true
      leftAt = id
      leaveReason = reason
      leaveTheme = theme ?? 'Nothing brings them back'
    }
  }

  // 1 · Home
  if (cannotRead) add('land', 'leave', `Reads ${p.language} first and cannot use an English first screen${p.age >= 60 ? ` at ${p.age}` : ''}.`, 'Language')
  else if (distrust) add('land', 'leave', 'Leaves at the pitch: it is an AI that writes the session.', 'AI distrust')
  else if (strugglesToRead) add('land', 'stall', `Reads ${p.language} first; the English screen is slow going.`)
  else if (design === 3 && p.aiAttitude === 'skeptical') add('land', 'pass', 'Home says plainly what Aurelia is; enough to look further.')
  else add('land', 'pass', english ? 'The pitch fits what they came for.' : 'Gets by in English on the first screen.')

  // 2 · Quick Start before an account
  if (design === 1) add('quick-play', 'skip', 'Not possible in this version: Play asks for an account first.')
  else {
    add('quick-play', 'pass', 'Hears a Quick Start session before giving anything.')
    if (!gone) activated = true
  }

  // 3 · Sign in
  if (account) add('sign-in', 'leave', design === 1 ? 'Asked for an account before hearing anything: a deal breaker.' : 'Asked for an account for their own session: a deal breaker, though they heard one first.', 'Account first')
  else if (privacy) add('sign-in', 'stall', 'Signs up, uneasy: nothing says what happens to what they type.')
  else add('sign-in', 'pass', 'Signs in when sending their sentence.')

  // 4 · Onboarding
  const lowTechOld = p.techComfort === 'low' && p.age >= 65
  if (design === 1) add('onboarding', 'skip', 'No onboarding in this version.')
  else {
    const questions = design === 3 ? 6 : 5
    const wearableAsk = design === 3 && p.wearable !== 'none'
    if (agent === 3 && impulse && design === 3) add('onboarding', 'leave', 'Six questions before their own session: impatient people delete here (the top leave reason in the research).', 'Too many questions')
    else if (impulse || lowTechOld) add('onboarding', 'stall', `${questions} questions before their own session; ${impulse ? 'impatient, they skip through' : 'slow going at their age'}.`)
    else if (wearableAsk && privacy) add('onboarding', 'stall', `Asked about their ${p.wearable}; it says what it would read, but they hesitate.`)
    else if (wearableAsk) add('onboarding', 'pass', `Says they use a ${p.wearable}; likes being told what it reads.`)
    else add('onboarding', 'pass', 'Answers or skips; their sentence carries through.')
  }

  // 5 · Their own session
  if (design === 1 && impulse) add('first-build', 'leave', 'The chat opens on someone else’s demo conversation; impatient, they close it.', 'Nothing brings them back')
  else if (design === 1) add('first-build', 'stall', 'The chat opens on a demo conversation before theirs; finds their way to their own.')
  else if (!english) add('first-build', 'stall', 'Their session is in English, not their first language.')
  else add('first-build', 'pass', 'Their sentence becomes their first session.')
  if (!gone && !activated) activated = true

  // 6 · Finishing it
  if (deal('a voice that sounds fake or salesy') && agent >= 2) add('finish', 'leave', 'The voice sounds like an advert to them, and they cannot choose another.', 'Voice and sound')
  else if (voiceRisk || sound) add('finish', 'stall', sound ? 'Music and bells are hard for them; there is no way to turn them off.' : 'The voice grates; there is no voice choice.')
  else if (p.flags.includes('ADHD') && p.length >= 20) add('finish', 'stall', 'Twenty minutes is long for them.')
  else add('finish', 'pass', 'Listens to the end.')

  // 7 · The check-in
  if (nag && agent === 3 && impulse) add('check-in', 'leave', 'The check-in sheet opens again on sign-in; they have deleted apps for less.', 'Nagging prompts')
  else if (nag) add('check-in', 'stall', 'The check-in sheet opens on every sign-in; it feels like nagging.')
  else if (design === 1 && wantsProof) add('check-in', 'stall', 'The player shows sample numbers that are not theirs; it reads as invented.')
  else add('check-in', 'pass', design === 1 ? 'Answers the check-in.' : 'Asked “How do you feel now?” after the session.')

  const completed = !gone || leftAt === 'check-in'

  // 8 · Coming back: predicted probabilities
  const levelBonus = w.level === 'struggling' ? 0.1 : w.level === 'coping' ? -0.12 : 0
  const aiBonus = { enthusiastic: 0.05, curious: 0, skeptical: -0.03, distrustful: -0.1 }[p.aiAttitude as 'curious']
  const expBonus = p.experience === 'daily' ? 0.05 : p.experience === 'never' ? -0.02 : 0
  const cue = design === 1 ? (w.level === 'struggling' ? -0.05 : 0) : design === 2 ? 0.08 : 0.12 + (wantsProof ? 0.04 : 0)
  const m = 0.19 + 0.04 * (t.pain - 5) + levelBonus + aiBonus + expBonus + cue - 0.04 * stalls - (nag ? 0.03 : 0)
  const inflate = agent === 1 ? 1.5 : 1
  let d1 = gone && !completed ? 0 : clamp(m * inflate * (completed ? 1 : 0.3), 0.02, 0.85)
  let d7 = d1 * (design === 1 ? 0.4 : 0.47)
  let d30 = d7 * (design === 3 ? 0.4 : 0.35)
  if (agent === 3) d30 = Math.min(d30, 0.15)
  if (!activated) d1 = d7 = d30 = 0
  const plays = !activated ? 0 : completed ? r2(1 + 2 * d1 + 6 * d7) : 1

  if (!gone && d7 < 0.12) {
    leaveTheme = design === 1 && w.level !== 'coping' ? 'Not their numbers' : 'Nothing brings them back'
    leaveReason = w.level === 'coping' ? 'Doing fine most days; nothing calls them back.' : design === 1 ? 'Nothing waits for them tomorrow, and the progress shown is not theirs.' : 'Too much friction on the way for the habit to start.'
  }
  if (!gone && d7 >= 0.12) leaveReason = design === 1 ? 'Might come back on a bad night; nothing asks them to.' : 'Comes back for the next chapter.'

  const feltBetter = completed ? r2(clamp(0.55 + (w.level === 'struggling' ? 0.08 : 0) - (voiceRisk ? 0.15 : 0) - (sound ? 0.1 : 0) - (design === 1 && wantsProof ? 0.05 : 0))) : 0
  const ellis: Walk['ellis'] = !activated || !completed ? 'not' : t.pain >= 7 && feltBetter >= 0.55 && d7 >= 0.15 ? 'very' : d7 >= 0.08 ? 'somewhat' : 'not'

  const local = priceSeen(run, p.country).usd
  const ppp = local / 9.99
  const anchor = ({ 'free only': 2, 'up to $5 a month': 5, 'up to $10 a month': 10, 'more if it clearly works': 13 } as Record<string, number>)[p.willingnessToPay] ?? 5
  const a = anchor * (p.income === 'high' ? 1.2 : p.income === 'low' ? 0.8 : 1) * (ppp < 0.8 ? ppp + 0.2 : 1)
  const prices = { tooCheap: r2(a * 0.2), bargain: r2(a * 0.5), expensive: r2(a), tooExpensive: r2(a * 1.5) }
  const freeOnly = p.willingnessToPay === 'free only'
  const pays: Verdict = !completed || !activated ? 'no' : !freeOnly && local <= prices.expensive && d7 >= 0.2 ? 'yes' : (!freeOnly || t.pain >= 8) && local <= prices.tooExpensive ? 'maybe' : 'no'
  const recommends = completed && feltBetter >= 0.55 && p.aiAttitude !== 'skeptical' && d7 >= 0.1

  // Tries: heard a session and got through their own first one. Two snags on the way, or leaving
  // after the first play, make it a maybe: the hand-played runs answered the whole first visit.
  const firstVisit = steps.filter((x) => STEPS.indexOf(x.id) <= STEPS.indexOf('finish'))
  const tries: Verdict = !activated ? 'no' : (gone && leftAt !== 'check-in') || firstVisit.filter((x) => x.outcome === 'stall').length >= 2 ? 'maybe' : 'yes'

  steps.push({ id: 'come-back', outcome: gone ? 'skip' : d7 >= 0.12 ? 'pass' : 'stall', reason: gone ? 'Left earlier.' : leaveReason })
  if (gone && !leaveReason) leaveReason = 'Left.'
  if (!gone && pays === 'no' && leaveTheme === 'Stays' && local > prices.tooExpensive) leaveTheme = 'Price'
  return { personaId: p.id, steps, activated, tries, completed, d1: r2(d1), d7: r2(d7), d30: r2(d30), plays, feltBetter, ellis, pays, prices, recommends, leaveReason, leaveTheme, leftAt }
}

/* ---------------------------------------------------------------- Reports */

export interface Metric {
  id: string
  label: string
  value: string
  /** What the number is compared with. */
  benchmark?: string
  /** predicted: the agent's estimate; only people can measure it. */
  kind: 'predicted' | 'estimate'
}

export interface Report {
  agent: AgentId
  design: DesignId
  run: BuyerRun
  walks: Walk[]
  funnel: { step: StepId; reached: number; stalled: number; left: number }[]
  metrics: Metric[]
  leaveReasons: [LeaveTheme, number][]
  activation: number
  completion: number
  d1: number
  d7: number
  d30: number
  plays: number
  ellis: number
  paysYes: number
  paysMaybe: number
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const i = Math.floor(s.length / 2)
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2
}

/** The panel each agent version was played on: v1's 10, v2's 36, v3's 36. */
export function runOfAgent(agent: AgentId): BuyerRun {
  return BUYER_RUNS.find((r) => r.version === agent)!
}

export function report(agent: AgentId, design: DesignId): Report {
  const run = runOfAgent(agent)
  const people = personasOf(run)
  const walks = run.panel.personaIds.map((id) => walk(people.get(id)!, design, agent, run))
  const n = walks.length
  const funnel = STEPS.map((step) => {
    const at = walks.map((w) => w.steps.find((s) => s.id === step)!)
    return { step, reached: at.filter((s) => s.reason !== 'Left earlier.').length, stalled: at.filter((s) => s.outcome === 'stall').length, left: at.filter((s) => s.outcome === 'leave').length }
  })
  const act = walks.filter((w) => w.activated)
  const done = walks.filter((w) => w.completed && w.activated)
  const activation = act.length / n
  const completion = act.length ? done.length / act.length : 0
  const d1 = mean(walks.map((w) => w.d1))
  const d7 = mean(walks.map((w) => w.d7))
  const d30 = mean(walks.map((w) => w.d30))
  const plays = mean(act.map((w) => w.plays))
  const active = walks.filter((w) => w.d7 > 0)
  const weight = active.reduce((s, w) => s + w.d7, 0)
  const ellis = weight ? active.filter((w) => w.ellis === 'very').reduce((s, w) => s + w.d7, 0) / weight : 0
  const felt = mean(done.map((w) => w.feltBetter))
  const paysYes = walks.filter((w) => w.pays === 'yes').length
  const paysMaybe = walks.filter((w) => w.pays === 'maybe').length
  const rec = done.length ? done.filter((w) => w.recommends).length / done.length : 0
  const reasons = new Map<LeaveTheme, number>()
  for (const w of walks) if (w.leaveTheme !== 'Stays') reasons.set(w.leaveTheme, (reasons.get(w.leaveTheme) ?? 0) + 1)
  const leaveReasons = [...reasons.entries()].sort((a, b) => b[1] - a[1])
  const biggest = [...funnel].sort((a, b) => b.left + b.stalled * 0.25 - (a.left + a.stalled * 0.25))[0]
  const metrics: Metric[] = [
    { id: 'activation', label: '1 · Activation: hears a session on the first visit', value: pct(activation), kind: 'predicted' },
    { id: 'funnel', label: '2 · Where the funnel loses most', value: `${STEP_LABEL[biggest.step]} (${biggest.left} leave, ${biggest.stalled} slowed)`, kind: 'predicted' },
    { id: 'completion', label: '3 · Finishes the first own session', value: pct(completion), benchmark: 'of those who heard one', kind: 'estimate' },
    { id: 'retention', label: '4 · Comes back on day 1 / 7 / 30', value: `${pct(d1)} / ${pct(d7)} / ${pct(d30)}`, benchmark: 'day 30 in the category: 3–5% of installs', kind: 'estimate' },
    { id: 'plays', label: '5 · Sessions in week one', value: plays.toFixed(1), benchmark: 'per person who heard one', kind: 'estimate' },
    { id: 'felt', label: '6 · Feels better after the session', value: pct(felt), benchmark: 'of those who finished', kind: 'estimate' },
    { id: 'ellis', label: '7 · “Very disappointed” without it', value: pct(ellis), benchmark: '40% is the usual product–market fit bar', kind: 'estimate' },
    { id: 'pay', label: '8 · Would pay, if asked after a week', value: `${paysYes} yes, ${paysMaybe} maybe of ${n}`, benchmark: `fair band $${median(walks.map((w) => w.prices.bargain)).toFixed(2)}–$${median(walks.map((w) => w.prices.expensive)).toFixed(2)} a month; no pricing screen exists`, kind: 'predicted' },
    { id: 'recommend', label: '9 · Would recommend it', value: pct(rec), benchmark: 'of those who finished', kind: 'predicted' },
    { id: 'reasons', label: '10 · Top reasons they leave', value: leaveReasons.slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ') || 'none', kind: 'predicted' },
  ]
  return { agent, design, run, walks, funnel, metrics, leaveReasons, activation, completion, d1, d7, d30, plays, ellis, paysYes, paysMaybe }
}

/**
 * How closely the coded rules reproduce the hand-played answers on the app
 * as it was when those runs were played (closest to production v3).
 */
export function agreement() {
  const out: { run: number; label: string; exact: number; opposite: number; n: number }[] = []
  for (const agent of [2, 3] as const) {
    const run = runOfAgent(agent)
    const people = personasOf(run)
    let exact = 0
    let opposite = 0
    for (const a of run.answers) {
      const w = walk(people.get(a.personaId)!, 3, agent, run)
      const hand = agent === 3 ? a.control!.tries : a.tries
      if (w.tries === hand) exact += 1
      if ((w.tries === 'yes' && hand === 'no') || (w.tries === 'no' && hand === 'yes')) opposite += 1
    }
    out.push({ run: agent, label: agent === 3 ? 'Run v3, offer A (today)' : 'Run v2', exact, opposite, n: run.answers.length })
  }
  return out
}
