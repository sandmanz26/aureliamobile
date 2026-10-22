import { FEELINGS, feelingSentence } from './feelings'

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
}

/** What a skipped step leaves behind — sensible, and what the demo session already is. */
export const DEFAULTS: Onboarding = { goal: null, feelings: [], length: 10, voice: 'female', sounds: ['nature'] }

const KEY = 'aurelia.onboarding'

interface Stored extends Onboarding {
  /** When it was finished or skipped. Absent = never seen. */
  doneAt?: number
  skipped?: boolean
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stored) : null
  } catch {
    return null
  }
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
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...answers, doneAt: Date.now(), skipped }))
  } catch {
    // Private mode: onboarding just asks again next time, which is harmless.
  }
}

/** Settings → "Replay onboarding". Keeps nothing, so it asks from scratch. */
export function resetOnboarding() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to clear
  }
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
 */
export function firstSessionBrief(answers: Onboarding) {
  const goal = findGoal(answers.goal)
  const purpose = goal ? `${answers.length} minutes to ${goal.says}` : `${answers.length} minutes to unwind`
  // "Not sure" asks a question; in a brief it would only confuse the build.
  const feeling = feelingSentence(answers.feelings.filter((f) => f !== 'unsure'))
  const voice = VOICES.find((v) => v.id === answers.voice)?.label ?? 'Female voice'
  const sounds = list(SOUNDS.filter((s) => answers.sounds.includes(s.id)).map((s) => s.says))
  const style = sounds ? `${voice}, with ${sounds}.` : `${voice}.`
  return [`Create my first session: ${purpose}.`, feeling, style].filter(Boolean).join(' ')
}

/** Labels for the summary on the last step. */
export function feelingLabels(ids: string[]) {
  return FEELINGS.filter((f) => ids.includes(f.id)).map((f) => f.label)
}
