import { ArrowRight, Clock, Coins, ListFilter, Menu, Play, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import liveSessionsMap from '../assets/live-sessions-map.png'
import { Chip } from '../components/ui/Chip'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useDrawer } from '../layouts/DrawerContext'
import { QUICK_STARTS } from '../lib/quickStart'
import { trustedCreators } from '../lib/people'
import type { CategoryFilter, Shelf } from '../lib/sessions'
import { CATEGORY_FILTERS, categoryLabel, findSession, sessionsOnShelf } from '../lib/sessions'
import { CategorySheet } from '../components/ui/CategorySheet'
import { CoinPill } from '../components/ui/CoinPill'
import { CHALLENGES } from '../lib/challenges'
import type { ChallengeRecord } from '../lib/challenges'

/**
 * Sessions — the browse surface behind the Sessions nav item.
 *
 * Home argues for the product; this page is what you use once you are in it.
 * No marketing: a banner for the one thing to press today, then shelves —
 * quick starts, what is live now, what the community made, who to follow, the
 * running challenge, and two ranked shelves.
 */

const TRUSTED_CREATORS = trustedCreators()

/**
 * Sessions in progress. The only shelf that carries a progress bar, because it
 * is the only one where "how far in am I" is the reason you came back — the
 * rest are things you have not started.
 */
const AVATAR_RING = 'conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))'

const recentlyPlayed: { slug: string; minutes: number; progress: number }[] = [
  { slug: 'inner-frequency', minutes: 5, progress: 0.62 },
  { slug: 'quiet-space', minutes: 9, progress: 0.28 },
  { slug: 'rainy-mind', minutes: 14, progress: 0.81 },
]

/**
 * The three facts the design puts on the challenge card, read off the
 * challenge rather than written out.
 *
 * All three were hard-coded — "250 pts", "2.3k joined", "30 days" — beside a
 * hard-coded title, summary, cover and slug. The card described one challenge
 * because it *was* one challenge, so a second could not appear and the first
 * could never be wrong in an interesting way.
 */
function challengeStats(challenge: ChallengeRecord) {
  return [
    { icon: Coins, label: `${challenge.points} pts` },
    // "0 joined" is a fact worth printing on a challenge that just opened.
    { icon: Users, label: `${challenge.joined} joined` },
    { icon: Clock, label: `${challenge.totalDays} days` },
  ]
}

/** Section heading, optionally with a link on the right. */
function SectionHeader({
  title,
  seeAllTo,
  action = 'See All',
  onAction,
}: {
  title: string
  seeAllTo?: string
  action?: string
  /** Handles the action in place, for the ones that open a sheet rather than
   *  navigate. Wins over seeAllTo when both are given. */
  onAction?: () => void
}) {
  return (
    <div className="flex items-baseline justify-between gap-16">
      <h2 className="text-style-title text-text-primary">{title}</h2>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="u-tap text-style-label shrink-0 whitespace-nowrap text-text-brand"
        >
          {action}
        </button>
      ) : (
        seeAllTo && (
          <Link to={seeAllTo} className="u-tap text-style-label shrink-0 whitespace-nowrap text-text-brand">
            {action}
          </Link>
        )
      )}
    </div>
  )
}

/** A session you are part-way through. */
function RecentCard({ slug, minutes, progress }: { slug: string; minutes: number; progress: number }) {
  const session = findSession(slug)
  if (!session) return null
  return (
    <article className="relative h-[150px] w-[236px] shrink-0 overflow-hidden rounded-16 p-12 text-text-inverse">
      <CoverImage photo={session.photo} gradient={session.gradient} width={480} height={300} />
      <Link
        to={`/play/${session.slug}`}
        state={{ origin: 'community' }}
        aria-label={`Resume ${session.title}`}
        className="absolute inset-0 z-10"
      />
      <span className="relative flex size-32 items-center justify-center rounded-full bg-white/25 text-text-inverse backdrop-blur-sm">
        <Play size={14} fill="currentColor" />
      </span>
      <div className="absolute bottom-14 left-12 right-12">
        <p className="text-style-body-small truncate font-semibold drop-shadow">{session.title}</p>
        <div className="mt-4 flex items-center justify-between gap-8">
          <span className="flex min-w-0 items-center gap-6">
            <PhotoCircle photo={session.authorPhoto} size={16} gradient={AVATAR_RING} alt="" />
            <span className="text-style-caption truncate opacity-90">{session.author}</span>
          </span>
          <span className="text-style-caption flex shrink-0 items-center gap-4 opacity-90">
            <Clock size={11} /> {minutes} mins
          </span>
        </div>
      </div>
      {/* How far in you are, pinned to the card's bottom edge. */}
      <span className="absolute bottom-0 left-0 right-0 h-4 bg-white/25">
        <span
          className="block h-full rounded-r-full"
          style={{ width: `${Math.round(progress * 100)}%`, background: '#FF881B' }}
        />
      </span>
    </article>
  )
}

/**
 * Horizontal shelf of community cards, used by three sections.
 *
 * `category` is what the chip row sets. Keying the rail on it restarts the
 * entrance animation, so a filter change reads as the list being replaced
 * rather than cards silently swapping underneath the chips.
 */
function SessionShelf({ shelf, category = 'All' }: { shelf: Shelf; category?: CategoryFilter }) {
  const sessions = sessionsOnShelf(shelf, category)

  if (sessions.length === 0) {
    return (
      <p className="text-style-body-small mt-16 text-text-secondary">
        Nothing in {categoryLabel(category)} yet — try another category.
      </p>
    )
  }

  return (
    <div
      key={category}
      className="u-fade -mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24"
    >
      {sessions.map((session) => (
        <SessionGridCard
          key={session.slug}
          session={session}
          className="aspect-[228/303] w-[228px] shrink-0"
        />
      ))}
    </div>
  )
}

export function ExplorePage() {
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [categoriesOpen, setCategoriesOpen] = useState(false)

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
        <div className="flex shrink-0 items-center gap-8">
        <CoinPill points="1,323" className="shadow-sm" />
        {/* A filter, not a bookmark. It opens the category sheet this screen
            already has, so the header control and the chip row below it are
            two ways to the same thing rather than two different promises. The
            dot marks a filter that is on — a header that looks identical
            whether or not the shelf is narrowed is how people lose track of
            why a shelf looks empty. */}
        <button
          type="button"
          aria-label={
            category === 'All' ? 'Filter by category' : `Filtered by ${categoryLabel(category)}. Change filter`
          }
          onClick={() => setCategoriesOpen(true)}
          className="u-press relative flex size-40 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
        >
          <ListFilter size={18} />
          {category !== 'All' && (
            <span
              aria-hidden="true"
              className="absolute right-8 top-8 size-8 rounded-full border-2 border-surface-default bg-brand-emphasis"
            />
          )}
        </button>
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-20 lg:px-24">
        {/* Hero banner — the one thing the app wants you to press today. */}
        {isEnabled('sessions.hero') && (
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
        )}

        {isEnabled('sessions.quickStart') && (
          <section className="mt-32">
            <SectionHeader title="Quick Start" />
            <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {QUICK_STARTS.map((card) => (
                <Link
                  key={card.id}
                  to="/chat"
                  // The card's own id, so the cockpit opens on this kind of
                  // session rather than on whatever was last in it. `fresh` is
                  // implied by `start` — the chat page clears before seeding —
                  // but stating both keeps the intent readable at the link.
                  state={{ start: card.id, fresh: true }}
                  className="u-press relative h-[160px] w-[160px] shrink-0 overflow-hidden rounded-16 p-12 text-text-inverse"
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

        {isEnabled('sessions.liveSessions') && (
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

        <section className="mt-32">
          <SectionHeader title="Recently Played" seeAllTo="/see-all/picked" />
          <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
            {recentlyPlayed.map((item) => (
              <RecentCard key={item.slug} {...item} />
            ))}
          </div>
        </section>

        {isEnabled('sessions.community') && (
          <section className="mt-32">
            <SectionHeader
              title="Recreate from Community"
              seeAllTo="/see-all/community"
              action="All Categories"
              onAction={() => setCategoriesOpen(true)}
            />
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
            <SessionShelf shelf="community" category={category} />
          </section>
        )}

        {isEnabled('sessions.creators') && (
          <section className="mt-32">
            <SectionHeader title="Trusted Creators" />
            <div className="-mx-20 mt-16 flex gap-20 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {/* Real people, counted rather than claimed. The shelf used to name
                  four, two of whom were in no session at all — so tapping them
                  could only ever go nowhere. */}
              {TRUSTED_CREATORS.map((creator) => (
                <Link
                  key={creator.slug}
                  to={`/profile/${creator.slug}`}
                  className="u-press flex w-[84px] shrink-0 flex-col items-center gap-8 text-center"
                >
                  <PhotoCircle
                    photo={creator.photo}
                    size={72}
                    gradient="conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))"
                    alt={creator.name}
                  />
                  <span className="min-w-0">
                    <span className="text-style-caption block truncate text-text-primary">{creator.name}</span>
                    <span className="text-style-caption block truncate text-text-secondary">
                      {creator.sessions.length === 1 ? '1 session' : `${creator.sessions.length} sessions`}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {isEnabled('sessions.challenge') && (
          <section className="mt-32">
            <SectionHeader title={CHALLENGES.length > 1 ? 'Monthly Challenges!' : 'Monthly Challenge!'} />
            {/* A shelf, because there is more than one now. Same idiom as every
                other row on this page: the card keeps the frame's 362 and the
                next one peeks, which is what says the row scrolls. */}
            <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
              {CHALLENGES.map((challenge) => (
                <div
                  key={challenge.slug}
                  className="relative flex aspect-[362/240] w-[362px] shrink-0 flex-col justify-end overflow-hidden rounded-24 p-16 text-text-inverse"
                >
                  <CoverImage photo={challenge.photo} gradient={challenge.gradient} width={760} height={520} />
                  {/* The whole card opens the challenge; Join sits above it. */}
                  <Link
                    to={`/challenge/${challenge.slug}`}
                    aria-label={`Open the ${challenge.title} challenge`}
                    className="absolute inset-0 z-10"
                  />
                  <Link
                    to={`/challenge/${challenge.slug}`}
                    className="text-style-label absolute right-16 top-16 z-20 flex h-32 items-center gap-6 whitespace-nowrap rounded-full bg-surface-default/90 px-12 text-text-primary"
                  >
                    Join
                    <ArrowRight size={13} />
                  </Link>

                  <p className="text-style-title relative">{challenge.title}</p>
                  <p className="text-style-body-small relative mt-4 opacity-90">{challenge.summary}</p>
                  <div className="relative mt-14 flex flex-wrap gap-8">
                    {challengeStats(challenge).map((stat) => {
                      const Icon = stat.icon
                      return (
                        <span
                          key={stat.label}
                          className="text-style-caption inline-flex h-28 items-center gap-6 whitespace-nowrap rounded-full bg-surface-default/20 px-12 backdrop-blur-sm"
                        >
                          <Icon size={12} />
                          {stat.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isEnabled('sessions.picked') && (
          <section className="mt-32">
            <SectionHeader title="Picked for You" seeAllTo="/see-all/picked" />
            <SessionShelf shelf="picked" />
          </section>
        )}

        {isEnabled('sessions.impact') && (
          <section className="mt-32">
            <SectionHeader title="Sessions with Biggest Impact" seeAllTo="/see-all/impact" />
            <SessionShelf shelf="impact" />
          </section>
        )}
      </div>

      {categoriesOpen && (
        <CategorySheet
          selected={category}
          onSelect={setCategory}
          onClose={() => setCategoriesOpen(false)}
        />
      )}
    </div>
  )
}
