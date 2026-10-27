import { z } from 'zod'
import { FEELINGS, feelingSentence } from './feelings'
import { readJson, removeKey, writeJson } from './storage'

// First-run onboarding (design v4, U047).
//
// What a first sign-in asks, kept to what the app can actually use today:
// the goal becomes the objective Progress measures against; the feelings,
// length, voice and sound become the brief the cockpit builds the first
// session from — the same /chat `ask` path Home's field uses. Nothing here
// pretends to a capability the product does not have: no wearable pairing
// (Connect is mock and lives in My Wellness), no account profile (there is
// no backend).
//
// Stored in this browser only. Sign-in itself is deliberately not persisted
// (AuthContext), so "first time" means "first sign-in on this browser" until
// accounts exist — then this record moves to the account and is asked once
// per person, not per device. Never sent anywhere; click insights records
// that a chip was tapped, never what onboarding stored.

export interface Goal {
  id: string
  label: string
  /** One line under the label: what Aurelia will do about it. */
  hint: string
  /** The objective, as Progress and Analytics write it. */
  objective: string
  /** "to help me …" — the brief's purpose clause. */
  says: string
}

export const GOALS: Goal[] = [
  { id: 'sleep', label: 'Sleep better', hint: 'Fall asleep faster, wake less', objective: 'Improve my sleep', says: 'help me sleep better' },
  { id: 'calm', label: 'Feel calmer', hint: 'Ease stress and anxiety', objective: 'Reduce my stress', says: 'help me feel calmer' },
  { id: 'clarity', label: 'Clear my mind', hint: 'Less noise, more clarity', objective: 'Gain mental clarity', says: 'help me clear my mind' },
  { id: 'focus', label: 'Focus', hint: 'Stay with one thing longer', objective: 'Improve my focus', says: 'help me focus' },
  { id: 'regulate', label: 'Regulate my body', hint: 'Settle a wired nervous system', objective: 'Regulate my nervous system', says: 'help my body settle' },
  { id: 'energy', label: 'More energy', hint: 'Lift a flat, tired day', objective: 'Boost my energy', says: 'give me more energy' },
]

export const LENGTHS = [5, 10, 20] as const
export type Length = (typeof LENGTHS)[number]

export const VOICES = [
  { id: 'female', label: 'Female voice' },
  { id: 'male', label: 'Male voice' },
  { id: 'none', label: 'No voice' },
] as const
export type Voice = (typeof VOICES)[number]['id']

export const SOUNDS = [
  { id: 'nature', label: 'Nature', says: 'nature sounds' },
  { id: 'music', label: 'Soft music', says: 'soft music' },
  { id: 'frequencies', label: 'Frequencies', says: 'healing frequencies' },
  { id: 'silence', label: 'Mostly silence', says: 'mostly silence' },
] as const
export type Sound = (typeof SOUNDS)[number]['id']

export interface Onboarding {
  goal: string | null
  feelings: string[]
  length: Length
  voice: Voice
  sounds: Sound[]
  /** v5 (U053): the wearable they chose to connect, if any. Absent = not asked. */
  wearable?: Wearable
}

/** v5: the devices the three interviewed users wear, plus "none". */
export const WEARABLES = [
  { id: 'apple-watch', label: 'Apple Watch' },
  { id: 'whoop', label: 'Whoop' },
  { id: 'oura', label: 'Oura Ring' },
  { id: 'none', label: 'Not now' },
] as const
export type Wearable = (typeof WEARABLES)[number]['id']

/** "Apple Watch" for a connected device; null for none or not asked. */
export function wearableLabel(id: Wearable | undefined): string | null {
  if (!id || id === 'none') return null
  return WEARABLES.find((w) => w.id === id)?.label ?? null
}

/** What a skipped step leaves behind — sensible, and what the demo session already is. */
export const DEFAULTS: Onboarding = { goal: null, feelings: [], length: 10, voice: 'female', sounds: ['nature'] }

const KEY = 'aurelia.onboarding'

interface Stored extends Onboarding {
  /** When it was finished or skipped. Absent = never seen. */
  doneAt?: number
  skipped?: boolean
}

const stored = z.object({
  goal: z.string().nullable(),
  feelings: z.array(z.string()),
  length: z.union([z.literal(5), z.literal(10), z.literal(20)]),
  voice: z.enum(['female', 'male', 'none']),
  sounds: z.array(z.enum(['nature', 'music', 'frequencies', 'silence'])),
  wearable: z.enum(['apple-watch', 'whoop', 'oura', 'none']).optional(),
  doneAt: z.number().optional(),
  skipped: z.boolean().optional(),
})

/** A record from an older shape (or edited by hand) reads as "not onboarded", which only asks again. */
function read(): Stored | null {
  return readJson<Stored | null>(KEY, stored, null)
}

/** Has this browser been through onboarding (finished or skipped)? */
export function onboarded() {
  return Boolean(read()?.doneAt)
}

/** The answers, for screens that use them (Progress's objective). */
export function onboardingAnswers(): Onboarding | null {
  const stored = read()
  return stored?.doneAt ? stored : null
}

export function saveOnboarding(answers: Onboarding, skipped = false) {
  // Private mode: onboarding just asks again next time, which is harmless.
  writeJson(KEY, { ...answers, doneAt: Date.now(), skipped })
}

/** Settings → "Replay onboarding". Keeps nothing, so it asks from scratch. */
export function resetOnboarding() {
  removeKey(KEY)
}

export function findGoal(id: string | null) {
  return GOALS.find((g) => g.id === id)
}

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : (items[0] ?? '')
}

/**
 * The first session's brief, in the user's voice — e.g. "Create my first
 * session: 10 minutes to help me sleep better. I’m stressed. Female voice,
 * with nature sounds." It opens with "my first session", which a reply rule
 * of its own answers (lib/replies.ts `first-session`), so the cockpit
 * acknowledges the setup and proposes, instead of whichever keyword happens
 * to come first.
 *
 * `words` is what they typed on Home before signing in (v4, U050). It goes
 * into the brief as their own sentence and stands in for the feeling line —
 * the feelings were read off it, so saying both would say it twice.
 */
export function firstSessionBrief(answers: Onboarding, words?: string) {
  const goal = findGoal(answers.goal)
  const purpose = goal ? `${answers.length} minutes to ${goal.says}` : `${answers.length} minutes to unwind`
  const own = words?.trim()
  // "Not sure" asks a question; in a brief it would only confuse the build.
  const feeling = own ? `In my words: “${own.replace(/[.!?]+$/, '')}.”` : feelingSentence(answers.feelings.filter((f) => f !== 'unsure'))
  const voice = VOICES.find((v) => v.id === answers.voice)?.label ?? 'Female voice'
  const sounds = list(SOUNDS.filter((s) => answers.sounds.includes(s.id)).map((s) => s.says))
  const style = sounds ? `${voice}, with ${sounds}.` : `${voice}.`
  return [`Create my first session: ${purpose}.`, feeling, style].filter(Boolean).join(' ')
}

/** Labels for the summary on the last step. */
export function feelingLabels(ids: string[]) {
  return FEELINGS.filter((f) => ids.includes(f.id)).map((f) => f.label)
}
