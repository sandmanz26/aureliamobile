import { Check } from 'lucide-react'

interface PublishSheetProps {
  state: 'publishing' | 'published'
  onCancel: () => void
  onView: () => void
}

// Figma "Section" 402x292 — the publishing / published bottom sheet.
// 40px top padding, 32px gap, 20px Medium heading over 14px Light body.
export function PublishSheet({ state, onCancel, onView }: PublishSheetProps) {
  const publishing = state === 'publishing'

  return (
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40">
      <div className="u-sheet flex w-full max-w-[402px] flex-col items-center gap-32 rounded-t-24 bg-surface-default px-20 pb-24 pt-40">
        {publishing ? (
          <span
            className="size-64 animate-spin rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #ff881b)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)',
            }}
          />
        ) : (
          <span
            className="flex size-64 items-center justify-center rounded-full text-text-inverse"
            style={{ background: 'linear-gradient(160deg, #ff881b, #ffd242, #ffffff)' }}
          >
            <Check size={32} strokeWidth={3} />
          </span>
        )}

        <div className="flex flex-col gap-8 text-center">
          <h2 className="text-style-title text-text-primary">
            {publishing ? 'Publishing your Session…' : 'Session Published!'}
          </h2>
          <p className="text-style-body-small font-light text-text-secondary">
            {publishing ? 'Hang tight! This’ll only take a moment.' : 'Your session is now ready to view.'}
          </p>
        </div>

        {publishing ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-style-body-small u-press w-full rounded-full py-14 text-center text-text-primary hover:bg-background-elevated"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={onView}
            className="text-style-body u-press w-full rounded-full bg-brand-default py-14 text-center text-text-strong"
          >
            View Session
          </button>
        )}
      </div>
    </div>
  )
}
