// Admin-side challenge records. Seeded from the same catalogue the consumer
// app reads (src/lib/challenges.ts) so a challenge an admin edits is the one
// a member actually sees — not a parallel shape that could drift from it.
//
// Like the rest of src/admin/, there is no backend: edits live in the
// page's own React state and are gone on reload, same as a role change on
// Users or an unpublish on Sessions. That is consistent with this panel's
// other pages, not a shortcut specific to this one.

import { CHALLENGES } from '../../lib/challenges'
import type { ChallengeRecord, Reward } from '../../lib/challenges'

export type { ChallengeRecord, Reward }

export type ChallengeStatus = 'upcoming' | 'active' | 'closed'

export function challengeStatus(challenge: ChallengeRecord): ChallengeStatus {
  if (challenge.endsInDays <= 0) return 'closed'
  if (challenge.joined === '0') return 'upcoming'
  return 'active'
}

/** A curated subset of src/lib/photos.ts's CoverKey — enough variety for a
 *  challenge hero without exposing the creator-portrait keys that belong to
 *  leaderboard entries, not to the challenge itself. */
export const CHALLENGE_PHOTOS = [
  'neural', 'water', 'morning', 'forest', 'calm', 'mountains',
  'cosmic', 'bloom', 'glow', 'stress', 'sleep', 'dolphins',
] as const

export const GRADIENT_PRESETS: { label: string; value: string }[] = [
  { label: 'Espresso → amber', value: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-warning-700))' },
  { label: 'Espresso → info blue', value: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-info-700))' },
  { label: 'Espresso → warm gold', value: 'linear-gradient(160deg, var(--color-espresso-900), var(--color-warning-500))' },
  { label: 'Espresso → coral', value: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-danger-600))' },
  { label: 'Espresso → teal', value: 'linear-gradient(160deg, var(--color-espresso-950), var(--color-success-600))' },
]

export function emptyChallenge(): ChallengeRecord {
  return {
    slug: '',
    title: '',
    summary: '',
    photo: 'neural',
    gradient: GRADIENT_PRESETS[0].value,
    joined: '0',
    points: 100,
    endsInDays: 14,
    totalDays: 14,
    minutesPerDay: 5,
    yourDay: null,
    leaderboard: [],
    sessionSlugs: [],
    rewards: [
      { rank: 1, coins: 3000, prize: '3 months of premium plan' },
      { rank: 2, coins: 1500, prize: '1 month of premium plan' },
      { rank: 3, coins: 750, prize: '2 weeks of premium plan' },
    ],
  }
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'challenge'
}

export function withRewardAt(rewards: Reward[], rank: number, patch: Partial<Reward>): Reward[] {
  return rewards.map((reward) => (reward.rank === rank ? { ...reward, ...patch } : reward))
}

/** Deep-enough copy for admin edit state — the leaderboard and rewards
 *  arrays must not be the same references as the seed data, or editing one
 *  challenge's rewards would mutate src/lib/challenges.ts's own array. */
export function cloneChallenges(): ChallengeRecord[] {
  return CHALLENGES.map((challenge) => ({
    ...challenge,
    leaderboard: challenge.leaderboard.map((entry) => ({ ...entry })),
    sessionSlugs: [...challenge.sessionSlugs],
    rewards: challenge.rewards.map((reward) => ({ ...reward })),
  }))
}
