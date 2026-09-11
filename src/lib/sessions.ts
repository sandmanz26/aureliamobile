// The session catalogue.
//
// Home, Session detail and Recreate all read from here, so a card, its detail
// page and the fork it produces can never drift apart. A real build swaps this
// for the `sessions` table in the PRD's backend plan — the shape is deliberately
// close to it (slug, author, layers, chapters, lineage).

import type { CoverKey } from './photos'

export interface SoundLayer {
  id: string
  name: string
  detail: string
  /** 0–100, how present the layer is in the mix. */
  level: number
}

export interface Chapter {
  label: string
  minutes: number
  detail: string
}

export interface SessionRecord {
  slug: string
  title: string
  photo: CoverKey
  gradient: string
  /** One line, as it reads on the community card. */
  description: string
  /** The longer pitch on the detail page. */
  summary: string
  author: string
  /** Creator portrait, so a card can credit by face as well as name. */
  authorPhoto: CoverKey
  authorRole: string
  plays: string
  recreated: string
  minutes: number
  category: Category
  /** What the session is meant to shift, in the creator's words. */
  intent: string
  outcome: { label: string; value: string; note: string }[]
  layers: SoundLayer[]
  chapters: Chapter[]
  personalization: { label: string; value: string }[]
  /** The changes other people most often make when they recreate it. */
  commonChanges: { change: string; share: string }[]
  /** Where this session came from, oldest first. */
  lineage: { title: string; author: string; note: string }[]
  safety: string[]
  /** Which shelves on the signed-in home this session appears on. */
  shelves: Shelf[]
}

/**
 * The signed-in home is a set of shelves, and a session can sit on more than
 * one. Keeping the membership on the session (rather than four hand-written
 * lists on the page) means a session added here shows up wherever it belongs.
 */
export type Shelf = 'community' | 'picked' | 'impact'

/**
 * The chip row above the community shelf. Closed rather than free text, so a
 * typo in a session's category can't quietly create a chip nothing matches.
 */
export type Category = 'Meditations' | 'Music' | 'Energy' | 'Sleep' | 'Calm'

/**
 * Chips in the order the design shows them. `libraryCount` is the size of the
 * whole catalogue behind a chip — the sessions below are a sample of it, not
 * all of it, which is why the counts don't match the card count.
 */
export const CATEGORIES: { name: Category; libraryCount: string }[] = [
  { name: 'Meditations', libraryCount: '12.5k' },
  { name: 'Music', libraryCount: '8.3k' },
  { name: 'Energy', libraryCount: '3.1k' },
  { name: 'Sleep', libraryCount: '13.4k' },
  { name: 'Calm', libraryCount: '22.3k' },
]

/** What a chip reads as: "All", or "Music (8.3k)". */
export type CategoryFilter = Category | 'All'

export function categoryLabel(filter: CategoryFilter) {
  const category = CATEGORIES.find((entry) => entry.name === filter)
  return category ? `${category.name} (${category.libraryCount})` : 'All'
}

export const CATEGORY_FILTERS: CategoryFilter[] = ['All', ...CATEGORIES.map((entry) => entry.name)]

export const SESSIONS: SessionRecord[] = [
  {
    slug: 'dolphins-frequency',
    title: 'Dolphins frequency',
    photo: 'dolphins',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-400))',
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    summary:
      'A slow descent built around cetacean song pitched down two octaves, laid over a tide that breathes at six cycles a minute. Written for the hour after work, when the body is still braced for something that is no longer coming.',
    author: 'Adam Nilson',
    authorPhoto: 'avatar',    authorRole: 'Community creator · 34 published sessions',
    plays: '124k',
    recreated: '9.8k',
    minutes: 22,
    category: 'Calm',
    intent: 'Bring the nervous system down from a working-day baseline without putting the listener to sleep.',
    outcome: [
      { label: 'Stress', value: '−43%', note: 'self-reported, first week' },
      { label: 'Resting HR', value: '−6 bpm', note: 'median across 4.1k listeners' },
      { label: 'Finished it', value: '81%', note: 'played to the last chapter' },
    ],
    layers: [
      { id: 'song', name: 'Cetacean song', detail: 'Field recording, pitched −24 st', level: 72 },
      { id: 'tide', name: 'Tide bed', detail: 'Breathes at 6 cycles / minute', level: 58 },
      { id: 'drone', name: 'Sub drone', detail: '52 Hz, barely audible', level: 34 },
      { id: 'voice', name: 'Guidance', detail: 'Female, sparse — 9 cues total', level: 45 },
    ],
    chapters: [
      { label: 'Arrival', minutes: 3, detail: 'Tide only. Nothing asked of the listener yet.' },
      { label: 'Descent', minutes: 7, detail: 'Song enters far off and moves closer; breath cues begin.' },
      { label: 'Deep water', minutes: 9, detail: 'No guidance. The mix holds steady and wide.' },
      { label: 'Surface', minutes: 3, detail: 'Layers thin out one at a time; ends on the tide alone.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Sleep score, resting heart rate' },
      { label: 'Voice', value: 'Female · unhurried' },
      { label: 'Ends', value: 'Fade to silence, no chime' },
      { label: 'Best time', value: 'Late afternoon / early evening' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '38%' },
      { change: 'Removed the guidance', share: '24%' },
      { change: 'Raised the tide level', share: '16%' },
      { change: 'Swapped to a male voice', share: '9%' },
    ],
    lineage: [
      { title: 'Ocean floor', author: 'Aurelia', note: 'Starter template' },
      { title: 'Deep blue, slower', author: 'Marcus Lee', note: 'Halved the tempo' },
      { title: 'Dolphins frequency', author: 'Adam Nilson', note: 'Added cetacean song and the breath cues' },
    ],
    safety: [
      'Not a treatment for any medical condition, and not a substitute for care.',
      'Do not listen while driving or operating machinery — the descent is designed to lower alertness.',
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
    ],
    shelves: ['community'],
  },
  {
    slug: 'raise-your-vibration',
    title: 'Raise your Vibration',
    photo: 'vibration',
    gradient: 'linear-gradient(160deg, var(--color-warning-300), var(--color-danger-200))',
    description: 'This helped Sara improve her mood within few minutes.',
    summary:
      'A short, bright session that climbs rather than settles. Warm pads and a rising affirmation cadence, built for the flat stretch of a morning when nothing is wrong and nothing is moving either.',
    author: 'Sara Trezeguat',
    authorPhoto: 'creatorSophia',    authorRole: 'Community creator · 12 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 9,
    category: 'Energy',
    intent: 'Lift a flat mood quickly, without the jolt of stimulants or a workout.',
    outcome: [
      { label: 'Mood', value: '+31%', note: 'immediately after, self-reported' },
      { label: 'Held for', value: '3.4 h', note: 'median before returning to baseline' },
      { label: 'Repeat rate', value: '64%', note: 'played again within a week' },
    ],
    layers: [
      { id: 'pads', name: 'Warm pads', detail: 'Rising major thirds', level: 66 },
      { id: 'affirm', name: 'Affirmations', detail: '11 lines, present tense', level: 70 },
      { id: 'pulse', name: 'Soft pulse', detail: '72 bpm, matches a calm heartbeat', level: 41 },
    ],
    chapters: [
      { label: 'Open', minutes: 2, detail: 'Pads only, brightening.' },
      { label: 'Name it', minutes: 3, detail: 'Affirmations begin, one per 20 seconds.' },
      { label: 'Carry it', minutes: 4, detail: 'Pulse joins; the cadence quickens slightly.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Mood check-in, time of day' },
      { label: 'Voice', value: 'Female · warm' },
      { label: 'Ends', value: 'Single chime' },
      { label: 'Best time', value: 'Morning' },
    ],
    commonChanges: [
      { change: 'Rewrote the affirmations', share: '41%' },
      { change: 'Dropped the pulse', share: '19%' },
      { change: 'Made it shorter', share: '14%' },
    ],
    lineage: [
      { title: 'Bright open', author: 'Aurelia', note: 'Starter template' },
      { title: 'Raise your Vibration', author: 'Sara Trezeguat', note: 'Wrote the affirmation set' },
    ],
    safety: [
      'Affirmation content is user-written and reviewed by moderation before publishing.',
      'Not a treatment for depression or any medical condition.',
    ],
    shelves: ['community'],
  },
  {
    slug: 'mind-dance',
    title: 'Mind Dance',
    photo: 'mindDance',
    gradient: 'linear-gradient(160deg, var(--color-primary-700), var(--color-primary-300))',
    description: 'This helped Lily reduce stress by 43% in less that a week.',
    summary:
      'Movement without moving. A shifting rhythmic bed that keeps attention busy enough to stop it circling, for the kind of stress that will not sit still long enough to be meditated away.',
    author: 'Lily Ahmad',
    authorPhoto: 'creatorLily',    authorRole: 'Community creator · 7 published sessions',
    plays: '7.2k',
    recreated: '2.1k',
    minutes: 15,
    category: 'Meditations',
    intent: 'Give restless, looping thought something to follow instead of asking it to stop.',
    outcome: [
      { label: 'Stress', value: '−43%', note: 'self-reported, first week' },
      { label: 'Rumination', value: '−28%', note: 'evening check-in score' },
      { label: 'Finished it', value: '73%', note: 'played to the last chapter' },
    ],
    layers: [
      { id: 'rhythm', name: 'Shifting rhythm', detail: 'Pattern changes every 90 s', level: 64 },
      { id: 'keys', name: 'Muted keys', detail: 'Sparse, off the beat', level: 48 },
      { id: 'air', name: 'Room air', detail: 'Keeps it from sounding synthetic', level: 30 },
    ],
    chapters: [
      { label: 'Catch the pattern', minutes: 4, detail: 'A single figure, repeated until it is easy to follow.' },
      { label: 'Let it shift', minutes: 7, detail: 'The pattern changes without warning; attention follows.' },
      { label: 'Let it go', minutes: 4, detail: 'Rhythm dissolves into the room tone.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Stress check-in, session history' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Any time you cannot settle' },
    ],
    commonChanges: [
      { change: 'Added a guiding voice', share: '33%' },
      { change: 'Slowed the rhythm', share: '27%' },
      { change: 'Made it longer', share: '21%' },
    ],
    lineage: [
      { title: 'Pattern study', author: 'Aurelia', note: 'Starter template' },
      { title: 'Mind Dance', author: 'Lily Ahmad', note: 'Wrote the shifting pattern set' },
    ],
    safety: [
      'Contains rhythmic content — if you have photosensitive or audiogenic epilepsy, check with a clinician first.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community'],
  },
  {
    slug: 'cosmic-flow',
    title: 'Cosmic Flow',
    photo: 'cosmic',
    gradient: 'linear-gradient(160deg, var(--color-primary-950), var(--color-info-700))',
    description: 'This helped Daniel release tension and reset their mind in just 10 minutes.',
    summary:
      'Ten minutes of very slow harmonic drift, with no beat to hold onto and nothing to follow. Written for the gap between two things you did not want to do — short enough to fit, long enough to change the register you are in.',
    author: 'Emma Carter',
    authorPhoto: 'creatorAria',    authorRole: 'Community creator · 21 published sessions',
    plays: '41.3k',
    recreated: '3.4k',
    minutes: 10,
    category: 'Calm',
    intent: 'Break a tense stretch in the middle of a day, without needing somewhere quiet to lie down.',
    outcome: [
      { label: 'Tension', value: '−37%', note: 'self-reported, straight after' },
      { label: 'Fits in', value: '10 min', note: 'median gap it is played in' },
      { label: 'Finished it', value: '88%', note: 'played to the end' },
    ],
    layers: [
      { id: 'drift', name: 'Harmonic drift', detail: 'Two detuned pads, no tempo', level: 70 },
      { id: 'shimmer', name: 'Shimmer', detail: 'Bowed metal, high and thin', level: 42 },
      { id: 'floor', name: 'Sub floor', detail: '48 Hz, felt more than heard', level: 30 },
    ],
    chapters: [
      { label: 'Widen', minutes: 3, detail: 'The pads separate and the room opens out.' },
      { label: 'Drift', minutes: 5, detail: 'No change is announced; everything moves slowly.' },
      { label: 'Return', minutes: 2, detail: 'The shimmer drops away and the floor fades last.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Stress check-in, time of day' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Between two things' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '44%' },
      { change: 'Added a guiding voice', share: '22%' },
      { change: 'Raised the sub floor', share: '13%' },
    ],
    lineage: [
      { title: 'Drift study', author: 'Aurelia', note: 'Starter template' },
      { title: 'Cosmic Flow', author: 'Emma Carter', note: 'Detuned the pads and cut it to ten minutes' },
    ],
    safety: [
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['picked'],
  },
  {
    slug: '528-hz-reset',
    title: '528 Hz Reset',
    photo: 'water',
    gradient: 'linear-gradient(160deg, var(--color-neutral-600), var(--color-warning-200))',
    description: 'This helped Sofia quiet her mind by 84% in one session.',
    summary:
      'A single tone, held and re-struck, with everything else kept out of the way. The claim attached to 528 Hz is folklore; what is measurable is that a steady pitch with nothing competing gives attention one place to sit.',
    author: 'Sofia Martinez',
    authorPhoto: 'creatorAmara',    authorRole: 'Community creator · 9 published sessions',
    plays: '62.8k',
    recreated: '1.1k',
    minutes: 12,
    category: 'Music',
    intent: 'Give a loud head one steady thing to rest on.',
    outcome: [
      { label: 'Mental noise', value: '−84%', note: 'self-reported, one session' },
      { label: 'Repeat rate', value: '58%', note: 'played again within a week' },
      { label: 'Finished it', value: '76%', note: 'played to the end' },
    ],
    layers: [
      { id: 'tone', name: 'Sustained tone', detail: '528 Hz, re-struck every 40 s', level: 78 },
      { id: 'bowl', name: 'Bowl resonance', detail: 'Recorded, not synthesised', level: 52 },
      { id: 'room', name: 'Room tail', detail: 'Long reverb, no early reflections', level: 36 },
    ],
    chapters: [
      { label: 'Strike', minutes: 2, detail: 'The tone arrives alone and is allowed to decay fully.' },
      { label: 'Hold', minutes: 8, detail: 'Re-struck as it fades; nothing else is added.' },
      { label: 'Let it go', minutes: 2, detail: 'The last strike is left to decay into the room.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Nothing — fixed by design' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Natural decay' },
      { label: 'Best time', value: 'When you cannot think straight' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '52%' },
      { change: 'Changed the frequency', share: '29%' },
      { change: 'Added a guiding voice', share: '11%' },
    ],
    lineage: [
      { title: 'Single tone', author: 'Aurelia', note: 'Starter template' },
      { title: '528 Hz Reset', author: 'Sofia Martinez', note: 'Swapped the synth tone for a recorded bowl' },
    ],
    safety: [
      'Specific frequencies are not proven to have specific healing effects. This session is presented as music, not medicine.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked'],
  },
  {
    slug: 'deep-grounding',
    title: 'Deep Grounding',
    photo: 'forest',
    gradient: 'linear-gradient(160deg, var(--color-success-900), var(--color-success-500))',
    description: 'This helped Daniel sleep better, with 76% deeper rest at night.',
    summary:
      'A long, low session that stays close to the ground — earth-toned texture, a very slow breath cue, and no melody at all. Built to be played lying down, at the point in the evening where the day has not finished letting go.',
    author: 'Daniel Brooks',
    authorPhoto: 'creatorDaniel',    authorRole: 'Community creator · 41 published sessions',
    plays: '88.1k',
    recreated: '6.2k',
    minutes: 28,
    category: 'Sleep',
    intent: 'Take a body that is lying down but still switched on the rest of the way down.',
    outcome: [
      { label: 'Deep rest', value: '+76%', note: 'wearable-reported, first two weeks' },
      { label: 'Time to sleep', value: '−11 min', note: 'median across 6.2k listeners' },
      { label: 'Finished it', value: '42%', note: 'most listeners fall asleep first' },
    ],
    layers: [
      { id: 'earth', name: 'Earth texture', detail: 'Low granular bed, no pitch centre', level: 68 },
      { id: 'breath', name: 'Breath cue', detail: '4 cycles / minute, unspoken', level: 40 },
      { id: 'rain', name: 'Distant rain', detail: 'Far off, never overhead', level: 33 },
    ],
    chapters: [
      { label: 'Settle', minutes: 6, detail: 'Texture only; the breath cue has not started.' },
      { label: 'Slow down', minutes: 10, detail: 'The cue enters and gradually lengthens.' },
      { label: 'Ground', minutes: 8, detail: 'Everything thins except the low bed.' },
      { label: 'Leave', minutes: 4, detail: 'Fades far below speaking volume and stops.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Sleep score, bedtime' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence, no chime' },
      { label: 'Best time', value: 'In bed, lights out' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '48%' },
      { change: 'Dropped the rain', share: '23%' },
      { change: 'Added a guiding voice', share: '12%' },
    ],
    lineage: [
      { title: 'Low bed', author: 'Aurelia', note: 'Starter template' },
      { title: 'Ground floor', author: 'Adam Nilson', note: 'Added the unspoken breath cue' },
      { title: 'Deep Grounding', author: 'Daniel Brooks', note: 'Extended it and pushed the rain further away' },
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Sleep figures come from listeners’ own wearables and are not a clinical measurement.',
      'Not a treatment for insomnia or any medical condition.',
    ],
    shelves: ['community', 'impact'],
  },
  {
    slug: 'inner-frequency',
    title: 'Inner Frequency',
    photo: 'glow',
    gradient: 'linear-gradient(160deg, var(--color-danger-600), var(--color-warning-400))',
    description: 'This helped Noah start his day with 91% feeling calmer within one session.',
    summary:
      'A morning session that does not try to wake you up quickly. Warm low strings under a slowly rising tone, ending on the note the day is meant to start on.',
    author: 'Noah Williams',
    authorPhoto: 'creatorNoah',    authorRole: 'Community creator · 16 published sessions',
    plays: '23.7k',
    recreated: '2.8k',
    minutes: 14,
    category: 'Energy',
    intent: 'Start the day settled rather than startled.',
    outcome: [
      { label: 'Felt calmer', value: '91%', note: 'self-reported, one session' },
      { label: 'Morning mood', value: '+26%', note: 'first-hour check-in' },
      { label: 'Repeat rate', value: '71%', note: 'played again within a week' },
    ],
    layers: [
      { id: 'strings', name: 'Low strings', detail: 'Bowed, held, never resolving', level: 65 },
      { id: 'rise', name: 'Rising tone', detail: 'Climbs a fifth across the session', level: 55 },
      { id: 'birds', name: 'Distant birds', detail: 'Field recording, dawn', level: 28 },
    ],
    chapters: [
      { label: 'Before', minutes: 4, detail: 'Strings only, still and low.' },
      { label: 'First light', minutes: 6, detail: 'The rising tone enters underneath the birds.' },
      { label: 'Up', minutes: 4, detail: 'The rise completes and the strings step aside.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Wake time, sleep score' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Single low chime' },
      { label: 'Best time', value: 'First thing' },
    ],
    commonChanges: [
      { change: 'Added affirmations', share: '35%' },
      { change: 'Made it shorter', share: '25%' },
      { change: 'Dropped the birds', share: '18%' },
    ],
    lineage: [
      { title: 'Bright open', author: 'Aurelia', note: 'Starter template' },
      { title: 'Inner Frequency', author: 'Noah Williams', note: 'Replaced the pads with bowed strings' },
    ],
    safety: [
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'impact'],
  },
  {
    slug: 'ocean-breath',
    title: 'Ocean Breath',
    photo: 'waves',
    gradient: 'linear-gradient(160deg, var(--color-info-950), var(--color-info-600))',
    description: 'This helped Maya feel calmer and more grounded within minutes.',
    summary:
      'Breath paced to a swell rather than a metronome — the inhale rises with the water and the exhale goes out with it. Six cycles a minute, which is roughly where the nervous system settles on its own.',
    author: 'Maya Chen',
    authorPhoto: 'creatorMaya',    authorRole: 'Community creator · 18 published sessions',
    plays: '15.4k',
    recreated: '4.9k',
    minutes: 11,
    category: 'Calm',
    intent: 'Slow the breath without making the listener count anything.',
    outcome: [
      { label: 'Felt calmer', value: '+52%', note: 'self-reported, straight after' },
      { label: 'Breath rate', value: '−4 /min', note: 'median across 2.8k listeners' },
      { label: 'Finished it', value: '86%', note: 'played to the end' },
    ],
    layers: [
      { id: 'swell', name: 'Ocean swell', detail: 'Field recording, 6 cycles / minute', level: 74 },
      { id: 'pad', name: 'Low pad', detail: 'Follows the swell, never leads it', level: 46 },
      { id: 'voice', name: 'Guidance', detail: 'Female, 6 cues total', level: 38 },
    ],
    chapters: [
      { label: 'Find it', minutes: 3, detail: 'The swell alone, until its rhythm is obvious.' },
      { label: 'Follow it', minutes: 5, detail: 'Breath cues land on the rise and the fall.' },
      { label: 'Keep it', minutes: 3, detail: 'Cues stop; the swell carries the pace.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Resting heart rate, stress check-in' },
      { label: 'Voice', value: 'Female · unhurried' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Any time you are holding your breath' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '40%' },
      { change: 'Removed the guidance', share: '31%' },
      { change: 'Slowed the pace', share: '17%' },
    ],
    lineage: [
      { title: 'Tide bed', author: 'Aurelia', note: 'Starter template' },
      { title: 'Ocean Breath', author: 'Maya Chen', note: 'Timed the breath cues to the swell' },
    ],
    safety: [
      'Paced breathing can cause light-headedness — stop if you feel dizzy.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked'],
  },
  {
    slug: 'rainy-mind',
    title: 'Rainy Mind',
    photo: 'rain',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-warning-400))',
    description: 'This helped Chloe reduce racing thoughts by 62% in 20 minutes.',
    summary:
      'Rain against a window, recorded from inside, with the room left in. For the kind of racing thought that needs something to happen nearby rather than silence to fill.',
    author: 'Chloe Anderson',
    authorPhoto: 'creatorChloe',    authorRole: 'Community creator · 24 published sessions',
    plays: '96.5k',
    recreated: '780',
    minutes: 20,
    category: 'Calm',
    intent: 'Give a racing mind company instead of an empty room.',
    outcome: [
      { label: 'Racing thoughts', value: '−62%', note: 'self-reported, 20 minutes' },
      { label: 'Repeat rate', value: '69%', note: 'played again within a week' },
      { label: 'Finished it', value: '64%', note: 'played to the end' },
    ],
    layers: [
      { id: 'rain', name: 'Rain on glass', detail: 'Recorded from inside, room included', level: 76 },
      { id: 'traffic', name: 'Distant traffic', detail: 'Far off, occasional', level: 32 },
      { id: 'hum', name: 'Room hum', detail: 'Keeps it from sounding like a loop', level: 28 },
    ],
    chapters: [
      { label: 'Inside', minutes: 5, detail: 'Rain arrives and steadies.' },
      { label: 'Stay', minutes: 11, detail: 'Nothing changes on purpose.' },
      { label: 'Easing', minutes: 4, detail: 'The rain thins out and stops.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Time of day, session history' },
      { label: 'Voice', value: 'None — ambient' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Working, or trying to' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '55%' },
      { change: 'Dropped the traffic', share: '20%' },
      { change: 'Added a guiding voice', share: '10%' },
    ],
    lineage: [
      { title: 'Room tone', author: 'Aurelia', note: 'Starter template' },
      { title: 'Rainy Mind', author: 'Chloe Anderson', note: 'Recorded the rain from indoors' },
    ],
    safety: [
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
      'Not a treatment for anxiety or any medical condition.',
    ],
    shelves: ['community', 'picked'],
  },
  {
    slug: 'inner-balance',
    title: 'Inner Balance',
    photo: 'stones',
    gradient: 'linear-gradient(160deg, var(--color-neutral-500), var(--color-neutral-200))',
    description: 'This helped Daniel feel 47% more grounded after a stressful week.',
    summary:
      'A session with a centre of gravity: one low tone that never moves, and everything else arranged around it. Written for the end of a week that got away from you.',
    author: 'Daniel Kim',
    authorPhoto: 'creatorEthan',    authorRole: 'Community creator · 31 published sessions',
    plays: '11.2k',
    recreated: '1.9k',
    minutes: 18,
    category: 'Meditations',
    intent: 'Give a scattered week one fixed point to reorganise around.',
    outcome: [
      { label: 'Felt grounded', value: '+47%', note: 'self-reported, after one week' },
      { label: 'Weekly use', value: '3.1×', note: 'median sessions per week' },
      { label: 'Finished it', value: '79%', note: 'played to the end' },
    ],
    layers: [
      { id: 'centre', name: 'Centre tone', detail: '110 Hz, held throughout', level: 70 },
      { id: 'stones', name: 'Struck stone', detail: 'Sparse, irregular', level: 44 },
      { id: 'air', name: 'Open air', detail: 'Wide, no reflections', level: 30 },
    ],
    chapters: [
      { label: 'Set it down', minutes: 5, detail: 'The centre tone enters and stays.' },
      { label: 'Around it', minutes: 9, detail: 'Stone strikes come and go; the tone does not move.' },
      { label: 'Stand up', minutes: 4, detail: 'Everything else clears, the tone last.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Stress check-in, day of week' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'End of the week' },
    ],
    commonChanges: [
      { change: 'Added a guiding voice', share: '36%' },
      { change: 'Made it longer', share: '24%' },
      { change: 'Dropped the stone strikes', share: '15%' },
    ],
    lineage: [
      { title: 'Single tone', author: 'Aurelia', note: 'Starter template' },
      { title: 'Inner Balance', author: 'Daniel Kim', note: 'Built the stone layer around the centre' },
    ],
    safety: [
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked', 'impact'],
  },
  {
    slug: 'golden-hour',
    title: 'Golden Hour',
    photo: 'glow',
    gradient: 'linear-gradient(160deg, var(--color-warning-700), var(--color-warning-300))',
    description: 'This helped Nina release 54% more tension in one session.',
    summary:
      'Warm, slow and short, built for the hour when the light goes orange and the day is technically still going. A body scan without the instruction to scan anything.',
    author: 'Nina Harper',
    authorPhoto: 'creatorNina',    authorRole: 'Community creator · 14 published sessions',
    plays: '34.6k',
    recreated: '5.1k',
    minutes: 13,
    category: 'Calm',
    intent: 'Let the body put the day down before the evening starts.',
    outcome: [
      { label: 'Tension', value: '−54%', note: 'self-reported, one session' },
      { label: 'Held for', value: '2.7 h', note: 'median before returning to baseline' },
      { label: 'Finished it', value: '83%', note: 'played to the end' },
    ],
    layers: [
      { id: 'warm', name: 'Warm bed', detail: 'Tape-saturated pad', level: 68 },
      { id: 'voice', name: 'Guidance', detail: 'Female, low, 12 cues', level: 52 },
      { id: 'room', name: 'Late room', detail: 'Evening air, very quiet', level: 26 },
    ],
    chapters: [
      { label: 'Arrive', minutes: 3, detail: 'Pad only, brightening slowly.' },
      { label: 'Let down', minutes: 7, detail: 'Cues move from shoulders to jaw to hands.' },
      { label: 'Stay warm', minutes: 3, detail: 'No more cues; the pad holds.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Time of day, tension check-in' },
      { label: 'Voice', value: 'Female · low' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Late afternoon' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '33%' },
      { change: 'Swapped to a male voice', share: '21%' },
      { change: 'Removed the guidance', share: '16%' },
    ],
    lineage: [
      { title: 'Warm bed', author: 'Aurelia', note: 'Starter template' },
      { title: 'Golden Hour', author: 'Nina Harper', note: 'Wrote the release cue set' },
    ],
    safety: ['Not a treatment for any medical condition.'],
    shelves: ['community', 'picked'],
  },
  {
    slug: 'quiet-space',
    title: 'Quiet Space',
    photo: 'meadow',
    gradient: 'linear-gradient(160deg, var(--color-success-800), var(--color-success-400))',
    description: 'This helped Lucas quiet his thoughts by 71% before bed.',
    summary:
      'A field at dusk with almost nothing in it — a little wind, one bird a long way off, and a lot of space. The quietest session in the catalogue, and deliberately so.',
    author: 'Lucas Martin',
    authorPhoto: 'creatorLucas',    authorRole: 'Community creator · 26 published sessions',
    plays: '57.9k',
    recreated: '640',
    minutes: 24,
    category: 'Sleep',
    intent: 'Empty the last half hour of the day out.',
    outcome: [
      { label: 'Mental noise', value: '−71%', note: 'self-reported, before bed' },
      { label: 'Time to sleep', value: '−9 min', note: 'median across 3.4k listeners' },
      { label: 'Finished it', value: '38%', note: 'most listeners fall asleep first' },
    ],
    layers: [
      { id: 'wind', name: 'Grass and wind', detail: 'Low, continuous, no gusts', level: 58 },
      { id: 'bird', name: 'Distant bird', detail: 'Once or twice a minute at most', level: 24 },
      { id: 'space', name: 'Open space', detail: 'The room the rest sits in', level: 34 },
    ],
    chapters: [
      { label: 'Step out', minutes: 6, detail: 'Wind only.' },
      { label: 'Stand still', minutes: 12, detail: 'Almost nothing happens, on purpose.' },
      { label: 'Dark', minutes: 6, detail: 'Everything thins until it is gone.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Bedtime, sleep score' },
      { label: 'Voice', value: 'None — ambient' },
      { label: 'Ends', value: 'Fade to silence, no chime' },
      { label: 'Best time', value: 'Last thing' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '49%' },
      { change: 'Dropped the bird', share: '22%' },
      { change: 'Added a guiding voice', share: '9%' },
    ],
    lineage: [
      { title: 'Open field', author: 'Aurelia', note: 'Starter template' },
      { title: 'Quiet Space', author: 'Lucas Martin', note: 'Took almost everything out' },
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Not a treatment for insomnia or any medical condition.',
    ],
    shelves: ['community', 'picked', 'impact'],
  },
  {
    slug: 'dream-drift',
    title: 'Dream Drift',
    photo: 'underwater',
    gradient: 'linear-gradient(160deg, var(--color-info-900), var(--color-info-400))',
    description: 'This helped Mia unwind 65% faster and ease into sleep.',
    summary:
      'Weightlessness, as a sound. Slow suspended tones with no floor and no edges, for the stretch between lying down and letting go.',
    author: 'Mia Parker',
    authorPhoto: 'creatorMia',    authorRole: 'Community creator · 11 published sessions',
    plays: '72.4k',
    recreated: '1.2k',
    minutes: 26,
    category: 'Sleep',
    intent: 'Shorten the gap between lying down and actually going under.',
    outcome: [
      { label: 'Unwound faster', value: '+65%', note: 'self-reported, first two weeks' },
      { label: 'Time to sleep', value: '−13 min', note: 'median across 5.1k listeners' },
      { label: 'Finished it', value: '31%', note: 'most listeners fall asleep first' },
    ],
    layers: [
      { id: 'suspend', name: 'Suspended tones', detail: 'No root note, no resolution', level: 66 },
      { id: 'depth', name: 'Depth', detail: 'Sub content, felt not heard', level: 38 },
      { id: 'drift', name: 'Slow drift', detail: 'The mix moves ear to ear over minutes', level: 30 },
    ],
    chapters: [
      { label: 'Float', minutes: 8, detail: 'Tones enter without a beginning.' },
      { label: 'Drift', minutes: 12, detail: 'The mix moves so slowly it is hard to notice.' },
      { label: 'Under', minutes: 6, detail: 'Everything sinks below hearing.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Bedtime, sleep score' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence, no chime' },
      { label: 'Best time', value: 'In bed, lights out' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '58%' },
      { change: 'Raised the depth', share: '18%' },
      { change: 'Removed the drift', share: '11%' },
    ],
    lineage: [
      { title: 'Suspended', author: 'Aurelia', note: 'Starter template' },
      { title: 'Dream Drift', author: 'Mia Parker', note: 'Added the slow stereo drift' },
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked'],
  },
  // Eight sessions added so every chip above the community shelf has real
  // cards behind it — Music, Energy and Meditations were one or two deep,
  // which made the filter look broken rather than empty.
  {
    slug: 'slow-piano-drift',
    title: 'Slow Piano Drift',
    photo: 'morning',
    gradient: 'linear-gradient(160deg, var(--color-neutral-800), var(--color-info-400))',
    description: 'This helped Theo work through a long afternoon without stalling.',
    summary:
      'Felt piano recorded close enough to hear the hammers, with the reverb tail left long and the tempo below anything you would tap a foot to. Written as something to work under, not to listen to.',
    author: 'Theo Lindqvist',
    authorPhoto: 'creatorTheo',
    authorRole: 'Community creator · 41 published sessions',
    plays: '73.2k',
    recreated: '6.1k',
    minutes: 32,
    category: 'Music',
    intent: 'Fill a room quietly enough that attention stays on the work, not the music.',
    outcome: [
      { label: 'Stayed on task', value: '+28%', note: 'self-reported, 4.1k listeners' },
      { label: 'Replayed it', value: '61%', note: 'played more than once in a week' },
      { label: 'Skipped early', value: '9%', note: 'stopped in the first 3 minutes' },
    ],
    layers: [
      { id: 'piano', name: 'Felt piano', detail: 'Close mic, sustain left down', level: 70 },
      { id: 'tail', name: 'Reverb tail', detail: '6 second decay, no early reflections', level: 44 },
      { id: 'room', name: 'Room noise', detail: 'The recording room, kept in on purpose', level: 22 },
    ],
    chapters: [
      { label: 'Open', minutes: 6, detail: 'Single notes, a long way apart.' },
      { label: 'Settle', minutes: 18, detail: 'Phrases repeat without resolving.' },
      { label: 'Thin out', minutes: 8, detail: 'Notes drop away until only the tail is left.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Focus block length, time of day' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Deep work, afternoon' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '54%' },
      { change: 'Removed the room noise', share: '23%' },
      { change: 'Shortened the reverb', share: '14%' },
    ],
    lineage: [
      { title: 'Keys bed', author: 'Aurelia', note: 'Starter template' },
      { title: 'Slow Piano Drift', author: 'Theo Lindqvist', note: 'Recorded the piano and kept the room in' },
    ],
    safety: ['Background music, not a focus treatment.', 'Not a treatment for any medical condition.'],
    shelves: ['community', 'picked'],
  },
  {
    slug: '432-hz-strings',
    title: '432 Hz Strings',
    photo: 'mountains',
    gradient: 'linear-gradient(160deg, var(--color-espresso-900), var(--color-warning-400))',
    description: 'This helped Amara unwind after teaching without going straight to sleep.',
    summary:
      'A string quartet bowed at the edge of audible, tuned to A=432 and recorded in one take. The bowing never stops, so the sound has no seams to catch on.',
    author: 'Amara Osei',
    authorPhoto: 'creatorAmara',
    authorRole: 'Community creator · 23 published sessions',
    plays: '48.7k',
    recreated: '3.4k',
    minutes: 18,
    category: 'Music',
    intent: 'Give the evening a shape without the sedative pull of a sleep track.',
    outcome: [
      { label: 'Felt settled', value: '+47%', note: 'self-reported, straight after' },
      { label: 'Finished it', value: '81%', note: 'played to the end' },
      { label: 'Recreated it', value: '3.4k', note: 'forks published' },
    ],
    layers: [
      { id: 'strings', name: 'Bowed quartet', detail: 'One take, A=432, no edits', level: 76 },
      { id: 'sub', name: 'Sub drone', detail: 'Root note, an octave and a half down', level: 34 },
      { id: 'air', name: 'Hall air', detail: 'The room the quartet sat in', level: 26 },
    ],
    chapters: [
      { label: 'Draw', minutes: 5, detail: 'One chord, bowed slowly into place.' },
      { label: 'Hold', minutes: 9, detail: 'The chord moves a step at a time.' },
      { label: 'Release', minutes: 4, detail: 'Bows lift, the drone stays a moment longer.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Evening check-in, stress level' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Fade to silence' },
      { label: 'Best time', value: 'Early evening' },
    ],
    commonChanges: [
      { change: 'Lowered the sub drone', share: '36%' },
      { change: 'Made it longer', share: '29%' },
      { change: 'Added rain over it', share: '15%' },
    ],
    lineage: [
      { title: 'Single tone', author: 'Aurelia', note: 'Starter template' },
      { title: 'Long bow', author: 'Sofia Martinez', note: 'Swapped the synth for strings' },
      { title: '432 Hz Strings', author: 'Amara Osei', note: 'Recorded a live quartet in one take' },
    ],
    safety: [
      'Tuning claims are not medically established — this is music, not therapy.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community'],
  },
  {
    slug: 'bowl-bath',
    title: 'Bowl Bath',
    photo: 'calm',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-neutral-300))',
    description: 'This helped Jonas end the day without reaching for his phone.',
    summary:
      'Seven singing bowls struck in an order that never repeats, recorded far enough back that the strikes arrive softened. Long gaps are the point — the silence between bowls is most of the session.',
    author: 'Jonas Weber',
    authorPhoto: 'creatorJonas',
    authorRole: 'Community creator · 16 published sessions',
    plays: '31.9k',
    recreated: '2.7k',
    minutes: 25,
    category: 'Music',
    intent: 'Hold attention with sound sparse enough that the mind stops looking for the next thing.',
    outcome: [
      { label: 'Phone put down', value: '+38%', note: 'self-reported, 1.9k listeners' },
      { label: 'Felt calmer', value: '+44%', note: 'self-reported, straight after' },
      { label: 'Finished it', value: '72%', note: 'played to the end' },
    ],
    layers: [
      { id: 'bowls', name: 'Seven bowls', detail: 'Struck once each, never in the same order', level: 68 },
      { id: 'decay', name: 'Decay tail', detail: 'Left to run out entirely before the next strike', level: 52 },
      { id: 'floor', name: 'Room floor', detail: 'Wooden room, barely there', level: 18 },
    ],
    chapters: [
      { label: 'First strike', minutes: 6, detail: 'One bowl at a time, gaps getting longer.' },
      { label: 'Between', minutes: 13, detail: 'More silence than sound.' },
      { label: 'Last', minutes: 6, detail: 'A single bowl, left to run out.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Bedtime, evening check-in' },
      { label: 'Voice', value: 'None — instrumental' },
      { label: 'Ends', value: 'Last decay, then silence' },
      { label: 'Best time', value: 'The hour before bed' },
    ],
    commonChanges: [
      { change: 'Shortened the gaps', share: '41%' },
      { change: 'Made it longer', share: '26%' },
      { change: 'Added a low drone', share: '19%' },
    ],
    lineage: [
      { title: 'Single tone', author: 'Aurelia', note: 'Starter template' },
      { title: 'Bowl Bath', author: 'Jonas Weber', note: 'Recorded seven bowls and kept the silence' },
    ],
    safety: [
      'Sudden strikes can startle — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'impact'],
  },
  {
    slug: 'morning-spark',
    title: 'Morning Spark',
    photo: 'affirmations',
    gradient: 'linear-gradient(160deg, var(--color-warning-600), var(--color-gold-300))',
    description: 'This helped Aria start the day awake instead of anxious.',
    summary:
      'Eight minutes that climb: a pulse that speeds up by a few beats a minute, and a short affirmation set written in the second person, present tense. Meant for before the first message of the day.',
    author: 'Aria Moon',
    authorPhoto: 'creatorAria',
    authorRole: 'Community creator · 29 published sessions',
    plays: '88.4k',
    recreated: '11.2k',
    minutes: 8,
    category: 'Energy',
    intent: 'Lift the first ten minutes of the day without tipping it into urgency.',
    outcome: [
      { label: 'Woke up easier', value: '+35%', note: 'self-reported, 6.4k listeners' },
      { label: 'Used it again', value: '68%', note: 'played 3+ mornings in a week' },
      { label: 'Finished it', value: '91%', note: 'played to the end' },
    ],
    layers: [
      { id: 'pulse', name: 'Rising pulse', detail: '52 → 68 bpm across the session', level: 64 },
      { id: 'voice', name: 'Affirmations', detail: 'Female, 9 lines, present tense', level: 58 },
      { id: 'bells', name: 'Bright bells', detail: 'Marks each new line', level: 30 },
    ],
    chapters: [
      { label: 'Wake', minutes: 2, detail: 'Pulse alone, slow.' },
      { label: 'Speak', minutes: 4, detail: 'Affirmations land on the pulse.' },
      { label: 'Go', minutes: 2, detail: 'Voice stops, the pulse finishes on its own.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Wake time, sleep score' },
      { label: 'Voice', value: 'Female · warm' },
      { label: 'Ends', value: 'Single bell' },
      { label: 'Best time', value: 'First thing, before your phone' },
    ],
    commonChanges: [
      { change: 'Rewrote the affirmations', share: '47%' },
      { change: 'Removed the bells', share: '22%' },
      { change: 'Slowed the pulse', share: '16%' },
    ],
    lineage: [
      { title: 'Bright open', author: 'Aurelia', note: 'Starter template' },
      { title: 'Morning Spark', author: 'Aria Moon', note: 'Wrote the affirmation set and the rising pulse' },
    ],
    safety: [
      'Affirmations are written by the creator, not a clinician.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked'],
  },
  {
    slug: 'cold-start',
    title: 'Cold Start',
    photo: 'breathwork',
    gradient: 'linear-gradient(160deg, var(--color-info-700), var(--color-gold-200))',
    description: 'This helped Lucas get moving on the days he did not want to.',
    summary:
      'Six minutes of paced breath at a deliberately quick tempo, cued over a rhythm that never lets the count drift. Built for the gap between deciding to start and actually starting.',
    author: 'Lucas Ferrari',
    authorPhoto: 'creatorLucas',
    authorRole: 'Community creator · 12 published sessions',
    plays: '26.3k',
    recreated: '5.6k',
    minutes: 6,
    category: 'Energy',
    intent: 'Raise alertness fast, without caffeine and without a long run-up.',
    outcome: [
      { label: 'Felt more alert', value: '+41%', note: 'self-reported, straight after' },
      { label: 'Started the task', value: '+33%', note: 'self-reported, 2.2k listeners' },
      { label: 'Finished it', value: '88%', note: 'played to the end' },
    ],
    layers: [
      { id: 'count', name: 'Breath count', detail: 'Male voice, 4-in 4-out, no pause', level: 62 },
      { id: 'rhythm', name: 'Rhythm', detail: '96 bpm, dry, no reverb', level: 56 },
      { id: 'lift', name: 'Lift', detail: 'Chord rises once per round', level: 38 },
    ],
    chapters: [
      { label: 'Set', minutes: 1, detail: 'Rhythm alone, so the pace is obvious.' },
      { label: 'Rounds', minutes: 4, detail: 'Four rounds, each a little quicker.' },
      { label: 'Stop', minutes: 1, detail: 'Everything cuts; you are left standing.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Energy check-in, time of day' },
      { label: 'Voice', value: 'Male · direct' },
      { label: 'Ends', value: 'Hard stop, no fade' },
      { label: 'Best time', value: 'Mid-morning, or before training' },
    ],
    commonChanges: [
      { change: 'Slowed the pace', share: '38%' },
      { change: 'Removed the voice', share: '27%' },
      { change: 'Added a fourth round', share: '13%' },
    ],
    lineage: [
      { title: 'Bright open', author: 'Aurelia', note: 'Starter template' },
      { title: 'Cold Start', author: 'Lucas Ferrari', note: 'Wrote the rounds and the hard stop' },
    ],
    safety: [
      'Quick paced breathing can cause light-headedness — sit down and stop if you feel dizzy.',
      'Skip this one if you are pregnant or have a heart or respiratory condition.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community'],
  },
  {
    slug: 'body-scan-slowly',
    title: 'Body Scan, Slowly',
    photo: 'stress',
    gradient: 'linear-gradient(160deg, var(--color-success-900), var(--color-success-500))',
    description: 'This helped Mia notice tension she had been carrying all day.',
    summary:
      'A body scan given at half the usual pace, with long silences where most recordings keep talking. Twenty-eight minutes from the scalp down, and no instruction to relax anything.',
    author: 'Mia Ortiz',
    authorPhoto: 'creatorMia',
    authorRole: 'Community creator · 31 published sessions',
    plays: '57.6k',
    recreated: '4.2k',
    minutes: 28,
    category: 'Meditations',
    intent: 'Notice what the body is doing, without asking it to do anything else.',
    outcome: [
      { label: 'Noticed tension', value: '+58%', note: 'self-reported, 3.7k listeners' },
      { label: 'Felt calmer', value: '+39%', note: 'self-reported, straight after' },
      { label: 'Finished it', value: '64%', note: 'played to the end' },
    ],
    layers: [
      { id: 'voice', name: 'Guidance', detail: 'Female, slow, long gaps between cues', level: 66 },
      { id: 'bed', name: 'Warm bed', detail: 'One sustained chord, barely moving', level: 30 },
      { id: 'silence', name: 'Silence', detail: 'Roughly a third of the session', level: 0 },
    ],
    chapters: [
      { label: 'Arrive', minutes: 4, detail: 'Weight, contact, nothing to change.' },
      { label: 'Down', minutes: 18, detail: 'Scalp to feet, one region at a time.' },
      { label: 'Whole', minutes: 6, detail: 'The body as one thing, then quiet.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Stress check-in, time available' },
      { label: 'Voice', value: 'Female · slow' },
      { label: 'Ends', value: 'Silence, no chime' },
      { label: 'Best time', value: 'End of the working day' },
    ],
    commonChanges: [
      { change: 'Made it shorter', share: '44%' },
      { change: 'Added a closing chime', share: '25%' },
      { change: 'Swapped the voice', share: '18%' },
    ],
    lineage: [
      { title: 'Guided bed', author: 'Aurelia', note: 'Starter template' },
      { title: 'Body Scan, Slowly', author: 'Mia Ortiz', note: 'Halved the pace and kept the silences' },
    ],
    safety: [
      'Body scans can surface discomfort — stop if anything feels distressing.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'impact'],
  },
  {
    slug: 'noting-practice',
    title: 'Noting Practice',
    photo: 'bloom',
    gradient: 'linear-gradient(160deg, var(--color-warning-700), var(--color-gold-200))',
    description: 'This helped Ethan stop arguing with his own thoughts.',
    summary:
      'The plainest practice in the catalogue: name what is happening in one word, let it go, wait for the next one. A bell every ninety seconds, and nothing else.',
    author: 'Ethan Miller',
    authorPhoto: 'creatorEthan',
    authorRole: 'Community creator · 52 published sessions',
    plays: '112k',
    recreated: '14.6k',
    minutes: 15,
    category: 'Meditations',
    intent: 'Give a restless mind one job small enough to actually do.',
    outcome: [
      { label: 'Less rumination', value: '−31%', note: 'self-reported, 8.9k listeners' },
      { label: 'Practised again', value: '73%', note: 'returned within a week' },
      { label: 'Finished it', value: '84%', note: 'played to the end' },
    ],
    layers: [
      { id: 'bell', name: 'Bell', detail: 'Every 90 seconds, same pitch', level: 48 },
      { id: 'voice', name: 'Guidance', detail: 'Male, 5 cues in total', level: 44 },
      { id: 'room', name: 'Room', detail: 'Quiet room tone, nothing added', level: 14 },
    ],
    chapters: [
      { label: 'How', minutes: 3, detail: 'One word, then let it go. That is the whole instruction.' },
      { label: 'Practice', minutes: 10, detail: 'Bells only; you do the noting.' },
      { label: 'Close', minutes: 2, detail: 'A last cue, then the room.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Practice history, time available' },
      { label: 'Voice', value: 'Male · plain' },
      { label: 'Ends', value: 'Single bell' },
      { label: 'Best time', value: 'Any time your head is loud' },
    ],
    commonChanges: [
      { change: 'Made it longer', share: '49%' },
      { change: 'Removed the bells', share: '21%' },
      { change: 'Added a background bed', share: '17%' },
    ],
    lineage: [
      { title: 'Bare bell', author: 'Aurelia', note: 'Starter template' },
      { title: 'Noting Practice', author: 'Ethan Miller', note: 'Cut everything except the bell and five cues' },
    ],
    safety: [
      'Sitting with difficult thoughts is not right for everyone — stop if it feels distressing.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community', 'picked', 'impact'],
  },
  {
    slug: 'night-rain-sleep',
    title: 'Night Rain Sleep',
    photo: 'sleep',
    gradient: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-info-700))',
    description: 'This helped Sophia fall asleep without the room feeling empty.',
    summary:
      'Steady rain on a flat roof, recorded for six hours and cut to the least eventful fifty minutes of it. No thunder, no wind, nothing that resolves — the point is that nothing happens.',
    author: 'Sophia Reynolds',
    authorPhoto: 'creatorSophia',
    authorRole: 'Community creator · 27 published sessions',
    plays: '204k',
    recreated: '7.3k',
    minutes: 50,
    category: 'Sleep',
    intent: 'Cover the silence a quiet bedroom leaves, without giving the ear anything to follow.',
    outcome: [
      { label: 'Fell asleep faster', value: '−14 min', note: 'median, 11.4k listeners' },
      { label: 'Woke less', value: '−22%', note: 'self-reported night wakings' },
      { label: 'Played to sleep', value: '79%', note: 'still playing at the end' },
    ],
    layers: [
      { id: 'rain', name: 'Roof rain', detail: 'Flat roof, steady, no gusts', level: 78 },
      { id: 'gutter', name: 'Gutter', detail: 'Water running, far off', level: 34 },
      { id: 'sub', name: 'Low bed', detail: 'Fills under the rain so it is not thin', level: 24 },
    ],
    chapters: [
      { label: 'Settle', minutes: 10, detail: 'Rain comes up from nothing.' },
      { label: 'Steady', minutes: 32, detail: 'Unchanging, on purpose.' },
      { label: 'Thin', minutes: 8, detail: 'Rain eases; the low bed goes last.' },
    ],
    personalization: [
      { label: 'Adapts to', value: 'Bedtime, sleep score' },
      { label: 'Voice', value: 'None — field recording' },
      { label: 'Ends', value: 'Fade to silence, no chime' },
      { label: 'Best time', value: 'In bed, lights out' },
    ],
    commonChanges: [
      { change: 'Looped it all night', share: '62%' },
      { change: 'Removed the low bed', share: '19%' },
      { change: 'Added distant thunder', share: '12%' },
    ],
    lineage: [
      { title: 'Room tone', author: 'Aurelia', note: 'Starter template' },
      { title: 'Night Rain Sleep', author: 'Sophia Reynolds', note: 'Recorded six hours and kept the dullest fifty minutes' },
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Not a treatment for any medical condition.',
    ],
    shelves: ['community'],
  },
]

export function findSession(slug: string | undefined) {
  return SESSIONS.find((session) => session.slug === slug)
}

export function sessionsOnShelf(shelf: Shelf, category: CategoryFilter = 'All') {
  return SESSIONS.filter(
    (session) =>
      session.shelves.includes(shelf) && (category === 'All' || session.category === category),
  )
}

/** The same filter over the whole catalogue, for surfaces that aren't a shelf. */
export function sessionsInCategory(category: CategoryFilter = 'All') {
  return category === 'All' ? SESSIONS : SESSIONS.filter((session) => session.category === category)
}

export function totalMinutes(session: SessionRecord) {
  return session.chapters.reduce((sum, chapter) => sum + chapter.minutes, 0)
}
