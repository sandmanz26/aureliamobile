import { ArrowUp, Check, Image, Music, Plus, Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'
import orb432hz from '../../assets/orb-432hz.png'
import orbIncreaseYellow from '../../assets/orb-increase-yellow.png'
import orbLessMovement from '../../assets/orb-less-movement.png'

export interface AddOption {
  id: string
  title: string
  description: string
  orb: string
  /** Diagnosis cards carry the score they would move; experiments carry the
   *  channel they would change instead — the two are different claims. */
  improveScore?: string
  channel?: 'Audio' | 'Visuals'
}

/** What Aurelia can improve from what it already knows about this session. */
const FROM_DIAGNOSIS: AddOption[] = [
  {
    id: 'yellow',
    title: 'Increase yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '3%',
    orb: orbIncreaseYellow,
  },
  {
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '6%',
    orb: orbLessMovement,
  },
]

/** Things Aurelia cannot predict the effect of, offered as experiments. */
const EXPERIMENTS: AddOption[] = [
  {
    id: 'aulos',
    title: 'Aulos (Greek flute)',
    description: 'Experiment adding a touch of ancient Greece flute',
    channel: 'Audio',
    orb: orb432hz,
  },
  {
    id: 'art-deco',
    title: 'Art Deco',
    description: 'How about adding an Art Deco style to the visuals?',
    channel: 'Visuals',
    orb: orbLessMovement,
  },
]

interface AddSheetProps {
  added: string[]
  onToggle: (id: string) => void
  onApply: () => void
  onClose: () => void
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
export function AddSheet({ added, onToggle, onApply, onClose }: AddSheetProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add to this session"
        onClick={(event) => event.stopPropagation()}
        className="u-sheet flex max-h-[85vh] w-full max-w-[402px] flex-col gap-20 overflow-y-auto rounded-t-24 bg-surface-default px-20 pb-24 pt-20 lg:max-w-[520px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="u-press -mr-4 -mt-4 flex size-32 shrink-0 items-center justify-center self-end rounded-full text-icon-strong"
        >
          <X size={20} />
        </button>

        <Section title="Improve based on diagnosis" options={FROM_DIAGNOSIS} added={added} onToggle={onToggle} />
        <Section title="Experiment" options={EXPERIMENTS} added={added} onToggle={onToggle} />

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
    </div>
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
