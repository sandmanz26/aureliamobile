import { createPortal } from 'react-dom'
import { Check, Image, Music, Plus, WandSparkles, X } from 'lucide-react'
import { useEffect } from 'react'
import type { AddOption } from '../../chat/addOptions'
import type { Recommendation } from './RecommendationCard'

/**
 * Review changes (Figma "Review", 16906:5067; U066): the Chapter card opened.
 * The proposed changes come ticked — the person takes away what they do not
 * want, the product's standing rule — and experiments sit below as cards to
 * add. One full-width Apply carries the total.
 */
interface ReviewSheetProps {
  title: string
  changes: Recommendation[]
  applied: string[]
  onToggle: (id: string) => void
  experiments: AddOption[]
  picks: string[]
  onTogglePick: (id: string) => void
  /** v5's "Why?": what the proposals are based on. */
  basis?: string
  onApply: () => void
  onClose: () => void
}

const ROW_SHADOW = '0 4px 14px rgba(0, 0, 0, 0.04)'

export function ReviewSheet({ title, changes, applied, onToggle, experiments, picks, onTogglePick, basis, onApply, onClose }: ReviewSheetProps) {
  const count = applied.length + picks.length
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title}: review changes`}
        onClick={(event) => event.stopPropagation()}
        className="u-sheet flex max-h-[88vh] w-full flex-col rounded-t-32 bg-surface-default sm:max-w-[480px] lg:max-w-[520px]"
      >
        <div className="flex items-center justify-between px-22 pb-8 pt-28">
          <h2 className="text-[22px] leading-[28px] text-text-primary">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="u-press -mr-6 flex size-36 items-center justify-center rounded-full text-icon-strong">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-24 overflow-y-auto px-22 pb-16">
          <section>
            <h3 className="text-style-body-small text-text-primary">New changes</h3>
            {basis && <p className="text-style-caption mt-4 text-text-secondary">Why: {basis}</p>}
            <ul className="mt-12 flex flex-col gap-12">
              {changes.map((change) => {
                const on = applied.includes(change.id)
                return (
                  <li key={change.id}>
                    <label className="flex cursor-pointer items-center gap-14 rounded-[20px] bg-surface-default px-16 py-18" style={{ boxShadow: ROW_SHADOW }}>
                      <img src={change.orb} alt="" className="size-42 shrink-0 rounded-full object-cover" />
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="text-[18px] leading-[24px] text-text-primary">{change.title}</span>
                        <span className="text-style-caption text-text-secondary">{change.description}</span>
                      </span>
                      <input type="checkbox" checked={on} onChange={() => onToggle(change.id)} className="sr-only" />
                      <span
                        aria-hidden="true"
                        className={`flex size-32 shrink-0 items-center justify-center rounded-8 border ${on ? 'border-[#331B04] bg-[#331B04] text-text-inverse' : 'border-border-subtle bg-surface-default'}`}
                      >
                        {on && <Check size={16} />}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>

          {experiments.length > 0 && (
            <section>
              <h3 className="text-style-body-small text-text-primary">Experiment</h3>
              {/* Bleeds past the sheet's padding so a card sits half off the
                  edge — which is what says there are more than fit. */}
              <div className="-mx-22 mt-12 flex gap-12 overflow-x-auto px-22 pb-4">
                {experiments.map((option) => {
                  const on = picks.includes(option.id)
                  return (
                    <article key={option.id} className="flex w-[245px] shrink-0 flex-col gap-14 rounded-16 border border-[#CFE3F7] bg-surface-default p-16">
                      <div className="flex gap-12">
                        <img src={option.orb} alt="" className="size-42 shrink-0 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="text-style-body-small text-text-primary">{option.title}</p>
                          <p className="text-style-caption line-clamp-2 text-text-secondary">{option.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-style-caption flex items-center gap-6 text-text-primary">
                          {option.channel === 'Visuals' ? <Image size={14} /> : <Music size={14} />}
                          {option.channel}
                        </span>
                        <button
                          type="button"
                          onClick={() => onTogglePick(option.id)}
                          aria-pressed={on}
                          className={`text-style-label flex h-32 items-center gap-4 rounded-8 border px-12 ${on ? 'border-transparent bg-brand-default text-text-strong' : 'border-border-subtle bg-surface-default text-text-primary'}`}
                        >
                          {on ? <Check size={13} /> : <Plus size={13} />}
                          {on ? 'Added' : 'Add'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <div className="px-22 pb-[max(20px,env(safe-area-inset-bottom))] pt-8">
          <button
            type="button"
            onClick={onApply}
            disabled={count === 0}
            className="text-style-label u-press flex h-52 w-full items-center justify-center gap-6 rounded-12 bg-[#331B04] text-text-inverse disabled:opacity-50"
          >
            <WandSparkles size={14} aria-hidden="true" />
            Apply changes ({count})
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
