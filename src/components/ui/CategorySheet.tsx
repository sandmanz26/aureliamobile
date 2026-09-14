import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'
import type { CategoryFilter } from '../../lib/sessions'
import { CATEGORY_FILTERS } from '../../lib/sessions'

/**
 * Figma 16523:18461 — "All Categories" as a bottom sheet rather than a link.
 *
 * The category row on the shelf only shows what fits; this is the whole list,
 * with the one in force marked rather than merely tinted. Picking closes it,
 * because a filter sheet that stays open hides the thing it just changed.
 */
export function CategorySheet({
  selected,
  onSelect,
  onClose,
}: {
  selected: CategoryFilter
  onSelect: (category: CategoryFilter) => void
  onClose: () => void
}) {
  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        className="u-sheet flex max-h-[80dvh] w-full max-w-[402px] flex-col rounded-t-24 bg-surface-default px-20 pb-24 pt-24 lg:max-w-[560px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-16">
          <h2 className="text-style-title-large text-text-primary">All Categories</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="u-press flex size-32 shrink-0 items-center justify-center rounded-full text-icon-default"
          >
            <X size={24} />
          </button>
        </div>

        <div className="-mx-8 mt-16 overflow-y-auto">
          {CATEGORY_FILTERS.map((filter) => {
            const active = filter === selected
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  onSelect(filter)
                  onClose()
                }}
                aria-current={active}
                className={`flex w-full items-center justify-between gap-16 rounded-16 px-12 py-16 text-left ${
                  active ? 'bg-[#ff881b]/10' : ''
                }`}
              >
                {/* The bare name, not categoryLabel — the shelf chips carry the
                    library count because they compete for a tap, and a full-page
                    list of names reads better without it. */}
                <span className="text-style-body text-text-primary">{filter}</span>
                {active && <Check size={20} className="shrink-0 text-text-primary" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
