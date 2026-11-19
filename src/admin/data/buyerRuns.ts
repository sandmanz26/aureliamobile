/**
 * Buyer agent runs (U101, J133): a buyer agent reads a panel of synthetic
 * personas (src/admin/data/personas.ts) and one stimulus, and answers as each
 * persona in a fixed shape. Shown in Admin → Product lab → Buyer agent results.
 *
 * The first run is a demo. One agent role-played each of ten personas from
 * their exported profile, test data and role-play prompt, in a single session,
 * with the instructions stored below. Nothing here is a measurement: it is a
 * way to form hypotheses and to shape the schema before runs get bigger.
 */

import { RUN_V2 } from './buyerRunV2'
import { RUN_V3, V3_PRICES } from './buyerRunV3'
import { generatePersonas, type Generator, type Persona } from './personas'

export type Verdict = 'yes' | 'maybe' | 'no'
export type Outcome = 'pass' | 'risk' | 'fail'
export type Theme = 'price' | 'notifications' | 'privacy' | 'trust' | 'access' | 'voice' | 'habit' | 'switching'

export const THEME_LABEL: Record<Theme, string> = {
  price: 'Price',
  notifications: 'Notifications',
  privacy: 'Privacy',
  trust: 'Does it work for me',
  access: 'Access and language',
  voice: 'Voice and sound',
  habit: 'Forgetting to use it',
  switching: 'Already has an app',
}

/** Van Westendorp's four answers, in US dollars a month. */
export interface PriceAnswers {
  tooCheap: number
  bargain: number
  expensive: number
  tooExpensive: number
}

export interface ScenarioResult {
  /** Matches a scenario id in the persona's test data. */
  id: string
  outcome: Outcome
  note: string
}

export interface BuyerAnswer {
  personaId: string
  tries: Verdict
  pays: Verdict
  /** The plan they would end up on if things go as they expect. */
  plan: 'none' | 'free' | 'plus-monthly' | 'plus-yearly'
  prices: PriceAnswers
  theme: Theme
  objection: string
  /** What would turn their no (or maybe) into a yes. */
  flip: string
  /** 1 (a guess) to 5 (sure). */
  confidence: 1 | 2 | 3 | 4 | 5
  /** Why, in the agent's words. */
  reasoning: string
  /** What they would say, in their words. */
  quote: string
  scenarios: ScenarioResult[]
  /** Something wrong with the persona itself, spotted while playing it. */
  personaIssue?: string
  /** v2+: sessions they would play in the first week (0–7). */
  week?: number
  /** v2+: still using it at day 30. */
  day30?: Verdict
  /** v3+: the same persona's answer to the control offer (A). */
  control?: { tries: Verdict; pays: Verdict; why: string }
  /** v3+: the proposed changes that changed this answer. */
  movedBy?: string[]
}

export interface Reference {
  title: string
  where: string
  used: string
}

export interface Criterion {
  label: string
  value: string
}

export interface BuyerRun {
  id: string
  /** Shown as the version tab: v1, v2, … */
  version: number
  title: string
  date: string
  kind: 'demo' | 'run'
  /** The persona generator the panel came from; earlier runs stay on the one they were played on. */
  generator: Generator
  /** How the run was made, said plainly. */
  method: string
  panel: { seed: number; size: number; personaIds: string[] }
  stimulus: { name: string; pitch: string; offer: string[]; priceUsd: number }
  /** v3+: the offer the stimulus is compared against. */
  control?: { name: string; offer: string[] }
  /** v3+: what the agent read before answering. */
  references?: Reference[]
  /** How the run was set up, in plain words, for someone who was not there. */
  criteria: Criterion[]
  /** The instructions the agent followed, so a run can be repeated. */
  instructions: string
  findings: string[]
  answers: BuyerAnswer[]
}

export const BUYER_INSTRUCTIONS = `You are a buyer test agent. For each persona in the panel:
1. Read the persona's profile, test data and role-play prompt. Stay in role: their money, their week, their doubts.
2. Read the stimulus once, as they would meet it: an app store page, then the first screen.
3. Answer in this shape: tries (yes/maybe/no), pays (yes/maybe/no), plan, the four price answers in USD a month (too cheap, a bargain, getting expensive, too expensive), the main objection and its theme, what would flip it, confidence 1-5, reasoning, and one line in their words.
4. Walk their three test scenarios against how the product works today and mark each pass, risk or fail, with a note.
5. If the persona itself does not hold together, say so.
Rules: synthetic buyers are too agreeable, so look for the reason to say no first. A "yes" needs a reason that comes from the persona, not from the pitch.`

/** What the answers mean, the same in every run. */
export const DEFINITIONS: Criterion[] = [
  { label: 'Tries: yes', value: 'Would install and play a first session this week, with what the page and first screen show.' },
  { label: 'Tries: maybe', value: 'Would, if one named thing changed (it is in “what would flip it”).' },
  { label: 'Tries: no', value: 'Would not install, or would delete before a first session.' },
  { label: 'Pays', value: 'The same three answers for paying for Plus at the price they are shown, within the first month.' },
  { label: 'Price answers', value: 'The four Van Westendorp questions, per month: at what price is it so cheap you would doubt it; a bargain; getting expensive but still worth considering; too expensive to consider. Answered in US dollars so runs add up.' },
  { label: 'Fair price band', value: 'From the median “a bargain” to the median “getting expensive”.' },
  { label: 'Test cases', value: 'Each persona has three scenarios (first open, their moment a week in, one edge case). Pass: the product today does what the persona needs. Risk: it could go either way. Fail: the product today loses them there.' },
  { label: 'Confidence', value: '1 is a guess, 5 is sure. Low confidence means the profile does not say enough to decide.' },
]

export const BUYER_RUNS: BuyerRun[] = [
  {
    id: 'demo-1',
    version: 1,
    title: 'Demo 1 · Aurelia Plus at $9.99',
    date: '2026-11-19',
    kind: 'demo',
    generator: 1,
    method:
      'One agent played ten personas in turn, in one session, from each persona’s export. No backend, no live model call from the app. The panel was drawn from the 300 with seed 2026.',
    panel: {
      seed: 2026,
      size: 10,
      personaIds: ['P273', 'P243', 'P028', 'P209', 'P113', 'P254', 'P163', 'P029', 'P221', 'P218'],
    },
    stimulus: {
      name: 'Aurelia, app store page and first screen',
      pitch:
        'Tell Aurelia in one sentence how you feel. In about a minute it makes you a guided session of your own: voice, sound and visuals. It continues as short chapters over the next days, with one check-in a day.',
      offer: ['Free: 5 sessions a month, no card', 'Plus: $9.99 a month or $79 a year, unlimited, voice input, offline', 'English only today'],
      priceUsd: 9.99,
    },
    criteria: [
      { label: 'Question', value: 'Would these people try Aurelia, and would they pay for Plus at $9.99 a month?' },
      { label: 'Who', value: '10 of the 300 synthetic personas, drawn with seed 2026 and balanced by goal: every one of the six goals has at least one person.' },
      { label: 'What they saw', value: 'The app store pitch and today’s plans, the same US price for everyone. No regional prices.' },
      { label: 'How the agent ran', value: 'One agent played each persona in turn, in one session, reading the persona’s full profile, test data and role-play prompt. Instructions below.' },
      { label: 'What each answered', value: 'Try, pay, which plan, four price answers, the main objection, what would flip it, confidence, reasoning, a quote, and pass / risk / fail on their three test cases.' },
      { label: 'Not taken into account', value: 'Region and local price, language, connection, how they are doing (wellness), usage after the first week. Added in v2.' },
      { label: 'Persona generator', value: 'Generator 1, the original. Generator 2, which fixes the incoherence these runs found, came with v3; this run stays on the people it was played on, so its answers still match their profiles.' },
      { label: 'Read it as', value: 'A demo of the format. Ten people in one session cannot tell segments apart.' },
    ],
    instructions: BUYER_INSTRUCTIONS,
    findings: [
      'The free plan with no card does the selling: 8 of 10 would try it, and every no or maybe on paying came after trying, not before.',
      'Plus at $9.99 sits above what this panel calls “getting expensive” (a median of $6). The yearly plan ($6.58 a month) is the one that lands for the people who would pay.',
      'Two deal breakers come before price: more than one notification a day, and not knowing where what they type goes. Both are cheap to answer on the first screen.',
      'Access fails outright for one in ten (English only, small text) and is a risk for two more (sound control, a voice they can choose). A language and a voice picker matter more than another feature.',
      'Grief, a bad check-in and hitting the free limit at 3am are the moments where the product can lose someone it already won. Each needs a designed answer.',
      'The run found three personas that do not hold together (a 66-year-old parent on leave, a 35-year-old medical student with teenagers, a low-income lawyer). They go back to the generator.',
    ],
    answers: [
      {
        personaId: 'P273',
        tries: 'yes',
        pays: 'maybe',
        plan: 'plus-yearly',
        prices: { tooCheap: 2, bargain: 5, expensive: 9, tooExpensive: 14 },
        theme: 'notifications',
        objection: 'Afraid of an app that pings every day and a streak he will break.',
        flip: 'Say on the first screen: one reminder at most, off with one tap, no streaks.',
        confidence: 4,
        reasoning:
          'Calm is his goal and he likes AI, so a session from one sentence is exactly his style. He pays for Balance-like apps only once they stop nagging. The yearly plan fits his “real discount” trigger.',
        quote: 'If it gets me through Tuesday and leaves me alone on Wednesday, I will pay for the year.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'His sentence goes straight to a session; nothing to fill in first.' },
          { id: 'moment', outcome: 'pass', note: 'Before calling his mum: a short calming session fits the five minutes he has.' },
          { id: 'grief', outcome: 'risk', note: 'Nothing in the flow notices loss. A “fix your stress” tone would feel wrong a month after a bereavement.' },
        ],
      },
      {
        personaId: 'P243',
        tries: 'maybe',
        pays: 'no',
        plan: 'none',
        prices: { tooCheap: 1, bargain: 3, expensive: 6, tooExpensive: 9 },
        theme: 'switching',
        objection: 'Already pays for Calm and uses Insight Timer every day; sees no reason AI would do better.',
        flip: 'Reviews from people her age, and sessions that never run longer than promised.',
        confidence: 3,
        reasoning:
          'A daily meditator with two apps and low comfort with tech has the highest switching cost on the panel. Skeptical of AI. She reads every review first, and today there are none.',
        quote: 'I have my teachers already. Why would I want a computer reading to me?',
        scenarios: [
          { id: 'first-open', outcome: 'risk', note: 'A blank sentence box is harder for her than a list of named teachers.' },
          { id: 'moment', outcome: 'pass', note: 'A focus session to start the report works if it is truly short.' },
          { id: 'low-checkin', outcome: 'risk', note: 'A low check-in needs a gentle answer; a cheery one would confirm her doubt.' },
        ],
        personaIssue: '“Parent on leave” at 66 reads wrong. Occupation should follow age.',
      },
      {
        personaId: 'P028',
        tries: 'yes',
        pays: 'maybe',
        plan: 'plus-monthly',
        prices: { tooCheap: 3, bargain: 6, expensive: 12, tooExpensive: 18 },
        theme: 'privacy',
        objection: 'Will type about her kids and her work and does not know where it goes.',
        flip: 'A plain page: where it is stored, when it is deleted, never used for training.',
        confidence: 3,
        reasoning:
          'High income, enthusiastic about AI and decides within a day, so price is not the gate. Very protective of data and allergic to spiritual language. With ADHD, “I will forget it exists by Thursday” is the real churn risk.',
        quote: 'Sort my week out, sure. But tell me who else reads it.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'One sentence suits her; no quiz.' },
          { id: 'moment', outcome: 'risk', note: 'Sunday planning works only if the script avoids “universe” language.' },
          { id: 'privacy', outcome: 'fail', note: 'The app says nothing about data before she types. She would stop at the first personal sentence.' },
        ],
      },
      {
        personaId: 'P209',
        tries: 'yes',
        pays: 'maybe',
        plan: 'plus-monthly',
        prices: { tooCheap: 1.5, bargain: 3, expensive: 6, tooExpensive: 9 },
        theme: 'privacy',
        objection: 'Would connect her Whoop only if the data stays with Aurelia.',
        flip: 'A morning session built from her Whoop recovery, and the price shown in rupiah (Rp69,000 is under her $5).',
        confidence: 3,
        reasoning:
          'Never meditated, but high income, curious about AI and decides within a day. She hates being asked to pay before trying, which the free plan answers. The regional price already fits her.',
        quote: 'If it knows I slept badly and gives me ten minutes that wake me up, I am in.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: '“No energy to get out of bed” goes straight to a session.' },
          { id: 'moment', outcome: 'risk', note: 'The wearable readings are examples until a backend exists; she would notice they are not hers.' },
          { id: 'privacy', outcome: 'risk', note: 'Connecting a wearable needs a clear “never shared” line.' },
        ],
      },
      {
        personaId: 'P113',
        tries: 'yes',
        pays: 'no',
        plan: 'free',
        prices: { tooCheap: 0.5, bargain: 2, expensive: 5, tooExpensive: 7 },
        theme: 'price',
        objection: 'Low income and a new baby; anything above a coffee a month is out.',
        flip: 'Three nights in a row where it gets her back to sleep at 3am. Then she would pay.',
        confidence: 4,
        reasoning:
          'Highest pain on the panel (8) and a clear job: back to sleep at 3am. She compares options in a spreadsheet and tried Insight Timer and Balance already. Five free sessions a month do not cover a month of broken nights.',
        quote: 'If it can get me back to sleep at 3am, I will pay for it. Prove it first.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'In bed, one sentence, a session: the right shape.' },
          { id: 'moment', outcome: 'pass', note: 'A night-feed wake-up is exactly the moment.' },
          { id: 'paywall', outcome: 'fail', note: 'The sixth session of the month would hit the limit at 3am. Blocking a sleep session in the middle of the night loses her for good.' },
        ],
      },
      {
        personaId: 'P254',
        tries: 'maybe',
        pays: 'no',
        plan: 'none',
        prices: { tooCheap: 0.5, bargain: 1.5, expensive: 3, tooExpensive: 5 },
        theme: 'access',
        objection: 'The app is in English and the text is small; he cannot use it alone.',
        flip: 'Portuguese, larger text, and a grandchild who sets it up for him.',
        confidence: 4,
        reasoning:
          'Low comfort with tech, low income, 73 and in Brazil. His body stays in fight mode after stress, which a regulating session helps. But he would not get past the first screen in English.',
        quote: 'My grandson can show me. But it has to speak Portuguese.',
        scenarios: [
          { id: 'first-open', outcome: 'fail', note: 'English only. He would not know what to type.' },
          { id: 'moment', outcome: 'risk', note: 'After a stressful moment he needs one big button, not a text box.' },
          { id: 'access', outcome: 'fail', note: 'No language choice and no text size setting.' },
        ],
      },
      {
        personaId: 'P163',
        tries: 'yes',
        pays: 'no',
        plan: 'free',
        prices: { tooCheap: 1, bargain: 2, expensive: 4, tooExpensive: 6 },
        theme: 'voice',
        objection: 'Sensitive to sound; music beds and bells are a problem. Insight Timer is free and already works.',
        flip: 'A student price and full control of sound: voice only, no music, no bell.',
        confidence: 3,
        reasoning:
          'A daily Insight Timer user on a student budget, enthusiastic about AI. He would try it because a session made for him is new. Without sound control it would make things worse.',
        quote: 'I want the words. Not the rain, not the gong.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: '“I feel anxious and I don’t know why” is a natural first sentence.' },
          { id: 'moment', outcome: 'risk', note: 'An evening money worry needs a calm voice and nothing else.' },
          { id: 'access', outcome: 'risk', note: 'Guidance controls (less talking, no music) are planned, not built.' },
        ],
        personaIssue: 'A 35-year-old medical student living with teenagers is possible but unlikely for a whole persona. Check household against occupation and age.',
      },
      {
        personaId: 'P029',
        tries: 'yes',
        pays: 'yes',
        plan: 'plus-yearly',
        prices: { tooCheap: 3, bargain: 6, expensive: 10, tooExpensive: 15 },
        theme: 'habit',
        objection: 'Gave up on apps with too much choice; would give up again if it asks five questions first.',
        flip: 'Already a yes. Keep it at one sentence, and check breathing exercises are safe in pregnancy.',
        confidence: 4,
        reasoning:
          'A carer with young kids and pregnant; “just tell me what to do” is exactly Aurelia’s promise. Middle income, $10 a month already in her budget, and her trigger is an annual plan with a real discount.',
        quote: 'Something short that gets me started. That is all I have ever wanted from one of these.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'One sentence, no library to scroll.' },
          { id: 'moment', outcome: 'pass', note: 'A focus session before the hour she has.' },
          { id: 'low-checkin', outcome: 'risk', note: 'A low check-in from a tired carer needs care, not a pep talk.' },
        ],
      },
      {
        personaId: 'P221',
        tries: 'yes',
        pays: 'no',
        plan: 'free',
        prices: { tooCheap: 1, bargain: 2.5, expensive: 5, tooExpensive: 8 },
        theme: 'price',
        objection: 'Already pays for a therapist; there is no money left for an app.',
        flip: 'A yearly plan under $40, or her employer paying for it.',
        confidence: 3,
        reasoning:
          'Never meditated, low income, compares in a spreadsheet. The free plan suits her and she would use it, but she forgets to open apps. She would stay free unless someone else pays.',
        quote: 'Free, fine. I will see if I even remember to open it.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'Weekly planning from one sentence.' },
          { id: 'moment', outcome: 'pass', note: 'Switching off after a support shift.' },
          { id: 'lapse', outcome: 'pass', note: 'After two weeks away, coming back without guilt works if there is no streak to lose.' },
        ],
      },
      {
        personaId: 'P218',
        tries: 'yes',
        pays: 'maybe',
        plan: 'free',
        prices: { tooCheap: 1.5, bargain: 3, expensive: 6, tooExpensive: 9 },
        theme: 'voice',
        objection: 'Most meditation voices irritate her; a breathy one and she is gone.',
        flip: 'Choose the voice before the first session, and Spanish.',
        confidence: 3,
        reasoning:
          'Enthusiastic about AI and follows creators; she tried apps before and left over voices and too much choice. Quick Start plays before sign-in, which meets her “try it without an account”.',
        quote: 'Let me pick the voice. And speak to me in Spanish, por favor.',
        scenarios: [
          { id: 'first-open', outcome: 'pass', note: 'Plays before sign-in.' },
          { id: 'moment', outcome: 'pass', note: 'The 3pm slump is a short energy session.' },
          { id: 'access', outcome: 'risk', note: 'English as a second language: scripts need plain words and no idioms.' },
        ],
        personaIssue: 'A lawyer on a low income is unusual. Income should follow occupation more closely.',
      },
    ],
  },
  RUN_V2,
  RUN_V3,
]

/* ------------------------------------------------------- Panels and prices */

export const REGIONS = ['Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa'] as const
export const AGE_BANDS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'] as const

/** Personas a run found incoherent; later runs leave them out (O39). */
export const EXCLUDED = ['P243', 'P163', 'P218']

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One persona for every region × age band (36), picked by seed. A cell with
 * nobody in it takes another persona from the same region, so every region
 * still has six. Leaves out EXCLUDED.
 */
export function drawStratified(pool: Persona[], seed: number, exclude: string[] = EXCLUDED): Persona[] {
  const r = rng(seed)
  const pick = (list: Persona[]) => list[Math.floor(r() * list.length)]
  const ok = pool.filter((p) => !exclude.includes(p.id))
  const out: Persona[] = []
  for (const region of REGIONS) {
    let short = 0
    for (const band of AGE_BANDS) {
      const cell = ok.filter((p) => p.region === region && p.ageBand === band && !out.includes(p))
      if (cell.length) out.push(pick(cell))
      else short += 1
    }
    for (; short > 0; short--) {
      const rest = ok.filter((p) => p.region === region && !out.includes(p))
      if (rest.length) out.push(pick(rest))
    }
  }
  return out
}

/** Plus monthly as each persona would see it (commerce.ts REGION_PRICING), with a USD equivalent at the run's rates. */
const LOCAL_PLUS: Record<string, { label: string; usd: number }> = {
  'United States': { label: '$9.99', usd: 9.99 },
  'United Kingdom': { label: '£8.99', usd: 11.4 },
  Spain: { label: '€9.99', usd: 10.8 },
  Netherlands: { label: '€9.99', usd: 10.8 },
  Germany: { label: '€9.99', usd: 10.8 },
  France: { label: '€9.99', usd: 10.8 },
  Indonesia: { label: 'Rp69,000', usd: 4.35 },
  India: { label: '₹399', usd: 4.7 },
  Brazil: { label: 'R$29.90', usd: 5.5 },
  Japan: { label: '¥1,500', usd: 9.9 },
}

/** The Plus price a persona saw in a given run. */
export function priceSeen(run: Pick<BuyerRun, 'version'>, country: string) {
  return run.version >= 3 ? (V3_PRICES[country] ?? { label: '$9.99 · $59.99 a year', usd: 9.99 }) : localPlus(country)
}

export function localPlus(country: string) {
  return LOCAL_PLUS[country] ?? { label: '$9.99 (no local price)', usd: 9.99 }
}

export type WellnessLevel = 'struggling' | 'strained' | 'coping'

/** A reading of how someone is doing, from their profile: pain, sleep, conditions. */
export function wellnessOf(p: Persona) {
  const pain = p.profile.testing.pain
  const { hours, quality } = p.profile.sleep
  const level: WellnessLevel = pain >= 8 || quality <= 1 || (pain >= 7 && quality <= 2) ? 'struggling' : pain >= 5 || quality <= 2 ? 'strained' : 'coping'
  return { level, pain, sleepHours: hours, sleepQuality: quality, conditions: p.flags, stressors: p.profile.stressors }
}

export const WELLNESS_LABEL: Record<WellnessLevel, string> = { struggling: 'Struggling', strained: 'Strained', coping: 'Coping' }

const POOLS = new Map<Generator, Map<string, Persona>>()

/** The personas a run was played on, by id. */
export function personasOf(run: Pick<BuyerRun, 'generator'>): Map<string, Persona> {
  let m = POOLS.get(run.generator)
  if (!m) {
    m = new Map(generatePersonas(undefined, undefined, run.generator).map((p) => [p.id, p]))
    POOLS.set(run.generator, m)
  }
  return m
}

/* ------------------------------------------------------------------ Tallies */

const median = (values: number[]): number => {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export function countVerdicts(answers: BuyerAnswer[], key: 'tries' | 'pays'): Record<Verdict, number> {
  const out: Record<Verdict, number> = { yes: 0, maybe: 0, no: 0 }
  for (const a of answers) out[a[key]] += 1
  return out
}

/**
 * A simple price range from the four answers: from the median "bargain" to
 * the median "getting expensive". Enough for ten people; a run of hundreds
 * should use the full Van Westendorp crossing points.
 */
export function priceRange(answers: BuyerAnswer[]) {
  return {
    tooCheap: median(answers.map((a) => a.prices.tooCheap)),
    low: median(answers.map((a) => a.prices.bargain)),
    high: median(answers.map((a) => a.prices.expensive)),
    tooExpensive: median(answers.map((a) => a.prices.tooExpensive)),
  }
}

export function themeCounts(answers: BuyerAnswer[]): [Theme, number][] {
  const m = new Map<Theme, number>()
  for (const a of answers) m.set(a.theme, (m.get(a.theme) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

export function scenarioCounts(answers: BuyerAnswer[]): Record<Outcome, number> {
  const out: Record<Outcome, number> = { pass: 0, risk: 0, fail: 0 }
  for (const a of answers) for (const s of a.scenarios) out[s.outcome] += 1
  return out
}

export const VERDICT_TONE = { yes: 'good', maybe: 'warning', no: 'critical' } as const
export const OUTCOME_TONE = { pass: 'good', risk: 'warning', fail: 'critical' } as const
export const PLAN_LABEL: Record<BuyerAnswer['plan'], string> = {
  none: 'Would not sign up',
  free: 'Free',
  'plus-monthly': 'Plus, monthly',
  'plus-yearly': 'Plus, yearly',
}
