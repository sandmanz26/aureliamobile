import { Info, Sparkles } from 'lucide-react'

/**
 * Figma "Free Limit" — what the cockpit says when you have used up the free
 * plan's creations.
 *
 * It sits above the composer rather than in the thread, because it is not
 * something Aurelia said: it is the product speaking about itself. Putting it
 * in the transcript would make the limit look like part of the conversation,
 * and it would scroll away.
 *
 * Two ways out, and the order is the point. **New Session** is first and solid
 * because it costs nothing and is what most people want; **Upgrade** is second
 * and outlined because the screen is already interrupting them and a filled
 * paywall button on top of that reads as a toll gate.
 */
export function FreeLimitNotice({
  resetAt,
  onNewSession,
  onUpgrade,
}: {
  /** When the allowance comes back, already formatted — "9:55 PM". */
  resetAt: string
  onNewSession: () => void
  onUpgrade: () => void
}) {
  return (
    <div className="flex flex-col gap-12 rounded-[20px] bg-surface-default p-16 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-8">
        <span className="mt-1 flex size-20 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-text-inverse">
          <Info size={13} strokeWidth={2.5} />
        </span>
        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-[14px] leading-[19px] text-text-primary">Session paused until {resetAt}</p>
          <p className="text-[12px] font-light leading-[18px] text-[#525252]">
            You’ve reached your current creation limit. You can continue creating when your usage resets at{' '}
            {resetAt}, or upgrade to keep going now.
          </p>
        </div>
      </div>

      <div className="flex gap-12">
        <button
          type="button"
          onClick={onNewSession}
          className="u-press flex h-44 flex-1 items-center justify-center rounded-full bg-interactive-primary text-[14px] leading-[19px] text-text-inverse"
        >
          New Session
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="u-press flex h-44 flex-1 items-center justify-center gap-8 rounded-full border border-[#d6d6d6] text-[14px] leading-[19px] text-text-primary"
        >
          <Sparkles size={16} className="text-[#FF881B]" />
          Upgrade
        </button>
      </div>
    </div>
  )
}
