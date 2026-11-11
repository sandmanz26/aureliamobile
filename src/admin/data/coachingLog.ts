import { z } from 'zod'
import { readJson, writeJson } from '../../lib/storage'
import type { Participant } from './study'

/**
 * The project manager's coaching log (U062): one line per contact with a
 * participant, so the admin holds the daily guidance next to the measures it
 * is meant to move. Eugene: the PM "will use this admin section as source of
 * truth to validation of users' therapeutic goals".
 *
 * Until the backend exists, entries the PM writes stay in this browser
 * (`aurelia.admin.study.log`). A few sample entries are generated so the page
 * shows what a used log looks like; they are marked sample and never stored.
 */

export const CHANNELS = ['Message', 'Call', 'Voice note', 'In person'] as const
export type Channel = (typeof CHANNELS)[number]

export const LogEntrySchema = z.object({
  id: z.string(),
  participantId: z.string(),
  /** yyyy-mm-dd */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  channel: z.enum(CHANNELS),
  /** How they said they feel today, 1–5; null when not asked. */
  feeling: z.number().int().min(1).max(5).nullable(),
  note: z.string().max(2000),
  nextStep: z.string().max(500),
  /** Needs the study lead (a safety worry, or anything the PM should not handle alone). */
  escalate: z.boolean(),
  sample: z.boolean().optional(),
})
export type LogEntry = z.infer<typeof LogEntrySchema>

export const LOG_KEY = 'aurelia.admin.study.log'
const LogSchema = z.array(LogEntrySchema)

export function readLog(): LogEntry[] {
  return readJson(LOG_KEY, LogSchema, [])
}

export function writeLog(entries: LogEntry[]): boolean {
  return writeJson(
    LOG_KEY,
    entries.filter((e) => !e.sample),
  )
}

export function isoDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

/** Whole days from `from` to `to` (both yyyy-mm-dd). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/** Newest first; on the same day, the most recently written first. */
export function entriesFor(log: LogEntry[], participantId: string): LogEntry[] {
  return log
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.participantId === participantId)
    .sort((a, b) => b.e.date.localeCompare(a.e.date) || b.i - a.i)
    .map(({ e }) => e)
}

export function lastContact(log: LogEntry[]): Map<string, string> {
  const out = new Map<string, string>()
  for (const e of log) {
    const prev = out.get(e.participantId)
    if (!prev || e.date > prev) out.set(e.participantId, e.date)
  }
  return out
}

/** Live participants with no logged contact for `days` or more (or never). */
export function overdueContacts(ps: Participant[], log: LogEntry[], today: string, days = 2) {
  const last = lastContact(log)
  return ps
    .filter((p) => p.status === 'active' || p.status === 'paused')
    .map((p) => {
      const at = last.get(p.id) ?? null
      return { participantId: p.id, last: at, days: at === null ? null : daysBetween(at, today) }
    })
    .filter((c) => c.days === null || c.days >= days)
}

const SAMPLE_NOTES: [string, string][] = [
  ['Slept better two nights in a row; still wakes at 4am.', 'Try the wind-down chapter 30 min before bed.'],
  ['Skipped yesterday, busy at work. Wants shorter sessions.', 'Set length to 8 minutes in onboarding style.'],
  ['Said the voice feels rushed.', 'Pass to product team: voice pace.'],
  ['Felt calmer before the meeting; used it twice today.', 'Keep the morning time.'],
  ['Not sure what the next chapter is for.', 'Walk through "what the next chapter changes".'],
  ['Wearable shows longer deep sleep this week.', 'Ask about it in interview 2.'],
]

/** Deterministic sample contacts for the last week, for every live participant but a few. */
export function sampleLog(ps: Participant[], today: string): LogEntry[] {
  const out: LogEntry[] = []
  const end = Date.parse(`${today}T00:00:00Z`)
  ps.forEach((p, i) => {
    if (p.status !== 'active' && p.status !== 'paused') return
    // Every seventh person has not been reached for a while: the log should show that case too.
    const gap = i % 7 === 3 ? 4 : i % 3
    for (let k = 0; k < 2; k++) {
      const day = isoDay(end - (gap + k * 3) * 86_400_000)
      const [note, nextStep] = SAMPLE_NOTES[(i + k) % SAMPLE_NOTES.length]
      out.push({
        id: `sample-${p.id}-${k}`,
        participantId: p.id,
        date: day,
        channel: CHANNELS[(i + k) % 2],
        feeling: 2 + ((i + k) % 3),
        note,
        nextStep,
        escalate: p.phq9Alert && k === 0,
        sample: true,
      })
    }
  })
  return out
}
