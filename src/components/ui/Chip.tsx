interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-16 py-8 text-style-label transition-colors ${
        active ? 'bg-icon-default text-text-inverse' : 'bg-background-elevated text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}
