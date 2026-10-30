import { WandSparkles } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddSheet } from '../components/chat/AddSheet'
import { addOptionTitles, asOptions } from '../chat/addOptions'
import { PageMeta } from '../components/PageMeta'
import { ChatComposer } from '../components/chat/ChatComposer'
import { ChatMessageItem } from '../components/chat/ChatMessageItem'
import { FreeLimitNotice } from '../components/chat/FreeLimitNotice'
import { EmptyThread, EmptyThreadPrompts } from '../components/chat/EmptyThread'
import { ChatHeader } from '../components/chat/ChatHeader'
import { MiniPlayer } from '../components/chat/MiniPlayer'
import { PublishSheet } from '../components/chat/PublishSheet'
import { useAudioPlayer } from '../audio/AudioPlayerContext'
import { useChatSession } from '../chat/ChatSessionContext'
import { OPENING_MESSAGES, nextVersionLabel, sessionNameOf } from '../chat/thread'
import { deckFor, inferFromWords, suggestionsFor } from '../chat/firstSession'
import { DEFAULTS, findGoal, onboardingAnswers } from '../lib/onboarding'
import { MOOD_LABELS, readJourney, startJourney } from '../lib/journey'
import type { Message, Status } from '../chat/thread'
import type { RecreateBrief } from '../chat/recreate'
import { draftTitleFor, findQuickStart } from '../lib/quickStart'
import { FALLBACK, replyTo } from '../lib/replies'
import { SessionReasoningCard } from '../components/chat/SessionReasoningCard'
import { SessionProgressCardV2 } from '../components/chat/SessionProgressCardV2'
import { VoiceRecorder } from '../components/chat/VoiceRecorder'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useUiVersion } from '../versions/useUiVersion'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import { findSession, publishSession, unpublishSession } from '../lib/sessions'

const SUGGESTIONS = ['Add more white noise', 'Make it longer', 'Female voice']

/** Openers for a session with nothing in it yet — the hardest part of a blank
 *  chat is the first sentence, so the screen offers a few. */
/** Sends the free plan allows in one thread before it pauses. */
const FREE_SENDS = 3
/** How long until the allowance comes back. */
const FREE_RESET_MINUTES = 30

/** "Adding white noise…" → "adding white noise…", to follow a lead-in. */
function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/** "9:55 PM" — the card names a clock time, not a countdown. */
function formatResetTime(at: Date) {
  return at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const OPENERS = [
  'Good morning, how did I sleep?',
  'Create a meditation for tonight',
  'Something for a restless afternoon',
]


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
        /** v4 onboarding (U047): the first session's name, set after the reset. */
        firstTitle?: string
        /** v4 (U050): onboarding's "Build my first session" — builds on its own. */
        firstSession?: boolean
        /** A Quick Start card's id — Explore's "Create". */
        start?: string
        /** A cut picked in the Insights > Chapters list, to go back to. */
        revert?: { id: string; label: string; slug: string }
        /** "Publish Now" on the empty Social Impact tab. */
        publish?: boolean
        /** A sentence composed on Session settings — Add/Remove queued on
         *  Visual or Sound, sent here the moment "Apply changes" is pressed. */
        styleChanges?: string
        /** "Join Challenge" on a challenge's detail screen. */
        challenge?: { title: string }
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
    deck, replaceDeck,
    sessionState, setSessionState,
    progress, setProgress,
    deckOpen, setDeckOpen,
    sessionSlug, openSession,
    draft, setDraft,
    addVersion, pointAt,
    currentVersionId, publishedVersionId, markPublished, markUnpublished, versions,
    nextMessageId,
    reset,
  } = useChatSession()
  const [typing, setTyping] = useState(false)
  const v3 = useUiVersion() >= 3
  const v4 = useUiVersion() >= 4
  const v5 = useUiVersion() >= 5
  const [journey] = useState(() => readJourney())
  // What onboarding stored (v4). Read once: this screen is never open while
  // onboarding is, so it cannot change under it.
  const [answers] = useState(() => onboardingAnswers())
  const { track, playing } = useAudioPlayer()
  // The session Insights should open: this thread's if it has one, otherwise
  // the one the draft stands in for — the same fallback `playTo` uses.
  /**
   * The free plan's allowance, spent after three sends in a thread.
   *
   * Counted from the transcript rather than kept as a flag, so it survives
   * leaving the screen and coming back the same way the thread does, and so
   * reverting or starting over cannot leave a counter stranded.
   *
   * Messages a door writes on your behalf — a Recreate brief, a Quick Start —
   * are not sends. You did not spend anything to arrive somewhere.
   */
  // v4 (U050): counted only from the first build on. J039 found the limit
  // tripping on someone's first message ever, because the demo thread's own
  // lines counted; the allowance is for refining a session you have, not for
  // getting one.
  const firstBuild = messages.findIndex((message) => message.build)
  const counted = v4 ? (firstBuild < 0 ? [] : messages.slice(firstBuild)) : messages
  const sends = counted.filter((message) => message.from === 'user' && !message.attachment).length
  const limited = isEnabled('chat.freeLimit') && sends >= FREE_SENDS
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
  // Stamped when the limit trips rather than derived on every render, or the
  // card would quietly promise a later time each time React re-rendered it.
  const [resetAt, setResetAt] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addPicks, setAddPicks] = useState<string[]>([])
  // Reply (U036): the line the next typed message answers. Derived against
  // the thread so a reset or a new session can never leave a reply pointing
  // at a message that is no longer there.
  const [replyTarget, setReplyTarget] = useState<Message | null>(null)
  const replyingTo = replyTarget && messages.some((m) => m.id === replyTarget.id) ? replyTarget : null
  const [flashId, setFlashId] = useState<number | null>(null)

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
  const styleChangesHandled = useRef<string | null>(null)
  const challengeHandled = useRef<string | null>(null)

  /**
   * v4 (U050): a thread of the person's own, for their goal.
   *
   * J039's simulation found five of six first-time paths landed in the demo
   * conversation — a sleep score "improved by 7%" and a message ("it was too
   * short") the person never wrote — and every build was the same "Sleep
   * meditation v1.3" with 432 Hz. In v4 a new thread is named after their
   * goal and proposes changes for it, within what they chose.
   */
  const firstBuildPending = useRef(false)
  function ownThread(words?: string) {
    // Someone who skipped onboarding still has words; the goal is read off them.
    const goalId = answers?.goal ?? (words ? inferFromWords(words).goal : null)
    const goal = findGoal(goalId)
    // Named after the goal while it is their first; after that, a new session
    // is just that — not a second "Sleep better v1.0".
    const title = readJourney() ? 'New session v1.0' : goal ? `${goal.label} v1.0` : 'My first session v1.0'
    setDraft((current) => ({ ...current, title }))
    replaceDeck(deckFor({ ...(answers ?? DEFAULTS), goal: goalId }, words))
  }
  const ownThreadEvent = useEffectEvent(ownThread)

  // v4: the demo conversation is never somebody's first screen. Bare /chat on
  // an untouched demo thread opens empty (or on what they typed), whichever
  // door led here. Doors that write their own opening reset it themselves.
  useEffect(() => {
    if (!v4 || slug || messages !== OPENING_MESSAGES) return
    if (routeState?.fresh || routeState?.start || routeState?.recreate || routeState?.challenge) return
    reset([])
    ownThreadEvent(routeState?.ask)
  }, [v4, slug, messages, routeState, reset])

  // Onboarding's "Build my first session" builds as soon as Aurelia has
  // proposed: they have answered everything already, so a second "Apply"
  // would only be one more tap between them and hearing it.
  const buildFirst = useEffectEvent(() => {
    const picked = deck.filter((r) => applied.includes(r.id))
    applyChanges('Build my first session', picked.map((r) => r.title))
  })
  useEffect(() => {
    if (!firstBuildPending.current) return
    const last = messages[messages.length - 1]
    if (last?.from !== 'aurelia' || last.attachment !== 'recommendations') return
    firstBuildPending.current = false
    window.setTimeout(() => buildFirst(), 900)
  }, [messages])

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
    // Route-state doors (fresh/start/challenge/publish/ask) are one-shot instructions
    // carried by navigation; reacting in an effect, keyed on location.key, is the sync.
    // oxlint-disable-next-line react/set-state-in-effect
    setTyping(false)
    // Empty, per Figma 16658:28872 — the orb, the greeting and the openers,
    // with nothing above the composer. It used to open on the demo
    // conversation on the grounds that a blank scroll is a worse first screen
    // than one already mid-conversation. The frame disagrees, and it is right:
    // that conversation was about a session the user had not made, so "New
    // session" opened on somebody else's, and the first thing the screen did
    // was misrepresent itself.
    reset([])
    // Onboarding's first session gets a name from the goal rather than the
    // demo draft's "Sleep meditation" — someone who asked to focus should
    // not see their first build called a sleep meditation.
    const firstTitle = routeState.firstTitle
    if (firstTitle) setDraft((current) => ({ ...current, title: firstTitle }))
    if (v4) ownThreadEvent(routeState.ask)
    if (routeState.firstSession) firstBuildPending.current = true
  }, [location.key, routeState?.fresh, routeState?.start, routeState?.recreate, routeState?.firstTitle, routeState?.firstSession, routeState?.ask, v4, reset, setDraft])

  // Point the thread at the session in the URL. openSession no-ops when it is
  // already on that one, which is what makes going off to play it and coming
  // back feel like returning rather than reloading.
  const opened = findSession(slug)
  useEffect(() => {
    if (!opened || opened.slug === sessionSlug) return
    // Only on a real change of session: a stale "Aurelia is typing" from the
    // thread you just left has nothing to do with the one you just opened.
    // oxlint-disable-next-line react/set-state-in-effect -- syncing to the session in the URL
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
   * "Join Challenge" opens the cockpit on a thread that already says so,
   * rather than a blank one the user has to explain themselves into.
   *
   * Clears first, same as Quick Start and Recreate: joining a challenge is
   * starting something, not appending to whatever thread happened to be open.
   */
  useEffect(() => {
    const title = routeState?.challenge?.title
    if (!title || challengeHandled.current === location.key) return
    challengeHandled.current = location.key

    const now = Date.now()
    reset([
      {
        id: 1,
        from: 'user',
        at: now,
        status: 'read',
        text: `Hi Aurelia AI, I'm joining the ${title} Challenge!`,
      },
      {
        id: 2,
        from: 'aurelia',
        at: now + 1_200,
        text: `Hi ${CURRENT_USER.split(' ')[0]}, welcome to the challenge!\n\nCreate your own session and publish it to have it featured on the challenge page.\n\nGood luck! ✨`,
      },
    ])
    setTyping(false)
  }, [location.key, routeState?.challenge, reset])

  useEffect(() => {
    if (!limited) {
      // oxlint-disable-next-line react/set-state-in-effect -- derived from the free-limit flag changing
      setResetAt(null)
      return
    }
    setResetAt((current) => current ?? formatResetTime(new Date(Date.now() + FREE_RESET_MINUTES * 60_000)))
  }, [limited])

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
    // oxlint-disable-next-line react/set-state-in-effect -- route-state door, see above
    setPublishState('publishing')
  }, [location.key, routeState?.publish, isEnabled])

  /**
   * "Apply changes" on Session settings — Add/Remove queued on Visual or
   * Sound, arriving here as one sentence already composed.
   *
   * Runs the same build `applyChanges` already runs for the recommendation
   * deck: the request lands in the transcript as the user's own line, then a
   * new version. Session settings names the change; the thread is what
   * applies it — one build path rather than two that could drift apart.
   */
  //
  // U039: held until the session in the URL is the one on the deck. Arriving
  // at /chat/<slug> for a session that is not open yet (Wellness → Analysis →
  // "Create Chapter 2") used to apply the change in the same tick openSession
  // replaced the thread — the request line vanished under the session's
  // opening messages and the build was named after the previous thread's
  // draft ("Sleep meditation v1.3" on Dolphins frequency). The route state is
  // spent on the first render, so the sentence is parked in a ref.
  const pendingStyleChanges = useRef<string | null>(null)
  useEffect(() => {
    if (!routeState?.styleChanges || styleChangesHandled.current === location.key) return
    styleChangesHandled.current = location.key
    pendingStyleChanges.current = routeState.styleChanges
  }, [location.key, routeState?.styleChanges])
  useEffect(() => {
    const sentence = pendingStyleChanges.current
    if (!sentence) return
    if (opened && opened.slug !== sessionSlug) return
    pendingStyleChanges.current = null
    applyChanges(sentence)
  })

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
    // With the Recreate form skipped, nothing has been asked for yet — so the
    // opening line states the fork and stops. "Keep it as it is" belongs to
    // someone who went through the form and changed nothing; putting those
    // words in the mouth of someone who never saw it is the app answering its
    // own question.
    const stated = brief.changes.length > 0
    const lines = stated ? `\n${brief.changes.map((line) => `• ${line}`).join('\n')}` : ''
    reset([
      {
        id: 1,
        from: 'user',
        at: now,
        status: 'read',
        text: stated
          ? `Recreate “${brief.title}” by ${brief.author}, at ${brief.minutes} minutes.${lines}`
          : `Recreate “${brief.title}” by ${brief.author}.`,
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
          // The question the Recreate screen used to ask in a heading, asked
          // here instead — it is the one thing that screen was for, and it
          // survives it.
          text: stated
            ? `Got it — forking ${brief.author}’s session and keeping them credited in the lineage. Apply the recommendations below and I’ll build your version.`
            : `Got it — forking ${brief.author}’s session, and they stay credited in the lineage. Tell me what should be different; anything you leave alone stays as ${brief.author} made it.`,
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
  //
  // Held until the thread is on the session the URL names (U041): an ask that
  // arrives with /chat/:slug — the player's "Ask Aurelia" — used to be written
  // into the thread that was open before, which openSession then replaced, so
  // the question vanished and only a stray reply survived. Same race, and
  // same fix, as the style changes below. The ref keeps the text after the
  // route state is cleared.
  const pendingAsk = useRef<string | null>(null)
  // Reads the latest answerFor (and what it closes over) without making the
  // effect re-run whenever those change.
  const replyToAsk = useEffectEvent((text: string, current: Message[]) => answerFor(text, current))
  if (ask && !askHandled.current && pendingAsk.current === null) pendingAsk.current = ask
  useEffect(() => {
    const text = pendingAsk.current
    if (!text || askHandled.current) return
    if (opened && opened.slug !== sessionSlug) return
    askHandled.current = true
    pendingAsk.current = null
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), from: 'user', at: Date.now(), status: 'read', text },
    ])
    // oxlint-disable-next-line react/set-state-in-effect -- route-state door, see above
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      // Answered like anything typed here (U036). It used to be one fixed
      // line whatever was asked, which mattered once Home's feeling chips
      // started composing the ask: "I can't sleep" and "I don't know what I'm
      // feeling" deserve different first answers — the second gets the
      // smaller questions, the first gets a proposal.
      setMessages((current) => [...current, replyToAsk(text, current)])
    }, 1400)
    // Uncleared for the same reason as the fork's reply above.
    }, [ask, opened, sessionSlug, setMessages, nextMessageId])

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

  /** "a, b and c" */
  function listOf(items: string[]) {
    return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  }

  function applyChanges(label = 'Apply new changes', contents: string[] = []) {
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
      const made = build(label)
      setMessages((current) => [
        ...current,
        // Carries the build it announces, so v3 can keep the result here —
        // and in v3 says what went into it, so three results in a row are
        // three different things rather than three "Sure, here it is:".
        {
          id: nextMessageId(),
          from: 'aurelia',
          at: Date.now(),
          text: v3 && contents.length ? `Built ${made.label} with ${listOf(contents)}.` : 'Sure, here it is:',
          build: made,
        },
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
    // v4 (U050): the first thing someone builds of their own — whichever door
    // they came in by — is chapter 1 of their journey. A catalogue session
    // being re-cut is somebody else's and does not start one.
    if (v4 && !sessionSlug && !readJourney()) {
      startJourney({ goal: answers?.goal ?? null, name: sessionNameOf(draft.title), slug: draft.slug, href: `/play/${draft.slug}` })
    }
    setProgress(0)
    setSessionState('generating')
    return addVersion(change)
  }

  /**
   * Aurelia's answer to `text`, given the thread so far. Shared by the
   * composer and by Home's hand-off so both answer the same way.
   *
   * A reply to one of Aurelia's own lines (U036) is answered as an edit to
   * *that part*: the answer names it, so the change is visibly scoped rather
   * than read as being about the whole session.
   */
  function answerFor(text: string, current: Message[], answering?: Message['replyTo']): Message {
    const said = replyTo(text)
    // v4: a first message the rules do not recognise is still a request for a
    // first session. "I've noted that for the next revision" answered a person
    // who had no session yet (J039, Dewi).
    const reply = v4 && said === FALLBACK && !current.some((m) => m.build) ? replyTo('my first session') : said
    // The deck comes over once, with the first reply that is a proposal.
    // Without that, a thread started from Quick Start offered "Apply new
    // changes (3)" over a deck nobody had handed over.
    const proposed = current.some((item) => item.attachment === 'recommendations')
    // Never both: the deck is a proposal, and the prompts exist precisely
    // because there is nothing to propose yet.
    const hands = !reply.prompts && !proposed && (reply.proposes || current.length <= 3)
    const scoped = answering?.from === 'aurelia' ? `Just that part — ${lowerFirst(reply.text)}` : reply.text
    return {
      id: nextMessageId(),
      from: 'aurelia',
      at: Date.now(),
      text: hands ? `${scoped}\n\nHere is what I would put in it:` : scoped,
      ...(hands ? { attachment: 'recommendations' as const } : {}),
      ...(reply.prompts ? { prompts: reply.prompts } : {}),
    }
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
      const made = reply.changes && stateRef.current === 'ready' ? build(message.text) : undefined
      setMessages((current) => [
        ...current,
        { ...answerFor(message.text, current, message.replyTo), ...(made ? { build: made } : {}) },
      ])
    }, 2400)
  }

  function sendMessage(text: string) {
    pushUserMessage({ from: 'user', text })
  }

  /** What the composer sends: a typed line, carrying the reply if one is open. */
  function sendTyped(text: string) {
    pushUserMessage({
      from: 'user',
      text,
      ...(replyingTo ? { replyTo: { id: replyingTo.id, from: replyingTo.from, text: replyingTo.text.slice(0, 160) } } : {}),
    })
    setReplyTarget(null)
  }

  function jumpTo(id: number) {
    const el = scrollRef.current?.querySelector(`[data-message-id="${id}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setFlashId(id)
    window.setTimeout(() => setFlashId((current) => (current === id ? null : current)), 1400)
  }

  function sendVoice(transcript: string, durationMs: number) {
    setListening(false)
    pushUserMessage({ from: 'user', text: transcript, voice: { durationMs } })
  }

  // The set stays in the thread once applied — it is what was asked for, and
  // a transcript that drops the request but keeps the answer reads as a gap.
  // Only the acting on it stops.
  const showRecommendations = isEnabled('chat.recommendations')
  // Whether Aurelia has handed over a deck in this thread — only then are its
  // proposals part of the sheet's one list (v4).
  const proposed = showRecommendations && messages.some((m) => m.attachment === 'recommendations') && (sessionState === 'idle' || sessionState === 'updating')
  const suggestionOptions = asOptions(deck)
  // v5 (U053): what the suggestions rest on, in words, for each row's Why.
  const lastCheckIn = journey?.checkIns[journey.checkIns.length - 1]
  const basisParts = [
    findGoal(answers?.goal ?? null) ? `your goal (“${findGoal(answers?.goal ?? null)?.label}”)` : 'what you asked for in this conversation',
    lastCheckIn ? `how you felt after your last chapter (“${MOOD_LABELS[lastCheckIn.mood - 1]}”)` : null,
    answers?.wearable && answers.wearable !== 'none' ? 'your wearable' : null,
  ].filter((part): part is string => Boolean(part))
  // "a, b and c" — joined on the list, not by rewriting the last comma in the
  // text, which also matched a comma inside the goal's own phrase.
  const basisLine =
    (basisParts.length > 1 ? `${basisParts.slice(0, -1).join(', ')} and ${basisParts[basisParts.length - 1]}` : basisParts[0]) + '.'
  // v4: none of the chips undoes a choice made in onboarding (J039 F2) — no
  // "Make it longer" for someone who picked 20 minutes.
  const suggestions = v4 && answers ? suggestionsFor(answers) : SUGGESTIONS
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

  /**
   * Version 3 (U038): every build stays in the thread where it was asked
   * for — apply three times, three results (v1.2, v1.3, v1.4) — the way an AI
   * chat keeps each answer, instead of one card at the bottom that renames
   * itself and makes the earlier cuts look gone. The newest carries the live
   * status (building / ready / playing); the earlier ones say so and still
   * play their own cut. The single bottom card remains for v1/v2, and for a
   * state no message announced (a revert from Progress, say).
   */
  const resultInThread = v3 && messages.some((m) => m.build?.versionId === currentVersionId)
  function buildCard(made: NonNullable<Message['build']>) {
    const latest = made.versionId === currentVersionId
    return (
      <div className="u-message mt-12">
        {latest && sessionState === 'generating' ? (
          <SessionProgressCardV2 title={made.label} />
        ) : (
          <SessionReasoningCard
            title={made.label}
            status={latest ? readyStatus : 'Earlier version — tap to play'}
            to={`/play/${made.slug}?v=${made.versionId}`}
            by={sessionSlug ? undefined : CURRENT_USER}
          />
        )}
      </div>
    )
  }
  const hasSomethingToPlay = sessionSlug !== null || sessionState === 'ready'
  const readyStatus = !onDeck ? 'Ready to play' : playing ? 'Playing now' : 'Paused'

  return (
    <div className="flex h-screen flex-col bg-background-default">
      <PageMeta title="Aurelia Chat" />
      <ChatHeader
        points="1,323"
        /* Once a session is on the deck the card below carries the transport,
           so a second play glyph in the header would be two controls for one
           thing. And only once there is something of this thread to play
           (U036): an existing session opened here, or a build that finished.
           Before that the button played a stand-in recording, which read as
           "your session" when the user had not generated anything yet. */
        canPlay={!track && hasSomethingToPlay}
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
        onInsights={
          insightsSlug
            ? // v4 (U051, D5): the Insights page is retired; its version history
              // lives in Session details, the one history.
              () => navigate(v4 ? `/session/${insightsSlug}` : `/progress/${insightsSlug}`)
            : undefined
        }
        onMenu={openDrawer}
        onBack={v4 ? () => navigate('/home') : undefined}
        menuLabels={v4 ? { insights: 'Session details', settings: 'Edit session' } : undefined}
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
          <div className="mx-auto w-full max-w-[402px] lg:max-w-[800px]">
            <MiniPlayer />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-20">
        <div className="mx-auto flex min-h-full max-w-[402px] flex-col gap-4 pb-16 lg:max-w-[800px]">
          {empty && <EmptyThread name="Adam" />}

          {!empty && (
            <p className="text-style-caption mx-auto my-8 rounded-full bg-background-elevated px-12 py-4 text-text-secondary">
              Today
            </p>
          )}

          {messages.map((message, index) => {
            const previous = messages[index - 1]
            // A run is consecutive messages from the same sender inside two
            // minutes: only its first bubble opens extra space above it.
            // Kept here rather than in `ChatMessageItem`, since it is the one
            // thing about a message that needs its neighbor — everything
            // else about rendering one is self-contained.
            const startsRun = !previous || previous.from !== message.from || message.at - previous.at > 120_000

            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                startsRun={startsRun}
                showRecommendations={showRecommendations}
                /* v4 (U051, D6): the deck never lays its cards out here — it
                   opens the "+" sheet, the one list, so a change is never
                   shown with two different scores. */
                deckOpen={v4 ? false : deckOpen}
                canApply={canApply}
                applied={applied}
                recommendations={deck}
                onToggleRecommendation={toggleRecommendation}
                onOpenDeck={() => (v4 ? setAddOpen(true) : setDeckOpen(true))}
                onSendPrompt={sendMessage}
                onReply={limited || listening ? undefined : (m) => setReplyTarget(m)}
                onJumpTo={jumpTo}
                flash={flashId === message.id}
                after={v3 && message.build ? buildCard(message.build) : undefined}
              />
            )
          })}

          {(sessionState === 'generating' || sessionState === 'ready') && !resultInThread && (
            <div className="u-message mt-12">
              {sessionState === 'ready' ? (
                <SessionReasoningCard
                  title={draft.title}
                  status={readyStatus}
                  to={`/play/${draft.slug}`}
                  /* Only a draft is renamed. A thread about a session that
                     already exists is making a new cut of that session, which is
                     still its author's — overriding here credited Adam for
                     Sophia's session, and, because the override also keys the
                     cut, left her session on the deck under the previous draft's
                     name. */
                  by={sessionSlug ? undefined : CURRENT_USER}
                />
              ) : (
                /* The animated build card is the only one now (U026). The
                   static thumbnail + single line it replaced, and the
                   chat.generatingV2 flag that chose between them, are gone. */
                <SessionProgressCardV2 title={draft.title} />
              )}
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
            {/* Not while paused: applying changes starts a build, which is the
                one thing the limit exists to stop. Leaving it live would make
                the notice a suggestion rather than a limit. */}
            {!empty && !limited && applied.length > 0 && showRecommendations && canApply && (
              // The one chip in this row with its own gradient hairline — it's
              // the primary action among suggestions, same brand gradient as
              // the recommendation cards (#FF881B -> #FFE682).
              <button
                type="button"
                onClick={() =>
                  applyChanges(undefined, deck.filter((r) => applied.includes(r.id)).map((r) => r.title))
                }
                disabled={sessionState === 'updating'}
                style={{
                  border: '1px solid transparent',
                  backgroundImage:
                    'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(45deg, #FF881B, #FFE682)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
                className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-12 px-14 text-text-strong disabled:opacity-70"
              >
                <WandSparkles size={13} />
                {sessionState === 'updating' ? 'Updating..' : `Apply new changes (${applied.length})`}
              </button>
            )}
            {empty && !limited && <EmptyThreadPrompts prompts={OPENERS} onPrompt={sendMessage} />}
            {!empty &&
              !limited &&
              suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-12 border border-border-subtle bg-surface-default px-14 text-text-primary"
                >
                  <WandSparkles size={13} />
                  {suggestion}
                </button>
              ))}
          </div>

          {limited && resetAt && (
            <div className="px-20">
              <div className="mx-auto max-w-[402px] lg:max-w-[800px]">
                <FreeLimitNotice
                  resetAt={resetAt}
                  onNewSession={() => navigate('/chat', { state: { fresh: true } })}
                  onUpgrade={() => navigate('/upgrade')}
                />
              </div>
            </div>
          )}

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
            <div className="mx-auto max-w-[402px] lg:max-w-[800px]">
              <ChatComposer
                onSend={sendTyped}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyTarget(null)}
                onVoice={() => isEnabled('chat.voice') && setListening(true)}
                onAdd={() => setAddOpen(true)}
                canVoice={isEnabled('chat.voice')}
                disabled={typing || limited}
              />
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <AddSheet
          nextLabel={versions.length ? nextVersionLabel(versions[versions.length - 1].label) : draft.title}
          // v4 (U051, D6): one list and one selection. The deck's proposals sit
          // first in the sheet, picked as `applied` (what the deck and the
          // Apply chip already use); anything else picked here joins them.
          suggestions={v4 && proposed ? suggestionOptions : undefined}
          basis={v5 ? basisLine : undefined}
          added={v4 && proposed ? [...applied, ...addPicks] : addPicks}
          onToggle={(id) =>
            v4 && proposed && deck.some((r) => r.id === id)
              ? toggleRecommendation(id)
              : setAddPicks((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
          }
          onApply={() => {
            const fromDeck = v4 && proposed ? deck.filter((r) => applied.includes(r.id)).map((r) => r.title) : []
            const titles = [...fromDeck, ...addOptionTitles(addPicks)]
            setAddOpen(false)
            setAddPicks([])
            // Same path the chip takes — the sheet is another way to ask for
            // the same thing, so it must not grow a second way of doing it.
            applyChanges(titles.length === 1 ? 'Apply 1 change' : `Apply ${titles.length} changes`, titles)
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
