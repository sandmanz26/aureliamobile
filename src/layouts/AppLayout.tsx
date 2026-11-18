import { PanelLeftClose, PanelLeftOpen, Plus, Sparkles } from 'lucide-react'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { FloatingPlayer, PullIndicator, usePullToRefresh, useSheetDrag } from '../versions/V2Shell'
import { useUiVersion } from '../versions/useUiVersion'
import { useAuth } from '../auth/AuthContext'
import { useHiddenScrollbars } from '../hooks/useHiddenScrollbars'
import { useSignInGate } from '../auth/useSignInGate'
import { ChartMediumIcon, NoteIcon, NotificationActiveIcon, MessageQuestionIcon, NotificationIcon, PlaylistIcon, UserAddIcon, UserIcon } from '../components/ui/AureliaIcons'
import sidebarLogo from '../assets/aurelia-sidebar-logo.svg'
import { useHasUnreadNotifications } from '../lib/notificationsSeen'
import { BuildBadge } from '../components/ui/BuildBadge'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { NavItem } from '../components/ui/NavItem'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { recentSessions } from '../lib/sessions'
import { DrawerContext } from './DrawerContext'
import { TabBar } from '../components/ui/TabBar'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { readString, writeString } from '../lib/storage'
import { RELEASES } from '../versions/releases'

const LATEST = recentSessions()

function SidebarContent({ onNavigate, onCollapse, compact = false }: { onNavigate?: () => void; onCollapse?: () => void; compact?: boolean }) {
  // compact (U093): the desktop sidebar on staging, tighter than the phone drawer's Figma rows.
  const row = compact ? 'px-14 py-10 text-[15px] leading-[22px]' : 'text-style-body px-20 py-16'
  const unread = useHasUnreadNotifications()
  const { isEnabled } = useFeatureFlags()
  const { signedIn } = useAuth()
  const gate = useSignInGate()
  const navigate = useNavigate()
  const v4 = useUiVersion() >= 4
  // Signed in, the account itself is an item and wears the user's face;
  // signed out, the same slot is the way in. First in v1–v3; in v4 it is
  // "Me", the last of the four (U051).
  const account = signedIn ? (
    <NavItem
      to="/profile"
      icon={
        <PhotoCircle
          photo="avatar"
          size={24}
          gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
        />
      }
      label={v4 ? 'Me' : 'Profile'}
      disabled={!isEnabled('profile')}
    />
  ) : (
    <NavItem compact={compact} to="/login" icon={<UserIcon size={24} className="shrink-0" />} label="Sign In" disabled={!isEnabled('auth')} />
  )

  return (
    /* Figma "Menu" (16651:12647) — 313 wide on surface/default, 16 side
       padding, 24 at the bottom, and 20 between blocks. Used to add 54 at
       the top to clear the simulated phone status bar AppLayout stuck above
       the page; that band is gone now that this is web-first, so the drawer
       keeps the same 24 as everything else. */
    <div className={`flex h-full flex-col overflow-y-auto ${compact ? 'gap-12 px-12 pb-16 pt-20' : 'gap-20 px-16 pb-24 pt-24'}`}>
      <div className={`flex items-center justify-between ${compact ? 'px-12 pb-8' : 'px-20 pb-16'}`}>
        {/* The mark goes home, as a brand mark in app chrome is expected to.
            It closes the drawer on the way, so the destination is not left
            sitting behind the panel that took you there. Home is open to
            everyone, so this needs no gate. */}
        <Link to="/home" aria-label="Aurelia home" onClick={onNavigate} className="u-press">
          {/* The supplied sidebar lockup (mark + gradient wordmark, 114x32). */}
          <img src={sidebarLogo} alt="Aurelia" width={114} height={32} className="block h-32 w-auto" />
        </Link>
        <div className="flex items-center gap-12">
        {isEnabled('notifications') && (
          <button
            type="button"
            aria-label={unread ? 'Notifications, unread' : 'Notifications'}
            onClick={() => {
              onNavigate?.()
              gate('/notifications')
            }}
            className="u-press relative text-icon-default"
          >
            {/* The supplied bell pair: with the red dot while there is
                something unread, plain once Notifications has been opened. */}
            {unread ? <NotificationActiveIcon size={24} /> : <NotificationIcon size={24} />}
          </button>
        )}
        {/* Desktop only (U091): fold the sidebar to the icon rail. */}
        {onCollapse && (
          <button type="button" aria-label="Collapse sidebar" title="Collapse sidebar" onClick={onCollapse} className="u-press text-icon-default">
            <PanelLeftClose size={22} strokeWidth={1.5} />
          </button>
        )}
        </div>
      </div>

      {/* No gap: the frame's rows are 56 tall and stack flush, so the spacing
          is the row's own padding rather than a gutter between them. */}
      <nav className="flex flex-col" onClick={onNavigate}>
        {/* v1–v3: the account comes first. v4 puts it last, as Me. */}
        {!v4 && account}
        {/* No Chat entry: the design's drawer goes Profile / Explore / Sessions
            / My wellness, and the cockpit is reached by "New session" below
            rather than by being a destination of its own. */}
        {v4 ? (
          /* v4 (U051): the desktop sidebar names the same four core features
             as the mobile tab bar. "Me" is the account item above (Profile is
             Me now); Library, credits, invite and help live inside it. */
          <>
            <NavItem compact={compact} to="/home" icon={<Sparkles size={22} strokeWidth={1.5} className="shrink-0" />} label="Create" />
            <NavItem compact={compact} to="/explore" icon={<NoteIcon size={24} className="shrink-0" />} label="Discover" disabled={!isEnabled('explore')} />
            <NavItem compact={compact} to="/wellness" icon={<ChartMediumIcon size={24} className="shrink-0" />} label="Progress" disabled={!isEnabled('wellness')} />
            {account}
          </>
        ) : (
          <>
            <NavItem compact={compact} to="/explore" icon={<NoteIcon size={24} className="shrink-0" />} label="Explore" disabled={!isEnabled('explore')} />
            <NavItem compact={compact} to="/sessions" icon={<PlaylistIcon size={24} className="shrink-0" />} label="Sessions" disabled={!isEnabled('sessions')} />
            <NavItem compact={compact} to="/wellness" icon={<ChartMediumIcon size={24} className="shrink-0" />} label="My wellness" disabled={!isEnabled('wellness')} />
          </>
        )}
      </nav>

      {/* Figma "Frame 25" — Latest and the button are one block, 20 inside and
          32 between them, rather than two things that happen to be adjacent. */}
      <div className={`flex flex-col ${compact ? 'gap-20 p-12' : 'gap-32 p-20'}`}>
        {signedIn && (
          <div className="flex flex-col gap-20">
            <p className="text-style-body-small text-text-secondary">{v4 ? 'Recent' : 'Latest'}</p>
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

        {/* Figma "10" — 241 x 42, radius 16, and the gradient runs #FF881B into
            #FFE682 left to right. It was carrying #F0A032 into #FFCC66, which is
            a different pair of oranges and reads flatter. Written out rather
            than taken from Button: the height, the 16 radius and the regular
            weight are all this button's own, and overriding three of Button's
            utilities would leave the winner to v4's layer order. */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            gate('/chat', { fresh: true })
          }}
          className={`u-press flex w-full items-center justify-center gap-8 rounded-16 px-22 text-text-inverse ${compact ? 'h-38 text-[15px]' : 'text-style-body h-42'}`}
          style={{ background: 'linear-gradient(90deg, #FF881B, #FFE682)' }}
        >
          <Plus size={14} />
          New session
        </button>
      </div>

      {/* border/default in the frame, not border/subtle — #CBC4B8 against
          #E4E1DC, and the divider is the one rule the panel draws. */}
      <div className={`mt-auto flex flex-col border-t border-border-default ${compact ? 'pt-12' : 'pt-20'}`}>
        {isEnabled('invite') && (
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              gate('/invite')
            }}
            className={`u-press flex items-center gap-12 rounded-12 text-text-primary hover:bg-background-elevated ${row}`}
          >
            <UserAddIcon size={24} className="shrink-0 text-icon-default" />
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
            className={`u-press flex items-center gap-12 rounded-12 text-text-primary hover:bg-background-elevated ${row}`}
          >
            <MessageQuestionIcon size={24} className="shrink-0 text-icon-default" />
            Help
          </button>
        )}
        {/* Which site and which build, where it is always in view. Not a
            navigation item and deliberately not a link — see BuildBadge. */}
        <div className={compact ? 'px-14 pt-8' : 'px-20 pt-12'}>
          <BuildBadge />
        </div>
      </div>
    </div>
  )
}

const RAIL_KEY = 'aurelia.sidebar.rail'

/**
 * The desktop sidebar folded to an icon rail (U091, Eugene's request): the
 * same destinations as the full sidebar, each an icon with a short label,
 * New session as the round button on top, and Expand at the foot. Recent
 * sessions and the build badge live only in the full sidebar.
 */
function SidebarRail({ onExpand }: { onExpand: () => void }) {
  const unread = useHasUnreadNotifications()
  const { isEnabled } = useFeatureFlags()
  const { signedIn } = useAuth()
  const gate = useSignInGate()
  const v4 = useUiVersion() >= 4

  const items: { to: string; label: string; icon: ReactNode; flag?: string }[] = v4
    ? [
        { to: '/home', label: 'Create', icon: <Sparkles size={22} strokeWidth={1.5} /> },
        { to: '/explore', label: 'Discover', icon: <NoteIcon size={24} />, flag: 'explore' },
        { to: '/wellness', label: 'Progress', icon: <ChartMediumIcon size={24} />, flag: 'wellness' },
      ]
    : [
        { to: '/explore', label: 'Explore', icon: <NoteIcon size={24} />, flag: 'explore' },
        { to: '/sessions', label: 'Sessions', icon: <PlaylistIcon size={24} />, flag: 'sessions' },
        { to: '/wellness', label: 'Wellness', icon: <ChartMediumIcon size={24} />, flag: 'wellness' },
      ]
  const account = signedIn
    ? { to: '/profile', label: v4 ? 'Me' : 'Profile', icon: <PhotoCircle photo="avatar" size={24} gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))" />, flag: 'profile' }
    : { to: '/login', label: 'Sign In', icon: <UserIcon size={24} />, flag: 'auth' }
  const all = v4 ? [...items, account] : [account, ...items]

  const tile = 'u-press flex w-full flex-col items-center gap-4 rounded-12 px-4 py-10 text-center text-[11px] leading-[14px] text-text-primary'
  const iconButton = 'u-press relative flex size-44 items-center justify-center rounded-12 text-icon-default hover:bg-background-elevated'

  return (
    <div className="flex h-full flex-col items-center gap-16 px-8 pb-20 pt-24">
      <Link to="/home" aria-label="Aurelia home" className="u-press">
        <AureliaLogo iconSize={32} markOnly />
      </Link>
      <button
        type="button"
        aria-label="New session"
        title="New session"
        onClick={() => gate('/chat', { fresh: true })}
        className="u-press flex size-44 items-center justify-center rounded-full text-text-inverse"
        style={{ background: 'linear-gradient(90deg, #FF881B, #FFE682)' }}
      >
        <Plus size={18} />
      </button>
      <nav className="flex w-full flex-col gap-4">
        {all.map((item) =>
          item.flag && !isEnabled(item.flag) ? (
            <span key={item.to} aria-disabled="true" title="Not part of this walkthrough" className={`${tile} pointer-events-none opacity-45`}>
              <span className="text-icon-default">{item.icon}</span>
              {item.label}
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${tile} ${isActive ? 'bg-background-elevated font-semibold' : 'hover:bg-background-elevated'}`}
            >
              <span className="text-icon-default">{item.icon}</span>
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        {isEnabled('notifications') && (
          <button type="button" aria-label={unread ? 'Notifications, unread' : 'Notifications'} title="Notifications" onClick={() => gate('/notifications')} className={iconButton}>
            {unread ? <NotificationActiveIcon size={24} /> : <NotificationIcon size={24} />}
          </button>
        )}
        {isEnabled('invite') && (
          <button type="button" aria-label="Invite a Friend" title="Invite a Friend" onClick={() => gate('/invite')} className={iconButton}>
            <UserAddIcon size={24} />
          </button>
        )}
        {isEnabled('help') && (
          <Link to="/help" aria-label="Help" title="Help" className={iconButton}>
            <MessageQuestionIcon size={24} />
          </Link>
        )}
        <div className="mt-8 flex w-full justify-center border-t border-border-default pt-8">
          <button type="button" aria-label="Expand sidebar" title="Expand sidebar" onClick={onExpand} className={iconButton}>
            <PanelLeftOpen size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Desktop sidebar folded to the icon rail; remembered per browser (U091).
  // Folded by default (U093); '0' means this browser chose the full sidebar.
  const [rail, setRail] = useState(() => RELEASES.sidebarRail && readString(RAIL_KEY) !== '0')
  function setRailMode(next: boolean) {
    setRail(next)
    writeString(RAIL_KEY, next ? '1' : '0')
  }
  // Fixed bars beside the sidebar read its width from --app-sidebar.
  useEffect(() => {
    const root = document.documentElement
    if (rail) root.setAttribute('data-sidebar', 'rail')
    else if (RELEASES.sidebarRail) root.setAttribute('data-sidebar', 'compact')
    else root.removeAttribute('data-sidebar')
    return () => root.removeAttribute('data-sidebar')
  }, [rail])

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
  // Design Version 2 (staging only): directional page transitions, pull to
  // refresh, draggable sheets and a player that follows you. See V2Shell.
  const v2 = useUiVersion() >= 2
  const v4 = useUiVersion() >= 4
  const navType = useNavigationType()
  const { pull, refreshing, key: refreshKey } = usePullToRefresh(v2)
  useSheetDrag(v2)

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
        {/* 260, not the drawer's 313 — that number is the Figma mobile
            "Menu" frame's own width, drawn for a slide-out panel over the
            page. A sidebar that sits beside the page at all times reads as
            oversized at the same width; 260 is this component's own desktop
            number, not a frame measurement. `SessionDetailPage` and
            `SessionSettingsPage` each offset a fixed bottom bar by this same
            figure (`lg:left-[313px]`) to sit beside it rather than under it —
            changing one without the other leaves a gap or an overlap. */}
        <aside
          className={`hidden shrink-0 border-r border-border-subtle bg-surface-default transition-[width] duration-200 lg:sticky lg:top-0 lg:block lg:h-screen ${rail ? 'w-[88px]' : RELEASES.sidebarRail ? 'w-[232px]' : 'w-[260px]'}`}
        >
          {rail ? <SidebarRail onExpand={() => setRailMode(false)} /> : <SidebarContent compact={RELEASES.sidebarRail} onCollapse={RELEASES.sidebarRail ? () => setRailMode(true) : undefined} />}
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
          {v2 && <PullIndicator pull={pull} refreshing={refreshing} />}
          <div
            key={`${location.pathname}#${refreshKey}`}
            data-nav={v2 ? navType : undefined}
            className="u-page pt-[30px] lg:pt-0"
            style={v2 && pull ? { transform: `translateY(${pull * 0.6}px)`, transition: 'none' } : undefined}
          >
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
            {v2 && <FloatingPlayer pathname={location.pathname} />}
            {/* v4 (U051): four tabs below lg. Not in the cockpit, which is a
                full-screen task with its own way back. */}
            {v4 && !location.pathname.startsWith('/chat') && <TabBar />}
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
