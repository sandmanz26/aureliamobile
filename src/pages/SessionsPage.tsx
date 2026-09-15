import { useState } from 'react'
import { ArrowDown, ArrowUp, Menu, Play, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import type { SessionRecord } from '../lib/sessions'
import { SESSIONS, durationLabel, isRecreated } from '../lib/sessions'

/** The card shadow every surface in this design shares (Figma effect 16520:822). */
const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'

/** Author, run time and the two markers, at the frame's 10/12 in #525252. */
function MetaLine({ session }: { session: SessionRecord }) {
  // Published is shown on your own work only, and that is a judgement call
  // rather than something the frame says. The label exists to separate a
  // session you have put out from one still sitting in the cockpit — a
  // distinction that only has two sides for the person who made it. On a
  // stranger's row it would be a badge every row wears, which says nothing and
  // costs the author its width on a 10px line.
  const mine = session.author === CURRENT_USER
  const divider = (
    <span aria-hidden="true" className="mx-8 h-10 w-px shrink-0 bg-black/20" />
  )

  return (
    <p className="flex items-center text-[10px] leading-[12px] text-[#525252]">
      {/* Clone-and-modify, said in one glyph. The same mark the app uses for
          Recreate everywhere else, so it needs no legend. */}
      {isRecreated(session) && (
        <Shuffle
          size={12}
          className="mr-4 shrink-0"
          aria-label={`Recreated from ${session.lineage[1].author}`}
        />
      )}
      <span className="truncate">{session.author}</span>
      {divider}
      <span className="shrink-0">{durationLabel(session)}</span>
      {/* A draft says nothing rather than saying "Draft" — the absence is the
          state. Nothing can be a draft yet; the flag is the seam for when the
          cockpit can save one. */}
      {mine && session.published !== false && (
        <>
          {divider}
          <span className="shrink-0">Published</span>
        </>
      )}
    </p>
  )
}

/**
 * Figma "Frame 10" (16523:14716) — a session as one line, read off the node
 * rather than the render: 362x68, radius 20, 16 left and right, 18 top and
 * bottom, 12 between blocks.
 *
 * The height is held rather than left to the content. Our body/label tokens
 * carry 24 and 16 of line-height where the frame's text block is 32 tall in
 * total, so letting the rows size themselves is what made them 88.
 *
 * **Two tap targets, not one.** The play disc opens the player; the rest of
 * the row opens that session's conversation, which is what the frame's own
 * prototype does — its transition lands on 16523:8166, a cockpit thread.
 */
function SessionRow({ session }: { session: SessionRecord }) {
  const outcome = session.outcome[0]
  const down = outcome?.value.trim().startsWith('−') || outcome?.value.trim().startsWith('-')

  return (
    <article className={`flex h-68 items-center gap-12 overflow-hidden rounded-[20px] bg-surface-default px-16 ${CARD_SHADOW}`}>
      {/* The frame puts the play affordance on the artwork: an 11px triangle
          in a 16px disc of white at a fifth over a blur. Not a bare glyph —
          the disc is what makes it read as a control on a photograph that
          could be any colour. */}
      <Link
        to={`/play/${session.slug}`}
        state={{ origin: 'community' }}
        aria-label={`Play ${session.title}`}
        className="u-press relative block size-32 shrink-0"
      >
        <PhotoCircle photo={session.photo} size={32} gradient={session.gradient} alt="" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-white/20 text-text-inverse backdrop-blur-[16px]">
            <Play size={11} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      </Link>

      <Link to="/chat" className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        <p className="truncate text-[14px] leading-[19px] text-text-primary">{session.title}</p>
        <MetaLine session={session} />
      </Link>

      {outcome && (
        <span
          title={outcome.label}
          /* The frame's own asymmetry: 9 before the arrow, 12 after the
             figure, and the number in black rather than the ink token. */
          className="flex h-25 shrink-0 items-center gap-4 rounded-full bg-[#ecfbed] py-3 pl-9 pr-12 text-[12px] leading-[19px] text-black"
        >
          {down ? (
            <ArrowDown size={14} className="text-success-600" />
          ) : (
            <ArrowUp size={14} className="text-success-600" />
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
  narrow = false,
}: {
  active: boolean
  label: string
  onClick: () => void
  /** The frame draws "All" at 8 of side padding and the wider chip at 12. */
  narrow?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-35 items-center rounded-full border text-[12px] leading-none transition-colors ${narrow ? 'px-8' : 'px-12'} ${CARD_SHADOW} ${
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
            {/* Regular in the frame, not semibold — font-normal! because
                .text-style-* sits outside Tailwind's utility layer. */}
            <h1 className="truncate text-[24px] font-normal! leading-[24px] text-text-primary">
              Sessions
            </h1>
          </div>
          <CoinPill points="1,323" className={CARD_SHADOW} />
        </header>

        {/* Body: 20 all round, 32 between the chips and the list. */}
        <div className="flex flex-col gap-32 p-20">
          <div className="flex gap-7">
            <ScopeChip active={scope === 'all'} label="All" narrow onClick={() => setScope('all')} />
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
