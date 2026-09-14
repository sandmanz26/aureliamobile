import { useState } from 'react'
import { Menu, Play, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import type { SessionRecord } from '../lib/sessions'
import { SESSIONS, totalMinutes } from '../lib/sessions'

/**
 * Figma 16523:14684 — a published session as one line: the artwork you press,
 * who made it and how long, and what it moved.
 *
 * The pill carries the session's own headline outcome rather than a bare
 * percentage, and the arrow follows its sign — a fall in stress and a rise in
 * focus are both good news and would otherwise point the same way.
 */
function SessionRow({ session }: { session: SessionRecord }) {
  const outcome = session.outcome[0]
  const down = outcome?.value.trim().startsWith('−') || outcome?.value.trim().startsWith('-')

  return (
    <article className="flex items-center gap-16 rounded-24 bg-surface-default p-16 shadow-sm">
      <Link
        to={`/play/${session.slug}`}
        state={{ origin: 'own' }}
        aria-label={`Play ${session.title}`}
        className="u-press relative shrink-0"
      >
        <PhotoCircle photo={session.photo} size={56} gradient={session.gradient} alt="" />
        <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
          <Play size={16} fill="currentColor" />
        </span>
      </Link>

      <Link to={`/session/${session.slug}`} className="min-w-0 flex-1">
        <p className="text-style-body-large truncate text-text-primary">{session.title}</p>
        <p className="text-style-body-small mt-2 flex items-center gap-8 text-text-secondary">
          <span className="truncate">{session.author}</span>
          <span aria-hidden="true" className="h-12 w-px shrink-0 bg-border-default" />
          <span className="shrink-0">{totalMinutes(session)} min</span>
        </p>
      </Link>

      {outcome && (
        <span
          title={outcome.label}
          className="text-style-body-small flex shrink-0 items-center gap-4 rounded-full bg-[#ecfbed] px-10 py-6 text-text-primary"
        >
          {down ? (
            <TrendingDown size={14} className="text-success-600" />
          ) : (
            <TrendingUp size={14} className="text-success-600" />
          )}
          {outcome.value}
        </span>
      )}
    </article>
  )
}

/**
 * Figma 16523:14684 — Sessions.
 *
 * Its own screen, not the browse surface. The drawer lists Explore and
 * Sessions separately and the two frames are different: Explore is the shelves
 * worth wandering, Sessions is the plain list of what there is to play. There
 * is no Chat entry anywhere in the design — the cockpit is reached by "New
 * session" from here, which is why it is not a destination of its own.
 */
export function SessionsPage() {
  const { openDrawer } = useDrawer()
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const shown = scope === 'mine' ? SESSIONS.filter((s) => s.author === CURRENT_USER) : SESSIONS

  return (
    <div className="pb-48">
      <div className="mx-auto max-w-[720px] px-20 py-16 lg:px-24 lg:py-24">
        <header className="flex items-center justify-between gap-12">
          <div className="flex min-w-0 items-center gap-12">
            <button
              type="button"
              aria-label="Open menu"
              onClick={openDrawer}
              className="flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-style-title-large truncate text-text-primary">Sessions</h1>
          </div>
          <CoinPill points="1,323" className="shadow-sm" />
        </header>

        <div className="mt-24 flex gap-12">
          {([
            ['all', 'All'],
            ['mine', 'Created by you'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              aria-pressed={scope === value}
              className={`text-style-body h-44 rounded-full px-20 transition-colors ${
                scope === value
                  // #3C2405, the frame's chip — icon-strong is pure black and
                  // reads as a different ink beside the brown type.
                  ? 'bg-text-primary text-text-inverse'
                  : 'border border-border-default bg-surface-default text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-16">
          {shown.map((session) => (
            <SessionRow key={session.slug} session={session} />
          ))}
          {shown.length === 0 && (
            <p className="text-style-body-small py-40 text-center text-text-secondary">
              Nothing published yet — a session you make in the cockpit lands here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
