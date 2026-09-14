import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Pause, Play, Share2, Shuffle } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { RecommendationCard } from '../components/chat/RecommendationCard'
import { RECOMMENDATIONS } from '../chat/ChatSessionContext'
import { CoverImage } from '../components/ui/CoverImage'
import { MobileStatusBar } from '../components/ui/MobileStatusBar'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { profilePath } from '../lib/people'
import type { ProfileOrigin } from '../lib/people'
import { findSession } from '../lib/sessions'

/** Lines the session speaks, which the hero shows one at a time under the art.
 *  Mock, like everything in lib/ — as is the bed they play over. */
/** Where the pulled-up sheet rests: clear of the status bar, as the frame has it. */
const SHEET_TOP = 54

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
  const location = useLocation()
  const session = findSession(slug)
  // Who this session belongs to, as the screen that opened the player knows
  // it. Absent — a pasted URL, a refresh — the author decides.
  const origin = (location.state as { origin?: ProfileOrigin } | null)?.origin

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
  // The sheet has two resting places, as the frame does: sitting under the
  // transport, and pulled up to just below the status bar. It rides the
  // document scroll rather than becoming a fixed panel, so the snap works at
  // any window height and free scrolling still does what it did.
  const [sheetUp, setSheetUp] = useState(false)
  const sheet = useRef<HTMLElement>(null)
  const drag = useRef<{ y: number; scroll: number } | null>(null)

  const snap = useCallback((up: boolean) => {
    const element = sheet.current
    if (!element) return
    setSheetUp(up)
    const top = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: up ? Math.max(0, top - SHEET_TOP) : 0, behavior: 'smooth' })
  }, [])
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
  // Hashtags, as the frame has them. Derived rather than stored: adding a tags
  // field would mean editing 21 catalogue entries to say what the category and
  // the mix already say.
  const tags = [
    session.slug.replace(/-/g, ''),
    session.category.toLowerCase(),
    ...session.layers.map((layer) => layer.name.toLowerCase().replace(/[^a-z0-9]/g, '')),
    ...session.personalization.map((item) => item.label.toLowerCase().replace(/[^a-z0-9]/g, '')),
  ].filter((tag, index, all) => tag && all.indexOf(tag) === index)
  const SHOWN_TAGS = 6
  const overflow = tags.length - SHOWN_TAGS

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
        <section
          ref={sheet}
          className="relative rounded-t-24 bg-surface-default px-20 pb-40 pt-16"
        >
          {/* The grabber is the control, not an ornament: it drags, and a tap
              snaps. Free scrolling still works either way. */}
          <button
            type="button"
            aria-label={sheetUp ? 'Collapse details' : 'Expand details'}
            aria-expanded={sheetUp}
            onClick={() => snap(!sheetUp)}
            onPointerDown={(event) => {
              drag.current = { y: event.clientY, scroll: window.scrollY }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!drag.current) return
              window.scrollTo({ top: Math.max(0, drag.current.scroll + (drag.current.y - event.clientY)) })
            }}
            onPointerUp={(event) => {
              const start = drag.current
              drag.current = null
              if (!start) return
              const moved = start.y - event.clientY
              // A real drag decides by direction; anything smaller is a tap and
              // falls through to onClick.
              if (Math.abs(moved) > 12) snap(moved > 0)
            }}
            className="-mx-20 flex w-[calc(100%+40px)] cursor-grab touch-none justify-center py-4 active:cursor-grabbing"
          >
            <span className="block h-5 w-36 rounded-full bg-[#7f7f7f]/40" />
          </button>

          <div className="mt-16 flex items-center gap-12">
            <Link
              to={profilePath(session.author, origin)}
              aria-label={`Open ${session.author}'s profile`}
              className="u-press flex min-w-0 items-center gap-8"
            >
              <PhotoCircle photo={session.authorPhoto} size={24} gradient={session.gradient} />
              <span className="text-style-body-small truncate font-medium text-text-primary">{session.author}</span>
              <ChevronRight size={16} className="shrink-0 text-icon-default" />
            </Link>
          </div>

          <div className="mt-20 flex flex-col gap-8">
            <h1 className="text-style-title text-text-primary">{session.title}</h1>

            {/* Clamped to the frame's lines, with the frame's fade over the cut.
                Expanding drops both, so "Read More" is a real disclosure rather
                than a link to somewhere else. */}
            <div className="relative">
              <p
                className={`text-style-body-small font-light! text-text-secondary ${expanded ? '' : 'line-clamp-4'}`}
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

          {/* Hashtags: orange on a tenth of orange, with the frame's hairline. */}
          <div className="mt-20 flex flex-wrap gap-8">
            {tags.slice(0, SHOWN_TAGS).map((tag) => (
              <span
                key={tag}
                className="text-style-label flex h-30 items-center rounded-full border border-[#ff881b] bg-[#ff881b]/10 px-8 text-[#ff881b]"
              >
                #{tag}
              </span>
            ))}
            {overflow > 0 && (
              <span className="text-style-label flex h-30 items-center rounded-full border border-[#ff881b] bg-[#ff881b]/10 px-8 text-[#ff881b]">
                +{overflow}
              </span>
            )}
          </div>

          {/* What the session has done, as two figures rather than a sentence. */}
          <div className="mt-24 grid grid-cols-2 gap-16">
            {[
              { value: session.plays, label: 'Played', icon: <Play size={14} /> },
              { value: session.recreated, label: 'Recreated', icon: <Shuffle size={14} /> },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-4 rounded-16 border border-border-subtle bg-surface-default p-16"
              >
                <p className="text-style-title tabular-nums text-text-primary">{stat.value}</p>
                <p className="text-style-body-small flex items-center gap-6 text-text-secondary">
                  {stat.icon}
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-24">
            <h2 className="text-style-body text-text-primary">Recreate your own version</h2>
            <div className="-mx-20 mt-16 flex gap-11 overflow-x-auto px-20 pb-4">
              {RECOMMENDATIONS.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  applied={false}
                  onToggle={() => {}}
                  variant="recreate"
                />
              ))}
            </div>
          </section>

          <section className="mt-24">
            <h2 className="text-style-body text-text-primary">Details</h2>
            <div className="mt-16 flex flex-col gap-20 rounded-20 border border-border-subtle bg-surface-default p-20">
              <div>
                <p className="text-style-label text-text-secondary">Creator’s intent</p>
                <p className="text-style-body-small mt-6 text-text-primary">{session.intent}</p>
              </div>
              <div className="flex flex-col gap-10">
                <p className="text-style-label text-text-secondary">In the mix</p>
                {session.layers.map((layer) => (
                  <div key={layer.id} className="flex items-baseline justify-between gap-16">
                    <span className="text-style-body-small text-text-primary">{layer.name}</span>
                    <span className="text-style-caption tabular-nums text-text-secondary">{layer.level}%</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-10">
                <p className="text-style-label text-text-secondary">Set for you</p>
                {session.personalization.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-16">
                    <span className="text-style-body-small text-text-primary">{item.label}</span>
                    <span className="text-style-caption text-right text-text-secondary">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
