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
 *
 * **The limit is per session, and a new session is never limited** (U036,
 * product decision: the free plan should push people to explore — try another
 * idea — rather than polish one session forever). The count was always per
 * thread in ChatPage; the copy said otherwise. "You've reached your current
 * creation limit … resets at 12:00 AM" read as *the whole account* being shut
 * until midnight, which hid the free way out behind the button that offered
 * it. It now says what is paused (this session's edits), that a new session is
 * free and uncounted, and the button carries "Free" so the answer is on the
 * thing you press.
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
          <p className="text-[14px] leading-[19px] text-text-primary">Edits on this session paused until {resetAt}</p>
          <p className="text-[12px] font-light leading-[18px] text-[#525252]">
            You’ve used this session’s free edits. A new session is always free and doesn’t count toward the
            limit — start one to try another idea, or upgrade to keep refining this one now.
          </p>
        </div>
      </div>

      <div className="flex gap-12">
        <button
          type="button"
          onClick={onNewSession}
          className="u-press flex h-44 flex-1 items-center justify-center gap-8 rounded-full bg-interactive-primary text-[14px] leading-[19px] text-text-inverse"
        >
          New Session
          <span className="rounded-full bg-white/18 px-6 py-1 text-[11px] leading-[14px]">Free</span>
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
