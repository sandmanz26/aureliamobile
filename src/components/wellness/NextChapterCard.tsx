import { BellRing, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Journey } from '../../lib/journey'
import { FIRST_CHAPTERS, MOOD_LABELS } from '../../lib/journey'
import { findGoal } from '../../lib/onboarding'
import { CURRENT_USER } from '../../lib/people'
import { ChapterTrack } from './ChapterCheckIn'

/**
 * Home's first block once you have a first session (design v4, U050).
 *
 * J039 found Home after the first session was the signed-out marketing page:
 * nothing said what to do next or that anything had been kept. This card is
 * the next chapter — what changed and why, one tap to play — and the track
 * of the first five.
 */
export function NextChapterCard({ journey }: { journey: Journey }) {
  const navigate = useNavigate()
  const goal = findGoal(journey.goal)
  const last = journey.checkIns[journey.checkIns.length - 1]
  const chapter = journey.checkIns.length + 1
  const when = journey.goal === 'sleep' ? 'Tonight' : 'Today'
  const why = !last
    ? 'You built it — it has not been played yet. Listen once and say how it felt.'
    : last.mood >= 4
      ? `Last time you felt ${MOOD_LABELS[last.mood - 1].toLowerCase()}. This chapter keeps what worked.`
      : `Last time you felt ${MOOD_LABELS[last.mood - 1].toLowerCase()}. This chapter changes what didn’t.`
  const label = last ? `Chapter ${chapter}` : 'Chapter 1'

  return (
    <section aria-label="Your next chapter" className="mb-24 flex flex-col gap-14 pt-8 text-left">
      <div className="flex flex-col gap-12 rounded-24 bg-[linear-gradient(160deg,#3C2405,#B4590E)] p-20 text-text-inverse">
        <p className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-white/75">
          {when} · {goal?.label ?? journey.name}
        </p>
        <h2 className="-mt-4 text-[24px] font-normal leading-[32px]">
          {journey.name} — {label}
        </h2>
        <p className="text-[14px] font-light leading-[21px] text-white/85">{why}</p>
        <button
          type="button"
          onClick={() =>
            navigate(journey.href, {
              state: { origin: 'own', as: { title: `${journey.name} — ${label}`, author: CURRENT_USER } },
            })
          }
          className="u-press mt-4 flex h-48 items-center justify-center gap-8 rounded-16 bg-white text-[16px] leading-[19px] text-[#331B04]"
        >
          <Play size={16} fill="currentColor" /> Play {label.toLowerCase()}
        </button>
        {journey.reminder && (
          <p className="flex items-center gap-6 text-[12px] leading-[16px] text-white/75">
            <BellRing size={13} /> Reminder in your calendar at {journey.reminder}
          </p>
        )}
      </div>
      {journey.checkIns.length < FIRST_CHAPTERS && <ChapterTrack journey={journey} />}
    </section>
  )
}
