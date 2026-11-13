import { ChevronDown, NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Journey } from '../../lib/journey'
import { FIRST_CHAPTERS, MOOD_LABELS, addJournalNote, feelingSummary, readJourney } from '../../lib/journey'
import { findGoal, onboardingAnswers, wearableLabel } from '../../lib/onboarding'

const DAY = 24 * 60 * 60_000
const REPORT_EVERY_DAYS = 14

const dateLabel = (at: number) => new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

/**
 * Progress → Your goals, design v5 (U053).
 *
 * The first three user interviews (J049) turned on this screen. One person
 * said tracking numbers would make them anxious, one laughed at the sample
 * figures ("what are these numbers from?"), and one wanted to know what drove
 * them. So: their own check-ins, said in words; a short report every two
 * weeks rather than live numbers; and the detail, with what it is based on,
 * for whoever opens it. Nothing here comes from the demo's sample analyses.
 */
export function FeelingProgress() {
  const navigate = useNavigate()
  const [journey, setJourney] = useState<Journey | null>(() => readJourney())
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [now] = useState(() => Date.now())
  const answers = onboardingAnswers()
  const wearable = wearableLabel(answers?.wearable)

  if (!journey) {
    return (
      <div className="mt-24 flex flex-col gap-12 rounded-[20px] border border-border-subtle bg-surface-default p-20">
        <p className="text-[20px] leading-[28px] text-text-primary">Your progress starts with your first session.</p>
        <p className="text-[14px] font-light leading-[21px] text-text-secondary">
          After each one, a single tap tells Aurelia how you feel. It shows up here in words, not scores, with a short report every two weeks.
        </p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="u-press mt-4 flex h-48 items-center justify-center rounded-16 bg-[#331B04] text-[16px] leading-[19px] text-white"
        >
          Create a session
        </button>
      </div>
    )
  }

  const summary = feelingSummary(journey.checkIns)
  const goal = findGoal(journey.goal)
  const started = journey.checkIns[0]?.at
  const nextReport = started ? started + REPORT_EVERY_DAYS * DAY : null
  const headline =
    summary.trend === 'new'
      ? summary.count === 0
        ? 'Nothing to report yet.'
        : `After one chapter you felt ${summary.usual.toLowerCase()}.`
      : summary.trend === 'up'
        ? 'You have been feeling better since you started.'
        : summary.trend === 'down'
          ? 'A harder stretch lately.'
          : 'Steady so far.'
  const detail =
    summary.trend === 'new'
      ? 'Aurelia needs two check-ins before it can say which way things are going.'
      : summary.trend === 'down'
        ? 'Aurelia is making the next chapters gentler. If something else is going on, the journal is a good place for it.'
        : `Most often you felt ${summary.usual.toLowerCase()}, across ${summary.count} chapters.`

  const journal = [
    ...journey.checkIns.filter((c) => c.note).map((c) => ({ at: c.at, text: c.note as string, mood: c.mood })),
    ...(journey.notes ?? []),
  ].sort((a, b) => b.at - a.at)

  return (
    <div className="mt-24 flex flex-col gap-16">
      <section aria-label="How you have been feeling" className="flex flex-col gap-10 rounded-[20px] border border-border-subtle bg-surface-default p-20">
        <p className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[#8A5A1E]">
          {goal?.label ?? journey.name} · {Math.min(summary.count, FIRST_CHAPTERS)} of your first {FIRST_CHAPTERS} chapters
        </p>
        <p className="text-[22px] leading-[30px] text-text-primary">{headline}</p>
        <p className="text-[14px] font-light leading-[21px] text-text-secondary">{detail}</p>
        {nextReport && (
          <p className="text-[13px] leading-[18px] text-text-secondary">
            Your two-week report: {nextReport > now ? dateLabel(nextReport) : 'ready'}. No live numbers in between.
          </p>
        )}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="u-press mt-4 flex items-center gap-6 self-start text-[14px] font-medium text-[#C25E0A]"
        >
          See what’s behind this <ChevronDown size={16} className={open ? 'rotate-180' : ''} />
        </button>
        {open && (
          <div className="flex flex-col gap-10 border-t border-border-subtle pt-12">
            <p className="text-[13px] leading-[19px] text-text-secondary">
              Based on: {journey.checkIns.length} check-in{journey.checkIns.length === 1 ? '' : 's'} after your chapters
              {wearable ? `, and your ${wearable} (example data until the connection is live)` : ''}. Nothing else.
            </p>
            <ol className="flex flex-col gap-8">
              {journey.checkIns.map((c, i) => (
                <li key={c.at} className="flex items-baseline gap-10 text-[13px] leading-[19px]">
                  <span className="w-[84px] shrink-0 text-text-secondary">Chapter {i + 1}</span>
                  <span className="min-w-0 text-text-primary">
                    {MOOD_LABELS[c.mood - 1]}
                    {c.note ? <span className="text-text-secondary"> · “{c.note}”</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section aria-label="Journal" className="flex flex-col gap-12 rounded-[20px] border border-border-subtle bg-surface-default p-20">
        <p className="flex items-center gap-8 text-[16px] leading-[22px] text-text-primary">
          <NotebookPen size={18} className="text-icon-default" /> Journal
        </p>
        <form
          className="flex gap-8"
          onSubmit={(event) => {
            event.preventDefault()
            const next = addJournalNote(note)
            if (next && note.trim()) {
              setJourney(next)
              setNote('')
            }
          }}
        >
          <label htmlFor="journal-note" className="sr-only">
            Today’s note
          </label>
          <input
            id="journal-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="How was today?"
            maxLength={500}
            className="h-44 min-w-0 flex-1 rounded-12 border border-border-subtle bg-surface-default px-12 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <button type="submit" disabled={!note.trim()} className="u-press h-44 shrink-0 rounded-12 bg-[#331B04] px-14 text-[14px] text-white disabled:opacity-40">
            Save
          </button>
        </form>
        {journal.length === 0 ? (
          <p className="text-[13px] font-light leading-[19px] text-text-secondary">
            A line a day, if you like. Only you see it, and Aurelia uses it to shape your next chapters.
          </p>
        ) : (
          <ul className="flex flex-col gap-10">
            {journal.map((entry) => (
              <li key={entry.at} className="flex flex-col gap-2 border-t border-border-subtle pt-10 first:border-t-0 first:pt-0">
                <span className="text-[12px] leading-[16px] text-text-secondary">
                  {dateLabel(entry.at)}
                  {entry.mood ? ` · felt ${MOOD_LABELS[entry.mood - 1].toLowerCase()}` : ''}
                </span>
                <span className="text-[14px] leading-[21px] text-text-primary">{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
