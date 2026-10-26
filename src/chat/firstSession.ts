import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import type { Recommendation } from '../components/chat/RecommendationCard'
import { COVER_PHOTOS, unsplash } from '../lib/photos'
import type { Onboarding } from '../lib/onboarding'

// The first session, built from what the person said (design v4, U050).
//
// J039's simulation found the first build ignored the goal: every person got
// "Increase yellow — helps bring joy", "Less movement" and "432Hz", including
// someone who asked to sleep and someone who said "no spiritual stuff". A
// deck per goal is still mock (nothing is generated), but it no longer
// contradicts what was asked a minute earlier. Pure data, so it is tested.

const orb = (key: keyof typeof COVER_PHOTOS) => unsplash(COVER_PHOTOS[key], 160, 160)

type Change = Recommendation & {
  /** Dropped when the person chose no voice. */
  voice?: boolean
  /** Dropped when they asked for mostly silence. */
  sound?: boolean
}

// Titles stay within 13 characters: the folded deck's text column is 103px
// and clamps to one line, so a longer one renders as "Slow body…".
const DECKS: Record<string, Change[]> = {
  sleep: [
    { id: 'sleep-exhale', title: 'Slow breath', description: 'Breath cues slow down toward a long exhale, the pace your body falls asleep at', orb: orbLessMovement, preview: 'night-rain-sleep' },
    { id: 'sleep-dim', title: 'Warm, dim', description: 'The picture darkens and warms as it goes, nothing bright to wake you', orb: orb('sleep'), preview: 'dream-drift' },
    { id: 'sleep-fade', title: 'Voice fades', description: 'The voice stops for the last minutes, so the session ends where you drift off', orb: orb('calm'), preview: 'night-rain-sleep', voice: true },
  ],
  calm: [
    { id: 'calm-exhale', title: 'Longer exhale', description: 'Out-breath longer than the in-breath, the quickest way to settle stress', orb: orbLessMovement, preview: 'ocean-breath' },
    { id: 'calm-pulse', title: 'Steady pulse', description: 'A slow, even rhythm with nothing sudden in it', orb: orb('water'), preview: 'dolphins-frequency', sound: true },
    { id: 'calm-words', title: 'Fewer words', description: 'Short, plain guidance with room between the lines', orb: orb('calm'), preview: 'deep-grounding', voice: true },
  ],
  clarity: [
    { id: 'clarity-space', title: 'More silence', description: 'Long quiet stretches, so thoughts can settle instead of being talked over', orb: orb('mountains'), preview: 'noting-practice' },
    { id: 'clarity-bed', title: 'One tone', description: 'A single steady sound bed, nothing to follow', orb: orb('stones'), preview: 'clear-skies', sound: true },
    { id: 'clarity-noting', title: 'Gentle noting', description: 'Name a thought, let it go, come back to the breath', orb: orbLessMovement, preview: 'noting-practice', voice: true },
  ],
  focus: [
    { id: 'focus-bed', title: 'No melody', description: 'An even, melody-free bed, so the sound never pulls your attention', orb: orb('stones'), preview: 'clear-skies', sound: true },
    { id: 'focus-quiet', title: 'Brief voice', description: 'One short cue to begin, then silence until the end cue', orb: orb('mountains'), preview: 'clear-skies', voice: true },
    { id: 'focus-cues', title: 'Clear edges', description: 'A soft chime at both ends, so the block has edges', orb: orbIncreaseYellow, preview: 'clear-skies' },
  ],
  regulate: [
    { id: 'regulate-scan', title: 'Body scan', description: 'Attention moves through the body, head to feet', orb: orb('underwater'), preview: 'deep-grounding', voice: true },
    { id: 'regulate-low', title: 'Low tones', description: 'Deep, slow sound that the body can rest against', orb: orb('stones'), preview: 'deep-grounding', sound: true },
    { id: 'regulate-exhale', title: 'Longer exhale', description: 'Out-breath longer than the in-breath, to settle a wired system', orb: orbLessMovement, preview: 'ocean-breath' },
  ],
  energy: [
    { id: 'energy-bright', title: 'Warm light', description: 'Warm, rising light through the session', orb: orbIncreaseYellow, preview: 'morning-spark' },
    { id: 'energy-breath', title: 'Lively breath', description: 'A quicker, fuller breath rhythm to lift a flat day', orb: orb('morning'), preview: 'morning-spark' },
    { id: 'energy-close', title: 'Upbeat close', description: 'Ends on something that moves, not on stillness', orb: orb('glow'), preview: 'morning-spark', sound: true },
  ],
}

/** What a typed "no …" rules out: anything that leans on frequencies or colour magic. */
const NO_SPIRITUAL = /\bno\s+(spiritual|woo|frequenc|hz|mystic|chakra)/i

/**
 * The first session's proposals, for this person's goal and choices. Never
 * empty: a goal it does not know gets the calm deck, the gentlest default.
 */
export function deckFor(answers: Pick<Onboarding, 'goal' | 'voice' | 'sounds'>, words = ''): Recommendation[] {
  const base = DECKS[answers.goal ?? ''] ?? DECKS.calm
  const silent = answers.sounds.length === 1 && answers.sounds[0] === 'silence'
  const kept = base.filter((c) => !(c.voice && answers.voice === 'none') && !(c.sound && silent))
  // The decks hold no frequency or colour-therapy claims already; the check is
  // here so a future deck that adds one cannot slip it past a "no".
  const allowed = NO_SPIRITUAL.test(words) ? kept.filter((c) => !/hz|frequenc/i.test(c.title)) : kept
  const deck = allowed.length ? allowed : base.slice(0, 1)
  return deck.map((c) => ({ id: c.id, title: c.title, description: c.description, orb: c.orb, preview: c.preview }))
}

/**
 * The chips under the composer, chosen so none undoes a choice the person just
 * made: no "Make it longer" for someone who picked 20 minutes, no "Female
 * voice" for someone who already has one. Each is phrased to reach a reply
 * rule in lib/replies.ts.
 */
export function suggestionsFor(answers: Pick<Onboarding, 'length' | 'voice' | 'sounds'>): string[] {
  const length = answers.length >= 20 ? 'Make it shorter' : 'Make it longer'
  const voice = answers.voice === 'female' ? 'Male voice' : answers.voice === 'male' ? 'Female voice' : 'No voice at all'
  const sound = answers.sounds.includes('silence') ? 'Make it quieter' : answers.sounds.includes('nature') ? 'Add rain sounds' : 'Add ocean waves'
  return [length, voice, sound]
}

const GOAL_WORDS: [string, RegExp][] = [
  ['sleep', /\b(sleep|asleep|insomnia|bed ?time|awake at night|night)/i],
  ['regulate', /\b(nervous system|regulat|burn ?out|burnt out|body|wired|panic)/i],
  ['focus', /\b(focus|concentrat|study|exam|distract|deadline)/i],
  ['energy', /\b(energy|tired|exhausted|drained|flat|sluggish)/i],
  ['calm', /\b(anxious|anxiety|stress|calm|tense|overwhelm|worried)/i],
  ['clarity', /\b(racing|overthink|clear my (mind|head)|noise in my head|clarity)/i],
]

const FEELING_WORDS: [string, RegExp][] = [
  ['sleep', /\b(can['’]?t sleep|fall asleep|insomnia|hard to sleep|sleep (badly|poorly|well))/i],
  ['stressed', /\bstress/i],
  ['anxious', /\banxi/i],
  ['racing', /\b(racing|overthink|keeps? spinning)/i],
  ['focus', /\b(can['’]?t focus|distract|concentrat)/i],
  ['energy', /\b(no energy|tired|exhausted|low energy)/i],
  ['low', /\b(feel(ing)? low|sad|down|drained)/i],
]

/**
 * A goal and feelings read off what someone typed on Home, so onboarding can
 * open already answered instead of asking again (J039 F5). Only a starting
 * point — every answer stays editable on the summary.
 */
export function inferFromWords(text: string): { goal: string | null; feelings: string[] } {
  const goal = GOAL_WORDS.find(([, test]) => test.test(text))?.[0] ?? null
  const feelings = FEELING_WORDS.filter(([, test]) => test.test(text)).map(([id]) => id).slice(0, 3)
  return { goal, feelings }
}
