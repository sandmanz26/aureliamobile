import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { SessionRecord } from '../lib/sessions'
import { isPublished } from '../lib/sessions'
import { useAudioPlayer } from '../audio/AudioPlayerContext'

/** Delivery state, as a messaging app shows it: one tick sent, two ticks read. */
import { DEFAULT_DRAFT, OPENING_MESSAGES, RECOMMENDATIONS, messagesForSession, nextVersionLabel, sessionNameOf } from './thread'
import type { Draft, DraftVersion, Message, SessionState } from './thread'

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
  addVersion: (change: string) => { versionId: string; label: string; slug: string }
  /**
   * The cut that is live, or null if this thread has never published.
   *
   * Compared against `currentVersionId` it answers the only question the
   * Publish control needs: nothing published yet, published and unchanged, or
   * published and moved on since.
   */
  publishedVersionId: string | null
  /** Called when the publish sheet finishes: what is live is what is current. */
  markPublished: () => void
  /** Taken down. Nothing is live, so the thread offers Publish again. */
  markUnpublished: () => void
  /** Point the draft back at an earlier cut of this thread's own making. */
  revertTo: (id: string) => void
  /**
   * Point the draft at a named cut from anywhere — the Chapters tab lists the
   * catalogue's versions, which are not this thread's `versions` and carry
   * their own ids, so it cannot go through `revertTo`.
   */
  pointAt: (cut: { id: string; label: string; slug: string }) => void
  /** Rename the session: every cut keeps its own version, under the new name. */
  renameSession: (name: string) => void
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
  const { stop } = useAudioPlayer()
  const [messages, setMessages] = useState<Message[]>(OPENING_MESSAGES)
  // What is live. Seeded per thread: a catalogue session that is already out
  // in the world opens on the cut people can hear, a draft on nothing.
  const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null)
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
      return { versionId: id, label, slug: draft.slug }
    },
    [versions, draft],
  )

  const renameSession = useCallback((name: string) => {
    const renamed = (label: string) => name + label.slice(sessionNameOf(label).length)
    setVersions((list) => list.map((v) => ({ ...v, label: renamed(v.label) })))
    setDraft((current) => ({ ...current, title: renamed(current.title) }))
  }, [])

  const markPublished = useCallback(() => {
    setPublishedVersionId((current) => currentVersionId ?? current)
  }, [currentVersionId])

  const markUnpublished = useCallback(() => {
    setPublishedVersionId(null)
  }, [])

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
      // Same reason as reset(): the header must not keep announcing the
      // session you were on before this one.
      stop()
      // 'v0' is the baseline this sets below. A published session opens with
      // that cut live, so Publish stays hidden until something is built; a
      // draft opens with nothing live, so it offers Publish.
      setPublishedVersionId(isPublished(session) ? 'v0' : null)
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
  }, [stop])

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
    // The cockpit's mini player names "the session running in this
    // conversation", and it is driven by the audio player rather than by the
    // thread — so a track loaded before this thread existed kept sitting in
    // the header. Recreate "Soft Reset" while Sleep meditation was loaded and
    // the sticky card read Sleep meditation, over a thread plainly about
    // something else. Clearing it here rather than at the three doors that
    // call reset(), so a fourth door cannot forget.
    stop()
    setPublishedVersionId(null)
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
  }, [stop])

  const value = useMemo<ChatSessionValue>(
    () => ({
      messages, setMessages,
      applied, setApplied,
      sessionState, setSessionState,
      progress, setProgress,
      deckOpen, setDeckOpen,
      sessionSlug, openSession,
      draft, setDraft,
      versions, currentVersionId, publishedVersionId, markPublished, markUnpublished, addVersion, revertTo, pointAt, renameSession,
      nextMessageId,
      reset,
    }),
    [
      messages, applied, sessionState, progress, deckOpen, sessionSlug, openSession, draft,
      versions, currentVersionId, publishedVersionId, markPublished, markUnpublished, addVersion, revertTo, pointAt, renameSession, nextMessageId, reset,
    ],
  )

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>
}

export function useChatSession() {
  const context = useContext(ChatSessionContext)
  if (!context) throw new Error('useChatSession must be used inside ChatSessionProvider')
  return context
}
