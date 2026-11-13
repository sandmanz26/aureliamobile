import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MOOD_WORDS, saveEntry, weekOf, type DailyEntry } from '../../lib/dailyCheckIn'
import { MOOD_FACES, MOOD_LABELS } from './moods'
import { WeekStrip } from './WeekStrip'

/**
 * Daily check-in (Figma Changes → Daily, 16906:5362; U068): the week with
 * today framed, five faces, "Did the session help you yesterday?", a note,
 * and Check-in. Opens with the day's answers if it already has some.
 */
interface Props {
  date: string
  initial?: DailyEntry
  onDone: (entry: DailyEntry) => void
  onClose: () => void
  /** After a check-in from the sign-in prompt: say where it went, with a way there (J081). */
  onOpenJournal?: () => void
}

export function DailyCheckInSheet({ date, initial, onDone, onClose, onOpenJournal }: Props) {
  const [mood, setMood] = useState<number | null>(initial?.mood ?? null)
  const [helped, setHelped] = useState<boolean | null>(initial?.helped ?? null)
  const [note, setNote] = useState(initial?.note ?? '')
  const [saved, setSaved] = useState<DailyEntry | null>(null)
  const week = weekOf(new Date(`${date}T12:00:00`))

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit() {
    const entry = { date, mood, helped, note: note.trim() }
    saveEntry(entry)
    if (onOpenJournal) setSaved(entry)
    else onDone(entry)
  }

  const choice = (on: boolean) =>
    `text-style-body-small u-press flex h-40 flex-1 items-center justify-center rounded-12 border ${on ? 'border-[#331B04] bg-[#331B04] text-text-inverse' : 'border-[#E4E4E4] bg-surface-default text-text-primary'}`

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daily check-in"
        onClick={(e) => e.stopPropagation()}
        className="u-sheet flex max-h-[92vh] w-full flex-col gap-28 overflow-y-auto rounded-t-32 bg-surface-default px-20 pb-[max(24px,env(safe-area-inset-bottom))] pt-24 sm:max-w-[480px] lg:mb-auto lg:mt-auto lg:rounded-32"
      >
        <div className="flex items-start justify-between">
          <h2 className="mt-20 text-[22px] leading-[28px] text-text-primary">Daily check-in</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="u-press -mr-6 flex size-36 items-center justify-center rounded-full text-icon-strong">
            <X size={22} />
          </button>
        </div>

        <WeekStrip days={week} selected={date} />

        {saved ? (
          <div className="flex flex-col gap-16" aria-live="polite">
            <div className="flex items-center gap-12 rounded-[20px] bg-[#FFF1DB] p-16">
              {saved.mood && <img src={MOOD_FACES[saved.mood - 1]} alt="" className="size-34 shrink-0" />}
              <div className="min-w-0">
                <p className="text-style-body text-text-primary">Saved to your Journal</p>
                <p className="text-style-caption text-text-secondary">Find it in your session’s About → Journal, where you can change it any time today.</p>
              </div>
            </div>
            <button type="button" onClick={onOpenJournal} className="text-style-body-small u-press h-48 w-full rounded-12 bg-[#331B04] text-text-inverse">
              Open Journal
            </button>
            <button type="button" onClick={() => onDone(saved)} className="text-style-body-small u-press h-44 w-full rounded-12 border border-[#E4E4E4] text-text-primary">
              Done
            </button>
          </div>
        ) : (
        <>

        <fieldset className="flex flex-col gap-14">
          <legend className="text-style-body-small mb-14 text-text-primary">How are you feeling today?</legend>
          <div className="flex gap-18">
            {MOOD_FACES.map((src, i) => {
              const on = mood === i + 1
              return (
                <button
                  key={src}
                  type="button"
                  aria-label={MOOD_LABELS[i]}
                  aria-pressed={on}
                  onClick={() => setMood(on ? null : i + 1)}
                  className={`u-press rounded-8 transition-transform ${on ? 'scale-110 ring-2 ring-[#331B04] ring-offset-2' : mood ? 'opacity-50' : ''}`}
                >
                  <img src={src} alt="" className="size-34" />
                </button>
              )
            })}
          </div>
          {mood && <p className="text-style-caption text-text-secondary" aria-live="polite">{MOOD_WORDS[mood - 1]}</p>}
        </fieldset>

        <fieldset className="flex flex-col">
          <legend className="text-style-body-small mb-14 text-text-primary">Did the session help you yesterday?</legend>
          <div className="flex gap-12">
            <button type="button" aria-pressed={helped === true} onClick={() => setHelped(helped === true ? null : true)} className={choice(helped === true)}>
              Yes
            </button>
            <button type="button" aria-pressed={helped === false} onClick={() => setHelped(helped === false ? null : false)} className={choice(helped === false)}>
              No
            </button>
          </div>
        </fieldset>

        <label className="flex flex-col gap-14">
          <span className="text-style-body-small text-text-primary">Additional notes</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="Add here..."
            className="text-style-body-small h-48 rounded-full border border-[#331B04] bg-surface-default px-16 text-text-primary outline-none placeholder:text-text-secondary focus-visible:ring-2 focus-visible:ring-[#FFE682]"
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={mood === null && helped === null && !note.trim()}
          className="text-style-body-small u-press h-48 w-full rounded-12 bg-[#331B04] text-text-inverse disabled:opacity-50"
        >
          Check-in
        </button>
        </>
        )}
      </div>
    </div>,
    document.body,
  )
}
