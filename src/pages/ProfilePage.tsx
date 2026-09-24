import { useState } from 'react'
import { ArrowLeft, Menu, Music2, Play, Settings, Share2, Shuffle } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import type { CoverKey } from '../lib/photos'
import { findPerson } from '../lib/people'
import type { SessionRecord } from '../lib/sessions'
import { isRecreated, totalMinutes } from '../lib/sessions'
import { useDrawer } from '../layouts/DrawerContext'

type ProfileTab = 'sessions' | 'recreated'

interface SessionCard {
  /** The session behind it. Both controls on the card need one. */
  slug: string
  title: string
  description: string
  author: string
  minutes: number
  plays: string
  recreated: string
  gradient: string
  photo: CoverKey
}

/**
 * The figures the design carries for the signed-in profile.
 *
 * Kept rather than summed, because summing the catalogue gives a different and
 * less useful number: one session alone has 124k plays. "6 Posts" is the one
 * that does reconcile — four published sessions plus the two drafts, which is
 * everything Adam has made.
 */
const stats = [
  { label: 'Posts', value: '6' },
  { label: 'Played', value: '18,513' },
  { label: 'Recreated', value: '1,528' },
]

/** A catalogue session, as this screen's card wants it. */
function toCard(session: SessionRecord): SessionCard {
  return {
    slug: session.slug,
    title: session.title,
    photo: session.photo,
    description: session.description,
    author: session.author,
    minutes: totalMinutes(session),
    plays: session.plays,
    recreated: session.recreated,
    gradient: session.gradient,
  }
}

/**
 * One page for two readings of the same screen. /profile is the signed-in
 * user's; /profile/:person is somebody else's, reached by tapping a creator
 * anywhere their name appears — the player sheet, a session's byline.
 *
 * What changes between them is only the chrome around the same content: your
 * own profile opens the drawer and offers your coin balance, a stranger's
 * offers a way back and a way to follow. The published work below is theirs in
 * both cases, which is the point of the screen.
 */
export function ProfilePage() {
  const { openDrawer } = useDrawer()
  const { person: personSlugParam } = useParams()
  const navigate = useNavigate()
  const person = findPerson(personSlugParam)
  // Sessions is everything this person made; Recreated is the subset of
  // those that are themselves a fork of someone else's — the same
  // `lineage.length > 2` test the session row's own marker uses, so the tab
  // never disagrees with what a card already says about itself.
  const [tab, setTab] = useState<ProfileTab>('sessions')

  if (!person) return <Navigate to="/profile" replace />
  const own = person.isSelf

  // The signed-in profile keeps its designed figures and shelf. Anyone else's
  // is assembled from what they have actually published — showing Adam's work
  // under a stranger's name is worse than showing them three sessions.
  const shownStats = own
    ? stats
    : [
        { label: person.sessions.length === 1 ? 'Post' : 'Posts', value: String(person.sessions.length) },
        { label: 'Played', value: person.sessions[0]?.plays ?? '—' },
        { label: 'Recreated', value: person.sessions[0]?.recreated ?? '—' },
      ]
  // Both branches read the catalogue now. The signed-in profile used to draw a
  // hardcoded shelf of four, three of whose titles matched no session — which
  // is why neither control on a card could go anywhere.
  const tabSessions = tab === 'sessions' ? person.sessions : person.sessions.filter(isRecreated)
  const shownCards: SessionCard[] = tabSessions.map(toCard)

  /**
   * Straight into the cockpit with the session already attached, rather than
   * via /recreate.
   *
   * That screen is where you state changes against an original; from a profile
   * card there are none to state yet, so it would be a form to skip. The brief
   * is the same shape either way, and an empty `changes` is what the cockpit
   * reads as "keep it as it is" — so the thread opens on the fork, and the
   * first thing you say is the first change.
   */
  function recreate(card: SessionCard) {
    navigate('/chat', {
      state: {
        recreate: {
          slug: card.slug,
          title: card.title,
          author: card.author,
          minutes: card.minutes,
          changes: [],
        },
      },
    })
  }

  return (
    <div className="mx-auto max-w-[720px] px-20 py-16 lg:px-24 lg:py-24">
      <header className="u-sticky-top flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-12">
          {own ? (
            <button
              type="button"
              aria-label="Open menu"
              onClick={openDrawer}
              className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm lg:hidden"
            >
              <Menu size={24} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="flex size-44 shrink-0 items-center justify-center rounded-full text-icon-default"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-style-title-large truncate text-text-primary">
            {own ? 'Profile' : person.name}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-12">
          {own ? (
            <CoinPill points="1,323" className="shadow-sm" />
          ) : (
            <button
              type="button"
              className="text-style-label h-44 rounded-full border border-border-default px-16 text-text-primary"
            >
              Follow
            </button>
          )}
          <button
            type="button"
            aria-label={own ? 'Share profile' : `Share ${person.name}`}
            className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
          >
            <Share2 size={18} />
          </button>
          {/* Only on your own profile: there is nothing of a stranger's to
              configure. */}
          {own && (
            <Link
              to="/settings"
              aria-label="Settings"
              className="u-press flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
            >
              <Settings size={18} />
            </Link>
          )}
        </div>
      </header>

      <div className="mt-24 flex items-center gap-16">
        <PhotoCircle
          photo={person.photo}
          size={72}
          gradient="var(--color-background-elevated)"
          alt={person.name}
        />
        <div>
          <p className="text-style-title text-text-strong">{person.name}</p>
          <p className="text-style-label text-text-secondary">{own ? 'Dubai, UAE' : person.role}</p>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-3 py-16">
        {shownStats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-4">
            <p className="text-style-title text-text-strong">{stat.value}</p>
            <p className="text-style-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions is everything published; Recreated narrows that to the
          forks among them. Two readings of the same shelf, not two shelves —
          switching tabs never refetches anything. */}
      <div className="flex border-b border-border-subtle">
        {(
          [
            { id: 'sessions', label: 'Sessions', icon: Music2 },
            { id: 'recreated', label: 'Recreated', icon: Shuffle },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id}
            className={`u-press flex flex-1 items-center justify-center gap-6 border-b-2 py-12 text-style-label ${
              tab === id
                ? 'border-text-primary font-medium text-text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-12">
        {shownCards.map((card) => (
          <article
            key={card.slug}
            className="@container flex flex-col overflow-hidden rounded-16 border border-border-subtle bg-surface-default"
          >
            <div className="relative aspect-[164/120] w-full shrink-0">
              <CoverImage photo={card.photo} gradient={card.gradient} width={420} height={300} />
              {/* relative: the cover is absolutely positioned, so anything meant
                  to sit on top of it needs to be lifted out of normal flow's
                  way explicitly. */}
              <div className="relative flex items-center justify-between p-10">
                <Link
                  to={`/play/${card.slug}`}
                  state={{ origin: own ? 'own' : 'community' }}
                  aria-label={`Play ${card.title}`}
                  className="u-press flex size-32 shrink-0 items-center justify-center rounded-full bg-white/25 text-text-inverse backdrop-blur-sm"
                >
                  <Play size={14} fill="currentColor" />
                </Link>
                <button
                  type="button"
                  aria-label={`Recreate ${card.title}`}
                  onClick={() => recreate(card)}
                  className="u-press flex h-32 shrink-0 items-center gap-4 rounded-full bg-surface-default/90 px-12 text-style-label text-text-primary"
                >
                  <Shuffle size={14} className="shrink-0" />
                  <span className="hidden @min-[124px]:inline">Recreate</span>
                </button>
              </div>
            </div>
            <div className="p-12">
              <p className="text-style-body-small font-semibold text-text-primary">{card.title}</p>
              <p className="mt-4 text-style-caption line-clamp-2 text-text-secondary">{card.description}</p>
              <div className="text-style-caption mt-8 flex items-center gap-10 text-text-secondary">
                <span className="flex items-center gap-4">
                  <Play size={11} />
                  {card.plays}
                </span>
                <span aria-hidden="true" className="h-12 w-px bg-border-subtle" />
                <span className="flex items-center gap-4">
                  <Shuffle size={11} />
                  {card.recreated}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
