import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import type { Recommendation } from '../components/chat/RecommendationCard'

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
  /** Cards Aurelia handed over with this message. They belong to it, not to
   *  the end of the thread: everything said afterwards comes after them. */
  attachment?: 'recommendations'
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

export type SessionState = 'idle' | 'updating' | 'generating' | 'ready'

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
  /** Next message id. A function rather than the ref itself: handing out a
   *  ref invites callers to mutate a hook's return value. */
  nextMessageId: () => number
  /** Back to a thread with nothing in it — what "New session" means. */
  reset: () => void
}

const ChatSessionContext = createContext<ChatSessionValue | null>(null)

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
  const nextId = useRef(OPENING_MESSAGES.length + 1)
  const nextMessageId = useCallback(() => nextId.current++, [])

  const reset = useCallback(() => {
    setMessages([])
    setApplied(RECOMMENDATIONS.map((item) => item.id))
    setSessionState('idle')
    setProgress(0)
    setDeckOpen(false)
    nextId.current = OPENING_MESSAGES.length + 1
  }, [])

  const value = useMemo<ChatSessionValue>(
    () => ({
      messages, setMessages,
      applied, setApplied,
      sessionState, setSessionState,
      progress, setProgress,
      deckOpen, setDeckOpen,
      nextMessageId,
      reset,
    }),
    [messages, applied, sessionState, progress, deckOpen, nextMessageId, reset],
  )

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>
}

export function useChatSession() {
  const context = useContext(ChatSessionContext)
  if (!context) throw new Error('useChatSession must be used inside ChatSessionProvider')
  return context
}
