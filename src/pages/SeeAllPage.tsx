import { ArrowLeft, Coins } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import type { Shelf } from '../lib/sessions'
import { sessionsOnShelf } from '../lib/sessions'

/**
 * The full contents of one shelf, as a two-column grid.
 *
 * The Sessions screen shows the first few of each shelf in a rail; this is the
 * rest. One page serves every shelf rather than one page per shelf, so a new
 * shelf gets its See All for free.
 */
const SHELF_TITLES: Record<Shelf, string> = {
  community: 'Recreate from Community',
  picked: 'Picked for You',
  impact: 'Sessions with Biggest Impact',
}

function isShelf(value: string | undefined): value is Shelf {
  return value === 'community' || value === 'picked' || value === 'impact'
}

export function SeeAllPage() {
  const { shelf } = useParams()
  const navigate = useNavigate()

  // An unknown shelf is a bad link, not an error state worth a screen.
  if (!isShelf(shelf)) return <Navigate to="/sessions" replace />

  const sessions = sessionsOnShelf(shelf)

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
        <h1 className="text-style-title-large flex-1 truncate text-text-primary">{SHELF_TITLES[shelf]}</h1>
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

      <div className="mx-auto w-full max-w-[402px] px-20 pb-40 lg:max-w-[900px] lg:px-24">
        {/* Cards deal in rather than all appearing at once — the delay is capped
            in motion.css so a long grid never leaves its last rows waiting. */}
        <div className="u-stagger grid grid-cols-2 gap-12 lg:grid-cols-4">
          {sessions.map((session) => (
            <SessionGridCard key={session.slug} session={session} />
          ))}
        </div>

        {sessions.length === 0 && (
          <p className="text-style-body-small mt-40 text-center text-text-secondary">
            Nothing on this shelf yet.
          </p>
        )}
      </div>
    </div>
  )
}
