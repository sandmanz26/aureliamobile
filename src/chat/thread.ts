import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import type { Recommendation } from '../components/chat/RecommendationCard'
import type { SessionRecord } from '../lib/sessions'
import { totalMinutes } from '../lib/sessions'

// The cockpit thread's data — message shapes, the demo opening, the
// recommendation deck, drafts and version labels. Pure (no React), so it can
// be unit-tested and imported anywhere; ChatSessionContext holds the state.

export type Status = 'sending' | 'sent' | 'read'

export interface Message {
  id: number
  from: 'aurelia' | 'user'
  text: string
  /** Epoch ms — drives the timestamps and the grouping windows. */
  at: number
  /** Voice notes render as a player with the transcript under it. */
  voice?: { durationMs: number }
  status?: Status
  /**
   * Something that came with this message rather than after it. It belongs to
   * the message, not to the end of the thread, so everything said afterwards
   * comes after it.
   *
   * `recommendations` is Aurelia's deck. A `{ session }` is the original a
   * fork is being made from — attached by the profile's Recreate, so the
   * cockpit opens showing the thing it is about instead of only naming it.
   */
  attachment?: 'recommendations' | { session: string }
  /**
   * Questions offered under this message, each a tap away from being sent.
   *
   * Separate from `attachment` because it is not one thing but a list, and
   * because tapping one sends it as your next message rather than opening
   * anything.
   */
  prompts?: string[]
  /**
   * The message this one answers (U036) — set when the user swipes or taps
   * Reply on a line, so an edit names exactly what it is about ("make *this*
   * part slower") instead of the whole session. A copy, not a pointer: the
   * quote must still read right if the thread is reset under it.
   */
  replyTo?: { id: number; from: 'aurelia' | 'user'; text: string }
  /**
   * The build this message announced (U038, design v3): the version it made,
   * so the thread can keep each result where it happened — apply three times,
   * see three versions — instead of one card at the bottom that renames
   * itself.
   */
  build?: { versionId: string; label: string; slug: string }
}

/** The thread opens mid-conversation, so the first messages are backdated. */
const START = Date.now() - 9 * 60_000

export const OPENING_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'aurelia',
    at: START,
    text: 'Good morning, Adam.\n\nLooks like you had a good sleep last night, score improved by 7% due to increased REM sleep.',
  },
  { id: 2, from: 'aurelia', at: START + 4_000, text: 'How did you find the sleep meditation we created?' },
  {
    id: 3,
    from: 'user',
    at: START + 96_000,
    text: 'It was good, but it was to short, I had to repeat it multiple times.',
    status: 'read',
  },
  {
    id: 4,
    from: 'aurelia',
    at: START + 104_000,
    text: 'Based on the diagnosis and your feedback, this is what I’d would recommend:',
    attachment: 'recommendations',
  },
]

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'yellow',
    title: 'Increase yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '12%',
    orb: orbIncreaseYellow,
    preview: 'dolphins-frequency',
  },
  {
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '12%',
    orb: orbLessMovement,
    preview: 'deep-grounding',
  },
  {
    id: 'frequency',
    title: '432Hz',
    description: 'Your body responds positively to this frequency.',
    improveScore: '12%',
    orb: orb432hz,
    preview: '528-hz-reset',
  },
]

/**
 * The thread for a session that has already been made.
 *
 * A row in Sessions is not a prompt, it is a finished thing: opening one has
 * to land you in the conversation that produced it, about that session, with
 * its changes already on the table.
 *
 * There are three ways into the cockpit and they are not the same room:
 *
 * - **A new session** — `/chat` with no slug. An empty thread; the prompts do
 *   the talking. `reset()` puts it here.
 * - **A session you have made and not published** — a draft. It exists, you
 *   can play it, and nobody else can. There are no figures to report because
 *   nobody has played it, so Aurelia talks about what is still wrong with it
 *   instead, and publishing is the obvious next move.
 * - **A session that is out** — published. Now there are figures, and the
 *   conversation is about changing something that people are already using.
 *
 * Only Aurelia's lines carry the session; the rest of the exchange is the
 * demo's own texture and stays put.
 */
export function messagesForSession(session: SessionRecord): Message[] {
  const start = Date.now() - 9 * 60_000
  const outcome = session.outcome[0]
  const draft = session.published === false

  const opening = draft
    ? `Good morning, Adam.\n\n“${session.title}” is built — ${totalMinutes(session)} minutes, ` +
      `${session.layers.length} layers — and still yours only. Nobody has played it, ` +
      `so there is nothing to report back yet.`
    : `Good morning, Adam.\n\n“${session.title}” is built and running — ` +
      `${totalMinutes(session)} minutes, by ${session.author}` +
      (outcome ? `, and people report ${outcome.label.toLowerCase()} ${outcome.value}.` : '.')

  return [
    { id: 1, from: 'aurelia', at: start, text: opening },
    {
      id: 2,
      from: 'aurelia',
      at: start + 4_000,
      text: draft
        ? 'Anything you want to change before it goes out?'
        : `How did you find ${session.title}?`,
    },
    {
      id: 3,
      from: 'user',
      at: start + 96_000,
      text: draft
        ? 'The ending is still too bright. Everything before it is right.'
        : 'It was good, but it was to short, I had to repeat it multiple times.',
      status: 'read',
    },
    {
      id: 4,
      from: 'aurelia',
      at: start + 104_000,
      text: 'Based on the diagnosis and your feedback, this is what I’d would recommend:',
      attachment: 'recommendations',
    },
  ]
}

export type SessionState = 'idle' | 'updating' | 'generating' | 'ready'

/**
 * What this thread is building.
 *
 * The cockpit used to name one session in three places regardless of what you
 * had asked for — the progress card said "Sleep meditation v1.2", Ready to
 * play opened dolphins-frequency, and Publish viewed it. So every entry point
 * led to the same session: you tapped Affirmations and got a sleep meditation.
 * Whatever puts you in the thread sets this instead.
 */
export interface Draft {
  /** As the progress card names it while it is being built. */
  title: string
  /**
   * The catalogue session it stands in for. Nothing is really generated, so
   * "Ready to play" has to open *something* — and it has to be something of
   * the same kind, or the mismatch just moves one screen later.
   */
  slug: string
}

/**
 * The blank cockpit's draft. It matches [OPENING_MESSAGES], which are about a
 * sleep meditation — those two have to agree, and they are the only pair here
 * that is allowed to be a literal.
 */
export const DEFAULT_DRAFT: Draft = {
  title: 'Sleep meditation v1.2',
  slug: 'dolphins-frequency',
}

/**
 * One cut of the draft, and what produced it.
 *
 * Generating is not a state the session passes through on its way back to the
 * same thing: every build is a new version of it, and the one before still
 * exists. Without somewhere to keep them, asking for a female voice and then
 * regretting it left nothing to go back to — and the thread, which is the only
 * record, does not play.
 */
export interface DraftVersion {
  id: string
  /** As the progress card and the history name it. */
  label: string
  /** What produced it, in the user's own words. */
  change: string
  at: number
  /** The catalogue session this cut stands in for. */
  slug: string
}

/** The label the next build takes. Bumps the minor where there is one —
 *  v1.2 to v1.3 — the major where there is not, and starts a v2 where the
 *  name carries no version at all, which is what a published session's does. */
/**
 * The session's name without its version: "Sleep meditation v1.3" →
 * "Sleep meditation". Renaming edits this part only (U041) — the version is
 * what each build sets, so a person never types it and cannot break it.
 */
export function sessionNameOf(label: string) {
  const match = /\s+v(\d+)(?:\.(\d+))?$/i.exec(label)
  return match ? label.slice(0, match.index) : label
}

export function nextVersionLabel(label: string) {
  const match = /\s+v(\d+)(?:\.(\d+))?$/i.exec(label)
  if (!match) return `${label} v2`
  const base = label.slice(0, match.index)
  const major = Number(match[1])
  if (match[2] === undefined) return `${base} v${major + 1}`
  return `${base} v${major}.${Number(match[2]) + 1}`
}

/** How far back the thread's opening exchange is backdated. */
