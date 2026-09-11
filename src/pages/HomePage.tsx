import {
  ArrowRight,
  ArrowUp,
  Coins,
  Menu,
  Mic,
  Music,
  Repeat2,
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
import { CommunityCard } from '../components/ui/CommunityCard'
import { FeatureCard } from '../components/ui/FeatureCard'
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

// Community cards read straight from the session catalogue, so a card, its
// detail page and the fork it produces can never describe different things.
// The chip above the rail narrows the same list, which is the only thing that
// makes the chips worth pressing.
function communityCards(category: CategoryFilter) {
  return sessionsInCategory(category).map((session) => ({
    slug: session.slug,
    title: session.title,
    photo: session.photo,
    description: session.description,
    author: session.author,
    plays: session.plays,
    recreated: session.recreated,
    gradient: session.gradient,
  }))
}

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

  return (
    // overflow-x-hidden: the decorative glows are deliberately larger than the
    // viewport and bleed past its right edge. Without the clip the document
    // itself scrolls sideways by a few pixels on every phone width.
    <div
      className="overflow-x-hidden pb-48"
      style={{ background: 'linear-gradient(180deg, #ffffff, #fff1db 60%, #ffffff)' }}
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
            <span className="text-style-label">1,323</span>
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

      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Hero */}
        <section className="relative pt-8 text-center">
          <div
            className="pointer-events-none absolute -right-32 -top-16 size-[252px] rounded-full opacity-70 blur-2xl"
            style={{ background: 'var(--color-primary-200)' }}
          />
          <h1 className="relative text-style-title-large text-text-primary">Create the space you imagine.</h1>

          {/* Typing is the moment the visitor commits — so that is where the
              sign-in ask lands, not on page load. */}
          <div className="relative mt-24 flex h-56 items-center gap-12 rounded-full border border-border-default bg-surface-default px-20">
            <input
              placeholder="Ask Aurelia.."
              onFocus={() => gate('/chat')}
              onMouseDown={(event) => {
                event.preventDefault()
                gate('/chat')
              }}
              className="text-style-body min-w-0 flex-1 bg-transparent text-left text-text-primary outline-none placeholder:text-text-secondary"
            />
            <button
              type="button"
              aria-label="Voice input"
              onClick={() => gate('/chat', { startVoice: true })}
              className="flex size-32 items-center justify-center rounded-full bg-background-elevated text-icon-default"
            >
              <Mic size={16} />
            </button>
            <button
              type="button"
              aria-label="Send"
              onClick={() => gate('/chat')}
              className="flex size-32 items-center justify-center rounded-full bg-icon-default text-icon-inverse"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </section>

        {/* Ongoing Live Sessions */}
        {isEnabled('home.liveSessions') && (
        <section className="mt-40">
          <h2 className="text-style-body text-text-primary" style={{ color: '#3c2405' }}>
            Ongoing Live Sessions
          </h2>
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
                  <p className="text-style-title-large text-text-inverse">{stat.value}</p>
                  <p className="text-style-caption text-text-inverse">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Quick Start */}
        {isEnabled('home.quickStart') && (
        <section className="mt-40">
          <h2 className="text-style-title text-text-primary">Quick Start</h2>
          <div className="mt-16 flex gap-12 overflow-x-auto pb-4">
            {quickStartCards.map((card) => (
              <div
                key={card.title}
                className="relative h-[160px] w-[160px] shrink-0 overflow-hidden rounded-16 p-12 text-text-inverse"
              >
                <CoverImage photo={card.photo} gradient={card.gradient} width={320} height={320} />
                <button
                  type="button"
                  onClick={() => gate('/chat')}
                  className="text-style-caption relative flex h-24 items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/90 px-8 text-text-primary"
                >
                  <Sparkles size={10} /> Create
                </button>
                <div className="absolute bottom-12 left-12 right-12">
                  <p className="text-style-body-small font-semibold drop-shadow">{card.title}</p>
                  <p className="text-style-caption opacity-90">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>

      {/* Dark generative wellness banner — full bleed.
          Figma frame 402x800, padding 40/20, counterAlign MIN (left-aligned),
          content SPACE_BETWEEN with the card pair bleeding past both edges. */}
      {isEnabled('home.promo') && (
      <section className="relative mt-48 overflow-hidden bg-[#1B1006] px-20 py-40 text-text-inverse lg:px-24">
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
              className="text-style-label w-fit rounded-full px-12 py-8"
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
              <h2 className="text-style-headline font-normal leading-[1.2]">
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

        {/* Card pair — 180x286 each. In the Figma frame the left card sits flush
            against the left edge of the screen with all four corners visible,
            and the pair bleeds past the *right* edge instead. The left padding
            is what the rotated corner needs to clear the edge, so it is tied to
            the rotation: at -10deg a 180x286 card is 227 wide once turned,
            which puts its corner 23.5px left of the layout box. */}
        <div className="relative -mx-20 my-32 flex h-[320px] items-center justify-start gap-[7px] overflow-hidden pl-24 lg:-mx-24 lg:justify-center lg:pl-0">
          <div className="relative h-[286px] w-[180px] shrink-0 -rotate-[10deg] overflow-hidden rounded-24 shadow-2xl">
            <CoverImage
              photo="underwater"
              gradient="linear-gradient(160deg, var(--color-info-900), var(--color-neutral-950))"
              width={360}
              height={572}
              scrim={false}
            />
            <PlayGlyph />
          </div>
          <div className="relative h-[286px] w-[180px] shrink-0 rotate-[12deg] overflow-hidden rounded-24 shadow-2xl">
            <CoverImage
              photo="glow"
              gradient="linear-gradient(165deg, #FFD9A8 0%, #FFB25E 45%, #F97B14 100%)"
              width={360}
              height={572}
              scrim={false}
            />
            <PlayGlyph />
          </div>
        </div>

        <div className="relative mx-auto flex max-w-[362px] flex-col gap-24 lg:max-w-[720px]">
          <p className="text-style-body-small text-text-inverse/80">
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
        <section className="mt-48">
          <h2 className="text-style-title text-text-primary">Recreate from Community</h2>
          <div className="mt-16 flex gap-8 overflow-x-auto pb-4">
            {CATEGORY_FILTERS.map((filter) => (
              <Chip
                key={filter}
                label={categoryLabel(filter)}
                active={filter === category}
                onClick={() => setCategory(filter)}
              />
            ))}
          </div>
          <div key={category} className="u-fade mt-16 flex gap-12 overflow-x-auto pb-4">
            {communityCards(category).map((card) => (
              <CommunityCard key={card.slug} {...card} guard={gate} />
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
          <h2 className="mt-16 text-style-headline text-text-primary">
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

        {/* Ready to restore CTA */}
        <section
          className="mt-48 rounded-24 px-24 py-40 text-center text-text-inverse"
          style={{ background: 'linear-gradient(160deg, #3C2405, #FF881B)' }}
        >
          <h2 className="text-style-headline">Ready to restore?</h2>
          <p className="mt-8 text-style-body-small opacity-90">Free to start, no credit card required!</p>
          <button
            type="button"
            onClick={() => gate('/chat')}
            className="text-style-body mt-24 inline-flex items-center gap-8 rounded-full bg-surface-default px-24 py-14 font-semibold text-text-primary"
          >
            <Repeat2 size={16} />
            Get Started
          </button>
        </section>
      </div>
    </div>
  )
}
