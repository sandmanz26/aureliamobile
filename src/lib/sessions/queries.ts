// Everything that reads or changes the catalogue — as opposed to the
// catalogue itself, in `./data`. Split out so this file stays short enough
// to read in one sitting: these are the functions a real backend replaces.

import type { CategoryFilter, SessionRecord, Shelf } from './data'
import { SESSIONS } from './data'

/**
 * Sessions published in this browser, since the catalogue is a module constant.
 *
 * `published: false` is a draft's *starting* state, not a permanent fact — the
 * whole point of the Publish sheet is to change it. There was nowhere to record
 * that, so pressing Publish moved a sheet and nothing else: Social Impact stayed
 * on its empty state for good, and the Sessions list went on calling a published
 * session "Not Published".
 *
 * In memory like everything else this demo remembers: it survives moving around
 * the product, and a reload starts over.
 */
const publishedHere = new Map<string, boolean>()

export function publishSession(slug: string) {
  publishedHere.set(slug, true)
}

/**
 * Taken back out of the world.
 *
 * A map rather than a set of the published, because this has to answer for a
 * catalogue session too: pulling one that shipped published means recording
 * `false` over it, which a set of slugs cannot express.
 */
export function unpublishSession(slug: string) {
  publishedHere.set(slug, false)
}

/** Out in the world. A draft is built and has not been published. */
export function isPublished(session: SessionRecord) {
  return publishedHere.get(session.slug) ?? session.published !== false
}

/**
 * The catalogue as everyone else sees it.
 *
 * Every public surface goes through this: shelves, categories, the creator
 * index. A draft is yours and only shows where it is yours — the Sessions
 * screen under "Created by you".
 */
export const PUBLISHED_SESSIONS = SESSIONS.filter(isPublished)

/**
 * The threads you were last in — the drawer's "Latest".
 *
 * There are no timestamps in the catalogue and no history to read, so this is
 * a fixed set rather than a computed one. What matters is that every entry is
 * a real session: the drawer used to list three titles — Sleep Meditation,
 * Morning Mindfulness, Stress relief techniques — that matched nothing, so the
 * one shelf whose whole job is "take me back to that conversation" could not
 * take you anywhere.
 *
 * The three kept here stand in for those three: a sleep one, a morning one,
 * and the one about stress.
 */
const RECENT_SLUGS = ['night-rain-sleep', 'morning-spark', 'dolphins-frequency']

export function recentSessions(): SessionRecord[] {
  return RECENT_SLUGS.map((slug) => findSession(slug)).filter(
    (session): session is SessionRecord => session !== undefined,
  )
}

export function findSession(slug: string | undefined) {
  return SESSIONS.find((session) => session.slug === slug)
}

export function sessionsOnShelf(shelf: Shelf, category: CategoryFilter = 'All') {
  return PUBLISHED_SESSIONS.filter(
    (session) =>
      session.shelves.includes(shelf) && (category === 'All' || session.category === category),
  )
}

/** The same filter over the whole catalogue, for surfaces that aren't a shelf. */
export function sessionsInCategory(category: CategoryFilter = 'All') {
  return category === 'All'
    ? PUBLISHED_SESSIONS
    : PUBLISHED_SESSIONS.filter((session) => session.category === category)
}

export function totalMinutes(session: SessionRecord) {
  return session.chapters.reduce((sum, chapter) => sum + chapter.minutes, 0)
}

/**
 * The date on a lineage row, e.g. "Created by Adam Nilson, 2026.2.23".
 *
 * There is no real timestamp behind a lineage step, on any session — the
 * catalogue only says the order forks happened in, not when. The three fixed
 * dates were already invented once for Progress's own Lineage Tree; kept
 * here as the one place both readings draw from, rather than re-invented per
 * session.
 */
export function lineageDate(index: number) {
  return ['2026.2.23', '2026.6.21', '2026.12.10'][index] ?? '2026.6.21'
}

/** The frame's duration format — 12:22, not "12 min". */
export function durationLabel(session: SessionRecord) {
  return `${totalMinutes(session)}:${String(session.seconds ?? 0).padStart(2, '0')}`
}

/**
 * Whether this session is somebody else's work, forked and changed.
 *
 * Every session opens on an Aurelia starter template, so a two-step lineage is
 * an original: template, then this author. A third step means a person stood
 * between them — which is exactly what recreating is, clone and modify, and
 * the only honest way to tell the two apart from the data we hold.
 */
export function isRecreated(session: SessionRecord) {
  return session.lineage.length > 2
}
