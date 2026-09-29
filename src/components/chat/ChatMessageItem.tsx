import { Check, CheckCheck } from 'lucide-react'
import { Fragment } from 'react'
import type { Message, Status } from '../../chat/ChatSessionContext'
import { RECOMMENDATIONS } from '../../chat/ChatSessionContext'
import { AureliaLogo } from '../ui/AureliaLogo'
import { AttachedSession } from './AttachedSession'
import { RecommendationCard } from './RecommendationCard'
import { RecommendationDeck } from './RecommendationDeck'
import { VoiceMessage } from './VoiceMessage'

/** "9:41 PM" on a message's own timestamp — a clock time, not a countdown. */
function clockTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

interface ChatMessageItemProps {
  message: Message
  /** Only the run's first bubble gets the avatar — see `ChatPage`'s run grouping. */
  startsRun: boolean
  /** Only the run's last bubble gets the timestamp. */
  endsRun: boolean
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
  endsRun,
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
        <div className={`u-message flex gap-10 pr-40 ${startsRun ? 'mt-12' : 'mt-2'}`}>
          <span className="w-24 shrink-0">{startsRun && <AureliaLogo iconSize={24} markOnly />}</span>
          <div className="min-w-0 flex-1">
            {startsRun && <p className="text-style-caption mb-2 text-text-secondary">Aurelia</p>}
            <p className="text-style-body-small whitespace-pre-line text-text-primary">{message.text}</p>
            {endsRun && <p className="text-style-caption mt-4 text-text-secondary">{clockTime(message.at)}</p>}
          </div>
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
}
