import type { BuyerAnswer, Outcome, PriceAnswers, ScenarioResult, Theme, Verdict } from './buyerRuns'
import { generatePersonas, type Persona } from './personas'

/*
 * Buyer agent runs v5–v7 (U124, J178): the rules the agent played each
 * persona by, written down so every answer can be traced to them. The agent
 * reads one persona at a time, looks for the reason to say no first, honours
 * every deal breaker the offer hits, and writes the reasons it found into the
 * answer. Runs v5, v6 and v7 (buyerRunV5/6/7.ts) each add persona variables
 * and play one or two offers through these rules. Nothing here is measured:
 * every figure the runs give is a prediction about synthetic people.
 *
 * This module imports no values from buyerRuns.ts (only types), because
 * buyerRuns.ts imports the runs that are built from it.
 */

/* ------------------------------------------------------------- Personas */

let POOL: Persona[] | undefined
/** Persona generator 2's 300 people (the pool runs v3 and later draw from). */
export function pool2(): Persona[] {
  POOL ??= generatePersonas(undefined, undefined, 2)
  return POOL
}
export const byId2 = (id: string) => pool2().find((p) => p.id === id)!

const REGIONS = ['Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa'] as const
const AGE_BANDS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'] as const

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
 * A stratified draw of any size (v6+): in each round, one persona per age band
 * in every region, by seed, until the panel is full. Regions stay balanced;
 * an empty cell is skipped.
 */
export function drawStratifiedN(people: Persona[], seed: number, size: number): Persona[] {
  const r = rng(seed)
  const out: Persona[] = []
  const used = new Set<string>()
  for (let round = 0; out.length < size && round < 50; round++)
    for (const band of AGE_BANDS)
      for (const region of REGIONS) {
        if (out.length >= size) break
        const cell = people.filter((p) => p.region === region && p.ageBand === band && !used.has(p.id))
        if (!cell.length) continue
        const p = cell[Math.floor(r() * cell.length)]
        used.add(p.id)
        out.push(p)
      }
  return out
}

/* ------------------------------------------------------------ Variables */

export type VarKey = 'condition' | 'wearable' | 'device' | 'language' | 'found' | 'priorApp' | 'churn' | 'budget' | 'lifeStage' | 'needTime' | 'aiTrust' | 'privacy' | 'culture'

export const VAR_LABEL: Record<VarKey, string> = {
  condition: 'Sleep / stress at the start',
  wearable: 'Wearable owned',
  device: 'Device',
  language: 'Language',
  found: 'How they found Aurelia',
  priorApp: 'Meditation app before',
  churn: 'Why they left it',
  budget: 'Budget sensitivity',
  lifeStage: 'Life stage',
  needTime: 'When they need it',
  aiTrust: 'Trust in AI for wellness',
  privacy: 'Privacy concern',
  culture: 'Cultural context',
}

/** The variables each run adds; a run uses its own and every earlier run's. */
export const VARS_BY_RUN: Record<5 | 6 | 7, VarKey[]> = {
  5: ['condition', 'wearable', 'device', 'language'],
  6: ['found', 'priorApp', 'churn', 'budget'],
  7: ['lifeStage', 'needTime', 'aiTrust', 'privacy', 'culture'],
}
export const varsUpTo = (level: 5 | 6 | 7): VarKey[] => ([5, 6, 7] as const).filter((l) => l <= level).flatMap((l) => VARS_BY_RUN[l])

export type Severity = 'mild' | 'moderate' | 'severe'

/** The starting condition, from the same reading as wellnessOf in buyerRuns (struggling → severe). */
export function severityOf(p: Persona): Severity {
  const pain = p.profile.testing.pain
  const q = p.profile.sleep.quality
  return pain >= 8 || q <= 1 || (pain >= 7 && q <= 2) ? 'severe' : pain >= 5 || q <= 2 ? 'moderate' : 'mild'
}

const WORKING = ['office', 'hybrid', 'remote', 'shift', 'self-employed']
const COLLECTIVE = ['Indonesia', 'Philippines', 'India', 'Nigeria', 'Brazil', 'Mexico', 'South Africa']
const RESERVED = ['Japan', 'Germany', 'Netherlands']

export const CULTURE: Record<string, string> = {
  Indonesia: 'Indonesia: Bahasa first, faith often part of coping, WhatsApp groups, prices in rupiah',
  India: 'India: family first, Hindi or English, UPI payments, prices in rupees',
  Philippines: 'Philippines: Filipino and English, close family, prepaid data',
  Japan: 'Japan: reserved, quiet preferred, little sharing with strangers',
  Nigeria: 'Nigeria: English, faith common, prepaid data, prices in naira',
  'South Africa': 'South Africa: English among several languages, prepaid data',
  Brazil: 'Brazil: Portuguese, sociable, WhatsApp-first, prices in reais',
  Mexico: 'Mexico: Spanish, family first, WhatsApp-first',
  Germany: 'Germany: German, privacy-minded (GDPR), plain speaking',
  Netherlands: 'Netherlands: Dutch, reads English, direct, privacy-minded',
  France: 'France: French expected, sceptical of wellness claims',
  Spain: 'Spain: Spanish expected, sociable',
  Singapore: 'Singapore: multilingual, high trust in technology',
}
const cultureOf = (country: string) => CULTURE[country] ?? `${country}: English-speaking, app subscriptions are normal`

function deviceOf(p: Persona) {
  const ph = p.profile.phone
  const kind = /iPad/.test(ph) ? 'iPhone + iPad' : /iPhone/.test(ph) ? 'iPhone' : 'Android'
  return /older|budget|hand-me-down|few years old/.test(ph) ? `older ${kind}` : kind
}

function languageOf(p: Persona) {
  if (p.language === 'English') return p.flags.includes('reads English as a second language') ? 'reads English' : 'English first'
  return p.age >= 55 || p.techComfort === 'low' || p.income === 'low' ? 'needs own language' : 'reads English'
}

function foundOf(p: Persona) {
  const f = p.profile
  if (/creator/.test(f.decides) || /TikTok/.test(f.wouldHearAbout)) return 'creator follower'
  if (/employer/.test(f.wouldHearAbout) && WORKING.includes(p.workPattern)) return 'employer'
  return 'organic'
}

function churnOf(p: Persona) {
  if (!p.apps.length) return 'never used one'
  if (p.experience === 'daily') return 'still uses it'
  const b = p.barriers.join(' ')
  if (/streak/.test(b)) return 'streak guilt'
  if (/forgets/.test(b)) return 'forgot to open it'
  if (/pay|price|money|cost/i.test(b) || p.income === 'low') return 'paywall'
  if (/voice/.test(b) || p.profile.dealBreakers.includes('a voice that sounds fake or salesy')) return 'the voices'
  if (/choice|options/.test(b)) return 'too much choice'
  return 'lost interest'
}

function budgetOf(p: Persona) {
  if (p.willingnessToPay === 'free only' || (p.income === 'low' && p.willingnessToPay === 'up to $5 a month')) return 'high'
  if (p.willingnessToPay === 'more if it clearly works' && p.income !== 'low') return 'low'
  return 'medium'
}

function lifeStageOf(p: Persona) {
  if (p.workPattern === 'student') return 'student'
  if (p.workPattern === 'retired') return 'retired'
  if (/parent|carer/i.test(p.occupation) || /cares for/.test(p.household)) return 'caring for family'
  if (/baby|young kids|toddler|small child/.test(p.household)) return 'young family'
  if (p.age < 30) return 'early career'
  if (p.age >= 55) return 'nearing retirement'
  return 'mid-career'
}

function needTimeOf(p: Persona) {
  if (p.flags.includes('night shift worker') || p.workPattern === 'shift') return 'irregular hours'
  if (p.goal === 'sleep') return 'at night, in bed'
  if (p.goal === 'focus' || p.goal === 'energy') return 'morning or afternoon'
  if (p.goal === 'regulate') return 'right after stress'
  return 'evening'
}

const AI_TRUST: Record<Persona['aiAttitude'], string> = { enthusiastic: 'high', curious: 'medium', skeptical: 'low', distrustful: 'none' }

/** Every variable, derived from the persona's own profile so it cannot contradict it. */
export function varsOf(p: Persona): Record<VarKey, string> {
  return {
    condition: severityOf(p),
    wearable: p.wearable,
    device: deviceOf(p),
    language: languageOf(p),
    found: foundOf(p),
    priorApp: p.apps[0] ?? 'none',
    churn: churnOf(p),
    budget: budgetOf(p),
    lifeStage: lifeStageOf(p),
    needTime: needTimeOf(p),
    aiTrust: AI_TRUST[p.aiAttitude],
    privacy: p.privacy,
    culture: cultureOf(p.country),
  }
}

/** Contradictions between a persona and the variables given to it. Must be empty. */
export function varIncoherence(p: Persona, v: Partial<Record<VarKey, string>>): string[] {
  const out: string[] = []
  if (v.condition && v.condition !== severityOf(p)) out.push(`condition ${v.condition} but the profile reads ${severityOf(p)}`)
  if (v.wearable && v.wearable !== p.wearable) out.push(`wearable ${v.wearable} but owns ${p.wearable}`)
  if (v.device && /iPhone/.test(v.device) !== /iPhone/.test(p.profile.phone)) out.push(`device ${v.device} for ${p.profile.phone}`)
  if (v.language === 'English first' && p.language !== 'English') out.push(`English first for a ${p.language} speaker`)
  if (v.found === 'employer' && !WORKING.includes(p.workPattern)) out.push(`found through an employer while ${p.workPattern}`)
  if (v.priorApp && (v.priorApp === 'none') !== (p.apps.length === 0)) out.push(`prior app ${v.priorApp} but used ${p.apps.join(', ') || 'none'}`)
  if (v.churn === 'still uses it' && p.experience !== 'daily') out.push(`still uses an app but meditates ${p.experience}`)
  if (v.budget === 'low' && (p.income === 'low' || p.willingnessToPay === 'free only')) out.push(`low budget sensitivity on ${p.income} income, ${p.willingnessToPay}`)
  if (v.lifeStage && (v.lifeStage === 'student') !== (p.workPattern === 'student')) out.push(`life stage ${v.lifeStage} for ${p.workPattern}`)
  if (v.lifeStage && (v.lifeStage === 'retired') !== (p.workPattern === 'retired')) out.push(`life stage ${v.lifeStage} for ${p.workPattern}`)
  if (v.aiTrust && v.aiTrust !== AI_TRUST[p.aiAttitude]) out.push(`AI trust ${v.aiTrust} for someone ${p.aiAttitude}`)
  if (v.privacy && v.privacy !== p.privacy) out.push(`privacy ${v.privacy} for someone ${p.privacy}`)
  if (v.culture && !v.culture.startsWith(p.country)) out.push(`culture of ${v.culture.split(':')[0]} for ${p.country}`)
  return out
}

/* --------------------------------------------------------------- Prices */

/** Purchasing level of each place, against the US (the agent's own rule of thumb, not a statistic). */
const PLACE: Record<string, number> = { Spain: 0.85, Brazil: 0.6, Mexico: 0.6, 'South Africa': 0.6, Indonesia: 0.45, India: 0.45, Philippines: 0.45, Nigeria: 0.45 }
const WTP_BASE: Record<string, number> = { 'free only': 1.5, 'up to $5 a month': 3, 'up to $10 a month': 5.5, 'more if it clearly works': 8 }
const INCOME: Record<Persona['income'], number> = { low: 0.8, middle: 1, high: 1.25 }
const q = (x: number) => Math.round(x * 4) / 4

/** The purchasing level the price rule applies to a country (1 for the US and anywhere unlisted). */
export const placeFactor = (country: string) => PLACE[country] ?? 1
/** The income multiplier the price rule applies. */
export const incomeFactor = (income: Persona['income']) => INCOME[income]

/** The four price answers (USD a month), set from willingness to pay, income and place; pain 8+ stretches them. */
export function priceAnswers(p: Persona): PriceAnswers {
  return priceAnswersWith(p)
}

/**
 * The same rule with the place or income scaling switched off, so a change in
 * the fair price can be split into what the panel's country and income mix
 * did through the rule (U137) and what its stated willingness to pay did.
 */
export function priceAnswersWith(p: Persona, use: { place?: boolean; income?: boolean } = {}): PriceAnswers {
  const stretch = p.profile.testing.pain >= 8 ? 1.15 : 1
  const place = use.place === false ? 1 : (PLACE[p.country] ?? 1)
  const income = use.income === false ? 1 : INCOME[p.income]
  const bargain = Math.max(0.75, q((WTP_BASE[p.willingnessToPay] ?? 3) * place * income * stretch))
  const tooCheap = Math.min(bargain - 0.25, Math.max(0.25, q(bargain * 0.4)))
  const expensive = Math.max(bargain + 0.5, q(bargain * 1.9))
  const tooExpensive = Math.max(expensive + 0.5, q(bargain * 2.8))
  return { tooCheap, bargain, expensive, tooExpensive }
}

/** The app's Upgrade screen: $10 a month or $100 a year, in US dollars everywhere. */
export const APP_PLUS = { monthly: 10, yearly: 100, perMonthYearly: 100 / 12 }
/** Euros to US dollars at the run's rate. */
export const EUR_USD = 1.08

/* --------------------------------------------------------------- Offers */

export type Feature =
  | 'quick-start'
  | 'progress-words'
  | 'why'
  | 'wearable-ask'
  | 'journal'
  | 'community-no-ranks'
  | 'creator-voice'
  | 'cohort'
  | 'eight-weeks'
  | 'graduate-plus'
  | 'free-library'
  | 'checkin-once'
  | 'need-help'

export const FEATURES: Record<Feature, { label: string; source: string }> = {
  'quick-start': { label: 'First session plays without an account', source: 'Production v3 (staging v4 onward): Quick Start plays before sign-in' },
  'progress-words': { label: 'Progress told in words from their check-ins', source: 'Production v3 (staging v5, U053): FeelingProgress, no sample analytics' },
  why: { label: 'A Why? on each suggested change', source: 'Production v3 (staging v5, U053)' },
  'wearable-ask': { label: 'The wearable asked for in onboarding', source: 'Production v3 (staging v5): example readings until a backend exists' },
  journal: { label: 'A journal in the journey', source: 'Production v3 (staging v5)' },
  'community-no-ranks': { label: 'Community without ranks', source: 'Production v3 (staging v5); also on the business owner’s Insight Timer quick-win list' },
  'creator-voice': { label: 'An 8-week journey in the creator’s own voice and language', source: 'Approved retreat redesign (24 Nov 2026): produced once per creator, personal inserts' },
  cohort: { label: 'A live cohort with the creator', source: 'Retreat-in-a-Box spec: week-1 keynote, week-8 Q&A, Sunday prompts' },
  'eight-weeks': { label: 'A structured 8-week programme', source: 'Retreat-in-a-Box spec: the 8-week curriculum' },
  'graduate-plus': { label: 'Graduates move to Plus, naming their progress', source: 'Retreat redesign: Plus per ticket buyer decides the plan; freemium brief: price the relief' },
  'free-library': { label: 'A free core library, no limit', source: 'Insight Timer quick wins (chat of 24 Nov 2026); research: paywalled basics are a top leave reason' },
  'checkin-once': { label: 'A daily check-in, at most once a day', source: 'Insight Timer quick wins; research: nagging and streaks are leave reasons' },
  'need-help': { label: '“Need help now?” always one tap away', source: 'Insight Timer quick wins; Artefact lesson 3: safety in the first version' },
}

export interface Offer {
  id: string
  name: string
  entry: 'freemium' | 'ticket'
  /** Ticket in euros, for a ticket entry. */
  ticketEur?: number
  features: Feature[]
}

/** Production v3 (staging v5) as it is: what the app does today. */
export const PROD_V3: Offer = {
  id: 'prod-v3',
  name: 'Production v3 as it is (freemium)',
  entry: 'freemium',
  features: ['quick-start', 'progress-words', 'why', 'wearable-ask', 'journal', 'community-no-ranks'],
}

export const retreat = (eur: number): Offer => ({
  id: `retreat-${eur}`,
  name: `Creator retreat at €${eur}`,
  entry: 'ticket',
  ticketEur: eur,
  features: [...PROD_V3.features, 'creator-voice', 'cohort', 'eight-weeks', 'graduate-plus'],
})

export const QUICK_WINS: Feature[] = ['free-library', 'checkin-once', 'need-help', 'community-no-ranks']
export const withQuickWins = (o: Offer): Offer => ({ ...o, id: `${o.id}+qw`, name: `${o.name} + Insight-Timer-style quick wins`, features: [...new Set([...o.features, ...QUICK_WINS])] })

/* ---------------------------------------------------------------- Rules */

export const RULES = `Rules the agent played every persona by (runs v5–v7):
1. Become the persona: read the whole profile and test data, and this run's variables. Their money, their place, their language, their phone.
2. Look for the no first, in this order: the language (an English-only app loses anyone who needs their own language; a creator's journey is in the creator's language); distrust of AI (the app says AI makes the session; only a creator's own human voice can move that, to maybe); a deal breaker the offer hits (paying before trying ends it; any other caps the answer at maybe and pay at no); for a ticket, not knowing the creator (maybe at most) and a ticket that costs more a month over its 8 weeks than they call too expensive (no) or getting expensive (maybe), with their price answers raised by half for a creator they follow; low tech comfort at 65+ (maybe); skepticism (maybe, unless pain is 8+ or they follow the creator); reading English as a second language (maybe below pain 6); pain 3 or less (maybe: not bad enough to act).
3. Pay only after trying. Plus is the app's real price, $10 a month or $100 a year, in US dollars everywhere. "Free only" pays no, unless pain is 8+ and one of their own buy triggers is met (then maybe). $8.33 a month (the yearly plan) above their "too expensive" is no, above "getting expensive" is maybe. A yes needs willingness to pay of $10 or more and pain 6+, a severe starting condition or a met trigger. High budget sensitivity turns a yes into a maybe. A retreat buyer pays for Plus only if they would still be there at week 8 (follows the creator, not low in conscientiousness, not a mild problem). With a free core library, a maybe on a sensitive budget becomes no: the free core is enough.
4. Week one and day 30 stay near the evidence: a day-30 yes needs a yes to try and to pay, four sessions in week one, some meditation before and conscientiousness that is not low; it must stay under 1 in 8.
5. A change "moved" a persona only if removing it from the offer makes their answer worse.
6. Price answers are set from willingness to pay, income and place (purchasing level against the US), stretched by 15% at pain 8+.`

export interface Played {
  tries: Verdict
  pays: Verdict
  plan: BuyerAnswer['plan']
  theme: Theme
  objection: string
  flip: string
  confidence: BuyerAnswer['confidence']
  week: number
  day30: Verdict
  /** Why, as the rules found it, in order. */
  because: string[]
  /** Deal breakers this offer hits for this persona. */
  hits: string[]
  scenarios: ScenarioResult[]
}

const LV: Record<Verdict, number> = { no: 0, maybe: 1, yes: 2 }
export const level = (v: Verdict) => LV[v]
const min = (a: Verdict, b: Verdict): Verdict => (LV[a] <= LV[b] ? a : b)

/** Deal breakers an offer hits, as the persona would meet it. */
export function dealBreakersHit(p: Persona, o: Offer): string[] {
  const has = (x: Feature) => o.features.includes(x)
  const ticket = o.entry === 'ticket'
  const hits: string[] = []
  for (const d of p.profile.dealBreakers) {
    if (d === 'having to create an account first' && (ticket || !has('quick-start'))) hits.push(d)
    if (d === 'being asked to pay before trying' && ticket) hits.push(d)
    if (d === 'notifications every day' && ticket && !has('checkin-once')) hits.push(d)
    if (d === 'religious or spiritual framing' && ticket) hits.push(d)
  }
  return hits
}

const THEME_FOR_HIT: Record<string, Theme> = {
  'having to create an account first': 'privacy',
  'being asked to pay before trying': 'price',
  'notifications every day': 'notifications',
  'religious or spiritual framing': 'trust',
}

/** Play one persona against one offer, at a run's level (which variables count). */
export function play(p: Persona, o: Offer, runLevel: 5 | 6 | 7): Played {
  const v = varsOf(p)
  const has = (x: Feature) => o.features.includes(x)
  const ticket = o.entry === 'ticket'
  const pain = p.profile.testing.pain
  const sev = v.condition as Severity
  const prices = priceAnswers(p)
  const follower = runLevel >= 6 && v.found === 'creator follower'
  const lv7 = runLevel >= 7
  const because: string[] = []
  const hits = dealBreakersHit(p, o)
  const langServed = v.language !== 'needs own language' || (ticket && has('creator-voice') && follower)
  const humanVoice = ticket && has('creator-voice') && follower
  const ticketPerMonth = ticket ? ((o.ticketEur ?? 0) * EUR_USD) / 2 : 0

  let tries = 'yes' as Verdict
  let theme = undefined as Theme | undefined
  let hard = false
  const stop = (verdict: Verdict, t: Theme, why: string, isHard = false) => {
    if (theme) return
    tries = verdict
    theme = t
    hard = isHard
    because.push(why)
  }

  if (!langServed) stop('no', 'access', `Needs ${p.language}; the app speaks English only.`, true)
  if (p.aiAttitude === 'distrustful') {
    if (humanVoice) stop('maybe', 'trust', 'Distrusts AI, but the journey is in the voice of a creator they follow: a human they already trust.')
    else stop('no', 'trust', 'Distrusts AI, and the app says plainly that AI makes the session.', true)
  }
  if (hits.includes('being asked to pay before trying')) stop('no', 'price', 'Deal breaker: paying before trying. The ticket comes before the first session.', true)
  else if (hits.length) stop('maybe', THEME_FOR_HIT[hits[0]], `Deal breaker: ${hits[0]}${hits[0] === 'having to create an account first' ? (ticket ? ' (checkout makes one).' : ' (Quick Start plays without one, but their own session asks to sign in).') : '.'}`)
  if (ticket && !follower) stop('maybe', 'trust', 'Does not follow the creator selling the retreat; a stranger’s ticket is a hard sell.')
  // A creator they follow raises what they would pay for that creator's programme by half (rule 2).
  const premium = follower ? 1.5 : 1
  if (ticket && ticketPerMonth > prices.tooExpensive * premium) stop('no', 'price', `The €${o.ticketEur} ticket is about $${ticketPerMonth.toFixed(2)} a month over 8 weeks, above what they would pay${follower ? ' even for a creator they follow' : ''} ($${(prices.tooExpensive * premium).toFixed(2)}).`, true)
  else if (ticket && ticketPerMonth > prices.expensive * premium) stop('maybe', 'price', `The €${o.ticketEur} ticket is about $${ticketPerMonth.toFixed(2)} a month, past their “getting expensive” ($${(prices.expensive * premium).toFixed(2)}${follower ? ' with the creator premium' : ''}).`)
  if (p.techComfort === 'low' && p.age >= 65) stop('maybe', 'access', 'Low tech comfort at 65+: needs someone to set it up.')
  if (!theme && p.aiAttitude === 'skeptical' && !(pain >= 8 || follower)) {
    if (has('free-library')) because.push('Skeptical, but the free library lets them sample without promising anything.')
    else if (has('need-help') && sev === 'severe') because.push('Skeptical, but “Need help now?” tells them it takes a bad night seriously.')
    else stop('maybe', 'trust', 'Skeptical of AI and of wellness promises; no reviews yet.')
  }
  if (!theme && v.language === 'reads English' && pain < 6 && !humanVoice) {
    if (lv7 && ticket && COLLECTIVE.includes(p.country) && has('cohort')) because.push('Reads English with effort, but a cohort of people like them pulls them in.')
    else stop('maybe', 'access', `Reads English as a second language (${p.language} first); at pain ${pain} it is not worth the effort.`)
  }
  if (!theme && pain <= 3) {
    if (has('free-library')) because.push('Pain is low, but a free library is easy to open now and then.')
    else stop('maybe', 'habit', `Pain ${pain}: not bad enough to start something new.`)
  }
  if (lv7 && ticket && has('cohort') && RESERVED.includes(p.country) && tries === 'yes' && p.profile.personality.extraversion === 'low') stop('maybe', 'privacy', 'Reserved, and a live cohort means sharing with strangers.')
  if (tries === 'yes') because.push(ticket ? `Follows the creator, and €${o.ticketEur} (about $${ticketPerMonth.toFixed(2)} a month) is inside their range.` : `Nothing stops them at the first screen, and a ${sev} ${p.goal} problem at pain ${pain} is reason to start.`)

  // Pay, only after trying.
  let pays: Verdict = 'no'
  const triggers = p.profile.testing.buyTriggers
  const met = triggers.filter(
    (t) =>
      (t === 'seeing their own sleep or mood improve in the app' && has('progress-words')) ||
      (t === 'an annual plan with a real discount') ||
      (t === 'a free week that visibly helps' && o.entry === 'freemium') ||
      (t === 'trying it without an account' && has('quick-start') && o.entry === 'freemium'),
  )
  const yearly = APP_PLUS.perMonthYearly
  if (tries === 'no') because.push('Does not try, so does not pay.')
  else if (hits.length) because.push('A deal breaker is hit, so no payment.')
  else if (p.willingnessToPay === 'free only') {
    if (pain >= 8 && met.length) {
      pays = 'maybe'
      because.push(`Free only, but pain ${pain} and their own trigger (“${met[0]}”) make paying possible.`)
    } else because.push('Free only: stays on Free.')
  } else if (yearly > prices.tooExpensive) because.push(`$100 a year ($8.33 a month) is above their “too expensive” ($${prices.tooExpensive}).`)
  else if (yearly > prices.expensive) {
    pays = 'maybe'
    because.push(`$8.33 a month on the yearly plan is past their “getting expensive” ($${prices.expensive}): maybe.`)
  } else if (/\$10|more/.test(p.willingnessToPay) && tries === 'yes' && (pain >= 6 || sev === 'severe' || met.length)) {
    pays = 'yes'
    because.push(`Would pay ${p.willingnessToPay}, and $100 a year fits${met.length ? ` (their trigger: “${met[0]}”)` : ` at pain ${pain}`}.`)
  } else {
    pays = 'maybe'
    because.push('The price fits, but nothing yet makes paying urgent.')
  }
  if (pays === 'yes' && runLevel >= 6 && v.budget === 'high') {
    pays = 'maybe'
    because.push('High budget sensitivity: waits before committing.')
  }
  if (ticket && pays !== 'no') {
    const stays = follower && p.profile.personality.conscientiousness !== 'low' && sev !== 'mild'
    if (!stays) {
      pays = min(pays, 'maybe')
      if (!follower || p.profile.personality.conscientiousness === 'low') {
        pays = 'no'
        because.push('Unlikely to still be there at week 8, when Plus is offered.')
      } else because.push('A mild problem: may drift before week 8.')
    } else if (has('graduate-plus') && pays === 'maybe' && tries === 'yes' && sev === 'severe') {
      pays = 'yes'
      because.push('Eight weeks in, with their progress named, Plus prices the relief they felt.')
    }
  }
  if (pays === 'maybe' && has('free-library') && runLevel >= 6 && v.budget === 'high' && o.entry === 'freemium') {
    pays = 'no'
    because.push('The free core library is enough for them: no reason to pay.')
  }
  if (pays === 'yes' && tries !== 'yes') pays = 'maybe'

  // Week one and day 30.
  let week = tries === 'no' ? 0 : tries === 'maybe' ? 1 : sev === 'severe' ? 4 : sev === 'moderate' ? 3 : 2
  if (tries === 'yes') {
    if (p.experience === 'daily') week += 1
    if (p.barriers.includes('forgets to open the app') && !has('checkin-once') && !has('eight-weeks')) week -= 1
    if (has('eight-weeks') && follower) week += 1
    if (lv7 && (v.lifeStage === 'young family' || v.lifeStage === 'caring for family')) week -= 1
    if (lv7 && v.lifeStage === 'retired') week += 1
    if (has('need-help') && sev === 'severe') week += 1
  }
  week = Math.max(0, Math.min(7, week))
  const day30: Verdict = tries === 'yes' && pays === 'yes' && week >= 4 && p.experience !== 'never' && p.profile.personality.conscientiousness !== 'low' ? 'yes' : tries === 'yes' && week >= 3 ? 'maybe' : 'no'

  // What stops them most, if nothing stopped them at the door.
  if (!theme) {
    if (pays !== 'yes') theme = 'price'
    else if (p.privacy === 'very protective') theme = 'privacy'
    else if (p.profile.dealBreakers.includes('a voice that sounds fake or salesy') && !humanVoice) theme = 'voice'
    else if (p.profile.dealBreakers.includes('notifications every day')) theme = 'notifications'
    else theme = 'habit'
  }
  const objection = OBJECTION[theme](p, o)
  const flip = FLIP[theme](p, o, v)

  const confidence: BuyerAnswer['confidence'] = hard ? 4 : tries === 'yes' && pays === 'yes' ? 4 : tries === 'maybe' && pays === 'no' ? 3 : tries === 'maybe' ? 2 : 3
  const plan: BuyerAnswer['plan'] = tries === 'no' ? 'none' : pays === 'yes' ? (triggers.includes('an annual plan with a real discount') || APP_PLUS.monthly > prices.expensive ? 'plus-yearly' : 'plus-monthly') : 'free'

  return { tries, pays, plan, theme, objection, flip, confidence, week, day30, because, hits, scenarios: scenariosFor(p, o, tries, langServed, hits, runLevel) }
}

const OBJECTION: Record<Theme, (p: Persona, o: Offer) => string> = {
  price: (p, o) => (o.entry === 'ticket' ? `A ticket up front, then $100 a year, on ${p.income} income (would pay ${p.willingnessToPay}).` : `$10 a month or $100 a year in dollars, on ${p.income} income (would pay ${p.willingnessToPay}).`),
  notifications: () => 'Afraid of an app that nags every day.',
  privacy: (p) => (p.privacy === 'very protective' ? 'Will not type feelings into an app without knowing who reads them.' : 'Does not want to make an account to find out if it works.'),
  trust: (p) => (p.aiAttitude === 'distrustful' ? 'A machine writing a wellness session is the problem, however well it is done.' : 'Has heard wellness promises before; wants proof from people like them.'),
  access: (p) => (p.techComfort === 'low' && p.age >= 65 ? 'Small text, a blank box, and nobody to set it up.' : `The app is in English; ${p.language} is their language.`),
  voice: () => 'One fake-sounding voice and they are gone.',
  habit: () => 'Will forget it exists by the end of the week.',
  switching: (p) => `Already has ${p.apps[0] ?? 'an app'} and sees no reason to move.`,
}

const FLIP: Record<Theme, (p: Persona, o: Offer, v: Record<VarKey, string>) => string> = {
  price: (p) => (p.willingnessToPay === 'free only' ? 'A free core that is enough, or someone else paying (an employer, a creator’s cohort).' : `A local price near their bargain point ($${priceAnswers(p).bargain} a month).`),
  notifications: () => 'One check-in a day at most, and no streaks.',
  privacy: () => 'A plain line before typing: what is stored, who sees it, deleted on request; and no account for the first session.',
  trust: (_p, _o, v) => (v.found === 'creator follower' ? 'A creator they follow saying it helped.' : 'Reviews from people like them, and a human voice option.'),
  access: (p) => (p.techComfort === 'low' && p.age >= 65 ? 'Larger text and one big button; a family member to set it up.' : `Sessions in ${p.language}.`),
  voice: () => 'Choosing the voice before the first session.',
  habit: () => 'One gentle check-in a day, and a reason to come back tomorrow.',
  switching: () => 'Something their current app cannot do: a session made for tonight.',
}

function scenariosFor(p: Persona, o: Offer, tries: Verdict, langServed: boolean, hits: string[], runLevel: 5 | 6 | 7): ScenarioResult[] {
  const has = (x: Feature) => o.features.includes(x)
  const v = varsOf(p)
  return p.profile.testing.scenarios.map((s) => {
    let outcome: Outcome = 'pass'
    let note = ''
    if (s.id === 'first-open') {
      if (!langServed) [outcome, note] = ['fail', `English only; they would not know what to type in ${p.language}.`]
      else if (hits.length) [outcome, note] = ['fail', `Stops at the deal breaker: ${hits[0]}.`]
      else if (o.entry === 'ticket') [outcome, note] = [tries === 'yes' ? 'pass' : 'risk', 'Week 1 opens with the creator’s welcome, then their first sentence.']
      else if (p.techComfort === 'low') [outcome, note] = ['risk', 'A blank sentence box is hard with low tech comfort.']
      else note = 'Quick Start plays at once; their sentence builds a session after sign-in.'
    } else if (s.id === 'moment') {
      if (tries === 'no') [outcome, note] = ['risk', 'Never gets this far.']
      else if (runLevel >= 7 && v.needTime === 'at night, in bed' && o.entry === 'freemium' && !has('free-library')) [outcome, note] = ['risk', 'At night the free limit (3 sends, then 30 minutes) can land mid-session.']
      else note = `“Same as last time” fits ${s.when}.`
    } else if (s.id === 'grief') [outcome, note] = has('need-help') ? ['pass', '“Need help now?” is there; the tone stays gentle.'] : ['risk', 'Nothing in the flow notices a loss; no help link.']
    else if (s.id === 'privacy') [outcome, note] = p.aiAttitude === 'distrustful' && o.entry === 'freemium' ? ['fail', 'No plain data line before typing, and it is AI.'] : ['risk', 'No plain data line before typing.']
    else if (s.id === 'access') [outcome, note] = langServed ? ['risk', 'No text-size setting; English needs plain words.'] : ['fail', 'No language choice and no text size setting.']
    else if (s.id === 'lapse') [outcome, note] = has('checkin-once') || has('cohort') ? ['pass', 'Comes back to a gentle check-in or the cohort; nothing to lose.'] : ['risk', 'Coming back is guilt-free only if nothing counts the gap.']
    else if (s.id === 'paywall') [outcome, note] = has('free-library') ? ['pass', 'The core library stays free; replays too.'] : ['risk', 'The free limit (3 sends, then 30 minutes) arrives; what stays free is not said.']
    else if (s.id === 'low-checkin') [outcome, note] = has('need-help') ? ['pass', 'Care and “Need help now?”.'] : ['risk', 'Progress in words is kind, but there is no help link.']
    return { id: s.id, outcome, note }
  })
}

/* --------------------------------------------------------------- Answer */

const QUOTE: Record<Theme, (p: Persona, tries: Verdict) => string> = {
  price: (p, t) => (t === 'no' ? 'Not at that price. Not now.' : p.willingnessToPay === 'free only' ? 'Free is fine. I am not paying for it.' : 'I will see if it earns the money first.'),
  notifications: () => 'If it nags me, it goes.',
  privacy: (p) => (p.privacy === 'very protective' ? 'Tell me who reads it before I type a word.' : 'Why do I need an account to find out?'),
  trust: (p, t) => (p.aiAttitude === 'distrustful' && t === 'no' ? 'A computer telling me how to breathe? No.' : 'Show me it worked for someone like me.'),
  access: (p) => (p.techComfort === 'low' && p.age >= 65 ? 'My grandchild would have to set it up.' : `If it spoke ${p.language}, I would try it.`),
  voice: () => 'Let me pick the voice and I will stay.',
  habit: () => 'I will try. Remind me once, kindly.',
  switching: () => 'I already have one that works.',
}

/** A full answer in the runs' shape, with the variables of the run's level. */
export function answer(p: Persona, o: Offer, runLevel: 5 | 6 | 7, extra: Partial<BuyerAnswer> = {}): BuyerAnswer {
  const r = play(p, o, runLevel)
  const v = varsOf(p)
  const keys = varsUpTo(runLevel)
  return {
    personaId: p.id,
    tries: r.tries,
    pays: r.pays,
    plan: r.plan,
    prices: priceAnswers(p),
    theme: r.theme,
    objection: r.objection,
    flip: r.flip,
    confidence: r.confidence,
    reasoning: `${p.occupation}, ${p.age}, ${p.city}; ${v.condition} start (pain ${p.profile.testing.pain}, ${p.profile.sleep.hours} h sleep, quality ${p.profile.sleep.quality} of 5); would pay ${p.willingnessToPay}. ${r.because.join(' ')}`,
    quote: QUOTE[r.theme](p, r.tries),
    scenarios: r.scenarios,
    week: r.week,
    day30: r.day30,
    vars: Object.fromEntries(keys.map((k) => [k, v[k]])),
    ...extra,
  }
}

/** The B features whose removal makes this persona's answer worse: what moved them (rule 5). */
export function movedBy(p: Persona, a: Offer, b: Offer, runLevel: 5 | 6 | 7): string[] {
  const full = play(p, b, runLevel)
  const ctl = play(p, a, runLevel)
  if (level(full.tries) <= level(ctl.tries) && level(full.pays) <= level(ctl.pays)) return []
  const out: string[] = []
  const candidates: string[] = [...b.features.filter((f) => !a.features.includes(f))]
  if (a.entry !== b.entry || a.ticketEur !== b.ticketEur) candidates.push('entry')
  for (const f of candidates) {
    const without: Offer = f === 'entry' ? { ...b, entry: a.entry, ticketEur: a.ticketEur } : { ...b, features: b.features.filter((x) => x !== f) }
    const r = play(p, without, runLevel)
    if (level(r.tries) < level(full.tries) || level(r.pays) < level(full.pays)) out.push(f)
  }
  return out
}

/* -------------------------------------------------------------- Tallies */

export interface Tally {
  n: number
  tries: Record<Verdict, number>
  pays: Record<Verdict, number>
}

export function tally(rows: { tries: Verdict; pays: Verdict }[]): Tally {
  const t = { yes: 0, maybe: 0, no: 0 }
  const y = { yes: 0, maybe: 0, no: 0 }
  for (const r of rows) {
    t[r.tries] += 1
    y[r.pays] += 1
  }
  return { n: rows.length, tries: t, pays: y }
}

/** Expected Plus payers: a yes counts 1, a maybe a half (the agent's own weighting, stated). */
export const expectedPlus = (t: Tally) => t.pays.yes + t.pays.maybe / 2

/** Share of a segment that would try (yes), by a variable. */
export function bySegment(answers: BuyerAnswer[], key: string) {
  const m = new Map<string, BuyerAnswer[]>()
  for (const a of answers) {
    const k = a.vars?.[key] ?? '–'
    m.set(k, [...(m.get(k) ?? []), a])
  }
  return [...m.entries()]
    .map(([k, as]) => ({ key: k, n: as.length, tries: as.filter((a) => a.tries === 'yes').length, pays: as.filter((a) => a.pays !== 'no').length }))
    .sort((x, y) => y.n - x.n)
}

export function topThemes(answers: BuyerAnswer[]): [Theme, number][] {
  const m = new Map<Theme, number>()
  for (const a of answers) m.set(a.theme, (m.get(a.theme) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

export function movedCounts(answers: BuyerAnswer[]): [string, number][] {
  const m = new Map<string, number>()
  for (const a of answers) for (const c of a.movedBy ?? []) m.set(c, (m.get(c) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

const med = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
export const band = (answers: BuyerAnswer[]) => ({ low: med(answers.map((a) => a.prices.bargain)), high: med(answers.map((a) => a.prices.expensive)) })
export const usd = (x: number) => `$${x % 1 ? x.toFixed(2) : x}`
export const of = (k: number, n: number) => `${k} of ${n}`
