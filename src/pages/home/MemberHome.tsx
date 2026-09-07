import { ArrowRight, Coins, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import liveSessionsMap from '../../assets/live-sessions-map.png'
import { Chip } from '../../components/ui/Chip'
import { CommunityCard } from '../../components/ui/CommunityCard'
import { CoverImage } from '../../components/ui/CoverImage'
import { PhotoCircle } from '../../components/ui/PhotoCircle'
import { useFeatureFlags } from '../../demo/FeatureFlags'
import { useDrawer } from '../../layouts/DrawerContext'
import type { CoverKey } from '../../lib/photos'
import { sessionsOnShelf } from '../../lib/sessions'

/**
 * Home once you are signed in.
 *
 * The visitor's version of this page is a pitch — it argues for the product.
 * This one assumes the argument is won and gets out of the way: no marketing
 * banner, no feature grid, no "Ready to restore?". What replaces them is
 * everything that only makes sense once there is an account behind it — what
 * the community made, who to follow, what is picked for you.
 */
const quickStartCards: { title: string; subtitle: string; gradient: string; photo: CoverKey; to: string }[] = [
  {
    title: 'Affirmations',
    subtitle: 'Personalized exprience.',
    photo: 'affirmations',
    gradient: 'linear-gradient(160deg, var(--color-danger-400), var(--color-warning-300))',
    to: '/chat',
  },
  {
    title: 'Sleep Meditation',
    subtitle: 'Personalized exprience.',
    photo: 'sleep',
    gradient: 'linear-gradient(160deg, var(--color-neutral-700), var(--color-neutral-400))',
    to: '/chat',
  },
]

const chips = ['All', 'Meditations (12.5k)', 'Music (8.3k)', 'Energy (3.1k)', 'Sleep (13.4k)', 'Calm (22.3k)']

const creators: { name: string; photo: CoverKey; sessions: string }[] = [
  { name: 'Ethan Miller', photo: 'creatorEthan', sessions: '52 sessions' },
  { name: 'Daniel Carter', photo: 'creatorDaniel', sessions: '38 sessions' },
  { name: 'Sophia Reynolds', photo: 'creatorSophia', sessions: '27 sessions' },
  { name: 'Maya Bennett', photo: 'creatorMaya', sessions: '19 sessions' },
]

const challengeStats = [
  { label: 'Your day', value: '6 of 30' },
  { label: 'Joined', value: '12.4k' },
  { label: 'Per day', value: '8 min' },
]

/** Section heading, optionally with a "See All" on the right. */
function SectionHeader({ title, seeAllTo }: { title: string; seeAllTo?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-16">
      <h2 className="text-style-title text-text-primary">{title}</h2>
      {seeAllTo && (
        <Link to={seeAllTo} className="text-style-label shrink-0 whitespace-nowrap text-text-brand">
          See All
        </Link>
      )}
    </div>
  )
}

/** Horizontal shelf of community cards, used by three sections. */
function SessionShelf({ shelf }: { shelf: 'community' | 'picked' | 'impact' }) {
  return (
    <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
      {sessionsOnShelf(shelf).map((session) => (
        <CommunityCard
          key={session.slug}
          slug={session.slug}
          title={session.title}
          description={session.description}
          author={session.author}
          plays={session.plays}
          recreated={session.recreated}
          gradient={session.gradient}
          photo={session.photo}
        />
      ))}
    </div>
  )
}

export function MemberHome() {
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()
  const [activeChip, setActiveChip] = useState('All')

  return (
    <div className="pb-48" style={{ background: 'linear-gradient(180deg, #ffffff, #fff6e6 40%, #ffffff)' }}>
      <div className="flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-style-title-large text-text-primary">Explore</h1>
        </div>
        <div className="flex h-40 shrink-0 items-center gap-8 rounded-full bg-surface-default px-14 shadow-sm">
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
        {/* Hero banner — the one thing the app wants you to press today. */}
        <Link
          to="/chat"
          aria-label="Play today’s session"
          className="relative block aspect-[362/200] w-full overflow-hidden rounded-24"
        >
          <CoverImage
            photo="bloom"
            gradient="linear-gradient(160deg, var(--color-info-900), var(--color-danger-500))"
            width={760}
            height={420}
            scrim={false}
          />
          <span className="absolute left-1/2 top-1/2 flex size-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
            <span
              className="ml-2 size-0"
              style={{
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '15px solid rgba(0,0,0,0.8)',
              }}
            />
          </span>
        </Link>

        {isEnabled('home.quickStart') && (
          <section className="mt-32">
            <SectionHeader title="Quick Start" />
            <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {quickStartCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className="relative h-[160px] w-[160px] shrink-0 overflow-hidden rounded-16 p-12 text-text-inverse"
                >
                  <CoverImage photo={card.photo} gradient={card.gradient} width={320} height={320} />
                  <span className="text-style-caption relative flex h-24 w-fit items-center gap-4 whitespace-nowrap rounded-full bg-surface-default/90 px-8 text-text-primary">
                    Create
                  </span>
                  <span className="absolute bottom-12 left-12 right-12">
                    <span className="text-style-body-small block truncate font-semibold drop-shadow">{card.title}</span>
                    <span className="text-style-caption block truncate opacity-90">{card.subtitle}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {isEnabled('home.liveSessions') && (
          <section className="mt-32">
            <SectionHeader title="Ongoing Live Sessions" />
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
                  <div
                    key={stat.label}
                    className="flex-1 rounded-16 bg-surface-default/25 py-12 text-center backdrop-blur-sm"
                  >
                    <p className="text-style-title-large text-text-inverse">{stat.value}</p>
                    <p className="text-style-caption text-text-inverse">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {isEnabled('home.community') && (
          <section className="mt-32">
            <SectionHeader title="Recreate from Community" />
            <div className="-mx-20 mt-16 flex gap-8 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {chips.map((chip) => (
                <Chip key={chip} label={chip} active={chip === activeChip} onClick={() => setActiveChip(chip)} />
              ))}
            </div>
            <SessionShelf shelf="community" />
          </section>
        )}

        {isEnabled('home.creators') && (
          <section className="mt-32">
            <SectionHeader title="Trusted Creators" />
            <div className="-mx-20 mt-16 flex gap-20 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {creators.map((creator) => (
                <div key={creator.name} className="flex w-[84px] shrink-0 flex-col items-center gap-8 text-center">
                  <PhotoCircle
                    photo={creator.photo}
                    size={72}
                    gradient="conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))"
                    alt={creator.name}
                  />
                  <span className="min-w-0">
                    <span className="text-style-caption block truncate text-text-primary">{creator.name}</span>
                    <span className="text-style-caption block truncate text-text-secondary">{creator.sessions}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isEnabled('home.challenge') && (
          <section className="mt-32">
            <SectionHeader title="Monthly Challenge!" />
            <div className="relative mt-16 flex aspect-[362/240] w-full flex-col justify-end overflow-hidden rounded-24 p-16 text-text-inverse">
              <CoverImage
                photo="mindDance"
                gradient="linear-gradient(160deg, var(--color-espresso-950), var(--color-espresso-700))"
                width={760}
                height={520}
              />
              <Link
                to="/wellness"
                className="text-style-label absolute right-16 top-16 flex h-32 items-center gap-6 whitespace-nowrap rounded-full bg-surface-default/90 px-12 text-text-primary"
              >
                Join
                <ArrowRight size={13} />
              </Link>

              <p className="text-style-title relative">30-Day Nervous System Reset</p>
              <p className="text-style-body-small relative mt-4 opacity-90">
                Slow down and build a calmer daily rhythm.
              </p>
              <div className="relative mt-14 flex gap-8">
                {challengeStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 rounded-12 bg-surface-default/20 py-8 text-center backdrop-blur-sm"
                  >
                    <p className="text-style-label tabular-nums">{stat.value}</p>
                    <p className="text-style-caption opacity-80">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {isEnabled('home.picked') && (
          <section className="mt-32">
            <SectionHeader title="Picked for You" seeAllTo="/explore" />
            <SessionShelf shelf="picked" />
          </section>
        )}

        {isEnabled('home.impact') && (
          <section className="mt-32">
            <SectionHeader title="Sessions with Biggest Impact" seeAllTo="/explore" />
            <SessionShelf shelf="impact" />
          </section>
        )}
      </div>
    </div>
  )
}
