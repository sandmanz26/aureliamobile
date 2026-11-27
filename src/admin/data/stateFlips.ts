/**
 * Admin → Product lab → StateFlips, all 125 (U141, J203). Five dimensions ×
 * 25: in each, the 10 issues of the persona condition list (personaConditionV4
 * ISSUES) become StateFlips 01–10, and 15 more (11–25) come from the Deeksha
 * universal needs (UN…) or, where those run out, the DOJO duals (DI…).
 *
 * Every StateFlip says where it comes from: `source` is either
 * "from <workbook / tab / ID>" or "drafted by us — to review". The bad and the
 * good state of 01–10 come from our issue list (which quotes the DOJO duals);
 * of 11–25 from the workbook row itself. The X → Y → Z steps and the check-in
 * questions of every StateFlip but sleep are drafted by us from a template.
 * Sleep (SF-PHY-01) is the one built out in full in stateFlipSleep.ts and keeps
 * its own markers, steps, DOJO links and numbers, unchanged.
 *
 * Chapters, chance and cost use stateFlipFormulas' personFlip and summarise
 * on the v4 personas whose condition carries the matching issue. Pure data and
 * functions, no React; deterministic.
 */

import { AKP_SOURCE } from './generated/akpSource'
import { DIMENSIONS, DIMENSION_LABEL, DIMENSION_PLAIN, ISSUES, conditionsV4, type ConditionV4, type Dimension } from './personaConditionV4'
import { generatePersonasV4, type PersonaV4 } from './personasV4'
import { personFlip, sleepCohort, summarise, type FlipSummary } from './stateFlipFormulas'
import { DOJO_LINKS, MARKERS, MILESTONES, SLEEP_ISSUES, STATES, severityOf, whoHasIt, type Layer, type MilestoneId } from './stateFlipSleep'

export const DRAFTED = 'drafted by us — to review'
export const from = (...parts: string[]) => `from ${parts.join(' / ')}`

/* ------------------------------------------------------- The 5 dimensions */

export type DimCode = 'MEN' | 'EMO' | 'REL' | 'SPI' | 'PHY'

/**
 * The one shared dimension list for StateFlips, AKPs and personas' identity,
 * built on personaConditionV4's five. Mapping note (not refactored): the
 * healing map's worlds are the same five with physical called "sleep"
 * (healingMap.ts WorldId 'sleep' = physical); the therapeutic map's corners
 * (product, business, wellness) are functions, not dimensions: all five sit
 * under its "wellness" corner.
 */
export const STATEFLIP_DIMENSIONS: { id: Dimension; code: DimCode; label: string; plain: string; healingWorld: string }[] = DIMENSIONS.map((d) => ({
  id: d,
  code: ({ mental: 'MEN', emotional: 'EMO', relational: 'REL', spiritual: 'SPI', physical: 'PHY' } as const)[d],
  label: DIMENSION_LABEL[d],
  plain: DIMENSION_PLAIN[d],
  healingWorld: d === 'physical' ? 'sleep' : d,
}))
export const dimCode = (d: Dimension) => STATEFLIP_DIMENSIONS.find((x) => x.id === d)!.code

/* ---------------------------------------------------------------- Types */

export interface FlipMilestone {
  id: MilestoneId
  title: string
  threshold: number
  layer: Layer
  what: string
}

export interface FlipMarker {
  label: string
  question: string
  bad: string
  good: string
}

export interface StateFlip {
  id: string
  n: number
  dimension: Dimension
  /** Short name, plain English: "<bad> → <good>". */
  title: string
  need: { id: string; kind: 'UN' | 'dual' | 'none'; label: string; source: string }
  bad: string
  good: string
  milestones: FlipMilestone[]
  measure: { scale: string; markers: FlipMarker[]; source: string }
  /** The persona-condition issues whose people this StateFlip is for. */
  issues: string[]
  /** True when the issues are a related issue, not this StateFlip's own (11–25). */
  sharedIssue: boolean
  prevalence: string
  prevalenceSource: string
  layer: Layer
  layerSource: string
  dojo: { concepts: string[]; duals: string[]; skills: string[] }
  origin: 'issue' | 'workbook'
  source: string
}

/* -------------------------------------------------------------- Matching */

const STOP = new Set('and or the a an of to in on for with from at by is are be it its as into your you my me i not no lack loss feel feeling feelings state states emotional mental physical physiological spiritual relational life time'.split(' '))
const stem = (w: string) => w.replace(/(fulness|iness|ness|ities|ity|ing|ion|ions|ed|ly|al|s)$/, '').slice(0, 7)
export function tokens(...texts: string[]): Set<string> {
  const out = new Set<string>()
  for (const t of texts) for (const w of t.toLowerCase().split(/[^a-z]+/)) if (w.length > 2 && !STOP.has(w)) out.add(stem(w))
  return out
}
const overlap = (a: Set<string>, b: Set<string>) => {
  let n = 0
  for (const x of a) if (b.has(x)) n++
  return n
}
/** The best `k` rows by token overlap (ties keep sheet order); rows scoring 0 are dropped. */
function best<T>(rows: readonly T[], text: (r: T) => string, want: Set<string>, k: number): T[] {
  return rows
    .map((r, i) => ({ r, i, s: overlap(want, tokens(text(r))) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, k)
    .map((x) => x.r)
}

const S = AKP_SOURCE
type Un = (typeof S.un)[number]
type Dual = (typeof S.duals)[number]

const DUAL_COLS: Record<Dimension, [keyof Dual, keyof Dual]> = {
  mental: ['mentIssue', 'mentWell'],
  emotional: ['emoIssue', 'emoWell'],
  relational: ['emoIssue', 'emoWell'],
  spiritual: ['mentIssue', 'mentWell'],
  physical: ['physIssue', 'physWell'],
}

/** Which Deeksha pillar-2 groups feed which dimension (drafted by us). */
const UN_DIMENSION: Record<string, Dimension> = {
  Family: 'relational', Partner: 'relational', Friends: 'relational', Anniversary: 'relational',
  Spiritual: 'spiritual', Physical: 'physical', 'Emotional & Mental': 'emotional',
  Work: 'mental', Hobby: 'mental', Transition: 'mental', Achievement: 'mental',
}
/**
 * Universal needs left out of the 75: medical or clinical conditions Aurelia
 * must not claim to treat (trauma, PTSD, addiction, organ disorders, surgery),
 * body-part rows, and ones already covered by the 50 (insomnia, burnout…).
 */
const UN_SKIP = new Set([
  'UN032', 'UN034', 'UN035', 'UN036', 'UN040', 'UN041', 'UN042', 'UN043', 'UN047', 'UN049', 'UN050', 'UN052', 'UN053', 'UN054', 'UN054#2', 'UN055',
  'UN057', 'UN057#2', 'UN059', 'UN060', 'UN061', 'UN063', 'UN065', 'UN066', 'UN067', 'UN068', 'UN069', 'UN070', 'UN071', 'UN072', 'UN076', 'UN077', 'UN080', 'UN082', 'UN083', 'UN085', 'UN086',
  'UN089', 'UN095', 'UN097', 'UN106', 'UN115', 'UN123', 'UN142', 'UN147',
  'UN064', 'UN073', 'UN074', 'UN075', 'UN078', 'UN079', 'UN081',
])
/** The emotional & mental universal needs that are about thinking go to mental (drafted by us). */
const UN_TO_MENTAL = new Set(['UN037', 'UN045', 'UN048'])
const unDimension = (u: Un): Dimension | undefined => (UN_TO_MENTAL.has(u.id) ? 'mental' : UN_DIMENSION[u.pillar2])

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** "Lack of Zeal" → "Lack of zeal". */
const sentence = (s: string) => cap(s.toLowerCase())
const lower = (s: string) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s)
/** "Restlessness → Mental stillness (sleep)" → "Mental stillness". */
const goodOf = (dojo: string) => cap(dojo.split('→').pop()!.split(/[;(]/)[0].trim())

/* ------------------------------------------------------ Layer and steps */

const MOOD_WORDS = tokens('anxious anxiety edge low mood irritable temper overwhelmed numb fear dread anger rage turbulence chaos stress upset sorrow tension worry calm tranquility serenity')
const HABIT_WORDS = tokens('habit habits routine movement active sleep screens scrolling caffeine alcohol clock rituals practice digestion energy fatigue tired engagement play work balance')
const LAYER_DEFAULT: Record<Dimension, Layer> = { mental: 'skill', emotional: 'mood', relational: 'skill', spiritual: 'skill', physical: 'habit' }

/** The DOJO causal layer that has to move most for this flip: a mood, a habit or a skill (drafted rule, to review). */
export function layerFor(d: Dimension, bad: string, good: string): Layer {
  const t = tokens(bad, good)
  const m = overlap(t, MOOD_WORDS)
  const h = overlap(t, HABIT_WORDS)
  if (h > m) return 'habit'
  if (m > h) return 'mood'
  return LAYER_DEFAULT[d]
}

function steps(bad: string, good: string): FlipMilestone[] {
  const b = lower(bad)
  const g = lower(good)
  return [
    { id: 'X', title: 'Feels some relief', threshold: 45, layer: 'mood', what: `Notices ${b} sooner and can ease it for a while; a few better days a week.` },
    { id: 'Y', title: 'Has a routine that helps', threshold: 65, layer: 'habit', what: `Keeps a short daily practice that brings ${g} on most days.` },
    { id: 'Z', title: `${cap(g)} holds`, threshold: 85, layer: 'skill', what: `${cap(g)} holds without effort, even in a hard week. This is the StateFlip.` },
  ]
}

function markers(bad: string, good: string): FlipMarker[] {
  const b = lower(bad)
  const g = lower(good)
  return [
    { label: 'How often', question: `On how many of the last 7 days did you have ${b}?`, bad: '5–7 days', good: '0–1 days' },
    { label: 'How strong', question: 'When it came, how strong was it? (0 = not at all, 10 = as bad as it gets)', bad: '7–10', good: '0–2' },
    { label: 'Got in the way', question: 'How much did it get in the way of your day? (not at all, a little, a lot)', bad: 'a lot', good: 'not at all' },
    { label: `How close to ${g}`, question: `How close did you feel to ${g} this week? (1 = far, 5 = there)`, bad: '1–2', good: '4–5' },
  ]
}
const MEASURE_SCALE = '0–100, higher is better: four questions, 25 points each, after each chapter. X at 45, Y at 65, Z (the flip) at 85.'

/* --------------------------------------------------------- DOJO links */

const CONCEPTS = [...S.dojoC.map((c) => ({ ...c, sheet: 'DOJO_C' })), ...S.dojoM.map((c) => ({ ...c, sheet: 'DOJO_M' }))]
const conceptText = (c: (typeof CONCEPTS)[number]) => `${c.name} ${c.objective} ${c.obstacle} ${c.wellness}`
const dualText = (d: Dual, dim: Dimension) => `${d.name} ${d[DUAL_COLS[dim][0]]} ${d[DUAL_COLS[dim][1]]}`
const SKILL_FALLBACK: Record<Dimension, string> = { mental: 'SK4', emotional: 'SK2', relational: 'SK8', spiritual: 'SK1', physical: 'SK7' }

export const conceptId = (c: { sheet: string; id: string }) => `${c.sheet} ${c.id}`

function dojoFor(d: Dimension, bad: string, good: string) {
  const want = tokens(bad, good)
  const concepts = best(CONCEPTS, conceptText, want, 2).map(conceptId)
  const duals = best(S.duals, (x) => dualText(x, d), want, 2).map((x) => x.id)
  const skills = best(S.skills, (x) => `${x.name} ${x.role}`, want, 2).map((x) => x.id)
  return { concepts, duals, skills: skills.length ? skills : [SKILL_FALLBACK[d]] }
}

function needFor(d: Dimension, bad: string, good: string): StateFlip['need'] {
  const want = tokens(good)
  const un = best(S.un.filter((u) => unDimension(u) === d && !UN_SKIP.has(u.id)), (u) => `${u.wellnessKw} ${u.headline}`, want, 1)[0]
  if (un) return { id: un.id, kind: 'UN', label: `${un.headline} (${un.obstacleKw} → ${un.wellnessKw})`, source: from('Deeksha workbook', 'UN', un.id) }
  const dual = best(S.duals, (x) => dualText(x, d), tokens(bad, good), 1)[0] ?? best(S.duals, (x) => `${x.name} ${x.emoWell} ${x.mentWell} ${x.physWell}`, tokens(bad, good), 1)[0]
  if (dual) return { id: dual.id, kind: 'dual', label: `${dual.name} (${dual[DUAL_COLS[d][0]]} → ${dual[DUAL_COLS[d][1]]})`, source: from('DOJO workbook', 'DOJO_C_Duals', dual.id) }
  return { id: '', kind: 'none', label: good, source: DRAFTED }
}

/* ------------------------------------------------------- The 125 flips */

function issueFlip(d: Dimension, i: number): StateFlip {
  const issue = ISSUES[d][i]
  const id = `SF-${dimCode(d)}-${String(i + 1).padStart(2, '0')}`
  const bad = issue.label
  const good = goodOf(issue.dojo)
  const base: StateFlip = {
    id, n: i + 1, dimension: d, title: `${bad} → ${lower(good)}`, need: needFor(d, bad, good), bad, good,
    milestones: steps(bad, good), measure: { scale: MEASURE_SCALE, markers: markers(bad, good), source: DRAFTED },
    issues: [issue.id], sharedIssue: false, prevalence: issue.prevalence, prevalenceSource: issue.kind === 'measured' ? `${issue.source} (measured, personasV4 / personaConditionV4 sources)` : 'assumption (personaConditionV4)',
    layer: layerFor(d, bad, good), layerSource: DRAFTED, dojo: dojoFor(d, bad, good), origin: 'issue',
    source: `${from('DOJO workbook', 'DOJO_C_Duals', issue.dojo)}, via the persona condition issue “${issue.id}”`,
  }
  if (id !== 'SF-PHY-01') return base
  // Sleep: the complete one, unchanged from stateFlipSleep.ts.
  return {
    ...base, title: `${STATES.bad.title} → ${lower(STATES.good.title)}`, bad: STATES.bad.title, good: STATES.good.title,
    milestones: MILESTONES.map((m) => ({ id: m.id, title: m.title, threshold: m.threshold, layer: m.layer, what: m.what })),
    measure: { scale: 'The sleep score, 0–100: four 25-point markers each morning after a chapter (stateFlipSleep.ts).', markers: MARKERS.map((m) => ({ label: m.label, question: m.question, bad: m.bad, good: m.good })), source: 'Research (PSQI, ISI, National Sleep Foundation, AASM) and our own energy question' },
    issues: [...SLEEP_ISSUES], layer: 'habit', layerSource: from('DOJO workbook', 'Objective Learning System KB', 'Habits (sleep hygiene is the Y step)'),
    dojo: {
      concepts: DOJO_LINKS.filter((l) => l.sheet === 'DOJO_M').map((l) => l.id),
      duals: ['DI003', 'DI005'],
      skills: ['SK9', 'SK10'],
    },
    source: `${from('DOJO workbook', 'DOJO_C_Duals', 'DI003')}; built out in full in stateFlipSleep.ts (U140)`,
  }
}

/** The issue whose people an extra StateFlip borrows when no issue matches its words (the dimension's general issue). */
const FALLBACK_ISSUE: Record<Dimension, string> = { mental: 'stuck-thinking', emotional: 'bottled-up', relational: 'no-one', spiritual: 'stuck', physical: 'fatigue' }
const DUAL_GOOD: Record<Dimension, RegExp> = { mental: /^mental\b/i, emotional: /^emotional\b/i, relational: /^emotional (connection|bond|trust|openness|support|harmony|empathy|intimacy)/i, spiritual: /^mental (peace|serenity|insight|wisdom|harmony|purpose)/i, physical: /^(physical|physiological)\b/i }
const norm = (s: string) => [...tokens(s)].sort().join(' ')

/** The 15 extra StateFlips of one dimension: Deeksha universal needs first, DOJO duals if those run out. */
function extraFlips(d: Dimension, taken: Set<string>): StateFlip[] {
  const out: StateFlip[] = []
  const seen = new Set(taken)
  const add = (bad: string, good: string, need: StateFlip['need'], src: string) => {
    const key = norm(good)
    if (!key || seen.has(key) || out.length >= 15) return
    seen.add(key)
    const n = 11 + out.length
    const related = best(ISSUES[d], (i) => `${i.label} ${i.dojo} ${i.goal}`, tokens(bad, good), 1)[0] ?? ISSUES[d].find((i) => i.id === FALLBACK_ISSUE[d])!
    out.push({
      id: `SF-${dimCode(d)}-${n}`, n, dimension: d, title: `${bad} → ${good.toLowerCase()}`, need, bad, good,
      milestones: steps(bad, good), measure: { scale: MEASURE_SCALE, markers: markers(bad, good), source: DRAFTED },
      issues: [related.id], sharedIssue: true, prevalence: `No population figure. Counted here as the people with the related issue “${related.label.toLowerCase()}”.`, prevalenceSource: DRAFTED,
      layer: layerFor(d, bad, good), layerSource: DRAFTED, dojo: dojoFor(d, bad, good), origin: 'workbook', source: src,
    })
  }
  for (const u of S.un) {
    if (UN_SKIP.has(u.id) || unDimension(u) !== d) continue
    const bad = sentence(u.obstacle.replace(/^For /, '').replace(/\.$/, ''))
    add(bad, sentence(u.wellnessKw), { id: u.id, kind: 'UN', label: `${u.headline} (${u.obstacleKw} → ${u.wellnessKw})`, source: from('Deeksha workbook', 'UN', u.id) }, from('Deeksha workbook', 'UN', u.id))
  }
  const [ic, wc] = DUAL_COLS[d]
  for (const x of S.duals) {
    const bad = String(x[ic])
    const good = String(x[wc])
    // Only rows whose wellness side names this dimension: some rows of the sheet are shifted by a column.
    if (!bad || !good || !DUAL_GOOD[d].test(good) || norm(bad) === norm(good)) continue
    add(sentence(bad), sentence(good), { id: x.id, kind: 'dual', label: `${x.name} (${bad} → ${good})`, source: from('DOJO workbook', 'DOJO_C_Duals', x.id) }, from('DOJO workbook', 'DOJO_C_Duals', x.id))
  }
  return out
}

let FLIPS: StateFlip[] | undefined

/** All 125 StateFlips, 25 per dimension, in dimension order. */
export function stateFlips(): StateFlip[] {
  if (FLIPS) return FLIPS
  const out: StateFlip[] = []
  for (const d of DIMENSIONS) {
    const base = ISSUES[d].map((_, i) => issueFlip(d, i))
    out.push(...base, ...extraFlips(d, new Set(base.map((f) => norm(f.good)))))
  }
  return (FLIPS = out)
}

export const stateFlipById = (id: string) => stateFlips().find((f) => f.id === id)

/* ----------------------------------------------- Who has it, and numbers */

export interface FlipNumbers extends FlipSummary {
  /** v4 personas whose condition names one of the flip's issues in its dimension. */
  withIssue: number
  /** … of whom this dimension is also the main need. */
  mainNeed: number
  /** … not risk-flagged, band not good: the group the numbers follow. */
  group: number
  ids: string[]
  basis: string
}

const NUM_CACHE = new Map<string, FlipNumbers>()

function groupOf(d: Dimension, issues: string[]) {
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const withIssue: { p: PersonaV4; c: ConditionV4 }[] = []
  for (const p of ps) {
    const c = cs.get(p.id)!
    if (issues.includes(c.dims[d].issue)) withIssue.push({ p, c })
  }
  return withIssue
}

/** Who has a StateFlip in the 1,000 v4 personas, and its chapters, chance and cost (computed). */
export function flipNumbers(f: StateFlip): FlipNumbers {
  const key = `${f.dimension}:${f.issues.join(',')}:${f.id === 'SF-PHY-01'}`
  const hit = NUM_CACHE.get(key)
  if (hit) return hit
  const withIssue = groupOf(f.dimension, f.issues)
  let out: FlipNumbers
  if (f.id === 'SF-PHY-01') {
    const w = whoHasIt()
    const c = sleepCohort()
    out = {
      ...summarise(c.people), medianChapters: c.medianChapters, meanChance: c.meanChance, chaptersPlayed: c.chaptersPlayed, costPerFlip: c.costPerFlip,
      withIssue: withIssue.length, mainNeed: w.sleepNeed, group: c.people.length, ids: c.people.map((p) => p.id),
      basis: 'The sleep group of stateFlipSleep.ts: poor or very poor sleep, main need physical with a sleep issue, sleep score under 85, no risk flag. Start = the sleep score.',
    }
  } else {
    const group = withIssue.filter(({ c }) => !c.excluded && c.dims[f.dimension].band !== 'good')
    const people = group.map(({ p, c }) => {
      const start = c.dims[f.dimension].score
      return personFlip(p, c, start, severityOf(start))
    })
    out = {
      ...summarise(people), withIssue: withIssue.length, mainNeed: withIssue.filter(({ c }) => c.mainNeed === f.dimension).length, group: group.length, ids: group.map(({ p }) => p.id),
      basis: `v4 personas whose ${DIMENSION_LABEL[f.dimension].toLowerCase()} issue is ${f.issues.join(', ')}, band not good, no risk flag. Start = their ${DIMENSION_LABEL[f.dimension].toLowerCase()} score. Same formulas as sleep.`,
    }
  }
  NUM_CACHE.set(key, out)
  return out
}

/* --------------------------------------------------------------- Summary */

export function stateFlipSummary() {
  const fs = stateFlips()
  const byDim = Object.fromEntries(DIMENSIONS.map((d) => [d, fs.filter((f) => f.dimension === d).length])) as Record<Dimension, number>
  const byLayer = { mood: 0, habit: 0, skill: 0 } as Record<Layer, number>
  for (const f of fs) byLayer[f.layer]++
  return {
    total: fs.length,
    byDim,
    byLayer,
    fromIssues: fs.filter((f) => f.origin === 'issue').length,
    fromUN: fs.filter((f) => f.origin === 'workbook' && f.need.kind === 'UN').length,
    fromDuals: fs.filter((f) => f.origin === 'workbook' && f.need.kind === 'dual').length,
    linkedToUN: fs.filter((f) => f.need.kind === 'UN').length,
  }
}
