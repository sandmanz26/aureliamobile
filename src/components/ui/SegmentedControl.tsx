interface SegmentedControlProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex gap-4 rounded-full bg-background-elevated p-4">
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`text-style-label rounded-full px-20 py-8 transition-colors ${
              active ? 'bg-surface-default text-text-strong' : 'bg-transparent text-text-secondary'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
