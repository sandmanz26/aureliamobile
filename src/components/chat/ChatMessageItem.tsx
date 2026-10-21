import { Fragment, useRef, useState } from 'react'
import { Reply } from 'lucide-react'
import type { Message } from '../../chat/ChatSessionContext'
import { RECOMMENDATIONS } from '../../chat/ChatSessionContext'
import { AttachedSession } from './AttachedSession'
import { RecommendationCard } from './RecommendationCard'
import { RecommendationDeck } from './RecommendationDeck'
import { VoiceMessage } from './VoiceMessage'

interface ChatMessageItemProps {
  message: Message
  /** Only the run's first bubble opens a little extra space above it — see
   *  `ChatPage`'s run grouping. */
  startsRun: boolean
  showRecommendations: boolean
  /** The deck is open and the session isn't mid-build, so cards can be toggled. */
  deckOpen: boolean
  canApply: boolean
  applied: string[]
  onToggleRecommendation: (id: string) => void
  onOpenDeck: () => void
  onSendPrompt: (text: string) => void
  /** Reply to this message (U036). Absent while replying is not possible —
   *  e.g. the session is paused by the free limit. */
  onReply?: (message: Message) => void
  /** Scroll to and flash the message a quote points at. */
  onJumpTo?: (id: number) => void
  /** Briefly highlighted after a quote was tapped. */
  flash?: boolean
  /** Rendered after the message and its attachments — v3's build result. */
  after?: React.ReactNode
}

/**
 * Reply affordances around one line of the thread (U036).
 *
 * Three ways in, one per input, because none of them alone is discoverable
 * everywhere: a swipe right on touch (the messaging-app gesture people already
 * have), a Reply button that appears on hover with a mouse, and — for touch
 * users who never swipe — a tap on the line, which shows the same button.
 * The swipe follows the finger up to 64px and commits past 48.
 */
function Replyable({
  side,
  onReply,
  children,
}: {
  side: 'left' | 'right'
  onReply?: () => void
  children: React.ReactNode
}) {
  const [dx, setDx] = useState(0)
  const [shown, setShown] = useState(false)
  const start = useRef<{ x: number; y: number; locked: 'x' | 'y' | null } | null>(null)

  if (!onReply) return <>{children}</>

  return (
    <div
      className="group/reply relative touch-pan-y"
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') start.current = { x: e.clientX, y: e.clientY, locked: null }
      }}
      onPointerMove={(e) => {
        const s = start.current
        if (!s) return
        const mx = e.clientX - s.x
        const my = e.clientY - s.y
        if (!s.locked && Math.hypot(mx, my) > 8) s.locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
        if (s.locked === 'x') setDx(Math.max(0, Math.min(64, mx)))
      }}
      onPointerUp={() => {
        if (dx >= 48) {
          onReply()
          setShown(false)
        }
        start.current = null
        setDx(0)
      }}
      onPointerCancel={() => {
        start.current = null
        setDx(0)
      }}
      onClick={(e) => {
        if ((e.target as Element).closest('button, a')) return
        setShown((v) => !v)
      }}
    >
      {/* The swipe's own feedback: the reply glyph fades in behind the line. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 flex size-28 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated text-text-secondary"
        style={{ opacity: dx / 48, transform: `translateY(-50%) scale(${0.6 + Math.min(1, dx / 48) * 0.4})` }}
      >
        <Reply size={14} />
      </span>
      <div style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? undefined : 'transform 200ms' }}>
        {children}
      </div>
      <button
        type="button"
        aria-label="Reply"
        onClick={() => {
          onReply()
          setShown(false)
        }}
        className={`u-press absolute top-0 flex size-28 items-center justify-center rounded-full border border-border-subtle bg-surface-default text-text-secondary shadow-sm transition-opacity ${
          side === 'left' ? '-right-36' : '-left-36'
        } ${shown ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover/reply:pointer-events-auto group-hover/reply:opacity-100'}`}
      >
        <Reply size={14} />
      </button>
    </div>
  )
}

/** The quoted line inside a reply — tap to go to the original. */
function Quote({ reply, onJumpTo, tone }: { reply: NonNullable<Message['replyTo']>; onJumpTo?: (id: number) => void; tone: 'bubble' | 'plain' }) {
  return (
    <button
      type="button"
      onClick={() => onJumpTo?.(reply.id)}
      className={`mb-6 block w-full rounded-8 border-l-2 px-8 py-4 text-left ${
        tone === 'bubble' ? 'border-[#8A4B0F]/50 bg-white/35' : 'border-[#EFA63C] bg-background-elevated'
      }`}
    >
      <span className="block text-[11px] font-medium leading-[14px] text-text-strong">
        {reply.from === 'aurelia' ? 'Aurelia' : 'You'}
      </span>
      <span className="line-clamp-2 text-[12px] leading-[16px] text-text-strong/80">{reply.text}</span>
    </button>
  )
}

/**
 * One message bubble, plus whatever travels with it — a set of tap-to-send
 * prompts, an attached session, or Aurelia's recommendation deck.
 *
 * Pulled out of `ChatPage` because a message's own rendering (how a run of
 * consecutive bubbles collapses its avatar and timestamp, how an attachment
 * differs from a prompt list) is a separate concern from the page's state
 * machine (what produces a message, when a build starts). The run-grouping
 * booleans are still computed by the caller, since that needs the whole
 * array — this component only knows about the one message it was handed.
 */
export function ChatMessageItem({
  message,
  startsRun,
  showRecommendations,
  deckOpen,
  canApply,
  applied,
  onToggleRecommendation,
  onOpenDeck,
  onSendPrompt,
  onReply,
  onJumpTo,
  flash,
  after,
}: ChatMessageItemProps) {
  const reply = onReply ? () => onReply(message) : undefined
  const flashRing = flash ? 'rounded-12 bg-[#FFF1DB] transition-colors duration-700' : 'transition-colors duration-700'
  // Stacked full width, not a scrolling rail: these are read one after
  // another and the longest runs to two lines, which a rail would either
  // clip or leave ragged.
  const promptList = message.prompts?.length ? (
    <div className="u-message mt-8 flex flex-col gap-8 pl-34">
      {message.prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSendPrompt(prompt)}
          className="u-press rounded-[20px] border border-border-subtle bg-surface-default px-16 py-14 text-left text-[14px] leading-[20px] text-text-primary"
        >
          {prompt}
        </button>
      ))}
    </div>
  ) : null

  const attached = message.attachment
  const attachment =
    typeof attached === 'object' ? (
      <div className={`u-message mt-8 flex ${message.from === 'user' ? 'justify-end' : 'pl-34'}`}>
        <AttachedSession slug={attached.session} />
      </div>
    ) : attached === 'recommendations' && showRecommendations ? (
      // The opened row is the plain one in every version: v2's filter moved
      // from here to the top of the "+" sheet (U045, team feedback).
      deckOpen && canApply ? (
        <div className="u-message -mx-20 mt-12 flex gap-11 overflow-x-auto px-20 pb-4">
          {RECOMMENDATIONS.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              applied={applied.includes(recommendation.id)}
              onToggle={() => onToggleRecommendation(recommendation.id)}
            />
          ))}
        </div>
      ) : (
        // Not indented under the avatar: the frame runs the deck the full
        // width of the message column and lets the front card lead 4px into
        // the gutter. It needs the room — indented, the steps had to tighten
        // on a narrow screen and the whole point of the deck, the orbs
        // behind, went back into hiding.
        <div className="u-message -ml-4 mt-12">
          <RecommendationDeck
            recommendations={RECOMMENDATIONS}
            count={applied.length || RECOMMENDATIONS.length}
            onOpen={canApply ? onOpenDeck : undefined}
          />
        </div>
      )
    ) : null

  if (message.from === 'aurelia') {
    return (
      <Fragment>
        {/* No avatar, name or timestamp on Aurelia's own side — the
            reference (Chat, 16809:4944) runs the reply as plain text flush
            with the page's own left gutter, not under a sender header. */}
        <div data-message-id={message.id} className={`u-message pr-40 ${startsRun ? 'mt-12' : 'mt-2'}`}>
          <Replyable side="left" onReply={reply}>
            <div className={flashRing}>
              {message.replyTo && <Quote reply={message.replyTo} onJumpTo={onJumpTo} tone="plain" />}
              <p className="text-style-body-small whitespace-pre-line text-text-primary">{message.text}</p>
            </div>
          </Replyable>
        </div>
        {promptList}
        {attachment}
        {after}
      </Fragment>
    )
  }

  return (
    <div data-message-id={message.id} className={`u-message flex flex-col items-end ${startsRun ? 'mt-12' : 'mt-2'}`}>
      <Replyable side="right" onReply={reply}>
      {message.voice ? (
        <VoiceMessage durationMs={message.voice.durationMs} transcript={message.text} />
      ) : (
        // Figma's own bubble (16809:4985) is a sent-message tail, not a
        // uniform rounded-16: the corner nearest the sender — bottom-right,
        // since this is the user's own side — comes to a point. The fill is
        // a diagonal gradient, not the flat `brand-default` token, which is
        // one more step removed from either of the gradient's own stops.
        <div
          className={`text-style-body-small max-w-[283px] whitespace-pre-line rounded-tl-16 rounded-tr-16 rounded-bl-16 px-17 py-10 text-text-strong ${flash ? 'ring-4 ring-[#FFE270]/60' : ''}`}
          style={{ background: 'linear-gradient(135deg, #FFE270, #FF993B)' }}
        >
          {message.replyTo && <Quote reply={message.replyTo} onJumpTo={onJumpTo} tone="bubble" />}
          <p>{message.text}</p>
        </div>
      )}
      </Replyable>
      {attachment}
    </div>
  )
}
