import { BellRing, Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mood1 from '../../assets/moods/mood-1.svg'
import mood2 from '../../assets/moods/mood-2.svg'
import mood3 from '../../assets/moods/mood-3.svg'
import mood4 from '../../assets/moods/mood-4.svg'
import mood5 from '../../assets/moods/mood-5.svg'
import type { Journey } from '../../lib/journey'
import {
  FIRST_CHAPTERS,
  MOOD_LABELS,
  addCheckIn,
  defaultReminderTime,
  nextChapterWhen,
  reminderIcs,
  setReminder,
} from '../../lib/journey'

const FACES = [mood1, mood2, mood3, mood4, mood5]

/** A check-in this recent belongs to this listen, so reopening the player does not ask again. */
const SAME_LISTEN_MS = 6 * 60 * 60_000

/**
 * The player sheet for your own first sessions (design v4, U050).
 *
 * J039 found it opened on "Great Progress! +3% since yesterday … moved from
 * anxious to calm by 35%" for someone who had not pressed play. Here nothing
 * is claimed until it has been measured: the sheet asks one question, keeps
 * the answer, promises the next chapter, offers a reminder for it, and only
 * draws progress once there are two real answers to draw.
 */
export function ChapterCheckIn({ initial, goalLabel }: { initial: Journey; goalLabel: string | null }) {
  const navigate = useNavigate()
  const [journey, setJourney] = useState(initial)
  const [now] = useState(() => Date.now())
  const last = journey.checkIns[journey.checkIns.length - 1]
  const answered = Boolean(last && now - last.at < SAME_LISTEN_MS)
  const [time, setTime] = useState(journey.reminder ?? defaultReminderTime(journey.goal))
  const [added, setAdded] = useState(false)

  // The chapter this listen is: the last one answered, or the next one.
  const chapter = answered ? journey.checkIns.length : journey.checkIns.length + 1
  const previous = answered ? journey.checkIns[journey.checkIns.length - 2] : last
  const done = journey.checkIns.length >= FIRST_CHAPTERS && answered

  function pick(mood: number) {
    const next = addCheckIn(mood)
    if (next) setJourney(next)
  }

  function remind() {
    const ics = reminderIcs({
      name: journey.name,
      time,
      remaining: Math.max(1, FIRST_CHAPTERS - journey.checkIns.length),
      url: `${window.location.origin}/home`,
    })
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'aurelia-next-chapter.ics'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    const next = setReminder(time)
    if (next) setJourney(next)
    setAdded(true)
  }

  const mood = answered && last ? last.mood : null
  const better = mood !== null && mood >= 4

  return (
    <section className="flex flex-col gap-16 px-12" aria-label="Your chapter">
      <p className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[#8A5A1E]">
        Chapter {chapter} · {chapter === 1 ? 'your starting point' : (goalLabel ?? journey.name)}
      </p>

      {mood === null ? (
        <div className="flex flex-col gap-8">
          <h2 className="text-[24px] font-normal leading-[32px] text-text-primary">How do you feel now?</h2>
          <p className="text-[14px] font-light leading-[21px] text-text-secondary">
            {previous
              ? `Last time you said ${MOOD_LABELS[previous.mood - 1].toLowerCase()}. One tap, and Aurelia can tell whether this chapter moved it.`
              : 'One tap gives Aurelia its first real answer from you. Nothing is measured until there is something to measure.'}
          </p>
          <div className="mt-8 flex items-center justify-between gap-6" role="radiogroup" aria-label="How do you feel now?">
            {FACES.map((src, i) => (
              <button
                key={src}
                type="button"
                role="radio"
                aria-checked={false}
                aria-label={MOOD_LABELS[i]}
                onClick={() => pick(i + 1)}
                className="u-press flex flex-col items-center gap-6"
              >
                <img src={src} alt="" className="size-48 rounded-12" />
                <span className="text-[11px] leading-[14px] text-text-secondary">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <h2 className="flex items-center gap-8 text-[24px] font-normal leading-[32px] text-text-primary">
            <img src={FACES[mood - 1]} alt="" className="size-32 rounded-8" />
            {better ? 'Glad it helped.' : 'Thanks for being honest.'}
          </h2>
          <p className="text-[14px] font-light leading-[21px] text-text-secondary">
            You felt {MOOD_LABELS[mood - 1].toLowerCase()} after chapter {chapter}.{' '}
            {done
              ? 'That is your first five.'
              : better
                ? `Chapter ${chapter + 1} keeps what worked.`
                : `Chapter ${chapter + 1} changes what didn’t.`}
          </p>
        </div>
      )}

      {mood !== null && !done && (
        <div className="flex flex-col gap-12 rounded-16 bg-[#FFF8EC] p-16">
          <p className="text-[12px] leading-[16px] text-[#8A5A1E]">Next</p>
          <p className="-mt-6 text-[20px] leading-[28px] text-text-primary">
            Chapter {chapter + 1} is ready {nextChapterWhen(journey.goal)}
          </p>
          {journey.reminder && !added ? (
            <p className="flex items-center gap-8 text-[14px] font-light leading-[21px] text-text-secondary">
              <BellRing size={16} className="shrink-0 text-[#8A5A1E]" />
              In your calendar at {journey.reminder}.
            </p>
          ) : added ? (
            <p className="flex items-center gap-8 text-[14px] font-light leading-[21px] text-text-secondary">
              <Check size={16} className="shrink-0 text-success-600" />
              Added for {time}, daily until chapter {FIRST_CHAPTERS}. Open the downloaded file if your calendar did not.
            </p>
          ) : (
            <>
              <p className="-mt-6 text-[14px] font-light leading-[21px] text-text-secondary">
                Most people notice a change after a few days in a row. A reminder at the time you would play it helps.
              </p>
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={remind}
                  className="u-press flex h-48 flex-1 items-center justify-center gap-8 rounded-16 bg-[#331B04] text-[16px] leading-[19px] text-white"
                >
                  <BellRing size={16} /> Remind me at {time}
                </button>
                <label className="flex h-48 shrink-0 items-center rounded-16 border border-border-subtle bg-surface-default px-10">
                  <span className="sr-only">Reminder time</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => event.target.value && setTime(event.target.value)}
                    className="bg-transparent text-[14px] text-text-primary focus:outline-none"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {done && (
        <div className="flex flex-col gap-12 rounded-16 bg-[#FFF8EC] p-16">
          <p className="text-[20px] leading-[28px] text-text-primary">Five chapters in.</p>
          <p className="-mt-6 text-[14px] font-light leading-[21px] text-text-secondary">
            Keep going with {journey.name}, or let Aurelia help with something else too.
          </p>
          <button
            type="button"
            onClick={() => navigate('/chat', { state: { fresh: true } })}
            className="u-press flex h-48 items-center justify-center rounded-16 border border-[#331B04] text-[16px] leading-[19px] text-text-primary"
          >
            Start on another goal
          </button>
        </div>
      )}

      <ChapterTrack journey={journey} />
    </section>
  )
}

/**
 * The first five as dots, and — once there are two — each answer as it was
 * given. No smoothing, no projection: two points are what they are.
 */
export function ChapterTrack({ journey }: { journey: Journey }) {
  const count = journey.checkIns.length
  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-6" aria-label={`${Math.min(count, FIRST_CHAPTERS)} of your first ${FIRST_CHAPTERS} chapters`}>
        {Array.from({ length: FIRST_CHAPTERS }, (_, i) => (
          <span
            key={i}
            className={`size-10 rounded-full ${i < count ? 'bg-[#F5A524]' : 'border border-border-subtle'}`}
          />
        ))}
        <span className="ml-6 text-[13px] leading-[18px] text-text-secondary">
          {count === 0
            ? `Your first ${FIRST_CHAPTERS} chapters`
            : `${Math.min(count, FIRST_CHAPTERS)} of your first ${FIRST_CHAPTERS}`}
        </span>
      </div>
      {count >= 2 && (
        <ol className="flex flex-col gap-8" aria-label="How you felt after each chapter">
          {journey.checkIns.map((c, i) => (
            <li key={c.at} className="grid grid-cols-[84px_1fr_92px] items-center gap-8 text-[13px] leading-[18px]">
              <span className="text-text-secondary">Chapter {i + 1}</span>
              <span className="h-8 overflow-hidden rounded-full bg-[#F5EEE8]">
                <span className="block h-full rounded-full bg-[#F5A524]" style={{ width: `${(c.mood / 5) * 100}%` }} />
              </span>
              <span className="text-right text-text-primary">{MOOD_LABELS[c.mood - 1]}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
