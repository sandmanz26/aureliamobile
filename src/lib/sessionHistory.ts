/**
 * A session's history, read three ways (U037): its own versions, when it went
 * public, and the chain it was built from — each step saying *which version*
 * of the step before it was used.
 *
 * Mock, like everything in `lib/`, and derived rather than stored so it cannot
 * disagree with the screens that already show parts of it: the versions are
 * Progress's (`progressFor`), so the player, Progress and `?v=` links all name
 * the same cuts; the dates hang off the lineage dates so a session is never
 * published before it was created. Nothing here is a measurement.
 */
import type { CoverKey } from './photos'
import { progressFor } from './progress'
import type { SessionRecord } from './sessions'
import { isPublished, lineageDate } from './sessions'
import { CURRENT_USER, trustedCreators } from './people'

/** "2026.6.21" → Date, and back. The app's own date format, kept. */
function parse(date: string) {
  const [y, m, d] = date.split('.').map(Number)
  return new Date(y, m - 1, d)
}
function format(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
function addDays(date: string, days: number) {
  const next = parse(date)
  next.setDate(next.getDate() + days)
  return format(next)
}

/** When this session (the last lineage step) was made. */
export function createdOn(session: SessionRecord) {
  return lineageDate(session.lineage.length - 1)
}

export interface VersionEntry {
  /** Matches Progress's version ids, so `?v=` works the same everywhere. */
  id: string
  /** "v1.3" */
  label: string
  /** What this cut changed. */
  change: string
  date: string
  /** The cut listeners get. */
  live: boolean
}

/**
 * Newest first: the cuts Progress lists, plus the first one the session was
 * created as. The newest is what is live on a published session; a draft has
 * nothing live.
 */
export function versionHistory(session: SessionRecord): VersionEntry[] {
  const created = createdOn(session)
  const published = isPublished(session)
  const cuts = progressFor(session).versions
  const offsets = [30, 14]
  return [
    ...cuts.map((cut, i) => ({
      id: cut.id,
      label: cut.title.match(/v\d+\.\d+$/)?.[0] ?? cut.id,
      change: cut.chapter,
      date: addDays(created, offsets[i] ?? 7),
      live: published && i === 0,
    })),
    { id: 'v1', label: 'v1.0', change: 'First build', date: created, live: false },
  ]
}

/** Publish facts for the Details card. Null for a draft. */
export function publishInfo(session: SessionRecord) {
  if (!isPublished(session)) return null
  const history = versionHistory(session)
  const live = history.find((v) => v.live) ?? history[0]
  return { publishedOn: createdOn(session), updatedOn: live.date, liveVersion: live.label }
}

export interface LineageStep {
  title: string
  author: string
  date: string
  /** The version of the step before that this one was built from. */
  builtOn?: string
  /** This session itself (the last step). */
  self: boolean
}

/** The chain this session came from, oldest first, each step naming the
 *  version it was recreated from. */
export function lineageSteps(session: SessionRecord): LineageStep[] {
  const last = session.lineage.length - 1
  return session.lineage.map((step, index) => ({
    title: step.title,
    author: step.author,
    date: lineageDate(index),
    builtOn: index === 0 ? undefined : `${session.lineage[index - 1].title} v1.${Math.min(3, index + 1)}`,
    self: index === last,
  }))
}

export interface Recreation {
  title: string
  author: string
  photo: CoverKey
  date: string
  /** Which of this session's versions it was built from. */
  builtOn: string
}

/**
 * The other direction: people who rebuilt *this* session. The catalogue keeps
 * only ancestry, so these are illustrative — three recent ones from creators
 * other than the author, against the session's real "Recreated" count.
 */
export function recentRecreations(session: SessionRecord): Recreation[] {
  if (!isPublished(session)) return []
  const versions = versionHistory(session)
  return trustedCreators(12)
    .filter((person) => person.name !== session.author && person.name !== CURRENT_USER)
    .slice(0, 3)
    .map((person, i) => ({
      title: `${session.title} — ${['slower', 'no voice', 'rain bed'][i]}`,
      author: person.name,
      photo: person.photo,
      date: addDays(versions[0].date, -i * 3),
      builtOn: versions[Math.min(i, versions.length - 1)].label,
    }))
}

/** Whether the signed-in user made this session (and so sees its versions). */
export function isOwnSession(session: SessionRecord) {
  return session.author === CURRENT_USER
}
