import { Menu, MoreHorizontal, Play, Send, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoinPill } from '../ui/CoinPill'

interface ChatHeaderProps {
  points: string
  onMenu: () => void
  onPublish: () => void
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
}

// Figma "Top Header" — 44px circular surface buttons either side of a
// 96x44 points pill. The trailing "more" button opens the dropdown
// (Figma node "dropdown", 140x175).
export function ChatHeader({
  points,
  onMenu,
  onPublish,
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
                { label: 'Insights', icon: TrendingUp, run: onInsights },
                { label: 'Settings', icon: SlidersHorizontal, run: onSettings },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      item.run?.()
                    }}
                    className="text-style-body u-press flex w-full items-center gap-12 rounded-12 px-8 py-10 text-left text-text-primary hover:bg-background-elevated"
                  >
                    <Icon size={19} className="shrink-0 text-icon-strong" />
                    {item.label}
                  </button>
                )
              })}

              {/* Publish is the one thing here that changes the world, so it is
                  the button and not a third row of the list. */}
              {canPublish && (
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
                  Publish
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
