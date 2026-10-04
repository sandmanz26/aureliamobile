import { Fragment } from 'react'
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
}: ChatMessageItemProps) {
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
        <div className={`u-message pr-40 ${startsRun ? 'mt-12' : 'mt-2'}`}>
          <p className="text-style-body-small whitespace-pre-line text-text-primary">{message.text}</p>
        </div>
        {promptList}
        {attachment}
      </Fragment>
    )
  }

  return (
    <div className={`u-message flex flex-col items-end ${startsRun ? 'mt-12' : 'mt-2'}`}>
      {message.voice ? (
        <VoiceMessage durationMs={message.voice.durationMs} transcript={message.text} />
      ) : (
        // Figma's own bubble (16809:4985) is a sent-message tail, not a
        // uniform rounded-16: the corner nearest the sender — bottom-right,
        // since this is the user's own side — comes to a point. The fill is
        // a diagonal gradient, not the flat `brand-default` token, which is
        // one more step removed from either of the gradient's own stops.
        <p
          className="text-style-body-small max-w-[283px] whitespace-pre-line rounded-tl-16 rounded-tr-16 rounded-bl-16 px-17 py-10 text-text-strong"
          style={{ background: 'linear-gradient(135deg, #FFE270, #FF993B)' }}
        >
          {message.text}
        </p>
      )}
      {attachment}
    </div>
  )
}
