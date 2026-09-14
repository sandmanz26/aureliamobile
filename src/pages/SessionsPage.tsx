import { useState } from 'react'
import { Menu, Play, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import type { SessionRecord } from '../lib/sessions'
import { SESSIONS, totalMinutes } from '../lib/sessions'

/** The card shadow every surface in this design shares (Figma effect 16520:822). */
const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'

/**
 * Figma "Frame 10" (16523:14716) — a session as one line, at the frame's own
 * size: 362x68, radius 20, 16px sides and 18 top/bottom, a 32px round
 * thumbnail, 12px to the text and a 25px-tall figure on the end.
 *
 * The height is held rather than left to the content. Our body/label tokens
 * carry 24 and 16 of line-height where the frame's text block is 32 tall in
 * total, so letting the rows size themselves is what made them 88.
 */
function SessionRow({ session }: { session: SessionRecord }) {
  const outcome = session.outcome[0]
  const down = outcome?.value.trim().startsWith('−') || outcome?.value.trim().startsWith('-')

  return (
    <article className={`flex h-68 items-center gap-12 overflow-hidden rounded-[20px] bg-surface-default px-16 ${CARD_SHADOW}`}>
      <Link
        to={`/play/${session.slug}`}
        state={{ origin: 'community' }}
        aria-label={`Play ${session.title}`}
        className="u-press relative block size-32 shrink-0"
      >
        <PhotoCircle photo={session.photo} size={32} gradient={session.gradient} alt="" />
        <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
          <Play size={11} fill="currentColor" />
        </span>
      </Link>

      <Link to={`/session/${session.slug}`} className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <p className="truncate text-[16px] leading-[19px] text-text-primary">{session.title}</p>
        <p className="flex items-center gap-8 text-[12px] leading-[12px] text-text-secondary">
          <span className="truncate">{session.author}</span>
          <span aria-hidden="true" className="h-10 w-px shrink-0 bg-border-default" />
          <span className="shrink-0">{totalMinutes(session)} min</span>
        </p>
      </Link>

      {outcome && (
        <span
          title={outcome.label}
          className="flex h-25 shrink-0 items-center gap-4 rounded-full bg-[#ecfbed] px-8 text-[12px] leading-none text-text-primary"
        >
          {down ? (
            <TrendingDown size={12} className="text-success-600" />
          ) : (
            <TrendingUp size={12} className="text-success-600" />
          )}
          {outcome.value}
        </span>
      )}
    </article>
  )
}

/** The frame's chips: 35 tall, radius 40, 7 apart. */
function ScopeChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-35 items-center rounded-full border px-12 text-[12px] leading-none transition-colors ${CARD_SHADOW} ${
        active
          ? 'border-text-primary bg-text-primary text-text-inverse'
          : 'border-[#d6d6d6] bg-surface-default text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * Figma 16523:14684 — Sessions.
 *
 * Its own screen, not the browse surface: the drawer lists Explore and
 * Sessions separately and the two frames are different. There is no Chat
 * entry anywhere in the design — the cockpit is reached by "New session".
 */
export function SessionsPage() {
  const { openDrawer } = useDrawer()
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const shown = scope === 'mine' ? SESSIONS.filter((s) => s.author === CURRENT_USER) : SESSIONS

  return (
    <div className="pb-40">
      <div className="mx-auto max-w-[720px]">
        {/* Header: 68 tall on a 20px gutter, 12 top and bottom, 20 between the
            menu and the title. */}
        <header className="flex h-68 items-center gap-16 px-20">
          <div className="flex min-w-0 flex-1 items-center gap-20">
            <button
              type="button"
              aria-label="Open menu"
              onClick={openDrawer}
              className={`flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default ${CARD_SHADOW} lg:hidden`}
            >
              <Menu size={24} />
            </button>
            <h1 className="truncate text-[24px] leading-[24px] text-text-primary">Sessions</h1>
          </div>
          <CoinPill points="1,323" className={CARD_SHADOW} />
        </header>

        {/* Body: 20 all round, 32 between the chips and the list. */}
        <div className="flex flex-col gap-32 p-20">
          <div className="flex gap-7">
            <ScopeChip active={scope === 'all'} label="All" onClick={() => setScope('all')} />
            <ScopeChip
              active={scope === 'mine'}
              label="Created by you"
              onClick={() => setScope('mine')}
            />
          </div>

          <div className="flex flex-col gap-12">
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
    </div>
  )
}
