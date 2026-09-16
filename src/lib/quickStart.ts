import type { CoverKey } from './photos'
import { findSession } from './sessions'

/**
 * The kinds of session you can start from scratch — Explore's "Quick Start".
 *
 * Each of these is a real entry point, not a picture: pressing Create opens
 * the cockpit on *this* kind of session, with Aurelia's opening line about it,
 * and what gets built carries its name. Two cards that both dropped you into
 * the same generic thread was the bug this file exists to prevent — you tapped
 * Affirmations and Aurelia asked about a sleep meditation.
 *
 * `plays` is the catalogue session the finished thing stands in for. Nothing is
 * really generated, so the player has to open on *something*, and it must be
 * something of the same kind: opening a sleep session after asking for a focus
 * session is the same bug wearing a different hat.
 */
export interface QuickStart {
  id: string
  title: string
  subtitle: string
  photo: CoverKey
  gradient: string
  /** One of the catalogue's categories, so the kind is a real kind. */
  category: string
  /** What Aurelia says first. Specific to this card, and the whole point. */
  opening: string
  /** The prompt under it, which is what the user is being asked. */
  ask: string
  /** The catalogue session the built version stands in for. */
  plays: string
}

export const QUICK_STARTS: QuickStart[] = [
  {
    id: 'affirmations',
    title: 'Affirmations',
    subtitle: 'Personalized exprience.',
    photo: 'affirmations',
    gradient: 'linear-gradient(160deg, var(--color-danger-400), var(--color-warning-300))',
    category: 'Meditations',
    opening:
      'Affirmations, then. These work best in your own words rather than mine — the ones people keep are the ones that sound like something they would actually say.',
    ask: 'What would you like to hear yourself say?',
    plays: 'noting-practice',
  },
  {
    id: 'sleep-meditation',
    title: 'Sleep Meditation',
    subtitle: 'Personalized exprience.',
    photo: 'sleep',
    gradient: 'linear-gradient(160deg, var(--color-neutral-700), var(--color-neutral-400))',
    category: 'Sleep',
    opening:
      'A sleep meditation. Your last week averaged 6h 40m with the light sleep sitting high, so I would keep this one slow and end it without a chime.',
    ask: 'How long do you want it, and should I speak at all?',
    plays: 'night-rain-sleep',
  },
  {
    id: 'focus',
    title: 'Focus Session',
    subtitle: 'Long, and nothing to listen to.',
    photo: 'neural',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-300))',
    category: 'Music',
    opening:
      'A focus session. The rule here is that it must be uninteresting — anything you notice is something you stopped working for.',
    ask: 'How long is the block you are trying to fill?',
    plays: 'clear-skies',
  },
  {
    id: 'morning-energy',
    title: 'Morning Energy',
    subtitle: 'A climb, not a jolt.',
    photo: 'morning',
    gradient: 'linear-gradient(160deg, var(--color-warning-300), var(--color-primary-200))',
    category: 'Energy',
    opening:
      'Morning energy. I build these as a climb rather than a jolt — the fast ones wake you up and then drop you an hour later.',
    ask: 'How long have you got before you need to be somewhere?',
    plays: 'morning-spark',
  },
  {
    id: 'stress-relief',
    title: 'Stress Relief',
    subtitle: 'For the hour after work.',
    photo: 'stress',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-400))',
    category: 'Calm',
    opening:
      'Stress relief. The hour after work is the one that responds best, because the body is still braced for something that is no longer coming.',
    ask: 'What does the stress feel like today — wound up, or worn out?',
    plays: 'dolphins-frequency',
  },
  {
    id: 'deep-rest',
    title: 'Deep Rest',
    subtitle: 'For a day off, not a night.',
    photo: 'water',
    gradient: 'linear-gradient(160deg, var(--color-blue-800), var(--color-blue-300))',
    category: 'Sleep',
    opening:
      'Deep rest, which is not the same as sleep — this one is for lying down in the afternoon and getting up again afterwards.',
    ask: 'Do you want to come back out of it gently, or on time?',
    plays: 'dream-drift',
  },
]

export function findQuickStart(id: string | undefined) {
  return QUICK_STARTS.find((card) => card.id === id)
}

/**
 * The name the cockpit gives what it is building from this card.
 *
 * v1.0 because a quick start is the first cut of something — a recreate makes
 * a v2 of somebody else's, and those are different things to be looking at on
 * the progress card.
 */
export function draftTitleFor(card: QuickStart) {
  return `${card.title} v1.0`
}

/** Guards the stand-in: a card pointing at a slug that no longer exists would
 *  send the player nowhere, and that is the one failure worth being loud about
 *  in development. */
export function standInFor(card: QuickStart) {
  const session = findSession(card.plays)
  if (!session && import.meta.env.DEV) {
    console.warn(`Quick Start "${card.id}" points at a missing session: ${card.plays}`)
  }
  return session
}
