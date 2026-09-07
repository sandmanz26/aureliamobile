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
  authorRole: string
  plays: string
  recreated: string
  minutes: number
  category: string
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
    authorRole: 'Community creator · 34 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    authorRole: 'Community creator · 12 published sessions',
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
    authorRole: 'Community creator · 7 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    description: 'This helped Daniel release tension and reset her mind in just 10 minutes.',
    summary:
      'Ten minutes of very slow harmonic drift, with no beat to hold onto and nothing to follow. Written for the gap between two things you did not want to do — short enough to fit, long enough to change the register you are in.',
    author: 'Emma Carter',
    authorRole: 'Community creator · 21 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    authorRole: 'Community creator · 9 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    shelves: ['picked'],
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
    authorRole: 'Community creator · 41 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    shelves: ['impact'],
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
    authorRole: 'Community creator · 16 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
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
    shelves: ['impact'],
  },
]

export function findSession(slug: string | undefined) {
  return SESSIONS.find((session) => session.slug === slug)
}

export function sessionsOnShelf(shelf: Shelf) {
  return SESSIONS.filter((session) => session.shelves.includes(shelf))
}

export function totalMinutes(session: SessionRecord) {
  return session.chapters.reduce((sum, chapter) => sum + chapter.minutes, 0)
}
