import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { MOOD_WORDS, dayKey, entryFor, readDaily, weekOf, type DailyEntry } from '../../lib/dailyCheckIn'
import { DailyCheckInSheet } from './DailyCheckInSheet'
import { MOOD_FACES } from './moods'
import { WeekStrip } from './WeekStrip'

const CARD_SHADOW = '0 4px 14px rgba(0, 0, 0, 0.04)'

/**
 * The Journal tab (Figma Session/Insights/Journal, 16906:5450; U068): the
 * week, and for the chosen day the three daily answers as cards, each with a
 * pencil that reopens the check-in for that day.
 */
export function JournalView() {
  const [log, setLog] = useState<DailyEntry[]>(readDaily)
  const [now] = useState(() => new Date())
  const today = dayKey(now)
  const [selected, setSelected] = useState(today)
  const [editing, setEditing] = useState(false)
  const entry = entryFor(log, selected)
  const week = weekOf(now)

  const card = (label: string, value: string, extra?: React.ReactNode, tall = false) => (
    <div className={`flex gap-12 rounded-[20px] bg-surface-default px-16 py-16 ${tall ? 'min-h-[156px]' : ''}`} style={{ boxShadow: CARD_SHADOW }}>
      <div className="min-w-0 flex-1">
        <p className="text-style-caption text-text-secondary">{label}</p>
        <p className="text-style-body mt-4 whitespace-pre-line [overflow-wrap:anywhere] text-text-primary">{value}</p>
      </div>
      {extra}
      <button type="button" aria-label={`Edit: ${label}`} onClick={() => setEditing(true)} className="u-press -mr-4 flex size-28 shrink-0 items-center justify-center self-start rounded-8 text-icon-strong">
        <Pencil size={15} />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-24">
      <WeekStrip days={week} selected={selected} onSelect={setSelected} />
      {entry ? (
        <div className="flex flex-col gap-12">
          {card(
            'How are you feeling today?',
            entry.mood ? MOOD_WORDS[entry.mood - 1] : 'Not answered',
            entry.mood ? <img src={MOOD_FACES[entry.mood - 1]} alt="" className="size-34 shrink-0 self-start" /> : undefined,
          )}
          {card('Did the session help you yesterday?', entry.helped === null ? 'Not answered' : entry.helped ? 'Yes.' : 'No.')}
          {card('Additional notes', entry.note || 'No notes.', undefined, true)}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-12 rounded-[20px] bg-surface-default p-16" style={{ boxShadow: CARD_SHADOW }}>
          <p className="text-style-body-small text-text-secondary">{selected === today ? 'No check-in yet today.' : 'No check-in on this day.'}</p>
          <button type="button" onClick={() => setEditing(true)} className="text-style-label u-press h-40 rounded-12 bg-[#331B04] px-16 text-text-inverse">
            {selected === today ? 'Check in now' : 'Add a check-in'}
          </button>
        </div>
      )}
      {editing && (
        <DailyCheckInSheet
          date={selected}
          initial={entry}
          onDone={() => {
            setLog(readDaily())
            setEditing(false)
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
