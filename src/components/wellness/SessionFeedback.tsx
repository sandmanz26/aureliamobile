import { ArrowUp } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import mood1 from '../../assets/moods/mood-1.svg'
import mood2 from '../../assets/moods/mood-2.svg'
import mood3 from '../../assets/moods/mood-3.svg'
import mood4 from '../../assets/moods/mood-4.svg'
import mood5 from '../../assets/moods/mood-5.svg'

/**
 * The player drawer's Feedback block (Figma "Session: Chat - Player",
 * 16883:15321 asking, 16883:15487 answered; U041). Two cards on #F5EEE8:
 * a free-text "How is the experience?" and a five-face "How does listening
 * to this make you feel?". Each turns into its own thank-you once answered,
 * independently — answering one does not hide the other.
 *
 * The faces are the frame's own vectors, split out of its scale. The frame
 * draws only the happy answer ("Glad to hear it!"); a sad face deserves
 * different words, so the reply follows the face (`MOODS`). The chosen face
 * stays changeable — the scale stays on screen with the pick outlined.
 *
 * Nothing is sent anywhere (no backend). Answers are kept per session for
 * the visit, so closing and reopening the player does not ask again.
 */

const MOODS = [
  { src: mood1, label: 'Very unpleasant', title: 'Sorry it didn’t land', body: 'Thanks for being honest. We’ll change what isn’t working in your next chapter.' },
  { src: mood2, label: 'Unpleasant', title: 'Sorry it didn’t land', body: 'Thanks for being honest. We’ll change what isn’t working in your next chapter.' },
  { src: mood3, label: 'Neutral', title: 'Thanks for telling us', body: 'We’ll try a few changes in your next chapter and see what lands.' },
  { src: mood4, label: 'Pleasant', title: 'Glad to hear it!', body: 'Thanks for sharing. We’ll lean into what’s working for your next chapter.' },
  { src: mood5, label: 'Very pleasant', title: 'Glad to hear it!', body: 'Thanks for sharing. We’ll lean into what’s working for your next chapter.' },
] as const

const answers = new Map<string, { note?: string; mood?: number }>()

function LikeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="feedback-like" x1="6" y1="43.975" x2="45.7567" y2="8.17155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8514" />
          <stop offset="1" stopColor="#FFE270" />
        </linearGradient>
      </defs>
      <path
        d="M36 4H12C8.68 4 6 6.66 6 9.94V31.76C6 35.04 8.68 37.7 12 37.7H13.52C15.12 37.7 16.64 38.32 17.76 39.44L21.18 42.82C22.74 44.36 25.28 44.36 26.84 42.82L30.26 39.44C31.38 38.32 32.92 37.7 34.5 37.7H36C39.32 37.7 42 35.04 42 31.76V9.94C42 6.66 39.32 4 36 4ZM24.56 29.92C24.26 30.02 23.76 30.02 23.44 29.92C20.84 29.02 15 25.32 15 19.02C15.02 16.24 17.24 14 20 14C21.64 14 23.08 14.78 24 16C24.92 14.78 26.36 14 28 14C30.76 14 33 16.24 33 19.02C32.98 25.32 27.16 29.02 24.56 29.92Z"
        fill="url(#feedback-like)"
      />
    </svg>
  )
}

function TickIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        d="M24 4C12.98 4 4 12.98 4 24C4 35.02 12.98 44 24 44C35.02 44 44 35.02 44 24C44 12.98 35.02 4 24 4ZM33.56 19.4L22.22 30.74C21.94 31.02 21.56 31.18 21.16 31.18C20.76 31.18 20.38 31.02 20.1 30.74L14.44 25.08C13.86 24.5 13.86 23.54 14.44 22.96C15.02 22.38 15.98 22.38 16.56 22.96L21.16 27.56L31.44 17.28C32.02 16.7 32.98 16.7 33.56 17.28C34.14 17.86 34.14 18.8 33.56 19.4Z"
        fill="#5FC52C"
      />
    </svg>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-16 rounded-12 bg-[#F5EEE8] p-18">
      <div className="flex items-start gap-12">
        {icon}
        <h3 className="text-[16px] font-medium leading-[19px] text-[#331B04] [padding-top:2px]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function SessionFeedback({ sessionKey }: { sessionKey: string }) {
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(() => Boolean(answers.get(sessionKey)?.note))
  const [mood, setMood] = useState<number | null>(() => answers.get(sessionKey)?.mood ?? null)

  function send(event: FormEvent) {
    event.preventDefault()
    const text = note.trim()
    if (!text) return
    answers.set(sessionKey, { ...answers.get(sessionKey), note: text })
    setSent(true)
  }

  function pick(index: number) {
    answers.set(sessionKey, { ...answers.get(sessionKey), mood: index })
    setMood(index)
  }

  const chosen = mood === null ? null : MOODS[mood]

  return (
    <section className="flex flex-col gap-12" aria-label="Feedback">
      <h2 className="text-[14px] leading-[21px] text-text-primary">Feedback</h2>

      {sent ? (
        <Card icon={<TickIcon />} title="Thank you for your feedback">
          <p className="text-[14px] font-light leading-[21px] text-[#331B04]">It helps Aurelia fine-tune your next chapter.</p>
        </Card>
      ) : (
        <Card icon={<LikeIcon />} title="How is the experience?">
          <form onSubmit={send} className="flex h-44 items-center gap-12 rounded-full border border-[#331B04] pl-16 pr-4">
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Answer here..."
              aria-label="How is the experience?"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-light leading-[19px] text-text-primary placeholder:text-[#626262] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send feedback"
              disabled={!note.trim()}
              className="u-press flex size-35 shrink-0 items-center justify-center rounded-full bg-[#331B04] text-white disabled:opacity-40"
            >
              <ArrowUp size={19} strokeWidth={1.75} />
            </button>
          </form>
        </Card>
      )}

      <Card
        icon={chosen ? <TickIcon /> : <LikeIcon />}
        title={chosen ? chosen.title : 'How does listening to this make you feel?'}
      >
        <div className="flex items-center justify-center gap-8" role="radiogroup" aria-label="How does listening to this make you feel?">
          {MOODS.map((m, i) => {
            const on = mood === i
            return (
              <button
                key={m.label}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={m.label}
                onClick={() => pick(i)}
                className={`u-press flex shrink-0 items-center justify-center rounded-12 transition-opacity ${
                  on ? 'size-52 border-2 border-[#331B04] p-2' : 'size-44'
                } ${mood !== null && !on ? 'opacity-50' : ''}`}
              >
                <img src={m.src} alt="" className="size-44 rounded-8" />
              </button>
            )
          })}
        </div>
        {chosen && <p className="text-[14px] font-light leading-[21px] text-[#331B04]">{chosen.body}</p>}
      </Card>
    </section>
  )
}
