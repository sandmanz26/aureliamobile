import {
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
import liveSessionsMap from '../assets/live-sessions-map.png'
import { Chip } from '../components/ui/Chip'
import { CoverImage } from '../components/ui/CoverImage'
import { CommunityCard } from '../components/ui/CommunityCard'
import { FeatureCard } from '../components/ui/FeatureCard'
import { useFeatureFlags } from '../demo/FeatureFlags'
import type { CoverKey } from '../lib/photos'
import { useDrawer } from '../layouts/DrawerContext'

const quickStartCards: { title: string; subtitle: string; gradient: string; photo: CoverKey }[] = [
  { title: 'Affirmations', subtitle: 'Personalized exprience.', photo: 'affirmations', gradient: 'linear-gradient(160deg, var(--color-danger-400), var(--color-warning-300))' },
  { title: 'Guided Breath Work', subtitle: 'Personalized exprience.', photo: 'breathwork', gradient: 'linear-gradient(160deg, var(--color-neutral-700), var(--color-neutral-400))' },
]

const communityCards = [
  {
    title: 'Dolphins frequency',
    photo: 'dolphins' as CoverKey,
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    author: 'Adam Nilson',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-400))',
  },
  {
    title: 'Raise your Vibration',
    photo: 'vibration' as CoverKey,
    description: 'This helped Sara improve her mood within few minutes.',
    author: 'Sara Trezeguat',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-warning-300), var(--color-danger-200))',
  },
  {
    title: 'Mind Dance',
    photo: 'mindDance' as CoverKey,
    description: 'This helped Lily reduce stress by 43% in less that a week.',
    author: 'Lily Ahmad',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-primary-700), var(--color-primary-300))',
  },
]

const chips = ['All', 'Meditations (12.5k)', 'Music (8.3k)', 'Energy (3.1k)', 'Sleep (13.4k)', 'Calm (22.3k)']

const features = [
  { icon: <TrendingUp size={20} />, title: 'Mood Progress', description: 'Tracks baseline shifts' },
  { icon: <Waves size={20} />, title: 'Mindful Waves', description: 'Real-time frequency tuning' },
  { icon: <Music size={20} />, title: 'Adaptive Audio', description: 'Adaptive soundscapes' },
  { icon: <Wind size={20} />, title: 'Breathwork Sync', description: 'Custom breathing patterns' },
  { icon: <Coins size={20} />, title: 'Daily Coins', description: 'Earn daily rewards' },
  { icon: <Users size={20} />, title: 'Community Mix', description: 'Shared Practices' },
]

export function HomePage() {
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()
  const [activeChip, setActiveChip] = useState('All')

  return (
    <div className="pb-48" style={{ background: 'linear-gradient(180deg, #ffffff, #fff1db 60%, #ffffff)' }}>
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
        <div className="flex h-44 items-center gap-8 rounded-full bg-surface-default px-16 shadow-sm">
          <span
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            <Coins size={10} className="text-text-inverse" />
          </span>
          <span className="text-style-label">1,323</span>
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Hero */}
        <section className="relative pt-8 text-center">
          <div
            className="pointer-events-none absolute -right-32 -top-16 size-[252px] rounded-full opacity-70 blur-2xl"
            style={{ background: 'var(--color-primary-200)' }}
          />
          <h1 className="relative text-style-title-large text-text-primary">Create the space you imagine.</h1>

          <div className="relative mt-24 flex h-56 items-center gap-12 rounded-full border border-border-default bg-surface-default px-20">
            <span className="text-style-body flex-1 text-left text-text-secondary">Ask Aurelia..</span>
            <span className="flex size-32 items-center justify-center rounded-full bg-background-elevated text-icon-default">
              <Mic size={16} />
            </span>
            <button
              type="button"
              aria-label="Send"
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
          <div
            className="relative mt-16 flex h-[320px] flex-col justify-center gap-32 overflow-hidden rounded-24 bg-cover bg-center px-20 py-40"
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
                <button className="relative flex h-24 items-center gap-4 rounded-full bg-surface-default/90 px-8 text-style-caption text-text-primary">
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

      {/* Dark generative wellness banner — full bleed */}
      {isEnabled('home.promo') && (
      <section className="mt-48 bg-text-primary px-20 py-48 text-center text-text-inverse lg:px-24">
        <span
          className="inline-block bg-clip-text text-style-caption font-medium text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, #ffe682, #ff881b)' }}
        >
          Generative Wellness Care
        </span>
        <h2 className="mx-auto mt-16 max-w-[320px] text-style-headline font-normal">Your Personal Mindfulness Guide</h2>
        <p className="mx-auto mt-12 max-w-[360px] text-style-body">
          Everything you need to reflect, restore, and reset, all in one adaptive app.
        </p>

        <div className="mx-auto mt-32 flex items-center justify-center">
          <div className="relative z-10 h-[220px] w-[138px] -rotate-6 overflow-hidden rounded-24 shadow-xl">
            <CoverImage
              photo="calm"
              gradient="linear-gradient(160deg, var(--color-neutral-950), var(--color-info-900))"
              width={280}
              height={440}
              scrim={false}
            />
          </div>
          <div className="relative -ml-32 h-[220px] w-[138px] rotate-6 overflow-hidden rounded-24 shadow-xl">
            <CoverImage
              photo="forest"
              gradient="linear-gradient(160deg, var(--color-primary-500), var(--color-primary-200))"
              width={280}
              height={440}
              scrim={false}
            />
          </div>
        </div>

        <p className="mx-auto mt-32 max-w-[360px] text-style-body-small opacity-90">
          Chat with Aurelia to instantly create custom meditations, soundscapes, and breathwork tailored to how you
          feel right now.
        </p>

        <button
          type="button"
          className="mt-24 rounded-full bg-surface-default px-24 py-14 text-style-body font-semibold text-text-primary"
        >
          Start your Journey
        </button>
      </section>
      )}

      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Recreate from Community */}
        {isEnabled('home.community') && (
        <section className="mt-48">
          <h2 className="text-style-title text-text-primary">Recreate from Community</h2>
          <div className="mt-16 flex gap-8 overflow-x-auto pb-4">
            {chips.map((chip) => (
              <Chip key={chip} label={chip} active={chip === activeChip} onClick={() => setActiveChip(chip)} />
            ))}
          </div>
          <div className="mt-16 flex gap-12 overflow-x-auto pb-4">
            {communityCards.map((card) => (
              <CommunityCard key={card.title} {...card} />
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
            className="mt-24 inline-flex items-center gap-8 rounded-full bg-surface-default px-24 py-14 text-style-body font-semibold text-text-primary"
          >
            <Repeat2 size={16} />
            Get Started
          </button>
        </section>
      </div>
    </div>
  )
}
