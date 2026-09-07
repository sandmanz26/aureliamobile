import { Check, CheckCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { ChatComposer } from '../components/chat/ChatComposer'
import { ChatHeader } from '../components/chat/ChatHeader'
import { PublishSheet } from '../components/chat/PublishSheet'
import type { Recommendation } from '../components/chat/RecommendationCard'
import { RecommendationCard } from '../components/chat/RecommendationCard'
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
  },
]

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'yellow',
    title: 'Increase Yellow',
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

  const brief = (location.state as { recreate?: RecreateBrief } | null)?.recreate

  const [messages, setMessages] = useState<Message[]>(OPENING_MESSAGES)
  const [typing, setTyping] = useState(false)
  const [applied, setApplied] = useState<string[]>(RECOMMENDATIONS.map((r) => r.id))
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [progress, setProgress] = useState(0)
  const [listening, setListening] = useState(false)
  const [publishState, setPublishState] = useState<'publishing' | 'published' | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(OPENING_MESSAGES.length + 1)
  const briefHandled = useRef(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, sessionState, progress])

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

  function applyChanges() {
    if (!applied.length) return
    setSessionState('updating')
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

  const showRecommendations =
    isEnabled('chat.recommendations') && (sessionState === 'idle' || sessionState === 'updating')

  return (
    <div className="flex h-[calc(100vh-54px)] flex-col bg-background-default lg:h-screen">
      <ChatHeader points="1,323" onMenu={openDrawer} onPublish={() => isEnabled('chat.publish') && setPublishState('publishing')}
        canPublish={isEnabled('chat.publish')} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-20">
        <div className="mx-auto flex max-w-[402px] flex-col gap-4 pb-16 lg:max-w-[720px]">
          <p className="text-style-caption mx-auto my-8 rounded-full bg-background-elevated px-12 py-4 text-text-secondary">
            Today
          </p>

          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const next = messages[index + 1]
            // A run is consecutive messages from the same sender inside two
            // minutes: only its first bubble gets the avatar, only its last
            // gets the timestamp.
            const startsRun = !previous || previous.from !== message.from || message.at - previous.at > 120_000
            const endsRun = !next || next.from !== message.from || next.at - message.at > 120_000

            if (message.from === 'aurelia') {
              return (
                <div key={message.id} className={`flex gap-10 pr-40 ${startsRun ? 'mt-12' : 'mt-2'}`}>
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
              )
            }

            return (
              <div key={message.id} className={`flex flex-col items-end ${startsRun ? 'mt-12' : 'mt-2'}`}>
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

          {showRecommendations && (
            <div className="-mx-20 mt-12 flex gap-11 overflow-x-auto px-20 pb-4">
              {RECOMMENDATIONS.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  applied={applied.includes(recommendation.id)}
                  onToggle={() => toggleRecommendation(recommendation.id)}
                />
              ))}
            </div>
          )}

          {(sessionState === 'generating' || sessionState === 'ready') && (
            <div className="mt-12">
              <SessionProgressCard
                title="Sleep meditation v1.2"
                status={sessionState === 'ready' ? 'Ready to play' : 'Creating your new session..'}
                progress={sessionState === 'ready' ? null : progress}
              />
            </div>
          )}

          {typing && (
            <div className="mt-12 flex items-center gap-10">
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
            {applied.length > 0 && showRecommendations && (
              <button
                type="button"
                onClick={applyChanges}
                disabled={sessionState === 'updating'}
                className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-14 text-text-strong disabled:opacity-70"
              >
                <Sparkles size={13} />
                {sessionState === 'updating' ? 'Updating..' : `Apply new changes (${applied.length})`}
              </button>
            )}
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-14 text-text-primary"
              >
                <Sparkles size={13} />
                {suggestion}
              </button>
            ))}
          </div>

          <div className="px-20">
            <div className="mx-auto max-w-[402px] lg:max-w-[720px]">
              <ChatComposer onSend={sendMessage} onVoice={() => isEnabled('chat.voice') && setListening(true)}
                canVoice={isEnabled('chat.voice')} disabled={typing} />
            </div>
          </div>
        </div>
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
