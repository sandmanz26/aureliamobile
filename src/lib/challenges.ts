// Challenges — the community's shared, time-boxed programme.
//
// A challenge is not a session: it is a streak people join, ranked by days
// completed, with sessions created for it. Kept separate from the session
// catalogue for that reason, and linked to it by slug.

import type { CoverKey } from './photos'

/**
 * One entry on a challenge leaderboard.
 *
 * The board ranks *sessions made for the challenge*, not the people in it —
 * so what competes is the work, and the creator is credited beside it. The
 * session is a slug into the catalogue, so a title or cover can never drift
 * from the session it names; the creator lives on the entry because a
 * challenge entry is someone's own take on that session, not its original.
 */
export interface Contender {
  rank: number
  sessionSlug: string
  creator: string
  creatorPhoto: CoverKey
  /** Plays — what the board is ranked by. */
  plays: string
  /** Movement since the last update; null on the podium, which has no arrow. */
  trend: 'up' | 'down' | null
}

export interface ChallengeRecord {
  slug: string
  title: string
  summary: string
  photo: CoverKey
  gradient: string
  joined: string
  /** What finishing it is worth, in coins. Explore had this hard-coded. */
  points: number
  endsInDays: number
  totalDays: number
  minutesPerDay: number
  /** Where the current user stands, or null if they have not joined. */
  yourDay: number | null
  /** Ranked, best first. The first three render as the podium. */
  leaderboard: Contender[]
  /** Sessions made for this challenge, by slug. */
  sessionSlugs: string[]
}

export const CHALLENGES: ChallengeRecord[] = [
  {
    slug: 'nervous-system-reset',
    title: '30-Day Nervous System Reset',
    summary: 'Slow down and build a calmer daily rhythm.',
    photo: 'neural',
    gradient: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-warning-700))',
    joined: '2.3k',
    points: 250,
    endsInDays: 18,
    totalDays: 30,
    minutesPerDay: 8,
    yourDay: 6,
    leaderboard: [
      { rank: 1, sessionSlug: 'dolphins-frequency', creator: 'Aria Moon', creatorPhoto: 'creatorAria', plays: '12,687', trend: null },
      { rank: 2, sessionSlug: 'deep-grounding', creator: 'Maya Rivers', creatorPhoto: 'creatorMaya', plays: '11,234', trend: null },
      { rank: 3, sessionSlug: 'cosmic-flow', creator: 'Theo Waves', creatorPhoto: 'creatorTheo', plays: '10,052', trend: null },
      { rank: 4, sessionSlug: 'ocean-breath', creator: 'Amara Osei', creatorPhoto: 'creatorAmara', plays: '9,564', trend: 'up' },
      { rank: 5, sessionSlug: 'golden-hour', creator: 'Jonas Weber', creatorPhoto: 'creatorJonas', plays: '9,123', trend: 'down' },
      { rank: 6, sessionSlug: 'dream-drift', creator: 'Adam Nilson', creatorPhoto: 'avatar', plays: '8,761', trend: 'up' },
    ],
    sessionSlugs: ['mind-dance', 'inner-balance'],
  },
  {
    /**
     * Just opened, and deliberately empty.
     *
     * Every other list in this catalogue is populated, which makes the app
     * pleasant to demo and useless for judging what a challenge looks like on
     * day one — nobody has joined, nothing has been made for it, and there is
     * no board to rank. That is the state a real challenge spends its first
     * hours in, and the one the product has to be honest in.
     */
    slug: 'morning-light',
    title: '14-Day Morning Light',
    summary: 'Start earlier, and let the day settle itself.',
    photo: 'morning',
    gradient: 'linear-gradient(160deg, var(--color-espresso-900), var(--color-warning-500))',
    joined: '0',
    points: 150,
    endsInDays: 14,
    totalDays: 14,
    minutesPerDay: 6,
    yourDay: null,
    leaderboard: [],
    sessionSlugs: [],
  },
]

export function findChallenge(slug: string | undefined) {
  return CHALLENGES.find((challenge) => challenge.slug === slug)
}
