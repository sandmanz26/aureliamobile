import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  Heart,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { RecommendationCard } from '../components/chat/RecommendationCard'
import { RECOMMENDATIONS } from '../chat/ChatSessionContext'
import { useAudioPlayer } from '../audio/AudioPlayerContext'
import { CoinPill } from '../components/ui/CoinPill'
import { CoverImage } from '../components/ui/CoverImage'
import { MobileStatusBar } from '../components/ui/MobileStatusBar'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { findVersion } from '../lib/progress'
import { profilePath } from '../lib/people'
import type { ProfileOrigin } from '../lib/people'
import { findSession } from '../lib/sessions'
import type { Named } from '../lib/named'

/** Lines the session speaks, which the hero shows one at a time under the art.
 *  Mock, like everything in lib/ — as is the bed they play over. */
/** Where the pulled-up sheet rests: clear of the status bar, as the frame has it. */
const SHEET_TOP = 54

/** How much of the sheet shows before it is pulled. The frame is 402x874 with
 *  a 705 hero, so this is its own number. */
const SHEET_PEEK = 169

const CUES = [
  'Now take a deep breath in',
  'Hold it — and let the shoulders drop',
  'Breathe out, slower than you came in',
  'Let the next one arrive on its own',
]

const MOODS = [
  { emoji: '😣', label: 'Very unpleasant' },
  { emoji: '🙁', label: 'Unpleasant' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Pleasant' },
  { emoji: '😆', label: 'Very pleasant' },
] as const

/**
 * The mood check-in that surfaces once a session has played all the way
 * through (Figma 16698:12236 "How does listening…", 16698:12300 "What's
 * going on?", card itself 16698:15499) — pick a mood, then one optional
 * free-text follow-up. Nothing is sent anywhere; there is no backend yet to
 * hold a mood log, so answering just closes the card.
 */
function SessionCheckInCard({ onDismiss }: { onDismiss: () => void }) {
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')

  function submitNote(event: FormEvent) {
    event.preventDefault()
    onDismiss()
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[402px] lg:max-w-[560px]">
      <div className="relative rounded-t-24 bg-surface-default p-20 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_8px_34px_4px_rgba(0,0,0,0.15)]">
        {/* `.u-tap` sets `position: relative` on whatever it's given, which in
            a later cascade layer than Tailwind's utilities beats `absolute`
            on the same element — so the positioning goes on this wrapper and
            `u-tap` stays on the button it was written for. */}
        <div className="absolute right-16 top-16">
          <button type="button" onClick={onDismiss} className="text-style-caption u-tap text-text-secondary">
            Skip
          </button>
        </div>
        <div className="flex items-start gap-12 pr-40">
          <span
            className="flex size-32 shrink-0 items-center justify-center rounded-8 text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-gold-300), var(--color-warning-600))' }}
          >
            <Heart size={16} fill="currentColor" />
          </span>
          <h2 className="text-style-body-small pt-4 font-medium text-text-primary">
            {mood === null ? 'How does listening to this make you feel?' : "What's going on?"}
          </h2>
        </div>

        {mood === null ? (
          <div className="mt-16 flex justify-between">
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                aria-label={m.label}
                onClick={() => setMood(m.label)}
                className="u-press flex size-52 items-center justify-center rounded-full border-2 border-[#ff881b] text-[26px]"
              >
                {m.emoji}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={submitNote} className="mt-16 flex items-center gap-10">
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Answer here…"
              autoFocus
              className="text-style-body-small h-48 flex-1 rounded-full border border-border-default bg-background-default px-16 text-text-primary placeholder:text-text-secondary"
            />
            <button
              type="submit"
              aria-label="Send"
              className="u-press flex size-48 shrink-0 items-center justify-center rounded-full bg-icon-strong text-text-inverse"
            >
              <ArrowUp size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** How far the skip buttons move the playhead, and the arrow keys half of it. */
const SKIP = 15
const NUDGE = 5

/**
 * Back 15 / forward 15, flanking the play disc.
 *
 * Not in the frame, which draws the disc alone. It is here because the bar
 * above it is now draggable and a drag is the wrong instrument for "say that
 * last bit again": on a ten-minute session fifteen seconds is under three
 * pixels of track, which no thumb can land on.
 */
function SkipButton({ seconds, onPress }: { seconds: number; onPress: () => void }) {
  const back = seconds < 0
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={back ? `Back ${-seconds} seconds` : `Forward ${seconds} seconds`}
      className="u-press relative flex size-44 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-[12px]"
    >
      {back ? <RotateCcw size={26} strokeWidth={1.5} /> : <RotateCw size={26} strokeWidth={1.5} />}
      {/* The number sits in the glyph's own gap, which is what that gap is for. */}
      <span className="absolute text-[10px] font-semibold tabular-nums">{Math.abs(seconds)}</span>
    </button>
  )
}

/**
 * Figma "Player" (16523:9905) — the screen behind the play glyph.
 *
 * The art is the screen, not a header on it: cover full-bleed, the transport
 * floating on top, and a white sheet (radius 24 on its top corners only) that
 * carries everything you would read rather than hear.
 *
 * **The art bleeds to the window, the content does not.** They were one box
 * for a while, capped at the frame's 402, which left a white strip down either
 * side of the photograph on any phone wider than that — and every current
 * phone is.
 *
 * **The sheet is dragged, not scrolled.** It used to ride the document scroll,
 * which meant the art scrolled away with it and a flick past the bottom of the
 * page left the player half off-screen. It is now a panel pinned to the
 * viewport with two rests — peeking, and pulled up to just under the status
 * bar — that you drag by the grabber and that scrolls its own content once it
 * is up.
 */
export function PlayerPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const session = findSession(slug)
  // Which cut of it. Progress's version cards ask for one by id; everything
  // else asks for the session, which is the version that is current.
  const versionId = params.get('v')
  const version = session ? findVersion(session, versionId) : undefined
  // Who this session belongs to, as the screen that opened the player knows
  // it. Absent — a pasted URL, a refresh — the author decides.
  //
  // `as` is what the screen that sent you here calls the thing it is playing.
  // Nothing is really generated, so a session you just built plays a catalogue
  // session standing in for it — and without this the player and the mini
  // player announced the stand-in: you asked for a sleep meditation, watched
  // "Sleep meditation v1.2" reach 100%, pressed play, and were handed "Night
  // Rain Sleep by Sophia Reynolds". The stand-in is a mock; whose session this
  // is, is not.
  const handoff = location.state as { origin?: ProfileOrigin; as?: Named } | null
  const origin = handoff?.origin
  const named = handoff?.as

  // Playback lives above the router. This screen is a view onto it, so
  // walking back to the cockpit leaves the session running.
  const { playing, elapsed, duration, muted, load, toggle, seek, toggleMuted } = useAudioPlayer()
  const { isEnabled } = useFeatureFlags()
  const [expanded, setExpanded] = useState(false)

  // How far the sheet is pushed down from its pulled-up rest. 0 is up; the
  // collapsed rest is whatever leaves SHEET_PEEK showing, which depends on the
  // window rather than on the frame's 874.
  const [collapsedY, setCollapsedY] = useState(0)
  const [offset, setOffset] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ pointer: number; offset: number } | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  // The bed loops (see AudioPlayerContext), so it never fires a real `ended`
  // event — the clock just wraps back to 0 and keeps going. A wrap only means
  // "played all the way through" when it fell from near the end, not from a
  // scrub or a skip button landing near 0 on its own; either of those would
  // otherwise look identical to a completed loop.
  const [checkIn, setCheckIn] = useState(false)
  const finishedOnce = useRef(false)
  const lastElapsed = useRef(elapsed)
  useEffect(() => {
    const previous = lastElapsed.current
    lastElapsed.current = elapsed
    if (!finishedOnce.current && duration > 0 && previous >= duration - 0.5 && elapsed < 1) {
      finishedOnce.current = true
      setCheckIn(true)
    }
  }, [elapsed, duration])

  // A different session is a different playthrough to ask about.
  useEffect(() => {
    finishedOnce.current = false
    setCheckIn(false)
  }, [slug])

  useEffect(() => {
    const measure = () => {
      const rest = Math.max(0, window.innerHeight - SHEET_TOP - SHEET_PEEK)
      setCollapsedY(rest)
      // Until the first measurement the sheet has no rest to sit at, so it
      // starts collapsed rather than flashing open.
      setOffset((current) => (current === null ? rest : Math.min(current, rest)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const up = offset !== null && offset < collapsedY / 2

  const snap = useCallback(
    (next: boolean) => {
      setOffset(next ? 0 : collapsedY)
      if (!next) scroller.current?.scrollTo({ top: 0 })
    },
    [collapsedY],
  )

  // Put this session on the deck. load() no-ops when it is already there, so
  // arriving back from the cockpit does not restart what is playing.
  useEffect(() => {
    if (!session) return
    load({
      // A cut is its own recording, so it gets its own key. Without that the
      // deck would see the session it is already playing and keep playing it —
      // press play on v1.2 and you would go on hearing v1.3. A draft borrowing
      // this session is a cut by the same argument: leaving it on the bare slug
      // meant opening the real session afterwards kept the draft's name.
      slug: version
        ? `${session.slug}#${version.id}`
        : named
          ? `${session.slug}#draft`
          : session.slug,
      href: `${location.pathname}${location.search}`,
      title: named?.title ?? version?.title ?? session.title,
      // A version belongs to the same person and sits under the same art
      // unless it changed it, so only what the version states overrides.
      author: named?.author ?? session.author,
      photo: version?.photo ?? session.photo,
      gradient: version?.gradient ?? session.gradient,
    })
  }, [session, version, named, load, location.pathname, location.search])

  if (!session) return <Navigate to="/home" replace />

  // The beta's own cards link back here for full transport — that link
  // carries `skipBeta` precisely so this does not send it straight back
  // where it came from. Reached any other way (typed, refreshed, an old
  // bookmark, the header's own play glyph) with the flag on, this is the
  // plain player nobody chose over the swipeable one — land on the one the
  // flag actually promises.
  const skipBeta = (location.state as { skipBeta?: boolean } | null)?.skipBeta
  if (isEnabled('player.beta') && !skipBeta) {
    return <Navigate to={`/player-beta/${session.slug}${location.search}`} replace />
  }

  // Guarded: before the bed's metadata lands duration is its placeholder, and a
  // zero there would hand the range input max={0} and NaN for the fill.
  const shown = Math.min(elapsed, duration)
  const progress = duration > 0 ? Math.min(1, shown / duration) : 0
  // A quarter of the session each. Clamped rather than wrapped: the old modulo
  // put the first line back on screen at 100%, so the session ended by telling
  // you to breathe in.
  const cue = CUES[Math.min(CUES.length - 1, Math.floor(progress * CUES.length))]
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
    // h-dvh and clipped: the art is the screen and nothing behind it scrolls.
    // The sheet does its own moving on top.
    <div className="relative h-dvh overflow-hidden bg-black">
      {/* Full-bleed to the window, not to the frame's 402. Capped, it left a
          white strip down either side of the photograph on every phone wider
          than that. */}
      <div className="pointer-events-none absolute inset-0">
        <CoverImage
          photo={version?.photo ?? session.photo}
          gradient={version?.gradient ?? session.gradient}
          width={1024}
          height={2048}
          scrim={false}
          className="absolute inset-0"
        />
      </div>

      {/* ------------------------------------------------------------ hero */}
      <section
        className="relative mx-auto flex h-full w-full max-w-[402px] flex-col text-text-inverse lg:max-w-[560px]"
        style={{ paddingBottom: SHEET_PEEK }}
      >
        {/* The frame carries the iOS status bar over the art, not on a band
            above it. Same lg:hidden rule AppLayout uses, so a desktop window
            does not show a phone's clock. */}
        <div className="relative lg:hidden">
          <MobileStatusBar />
        </div>

        {/* gap-12 rather than the frame's 16: the sound switch is a fourth
            control in a row the frame drew with three. */}
        <header className="relative flex items-center gap-12 px-20 py-12">
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
          <CoinPill points="1,323" />
          {/* Sound off, and it stays off across a reload — the reason you
              silenced it is usually the room you are in, not this session. */}
          <button
            type="button"
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            aria-pressed={muted}
            onClick={toggleMuted}
            className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            aria-label="Share"
            className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong"
          >
            <Share2 size={18} />
          </button>
        </header>

        {/* Centres in what is left above the caption — the frame's own y=321
            for the 96px disc in a 402x874, arrived at by flow. */}
        <div className="relative flex flex-1 items-center justify-center gap-24">
          <SkipButton seconds={-SKIP} onPress={() => seek(elapsed - SKIP)} />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="u-press flex size-96 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-[16px]"
          >
            {playing ? (
              <Pause size={48} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={48} fill="currentColor" strokeWidth={0} className="ml-4" />
            )}
          </button>
          <SkipButton seconds={SKIP} onPress={() => seek(elapsed + SKIP)} />
        </div>

        <div className="relative px-20 pb-24">
          <p className="text-player-cue text-center">{cue}</p>

          <div className="mt-40">
            {/* 14 either side is the knob's radius: the control keeps its knob
                inside the track, so the track has to start where the knob can. */}
            <div className="relative mx-14 h-7">
              {/* Laid out as the 7px strip the frame draws, with the 28px
                  control centred over it — so the times below stay where they
                  are while the thing you grab is 28 tall. */}
              <input
                type="range"
                className="u-scrubber absolute top-1/2 left-0 -translate-y-1/2"
                aria-label="Seek"
                aria-valuetext={`${clock(shown)} of ${clock(duration)}`}
                min={0}
                max={duration}
                step={0.01}
                value={shown}
                onChange={(event) => seek(Number(event.target.value))}
                onKeyDown={(event) => {
                  // The element's own arrow step is one `step` — a hundredth of
                  // a second, which is not a seek. Media keys move in seconds.
                  const by =
                    event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                      ? -NUDGE
                      : event.key === 'ArrowRight' || event.key === 'ArrowUp'
                        ? NUDGE
                        : 0
                  if (by) {
                    event.preventDefault()
                    seek(elapsed + by)
                  }
                }}
                style={{ '--fill': `${progress * 100}%` } as CSSProperties}
              />
            </div>
            {/* The frame puts the times 4px under the track, which works there
                because its knob sits mid-bar. At 0% and at the end the knob is
                over a label, so they clear its 14px radius instead. */}
            <div className="mt-12 flex items-center justify-between text-[8px] tabular-nums">
              <span>{clock(shown)}</span>
              <span>{clock(duration)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- sheet */}
      <aside
        aria-label="Session details"
        /* Full width on a phone, capped only once there is a window to centre
           it in. Capped at the frame's 402 it left a sliver of cover art down
           either side of a white panel, which reads as a mistake rather than
           as the art showing through. */
        className="fixed inset-x-0 z-20 mx-auto flex w-full flex-col overflow-hidden rounded-t-24 bg-surface-default lg:max-w-[560px]"
        style={{
          top: SHEET_TOP,
          height: `calc(100dvh - ${SHEET_TOP}px)`,
          transform: `translateY(${offset ?? 9999}px)`,
          // No easing mid-drag, or the sheet lags the finger by a frame.
          transition: dragging ? 'none' : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* The grabber is the control, not an ornament: it drags, and a tap
            snaps to the other rest. */}
        <button
          type="button"
          aria-label={up ? 'Collapse details' : 'Expand details'}
          aria-expanded={up}
          onPointerDown={(event) => {
            drag.current = { pointer: event.clientY, offset: offset ?? collapsedY }
            setDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const start = drag.current
            if (!start) return
            const next = start.offset + (event.clientY - start.pointer)
            setOffset(Math.min(collapsedY, Math.max(0, next)))
          }}
          onPointerUp={(event) => {
            const start = drag.current
            drag.current = null
            setDragging(false)
            if (!start) return
            const moved = start.pointer - event.clientY
            // A real drag decides by direction; anything smaller is a tap and
            // toggles.
            if (Math.abs(moved) > 12) snap(moved > 0)
            else snap(!up)
          }}
          className="flex shrink-0 cursor-grab touch-none justify-center py-8 active:cursor-grabbing"
        >
          <span className="block h-5 w-36 rounded-full bg-[#7f7f7f]/40" />
        </button>

        {/* Scrolls only once the sheet is up. Collapsed, a flick should move
            the sheet rather than its contents. */}
        <div
          ref={scroller}
          className={`min-h-0 flex-1 px-20 pb-40 ${up ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <div className="flex items-center gap-12">
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
            <h1 className="text-style-title text-text-primary">{named?.title ?? version?.title ?? session.title}</h1>

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
            <div className="mt-16 flex flex-col gap-20 rounded-[20px] border border-border-subtle bg-surface-default p-20">
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
        </div>
      </aside>

      {checkIn && <SessionCheckInCard onDismiss={() => setCheckIn(false)} />}
    </div>
  )
}
