import { ArrowLeft, Menu, Play, Settings, Share2, Shuffle } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import type { CoverKey } from '../lib/photos'
import { findPerson } from '../lib/people'
import { useDrawer } from '../layouts/DrawerContext'

interface SessionCard {
  title: string
  description: string
  plays: string
  recreated: string
  gradient: string
  photo: CoverKey
}

const cards: SessionCard[] = [
  {
    title: 'Dolphins frequency',
    photo: 'dolphins' as CoverKey,
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-blue-800), var(--color-blue-400))',
  },
  {
    title: 'Soft Reset',
    photo: 'calm' as CoverKey,
    description: 'This helped Adam feel more relaxed, with 91% less tension.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-amber-300), var(--color-red-200))',
  },
  {
    title: 'Deep Space',
    photo: 'mindDance' as CoverKey,
    description: 'This helped Adam quiet thoughts by 38% in less than a week.',
    plays: '12.1k',
    recreated: '980',
    gradient: 'linear-gradient(160deg, var(--color-neutral-950), var(--color-neutral-700))',
  },
  {
    title: 'Clear Skies',
    photo: 'mountains' as CoverKey,
    description: 'This helped Adam boost focus by 46% in less than a week.',
    plays: '9.8k',
    recreated: '640',
    gradient: 'linear-gradient(160deg, var(--color-blue-200), var(--color-neutral-100))',
  },
]

const stats = [
  { label: 'Posts', value: '6' },
  { label: 'Played', value: '18,513' },
  { label: 'Recreated', value: '1,528' },
]

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
  const shownCards: SessionCard[] = own
    ? cards
    : person.sessions.map((session) => ({
        title: session.title,
        photo: session.photo,
        description: session.description,
        plays: session.plays,
        recreated: session.recreated,
        gradient: session.gradient,
      }))

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

      <div className="mt-24 flex flex-col items-center gap-16">
        <PhotoCircle
          photo={person.photo}
          size={98}
          gradient="var(--color-background-elevated)"
          alt={person.name}
        />
        <div className="text-center">
          <p className="text-style-title text-text-strong">{person.name}</p>
          <p className="text-style-label">{own ? 'Dubai, UAE' : person.role}</p>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-3 divide-x divide-border-subtle py-16">
        {shownStats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-4">
            <p className="text-style-title text-text-strong">{stat.value}</p>
            <p className="text-style-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-2 gap-12">
        {shownCards.map((card) => (
          <article
            key={card.title}
            className="@container relative flex h-[230px] flex-col justify-between overflow-hidden rounded-16 p-12 text-text-inverse"
          >
            <CoverImage photo={card.photo} gradient={card.gradient} width={520} height={460} />
            <div className="relative flex items-center justify-between">
              <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-white/25 text-text-inverse backdrop-blur-sm">
                <Play size={14} fill="currentColor" />
              </span>
              <button
                type="button"
                aria-label={`Recreate ${card.title}`}
                className="flex h-32 shrink-0 items-center gap-4 rounded-full bg-surface-default/90 px-12 text-style-label text-text-primary"
              >
                <Shuffle size={14} className="shrink-0" />
                <span className="hidden @min-[124px]:inline">Recreate</span>
              </button>
            </div>
            {/* relative: the cover is absolutely positioned, so anything in normal
                flow paints behind it. The lines below only looked fine because
                opacity-90 promotes them; the title, with no opacity, was
                painted under the image and never showed. */}
            <div className="relative">
              <p className="text-style-body-small font-semibold">{card.title}</p>
              <p className="mt-4 text-style-caption line-clamp-2 opacity-90">{card.description}</p>
              <div className="text-style-caption mt-8 flex items-center gap-10 opacity-90">
                <span className="flex items-center gap-4">
                  <Play size={11} />
                  {card.plays}
                </span>
                <span aria-hidden="true" className="h-12 w-px bg-current opacity-50" />
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
