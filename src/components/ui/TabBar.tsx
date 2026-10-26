import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSignInGate } from '../../auth/useSignInGate'
import { useHasUnreadNotifications } from '../../lib/notificationsSeen'
import { ChartMediumIcon, NoteIcon, UserIcon } from './AureliaIcons'

/**
 * The four core features as four tabs (design v4, U051 — simplification D1).
 *
 * J038 found the main navigation hidden behind a hamburger: nine drawer items,
 * every move between the core features two taps, and nothing telling a new
 * user they exist. Eugene named four core features; these are they, one tap
 * apart and always in view below `lg` (the desktop sidebar carries the same
 * four). The cockpit and the player are full screen and have no bar.
 */

type TabId = 'create' | 'discover' | 'progress' | 'me'

const TABS: { id: TabId; to: string; label: string; icon: (active: boolean) => ReactNode; open?: boolean }[] = [
  { id: 'create', to: '/home', label: 'Create', open: true, icon: (a) => <Sparkles size={22} strokeWidth={a ? 2 : 1.5} /> },
  { id: 'discover', to: '/explore', label: 'Discover', icon: () => <NoteIcon size={24} /> },
  { id: 'progress', to: '/wellness', label: 'Progress', icon: () => <ChartMediumIcon size={24} /> },
  { id: 'me', to: '/profile', label: 'Me', icon: () => <UserIcon size={24} /> },
]

/** Which tab a screen belongs to — where it sits in the four, not only its own URL. */
function tabFor(pathname: string): TabId | null {
  if (pathname === '/home') return 'create'
  if (pathname === '/profile' || /^\/(sessions|settings|credits|upgrade|invite|notifications|help|session-settings)/.test(pathname)) return 'me'
  if (/^\/(wellness|progress)/.test(pathname)) return 'progress'
  if (/^\/(explore|see-all|challenge|session\/|recreate|profile\/)/.test(pathname)) return 'discover'
  return null
}

export function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const gate = useSignInGate()
  const unread = useHasUnreadNotifications()
  const active = tabFor(pathname)

  // Page-level bottom bars and the floating player move up above the bar
  // (versions.css, `data-tabbar`), the way they already do for the player.
  useEffect(() => {
    document.documentElement.setAttribute('data-tabbar', '')
    return () => document.documentElement.removeAttribute('data-tabbar')
  }, [])

  return (
    <>
      {/* Room at the end of the page so the bar never hides the last row. */}
      <div aria-hidden="true" className="h-72 lg:hidden" />
      {createPortal(
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-default/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <ul className="mx-auto grid h-64 max-w-[480px] grid-cols-4">
            {TABS.map((tab) => {
              const on = active === tab.id
              return (
                <li key={tab.id} className="flex">
                  <button
                    type="button"
                    aria-current={on ? 'page' : undefined}
                    onClick={() => (tab.open ? navigate(tab.to) : gate(tab.to))}
                    className={`u-press relative flex flex-1 flex-col items-center justify-center gap-4 text-[11px] leading-[14px] ${
                      on ? 'font-medium text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    <span className={on ? 'text-[#FF881B]' : 'text-icon-default'}>{tab.icon(on)}</span>
                    {tab.label}
                    {tab.id === 'me' && unread && (
                      <span aria-label="Unread notifications" className="absolute right-[calc(50%-16px)] top-10 size-8 rounded-full bg-[#E5484D]" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>,
        document.body,
      )}
    </>
  )
}
