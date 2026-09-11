import { Menu, MoreHorizontal, Play, Send, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatHeaderProps {
  points: string
  onMenu: () => void
  onPublish: () => void
  /** Publish is switched off in the /__demo console. */
  canPublish?: boolean
  /**
   * The redesigned menu — icons, and Publish as the action rather than a third
   * list row. Off by default with the Session settings module it leads to, so a
   * walkthrough given from this branch keeps the menu it was rehearsed with.
   */
  richMenu?: boolean
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
  richMenu = false,
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
        <button
          type="button"
          aria-label="Play session"
          className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-strong"
        >
          <Play size={20} />
        </button>

        <div className="flex h-44 items-center gap-8 rounded-[25px] bg-surface-default px-16">
          <span
            className="flex size-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            <span className="size-8 rounded-full border-2 border-text-inverse" />
          </span>
          <span className="text-style-body-small text-text-primary">{points}</span>
        </div>

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

          {open && !richMenu && (
            <div className="absolute right-0 top-[52px] z-20 w-140 overflow-hidden rounded-16 bg-surface-default py-8 shadow-lg">
              {(['Insights', 'Settings', 'Publish'] as const)
                .filter((item) => item !== 'Publish' || canPublish)
                .map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      if (item === 'Publish') onPublish()
                    }}
                    className="text-style-body-small block w-full px-16 py-12 text-left text-text-primary hover:bg-background-elevated"
                  >
                    {item}
                  </button>
                ))}
            </div>
          )}

          {open && richMenu && (
            <div className="absolute right-0 top-[52px] z-20 w-[186px] rounded-20 bg-surface-default p-12 shadow-lg">
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
