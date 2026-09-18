import { useState } from 'react'
import { ArrowDown, ArrowUp, Menu, Pencil, Plus, Play, Shuffle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../components/ui/CoinPill'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useSignInGate } from '../auth/useSignInGate'
import { useDrawer } from '../layouts/DrawerContext'
import { CURRENT_USER } from '../lib/people'
import type { SessionRecord } from '../lib/sessions'
import { PUBLISHED_SESSIONS, SESSIONS, durationLabel, isPublished, isRecreated } from '../lib/sessions'

/** The card shadow every surface in this design shares (Figma effect 16520:822). */
const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'

/**
 * Author and run time, at the frame's 10/14 on `text/secondary`.
 *
 * "Published" used to live here as a third item on the line. The frame gives
 * it a pill of its own on the card's second row, so it moved there — a state
 * badge and a byline are not the same kind of fact and should not read as one
 * run-on sentence.
 */
function MetaLine({ session }: { session: SessionRecord }) {
  const divider = <span aria-hidden="true" className="mx-6 h-10 w-px shrink-0 bg-black/20" />

  return (
    <p className="flex h-12 items-center text-[10px] leading-[14px] text-text-secondary">
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
    </p>
  )
}

/** The frame's two pills: radius 40, 8 across and 4 down, 4 between. */
function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`flex shrink-0 items-center gap-4 rounded-full px-8 py-4 text-[12px] leading-[16px] text-black ${className}`}>
      {children}
    </span>
  )
}

/**
 * Figma "Session Item" (16662:42619, on frame 16662:42395) — 362x108, radius
 * 20, 16 across and 18 down, 16 between its two rows.
 *
 * This replaces the 68-tall single line (16523:14716) the page carried before.
 * The redesign is not a resize: the card gained a second row and two controls,
 * and that changes what the screen is *for*. It was a list of sessions to
 * play; it is now a list of sessions you own and manage — hence edit and
 * delete on the row, and a state badge that says whether the world can see it.
 *
 * **Three tap targets.** The disc plays, the text opens that session's
 * conversation, and the two icons act on the session itself. They are
 * separated because a 362-wide row with one destination wastes the row.
 */
function SessionRow({ session, onDelete }: { session: SessionRecord; onDelete: (slug: string) => void }) {
  const outcome = session.outcome[0]
  const down = outcome?.value.trim().startsWith('−') || outcome?.value.trim().startsWith('-')
  const published = isPublished(session)

  return (
    <article className={`flex flex-col gap-16 overflow-hidden rounded-[20px] bg-surface-default px-16 py-18 ${CARD_SHADOW}`}>
      {/* Row 1 — who and what, then what you can do to it. */}
      <div className="flex items-center gap-12">
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

        {/* Its own conversation, not the cockpit in general: this session
            exists, so opening it lands in the thread that made it. */}
        {/* The text block is held at 32, not left to its content — that is the
            frame's own trick and it is what makes the card 108 rather than 114.
            The title's box is 16 with 20 of leading and the meta's is 12 with
            14, so each line overflows its box by a pixel or two exactly as
            Figma draws it. Sizing to content adds 6 and nothing looks wrong,
            which is why it went unnoticed. */}
        <Link to={`/chat/${session.slug}`} className="flex h-32 min-w-0 flex-1 flex-col gap-4">
          <p className="h-16 truncate text-[14px] leading-[20px] text-text-primary">{session.title}</p>
          <MetaLine session={session} />
        </Link>

        <div className="flex shrink-0 items-center gap-12">
          <Link
            to="/session-settings"
            state={{ slug: session.slug }}
            aria-label={`Edit ${session.title}`}
            className="u-press u-tap text-icon-secondary"
          >
            <Pencil size={16} />
          </Link>
          {/* Nothing here is persisted, so this really does remove the row and
              really does come back on reload. The confirm is not ceremony: on
              a list of your own work, an accidental tap on a 16px glyph next
              to a link is exactly the mistake worth one question. */}
          <button
            type="button"
            aria-label={`Delete ${session.title}`}
            onClick={() => {
              if (confirm(`Delete “${session.title}”? This cannot be undone.`)) onDelete(session.slug)
            }}
            className="u-press u-tap text-icon-secondary"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Row 2 — the two facts about the session rather than about its author. */}
      <div className="flex items-center gap-12">
        <div className="flex min-w-0 flex-1">
          {outcome && (
            /* #ECFBED has no variable in the Figma file — see
               DESIGN-SYSTEM-HISTORY.md. The figure is black in the frame, not
               the ink token. */
            <Pill className="bg-[#ECFBED]">
              {down ? (
                <ArrowDown size={14} className="text-success-600" />
              ) : (
                <ArrowUp size={14} className="text-success-600" />
              )}
              <span title={outcome.label}>{outcome.value}</span>
            </Pill>
          )}
        </div>
        {/* #FFF1DB is the same tokenless pale gold as the Notifications sparkle
            badge. Unpublished falls back to the neutral surface. */}
        <Pill className={published ? 'bg-[#FFF1DB]' : 'bg-background-elevated'}>
          {published ? 'Published' : 'Not Published'}
        </Pill>
      </div>
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
  const gate = useSignInGate()
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  // Deleted in this browser only. The catalogue is a module constant, so a
  // reload brings them back — the same contract as every other thing this demo
  // remembers, and better than a delete that visibly does nothing.
  const [deleted, setDeleted] = useState<string[]>([])
  // "All" is the catalogue as everyone else sees it; a draft belongs to you
  // and shows only where it is yours. That is what makes the filter worth a
  // tap rather than a narrowing of the same list.
  const shown = (
    scope === 'mine'
      ? SESSIONS.filter((s) => s.author === CURRENT_USER)
      : PUBLISHED_SESSIONS
  ).filter((s) => !deleted.includes(s.slug))

  return (
    <div className="pb-40">
      <div className="mx-auto max-w-[720px]">
        {/* Header: 68 tall on a 20px gutter, 12 top and bottom, 20 between the
            menu and the title. */}
        <header className="u-sticky-top flex h-68 items-center gap-16 px-20">
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
            <h1 className="truncate text-[24px] font-normal! leading-[30px] text-text-primary">
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
              <SessionRow
                key={session.slug}
                session={session}
                onDelete={(slug) => setDeleted((list) => [...list, slug])}
              />
            ))}
            {shown.length === 0 && (
              <p className="text-style-body-small py-40 text-center text-text-secondary">
                Nothing published yet — a session you make in the cockpit lands here.
              </p>
            )}
          </div>
        </div>

        {/* Figma "Footer" (16662:42547) — pinned to the bottom of the frame, so
            New Session is reachable without scrolling past the list.

            Sticky rather than fixed: `.u-page` animates with a transform, and a
            transformed ancestor becomes the containing block for
            `position: fixed`, which would pin this to the page box instead of
            the viewport. Sticky needs no portal and behaves on a long list. */}
        <div className="sticky bottom-0 z-20 px-20 py-12">
          <button
            type="button"
            onClick={() => gate('/chat', { fresh: true })}
            className="u-press flex h-52 w-full items-center justify-center gap-8 rounded-[40px] bg-interactive-primary text-[16px] leading-[19px] text-text-inverse shadow-[0_8px_34px_4px_rgba(0,0,0,0.15)]"
          >
            <Plus size={20} />
            New Session
          </button>
        </div>
      </div>
    </div>
  )
}
