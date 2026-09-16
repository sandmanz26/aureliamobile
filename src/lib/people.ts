import type { CoverKey } from './photos'
import type { SessionRecord } from './sessions'
import { PUBLISHED_SESSIONS } from './sessions'

/**
 * Who is signed in. One string, in one place: "is this mine?" was being
 * answered by comparing against a name literal repeated across the profile
 * page, the notification feed and the challenge board, which is how a rename
 * turns into three bugs.
 *
 * When there is a backend this becomes the account on the session token.
 */
export const CURRENT_USER = 'Adam Nilson'

/** A creator, assembled from what they have published. */
export interface Person {
  name: string
  slug: string
  photo: CoverKey
  role: string
  sessions: SessionRecord[]
  /** True for the signed-in user, which is what decides own-profile chrome. */
  isSelf: boolean
}

export function personSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const CURRENT_USER_SLUG = personSlug(CURRENT_USER)

/**
 * Everyone who has published something, keyed by slug. Built from the
 * published catalogue — a draft is not published work, and a creator's role
 * line counts published sessions
 * rather than kept as its own list — a creator with no sessions has no profile
 * to show, and a second list would drift from the first.
 */
function collect() {
  const people = new Map<string, Person>()
  for (const session of PUBLISHED_SESSIONS) {
    const slug = personSlug(session.author)
    const existing = people.get(slug)
    if (existing) {
      existing.sessions.push(session)
      continue
    }
    people.set(slug, {
      name: session.author,
      slug,
      photo: session.authorPhoto,
      role: session.authorRole,
      sessions: [session],
      isSelf: session.author === CURRENT_USER,
    })
  }
  return people
}

const PEOPLE = collect()

/**
 * Other people's creators, most published first — Explore's "Trusted Creators".
 *
 * Built from the catalogue rather than listed by hand. The shelf used to name
 * four people of whom two, Daniel Carter and Maya Bennett, were in no session
 * at all: tapping them could only ever go nowhere, and the session counts
 * beside them were invented rather than counted.
 *
 * You are left out. A shelf of creators to discover that leads with yourself
 * is not a shelf of creators to discover.
 */
export function trustedCreators(limit = 8): Person[] {
  return [...PEOPLE.values()]
    .filter((person) => !person.isSelf)
    .sort((a, b) => b.sessions.length - a.sessions.length || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/** Undefined resolves to the signed-in user, so /profile keeps working. */
export function findPerson(slug: string | undefined): Person | undefined {
  if (!slug) return PEOPLE.get(CURRENT_USER_SLUG)
  return PEOPLE.get(slug)
}

/**
 * How a screen was reached, when that changes whose work it is showing.
 *
 * The author answers "whose session is this" for anything in the catalogue.
 * It cannot answer it for a session the user has just built in the cockpit —
 * that one has no catalogue entry and borrows a slug to play against — so the
 * entry point says so directly rather than being guessed at.
 */
export type ProfileOrigin = 'own' | 'community'

/** Where a creator's name should link, from anywhere in the app. */
export function profilePath(author: string, origin?: ProfileOrigin) {
  if (origin === 'own') return '/profile'
  if (origin === 'community') return `/profile/${personSlug(author)}`
  return author === CURRENT_USER ? '/profile' : `/profile/${personSlug(author)}`
}
