import { Bell, Compass, HelpCircle, ListMusic, MessageCircle, Plus, User, UserPlus, Waves } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useHiddenScrollbars } from '../hooks/useHiddenScrollbars'
import { useSignInGate } from '../auth/useSignInGate'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'
import type { CoverKey } from '../lib/photos'
import { Button } from '../components/ui/Button'
import { MobileStatusBar } from '../components/ui/MobileStatusBar'
import { NavItem } from '../components/ui/NavItem'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { DrawerContext } from './DrawerContext'

const recentSessions: { title: string; author: string; photo: CoverKey }[] = [
  { title: 'Sleep Meditation', author: 'Adam Nilson', photo: 'sleep' },
  { title: 'Morning Mindfulness', author: 'Adam Nilson', photo: 'morning' },
  { title: 'Stress relief techniques', author: 'Marcus Lee', photo: 'stress' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { isEnabled } = useFeatureFlags()
  const { signedIn } = useAuth()
  const gate = useSignInGate()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col gap-24 overflow-y-auto px-24 py-24">
      <div className="flex items-center justify-between">
        {/* The mark goes home, as a brand mark in app chrome is expected to.
            It closes the drawer on the way, so the destination is not left
            sitting behind the panel that took you there. Home is open to
            everyone, so this needs no gate. */}
        <Link to="/home" aria-label="Aurelia home" onClick={onNavigate} className="u-press">
          <AureliaLogo iconSize={30} />
        </Link>
        {isEnabled('notifications') && (
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              onNavigate?.()
              gate('/notifications')
            }}
            className="u-press relative text-icon-default"
          >
            <Bell size={22} />
            {/* Unread marker. A real build drives this from the feed. */}
            <span className="absolute -right-1 -top-1 size-8 rounded-full bg-feedback-error ring-2 ring-surface-default" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-4" onClick={onNavigate}>
        {/* Signed in, the account itself is the first item and wears the user's
            face; signed out, the same slot is the way in. */}
        {signedIn ? (
          <NavItem
            to="/profile"
            icon={
              <PhotoCircle
                photo="avatar"
                size={20}
                gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
              />
            }
            label="Profile"
            disabled={!isEnabled('profile')}
          />
        ) : (
          <NavItem to="/login" icon={<User size={20} />} label="Sign In" disabled={!isEnabled('auth')} />
        )}
        <NavItem to="/chat" icon={<MessageCircle size={20} />} label="Chat" disabled={!isEnabled('chat')} />
        <NavItem to="/explore" icon={<Compass size={20} />} label="Explore" disabled={!isEnabled('explore')} />
        <NavItem to="/sessions" icon={<ListMusic size={20} />} label="Sessions" disabled={!isEnabled('sessions')} />
        <NavItem to="/wellness" icon={<Waves size={20} />} label="My wellness" disabled={!isEnabled('wellness')} />
      </nav>

      {signedIn && (
      <div className="flex flex-col gap-12">
        <p className="text-style-body-small">Latest</p>
        <div className="flex flex-col gap-16">
          {recentSessions.map((session) => (
            <div key={session.title} className="flex items-center gap-12">
              <PhotoCircle
                photo={session.photo}
                size={40}
                gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
              />
              <div className="min-w-0">
                <p className="text-style-label truncate">{session.title}</p>
                <p className="text-style-caption truncate">{session.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <Button
        variant="primary"
        icon={<Plus size={18} />}
        onClick={() => {
          onNavigate?.()
          gate('/chat', { fresh: true })
        }}
        className="w-full"
        style={{ background: 'linear-gradient(90deg, #F0A032, #FFCC66)' }}
      >
        New session
      </Button>

      <div className="mt-auto flex flex-col gap-4 border-t border-border-subtle pt-16">
        {isEnabled('invite') && (
          <button
            type="button"
            onClick={() => gate('/invite')}
            className="text-style-body u-press -mx-12 flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
          >
            <UserPlus size={20} className="text-icon-default" />
            Invite a Friend
          </button>
        )}
        {isEnabled('help') && (
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              navigate('/help')
            }}
            className="text-style-body u-press -mx-12 flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
          >
            <HelpCircle size={20} className="text-icon-default" />
            Help
          </button>
        )}
      </div>
    </div>
  )
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // The drawer has no close button by design, so Escape has to be a real way
  // out — the backdrop alone is not one for a keyboard.
  useEffect(() => {
    if (!drawerOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])
  const location = useLocation()
  useHiddenScrollbars()

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className="flex min-h-full bg-background-default">
        {/* Desktop: persistent sidebar (lg and up) */}
        <aside className="hidden w-[313px] shrink-0 border-r border-border-subtle bg-surface-default lg:block">
          <SidebarContent />
        </aside>

        {/* Mobile: hamburger-triggered drawer, faithful to the Figma "Menu" screen */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="u-fade absolute inset-0 bg-icon-strong/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="u-drawer relative flex h-full w-[313px] max-w-[85vw] flex-col bg-surface-default shadow-xl">
              <MobileStatusBar />
              <div className="flex-1 overflow-hidden">
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Universal mobile-frame chrome — each page renders its own header row
              (with the menu button, via useDrawer()) right below this.

              Sticky, because a phone's real status bar never scrolls away. It
              stays in flow, so nothing shifts; it only detaches once the page
              moves under it. Translucent rather than solid: pages top out on
              different backgrounds (Home and Sessions each open on their own
              gradient), and a blur reads correctly over all of them where one
              fixed colour would band against most. */}
          <div className="sticky top-0 z-40 bg-background-default/80 backdrop-blur-md lg:hidden">
            <MobileStatusBar />
          </div>

          {/* Keyed on the path so the entrance replays on every navigation —
              without it React reuses the node and the animation runs once. */}
          <div key={location.pathname} className="u-page">
            <Outlet />
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
