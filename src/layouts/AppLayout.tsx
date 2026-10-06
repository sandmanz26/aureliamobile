import { Bell, HelpCircle, Plus, UserPlus } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useHiddenScrollbars } from '../hooks/useHiddenScrollbars'
import { useSignInGate } from '../auth/useSignInGate'
import iconSignIn from '../assets/icon-nav-signin.png'
import iconExplore from '../assets/icon-nav-explore.png'
import iconSessions from '../assets/icon-nav-sessions.png'
import iconWellness from '../assets/icon-nav-wellness.png'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { BuildBadge } from '../components/ui/BuildBadge'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { NavItem } from '../components/ui/NavItem'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { recentSessions } from '../lib/sessions'
import { DrawerContext } from './DrawerContext'

const LATEST = recentSessions()

/** The real exported glyphs for the drawer's four nav rows, not lucide
 *  lookalikes — flat icons, so NavItem's `text-icon-default` wrapper has
 *  nothing to tint; the colour is baked into each file. */
function NavIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={24} height={24} className="shrink-0" />
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { isEnabled } = useFeatureFlags()
  const { signedIn } = useAuth()
  const gate = useSignInGate()
  const navigate = useNavigate()

  return (
    /* Figma "Menu" (16651:12647) — 313 wide on surface/default, 16 side
       padding, 24 at the bottom, and 20 between blocks. Used to add 54 at
       the top to clear the simulated phone status bar AppLayout stuck above
       the page; that band is gone now that this is web-first, so the drawer
       keeps the same 24 as everything else. */
    <div className="flex h-full flex-col gap-20 overflow-y-auto px-16 pb-24 pt-24">
      <div className="flex items-center justify-between px-20 pb-16">
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
            <Bell size={24} />
            {/* Unread marker. A real build drives this from the feed. */}
            <span className="absolute -right-1 -top-1 size-8 rounded-full bg-feedback-error ring-2 ring-surface-default" />
          </button>
        )}
      </div>

      {/* No gap: the frame's rows are 56 tall and stack flush, so the spacing
          is the row's own padding rather than a gutter between them. */}
      <nav className="flex flex-col" onClick={onNavigate}>
        {/* Signed in, the account itself is the first item and wears the user's
            face; signed out, the same slot is the way in. */}
        {signedIn ? (
          <NavItem
            to="/profile"
            icon={
              <PhotoCircle
                photo="avatar"
                size={24}
                gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
              />
            }
            label="Profile"
            disabled={!isEnabled('profile')}
          />
        ) : (
          <NavItem to="/login" icon={<NavIcon src={iconSignIn} />} label="Sign In" disabled={!isEnabled('auth')} />
        )}
        {/* No Chat entry: the design's drawer goes Profile / Explore / Sessions
            / My wellness, and the cockpit is reached by "New session" below
            rather than by being a destination of its own. */}
        <NavItem to="/explore" icon={<NavIcon src={iconExplore} />} label="Explore" disabled={!isEnabled('explore')} />
        <NavItem to="/sessions" icon={<NavIcon src={iconSessions} />} label="Sessions" disabled={!isEnabled('sessions')} />
        <NavItem to="/wellness" icon={<NavIcon src={iconWellness} />} label="My wellness" disabled={!isEnabled('wellness')} />
      </nav>

      {/* Figma "Frame 25" — Latest and the button are one block, 20 inside and
          32 between them, rather than two things that happen to be adjacent. */}
      <div className="flex flex-col gap-32 p-20">
        {signedIn && (
          <div className="flex flex-col gap-20">
            <p className="text-style-body-small text-text-secondary">Latest</p>
            {/* Real sessions, and each one opens its own thread. These were three
                inert divs naming sessions that did not exist — on the one shelf
                whose whole job is taking you back to a conversation. */}
            {LATEST.map((session) => (
              <Link
                key={session.slug}
                to={`/chat/${session.slug}`}
                onClick={onNavigate}
                className="u-press flex items-center gap-12"
              >
                {/* 32 in the frame, not 40 — the row is 32 tall and the disc is
                    its measure. */}
                <PhotoCircle
                  photo={session.photo}
                  size={32}
                  gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
                />
                <div className="flex min-w-0 flex-col gap-4">
                  <p className="text-style-body-small truncate text-text-primary">{session.title}</p>
                  <p className="text-style-caption truncate text-text-secondary">{session.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Figma "10" — 241 x 42, radius 60, and the gradient runs #FF881B into
            #FFE682 left to right. It was carrying #F0A032 into #FFCC66, which is
            a different pair of oranges and reads flatter. Written out rather
            than taken from Button: the height, the 60 radius and the regular
            weight are all this button's own, and overriding three of Button's
            utilities would leave the winner to v4's layer order. */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            gate('/chat', { fresh: true })
          }}
          className="text-style-body u-press flex h-42 w-full items-center justify-center gap-8 rounded-[60px] px-22 text-text-inverse"
          style={{ background: 'linear-gradient(90deg, #FF881B, #FFE682)' }}
        >
          <Plus size={14} />
          New session
        </button>
      </div>

      {/* border/default in the frame, not border/subtle — #CBC4B8 against
          #E4E1DC, and the divider is the one rule the panel draws. */}
      <div className="mt-auto flex flex-col border-t border-border-default pt-20">
        {isEnabled('invite') && (
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              gate('/invite')
            }}
            className="text-style-body u-press flex items-center gap-12 rounded-12 px-20 py-16 text-text-primary hover:bg-background-elevated"
          >
            <UserPlus size={24} className="text-icon-default" />
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
            className="text-style-body u-press flex items-center gap-12 rounded-12 px-20 py-16 text-text-primary hover:bg-background-elevated"
          >
            <HelpCircle size={24} className="text-icon-default" />
            Help
          </button>
        )}
        {/* Which site and which build, where it is always in view. Not a
            navigation item and deliberately not a link — see BuildBadge. */}
        <div className="px-20 pt-12">
          <BuildBadge />
        </div>
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
        {/* Desktop: persistent sidebar (lg and up).
            Pinned to the viewport, and that is load-bearing rather than
            decoration. As a plain flex child it stretched to the *document* —
            3965px on Home — and `mt-auto` then put Invite a Friend and Help at
            the bottom of that, some 3800px down a 900px screen. They were
            rendered and reachable only by scrolling the whole page. A sidebar
            is chrome: it is the height of the window and scrolls its own
            content. */}
        <aside className="hidden w-[313px] shrink-0 border-r border-border-subtle bg-surface-default lg:sticky lg:top-0 lg:block lg:h-screen">
          <SidebarContent />
        </aside>

        {/* Mobile: hamburger-triggered drawer, faithful to the Figma "Menu" screen */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="u-fade absolute inset-0 bg-icon-strong/20"
              onClick={() => setDrawerOpen(false)}
            />
            {/* No status bar in here. The phone's is already on screen behind
                the drawer; drawing a second one inside the panel stacked two
                clocks up the left edge. The frame's 66 of top padding is
                measured from the phone's bar, not from a bar of its own. */}
            <div className="u-drawer relative flex h-full w-[313px] max-w-[85vw] flex-col bg-surface-default shadow-xl">
              <div className="flex-1 overflow-hidden">
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Keyed on the path so the entrance replays on every navigation —
              without it React reuses the node and the animation runs once. */}
          <div key={location.pathname} className="u-page pt-[30px] lg:pt-0">
            {/* Only the page content suspends — the drawer, status band and
                this shell stay put. Each page is its own lazy chunk (see
                App.tsx), so this only shows on the first visit to a route
                in a session; a cached chunk resolves before paint.

                The status band itself is back, in miniature: below `lg` this
                wrapper clears space for the device's own status bar, which a
                real phone (or a WebView) draws over the top of the page
                regardless of what's under it. Sized here rather than per
                page so it reaches every route without 35 files each adding
                their own top offset — the same reasoning that put the
                sticky-header behaviour in one `.u-sticky-top` class instead
                of a shared header component. Desktop clears it back to 0:
                nothing there draws a status bar over the browser chrome. */}
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
