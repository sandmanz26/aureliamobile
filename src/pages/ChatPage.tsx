import { Mic, Sparkles, Square, Volume1 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { ChatComposer } from '../components/chat/ChatComposer'
import { ChatHeader } from '../components/chat/ChatHeader'
import { PublishSheet } from '../components/chat/PublishSheet'
import type { Recommendation } from '../components/chat/RecommendationCard'
import { RecommendationCard } from '../components/chat/RecommendationCard'
import { SessionProgressCard } from '../components/chat/SessionProgressCard'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useDrawer } from '../layouts/DrawerContext'

interface Message {
  id: number
  from: 'aurelia' | 'user'
  text: string
}

const OPENING_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'aurelia',
    text: 'Good morning, Adam.\n\nLooks like you had a good sleep last night, score improved by 7% due to increased REM sleep.',
  },
  { id: 2, from: 'aurelia', text: 'How did you find the sleep meditation we created?' },
  { id: 3, from: 'user', text: 'It was good, but it was to short, I had to repeat it multiple times.' },
  {
    id: 4,
    from: 'aurelia',
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

export function ChatPage() {
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()

  const [messages, setMessages] = useState<Message[]>(OPENING_MESSAGES)
  const [typing, setTyping] = useState(false)
  const [applied, setApplied] = useState<string[]>(RECOMMENDATIONS.map((r) => r.id))
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [progress, setProgress] = useState(0)
  const [listening, setListening] = useState(false)
  const [publishState, setPublishState] = useState<'publishing' | 'published' | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(OPENING_MESSAGES.length + 1)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, sessionState, progress])

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
        { id: nextId.current++, from: 'aurelia', text: 'Sure, here it is:' },
      ])
    }, 1400)
  }

  function sendMessage(text: string) {
    setMessages((current) => [...current, { id: nextId.current++, from: 'user', text }])
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          from: 'aurelia',
          text: 'Got it — I’ve noted that for the next revision of your session.',
        },
      ])
    }, 1600)
  }

  const showRecommendations =
    isEnabled('chat.recommendations') && (sessionState === 'idle' || sessionState === 'updating')

  return (
    <div className="flex h-[calc(100vh-54px)] flex-col bg-background-default lg:h-screen">
      <ChatHeader points="1,323" onMenu={openDrawer} onPublish={() => isEnabled('chat.publish') && setPublishState('publishing')}
        canPublish={isEnabled('chat.publish')} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-20">
        <div className="mx-auto flex max-w-[402px] flex-col gap-16 pb-16 lg:max-w-[720px]">
          {messages.map((message) =>
            message.from === 'aurelia' ? (
              <p key={message.id} className="text-style-body-small whitespace-pre-line pr-40 text-text-primary">
                {message.text}
              </p>
            ) : (
              <div key={message.id} className="flex justify-end">
                <p className="text-style-body-small max-w-[283px] rounded-16 bg-brand-default px-17 py-10 text-text-strong">
                  {message.text}
                </p>
              </div>
            ),
          )}

          {showRecommendations && (
            <div className="-mx-20 flex gap-11 overflow-x-auto px-20 pb-4">
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
            <SessionProgressCard
              title="Sleep meditation v1.2"
              status={sessionState === 'ready' ? 'Ready to play' : 'Creating your new session..'}
              progress={sessionState === 'ready' ? null : progress}
            />
          )}

          {typing && <p className="text-style-body-small text-text-secondary">Typing..</p>}
        </div>
      </div>

      {listening ? (
        <div className="relative flex flex-col items-center gap-24 overflow-hidden px-20 pb-24 pt-8">
          <span className="pointer-events-none absolute -bottom-24 left-1/2 size-[241px] -translate-x-1/2 rounded-full bg-brand-default opacity-30 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-16 left-1/2 size-[201px] -translate-x-1/2 rounded-full bg-primary-200 opacity-40 blur-3xl" />
          <p className="text-style-body-small relative text-text-strong">Listening..</p>
          <div className="relative flex items-center gap-8">
            <button
              type="button"
              onClick={() => setListening(false)}
              className="text-style-body-small flex h-56 items-center gap-10 rounded-full bg-surface-default px-18 text-text-primary"
            >
              <Square size={16} fill="currentColor" />
              Stop
            </button>
            <button
              type="button"
              aria-label="Mute microphone"
              className="flex h-56 w-57 items-center justify-center rounded-full bg-surface-default text-icon-strong"
            >
              <Mic size={19} />
            </button>
            <button
              type="button"
              aria-label="Volume"
              className="flex h-56 w-57 items-center justify-center rounded-full bg-surface-default text-icon-strong"
            >
              <Volume1 size={19} />
            </button>
          </div>
        </div>
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
