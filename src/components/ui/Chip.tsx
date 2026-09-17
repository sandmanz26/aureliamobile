interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

/**
 * Figma `Tab Set_notClear` (16538:21547) — the filter pill, shared by every
 * screen that has a row of them.
 *
 * An unselected chip is an **outline**, not a grey fill. It was rendering as
 * `background-elevated`, which gave the row five solid blocks and left the
 * selected one competing with them rather than standing out of them.
 *
 * `#D6D6D6` is that outline and has no variable anywhere in the Figma file —
 * it is written out here for the same reason `#FF881B` is, and is listed in
 * DESIGN-SYSTEM-HISTORY.md under the colours still waiting for one.
 */
export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`u-press text-style-label shrink-0 whitespace-nowrap rounded-full border px-16 py-8 ${
        active
          ? 'border-interactive-primary bg-interactive-primary text-text-inverse'
          : 'border-[#D6D6D6] bg-transparent text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}
