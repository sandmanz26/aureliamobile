import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Star, X } from 'lucide-react'
import type { Reward } from '../../lib/challenges'
import { CoinMark } from './CoinPill'

const ORDINALS: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

/**
 * The podium-with-a-star mark the Rewards sheet opens on. Lucide has no
 * single icon for it, so it's three bars and a `Star`, coloured with the
 * same gold-to-orange gradient as the coin mark rather than traced as a
 * one-off SVG — the shape Figma draws, in the app's own palette.
 */
function RewardsMark() {
  const gradient = 'linear-gradient(160deg, #ffe682, #ff881b)'
  const bars = [
    { height: 18, order: 1 },
    { height: 28, order: 2 },
    { height: 14, order: 3 },
  ]
  return (
    <div className="relative flex h-40 w-44 items-end justify-center gap-4">
      <Star size={16} fill="#ff881b" className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#ff881b]" />
      {bars.map((bar) => (
        <span
          key={bar.order}
          className="w-10 rounded-t-4"
          style={{ height: bar.height, background: gradient, order: bar.order }}
        />
      ))}
    </div>
  )
}

/**
 * "Rewards for Winners!" — what the Rewards pill on Challenge Detail opens.
 * Fixed prizes for the top three, not tied to who currently holds them: the
 * sheet answers "what do I get," which does not change while the board does.
 */
export function RewardsSheet({ rewards, onClose }: { rewards: Reward[]; onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        className="u-sheet flex w-full max-w-[402px] flex-col rounded-t-24 bg-surface-default px-20 pb-24 pt-20 lg:max-w-[560px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-16">
          <RewardsMark />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="u-press flex size-32 shrink-0 items-center justify-center rounded-full text-icon-default"
          >
            <X size={24} />
          </button>
        </div>

        <h2 className="text-style-title-large mt-16 text-text-primary">Rewards for Winners!</h2>

        <div className="mt-20 flex flex-col gap-12">
          {rewards.map((reward) => (
            <div
              key={reward.rank}
              className="flex items-center justify-between gap-16 rounded-16 border border-border-subtle px-16 py-14"
            >
              <span className="text-style-body font-semibold text-text-primary">
                {ORDINALS[reward.rank] ?? `${reward.rank}th`}
              </span>
              <div className="flex flex-col items-end gap-4">
                <span className="flex items-center gap-6">
                  <CoinMark size={18} />
                  <span className="text-style-body font-semibold tabular-nums text-text-primary">
                    {reward.coins.toLocaleString()}
                  </span>
                </span>
                <span className="text-style-caption text-text-secondary">{reward.prize}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 h-4 w-40 rounded-full bg-border-default" aria-hidden="true" />
      </div>
    </div>,
    document.body,
  )
}
