import { z } from 'zod'
import { readJson, writeJson } from './storage'

/**
 * Daily check-in (U068, Figma Changes → Daily 16906:5362 and
 * Session/Insights/Journal 16906:5450): how the person feels today, whether
 * yesterday's session helped, and a note — one entry per day, which the
 * Journal shows back and lets them edit.
 *
 * Kept in this browser (`aurelia.daily`) like the journey, until accounts
 * exist. While the app is a demo the sheet opens on every sign-in, even when
 * today is already answered (owner's instruction, J079); it then opens with
 * today's answers filled in.
 */
export const DAILY_KEY = 'aurelia.daily'

const EntrySchema = z.object({
  /** yyyy-mm-dd, local time */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.number().int().min(1).max(5).nullable(),
  helped: z.boolean().nullable(),
  note: z.string().max(1000),
})
export type DailyEntry = z.infer<typeof EntrySchema>
const LogSchema = z.array(EntrySchema)

export const MOOD_WORDS = ['Feeling awful', 'Feeling low', 'Feeling okay', 'Feeling good', 'Feeling great!'] as const

/** Local calendar day, so "today" is the person's today, not UTC's. */
export function dayKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function readDaily(): DailyEntry[] {
  return readJson(DAILY_KEY, LogSchema, [])
}

export function entryFor(log: DailyEntry[], date: string) {
  return log.find((e) => e.date === date)
}

/** Replaces the day's entry, or adds it. Returns the new log. */
export function saveEntry(entry: DailyEntry, log = readDaily()): DailyEntry[] {
  const next = [...log.filter((e) => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date))
  writeJson(DAILY_KEY, next)
  return next
}

export interface WeekDay {
  date: string
  label: string
  day: number
  today: boolean
  future: boolean
}

/** Monday to Sunday around `today`, as the strip draws it. */
export function weekOf(today: Date): WeekDay[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const todayKey = dayKey(today)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = dayKey(d)
    return { date, label: d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(), day: d.getDate(), today: date === todayKey, future: date > todayKey }
  })
}

/** One line for a list: "Feeling great! · The session helped · I had no bad dreams." */
export function dailyLine(entry: DailyEntry) {
  return [
    entry.mood ? MOOD_WORDS[entry.mood - 1] : null,
    entry.helped === null ? null : entry.helped ? 'The session helped' : 'The session did not help',
    entry.note || null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Midday on the entry's own day, so lists sort it among timestamped notes. */
export function entryTime(entry: DailyEntry) {
  return new Date(`${entry.date}T12:00:00`).getTime()
}
