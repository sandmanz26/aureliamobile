import { createPortal } from 'react-dom'
import { ArrowUp, Check, Image, Music, Plus, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FilterChips } from './FilterChips'
import type { FilterId } from './FilterChips'
import { ALL_OPTIONS, EXPERIMENTS, FROM_DIAGNOSIS } from '../../chat/addOptions'
import type { AddOption } from '../../chat/addOptions'
import { useUiVersion } from '../../versions/useUiVersion'

interface AddSheetProps {
  added: string[]
  onToggle: (id: string) => void
  onApply: () => void
  onClose: () => void
  /** The version this will build, e.g. "Sleep meditation v1.5" — shown in v3's summary. */
  nextLabel?: string
  /**
   * v4 (U051, D6): Aurelia's proposals for this thread, listed first and
   * selected with everything else in one selection. Absent in v1–v3.
   */
  suggestions?: AddOption[]
}

/**
 * The sheet behind the composer's plus.
 *
 * The composer answers "tell Aurelia something"; this answers "what could I
 * ask for?" — a menu of the changes Aurelia can already argue for, and a
 * second set it is frankly guessing at. Keeping those two apart is the point
 * of the sheet: a predicted score and a suggestion to try something are not
 * the same kind of claim, and a single undifferentiated list would present
 * them as if they were.
 */
function matches(option: AddOption, filter: FilterId, added: string[]) {
  return filter === 'all' ? true : filter === 'selected' ? added.includes(option.id) : option.kind === filter
}

/**
 * The filter at the top of the sheet (v2+, U045; moved here from the thread
 * on team feedback). Narrows both sections at once; a section with nothing
 * left is hidden, and an empty result offers the way back to All.
 */
function useSheetFilter(added: string[], options: AddOption[] = ALL_OPTIONS) {
  const [filter, setFilter] = useState<FilterId>('all')
  const count = (id: FilterId) => options.filter((o) => matches(o, id, added)).length
  const only = (options: AddOption[]) => options.filter((o) => matches(o, filter, added))
  return { filter, setFilter, count, only }
}

function NothingHere({ filter, onAll }: { filter: FilterId; onAll: () => void }) {
  return (
    <div className="flex min-h-120 w-full flex-col items-start justify-center gap-8 rounded-[20px] border border-dashed border-border-subtle px-16 py-20">
      <p className="text-style-body-small text-text-secondary">
        {filter === 'selected' ? 'Nothing selected yet.' : 'No changes of this kind here.'}
      </p>
      <button type="button" onClick={onAll} className="text-style-body-small text-[#ff881b]">
        Show all {ALL_OPTIONS.length}
      </button>
    </div>
  )
}

/** Largest predicted gain among what is picked — never a sum (review D4). */
function bestExpected(added: string[]) {
  return ALL_OPTIONS.filter((o) => added.includes(o.id) && o.improveScore).reduce(
    (max, o) => Math.max(max, Number.parseFloat(o.improveScore ?? '0')),
    0,
  )
}

export function AddSheet(props: AddSheetProps) {
  const v3 = useUiVersion() >= 3
  return v3 ? <AddSheetV3 {...props} /> : <AddSheetV1 {...props} />
}

function AddSheetV1({ added, onToggle, onApply, onClose }: AddSheetProps) {
  const v2 = useUiVersion() >= 2
  const { filter, setFilter, count, only } = useSheetFilter(added)
  const diagnosis = v2 ? only(FROM_DIAGNOSIS) : FROM_DIAGNOSIS
  const experiments = v2 ? only(EXPERIMENTS) : EXPERIMENTS
  const best = bestExpected(added)
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add to this session"
        onClick={(event) => event.stopPropagation()}
        className="u-sheet flex max-h-[85vh] w-full sm:max-w-[480px] flex-col gap-20 overflow-y-auto rounded-t-24 bg-surface-default px-20 pb-24 pt-20 lg:max-w-[520px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="u-press -mr-4 -mt-4 flex size-32 shrink-0 items-center justify-center self-end rounded-full text-icon-strong"
        >
          <X size={20} />
        </button>

        {v2 && (
          <div className="-mt-8">
            <FilterChips filter={filter} onChange={setFilter} count={count} />
            {/* What the picked set adds up to — the largest expected gain,
                not a sum: two changes' predictions do not stack (the thread's
                old "36% combined" did, review D4). */}
            <p className="text-style-caption mt-8 flex items-center gap-6 text-text-secondary" aria-live="polite">
              <span className="tabular-nums">
                {added.length} of {ALL_OPTIONS.length} selected
              </span>
              {best > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="rounded-full bg-[#ECFBED] px-6 py-2 text-success-600 tabular-nums">↑ up to {best}% expected</span>
                </>
              )}
            </p>
          </div>
        )}

        {diagnosis.length > 0 && (
          <Section title="Improve based on diagnosis" options={diagnosis} added={added} onToggle={onToggle} />
        )}
        {experiments.length > 0 && <Section title="Experiment" options={experiments} added={added} onToggle={onToggle} />}
        {diagnosis.length + experiments.length === 0 && <NothingHere filter={filter} onAll={() => setFilter('all')} />}

        <button
          type="button"
          onClick={onApply}
          disabled={added.length === 0}
          className="text-style-body u-press mx-auto flex h-52 items-center gap-8 rounded-full border border-border-subtle bg-surface-default px-24 text-text-strong disabled:opacity-40"
        >
          <Sparkles size={16} />
          Apply changes
          <span className="text-style-label flex size-22 items-center justify-center rounded-full bg-icon-strong text-text-inverse">
            {added.length}
          </span>
        </button>
      </div>
    </div>,
    document.body,
  )
}

function Section({
  title,
  options,
  added,
  onToggle,
}: {
  title: string
  options: AddOption[]
  added: string[]
  onToggle: (id: string) => void
}) {
  return (
    <section>
      <h2 className="text-style-body-small text-text-primary">{title}</h2>
      {/* Bleeds past the sheet's padding so a card can sit half off the edge —
          which is what says there are more of them than fit. */}
      <div className="-mx-20 mt-12 flex gap-12 overflow-x-auto px-20 pb-4">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            added={added.includes(option.id)}
            onToggle={() => onToggle(option.id)}
          />
        ))}
      </div>
    </section>
  )
}

function OptionCard({
  option,
  added,
  onToggle,
}: {
  option: AddOption
  added: boolean
  onToggle: () => void
}) {
  return (
    <article className="flex w-[212px] shrink-0 flex-col gap-12 rounded-16 border border-brand-emphasis/45 bg-surface-default p-12">
      <div className="flex gap-10">
        <img src={option.orb} alt="" className="size-44 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-style-body-small font-medium text-text-primary">{option.title}</p>
          <p className="text-style-caption line-clamp-2 text-text-secondary">{option.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        {option.improveScore ? (
          <span className="text-style-caption flex min-w-0 items-center gap-6 text-text-primary">
            <span className="truncate">Improve score</span>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#ecfbed] px-8 py-2">
              <ArrowUp size={11} className="text-success-600" />
              {option.improveScore}
            </span>
          </span>
        ) : (
          <span className="text-style-caption flex min-w-0 items-center gap-6 text-text-secondary">
            {option.channel === 'Visuals' ? <Image size={13} /> : <Music size={13} />}
            <span className="truncate">{option.channel}</span>
          </span>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={added}
          className={`text-style-label flex h-32 shrink-0 items-center gap-4 rounded-full border px-10 ${
            added
              ? 'border-transparent bg-brand-default text-text-strong'
              : 'border-border-subtle bg-surface-default text-text-primary'
          }`}
        >
          {added ? <Check size={12} /> : <Plus size={12} />}
          {added ? 'Added' : 'Add'}
        </button>
      </div>
    </article>
  )
}

/**
 * Version 3 (U038): the same choices as a list you can scan, and a summary
 * above Apply that says what you are about to get — which changes, what the
 * diagnosis ones are expected to do, that the experiments are untested, and
 * the version it will build. Before, Apply showed only a count, so the
 * decision was made blind and the result arrived without a reason.
 *
 * The expected effect is shown per change and as "up to" the largest one,
 * never summed: separate percentage lifts do not add (logic review D4).
 */
function AddSheetV3({ added, onToggle, onApply, onClose, nextLabel, suggestions = [] }: AddSheetProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // One list: the thread's proposals first, then whatever the sheet offers
  // that is not already among them.
  const suggested = new Set(suggestions.map((option) => option.id))
  const everything = [...suggestions, ...ALL_OPTIONS.filter((option) => !suggested.has(option.id))]
  const { filter, setFilter, count, only } = useSheetFilter(added, everything)
  const proposals = only(suggestions)
  const diagnosis = only(FROM_DIAGNOSIS.filter((option) => !suggested.has(option.id)))
  const experimentOptions = only(EXPERIMENTS.filter((option) => !suggested.has(option.id)))
  const picked = everything.filter((option) => added.includes(option.id))
  const predicted = picked.filter((option) => option.improveScore)
  const experiments = picked.filter((option) => !option.improveScore)
  const best = predicted.reduce((max, option) => Math.max(max, Number.parseFloat(option.improveScore ?? '0')), 0)

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Change this session"
        onClick={(event) => event.stopPropagation()}
        className="u-sheet flex max-h-[88dvh] w-full flex-col rounded-t-24 bg-surface-default sm:max-w-[480px] lg:max-w-[560px]"
      >
        <div className="flex items-start justify-between gap-16 px-20 pt-24">
          <div className="min-w-0">
            <h2 className="text-style-title text-text-primary">Change this session</h2>
            <p className="text-style-body-small mt-2 text-text-secondary">Pick what to change — Aurelia builds a new version with it.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="u-press -mr-6 flex size-32 shrink-0 items-center justify-center rounded-full text-icon-strong"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-16 px-20">
          <FilterChips filter={filter} onChange={setFilter} count={count} />
        </div>

        <div className="mt-12 flex-1 overflow-y-auto px-20 pb-16">
          {proposals.length > 0 && (
            <ListSection
              title="Aurelia suggests"
              hint="Proposed in the chat for this session."
              options={proposals}
              added={added}
              onToggle={onToggle}
            />
          )}
          {diagnosis.length > 0 && (
            <ListSection
              title="Based on your diagnosis"
              hint="Aurelia expects these to help."
              options={diagnosis}
              added={added}
              onToggle={onToggle}
            />
          )}
          {experimentOptions.length > 0 && (
            <ListSection
              title="Experiments"
              hint="Untested — you’ll find out when you listen."
              options={experimentOptions}
              added={added}
              onToggle={onToggle}
            />
          )}
          {proposals.length + diagnosis.length + experimentOptions.length === 0 && (
            <NothingHere filter={filter} onAll={() => setFilter('all')} />
          )}
        </div>

        {/* The summary: what Apply will actually do. */}
        <div className="border-t border-border-subtle px-20 pb-[calc(20px+env(safe-area-inset-bottom))] pt-16">
          {picked.length === 0 ? (
            <p className="text-style-body-small text-center text-text-secondary">Nothing picked yet — add at least one change.</p>
          ) : (
            <div className="rounded-16 bg-[#FFF8EC] p-12">
              <div className="flex items-baseline justify-between gap-12">
                <p className="text-style-body-small font-medium text-text-primary">
                  You’ll get {picked.length} {picked.length === 1 ? 'change' : 'changes'}
                </p>
                {nextLabel && <p className="text-style-caption truncate text-text-secondary">as {nextLabel}</p>}
              </div>
              <div className="mt-8 flex flex-wrap gap-6">
                {picked.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onToggle(option.id)}
                    aria-label={`Remove ${option.title}`}
                    className="u-press flex h-28 items-center gap-6 rounded-full bg-surface-default pl-4 pr-8 text-[12px] text-text-primary shadow-sm"
                  >
                    <img src={option.orb} alt="" className="size-20 rounded-full object-cover" />
                    {option.title}
                    <X size={12} className="text-icon-default" />
                  </button>
                ))}
              </div>
              <ul className="text-style-caption mt-10 flex flex-col gap-4 text-text-secondary">
                {predicted.length > 0 && (
                  <li className="flex items-center gap-6">
                    <ArrowUp size={12} className="text-success-600" />
                    Expected: up to <span className="font-medium text-success-600">+{best}%</span> improve score
                  </li>
                )}
                {experiments.length > 0 && (
                  <li className="flex items-center gap-6">
                    <Sparkles size={12} className="text-[#E58A1F]" />
                    {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} — effect unknown until you listen
                  </li>
                )}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={onApply}
            disabled={picked.length === 0}
            className="text-style-body u-press mt-12 flex h-52 w-full items-center justify-center gap-8 rounded-16 bg-[#331B04] text-text-inverse disabled:opacity-40"
          >
            <Sparkles size={16} />
            {picked.length === 0 ? 'Apply changes' : `Apply ${picked.length} ${picked.length === 1 ? 'change' : 'changes'}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ListSection({
  title,
  hint,
  options,
  added,
  onToggle,
}: {
  title: string
  hint: string
  options: AddOption[]
  added: string[]
  onToggle: (id: string) => void
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="text-style-body-small font-medium text-text-primary">{title}</h3>
      <p className="text-style-caption text-text-secondary">{hint}</p>
      <ul className="mt-8 flex flex-col">
        {options.map((option) => {
          const on = added.includes(option.id)
          return (
            <li key={option.id} className="flex items-center gap-12 border-b border-border-subtle py-12 last:border-b-0">
              <img src={option.orb} alt="" className="size-44 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-style-body-small text-text-primary">{option.title}</p>
                <p className="text-style-caption line-clamp-2 text-text-secondary">{option.description}</p>
                {option.improveScore ? (
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ecfbed] px-6 py-1 text-[11px] text-success-600">
                    <ArrowUp size={10} /> {option.improveScore} expected
                  </span>
                ) : (
                  <span className="mt-4 inline-flex items-center gap-4 text-[11px] text-text-secondary">
                    {option.channel === 'Visuals' ? <Image size={11} /> : <Music size={11} />}
                    {option.channel}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggle(option.id)}
                aria-pressed={on}
                className={`text-style-label u-press flex h-32 shrink-0 items-center gap-4 rounded-full border px-12 ${
                  on ? 'border-transparent bg-brand-default text-text-strong' : 'border-border-subtle bg-surface-default text-text-primary'
                }`}
              >
                {on ? <Check size={12} /> : <Plus size={12} />}
                {on ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
