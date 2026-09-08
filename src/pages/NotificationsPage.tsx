import { ArrowLeft, Coins, Play } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chip } from '../components/ui/Chip'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import type { NotificationBucket } from '../lib/notifications'
import { BUCKET_TITLES, FILTER_BUCKETS, NOTIFICATIONS, NOTIFICATION_FILTERS } from '../lib/notifications'

const AVATAR_RING = 'conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))'

/**
 * The activity feed — who is doing what with your sessions.
 *
 * Grouped by age rather than listed flat, because "1s" and "3d" mean different
 * things and a reader scanning for what is new should not have to read the
 * timestamps to find the boundary. The chips narrow the same grouping rather
 * than replacing it, so the shape of the screen never changes under you.
 */
export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | NotificationBucket>('all')

  const buckets = FILTER_BUCKETS[filter]
  const groups = buckets
    .map((bucket) => ({ bucket, items: NOTIFICATIONS.filter((item) => item.bucket === bucket) }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      <header className="flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="u-press flex size-40 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-style-title-large flex-1 truncate text-text-primary">Notifications</h1>
        <div className="flex h-40 shrink-0 items-center gap-8 rounded-full bg-surface-default px-14 shadow-sm">
          <span
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            <Coins size={10} className="text-text-inverse" />
          </span>
          <span className="text-style-label">1,323</span>
        </div>
      </header>

      <div className="-mx-0 flex gap-8 overflow-x-auto px-20 pb-8 lg:px-24">
        {NOTIFICATION_FILTERS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            active={option.id === filter}
            onClick={() => setFilter(option.id)}
          />
        ))}
      </div>

      <div className="mx-auto w-full max-w-[402px] px-20 pb-40 lg:max-w-[720px] lg:px-24">
        {groups.map((group) => (
          <section key={group.bucket} className="mt-16">
            <h2 className="text-style-body-small text-text-secondary">{BUCKET_TITLES[group.bucket]}</h2>
            <div className="mt-8 flex flex-col">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/session/${item.sessionSlug}`}
                  className="u-press flex items-center gap-12 rounded-16 py-10 hover:bg-background-elevated"
                >
                  <PhotoCircle photo={item.actorPhoto} size={40} gradient={AVATAR_RING} alt={item.actor} />
                  <p className="text-style-body-small min-w-0 flex-1 text-text-secondary">
                    <span className="font-semibold text-text-primary">{item.actor}</span> {item.action}
                    {/* The age sits apart from the sentence — it is a stamp on
                        the row, not the last word of it. */}
                    <span className="ml-8 whitespace-nowrap">{item.age}</span>
                  </p>
                  <span className="relative flex size-40 shrink-0 items-center justify-center">
                    <PhotoCircle
                      photo={item.sessionPhoto}
                      size={40}
                      gradient="linear-gradient(160deg, var(--color-info-900), var(--color-neutral-950))"
                    />
                    <span className="absolute flex size-18 items-center justify-center rounded-full bg-black/45 text-text-inverse backdrop-blur-sm">
                      <Play size={9} fill="currentColor" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 && (
          <p className="text-style-body-small mt-40 text-center text-text-secondary">
            Nothing here for that stretch of time.
          </p>
        )}
      </div>
    </div>
  )
}
