import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { CHANNELS, entriesFor, type Channel, type LogEntry } from '../data/coachingLog'
import { Badge, Button, FormField, Panel, inputClass, textareaClass } from './ui'

const FEELINGS = ['1 · very low', '2 · low', '3 · okay', '4 · good', '5 · very good']

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/**
 * The project manager's daily contact with one participant (U062). What they
 * said, how they feel, and the next step, next to the measures it is meant to
 * move. Saved in this browser until the backend exists; sample lines are
 * marked and cannot be deleted.
 */
export function CoachingLogPanel({
  participantId,
  log,
  saved,
  today,
  onAdd,
  onRemove,
}: {
  participantId: string
  log: LogEntry[]
  saved: boolean
  today: string
  onAdd: (e: LogEntry) => void
  onRemove: (id: string) => void
}) {
  const entries = entriesFor(log, participantId)
  const [day, setDay] = useState(today)
  const [channel, setChannel] = useState<Channel>('Message')
  const [feeling, setFeeling] = useState<string>('')
  const [note, setNote] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [escalate, setEscalate] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!note.trim()) return
    onAdd({
      id: `${participantId}-${Date.now()}`,
      participantId,
      date: day,
      channel,
      feeling: feeling ? Number(feeling) : null,
      note: note.trim(),
      nextStep: nextStep.trim(),
      escalate,
    })
    setNote('')
    setNextStep('')
    setFeeling('')
    setEscalate(false)
  }

  return (
    <Panel
      title="Coaching log"
      description="Every contact with this participant: what they said, how they feel, and the next step. The daily guidance lives here, next to the measures it is meant to move."
      actions={<Badge tone={saved ? 'neutral' : 'warning'}>{saved ? 'Saved in this browser' : 'Not saved: storage blocked'}</Badge>}
    >
      <form onSubmit={submit} className="grid gap-12 rounded-8 border border-adm-line p-12 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        <FormField label="Day">
          <input type="date" value={day} max={today} onChange={(e) => setDay(e.target.value || today)} className={inputClass} />
        </FormField>
        <FormField label="How">
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className={inputClass}>
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="How they feel today">
          <select value={feeling} onChange={(e) => setFeeling(e.target.value)} className={inputClass}>
            <option value="">Not asked</option>
            {FEELINGS.map((f, i) => <option key={f} value={i + 1}>{f}</option>)}
          </select>
        </FormField>
        <div className="lg:col-span-3">
          <FormField label="What happened" hint="Their words where you can. No names or contact details.">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="Slept 6 hours, fell asleep faster after the wind-down chapter." className={textareaClass} required />
          </FormField>
        </div>
        <div className="lg:col-span-2">
          <FormField label="Next step">
            <input value={nextStep} onChange={(e) => setNextStep(e.target.value)} maxLength={500} placeholder="Try the 8-minute version tomorrow at 22:00." className={inputClass} />
          </FormField>
        </div>
        <div className="flex flex-col justify-end gap-8">
          <label className="flex items-center gap-6 text-12 text-adm-ink-2">
            <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />
            Needs the study lead today
          </label>
          <Button type="submit" variant="primary" disabled={!note.trim()}>Add to log</Button>
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="py-8 text-13 text-adm-muted">No contact logged yet.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-adm-line">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-12 py-10 text-13">
              <div className="w-[96px] shrink-0 text-12 text-adm-muted">
                <div className="font-medium text-adm-ink">{date(e.date)}</div>
                {e.channel}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-6">
                  {e.feeling !== null && <Badge tone={e.feeling >= 4 ? 'good' : e.feeling <= 2 ? 'warning' : 'neutral'}>feels {e.feeling}/5</Badge>}
                  {e.escalate && (
                    <Badge tone="critical">
                      <AlertTriangle size={11} className="mr-2 inline" aria-hidden="true" />
                      study lead
                    </Badge>
                  )}
                  {e.sample && <Badge tone="neutral">sample</Badge>}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-adm-ink">{e.note}</p>
                {e.nextStep && <p className="mt-2 text-adm-ink-2"><b className="font-medium">Next:</b> {e.nextStep}</p>}
              </div>
              {!e.sample &&
                (confirming === e.id ? (
                  <span className="flex shrink-0 items-start gap-4">
                    <Button size="sm" variant="danger" onClick={() => { onRemove(e.id); setConfirming(null) }}>Delete</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Keep</Button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirming(e.id)} aria-label={`Delete the ${date(e.date)} entry`} className="flex size-28 shrink-0 items-center justify-center rounded-8 text-adm-muted hover:bg-adm-hover hover:text-adm-critical">
                    <Trash2 size={14} />
                  </button>
                ))}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

