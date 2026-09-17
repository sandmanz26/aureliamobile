import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Target } from 'lucide-react'

/**
 * Figma "drawer" inside Session/Insights/Chapters/Objective (16659:41284).
 *
 * The pencil on the Objective card had no handler at all — the one editable
 * thing on the Insights screen, and it did nothing. This is what the frame says
 * it opens: a bottom sheet, 410 tall, asking for the goal the whole screen is
 * measured against.
 *
 * Save is disabled until something is typed, which the frame draws as the same
 * button at 50% — not a different colour, so it reads as "not yet" rather than
 * "not for you".
 */
export function ObjectiveSheet({
  objective,
  onSave,
  onClose,
}: {
  objective: string
  onSave: (next: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(objective)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const ready = value.trim().length > 0

  function save() {
    if (!ready) return
    onSave(value.trim())
    onClose()
  }

  return createPortal(
    <div
      className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/20"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
        /* 40 above, 32 below, 20 at the sides, 32 between the three blocks. */
        className="u-sheet flex w-full max-w-[402px] flex-col gap-32 rounded-t-24 bg-surface-default px-20 pb-32 pt-40 lg:max-w-[560px]"
      >
        <div className="flex flex-col gap-24">
          {/* 64 in the frame — the icon is the sheet's whole illustration, and
              it carries the brand orange rather than the gold. #FF881B is the
              one still without a variable; see DESIGN-SYSTEM-HISTORY.md. */}
          <span className="flex justify-center text-[#FF881B]">
            <Target size={64} strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-8 text-center">
            <h2 className="text-style-title text-text-primary">Write your Objective</h2>
            {/* 14 Light at 150%, which is 21 — the frame's own leading rather
                than the scale's 20. */}
            <p className="text-[14px] font-light leading-[21px] text-[#525252]">
              Set a goal to guide your experience and track your progress.
            </p>
          </div>
        </div>

        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="E.g. Improve my sleep pattern"
          aria-label="Objective"
          className="h-44 w-full rounded-full border border-[#D6D6D6] bg-surface-default pl-16 pr-12 text-[14px] leading-[19px] text-text-primary outline-none placeholder:font-light placeholder:text-[#626262] focus:border-brand-emphasis"
        />

        <div className="flex gap-12">
          <button
            type="button"
            onClick={onClose}
            className="u-press flex h-47 flex-1 items-center justify-center rounded-[40px] border border-[#D6D6D6] text-[16px] leading-[19px] text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!ready}
            className="u-press flex h-47 flex-1 items-center justify-center rounded-[40px] bg-[#331B04] text-[16px] leading-[19px] text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
