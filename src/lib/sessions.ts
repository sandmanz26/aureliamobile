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
}

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
  },
]

export function findSession(slug: string | undefined) {
  return SESSIONS.find((session) => session.slug === slug)
}

export function totalMinutes(session: SessionRecord) {
  return session.chapters.reduce((sum, chapter) => sum + chapter.minutes, 0)
}
