import { Check, CheckCheck, WandSparkles } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { AddSheet } from '../components/chat/AddSheet'
import { ChatComposer } from '../components/chat/ChatComposer'
import { EmptyThread, EmptyThreadPrompts } from '../components/chat/EmptyThread'
import { ChatHeader } from '../components/chat/ChatHeader'
import { PublishSheet } from '../components/chat/PublishSheet'
import type { Recommendation } from '../components/chat/RecommendationCard'
import { RecommendationCard } from '../components/chat/RecommendationCard'
import { RecommendationDeck } from '../components/chat/RecommendationDeck'
import { SessionProgressCard } from '../components/chat/SessionProgressCard'
import { VoiceMessage } from '../components/chat/VoiceMessage'
import { VoiceRecorder } from '../components/chat/VoiceRecorder'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useDrawer } from '../layouts/DrawerContext'

/** Delivery state, as a messaging app shows it: one tick sent, two ticks read. */
type Status = 'sending' | 'sent' | 'read'

interface Message {
  id: number
  from: 'aurelia' | 'user'
  text: string
  /** Epoch ms — drives the timestamps and the grouping windows. */
  at: number
  /** Voice notes render as a player with the transcript under it. */
  voice?: { durationMs: number }
  status?: Status
  /** Cards Aurelia handed over with this message. They belong to it, not to
   *  the end of the thread: everything said afterwards comes after them. */
  attachment?: 'recommendations'
}

/** The thread opens mid-conversation, so the first messages are backdated. */
const START = Date.now() - 9 * 60_000

const OPENING_MESSAGES: Message[] = [
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

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'yellow',
    title: 'Increase yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '12%',
    orb: orbIncreaseYellow,
  },
  {
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '12%',
    orb: orbLessMovement,
  },
  {
    id: 'frequency',
    title: '432Hz',
    description: 'Your body responds positively to this frequency.',
    improveScore: '12%',
    orb: orb432hz,
  },
]

const SUGGESTIONS = ['Add more white noise', 'Make it longer', 'Female voice']

/** Openers for a session with nothing in it yet — the hardest part of a blank
 *  chat is the first sentence, so the screen offers a few. */
const OPENERS = [
  'Good morning, how did I sleep?',
  'Create a meditation for tonight',
  'Something for a restless afternoon',
]

type SessionState = 'idle' | 'updating' | 'generating' | 'ready'

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
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()

  const routeState = location.state as
    | { recreate?: RecreateBrief; startVoice?: boolean; ask?: string; fresh?: boolean }
    | null
  const brief = routeState?.recreate
  /** What the visitor typed on Home before they were sent here. */
  const ask = routeState?.ask

  // "New session" opens an empty thread; everything else continues the demo
  // conversation the screens are written against.
  const [messages, setMessages] = useState<Message[]>(
    routeState?.fresh ? [] : OPENING_MESSAGES,
  )
  const [typing, setTyping] = useState(false)
  const [applied, setApplied] = useState<string[]>(RECOMMENDATIONS.map((r) => r.id))
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [progress, setProgress] = useState(0)
  // Arriving from Home's mic opens the recorder straight away, so the tap that
  // said "talk to Aurelia" lands on a live mic rather than an idle composer.
  const [listening, setListening] = useState(() => routeState?.startVoice === true)
  const [publishState, setPublishState] = useState<'publishing' | 'published' | null>(null)
  // The set arrives folded: three full cards is most of a phone screen, and
  // the reader opens it when they want to weigh the changes one by one.
  const [deckOpen, setDeckOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addPicks, setAddPicks] = useState<string[]>([])

  const empty = messages.length === 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(OPENING_MESSAGES.length + 1)
  const briefHandled = useRef(false)
  const askHandled = useRef(false)
  const freshHandled = useRef<string | null>(null)

  // Starting a new session from /chat does not remount the page, so the state
  // initialiser above never runs again and the old thread would stay put.
  // Keyed on the navigation rather than a boolean, so pressing New session
  // twice clears it twice.
  useEffect(() => {
    if (!routeState?.fresh || freshHandled.current === location.key) return
    freshHandled.current = location.key
    setMessages([])
    setTyping(false)
    setSessionState('idle')
    setProgress(0)
    setDeckOpen(false)
    setApplied(RECOMMENDATIONS.map((r) => r.id))
  }, [location.key, routeState?.fresh])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, sessionState, progress, deckOpen])

  // A hand-off from /recreate opens the thread with the fork already stated,
  // so the user lands mid-conversation rather than at a blank prompt.
  useEffect(() => {
    if (!brief || briefHandled.current) return
    briefHandled.current = true
    const now = Date.now()
    const lines = brief.changes.length ? brief.changes.map((line) => `• ${line}`).join('\n') : '• Keep it as it is'
    setMessages((current) => [
      ...current,
      {
        id: nextId.current++,
        from: 'user',
        at: now,
        status: 'read',
        text: `Recreate “${brief.title}” by ${brief.author}, at ${brief.minutes} minutes.\n${lines}`,
      },
    ])
    setTyping(true)
    const timer = window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          from: 'aurelia',
          at: Date.now(),
          text: `Got it — forking ${brief.author}’s session and keeping them credited in the lineage. Apply the recommendations below and I’ll build your version.`,
        },
      ])
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [brief])

  // What was typed on Home arrives as the first thing said here, so the visitor
  // does not have to write it again — including after a detour through sign-in.
  useEffect(() => {
    if (!ask || askHandled.current) return
    askHandled.current = true
    setMessages((current) => [
      ...current,
      { id: nextId.current++, from: 'user', at: Date.now(), status: 'read', text: ask },
    ])
    setTyping(true)
    const timer = window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          from: 'aurelia',
          at: Date.now(),
          text: 'Good place to start. Give me a moment and I’ll shape something around that.',
        },
      ])
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [ask])

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
  }, [sessionState])

  useEffect(() => {
    if (publishState !== 'publishing') return
    const timer = window.setTimeout(() => setPublishState('published'), 2200)
    return () => window.clearTimeout(timer)
  }, [publishState])

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
      { id: nextId.current++, from: 'user', at: Date.now(), text: label, status: 'read' },
    ])
    setDeckOpen(false)
    window.setTimeout(() => {
      setProgress(0)
      setSessionState('generating')
      setMessages((current) => [
        ...current,
        { id: nextId.current++, from: 'aurelia', at: Date.now(), text: 'Sure, here it is:' },
      ])
    }, 1400)
  }

  /**
   * Sends, then walks the message through sending → sent → read and brings back
   * a reply — the rhythm a chat app has, rather than a bubble that just appears.
   */
  function pushUserMessage(message: Omit<Message, 'id' | 'at' | 'status'>) {
    const id = nextId.current++
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
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          from: 'aurelia',
          at: Date.now(),
          text: 'Got it — I’ve noted that for the next revision of your session.',
        },
      ])
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

  return (
    <div className="flex h-[calc(100vh-54px)] flex-col bg-background-default lg:h-screen">
      <ChatHeader
        points="1,323"
        canPlay={!empty}
        onMenu={openDrawer}
        onPublish={() => isEnabled('chat.publish') && setPublishState('publishing')}
        canPublish={isEnabled('chat.publish')}
        onSettings={isEnabled('sessionSettings') ? () => navigate('/session-settings') : undefined}
      />

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

            const attachment =
              message.attachment === 'recommendations' && showRecommendations ? (
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
                  // 34 = the avatar column plus its gap, so the deck lines up
                  // under the words that hand it over.
                  <div className="u-message mt-12 pl-34">
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
                title="Sleep meditation v1.2"
                status={sessionState === 'ready' ? 'Ready to play' : 'Creating your new session..'}
                progress={sessionState === 'ready' ? null : progress}
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
          onView={() => {
            setPublishState(null)
            navigate('/home')
          }}
        />
      )}
    </div>
  )
}
