import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import type { Recommendation } from '../components/chat/RecommendationCard'
import type { SessionRecord } from '../lib/sessions'
import { totalMinutes } from '../lib/sessions'

/** Delivery state, as a messaging app shows it: one tick sent, two ticks read. */
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
export function nextVersionLabel(label: string) {
  const match = /\s+v(\d+)(?:\.(\d+))?$/i.exec(label)
  if (!match) return `${label} v2`
  const base = label.slice(0, match.index)
  const major = Number(match[1])
  if (match[2] === undefined) return `${base} v${major + 1}`
  return `${base} v${major}.${Number(match[2]) + 1}`
}

/** How far back the thread's opening exchange is backdated. */
const BACKDATED = 9 * 60_000

interface ChatSessionValue {
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  applied: string[]
  setApplied: Dispatch<SetStateAction<string[]>>
  sessionState: SessionState
  setSessionState: Dispatch<SetStateAction<SessionState>>
  progress: number
  setProgress: Dispatch<SetStateAction<number>>
  deckOpen: boolean
  setDeckOpen: Dispatch<SetStateAction<boolean>>
  /** Which session the thread is about. Null is a new one. */
  sessionSlug: string | null
  /** What it is building, and where that goes when it is built. */
  draft: Draft
  setDraft: Dispatch<SetStateAction<Draft>>
  /** Every cut this thread has made, oldest first. */
  versions: DraftVersion[]
  /** Which of them the card, the transport and Publish are pointed at. Not
   *  always the newest — reverting moves it back without deleting anything. */
  currentVersionId: string | null
  /** Start a new cut. Called when a build starts rather than when it finishes,
   *  so the history can show the one being made. */
  addVersion: (change: string) => void
  /** Point the draft back at an earlier cut of this thread's own making. */
  revertTo: (id: string) => void
  /**
   * Point the draft at a named cut from anywhere — the Chapters tab lists the
   * catalogue's versions, which are not this thread's `versions` and carry
   * their own ids, so it cannot go through `revertTo`.
   */
  pointAt: (cut: { id: string; label: string; slug: string }) => void
  /** Open an existing session's conversation, already made. */
  openSession: (session: SessionRecord) => void
  /** Next message id. A function rather than the ref itself: handing out a
   *  ref invites callers to mutate a hook's return value. */
  nextMessageId: () => number
  /** Back to a starting thread — the demo conversation unless given one. */
  reset: (opening?: Message[]) => void
}

const ChatSessionContext = createContext<ChatSessionValue | null>(null)

/**
 * The version the demo thread opens with.
 *
 * [OPENING_MESSAGES] say "the sleep meditation we created", so one already
 * exists — history that started empty would contradict the first line of the
 * conversation. [DEFAULT_DRAFT] names it, and these two have to agree.
 */
function demoBaseline(): DraftVersion {
  return {
    id: 'v0',
    label: DEFAULT_DRAFT.title,
    change: 'The cut you have been listening to',
    at: Date.now() - BACKDATED,
    slug: DEFAULT_DRAFT.slug,
  }
}

/**
 * The cockpit thread, held above the router.
 *
 * A session being built is not screen state. Generating one, applying changes
 * and then going off to play it are three steps of the same task, and for a
 * while the second step was thrown away by the third: /chat unmounted on
 * navigation, its useState went with it, and coming back handed the user a
 * fresh conversation with nothing to publish.
 *
 * In memory rather than storage, which matches how the rest of the app treats
 * a visit: it survives moving around the product, and a reload starts over.
 * When there is a backend this is what a draft session persists into.
 */
export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(OPENING_MESSAGES)
  const [applied, setApplied] = useState<string[]>(RECOMMENDATIONS.map((item) => item.id))
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [progress, setProgress] = useState(0)
  const [deckOpen, setDeckOpen] = useState(false)
  const [sessionSlug, setSessionSlug] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [versions, setVersions] = useState<DraftVersion[]>(() => [demoBaseline()])
  const [currentVersionId, setCurrentVersionId] = useState<string | null>('v0')
  const nextId = useRef(OPENING_MESSAGES.length + 1)
  const nextVersionNo = useRef(1)
  const nextMessageId = useCallback(() => nextId.current++, [])

  /**
   * Records the cut a build is making.
   *
   * The label comes off the newest version rather than the current one: revert
   * to v1.2 with a v1.4 in the list and the next change is v1.5, not a second
   * v1.3. History stays a list rather than a tree, which is the right shape for
   * a demo and the only one a single card can point at honestly.
   *
   * With nothing in the list the draft's own name is the first cut — a Quick
   * Start arrives as v1.0 and that *is* the version, not the thing before it.
   */
  const addVersion = useCallback(
    (change: string) => {
      const label = versions.length ? nextVersionLabel(versions[versions.length - 1].label) : draft.title
      const id = `v${nextVersionNo.current++}`
      setVersions((list) => [...list, { id, label, change, at: Date.now(), slug: draft.slug }])
      setCurrentVersionId(id)
      setDraft((current) => ({ ...current, title: label }))
    },
    [versions, draft],
  )

  const pointAt = useCallback((cut: { id: string; label: string; slug: string }) => {
    setCurrentVersionId(cut.id)
    setDraft({ title: cut.label, slug: cut.slug })
  }, [])

  const revertTo = useCallback(
    (id: string) => {
      const version = versions.find((item) => item.id === id)
      if (!version) return
      pointAt({ id, label: version.label, slug: version.slug })
    },
    [versions, pointAt],
  )

  /**
   * Opening the session you are already in is a no-op, and that is the whole
   * point: you go off to play it, or to its creator's profile, and coming back
   * returns the thread exactly as you left it rather than rebuilding it under
   * you. Same bargain as `load()` on the audio player.
   */
  const openSession = useCallback((session: SessionRecord) => {
    setSessionSlug((current) => {
      if (current === session.slug) return current
      const opening = messagesForSession(session)
      setMessages(opening)
      setApplied(RECOMMENDATIONS.map((item) => item.id))
      setSessionState('idle')
      setProgress(0)
      // Laid open, not folded. A folded deck is Aurelia handing over a
      // proposal; this session exists, so its changes are what you came to
      // look at.
      setDeckOpen(true)
      // What the cockpit is working on *is* this session now, so the progress
      // card and Ready to play follow it rather than a literal.
      setDraft({ title: session.title, slug: session.slug })
      // A session you can open is a cut that already exists, so history starts
      // with it rather than empty; the next build is its v2.
      setVersions([
        {
          id: 'v0',
          label: session.title,
          change: session.published === false ? 'Built, not published yet' : 'The published cut',
          at: Date.now() - BACKDATED,
          slug: session.slug,
        },
      ])
      setCurrentVersionId('v0')
      nextVersionNo.current = 1
      nextId.current = opening.length + 1
      return session.slug
    })
  }, [])

  /**
   * Put the thread back to a starting state.
   *
   * With nothing passed it opens on the demo conversation, which is what "New
   * session" means: a cockpit with an empty scroll is a worse first screen
   * than one already mid-conversation, and [DEFAULT_DRAFT] names the session
   * those messages are about — the two have to agree.
   *
   * The entry points that write their own opening — a Quick Start card, a
   * Recreate — pass it here rather than clearing and then setting, so the
   * thread never renders somebody else's conversation on the way to theirs.
   */
  const reset = useCallback((opening: Message[] = OPENING_MESSAGES) => {
    setMessages(opening)
    setApplied(RECOMMENDATIONS.map((item) => item.id))
    setSessionState('idle')
    setProgress(0)
    setDeckOpen(false)
    setSessionSlug(null)
    setDraft(DEFAULT_DRAFT)
    // A door that writes its own opening is starting something that does not
    // exist yet, so it has no history; the demo thread's does, because its
    // first line says so.
    const own = opening !== OPENING_MESSAGES
    setVersions(own ? [] : [demoBaseline()])
    setCurrentVersionId(own ? null : 'v0')
    nextVersionNo.current = 1
    nextId.current = opening.length + 1
  }, [])

  const value = useMemo<ChatSessionValue>(
    () => ({
      messages, setMessages,
      applied, setApplied,
      sessionState, setSessionState,
      progress, setProgress,
      deckOpen, setDeckOpen,
      sessionSlug, openSession,
      draft, setDraft,
      versions, currentVersionId, addVersion, revertTo, pointAt,
      nextMessageId,
      reset,
    }),
    [
      messages, applied, sessionState, progress, deckOpen, sessionSlug, openSession, draft,
      versions, currentVersionId, addVersion, revertTo, pointAt, nextMessageId, reset,
    ],
  )

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>
}

export function useChatSession() {
  const context = useContext(ChatSessionContext)
  if (!context) throw new Error('useChatSession must be used inside ChatSessionProvider')
  return context
}
