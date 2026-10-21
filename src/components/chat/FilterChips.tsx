import { useLayoutEffect, useRef, useState } from 'react'
import { CheckCircle2, Eye, LayoutGrid, Music, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * The change filter: what each change acts on — what you see, what you hear,
 * how it moves — plus "Selected", so the set about to be applied can be
 * checked before pressing Apply. Each chip has an icon and a count, a kind
 * with nothing in it is not offered, and the active highlight slides between
 * chips rather than jumping.
 *
 * It lived above the opened recommendation row in the thread (v2, U017).
 * Since U045 it sits at the top of the "+" sheet instead — the sheet is where
 * the full menu of changes is, so that is where narrowing it helps; above the
 * three cards in the thread it was a toolbar for a list you could already
 * see in one glance (team feedback, Eugene).
 */
export type ChangeKind = 'visual' | 'sound' | 'movement'
export type FilterId = 'all' | ChangeKind | 'selected'

const FILTERS: { id: FilterId; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'visual', label: 'Visual', icon: Eye },
  { id: 'sound', label: 'Sound', icon: Music },
  { id: 'movement', label: 'Movement', icon: Wind },
  { id: 'selected', label: 'Selected', icon: CheckCircle2 },
]

export function FilterChips({
  filter,
  onChange,
  count,
}: {
  filter: FilterId
  onChange: (id: FilterId) => void
  /** How many items a filter would show. A kind at 0 is not offered. */
  count: (id: FilterId) => number
}) {
  const visible = FILTERS.filter((f) => f.id === 'all' || f.id === 'selected' || count(f.id) > 0)

  // The sliding highlight: measured from the active chip, so it follows the
  // chip's real width whatever its label and count.
  const rail = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  const selected = count('selected')
  useLayoutEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>(`[data-filter="${filter}"]`)
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [filter, selected])

  return (
    <div className="-mx-20 overflow-x-auto px-20 pb-4">
      <div ref={rail} role="toolbar" aria-label="Filter changes" className="relative flex w-max gap-6">
        {pill && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 rounded-full bg-text-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: pill.left, width: pill.width }}
          />
        )}
        {visible.map(({ id, label, icon: Icon }) => {
          const active = filter === id
          return (
            <button
              key={id}
              type="button"
              data-filter={id}
              aria-pressed={active}
              onClick={() => onChange(id)}
              className={`u-press relative flex h-34 shrink-0 items-center gap-6 rounded-full border px-12 text-[13px] leading-none transition-colors duration-300 ${
                active ? 'border-transparent text-text-inverse' : 'border-border-subtle bg-surface-default text-text-primary'
              }`}
            >
              <Icon size={14} />
              {label}
              <span
                className={`min-w-18 rounded-full px-5 py-2 text-center text-[11px] tabular-nums ${
                  active ? 'bg-white/20 text-text-inverse' : 'bg-background-elevated text-text-secondary'
                }`}
              >
                {count(id)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
