import type { CoverKey } from './photos'
import type { SessionRecord } from './sessions'
import { SESSIONS } from './sessions'

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
 * Everyone who has published something, keyed by slug. Built from SESSIONS
 * rather than kept as its own list — a creator with no sessions has no profile
 * to show, and a second list would drift from the first.
 */
function collect() {
  const people = new Map<string, Person>()
  for (const session of SESSIONS) {
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

/** Undefined resolves to the signed-in user, so /profile keeps working. */
export function findPerson(slug: string | undefined): Person | undefined {
  if (!slug) return PEOPLE.get(CURRENT_USER_SLUG)
  return PEOPLE.get(slug)
}

/** Where a creator's name should link, from anywhere in the app. */
export function profilePath(author: string) {
  return author === CURRENT_USER ? '/profile' : `/profile/${personSlug(author)}`
}
