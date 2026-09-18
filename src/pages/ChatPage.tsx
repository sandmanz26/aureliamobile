import { Check, CheckCheck, WandSparkles } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddSheet } from '../components/chat/AddSheet'
import { ChatComposer } from '../components/chat/ChatComposer'
import { EmptyThread, EmptyThreadPrompts } from '../components/chat/EmptyThread'
import { ChatHeader } from '../components/chat/ChatHeader'
import { MiniPlayer } from '../components/chat/MiniPlayer'
import { PublishSheet } from '../components/chat/PublishSheet'
import { useAudioPlayer } from '../audio/AudioPlayerContext'
import { RECOMMENDATIONS, useChatSession } from '../chat/ChatSessionContext'
import type { Message, Status } from '../chat/ChatSessionContext'
import { AttachedSession } from '../components/chat/AttachedSession'
import { draftTitleFor, findQuickStart } from '../lib/quickStart'
import { replyTo } from '../lib/replies'
import { RecommendationCard } from '../components/chat/RecommendationCard'
import { RecommendationDeck } from '../components/chat/RecommendationDeck'
import { SessionProgressCard } from '../components/chat/SessionProgressCard'
import { VoiceMessage } from '../components/chat/VoiceMessage'
import { VoiceRecorder } from '../components/chat/VoiceRecorder'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import { findSession, publishSession, unpublishSession } from '../lib/sessions'

const SUGGESTIONS = ['Add more white noise', 'Make it longer', 'Female voice']

/** Openers for a session with nothing in it yet — the hardest part of a blank
 *  chat is the first sentence, so the screen offers a few. */
const OPENERS = [
  'Good morning, how did I sleep?',
  'Create a meditation for tonight',
  'Something for a restless afternoon',
]


/** A brief handed over from the Recreate screen. */
interface RecreateBrief {
  slug: string
  title: string
  author: string
  minutes: number
  changes: string[]
}

function clockTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Three dots, the universal "still typing" tell. */
function TypingDots() {
  return (
    <span className="flex items-center gap-3" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-6 animate-bounce rounded-full bg-text-secondary"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

function StatusTicks({ status }: { status: Status }) {
  if (status === 'sending') {
    return <span className="text-style-caption text-text-secondary">Sending…</span>
  }
  return status === 'read' ? (
    <CheckCheck size={13} className="text-text-brand" />
  ) : (
    <Check size={13} className="text-text-secondary" />
  )
}

export function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // /chat/:slug is an existing session's conversation; bare /chat is a new one.
  const { slug } = useParams()
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()

  const routeState = location.state as
    | {
        recreate?: RecreateBrief
        startVoice?: boolean
        ask?: string
        fresh?: boolean
        /** A Quick Start card's id — Explore's "Create". */
        start?: string
        /** A cut picked in the Insights > Chapters list, to go back to. */
        revert?: { id: string; label: string; slug: string }
        /** "Publish Now" on the empty Social Impact tab. */
        publish?: boolean
      }
    | null
  const brief = routeState?.recreate
  /** What the visitor typed on Home before they were sent here. */
  const ask = routeState?.ask

  // "New session" opens the demo conversation the screens are written
  // against, and so does a first visit. The empty-thread guard below is still
  // here because a thread with nothing in it is a state the screen has to
  // survive, but nothing reaches it today.
  // Held above the router, so walking off to play the session and coming back
  // returns to the thread rather than a fresh one.
  const {
    messages, setMessages,
    applied, setApplied,
    sessionState, setSessionState,
    progress, setProgress,
    deckOpen, setDeckOpen,
    sessionSlug, openSession,
    draft, setDraft,
    addVersion, pointAt,
    currentVersionId, publishedVersionId, markPublished, markUnpublished,
    nextMessageId,
    reset,
  } = useChatSession()
  const [typing, setTyping] = useState(false)
  const { track, playing } = useAudioPlayer()
  // The session Insights should open: this thread's if it has one, otherwise
  // the one the draft stands in for — the same fallback `playTo` uses.
  const insightsSlug = findSession(sessionSlug ?? draft.slug)?.slug
  /**
   * Publish / Republish / nothing.
   *
   * Entirely this thread's own question, which is why it is not a catalogue
   * lookup: a brand-new session stands in for a published catalogue session
   * while it is being built, and asking the catalogue would hide Publish on
   * the one session that most needs it.
   */
  const publishLabel: 'Publish' | 'Republish' | null =
    publishedVersionId === null
      ? 'Publish'
      : publishedVersionId === currentVersionId
        ? null
        : 'Republish'
  // Arriving from Home's mic opens the recorder straight away, so the tap that
  // said "talk to Aurelia" lands on a live mic rather than an idle composer.
  const [listening, setListening] = useState(() => routeState?.startVoice === true)
  const [publishState, setPublishState] = useState<'publishing' | 'published' | 'unpublished' | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addPicks, setAddPicks] = useState<string[]>([])

  // Read by the reply timers below, which fire long after the render that
  // scheduled them and would otherwise decide on a stale state.
  const stateRef = useRef(sessionState)
  useEffect(() => {
    stateRef.current = sessionState
  }, [sessionState])

  const empty = messages.length === 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const briefHandled = useRef<string | null>(null)
  const startHandled = useRef<string | null>(null)
  const askHandled = useRef(false)
  const freshHandled = useRef<string | null>(null)

  // Starting a new session from /chat does not remount the page, so the state
  // initialiser above never runs again and the old thread would stay put.
  // Keyed on the navigation rather than a boolean, so pressing New session
  // twice clears it twice.
  //
  // A door only opens once. `fresh` is written into a history entry, and the
  // Back button pops straight back to that entry — so without the spend-effect
  // at the bottom of this block, walking off to the player and pressing back
  // re-read `fresh: true`, called reset() a second time, and threw away the
  // session that had just been generated. The refs here cannot stop that on
  // their own: leaving for the player unmounts this page, so on the way back
  // they are blank again.
  useEffect(() => {
    if (!routeState?.fresh || freshHandled.current === location.key) return
    freshHandled.current = location.key
    // A card or a fork writes its own opening; letting the blank one land
    // first would show somebody else's conversation on the way to theirs.
    if (routeState.start || routeState.recreate) return
    setTyping(false)
    // Empty, per Figma 16658:28872 — the orb, the greeting and the openers,
    // with nothing above the composer. It used to open on the demo
    // conversation on the grounds that a blank scroll is a worse first screen
    // than one already mid-conversation. The frame disagrees, and it is right:
    // that conversation was about a session the user had not made, so "New
    // session" opened on somebody else's, and the first thing the screen did
    // was misrepresent itself.
    reset([])
  }, [location.key, routeState?.fresh, routeState?.start, routeState?.recreate, reset])

  // Point the thread at the session in the URL. openSession no-ops when it is
  // already on that one, which is what makes going off to play it and coming
  // back feel like returning rather than reloading.
  const opened = findSession(slug)
  useEffect(() => {
    if (!opened || opened.slug === sessionSlug) return
    // Only on a real change of session: a stale "Aurelia is typing" from the
    // thread you just left has nothing to do with the one you just opened.
    setTyping(false)
    openSession(opened)
  }, [opened, sessionSlug, openSession])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, sessionState, progress, deckOpen])

  /**
   * A Quick Start card opens the cockpit on that kind of session.
   *
   * It clears the thread first — pressing Create is starting something, not
   * continuing whatever was open — and then says Aurelia's line for *this*
   * card. Keyed on the navigation rather than a boolean, so pressing Create
   * twice starts twice; and the draft is set here, which is what stops the
   * progress card and Ready to play naming a different session.
   */
  useEffect(() => {
    const card = findQuickStart(routeState?.start)
    if (!card || startHandled.current === location.key) return
    startHandled.current = location.key

    const now = Date.now()
    reset([
      { id: 1, from: 'aurelia', at: now, text: card.opening },
      { id: 2, from: 'aurelia', at: now + 1_200, text: card.ask },
    ])
    setTyping(false)
    // After reset, which puts the draft back to the default.
    setDraft({ title: draftTitleFor(card), slug: card.plays })
  }, [location.key, routeState?.start, reset, setDraft])

  /**
   * "Publish Now", pressed on the empty Social Impact tab.
   *
   * That tab is empty precisely because the session is unpublished, so the one
   * action it offers has to reach the sheet that fixes it — and Publish lives
   * in the cockpit, not in Insights.
   */
  useEffect(() => {
    if (!routeState?.publish) return
    if (!isEnabled('chat.publish')) return
    setPublishState('publishing')
  }, [location.key, routeState?.publish, isEnabled])

  /**
   * Going back to an earlier cut, chosen in Insights > Chapters.
   *
   * Chapters is the version history now — the cockpit's menu no longer carries
   * a second one — so the revert happens there and is handed here through the
   * route. The work lands in the conversation because that is where this
   * session's changes are accounted for: without the two lines, the card
   * quietly renames itself and nothing says why.
   */
  useEffect(() => {
    const cut = routeState?.revert
    if (!cut) return
    pointAt(cut)
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId(),
        from: 'user',
        at: Date.now(),
        status: 'read',
        text: `Go back to ${cut.label}`,
      },
      {
        id: nextMessageId(),
        from: 'aurelia',
        at: Date.now() + 1,
        text: `Back on ${cut.label}. The later cuts are still in the history, so you can come forward again — nothing is lost by trying one.`,
      },
    ])
    // The cut you reverted to is finished, so the card plays it rather than
    // offering to build it.
    setProgress(100)
    setSessionState('ready')
    // location.key, not the object: Back returns to this entry with the same
    // state, and without it the revert would replay on every visit.
  }, [location.key, routeState?.revert, pointAt, setMessages, nextMessageId, setProgress, setSessionState])

  /**
   * A hand-off from Recreate opens the thread with the fork already stated, so
   * the user lands mid-conversation rather than at a blank prompt.
   *
   * It clears first, and that is the point: forking somebody's session is
   * starting a new one, not adding a line to whatever was open. Without the
   * reset you could quick-start Affirmations, go to a profile, recreate a
   * sleep session, and end up with one thread claiming to be both.
   *
   * Keyed on the navigation like the others, so recreating twice forks twice.
   */
  useEffect(() => {
    if (!brief || briefHandled.current === location.key) return
    briefHandled.current = location.key

    const now = Date.now()
    const lines = brief.changes.length ? brief.changes.map((line) => `• ${line}`).join('\n') : '• Keep it as it is'
    reset([
      {
        id: 1,
        from: 'user',
        at: now,
        status: 'read',
        text: `Recreate “${brief.title}” by ${brief.author}, at ${brief.minutes} minutes.\n${lines}`,
        // Attached, not just named: you can see what you are forking and play
        // it without leaving the thread.
        attachment: { session: brief.slug },
      },
    ])
    setTyping(false)
    // A fork is a v2 of somebody else's, and until it is built it stands in
    // for the original — which is at least the right session.
    setDraft({ title: `${brief.title} v2`, slug: brief.slug })
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          from: 'aurelia',
          at: Date.now(),
          text: `Got it — forking ${brief.author}’s session and keeping them credited in the lineage. Apply the recommendations below and I’ll build your version.`,
        },
      ])
    }, 1600)
    // Deliberately not cleared on unmount. The thread lives above the router —
    // that is what it is for — so a reply in flight should still land if you
    // step away for a moment, and clearing it here would also cancel it when
    // the spend-effect below strips this navigation's state.
  }, [brief, location.key, reset, setMessages, nextMessageId, setDraft])

  // What was typed on Home arrives as the first thing said here, so the visitor
  // does not have to write it again — including after a detour through sign-in.
  useEffect(() => {
    if (!ask || askHandled.current) return
    askHandled.current = true
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), from: 'user', at: Date.now(), status: 'read', text: ask },
    ])
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          from: 'aurelia',
          at: Date.now(),
          text: 'Good place to start. Give me a moment and I’ll shape something around that.',
        },
      ])
    }, 1400)
    // Uncleared for the same reason as the fork's reply above.
  }, [ask, setMessages, nextMessageId])

  /**
   * A door's state is spent once it has been played out.
   *
   * Every entry point writes its instruction into the history entry —
   * `{ fresh }`, `{ start }`, `{ recreate }`, `{ ask }` — and a history entry
   * is not a one-shot: pressing Back from the player pops to the very same
   * entry, remounts this page, and hands it the same instruction again. The
   * guards above are per-mount refs, so by then they are blank, and the door
   * opened a second time: "New session" reset the thread and the session the
   * user had just generated was gone, leaving only the mini player at the top
   * as evidence that anything had been made at all.
   *
   * Replacing the entry with a stateless one is the fix rather than a
   * longer-lived guard, because it makes the history itself honest — the entry
   * now says "the cockpit", which is what it is once you have arrived.
   */
  useEffect(() => {
    if (!routeState) return
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [routeState, navigate, location.pathname, location.search])

  // Drives the "Creating your new session.." percentage up to 100.
  useEffect(() => {
    if (sessionState !== 'generating') return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer)
          setSessionState('ready')
          return 100
        }
        return value + 1
      })
    }, 45)
    return () => window.clearInterval(timer)
  }, [sessionState, setSessionState, setProgress])

  useEffect(() => {
    if (publishState !== 'publishing') return
    const timer = window.setTimeout(() => {
      setPublishState('published')
      // Record it, or the sheet is the only thing that ever knew. Social
      // Impact reads this to leave its empty state, and the Sessions list to
      // stop calling the session a draft.
      const slug = sessionSlug ?? draft.slug
      if (slug) publishSession(slug)
      // What is live is now what is current, so the button goes quiet until
      // the next build moves the thread on.
      markPublished()
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [publishState, sessionSlug, draft.slug, markPublished])

  function toggleRecommendation(id: string) {
    setApplied((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  function applyChanges(label = 'Apply new changes') {
    setSessionState('updating')
    // The request goes into the thread as the user's own line. Applying is a
    // thing they asked for, and a session that changes with nothing in the
    // transcript to explain why reads as the app acting on its own.
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), from: 'user', at: Date.now(), text: label, status: 'read' },
    ])
    setDeckOpen(false)
    window.setTimeout(() => {
      build(label)
      setMessages((current) => [
        ...current,
        { id: nextMessageId(), from: 'aurelia', at: Date.now(), text: 'Sure, here it is:' },
      ])
    }, 1400)
  }

  /**
   * Start a new cut.
   *
   * The version is recorded here, at the start, rather than when the bar
   * reaches 100 — the build is a thing that is happening, and recording it on
   * completion would mean carrying the request across a screen the user can
   * walk away from mid-build. The history shows the newest row as *Creating*
   * while this runs.
   */
  function build(change: string) {
    setProgress(0)
    setSessionState('generating')
    addVersion(change)
  }

  /**
   * Sends, then walks the message through sending → sent → read and brings back
   * a reply — the rhythm a chat app has, rather than a bubble that just appears.
   */
  function pushUserMessage(message: Omit<Message, 'id' | 'at' | 'status'>) {
    const id = nextMessageId()
    setMessages((current) => [...current, { ...message, id, at: Date.now(), status: 'sending' }])

    const setStatus = (status: Status) =>
      setMessages((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))

    window.setTimeout(() => setStatus('sent'), 400)
    window.setTimeout(() => {
      setStatus('read')
      setTyping(true)
    }, 900)
    window.setTimeout(() => {
      setTyping(false)
      // What was said decides what comes back. One reply for every input is
      // what makes a demo feel like a demo — the screen is plainly not reading
      // you, so you stop typing anything real into it.
      const reply = replyTo(message.text)
      // Asking for a change to a session that exists *is* the request — it does
      // not also need to be applied. Aurelia says she is adding the white
      // noise, so a card still reading "Ready to play" on the cut from before
      // is the app claiming to have done something it has not. A thread with
      // nothing built yet is a different case: there the deck is the proposal
      // and Apply is what builds it.
      //
      // Outside the updater below, and that is not a style choice: an updater
      // is expected to be pure and React runs it twice to check, so a build
      // started from inside one records the version twice.
      if (reply.changes && stateRef.current === 'ready') build(message.text)
      setMessages((current) => {
        // The deck comes over once, with the first reply that is a proposal.
        // Without that, a thread started from Quick Start offered "Apply new
        // changes (3)" over a deck nobody had handed over.
        const proposed = current.some((item) => item.attachment === 'recommendations')
        const hands = !proposed && (reply.proposes || current.length <= 3)
        return [
          ...current,
          {
            id: nextMessageId(),
            from: 'aurelia',
            at: Date.now(),
            text: hands ? `${reply.text}\n\nHere is what I would put in it:` : reply.text,
            ...(hands ? { attachment: 'recommendations' as const } : {}),
          },
        ]
      })
    }, 2400)
  }

  function sendMessage(text: string) {
    pushUserMessage({ from: 'user', text })
  }

  function sendVoice(transcript: string, durationMs: number) {
    setListening(false)
    pushUserMessage({ from: 'user', text: transcript, voice: { durationMs } })
  }

  // The set stays in the thread once applied — it is what was asked for, and
  // a transcript that drops the request but keeps the answer reads as a gap.
  // Only the acting on it stops.
  const showRecommendations = isEnabled('chat.recommendations')
  const canApply = sessionState === 'idle' || sessionState === 'updating'

  /**
   * Whether what this thread built is the thing on the deck.
   *
   * It decides what the progress card says once you come back from the player.
   * "Ready to play" is an invitation, and reading it over a session that is
   * already loaded — and audible — asks you to do the thing you just did, which
   * is the moment the screen stops keeping up with you. Compared on the href
   * rather than the slug because a draft borrows its recording and is keyed
   * apart from it.
   */
  const onDeck = track?.href === `/play/${draft.slug}`
  const readyStatus = !onDeck ? 'Ready to play' : playing ? 'Playing now' : 'Paused'

  return (
    <div className="flex h-[calc(100vh-54px)] flex-col bg-background-default lg:h-screen">
      <ChatHeader
        points="1,323"
        /* Once a session is on the deck the card below carries the transport,
           so a second play glyph in the header would be two controls for one
           thing. */
        canPlay={!empty && !track}
        /* The cockpit is about a session, so its transport plays that one.
           Hardcoded, it played Dolphins frequency whichever session you had
           open. A thread with no session behind it is one being built, and the
           draft holds what it stands in for — which is a session of the kind
           you asked for, rather than whichever one the literal named. */
        playTo={`/play/${sessionSlug ?? draft.slug}`}
        /* Once the draft exists it is yours, so the deck announces it rather
           than the catalogue session lending it a recording. Before that there
           is nothing to name: the transport is previewing the kind of session
           you asked for, and it should say whose it actually is. */
        playAs={
          !sessionSlug && sessionState === 'ready'
            ? { title: draft.title, author: CURRENT_USER }
            : undefined
        }
        /* Insights opens Progress for the same session `playTo` plays.
           Gating this on `sessionSlug` alone left it dead on a new thread, and
           it disagreed with the line above, where the draft's own slug is good
           enough to play. Every draft slug is a catalogue session — the
           default, a quick start's `plays`, a recreate's source, or a
           version's — so it resolves. `findSession` is still the guard,
           because Progress redirects to /sessions on a slug it cannot find,
           and a menu item that silently bounces you elsewhere is worse than
           one that is plainly unavailable. */
        onInsights={insightsSlug ? () => navigate(`/progress/${insightsSlug}`) : undefined}
        onMenu={openDrawer}
        publishLabel={publishLabel}
        /* Only where something of this thread is actually live. A session that
           has never been published has nothing to take down, and offering it
           would be a third button that does nothing. */
        onUnpublish={
          publishedVersionId === null
            ? undefined
            : () => {
                const slug = sessionSlug ?? draft.slug
                if (slug) unpublishSession(slug)
                markUnpublished()
                // Taking something down is quiet — the menu closes and a
                // button changes label, which is easy to miss and easy to
                // doubt. The sheet says what happened and, more usefully,
                // that nothing was lost.
                setPublishState('unpublished')
              }
        }
        onPublish={() => isEnabled('chat.publish') && setPublishState('publishing')}
        canPublish={isEnabled('chat.publish')}
        onSettings={isEnabled('sessionSettings') ? () => navigate('/session-settings') : undefined}
      />

      {track && (
        <div className="px-20 pb-12">
          <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
            <MiniPlayer />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-20">
        <div className="mx-auto flex min-h-full max-w-[402px] flex-col gap-4 pb-16 lg:max-w-[720px]">
          {empty && <EmptyThread name="Adam" />}

          {!empty && (
            <p className="text-style-caption mx-auto my-8 rounded-full bg-background-elevated px-12 py-4 text-text-secondary">
              Today
            </p>
          )}

          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const next = messages[index + 1]
            // A run is consecutive messages from the same sender inside two
            // minutes: only its first bubble gets the avatar, only its last
            // gets the timestamp.
            const startsRun = !previous || previous.from !== message.from || message.at - previous.at > 120_000
            const endsRun = !next || next.from !== message.from || next.at - message.at > 120_000

            const attached = message.attachment
            const attachment =
              typeof attached === 'object' ? (
                <div
                  className={`u-message mt-8 flex ${
                    message.from === 'user' ? 'justify-end' : 'pl-34'
                  }`}
                >
                  <AttachedSession slug={attached.session} />
                </div>
              ) : attached === 'recommendations' && showRecommendations ? (
                deckOpen && canApply ? (
                  <div className="u-message -mx-20 mt-12 flex gap-11 overflow-x-auto px-20 pb-4">
                    {RECOMMENDATIONS.map((recommendation) => (
                      <RecommendationCard
                        key={recommendation.id}
                        recommendation={recommendation}
                        applied={applied.includes(recommendation.id)}
                        onToggle={() => toggleRecommendation(recommendation.id)}
                      />
                    ))}
                  </div>
                ) : (
                  // Not indented under the avatar: the frame runs the deck the
                  // full width of the message column and lets the front card
                  // lead 4px into the gutter. It needs the room — indented,
                  // the steps had to tighten on a narrow screen and the whole
                  // point of the deck, the orbs behind, went back into hiding.
                  <div className="u-message -ml-4 mt-12">
                    <RecommendationDeck
                      recommendations={RECOMMENDATIONS}
                      count={applied.length || RECOMMENDATIONS.length}
                      onOpen={canApply ? () => setDeckOpen(true) : undefined}
                    />
                  </div>
                )
              ) : null

            if (message.from === 'aurelia') {
              return (
                <Fragment key={message.id}>
                <div className={`u-message flex gap-10 pr-40 ${startsRun ? 'mt-12' : 'mt-2'}`}>
                  <span className="w-24 shrink-0">
                    {startsRun && <AureliaLogo iconSize={24} markOnly />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {startsRun && (
                      <p className="text-style-caption mb-2 text-text-secondary">Aurelia</p>
                    )}
                    <p className="text-style-body-small whitespace-pre-line text-text-primary">{message.text}</p>
                    {endsRun && (
                      <p className="text-style-caption mt-4 text-text-secondary">{clockTime(message.at)}</p>
                    )}
                  </div>
                </div>
                {attachment}
                </Fragment>
              )
            }

            return (
              <div key={message.id} className={`u-message flex flex-col items-end ${startsRun ? 'mt-12' : 'mt-2'}`}>
                {message.voice ? (
                  <VoiceMessage durationMs={message.voice.durationMs} transcript={message.text} />
                ) : (
                  <p className="text-style-body-small max-w-[283px] whitespace-pre-line rounded-16 bg-brand-default px-17 py-10 text-text-strong">
                    {message.text}
                  </p>
                )}
                {attachment}
                {endsRun && (
                  <span className="mt-4 flex items-center gap-4">
                    <span className="text-style-caption text-text-secondary">{clockTime(message.at)}</span>
                    {message.status && <StatusTicks status={message.status} />}
                  </span>
                )}
              </div>
            )
          })}

          {(sessionState === 'generating' || sessionState === 'ready') && (
            <div className="u-message mt-12">
              <SessionProgressCard
                title={draft.title}
                status={sessionState === 'ready' ? readyStatus : 'Creating your new session..'}
                progress={sessionState === 'ready' ? null : progress}
                to={sessionState === 'ready' ? `/play/${draft.slug}` : undefined}
                /* Only a draft is renamed. A thread about a session that
                   already exists is making a new cut of that session, which is
                   still its author's — overriding here credited Adam for
                   Sophia's session, and, because the override also keys the
                   cut, left her session on the deck under the previous draft's
                   name. */
                by={sessionSlug ? undefined : CURRENT_USER}
              />
            </div>
          )}

          {typing && (
            <div className="u-message mt-12 flex items-center gap-10">
              <span className="w-24 shrink-0">
                <AureliaLogo iconSize={24} markOnly />
              </span>
              <span className="flex items-center gap-8 rounded-16 bg-background-elevated px-14 py-10">
                <TypingDots />
                <span className="text-style-caption text-text-secondary">Aurelia is typing</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {listening ? (
        <VoiceRecorder onSend={sendVoice} onCancel={() => setListening(false)} />
      ) : (
        <div className="flex flex-col gap-8 pb-8 pt-8">
          <div className="flex gap-8 overflow-x-auto px-20 pb-4">
            {!empty && applied.length > 0 && showRecommendations && canApply && (
              <button
                type="button"
                onClick={() => applyChanges()}
                disabled={sessionState === 'updating'}
                className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-14 text-text-strong disabled:opacity-70"
              >
                <WandSparkles size={13} />
                {sessionState === 'updating' ? 'Updating..' : `Apply new changes (${applied.length})`}
              </button>
            )}
            {empty && <EmptyThreadPrompts prompts={OPENERS} onPrompt={sendMessage} />}
            {!empty &&
              SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-14 text-text-primary"
                >
                  <WandSparkles size={13} />
                  {suggestion}
                </button>
              ))}
          </div>

          {/* The accuracy caveat, as the frame has it. It belongs on a wellness
              product more than most: Aurelia talks about sleep and stress in
              specific figures, and none of them are a measurement. */}
          {/* 12 Light at 19 on #9D9D9D — the frame's, not Caption's 10/14 on
              text/secondary. A disclaimer set smaller than the smallest thing
              around it reads as fine print somebody hopes you will skip. */}
          <p className="px-20 text-center text-[12px] font-light leading-[19px] text-[#9D9D9D]">
            Aurelia AI can make mistakes. Check important info.
          </p>

          <div className="px-20">
            <div className="mx-auto max-w-[402px] lg:max-w-[720px]">
              <ChatComposer
                onSend={sendMessage}
                onVoice={() => isEnabled('chat.voice') && setListening(true)}
                onAdd={() => setAddOpen(true)}
                canVoice={isEnabled('chat.voice')}
                disabled={typing}
              />
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <AddSheet
          added={addPicks}
          onToggle={(id) =>
            setAddPicks((current) =>
              current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
            )
          }
          onApply={() => {
            setAddOpen(false)
            setAddPicks([])
            // Same path the chip takes — the sheet is another way to ask for
            // the same thing, so it must not grow a second way of doing it.
            applyChanges(
              addPicks.length === 1 ? 'Apply 1 change' : `Apply ${addPicks.length} changes`,
            )
          }}
          onClose={() => setAddOpen(false)}
        />
      )}

      {publishState && (
        <PublishSheet
          state={publishState}
          onCancel={() => setPublishState(null)}
          onDone={() => setPublishState(null)}
          onView={() => {
            // "ready to view" means the session, not the shelf it will appear
            // on. Landing on Home makes the user go and find what they just
            // made.
            setPublishState(null)
            navigate(`/session/${draft.slug}`)
          }}
        />
      )}
    </div>
  )
}
