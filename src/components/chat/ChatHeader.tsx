import { Menu, MoreHorizontal, Play, Send, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../ui/CoinPill'

interface ChatHeaderProps {
  points: string
  onMenu: () => void
  onPublish: () => void
  /**
   * What the button should say, or null to leave it out.
   *
   * A session that is already out in the world with nothing changed since has
   * nothing to publish, and offering it anyway makes the one control here that
   * changes the world a no-op.
   */
  publishLabel?: 'Publish' | 'Republish' | null
  /** Publish is switched off in the /__demo console. */
  canPublish?: boolean
  /** A session with nothing in it has nothing to play, so the button goes. */
  canPlay?: boolean
  /** Where the header's play glyph goes. It was a button with no handler. */
  playTo?: string
  /** What the thing at [playTo] is really called, when a catalogue session is
   *  only standing in for it. */
  playAs?: { title: string; author: string }
  /**
   * Where Settings goes. Left out while the Session settings screen is still
   * switched off — the row stays, as it always has, and closes the menu.
   */
  onSettings?: () => void
  onInsights?: () => void
  /** Opens the list of cuts this thread has made. Left out when it has made
   *  none — a history of nothing is a row that does nothing. */
}

// Figma "Top Header" — 44px circular surface buttons either side of a
// 96x44 points pill. The trailing "more" button opens the dropdown
// (Figma node "dropdown", 140x175).
export function ChatHeader({
  points,
  onMenu,
  onPublish,
  publishLabel = 'Publish',
  canPublish = true,
  canPlay = true,
  playTo = '/play/dolphins-frequency',
  playAs,
  onSettings,
  onInsights,
}: ChatHeaderProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickAway(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [open])

  return (
    <header className="flex items-center justify-between px-20 py-12">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenu}
        className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-strong"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-8">
        {canPlay && (
          <Link
            to={playTo}
            state={{ origin: 'own', ...(playAs ? { as: playAs } : {}) }}
            aria-label="Play session"
            className="u-press flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-strong"
          >
            <Play size={20} />
          </Link>
        )}

        <CoinPill points={points} />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="More options"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-strong"
          >
            <MoreHorizontal size={20} />
          </button>

          {open && (
            <div className="absolute right-0 top-[52px] z-20 w-[186px] rounded-24 bg-surface-default p-12 shadow-lg">
              {[
                // No Version history row. The frame's Chapters tab is headed
                // "Version History" and lists the same cuts, so the menu was
                // offering a second door to one room — and the two lists did
                // not even agree, since the sheet held this thread's builds
                // while Chapters holds the catalogue's. Insights is the door.
                { label: 'Insights', icon: TrendingUp, run: onInsights },
                { label: 'Settings', icon: SlidersHorizontal, run: onSettings },
              ].map((item) => {
                const Icon = item.icon
                // A row with no handler used to render exactly like a live one:
                // it highlighted, it closed the menu, and it did nothing. That
                // is what an unbuilt feature looks like, and Insights was read
                // as unbuilt for precisely this reason — it only has a
                // destination once the session has been saved and has a slug.
                // Say so instead of failing silently.
                const ready = Boolean(item.run)
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={!ready}
                    title={ready ? undefined : 'Available once this session is saved'}
                    onClick={() => {
                      setOpen(false)
                      item.run?.()
                    }}
                    className="text-style-body u-press flex w-full items-center gap-12 rounded-12 px-8 py-10 text-left text-text-primary hover:bg-background-elevated disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Icon size={19} className="shrink-0 text-icon-strong" />
                    {item.label}
                  </button>
                )
              })}

              {/* Publish is the one thing here that changes the world, so it is
                  the button and not a third row of the list. */}
              {canPublish && publishLabel && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onPublish()
                  }}
                  className="text-style-body u-press mt-8 flex h-44 w-full items-center justify-center gap-8 rounded-full font-medium text-text-inverse"
                  style={{ background: 'linear-gradient(120deg, #1F5F86, #2E8BA8)' }}
                >
                  <Send size={17} />
                  {publishLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
