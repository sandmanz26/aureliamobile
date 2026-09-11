import { Bell, Compass, HelpCircle, ListMusic, LogIn, LogOut, MessageCircle, Plus, User, UserPlus, Waves, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  const { signedIn, signOut } = useAuth()
  const gate = useSignInGate()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col gap-24 overflow-y-auto px-24 py-24">
      <div className="flex items-center justify-between">
        <AureliaLogo iconSize={30} />
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
        <p className="text-style-body-small px-12">Latest</p>
        <div className="flex flex-col gap-16">
          {recentSessions.map((session) => (
            <div key={session.title} className="flex items-center gap-12 px-12">
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
        onClick={() => gate('/chat')}
        className="w-full"
        style={{ background: 'linear-gradient(90deg, var(--color-gold-600), var(--color-gold-300))' }}
      >
        New session
      </Button>

      <div className="mt-auto flex flex-col gap-4 border-t border-border-subtle pt-16">
        {signedIn ? (
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate('/home')
            }}
            className="text-style-body flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
          >
            <LogOut size={20} className="text-icon-default" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-style-body flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
          >
            <LogIn size={20} className="text-icon-default" />
            Sign in
          </button>
        )}
        {isEnabled('invite') && (
          <button
            type="button"
            onClick={() => gate('/invite')}
            className="text-style-body flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
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
            className="text-style-body u-press flex items-center gap-12 rounded-12 px-12 py-14 text-text-primary hover:bg-background-elevated"
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
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-24 top-[70px] flex size-32 items-center justify-center rounded-full bg-background-elevated text-icon-default"
              >
                <X size={16} />
              </button>
              <div className="flex-1 overflow-hidden">
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Universal mobile-frame chrome — each page renders its own header row
              (with the menu button, via useDrawer()) right below this. */}
          <div className="lg:hidden">
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
