import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Pause, Play, Share2 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { MobileStatusBar } from '../components/ui/MobileStatusBar'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { profilePath } from '../lib/people'
import { findSession, totalMinutes } from '../lib/sessions'

/** Lines the session speaks, which the hero shows one at a time under the art.
 *  Mock, like everything in lib/ — as is the bed they play over. */
const CUES = [
  'Now take a deep breath in',
  'Hold it — and let the shoulders drop',
  'Breathe out, slower than you came in',
  'Let the next one arrive on its own',
]

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Figma "Player" (16523:9905) — the screen behind the play glyph.
 *
 * The art is the screen, not a header on it: cover full-bleed, the transport
 * floating on top, and a white sheet (radius 24 on its top corners only) that
 * carries everything you would read rather than hear.
 *
 * Hero geometry is the frame's, expressed as flow rather than the frame's
 * absolute offsets so it survives a viewport that is not 402x874: the header
 * is its own band, the pause button centres in what is left above the caption
 * (which lands it at y=321 in a 402x874 frame, the frame's own number), and
 * the caption and scrubber sit on the floor with the frame's 40px between them
 * and 85px beneath.
 */
export function PlayerPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const session = findSession(slug)

  // The bed is the session, for now: 10s of it. Reading the length off the
  // element rather than the catalogue keeps the bar honest — a scrubber that
  // says 22:00 over ten seconds of audio is the kind of lie a demo gets caught
  // on. DEFAULT_DURATION only covers the frames before metadata arrives.
  const DEFAULT_DURATION = 10
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [elapsed, setElapsed] = useState(0)
  // Starts paused, and not as a design choice: a browser refuses audio that
  // starts without a gesture, so a screen that opened mid-play would show a
  // pause glyph over silence.
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const raf = useRef<number | null>(null)
  const audio = useRef<HTMLAudioElement>(null)

  function toggle() {
    const element = audio.current
    if (!element) return
    if (playing) {
      element.pause()
      setPlaying(false)
      return
    }
    element.volume = 0.7
    void element
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  // The bar is the element's own position now that the two are the same
  // length, so there is no second clock to drift against it.
  useEffect(() => {
    if (!playing) return
    const tick = () => {
      const element = audio.current
      if (element) setElapsed(element.currentTime)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [playing])

  if (!session) return <Navigate to="/home" replace />

  const progress = Math.min(1, elapsed / duration)
  const cue = CUES[Math.floor((elapsed / duration) * CUES.length) % CUES.length]
  const chips = [
    session.category,
    `${totalMinutes(session)} min`,
    ...session.layers.slice(0, 3).map((layer) => layer.name),
    ...session.personalization.slice(0, 2).map((item) => item.value),
  ]

  return (
    <div className="min-h-dvh bg-surface-default">
      <div className="relative mx-auto w-full max-w-[402px] lg:max-w-[560px]">
        {/* The cover runs the full 874 of the frame, not just the 705 of the
            hero. The sheet's rounded top corners are only legible because the
            art carries on behind them — over a white page they cut white out
            of white and the radius reads as square. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[874px] overflow-hidden">
          <CoverImage
            photo={session.photo}
            gradient={session.gradient}
            width={804}
            height={1750}
            scrim={false}
            className="absolute inset-0"
          />
        </div>

        <audio
          ref={audio}
          src="/audio/session-bed.wav"
          loop
          preload="auto"
          onLoadedMetadata={(event) => {
            const value = event.currentTarget.duration
            if (Number.isFinite(value) && value > 0) setDuration(value)
          }}
        />

        {/* ------------------------------------------------------------ hero */}
        <section className="relative flex h-[705px] flex-col text-text-inverse">

          {/* The frame carries the iOS status bar over the art, not on a band
              above it. Same lg:hidden rule AppLayout uses, so a desktop window
              does not show a phone's clock. */}
          <div className="relative lg:hidden">
            <MobileStatusBar />
          </div>

          <header className="relative flex items-center gap-16 px-20 py-12">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="flex-1" />
            {/* Same coin as the cockpit header wears — one mark for the
                currency, not a lookalike per screen. */}
            <span className="text-style-body-small flex h-44 items-center gap-8 rounded-full bg-surface-default px-16 text-text-primary">
              <span
                className="flex size-20 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
              >
                <span className="size-8 rounded-full border-2 border-text-inverse" />
              </span>
              1,323
            </span>
            <button
              type="button"
              aria-label="Share"
              className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong"
            >
              <Share2 size={18} />
            </button>
          </header>

          {/* Centres at y=321 in the frame's 402x874 — the frame's own position
              for the 96px disc, arrived at by flow rather than a magic number. */}
          <div className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="u-press flex size-96 items-center justify-center rounded-full bg-white/20 backdrop-blur-[16px]"
            >
              {playing ? (
                <Pause size={48} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={48} fill="currentColor" strokeWidth={0} className="ml-4" />
              )}
            </button>
          </div>

          <div className="relative px-20 pb-[85px]">
            <p className="text-player-cue text-center">{cue}</p>

            <div className="mt-40">
              {/* The knob rides the fill, so the bar needs room for its overhang
                  at both ends: 14 either side, which is its own radius. */}
              <div className="relative mx-14 h-7">
                <span className="absolute inset-0 rounded-full bg-black/40" />
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, #ae4b46, #ffc500)',
                  }}
                />
                <span
                  className="absolute top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface-default"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
              {/* The frame puts the times 4px under the track, which works there
                  because its knob sits mid-bar. At 0% and at the end the knob
                  is over a label, so they clear its 14px radius instead. */}
              <div className="mt-12 flex items-center justify-between text-[8px] tabular-nums">
                <span>{clock(elapsed)}</span>
                <span>{clock(duration)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- sheet */}
        <section className="relative rounded-t-24 bg-surface-default px-20 pb-24 pt-16">
          <span className="mx-auto block h-5 w-36 rounded-full bg-[#7f7f7f]/40" />

          <div className="mt-20 flex items-center gap-12">
            {/* The byline goes to whoever made this — your own profile when the
                session is yours, theirs when it is not. The entry point
                decides, so the same row serves both without a flag. */}
            <Link
              to={profilePath(session.author)}
              aria-label={`Open ${session.author}'s profile`}
              className="u-press flex min-w-0 items-center gap-8"
            >
              <PhotoCircle photo={session.authorPhoto} size={24} gradient={session.gradient} />
              <span className="text-style-body-small truncate font-medium text-text-primary">{session.author}</span>
              <ChevronRight size={16} className="shrink-0 text-icon-default" />
            </Link>
            <span className="text-style-caption ml-auto shrink-0 text-text-secondary">
              {session.plays} plays
            </span>
          </div>

          <div className="mt-20 flex flex-col gap-8">
            <h1 className="text-style-title text-text-primary">{session.title}</h1>

            {/* Clamped to the frame's three lines, with the frame's fade over the
                cut. Expanding drops both, so "Read More" is a real disclosure
                rather than a link to somewhere else. */}
            <div className="relative">
              <p
                className={`text-style-body-small font-light! text-text-secondary ${expanded ? '' : 'line-clamp-3'}`}
              >
                {session.summary}
              </p>
              {!expanded && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-default to-transparent" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="text-style-body-small w-fit text-[#ff881b]"
            >
              {expanded ? 'Read Less' : 'Read More'}
            </button>
          </div>

          <div className="mt-20 flex flex-wrap gap-8">
            {chips.map((chip) => (
              <span
                key={chip}
                className="text-style-label flex h-30 items-center rounded-full bg-[#ff881b]/10 px-8 text-text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
