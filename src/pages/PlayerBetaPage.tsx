import { useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { ArrowLeft, Pause, Play, TrendingUp, Users } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAudioPlayer } from '../audio/AudioPlayerContext'
import { CoverImage } from '../components/ui/CoverImage'
import { MobileStatusBar } from '../components/ui/MobileStatusBar'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { progressFor } from '../lib/progress'
import { findSession } from '../lib/sessions'
import type { CoverKey } from '../lib/photos'
import { usePlayerBeta } from '../lib/playerBeta'

/** One swipeable card: the session as it stands, or one earlier cut of it. */
interface Card {
  id: string
  /** "Session" for the current cut, "Earlier cut" for a version behind it —
   *  the one thing a swipe cannot tell you on its own. */
  eyebrow: string
  title: string
  author: string
  minutes: string
  /** What the card's stat row is proud of: the current cut is loved, an
   *  earlier one is measured against what came after it. */
  stat: { icon: typeof Users; label: string }
  detail: string
  tags: string[]
  photo: CoverKey
  gradient: string
}

export function PlayerBetaPage() {
  const { slug } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const [betaEnabled] = usePlayerBeta()
  const { track, playing, load, toggle } = useAudioPlayer()

  const session = findSession(slug)

  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [measured, setMeasured] = useState(false)
  // A drag that actually moved must not also fire the card's Link — a mouse
  // click ending a 200px pan should not open the full player underneath it.
  const drag = useRef<{ startX: number; startLeft: number } | null>(null)
  const dragMoved = useRef(false)

  // Not part of the product yet, so a direct link or a stale bookmark from
  // before the switch was turned off lands back on the real player rather
  // than a page nobody chose to see.
  if (!betaEnabled) {
    return <Navigate to={`/play/${slug}${search.toString() ? `?${search.toString()}` : ''}`} replace />
  }
  if (!session) return <Navigate to="/home" replace />

  const versions = progressFor(session).versions

  // Card 0 is the session as it plays today; the rest are the cuts behind it,
  // oldest last — the same order Progress's own Chapters tab uses. A version
  // stands in front of its own history the way HomePage's cards do: cover,
  // title, one line of credit, then what it is worth.
  const cards: Card[] = [
    {
      id: 'current',
      eyebrow: 'Session',
      title: session.title,
      author: session.author,
      minutes: `${session.minutes} min`,
      stat: { icon: Users, label: `${session.recreated} recreated` },
      detail: session.summary,
      tags: [session.category, ...session.layers.slice(0, 2).map((layer) => layer.name)],
      photo: session.photo,
      gradient: session.gradient,
    },
    ...versions.map((version) => ({
      id: version.id,
      eyebrow: 'Earlier cut',
      title: version.title,
      author: version.author,
      minutes: version.minutes,
      stat: { icon: TrendingUp, label: `${version.delta} toward the goal` },
      detail: version.detail,
      tags: [session.category, version.chapter],
      photo: version.photo,
      gradient: version.gradient,
    })),
  ]

  // Land on the version a caller asked for — the mini player and the attached
  // card both know which cut they came from and pass it as `?v=`.
  const requested = search.get('v')
  const startAt = requested ? Math.max(0, cards.findIndex((card) => card.id === requested)) : 0

  const measure = (node: HTMLDivElement | null) => {
    trackRef.current = node
    if (node && !measured) {
      node.scrollTo({ left: startAt * node.clientWidth, behavior: 'auto' })
      setIndex(startAt)
      setMeasured(true)
    }
  }

  function onScroll() {
    const node = trackRef.current
    if (!node || node.clientWidth === 0) return
    const next = Math.round(node.scrollLeft / node.clientWidth)
    setIndex((current) => (current === next ? current : next))
  }

  // Touch and a trackpad's two-finger swipe already scroll this natively — a
  // mouse has no such gesture over a div with its scrollbar hidden, so a
  // desktop pointer with no touch behind it gets one here. Gated to
  // `pointerType === 'mouse'` so it never fights the touch path.
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const node = trackRef.current
    if (!node) return
    drag.current = { startX: event.clientX, startLeft: node.scrollLeft }
    dragMoved.current = false
    // Capture is claimed only once a real drag starts (see onPointerMove) —
    // not here. A plain click never moves the pointer, and claiming capture
    // on every mousedown regardless was swallowing the click Chromium would
    // otherwise have synthesized afterwards, so tapping a card silently did
    // nothing.
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const node = trackRef.current
    if (!node || !drag.current) return
    if (!dragMoved.current && Math.abs(event.clientX - drag.current.startX) > 6) {
      dragMoved.current = true
      node.setPointerCapture(event.pointerId)
      node.style.scrollSnapType = 'none'
    }
    if (!dragMoved.current) return
    node.scrollLeft = drag.current.startLeft - (event.clientX - drag.current.startX)
  }

  function onClickCapture(event: ReactMouseEvent) {
    if (dragMoved.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  function endDrag() {
    const node = trackRef.current
    const wasDragging = dragMoved.current
    drag.current = null
    if (!node || !wasDragging) return
    node.style.scrollSnapType = ''
    // Settle on the nearest card now that snapping is back on.
    const nearest = Math.round(node.scrollLeft / node.clientWidth)
    node.scrollTo({ left: nearest * node.clientWidth, behavior: 'smooth' })
  }

  const card = cards[index] ?? cards[0]
  const playHref = `/play/${session.slug}${card.id === 'current' ? '' : `?v=${card.id}`}`
  const trackSlug = card.id === 'current' ? session.slug : `${session.slug}#${card.id}`
  const isThisCard = track?.slug === trackSlug
  const showingPause = isThisCard && playing

  function press() {
    if (isThisCard) {
      toggle()
      return
    }
    load({
      slug: trackSlug,
      href: playHref,
      title: card.title,
      author: card.author,
      photo: card.photo,
      gradient: card.gradient,
    })
    // Starting a different cut must always end up audible — the bed under
    // every session is the same file, so if it was already running there is
    // nothing to press play on; toggling here would read as "stop" instead.
    if (!playing) toggle()
  }

  return (
    <div className="min-h-dvh bg-background-default pb-32">
      <div className="mx-auto max-w-[560px]">
        <div className="lg:hidden">
          <MobileStatusBar />
        </div>

        <header className="flex items-center gap-12 px-20 py-12">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-style-title-large-regular text-text-primary">Session</h1>
          {/* Names what this screen is, on every screen it draws — an
              experiment nobody but the person who opted in should mistake for
              the finished product. */}
          <span className="text-style-caption rounded-full bg-brand-default px-10 py-2 text-text-strong">
            Beta
          </span>
        </header>

        {/* -------------------------------------------------- swipeable card
            Scroll-snap rather than a hand-rolled drag: it gets touch, trackpad
            and mouse-wheel for free, and a tap that does not move is still a
            click — which is what lets the art itself open the full player. */}
        <div
          ref={measure}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          // The cover art is an <img>, and browsers make images draggable by
          // default — a mouse-drag over one starts a native "drag this image
          // out" gesture instead of the pointer events above ever firing past
          // the first one. This is the only thing standing in the way of it.
          onDragStart={(event) => event.preventDefault()}
          className="u-no-scrollbars flex snap-x snap-mandatory gap-16 overflow-x-auto px-[10%] pb-4 cursor-grab active:cursor-grabbing select-none"
        >
          {cards.map((c) => (
            <Link
              key={c.id}
              to={`/play/${session.slug}${c.id === 'current' ? '' : `?v=${c.id}`}`}
              className="relative h-[300px] w-[80%] shrink-0 snap-center overflow-hidden rounded-24 shadow-[0_5px_24px_4px_rgba(0,0,0,0.08)]"
            >
              <CoverImage photo={c.photo} gradient={c.gradient} width={640} height={640} />
              <span className="text-style-caption absolute left-16 top-16 rounded-full bg-black/35 px-10 py-4 text-text-inverse backdrop-blur">
                {c.eyebrow}
              </span>
            </Link>
          ))}
        </div>

        {/* Position, not decoration — a swipe carousel with three stops and no
            way to see that there are three is a hidden control. */}
        <div className="mt-12 flex items-center justify-center gap-6">
          {cards.map((c, i) => (
            <span
              key={c.id}
              className={`h-6 rounded-full transition-all ${
                i === index ? 'w-16 bg-interactive-primary' : 'w-6 bg-[#D6D6D6]'
              }`}
            />
          ))}
        </div>

        {/* --------------------------------------------------------- detail */}
        <div className="mt-20 px-20">
          <p className="text-style-caption uppercase tracking-widest text-text-secondary">{card.eyebrow}</p>
          <h2 className="text-style-title-lg mt-4 text-text-primary">{card.title}</h2>
          <p className="text-style-body-small mt-4 text-text-secondary">
            By <span className="text-text-primary">{card.author}</span> · {card.minutes}
          </p>

          <p className="text-style-label mt-12 flex items-center gap-6 text-text-primary">
            <card.stat.icon size={14} className="text-text-brand" />
            {card.stat.label}
          </p>

          <p className="text-style-body-small mt-12 text-text-secondary">{card.detail}</p>

          <div className="mt-16 flex flex-wrap gap-8">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="text-style-label rounded-full border border-[#D6D6D6] px-16 py-8 text-text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- control bar
            Same shape as the cockpit's MiniPlayer — one control vocabulary
            for "something can play here", wherever it shows up. */}
        <div className="sticky bottom-16 mt-24 px-20">
          <div className="flex h-68 items-center gap-12 rounded-[20px] bg-surface-default px-16 shadow-[0_5px_24px_4px_rgba(0,0,0,0.12)]">
            <PhotoCircle photo={card.photo} size={32} gradient={card.gradient} alt="" />
            <span className="min-w-0 flex-1">
              <span className="text-style-body block truncate text-text-primary">{card.title}</span>
              <span className="text-style-label block truncate font-normal! text-text-secondary">
                {card.author}
              </span>
            </span>
            <button
              type="button"
              onClick={press}
              aria-label={showingPause ? `Pause ${card.title}` : `Play ${card.title}`}
              className="u-press flex size-40 shrink-0 items-center justify-center rounded-full bg-interactive-primary text-text-inverse"
            >
              {showingPause ? (
                <Pause size={18} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={18} fill="currentColor" strokeWidth={0} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
