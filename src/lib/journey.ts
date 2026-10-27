import { z } from 'zod'
import { readJson, removeKey, writeJson } from './storage'

// The first five chapters (design v4, U050).
//
// J039's simulation found nothing asked a first-time user back: the player
// showed invented progress ("+3% since yesterday") before the first listen,
// and Home after the first session was the marketing page. This is the
// smallest honest loop the demo can run without a backend:
//
//   first build → play → "How do you feel now?" (1–5) → "Chapter 2 is ready
//   tomorrow — remind me at 22:30" (a calendar file) → Home leads with the
//   next chapter → each check-in is a real data point, drawn as it is.
//
// Kept in this browser, like onboarding — sign-in is deliberately not
// persisted, so this is what lets tomorrow's visit find yesterday's chapter.
// It moves to the account once accounts exist. Never sent anywhere.

/** The first stretch the loop counts toward: long enough to notice a change. */
export const FIRST_CHAPTERS = 5

export const MOOD_LABELS = ['Very unpleasant', 'Unpleasant', 'Neutral', 'Pleasant', 'Very pleasant'] as const

export interface CheckIn {
  at: number
  /** 1–5, as tapped on the faces. */
  mood: number
  /** v5 (U053): an optional line in their own words — the journal. Only they see it. */
  note?: string
}

/** v5 (U053): a journal line written without a session, from Progress. */
export interface JournalNote {
  at: number
  text: string
  mood?: number
}

export interface Journey {
  goal: string | null
  /** The session's name without its version — "Sleep better". */
  name: string
  /** The catalogue session the build stands in for, which is what plays. */
  slug: string
  /** The version route the first build plays under, so Home can reopen it. */
  href: string
  checkIns: CheckIn[]
  /** "22:30", once a reminder has been added to the calendar. */
  reminder?: string
  /** v5: journal lines written outside a session. */
  notes?: JournalNote[]
}

const KEY = 'aurelia.journey'

const schema = z.object({
  goal: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  href: z.string(),
  checkIns: z.array(z.object({ at: z.number(), mood: z.number().int().min(1).max(5), note: z.string().max(500).optional() })),
  reminder: z.string().optional(),
  notes: z.array(z.object({ at: z.number(), text: z.string().max(500), mood: z.number().int().min(1).max(5).optional() })).optional(),
})

export function readJourney(): Journey | null {
  return readJson<Journey | null>(KEY, schema.nullable(), null)
}

/**
 * Called on the first build of a first-session thread. Starting again (a new
 * first session after Replay onboarding) replaces the old journey rather
 * than appending to it — two journeys would need a picker nobody asked for.
 */
export function startJourney(start: Omit<Journey, 'checkIns'>): Journey {
  const journey: Journey = { ...start, checkIns: [] }
  writeJson(KEY, journey)
  return journey
}

export function addCheckIn(mood: number, at = Date.now()): Journey | null {
  const journey = readJourney()
  if (!journey) return null
  const next = { ...journey, checkIns: [...journey.checkIns, { at, mood }] }
  writeJson(KEY, next)
  return next
}

/** v5: the note typed under the check-in that was just made. */
export function noteLastCheckIn(note: string): Journey | null {
  const journey = readJourney()
  const text = note.trim().slice(0, 500)
  if (!journey || !journey.checkIns.length || !text) return journey
  const checkIns = journey.checkIns.map((c, i) => (i === journey.checkIns.length - 1 ? { ...c, note: text } : c))
  const next = { ...journey, checkIns }
  writeJson(KEY, next)
  return next
}

/** v5: a journal line from Progress, with no session behind it. */
export function addJournalNote(text: string, mood?: number, at = Date.now()): Journey | null {
  const journey = readJourney()
  const line = text.trim().slice(0, 500)
  if (!journey || !line) return journey
  const next = { ...journey, notes: [...(journey.notes ?? []), { at, text: line, ...(mood ? { mood } : {}) }] }
  writeJson(KEY, next)
  return next
}

/**
 * v5 (U053): how the stretch is going, in words rather than a score.
 *
 * Real users (Ishmeet, Olivia, Bryan; J049) read the demo's percentages as
 * either anxiety-making or unserious. This summarises their own answers the
 * way a person would: the direction, the most common feeling, and how many
 * times they showed up. No percentages, no projection.
 */
export function feelingSummary(checkIns: CheckIn[]): { trend: 'up' | 'same' | 'down' | 'new'; usual: string; count: number } {
  const count = checkIns.length
  if (count < 2) return { trend: 'new', usual: count ? MOOD_LABELS[checkIns[0].mood - 1] : '', count }
  const half = Math.ceil(count / 2)
  const avg = (list: CheckIn[]) => list.reduce((s, c) => s + c.mood, 0) / list.length
  const early = avg(checkIns.slice(0, count - half)) || avg(checkIns.slice(0, 1))
  const late = avg(checkIns.slice(count - half))
  const trend = late - early >= 0.5 ? 'up' : early - late >= 0.5 ? 'down' : 'same'
  const tally = new Map<number, number>()
  for (const c of checkIns) tally.set(c.mood, (tally.get(c.mood) ?? 0) + 1)
  const usualMood = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0]
  return { trend, usual: MOOD_LABELS[usualMood - 1], count }
}

export function setReminder(time: string): Journey | null {
  const journey = readJourney()
  if (!journey) return null
  const next = { ...journey, reminder: time }
  writeJson(KEY, next)
  return next
}

/** Settings → Replay onboarding starts the loop over too. */
export function resetJourney() {
  removeKey(KEY)
}

/** When each goal's chapter is most likely to be played — the reminder's default. */
const DEFAULT_TIMES: Record<string, string> = {
  sleep: '22:30',
  calm: '18:00',
  clarity: '07:30',
  focus: '08:30',
  regulate: '21:00',
  energy: '07:00',
}

export function defaultReminderTime(goal: string | null) {
  return DEFAULT_TIMES[goal ?? ''] ?? '20:00'
}

/** "tomorrow night" for a sleep chapter, "tomorrow" otherwise — what the card promises. */
export function nextChapterWhen(goal: string | null) {
  return goal === 'sleep' ? 'tomorrow night' : 'tomorrow'
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Floating local time (no Z): the reminder is "22:30 wherever you are". */
function icsDate(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}

/**
 * A calendar file that repeats daily for the rest of the first chapters, with
 * an alert at the time itself. A calendar is the reminder the demo can keep
 * without a server: web push needs one to send it (decision D3 in J039).
 */
export function reminderIcs({
  name,
  time,
  remaining,
  url,
  from = new Date(),
}: {
  name: string
  time: string
  /** How many daily reminders — the chapters still to come. */
  remaining: number
  url: string
  from?: Date
}) {
  const [h, m] = time.split(':').map(Number)
  const start = new Date(from)
  start.setDate(start.getDate() + 1)
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + 15 * 60_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aurelia//Chapters//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:aurelia-chapters-${start.getTime()}@aurelia.care`,
    `DTSTAMP:${icsDate(from)}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `RRULE:FREQ=DAILY;COUNT=${Math.max(1, remaining)}`,
    `SUMMARY:Aurelia · ${name}: your next chapter`,
    `DESCRIPTION:Your next chapter is ready. ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:PT0M',
    `DESCRIPTION:Aurelia · ${name}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n') + '\r\n'
}
