// Challenges — the community's shared, time-boxed programme.
//
// A challenge is not a session: it is a streak people join, ranked by days
// completed, with sessions created for it. Kept separate from the session
// catalogue for that reason, and linked to it by slug.

import type { CoverKey } from './photos'

export interface Contender {
  rank: number
  name: string
  photo: CoverKey
  /** Days completed — what the leaderboard is actually ranked by. */
  days: number
  /** ISO-ish date shown under the name on the ranked rows. */
  joined: string
  /** Movement since the last update; null for the podium, which has no arrow. */
  trend: 'up' | 'down' | null
}

export interface ChallengeRecord {
  slug: string
  title: string
  summary: string
  photo: CoverKey
  gradient: string
  joined: string
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
    endsInDays: 18,
    totalDays: 30,
    minutesPerDay: 8,
    yourDay: 6,
    leaderboard: [
      { rank: 1, name: 'Aria Moon', photo: 'creatorAria', days: 27, joined: '2026.1.14', trend: null },
      { rank: 2, name: 'Maya Rivers', photo: 'creatorMaya', days: 21, joined: '2026.1.19', trend: null },
      { rank: 3, name: 'Theo Waves', photo: 'creatorTheo', days: 19, joined: '2026.2.02', trend: null },
      { rank: 4, name: 'Amara Osei', photo: 'creatorAmara', days: 27, joined: '2026.2.23', trend: 'up' },
      { rank: 5, name: 'Jonas Weber', photo: 'creatorJonas', days: 21, joined: '2026.6.21', trend: 'down' },
      { rank: 6, name: 'Adam Nilson', photo: 'avatar', days: 19, joined: '2026.12.10', trend: 'up' },
    ],
    sessionSlugs: ['mind-dance', 'inner-balance'],
  },
]

export function findChallenge(slug: string | undefined) {
  return CHALLENGES.find((challenge) => challenge.slug === slug)
}
