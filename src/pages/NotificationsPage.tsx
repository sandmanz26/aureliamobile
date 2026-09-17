import { ArrowLeft, Sparkles, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chip } from '../components/ui/Chip'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import type { NotificationBucket, NotificationRecord } from '../lib/notifications'
import { BUCKET_TITLES, FILTER_BUCKETS, NOTIFICATIONS, NOTIFICATION_FILTERS } from '../lib/notifications'

/**
 * The activity feed — Figma "Notifications" (16659:42262).
 *
 * Grouped by age rather than listed flat, because "1s" and "3d" mean different
 * things and a reader scanning for what is new should not have to read the
 * timestamps to find the boundary. The chips narrow the same grouping rather
 * than replacing it, so the shape of the screen never changes under you.
 *
 * Three things here had drifted far enough from the frame to be the wrong
 * screen rather than an imprecise one:
 *
 * - **Every row carried a second 40 circle** on the right — the session's cover
 *   with a play badge. The frame has one circle per row, on the left. Two
 *   discs per row turned a list you scan into a list you read.
 * - **The faces wore a conic gradient ring.** The frame's are plain photographs;
 *   the ring is the cockpit's treatment for a session, not a person.
 * - **Only one of the frame's three row types existed.** The account notice and
 *   the community notice had no data model to render from.
 */

/** The 40 disc at the head of a row. Which one depends on who is speaking. */
function RowMark({ item }: { item: NotificationRecord }) {
  if (item.kind === 'account') {
    // #FFF1DB has no variable in the Figma file — see DESIGN-SYSTEM-HISTORY.md.
    return (
      <span
        className="flex size-40 shrink-0 items-center justify-center rounded-full"
        style={{ background: '#FFF1DB' }}
      >
        <Sparkles size={18} className="text-[#FF881B]" fill="currentColor" />
      </span>
    )
  }
  if (item.kind === 'challenge') {
    return (
      <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-interactive-primary">
        <Trophy size={18} className="text-icon-inverse" />
      </span>
    )
  }
  // No conic ring: the frame's faces are plain photographs. The gradient is
  // still required — it is the floor the photo layers over, and what shows if
  // Unsplash is unreachable — so it is a neutral one rather than the brand
  // ring, which means "session" elsewhere in the product.
  return (
    <PhotoCircle
      photo={item.actorPhoto!}
      size={40}
      gradient="linear-gradient(160deg, var(--color-neutral-300), var(--color-neutral-400))"
      alt={item.actor}
    />
  )
}

/** The sentence and its age. The age is the last word of the row, not a column. */
function RowText({ item }: { item: NotificationRecord }) {
  return (
    <p className="text-style-body-small min-w-0 flex-1 text-text-primary">
      {item.actor && <span className="font-semibold">{item.actor} </span>}
      <span className="font-light">{item.action}</span>
      {/* Set apart by a space, not right-aligned: in the frame it follows the
          sentence and wraps with it rather than holding its own column. */}
      <span className="ml-8 whitespace-nowrap font-light text-text-secondary">{item.age}</span>
    </p>
  )
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | NotificationBucket>('all')

  const buckets = FILTER_BUCKETS[filter]
  const groups = buckets
    .map((bucket) => ({ bucket, items: NOTIFICATIONS.filter((item) => item.bucket === bucket) }))
    .filter((group) => group.items.length > 0)

  return (
    /* White, not background-default. The frame's body is surface/default and
       the rows sit directly on it — there is no card and no tint. */
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-surface-default lg:min-h-screen">
      {/* `.u-sticky-top` paints background-default and sits outside Tailwind's
          utility layer, so it beats bg-surface-default on class order alone —
          the `!` is what actually makes this header white. The frame's is
          surface/default, same as the body it scrolls over. */}
      <header className="u-sticky-top flex items-center gap-12 bg-surface-default! px-20 py-16 lg:px-24">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-style-title-large-regular flex-1 truncate text-text-primary">Notifications</h1>
        <CoinPill points="1,323" className="shadow-sm" />
      </header>

      {/* Full-bleed so the last chip runs off the edge as it does in the frame,
          which is what says the row scrolls. */}
      <div className="flex gap-8 overflow-x-auto px-20 pb-4 lg:px-24">
        {NOTIFICATION_FILTERS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            active={option.id === filter}
            onClick={() => setFilter(option.id)}
          />
        ))}
      </div>

      <div className="w-full px-20 pb-40 lg:mx-auto lg:max-w-[720px] lg:px-24">
        {groups.map((group) => (
          /* 24 above a heading, 16 under it, 12 between rows — the frame's
             rhythm is one group reading as a block, not evenly spaced rows. */
          <section key={group.bucket} className="mt-24">
            <h2 className="text-style-body-small text-text-secondary">{BUCKET_TITLES[group.bucket]}</h2>
            <div className="mt-16 flex flex-col gap-12">
              {group.items.map((item) => {
                const row = (
                  <>
                    <RowMark item={item} />
                    <RowText item={item} />
                  </>
                )
                // A notice about your account or the challenge has no session
                // behind it, so it is not a link pretending to be one.
                return item.sessionSlug ? (
                  <Link
                    key={item.id}
                    to={`/session/${item.sessionSlug}`}
                    className="u-press flex items-center gap-12 rounded-12"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={item.id} className="flex items-center gap-12">
                    {row}
                  </div>
                )
              })}
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
