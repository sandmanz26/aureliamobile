// Persona set v4, wellness identity (U141, J203). Each of the 1,000 v4 people
// gets a Wellness Identity across the twelve "Grand" dimensions of the
// business owner's identity workbook (2026-11-27-wellness-identity-akp-first-
// view.xlsx), using its "Light" sub-dimensions where they say more, plus a
// compact "mindspace" across four functions: wellness, product, business and
// brand (brand is a placeholder until the marketing sheet arrives).
//
// Like the condition, it is derived from facts the persona and its condition
// already have; the little chance it needs (cognitive style, a palette, a busy
// person's archetype, spiritual language) comes from its own stream,
// IDENTITY_SEED + the persona's number, so personasV4 and personaConditionV4
// stay byte-identical (pinned in personaIdentityV4.test.ts). Every rule here is
// ours: drafted by us — to review, until real check-ins replace it.

import { sessionMinutesOf, type ConditionV4, conditionsV4, ISSUES, DIMENSION_LABEL } from './personaConditionV4'
import { generatePersonasV4, type PersonaV4, type ScenarioId } from './personasV4'
import { dimCode, stateFlipById } from './stateFlips'

export const IDENTITY_SEED = 20266

export type IdentityKey =
  | 'outcomes' | 'emotional' | 'cognitive' | 'regulation' | 'capacity' | 'archetype'
  | 'preferences' | 'relational' | 'values' | 'risks' | 'culture' | 'meta'

/** The Grand 12, in the workbook's order, with the Light sub-dimensions each one reads. */
export const IDENTITY_DIMENSIONS: { key: IdentityKey; name: string; akp: string; light: string[] }[] = [
  { key: 'outcomes', name: 'Wellness Outcomes', akp: 'ID-G01', light: ['Primary Goal AKPs'] },
  { key: 'emotional', name: 'Emotional State Profile', akp: 'ID-G02', light: ['Current Affective State', 'Window of Tolerance'] },
  { key: 'cognitive', name: 'Cognitive Style & Load', akp: 'ID-G03', light: ['Cognitive Style AKPs', 'Cognitive Load Level'] },
  { key: 'regulation', name: 'Regulatory Strategies', akp: 'ID-G04', light: ['Regulation Style AKPs'] },
  { key: 'capacity', name: 'Capacity & Skill Mastery', akp: 'ID-G05', light: ['Breathwork Mastery', 'Attention & Mindfulness'] },
  { key: 'archetype', name: 'Identity Archetypes', akp: 'ID-G06', light: [] },
  { key: 'preferences', name: 'Preference Profiles', akp: 'ID-G07', light: ['Voice Timbre Preference', 'Tempo Preference', 'Session Length Preference', 'Color/Palette Preference', 'Chronotype AKPs'] },
  { key: 'relational', name: 'Relational & Social Context', akp: 'ID-G08', light: ['Social Preference', 'Attachment/Relational Orientation'] },
  { key: 'values', name: 'Value & Goal Orientation', akp: 'ID-G09', light: ['Value Orientation'] },
  { key: 'risks', name: 'Dynamic Risk Flags', akp: 'ID-G10', light: ['Contraindications', 'Risk Sensitivity AKPs'] },
  { key: 'culture', name: 'Cultural Context Layer', akp: 'ID-G11', light: ['Cultural Profile AKPs', 'Spiritual Orientation AKPs'] },
  { key: 'meta', name: 'Wellness Identity Meta (Governance)', akp: 'ID-G12', light: ['Identity Uncertainty & Entropy', 'Versioning & Drift'] },
]

export type Archetype = 'Explorer' | 'Caregiver' | 'Achiever' | 'Seeker' | 'Rebuilder' | 'Guardian'
export type CogStyle = 'analytic' | 'intuitive' | 'narrative' | 'somatic'
export type Value = 'purpose' | 'compassion' | 'growth' | 'balance' | 'security' | 'belonging'
export type SpiritualLanguage = 'welcome' | 'neutral' | 'secular only'

export interface IdentityDim {
  key: IdentityKey
  value: string
  detail: string
}

export interface Mindspace {
  headline: string
  facts: { label: string; value: string }[]
  /** AKP ids this function reads (WG-, ID-, PR-). */
  akps: string[]
}

export interface IdentityV4 {
  id: string
  dims: Record<IdentityKey, IdentityDim>
  archetype: Archetype
  cogStyle: CogStyle
  value: Value
  spiritual: SpiritualLanguage
  flags: string[]
  /** The StateFlip their main need points at. */
  flip: string
  mindspace: Record<'wellness' | 'product' | 'business' | 'brand', Mindspace>
}

/* ------------------------------------------------------------------ PRNG */

/** mulberry32 (the same as personasV4.ts), seeded per person so the identity has its own stream. */
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
type Rand = () => number
function weighted<T>(r: Rand, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((n, [, w]) => n + w, 0)
  let x = r() * total
  for (const [v, w] of xs) {
    x -= w
    if (x < 0) return v
  }
  return xs[xs.length - 1][0]
}

/* ----------------------------------------------------------------- Rules */

const ARCHETYPE: Partial<Record<ScenarioId, Archetype>> = {
  exams: 'Achiever', 'new-parent': 'Caregiver', 'job-loss': 'Rebuilder', burnout: 'Achiever', grief: 'Seeker', 'shift-rota': 'Guardian', 'pain-flare': 'Rebuilder',
  relationship: 'Seeker', menopause: 'Explorer', 'retirement-lonely': 'Explorer', money: 'Guardian', 'post-illness': 'Rebuilder', caring: 'Caregiver', moved: 'Explorer',
}
const VALUE: Partial<Record<ScenarioId, Value>> = {
  money: 'security', 'job-loss': 'security', caring: 'compassion', 'new-parent': 'compassion', exams: 'balance', burnout: 'balance', grief: 'purpose', 'retirement-lonely': 'purpose',
  moved: 'belonging', relationship: 'belonging', 'pain-flare': 'balance', 'post-illness': 'growth', menopause: 'balance', 'shift-rota': 'balance',
}
const REGULATION = { breath: 'breath first', 'sleep audio': 'voice first', 'voice guidance': 'voice first', movement: 'movement first', journaling: 'reflection first', music: 'music first' } as const

const COPING = { avoid: 'avoiding it', distract: 'distracting themselves', talk: 'talking to someone', move: 'moving', substances: 'coffee or alcohol' } as const
const level = (n: number) => `L${Math.max(1, Math.min(3, n))}`

/** The StateFlip id for a dimension's issue: SF-<DIM>-<index + 1>. */
export const flipForIssue = (c: ConditionV4) => {
  const d = c.mainNeed
  return `SF-${dimCode(d)}-${String(ISSUES[d].findIndex((i) => i.id === c.dims[d].issue) + 1).padStart(2, '0')}`
}

export function identityOf(p: PersonaV4, c: ConditionV4): IdentityV4 {
  const r = rng(IDENTITY_SEED + Number(p.id.slice(3)))
  const w = p.wellness
  const flip = flipForIssue(c)
  const f = stateFlipById(flip)!

  const emo = c.dims.emotional.score
  const emotional = emo >= 73 ? 'steady' : emo >= 50 ? 'up and down' : 'low or on edge'
  const tolerance = w.anxiety === 'severe' || c.riskFlag ? 'narrow' : w.anxiety === 'moderate' || w.stress.band === 'high' ? 'medium' : 'wide'

  const cogStyle: CogStyle =
    c.helpers[0] === 'journaling' ? 'narrative' : c.helpers[0] === 'movement' || c.helpers[0] === 'breath' ? 'somatic' : p.work === 'student' ? 'analytic'
      : weighted(r, [['analytic', 3], ['intuitive', 3], ['narrative', 2], ['somatic', 2]] as const)
  const load = w.stress.band === 'high' || p.scenario === 'burnout' || p.scenario === 'exams' ? 'high' : w.stress.band === 'moderate' ? 'moderate' : 'low'

  const used = p.priorAppOutcome === 'still uses it' ? 2 : p.priorAppOutcome === 'stopped' ? 1 : 0
  const ready = c.readiness === 'acting' || c.readiness === 'maintaining' ? 1 : 0
  const breathL = level(1 + (used >= 2 ? 1 : 0) + (c.helpers.includes('breath') ? ready : 0))
  const attentionL = level(1 + (used >= 1 ? 1 : 0) + ready)

  const archetype: Archetype = ARCHETYPE[p.scenario] ?? (p.caregiving ? 'Caregiver' : weighted(r, [['Achiever', 3], ['Explorer', 2], ['Seeker', 1]] as const))
  const palette = weighted(r, [['earthy ambers', 3], ['soft blues', 2], ['forest greens', 2], ['dusk violets', 1]] as const)
  const voice = w.anxiety !== 'none' || /evening|night/.test(c.bestTime) ? 'warm and low' : 'clear, mid-range'
  const tempo = w.sleep.band !== 'good' ? '50–60 bpm' : '60–72 bpm'
  const length = sessionMinutesOf(c.minutesPerDay)
  const chronotype = p.shiftWork ? 'shifting (shift work)' : c.bestTime === 'morning' ? 'lark' : /evening|night/.test(c.bestTime) ? 'owl' : 'in between'

  const social = c.support === 'alone' ? 'solo, with a guide voice' : c.support === 'some' ? 'solo or paired' : 'open to a group'
  const value: Value = VALUE[p.scenario] ?? weighted(r, [['growth', 2], ['balance', 2], ['purpose', 1]] as const)

  const flags: string[] = []
  if (c.riskFlag) flags.push('Need help now? first: never offered a session')
  if (w.anxiety === 'moderate' || w.anxiety === 'severe') flags.push('no breath holds until L2 (worry or panic)')
  if (w.sleep.band === 'very poor') flags.push('very poor sleep: no stimulating evening content')
  if (p.chronicPain) flags.push('long-term pain: gentle body scans only')
  if (w.stress.band === 'high') flags.push('burnout risk: short sessions, more silence')

  const spiritual: SpiritualLanguage = c.dims.spiritual.issue === 'disconnected' || c.dims.spiritual.issue === 'meaning-shaken' ? 'welcome' : weighted(r, [['welcome', 2], ['neutral', 3], ['secular only', 2]] as const)
  const uncertainty = used ? 'medium' : 'high'

  const dims: Record<IdentityKey, IdentityDim> = {
    outcomes: { key: 'outcomes', value: f.title, detail: `${DIMENSION_LABEL[c.mainNeed]}, ${c.dims[c.mainNeed].score} → ${c.dims[c.mainNeed].target}; StateFlip ${flip}.` },
    emotional: { key: 'emotional', value: emotional, detail: `Emotional score ${emo}; low mood ${w.mood}, worry ${w.anxiety}; window of tolerance ${tolerance}.` },
    cognitive: { key: 'cognitive', value: `${cogStyle}, ${load} load`, detail: `Style from what helps them (${c.helpers[0]}) and their work; load from stress (${w.stress.band}) and life situation.` },
    regulation: { key: 'regulation', value: REGULATION[c.helpers[0]], detail: `Helps most: ${c.helpers.join(', ')}. Copes by ${COPING[c.coping]} today.` },
    capacity: { key: 'capacity', value: `breath ${breathL}, attention ${attentionL}`, detail: `From past app use (${p.priorAppOutcome}) and readiness (${c.readiness}). Starts at L1 unless both say more.` },
    archetype: { key: 'archetype', value: archetype, detail: `From their life situation (${p.scenario}).` },
    preferences: { key: 'preferences', value: `${length}-minute chapters, ${voice} voice`, detail: `Tempo ${tempo}; palette ${palette}; best time ${c.bestTime}; chronotype ${chronotype}.` },
    relational: { key: 'relational', value: social, detail: `Support ${c.support}; lives: ${p.household}.` },
    values: { key: 'values', value, detail: `What would make progress feel worth it, from their life situation. Goal in their words: “${c.goal}”` },
    risks: { key: 'risks', value: flags.length ? `${flags.length} flag${flags.length > 1 ? 's' : ''}` : 'none', detail: flags.length ? flags.join('; ') : 'No contraindications in the profile.' },
    culture: { key: 'culture', value: `${p.language}${p.readsEnglish ? ', reads English' : ''}`, detail: `${p.region}, ${p.country}. Spiritual language: ${spiritual}.` },
    meta: { key: 'meta', value: `v1, uncertainty ${uncertainty}`, detail: 'Drawn from profile facts only; no check-ins yet. Rules drafted by us — to review.' },
  }

  const sa = p.aiAttitude === 'skeptical' || p.aiAttitude === 'distrustful' ? 'SA1' : p.aiAttitude === 'enthusiastic' ? 'SA8' : 'SA2'
  const sc = /evening|night/.test(c.bestTime) ? 'SC3' : w.stress.band === 'high' ? 'SC4' : 'SC2'
  const uo = ({ mental: 'UO1', emotional: 'UO1', physical: 'UO3', relational: 'UO8', spiritual: 'UO2' } as const)[c.mainNeed]
  const ff = c.riskFlag ? 'FF6' : p.priorAppOutcome === 'never used one' ? 'FF1' : 'FF3'
  const wellnessHead = c.riskFlag ? 'Routed to Need help now?; no StateFlip is offered.' : `Works on ${f.title.toLowerCase()} (${flip}); readiness: ${c.readiness}.`
  return {
    id: p.id, dims, archetype, cogStyle, value, spiritual, flags, flip,
    mindspace: {
      wellness: { headline: wellnessHead, facts: [{ label: 'Main need', value: DIMENSION_LABEL[c.mainNeed] }, { label: 'Archetype', value: archetype }, { label: 'Values', value }], akps: [flip.replace(/^SF-/, 'WG-'), 'ID-G01', 'ID-G06'] },
      product: { headline: `${p.device}, ${length}-minute chapters; best time: ${c.bestTime}.`, facts: [{ label: 'Interface persona', value: sa }, { label: 'Session context', value: sc }, { label: 'Platform', value: p.wearable !== 'none' ? `PE2 + PE4 (${p.wearable})` : 'PE2' }, { label: 'Flow', value: ff }], akps: [`PR-${sa}`, `PR-${sc}`, 'PR-PE2', ...(p.wearable !== 'none' ? ['PR-PE4'] : []), `PR-${uo}`, `PR-${ff}`] },
      business: { headline: `${p.income} income, ${p.priorAppOutcome}, ${p.aiAttitude} about AI.`, facts: [{ label: 'Price sensitivity', value: p.income === 'low' ? 'high' : p.income === 'middle' ? 'medium' : 'low' }, { label: 'Trust barrier', value: p.aiAttitude === 'distrustful' || p.aiAttitude === 'skeptical' ? 'high' : 'low' }, { label: 'Marketable', value: p.marketable && !c.riskFlag ? 'yes' : 'no' }], akps: [] },
      brand: { headline: 'Pending the marketing sheet.', facts: [], akps: [] },
    },
  }
}

let CACHE: Map<string, IdentityV4> | undefined

/** Identities for all 1,000 v4 people, by persona id. */
export function identitiesV4(): Map<string, IdentityV4> {
  if (CACHE) return CACHE
  const cs = conditionsV4()
  return (CACHE = new Map(generatePersonasV4().map((p) => [p.id, identityOf(p, cs.get(p.id)!)])))
}

/** What makes an identity not hold together with its persona and condition. Must be empty for all 1,000. */
export function identityIncoherence(p: PersonaV4, c: ConditionV4, id: IdentityV4): string[] {
  const out: string[] = []
  const help = id.flags.some((f) => f.startsWith('Need help now?'))
  if (c.riskFlag !== help) out.push('risk flag and Need help now? disagree')
  if (sessionMinutesOf(c.minutesPerDay) > Math.max(c.minutesPerDay, 3)) out.push('chapters longer than their daily time')
  if (id.archetype === 'Caregiver' && !(p.caregiving || p.scenario === 'new-parent' || p.scenario === 'caring')) out.push('caregiver without anyone to care for')
  if (id.spiritual === 'secular only' && (c.dims.spiritual.issue === 'disconnected' || c.dims.spiritual.issue === 'meaning-shaken')) out.push('secular only but misses faith or meaning')
  if (!stateFlipById(id.flip) || !id.flip.includes(dimCode(c.mainNeed))) out.push('StateFlip not in the main need')
  if (id.mindspace.wellness.akps.length === 0) out.push('no wellness AKPs')
  return out
}

/** Counts for the page and Report metrics. */
export function identitySummary() {
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const ids = identitiesV4()
  const count = <T extends string>(f: (x: IdentityV4) => T) => {
    const m = {} as Record<T, number>
    for (const x of ids.values()) m[f(x)] = (m[f(x)] ?? 0) + 1
    return m
  }
  return {
    people: ids.size,
    archetype: count((x) => x.archetype),
    cogStyle: count((x) => x.cogStyle),
    value: count((x) => x.value),
    spiritual: count((x) => x.spiritual),
    flagged: [...ids.values()].filter((x) => x.flags.length).length,
    incoherent: ps.filter((p) => identityIncoherence(p, cs.get(p.id)!, ids.get(p.id)!).length).length,
  }
}
