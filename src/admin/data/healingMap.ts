/**
 * Admin → Product lab → Healing Map (U131, J183). Which building blocks help
 * which bad state, and how sure we are. Three rings: bad states (inner),
 * building blocks, the app's "Change this session" Lego bites (middle), and
 * good states (outer). Every link says where its strength comes from:
 *
 * - `sample`: a design sample. The number is invented so the map can be read
 *   before any real results exist.
 * - `research`: a published review says this kind of practice is often
 *   followed by this kind of change. It carries a citation and no number: a
 *   citation is not a strength (Insight Timer round 3, honesty rule 6).
 * - `learned`: learned from Aurelia's own check-ins. There are none yet, so
 *   there are no such links; `healingMap.test.ts` fails if one appears while
 *   `LEARNED_FROM_REAL_RESULTS` is false.
 *
 * Wellness wording only: links describe association ("often followed by"),
 * never cause or cure.
 */

export type WorldId = 'sleep' | 'mental' | 'emotional' | 'relational' | 'spiritual'

export const WORLDS: { id: WorldId; label: string; short: string }[] = [
  { id: 'sleep', label: 'Sleep and body', short: 'Sleep' },
  { id: 'mental', label: 'Mind and focus', short: 'Mental' },
  { id: 'emotional', label: 'Feelings', short: 'Emotional' },
  { id: 'relational', label: 'Relationships', short: 'Relational' },
  { id: 'spiritual', label: 'Meaning', short: 'Spiritual' },
]

export type Ring = 'bad' | 'block' | 'good'
export const RING_LABEL: Record<Ring, string> = { bad: 'Bad state', block: 'Building block', good: 'Good state' }

export interface HealingNode {
  id: string
  ring: Ring
  label: string
  world: WorldId
  /** One plain sentence: what it is. */
  about: string
  /** For a building block: where it lives in the app today. */
  inApp?: string
}

export type Provenance = 'sample' | 'research' | 'learned'

export const PROVENANCE_TEXT: Record<Provenance, string> = {
  sample: 'Design sample (no real results yet)',
  research: 'Research evidence (cited)',
  learned: 'Learned from users (none yet)',
}

export const PROVENANCE_MEANING: Record<Provenance, string> = {
  sample: 'An invented strength so the map can be read. Nobody has measured it.',
  research: 'A published review reports this kind of practice is often followed by this kind of change. The citation is shown; it is not a strength score.',
  learned: 'How often this block was followed by a better check-in for real people. Appears only once real check-ins exist, with how many people it is based on.',
}

export interface Citation {
  text: string
  url: string
}

export interface HealingLink {
  from: string
  to: string
  provenance: Provenance
  /** 0–1, only for sample links (invented). Research links carry no number. */
  strength?: number
  citation?: Citation
  /** Distinct people behind a learned link; required for `learned`. */
  people?: number
}

/** False until real check-ins exist. Flip only with real data behind it. */
export const LEARNED_FROM_REAL_RESULTS = false
/** Honesty rule 2: a learned link shows only above this many distinct people. */
export const MIN_PEOPLE_FOR_LEARNED = 20

export const NODES: HealingNode[] = [
  // Inner ring: bad states (from the app's feelings on Home and the five worlds).
  { id: 'poor-sleep', ring: 'bad', label: 'Poor sleep', world: 'sleep', about: 'Hard to fall or stay asleep. Home’s “Hard to sleep”.' },
  { id: 'wired-body', ring: 'bad', label: 'Wired body', world: 'sleep', about: 'Tense and restless, the body will not settle.' },
  { id: 'racing-mind', ring: 'bad', label: 'Racing mind', world: 'mental', about: 'Thoughts keep going round. Home’s “Overthinking”.' },
  { id: 'brain-fog', ring: 'bad', label: 'Can’t focus', world: 'mental', about: 'Foggy, scattered attention. Home’s “Can’t focus”.' },
  { id: 'stress', ring: 'bad', label: 'Stress', world: 'emotional', about: 'Under pressure, on edge. Home’s “Stressed”.' },
  { id: 'low-mood', ring: 'bad', label: 'Low mood', world: 'emotional', about: 'Drained and low. Home’s “Feeling low”.' },
  { id: 'conflict', ring: 'bad', label: 'After a conflict', world: 'relational', about: 'Hurt or angry after a clash with someone close.' },
  { id: 'lonely', ring: 'bad', label: 'Lonely', world: 'relational', about: 'Feeling cut off from people.' },
  { id: 'disconnected', ring: 'bad', label: 'Disconnected', world: 'spiritual', about: 'Going through the motions, no sense of meaning.' },

  // Middle ring: building blocks, the "Change this session" Lego bites (chat/firstSession.ts, lib/wellnessAnalysis.ts).
  { id: 'slow-breath', ring: 'block', label: 'Slow breath', world: 'sleep', about: 'Breath cues slow down toward a long exhale.', inApp: 'Sleep deck in “Change this session”' },
  { id: 'warm-dim', ring: 'block', label: 'Warm, dim', world: 'sleep', about: 'The picture darkens and warms as it goes.', inApp: 'Sleep deck' },
  { id: 'voice-fades', ring: 'block', label: 'Voice fades', world: 'sleep', about: 'The voice stops for the last minutes.', inApp: 'Sleep deck' },
  { id: 'body-scan', ring: 'block', label: 'Body scan', world: 'sleep', about: 'Attention moves through the body, head to feet.', inApp: 'Regulate deck' },
  { id: 'low-tones', ring: 'block', label: 'Low tones', world: 'sleep', about: 'Deep, slow sound the body can rest against.', inApp: 'Regulate deck' },
  { id: 'more-silence', ring: 'block', label: 'More silence', world: 'mental', about: 'Long quiet stretches so thoughts can settle.', inApp: 'Clarity deck' },
  { id: 'gentle-noting', ring: 'block', label: 'Gentle noting', world: 'mental', about: 'Name a thought, let it go, come back to the breath.', inApp: 'Clarity deck' },
  { id: 'no-melody', ring: 'block', label: 'No melody', world: 'mental', about: 'An even sound bed that never pulls attention.', inApp: 'Focus deck' },
  { id: 'longer-exhale', ring: 'block', label: 'Longer exhale', world: 'emotional', about: 'Out-breath longer than the in-breath.', inApp: 'Calm and Regulate decks' },
  { id: 'steady-pulse', ring: 'block', label: 'Steady pulse', world: 'emotional', about: 'A slow, even rhythm with nothing sudden in it.', inApp: 'Calm deck' },
  { id: 'fewer-words', ring: 'block', label: 'Fewer words', world: 'emotional', about: 'Short, plain guidance with room between the lines.', inApp: 'Calm deck' },
  { id: 'kind-words', ring: 'block', label: 'Kind wishes', world: 'relational', about: 'Wishing yourself and others well, one person at a time.', inApp: 'Not in the app yet (a candidate)' },
  { id: 'gratitude', ring: 'block', label: 'Gratitude note', world: 'spiritual', about: 'Naming a few things that went well.', inApp: 'Not in the app yet (a candidate)' },
  { id: 'warm-light', ring: 'block', label: 'Warm light', world: 'spiritual', about: 'Warm, rising light through the session.', inApp: 'Energy deck' },

  // Outer ring: good states.
  { id: 'deep-sleep', ring: 'good', label: 'Restful sleep', world: 'sleep', about: 'Falls asleep more easily and wakes rested.' },
  { id: 'settled-body', ring: 'good', label: 'Settled body', world: 'sleep', about: 'Loose, heavy, at rest.' },
  { id: 'clear-mind', ring: 'good', label: 'Quiet mind', world: 'mental', about: 'Thoughts slow down and leave room.' },
  { id: 'focus', ring: 'good', label: 'Focused', world: 'mental', about: 'Attention stays on one thing.' },
  { id: 'calm', ring: 'good', label: 'Calm', world: 'emotional', about: 'Steady, not on edge.' },
  { id: 'lighter-mood', ring: 'good', label: 'Lighter mood', world: 'emotional', about: 'A bit more energy and warmth.' },
  { id: 'repair', ring: 'good', label: 'Ready to repair', world: 'relational', about: 'Open to talking it through.' },
  { id: 'connected', ring: 'good', label: 'Connected', world: 'relational', about: 'Feels close to others.' },
  { id: 'purpose', ring: 'good', label: 'Sense of purpose', world: 'spiritual', about: 'Feels what matters again.' },
]

const ZACCARO: Citation = {
  text: 'Zaccaro et al. (2018), How breath-control can change your life: a systematic review on psycho-physiological correlates of slow breathing. Frontiers in Human Neuroscience 12:353.',
  url: 'https://doi.org/10.3389/fnhum.2018.00353',
}
const BALBAN: Citation = {
  text: 'Balban et al. (2023), Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine 4(1):100895.',
  url: 'https://doi.org/10.1016/j.xcrm.2022.100895',
}
const RUSCH: Citation = {
  text: 'Rusch et al. (2019), The effect of mindfulness meditation on sleep quality: a systematic review and meta-analysis of randomized controlled trials. Annals of the New York Academy of Sciences 1445(1):5–16.',
  url: 'https://doi.org/10.1111/nyas.13996',
}
const JESPERSEN: Citation = {
  text: 'Jespersen et al. (2022), Listening to music for insomnia in adults. Cochrane Database of Systematic Reviews, CD010459.',
  url: 'https://doi.org/10.1002/14651858.CD010459.pub3',
}
const ZENG: Citation = {
  text: 'Zeng et al. (2015), The effect of loving-kindness meditation on positive emotions: a meta-analytic review. Frontiers in Psychology 6:1693.',
  url: 'https://doi.org/10.3389/fpsyg.2015.01693',
}

const s = (from: string, to: string, strength: number): HealingLink => ({ from, to, provenance: 'sample', strength })
const r = (from: string, to: string, citation: Citation): HealingLink => ({ from, to, provenance: 'research', citation })

export const LINKS: HealingLink[] = [
  // bad → block
  s('poor-sleep', 'slow-breath', 0.7),
  s('poor-sleep', 'warm-dim', 0.5),
  s('poor-sleep', 'voice-fades', 0.6),
  r('poor-sleep', 'body-scan', RUSCH),
  r('poor-sleep', 'low-tones', JESPERSEN),
  s('wired-body', 'body-scan', 0.6),
  s('wired-body', 'low-tones', 0.5),
  s('wired-body', 'longer-exhale', 0.6),
  s('racing-mind', 'gentle-noting', 0.6),
  s('racing-mind', 'more-silence', 0.5),
  s('racing-mind', 'slow-breath', 0.4),
  s('brain-fog', 'no-melody', 0.5),
  s('brain-fog', 'more-silence', 0.4),
  r('stress', 'longer-exhale', ZACCARO),
  s('stress', 'steady-pulse', 0.5),
  s('stress', 'fewer-words', 0.4),
  r('low-mood', 'longer-exhale', BALBAN),
  s('low-mood', 'warm-light', 0.4),
  s('low-mood', 'gratitude', 0.4),
  s('conflict', 'longer-exhale', 0.5),
  s('conflict', 'kind-words', 0.5),
  s('lonely', 'kind-words', 0.5),
  s('disconnected', 'gratitude', 0.4),
  s('disconnected', 'more-silence', 0.3),
  // block → good
  s('slow-breath', 'deep-sleep', 0.6),
  s('warm-dim', 'deep-sleep', 0.4),
  s('voice-fades', 'deep-sleep', 0.5),
  r('body-scan', 'deep-sleep', RUSCH),
  s('body-scan', 'settled-body', 0.6),
  r('low-tones', 'deep-sleep', JESPERSEN),
  s('low-tones', 'settled-body', 0.5),
  s('more-silence', 'clear-mind', 0.5),
  s('gentle-noting', 'clear-mind', 0.6),
  s('no-melody', 'focus', 0.5),
  s('gentle-noting', 'focus', 0.4),
  r('longer-exhale', 'calm', ZACCARO),
  r('longer-exhale', 'lighter-mood', BALBAN),
  s('steady-pulse', 'calm', 0.5),
  s('fewer-words', 'calm', 0.4),
  s('longer-exhale', 'repair', 0.4),
  r('kind-words', 'connected', ZENG),
  s('kind-words', 'repair', 0.4),
  s('warm-light', 'lighter-mood', 0.4),
  s('gratitude', 'lighter-mood', 0.4),
  s('gratitude', 'purpose', 0.4),
]

export const node = (id: string) => NODES.find((n) => n.id === id)
export const linkKey = (l: HealingLink) => `${l.from}>${l.to}`

/** A link belongs to the worlds of the states at its ends. */
export function linkWorlds(l: HealingLink): Set<WorldId> {
  return new Set([node(l.from)?.world, node(l.to)?.world].filter((w): w is WorldId => !!w))
}

export interface MapFilter {
  world: WorldId | 'all'
  researchOnly: boolean
}

export function visibleLinks(f: MapFilter): HealingLink[] {
  return LINKS.filter((l) => (!f.researchOnly || l.provenance === 'research') && (f.world === 'all' || linkWorlds(l).has(f.world)))
}

/** Every path through a node: its own links plus the links one step further along the same direction. */
export function pathsThrough(id: string, links: HealingLink[]): HealingLink[] {
  const direct = links.filter((l) => l.from === id || l.to === id)
  const n = node(id)
  if (!n || n.ring === 'block') return direct
  const blocks = new Set(direct.map((l) => (l.from === id ? l.to : l.from)))
  const onward = links.filter((l) => (n.ring === 'bad' ? blocks.has(l.from) : blocks.has(l.to)))
  return [...direct, ...onward]
}

export function countsBy<K extends string>(items: { key: K }[]): Record<K, number> {
  const out = {} as Record<K, number>
  for (const { key } of items) out[key] = (out[key] ?? 0) + 1
  return out
}

export const nodeCounts = () => countsBy(NODES.map((n) => ({ key: n.ring })))
export const linkCounts = () => countsBy<Provenance>(LINKS.map((l) => ({ key: l.provenance })))

/** Words for a link's strength, never a number that looks like evidence. */
export function strengthText(l: HealingLink): string {
  if (l.provenance === 'research') return 'Cited in a published review (not a score)'
  if (l.provenance === 'learned') return `Learned from ${l.people ?? 0} people`
  const v = l.strength ?? 0
  return `${v >= 0.6 ? 'Strong' : v >= 0.45 ? 'Medium' : 'Light'} (sample ${v.toFixed(1)})`
}
