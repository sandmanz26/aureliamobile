import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Captions } from 'lucide-react'

/**
 * Renaming a session, from the pencil on Session settings' title card
 * (Figma "Session/Settings/Script" 16883:13096, U041).
 *
 * The frame's pencil is prototyped to the Objective sheet — a copied link —
 * so this is that sheet's layout asking the right question. Only the name is
 * editable: the version ("v1.3") is set by each build and shown beside the
 * field rather than typed, so a rename can neither drop it nor fake one.
 * Save waits for a name that is non-empty and different.
 */
export function RenameSessionSheet({
  name,
  version,
  onSave,
  onClose,
}: {
  name: string
  /** " v1.3", or "" when the session has no version yet. */
  version: string
  onSave: (next: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(name)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const next = value.trim().replace(/\s+/g, ' ')
  const ready = next.length > 0 && next !== name

  function save() {
    if (!ready) return
    onSave(next)
    onClose()
  }

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/20" onClick={onClose}>
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
        className="u-sheet flex w-full flex-col gap-32 rounded-t-24 bg-surface-default px-20 pb-32 pt-40 sm:max-w-[480px] lg:max-w-[560px]"
      >
        <div className="flex flex-col gap-24">
          <span className="flex justify-center text-[#FF881B]">
            <Captions size={64} strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-8 text-center">
            <h2 className="text-style-title text-text-primary">Rename your session</h2>
            <p className="text-[14px] font-light leading-[21px] text-[#525252]">
              The name you’ll see in Sessions, the player and your Analytics.
            </p>
          </div>
        </div>

        <label className="flex h-44 w-full items-center gap-8 rounded-full border border-[#D6D6D6] bg-surface-default pl-16 pr-16 focus-within:border-brand-emphasis">
          <input
            autoFocus
            value={value}
            maxLength={60}
            onChange={(event) => setValue(event.target.value)}
            placeholder="E.g. Evening wind-down"
            aria-label="Session name"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-[19px] text-text-primary outline-none placeholder:font-light placeholder:text-[#626262]"
          />
          {version && (
            <span className="shrink-0 text-[14px] font-light leading-[19px] text-[#7B7B7B]" title="Set by each build">
              {version.trim()}
            </span>
          )}
        </label>

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
