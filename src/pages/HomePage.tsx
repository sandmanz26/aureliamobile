import {
  ArrowRight,
  ArrowUp,
  Coins,
  Menu,
  Mic,
  Music,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Waves,
  Wind,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useSignInGate } from '../auth/useSignInGate'
import liveSessionsMap from '../assets/live-sessions-map.png'
import { Chip } from '../components/ui/Chip'
import { CoverImage } from '../components/ui/CoverImage'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { CommunityNetwork } from '../components/ui/CommunityNetwork'
import { FeatureCard } from '../components/ui/FeatureCard'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import { useFeatureFlags } from '../demo/FeatureFlags'
import type { CoverKey } from '../lib/photos'
import type { CategoryFilter } from '../lib/sessions'
import { CATEGORY_FILTERS, categoryLabel, sessionsInCategory } from '../lib/sessions'
import { useDrawer } from '../layouts/DrawerContext'

// A one-tap way in for each of the things Aurelia actually makes, so the rail
// doubles as the answer to "what can I even ask for?".
const quickStartCards: { title: string; subtitle: string; gradient: string; photo: CoverKey }[] = [
  { title: 'Affirmations', subtitle: 'Personalized exprience.', photo: 'affirmations', gradient: 'linear-gradient(160deg, var(--color-danger-400), var(--color-warning-300))' },
  { title: 'Guided Breath Work', subtitle: 'Personalized exprience.', photo: 'breathwork', gradient: 'linear-gradient(160deg, var(--color-neutral-700), var(--color-neutral-400))' },
  { title: 'Sleep Meditation', subtitle: 'Wind down for the night.', photo: 'sleep', gradient: 'linear-gradient(160deg, var(--color-info-950), var(--color-info-600))' },
  { title: 'Focus Sound', subtitle: 'Stay with one thing.', photo: 'rain', gradient: 'linear-gradient(160deg, var(--color-neutral-800), var(--color-info-500))' },
  { title: 'Morning Reset', subtitle: 'Start the day settled.', photo: 'morning', gradient: 'linear-gradient(160deg, var(--color-warning-700), var(--color-warning-300))' },
  { title: 'Stress Relief', subtitle: 'Come down a notch.', photo: 'stress', gradient: 'linear-gradient(160deg, var(--color-success-900), var(--color-success-500))' },
  { title: 'Deep Calm', subtitle: 'Nothing asked of you.', photo: 'calm', gradient: 'linear-gradient(160deg, var(--color-info-900), var(--color-neutral-950))' },
]

const features = [
  { icon: <TrendingUp size={20} />, title: 'Mood Progress', description: 'Tracks baseline shifts' },
  { icon: <Waves size={20} />, title: 'Mindful Waves', description: 'Real-time frequency tuning' },
  { icon: <Music size={20} />, title: 'Adaptive Audio', description: 'Adaptive soundscapes' },
  { icon: <Wind size={20} />, title: 'Breathwork Sync', description: 'Custom breathing patterns' },
  { icon: <Coins size={20} />, title: 'Daily Coins', description: 'Earn daily rewards' },
  { icon: <Users size={20} />, title: 'Community Mix', description: 'Shared Practices' },
]

/** Translucent circle with a play triangle, centred on each promo card. */
function PlayGlyph() {
  return (
    <span className="absolute left-1/2 top-1/2 flex size-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
      {/* Points right: this is a play control, and a downward triangle reads as
          expand. The 2px nudge is optical — a triangle centred by its bounding
          box looks left of centre inside a circle. */}
      <span
        className="ml-[2px] size-0"
        style={{
          borderTop: '9px solid transparent',
          borderBottom: '9px solid transparent',
          borderLeft: '13px solid rgba(255,255,255,0.95)',
        }}
      />
    </span>
  )
}

/**
 * Home — the same page signed in or out.
 *
 * Nothing here is fake-disabled: every control looks and behaves like the real
 * thing right up to the point where it would need an account, and then it hands
 * the visitor to sign-in with their destination remembered. Asking for an email
 * before showing anything is how a demo loses the room.
 *
 * The one unavoidable difference is the header: a visitor has no coin balance,
 * so the pill is replaced by Sign in until there is an account behind it.
 */
export function HomePage() {
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()
  const { signedIn } = useAuth()
  const gate = useSignInGate()
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [ask, setAsk] = useState('')

  function askAurelia(event: React.FormEvent) {
    event.preventDefault()
    const text = ask.trim()
    // An empty send still opens chat — there is nothing to carry, but the tap
    // clearly meant "take me there".
    gate('/chat', text ? { ask: text } : undefined)
  }

  return (
    // overflow-x-hidden: the decorative glows are deliberately larger than the
    // viewport and bleed past its right edge. Without the clip the document
    // itself scrolls sideways by a few pixels on every phone width.
    <div
      className="overflow-x-hidden pb-48"
      style={{ background: '#FFFFFF' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-20 py-16 lg:px-24">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openDrawer}
          className="flex size-44 items-center justify-center rounded-full text-icon-strong lg:hidden"
        >
          <Menu size={24} />
        </button>
        <span className="hidden lg:block" />
        {signedIn ? (
          <div className="flex h-44 items-center gap-8 rounded-full bg-surface-default px-16 shadow-sm">
            <span
              className="flex size-16 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
            >
              <Coins size={10} className="text-text-inverse" />
            </span>
            <span className="text-style-body-small">1,323</span>
          </div>
        ) : (
          /* A visitor has no coin balance yet — the header offers the account instead. */
          <button
            type="button"
            onClick={() => gate()}
            className="text-style-label flex h-44 items-center rounded-full bg-surface-default px-20 font-medium text-text-primary shadow-sm"
          >
            Sign in
          </button>
        )}
      </div>

      {/* White, and that is the frame's own answer rather than an absence of
          one. Figma's page (16653:14937) carries a single vertical gradient
          over its whole 3787px: #FFFFFF held until 77% of the way down, easing
          to #FFF1DB only at the very bottom — which is under the dark banner
          and never really seen. Everything from the hero to Quick Start sits in
          the white part.

          This was a three-stop wash reaching #FFF1DB at 55% of *this block*, so
          the cream landed on the hero instead of a thousand pixels below it and
          the whole opening read yellow. The only warmth up here is the glow. */}
      <div style={{ background: '#FFFFFF' }}>
      {/* No bottom padding. This column is not the last block on the page —
          the full-bleed banner follows it and brings its own top margin. When
          both set the gap, the gap is their sum and neither number matches the
          frame. One rule, one gap. */}
      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Hero */}
        <section className="relative pt-24 text-center">
          {/* Figma "Ellipse 6" — a 252 circle of #FFE682 at 60%, under a 224
              layer blur, its left edge on the page's centre line and its top at
              76, which puts it behind the header rather than below it. The
              circle is small and the blur is what makes it a wash: it was a 280
              disc at 35% under a 64px blur, which is a tighter, harder spot in
              a different place. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-64 left-1/2 size-252 rounded-full"
            style={{ background: '#FFE682', opacity: 0.6, filter: 'blur(80px)' }}
          />

          {/* The mark opens the page, above the claim it belongs to. */}
          <AureliaLogo iconSize={64} markOnly className="relative" />

          <h1 className="text-style-title-large relative mt-20 text-text-primary">
            Create the{' '}
            {/* "space" is the product's whole promise, so the sentence points
                at it — italic and in the brand gold, the way the design does. */}
            <em className="italic" style={{ color: '#E9A93A' }}>
              space
            </em>{' '}
            you imagine.
          </h1>

          {/* A composer, not a search field: it is sized for a sentence about
              how you want to feel, and the actions sit under what you typed
              rather than crowding the end of the line.

              A visitor can type here without an account. The sign-in ask lands
              on send, not on the first keystroke: someone who has just written
              what they want is far more likely to finish signing up than
              someone stopped before saying anything, and what they typed
              travels with them so they never have to write it twice. */}
          <div
            className="relative mt-24 rounded-24 border-[1.5px] bg-surface-default px-16 pb-10 pt-14 text-left"
            style={{ borderColor: '#EFA63C' }}
          >
            <form onSubmit={askAurelia}>
              <input
                value={ask}
                onChange={(event) => setAsk(event.target.value)}
                placeholder="Ask Aurelia.."
                aria-label="Ask Aurelia"
                className="text-style-body-light h-24 w-full bg-transparent text-left text-text-primary outline-none placeholder:text-text-secondary"
              />
              <div className="mt-12 flex items-center justify-end gap-10">
                <button
                  type="button"
                  aria-label="Voice input"
                  onClick={() => gate('/chat', { startVoice: true })}
                  className="u-press flex size-36 items-center justify-center rounded-full bg-background-elevated text-icon-default"
                >
                  <Mic size={17} />
                </button>
                <button
                  type="submit"
                  aria-label="Send"
                  className="u-press flex size-40 items-center justify-center rounded-full bg-icon-default text-icon-inverse"
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Ongoing Live Sessions */}
        {isEnabled('home.liveSessions') && (
        <section className="mt-40">
          <h2 className="text-style-body text-text-primary">Ongoing Live Sessions</h2>
          {/* Figma "Frame 45": 362x320, padding 40/20/20/20, stats pinned under
              the map. The card holds the source image's aspect ratio so the
              dot-map is never stretched, and caps its width on desktop. */}
          <div
            className="relative mx-auto mt-16 flex aspect-[362/320] w-full max-w-[440px] flex-col justify-end overflow-hidden rounded-24 bg-cover bg-center px-20 pb-20 pt-40"
            style={{ backgroundImage: `url(${liveSessionsMap})` }}
          >
            <div className="relative z-10 flex gap-12">
              {[
                { label: 'People', value: '87k' },
                { label: 'Today', value: '20k' },
                { label: 'Now', value: '50' },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 rounded-16 bg-surface-default/25 py-12 text-center backdrop-blur-sm">
                  <p className="text-style-title-large-regular text-text-inverse">{stat.value}</p>
                  <p className="text-style-label-light text-text-inverse">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Quick Start */}
        {isEnabled('home.quickStart') && (
        <section className="mt-40">
          <h2 className="text-style-body text-text-primary">Quick Start</h2>
          <div className="-mx-20 mt-16 flex gap-16 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
            {quickStartCards.map((card) => (
              <div
                key={card.title}
                className="relative h-[160px] w-[236px] shrink-0 overflow-hidden rounded-16 p-12 text-text-inverse"
              >
                <CoverImage photo={card.photo} gradient={card.gradient} width={480} height={320} />

                {/* Two ways in, and they are different: play the starter as it
                    is, or open chat and make your own from it. */}
                <div className="relative flex items-center justify-between gap-8">
                  <button
                    type="button"
                    aria-label={`Play ${card.title}`}
                    onClick={() => gate('/chat')}
                    className="u-press flex size-32 shrink-0 items-center justify-center rounded-full bg-white/25 text-text-inverse backdrop-blur-sm"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => gate('/chat')}
                    className="text-style-label u-press flex h-30 items-center gap-6 whitespace-nowrap rounded-full bg-surface-default/90 px-12 text-text-primary"
                  >
                    <Sparkles size={13} /> Create
                  </button>
                </div>

                <div className="absolute bottom-12 left-12 right-12">
                  <p className="text-style-body-small drop-shadow">{card.title}</p>
                  <p className="text-style-caption-light">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>
      </div>

      {/* Dark generative wellness banner — full bleed.
          Figma frame 402x800, padding 40/20, counterAlign MIN (left-aligned),
          content SPACE_BETWEEN with the card pair bleeding past both edges. */}
      {isEnabled('home.promo') && (
      <section className="relative mt-16 overflow-hidden bg-[#1B1006] px-20 py-40 text-text-inverse lg:px-24">
        {/* The two warm ellipses behind the content (Figma "Ellipse 6/7"). */}
        <span
          className="pointer-events-none absolute -left-1/3 top-1/3 h-[276px] w-[565px] rounded-full opacity-50 blur-3xl"
          style={{ background: '#ff881b' }}
        />
        <span
          className="pointer-events-none absolute -right-1/4 bottom-0 h-[326px] w-[557px] rounded-full opacity-35 blur-3xl"
          style={{ background: '#ff881b' }}
        />

        <div className="relative mx-auto flex max-w-[362px] flex-col gap-24 lg:max-w-[720px]">
          <div className="flex flex-col gap-24">
            <span
              className="text-style-label-regular w-fit rounded-full px-12 py-8"
              style={{
                border: '1px solid rgba(255,136,27,0.55)',
                background:
                  'linear-gradient(90deg, #ffe682, #ff881b) text',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                backgroundImage: 'linear-gradient(90deg, #ffe682, #ff881b)',
              }}
            >
              Generative Wellness Care
            </span>

            <div className="flex flex-col gap-8">
              <h2 className="text-style-headline-regular">
                Your Personal
                <br />
                Mindfulness Guide
              </h2>
              <p className="text-style-body">
                Everything you need to reflect, restore, and reset, all in one adaptive app.
              </p>
            </div>
          </div>
        </div>

        {/* Card pair. The width is one number and everything else is derived
            from it, so the pair grows with the screen instead of sitting at
            phone size on a wide one — at 402px it lands on the Figma's 180px,
            and it stops at 280 so it never dominates a desktop window.

            The two derived numbers, both tied to the -10deg rotation: a card is
            1.589 times as tall as it is wide, and once turned it measures
            1.26 times its width, which puts each corner 0.13 widths outside the
            layout box. That overhang is the left padding — it is what lets the
            left card sit flush to the screen edge with all four corners visible
            while the pair bleeds past the right edge. */}
        <div
          className="relative -mx-20 my-32 flex items-center justify-start gap-[7px] overflow-hidden lg:-mx-24 lg:justify-center lg:pl-0"
          style={{
            height: 'calc(var(--promo-card) * 1.78)',
            paddingLeft: 'calc(var(--promo-card) * 0.13)',
            ['--promo-card' as string]: 'clamp(150px, 45vw, 280px)',
          }}
        >
          <div
            className="relative aspect-[180/286] shrink-0 -rotate-[10deg] overflow-hidden rounded-24 shadow-2xl"
            style={{ width: 'var(--promo-card)' }}
          >
            <CoverImage
              photo="underwater"
              gradient="linear-gradient(160deg, var(--color-info-900), var(--color-neutral-950))"
              width={560}
              height={890}
              scrim={false}
            />
            <PlayGlyph />
          </div>
          <div
            className="relative aspect-[180/286] shrink-0 -rotate-[12deg] overflow-hidden rounded-24 shadow-2xl"
            style={{ width: 'var(--promo-card)' }}
          >
            <CoverImage
              photo="glow"
              gradient="linear-gradient(165deg, #FFD9A8 0%, #FFB25E 45%, #F97B14 100%)"
              width={560}
              height={890}
              scrim={false}
            />
            <PlayGlyph />
          </div>
        </div>

        <div className="relative mx-auto flex max-w-[362px] flex-col gap-24 lg:max-w-[720px]">
          <p className="text-style-body-small-light text-text-inverse/80">
            Chat with Aurelia to instantly create custom meditations, soundscapes, and breathwork tailored to how you
            feel right now.
          </p>

          <button
            type="button"
            onClick={() => gate('/chat')}
            className="text-style-body flex w-fit items-center gap-12 rounded-full border border-text-inverse/20 bg-text-inverse/8 px-20 py-12 font-medium text-text-inverse backdrop-blur-sm transition-colors hover:bg-text-inverse/15"
          >
            Start your Journey
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
      )}

      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Recreate from Community */}
        {isEnabled('home.community') && (
        <section className="mt-24">
          <h2 className="text-style-body text-text-primary">Recreate from Community</h2>
          <div className="-mx-20 mt-16 flex gap-8 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
            {CATEGORY_FILTERS.map((filter) => (
              <Chip
                key={filter}
                label={categoryLabel(filter)}
                active={filter === category}
                onClick={() => setCategory(filter)}
              />
            ))}
          </div>
          <div
            key={category}
            className="u-fade -mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24"
          >
            {sessionsInCategory(category).map((session) => (
              <SessionGridCard
                key={session.slug}
                session={session}
                guard={gate}
                className="aspect-[228/303] w-[228px] shrink-0"
              />
            ))}
          </div>
        </section>
        )}

        {/* Adaptive Wellness feature grid */}
        {isEnabled('home.adaptive') && (
        <section className="mt-48">
          <span className="inline-block rounded-full bg-background-elevated px-16 py-6 text-style-caption text-text-primary">
            Adaptive Wellness
          </span>
          <h2 className="mt-16 text-style-headline-regular text-text-primary">
            Aurelia learns your state, and gets better with you.
          </h2>
          <p className="mt-12 text-style-body">
            The more you create, the more Aurelia understands your rhythm. Personalized to you from day one.
          </p>

          <div className="mt-24 grid grid-cols-2 gap-12">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>
        )}

        {/* Closing CTA. The network sits above the card and bleeds to both
            page edges — it is the argument the card then states in words, so
            it is wider than the content column on purpose. */}
        <section className="mt-24">
          {/* Figma "Frame 34" — the last row of the strength grid, 362 x 164,
              inside the content column. It was full-bleed with a 24 overlap,
              which made it read as a band under the page rather than the last
              card in the list, and left the footer sitting in a gap. The frame
              runs the card flush off the illustration's bottom edge. */}
          <CommunityNetwork className="w-full" />

          {/* Figma "Frame 45" in the last Section — 223 tall, radius 20, 40
              above and below, 20 at the sides, 32 between the words and the
              button and 4 between the two lines of words.

              The headline is **24 Regular at 120%**, not the 32 semibold this
              was using: that is what made it three lines tall and the card
              nearly twice its height. `text-balance` goes with it — the frame
              breaks after "for", and balancing fought that. */}
          <div
            className="relative flex flex-col items-center gap-32 rounded-[20px] px-20 py-40 text-center text-text-inverse"
            style={{ background: 'linear-gradient(180deg, #3C2405, #FF881B)' }}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-[24px] leading-[29px]">Casual Intelligence for Global Community</h2>
              {/* Light *italic* at 14/21 in the frame — the italic is the only
                  one on the page and it was missing entirely. */}
              <p className="text-[14px] font-light italic leading-[21px]">
                Free to start, no credit card required!
              </p>
            </div>
            <button
              type="button"
              onClick={() => gate('/chat')}
              className="u-press text-style-body inline-flex h-44 items-center rounded-[40px] border border-text-inverse/35 bg-text-inverse/12 px-20 text-text-inverse backdrop-blur-sm transition-colors hover:bg-text-inverse/20"
            >
              Get Started
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
