import { createPortal } from 'react-dom'
import { Check, CircleX } from 'lucide-react'

interface PublishSheetProps {
  state: 'publishing' | 'published' | 'unpublished'
  onCancel: () => void
  onView: () => void
  /** Dismiss, for the state that only reports. */
  onDone?: () => void
}

// Figma "Chat: Publish" — the publishing / published bottom sheet.
// 40px top padding, 32px gap, 20px Medium heading over 14px Light body.
//
// The states do not share a colour: publishing is the brand ring, success is
// green, and unpublishing is neutral. Success is the one moment the app reports
// an outcome rather than its own identity, and brand-coloured confirmation
// reads as decoration where green reads as "done".
//
// Unpublishing is neither. It is a reversal, not a failure, so it takes the
// neutral surface rather than a warning colour — the sheet is there to say what
// happened and that nothing was lost, not to make the user feel caught out.
export function PublishSheet({ state, onCancel, onView, onDone }: PublishSheetProps) {
  const publishing = state === 'publishing'
  const unpublished = state === 'unpublished'

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40">
      <div className="u-sheet flex w-full max-w-[402px] flex-col items-center gap-32 rounded-t-24 bg-surface-default px-20 pb-24 pt-40">
        {unpublished ? (
          <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated">
            <CircleX size={32} strokeWidth={2} className="text-text-primary" />
          </span>
        ) : publishing ? (
          <span
            className="size-64 animate-spin rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #ff881b)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)',
            }}
          />
        ) : (
          <span className="flex size-64 items-center justify-center rounded-full bg-[#c7efc0]">
            <Check size={32} strokeWidth={3} className="text-[#2f9e44]" />
          </span>
        )}

        <div className="flex flex-col gap-8 text-center">
          <h2 className="text-style-title text-text-primary">
            {unpublished
              ? 'Session Unpublished'
              : publishing
                ? 'Publishing your Session…'
                : 'Session Published!'}
          </h2>
          <p className="text-style-body-small font-light! text-text-secondary">
            {unpublished
              ? 'It is off the shelves, so nobody else can find or play it. Nothing you made is lost — publish it again whenever you like.'
              : publishing
                ? 'Hang tight! This’ll only take a moment.'
                : 'Your session is now ready to view.'}
          </p>
        </div>

        {unpublished ? (
          <button
            type="button"
            onClick={onDone ?? onCancel}
            className="text-style-body u-press w-full rounded-full border border-text-primary py-14 text-center text-text-primary"
          >
            Done
          </button>
        ) : publishing ? (
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
            className="text-style-body u-press w-full rounded-full border border-text-primary py-14 text-center text-text-primary"
          >
            View Session
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
