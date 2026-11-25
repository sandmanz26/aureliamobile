import {
  BrainCircuit,
  ChevronRight,
  FileChartColumn,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Rocket,
  Search,
  Server,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { BuildBadge } from '../components/ui/BuildBadge'
import { BUILD } from '../lib/build'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { readJson, writeJson } from '../lib/storage'
import { RELEASES } from '../versions/releases'
import { AdminDataProvider } from './data/AdminDataContext'

interface NavItem {
  to: string
  label: string
  /** Only the index route needs exact matching. */
  end?: boolean
  /** Flag id in the /__demo registry — lets a walkthrough hide this module. */
  flag: string
}

/** Since U123 the icons sit on the top-level entries (groups and Dashboard); nested items have none. */
const NAV: { section: string; icon: LucideIcon; items: NavItem[] }[] = [
  { section: 'Overview', icon: LayoutDashboard, items: [{ to: '/admin', label: 'Dashboard', end: true, flag: 'admin' }] },
  {
    section: 'People',
    icon: Users,
    items: [
      { to: '/admin/users', label: 'Users', flag: 'adminUsers' },
      { to: '/admin/outcomes', label: 'Well-being outcomes', flag: 'adminOutcomes' },
      { to: '/admin/roles', label: 'Roles & permissions', flag: 'adminRoles' },
    ],
  },
  {
    // "Product lab" since U096: the team's own research and planning tools.
    // The feedback groups moved in from the old Experimentation group in U123.
    section: 'Product lab',
    icon: FlaskConical,
    // Tags, review and coverage are tabs inside User journey (U092).
    items: [
      // Since U129 the latest feedback group is Reports → UX feedback report; v1 keeps its route, off the menu.
      ...(RELEASES.reports
        ? []
        : [
            { to: '/admin/experimentation', label: 'Feedback group · v1', end: true, flag: 'adminExperimentation' },
            { to: '/admin/experimentation/v2', label: 'Feedback group · v2', flag: 'adminExperimentation' },
          ]),
      { to: '/admin/user-journey', label: 'User journey', flag: 'adminUserJourney' },
      // On both sites since J153 (RELEASES).
      ...(RELEASES.personas ? [{ to: '/admin/personas', label: 'Personas', flag: 'adminPersonas' }] : []),
      ...(RELEASES.businessFunnel ? [{ to: '/admin/business-funnel', label: 'Business funnel', flag: 'adminBusinessFunnel' }] : []),
      // U131 (J183): staging only (RELEASES).
      ...(RELEASES.therapeuticMaps
        ? [
            { to: '/admin/therapeutic-map', label: 'Therapeutic map', flag: 'adminTherapeuticMap' },
            { to: '/admin/healing-map', label: 'Healing Map', flag: 'adminHealingMap' },
          ]
        : []),
      // Buyer agent results (/admin/buyer-agent) is off the menu since U123; the route stays and Reports links to it.
    ],
  },
  {
    // U116 (J167): readable reports for the business owner, each showing its sources. Staging only (RELEASES).
    section: 'Reports',
    icon: FileChartColumn,
    items: RELEASES.reports
      ? [
          { to: '/admin/reports', label: 'Overview', end: true, flag: 'adminReportsOverview' },
          { to: '/admin/reports/buyer-agent', label: 'Buyer agent report', flag: 'adminReportBuyerAgent' },
          { to: '/admin/reports/ux-feedback', label: 'UX feedback report', flag: 'adminReportUxFeedback' },
          { to: '/admin/reports/combination', label: 'Combination report', flag: 'adminReportCombination' },
          { to: '/admin/reports/cost', label: 'Cost report', flag: 'adminReportCost' },
          { to: '/admin/reports/b2b2c', label: 'B2B2C report', flag: 'adminReportB2b2c' },
          // U135 (J186): staging only (RELEASES).
          ...(RELEASES.reportMetrics ? [{ to: '/admin/reports/metrics', label: 'Report metrics', flag: 'adminReportMetrics' }] : []),
        ]
      : [],
  },
  {
    section: 'Content',
    icon: FileText,
    items: [
      { to: '/admin/sessions', label: 'Sessions', flag: 'adminSessions' },
      { to: '/admin/challenges', label: 'Challenges', flag: 'adminChallenges' },
      { to: '/admin/moderation', label: 'Moderation', flag: 'adminModeration' },
    ],
  },
  {
    section: 'Intelligence',
    icon: BrainCircuit,
    items: [
      { to: '/admin/ai', label: 'AI monitoring', flag: 'adminAi' },
      { to: '/admin/cockpit-rules', label: 'Cockpit rules', flag: 'adminCockpitRules' },
    ],
  },
  {
    section: 'Revenue',
    icon: TrendingUp,
    items: [
      { to: '/admin/revenue', label: 'Revenue', flag: 'adminRevenue' },
      { to: '/admin/pricing', label: 'Pricing', flag: 'adminPricing' },
      { to: '/admin/payments', label: 'Payments', flag: 'adminPayments' },
      { to: '/admin/coins', label: 'Coins & rewards', flag: 'adminCoins' },
    ],
  },
  {
    section: 'Growth',
    icon: Rocket,
    items: [
      { to: '/admin/experiments', label: 'Experiments', flag: 'adminExperiments' },
      { to: '/admin/notifications', label: 'Notifications', flag: 'adminNotifications' },
    ],
  },
  {
    section: 'Platform',
    icon: Server,
    items: [
      { to: '/admin/compliance', label: 'Compliance', flag: 'adminCompliance' },
      { to: '/admin/signal-sources', label: 'Signal sources', flag: 'adminSignalSources' },
      { to: '/admin/audit', label: 'Audit log', flag: 'adminAudit' },
      { to: '/admin/settings', label: 'Settings', flag: 'adminSettings' },
      // Outside the admin shell: the team wiki at /wiki.
      { to: '/wiki/admin', label: 'Wiki', flag: 'admin' },
    ],
  },
]

const OpenSections = z.array(z.string())
const OPEN_KEY = 'aurelia.admin.navOpen'

function matches(item: NavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

/**
 * The admin menu, grouped. Each group folds (U090: the full list of 22
 * modules was taller than the screen): the group holding the current page is
 * always open, and the groups someone opened stay open in this browser.
 * Overview has one item (Dashboard) and no heading.
 *
 * U123: a search box on top filters by item label or group name and opens
 * every matching group; `/` focuses it, Esc clears, arrows walk the results
 * and Enter opens one (Enter in the box opens the first).
 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isEnabled } = useFeatureFlags()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [opened, setOpened] = useState<string[]>(() => readJson(OPEN_KEY, OpenSections, []))
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const q = query.trim().toLowerCase()
  const groups = NAV.map((group) => {
    const enabled = group.items.filter((item) => isEnabled(item.flag))
    const sectionHit = q !== '' && group.section.toLowerCase().includes(q)
    return {
      ...group,
      items: q === '' || sectionHit ? enabled : enabled.filter((item) => item.label.toLowerCase().includes(q)),
    }
  }).filter((group) => group.items.length > 0)

  // `/` focuses the search box when nothing editable has focus. Both the
  // sidebar and the drawer mount this; only the visible box takes it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const input = inputRef.current
      if (!input || input.offsetParent === null) return
      e.preventDefault()
      input.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function toggle(section: string, isOpen: boolean) {
    const next = isOpen ? opened.filter((x) => x !== section) : [...opened, section]
    setOpened(next)
    writeJson(OPEN_KEY, next)
  }

  function links() {
    return Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-nav-item]') ?? [])
  }

  function onPick() {
    setQuery('')
    onNavigate?.()
  }

  function onInputKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setQuery('')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      links()[0]?.focus()
    } else if (e.key === 'Enter' && q) {
      const first = groups[0]?.items[0]
      if (first) {
        e.preventDefault()
        navigate(first.to)
        onPick()
      }
    }
  }

  function onNavKey(e: ReactKeyboardEvent<HTMLElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Escape') return
    const all = links()
    const i = all.indexOf(document.activeElement as HTMLAnchorElement)
    if (i < 0) return
    e.preventDefault()
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.focus()
    } else if (e.key === 'ArrowDown') all[Math.min(i + 1, all.length - 1)]?.focus()
    else if (i === 0) inputRef.current?.focus()
    else all[i - 1]?.focus()
  }

  const link = (item: NavItem, Icon?: LucideIcon) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      data-nav-item=""
      onClick={onPick}
      className={({ isActive }) =>
        `flex items-center gap-10 rounded-8 px-10 py-6 text-13 transition-colors ${
          isActive ? 'bg-white/12 font-medium text-white' : 'text-white/65 hover:bg-white/6 hover:text-white'
        }`
      }
    >
      {Icon && <Icon size={15} aria-hidden="true" />}
      {item.label}
    </NavLink>
  )

  return (
    <div className="flex flex-col">
      <div className="px-12 pt-12">
        <label className="flex items-center gap-8 rounded-8 bg-white/6 px-10 py-6 text-white/50 focus-within:bg-white/10 focus-within:text-white/80">
          <Search size={14} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search menu"
            aria-label="Search the admin menu"
            className="min-w-0 flex-1 bg-transparent text-13 text-white outline-none placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-white/50 hover:text-white">
              <X size={13} />
            </button>
          ) : (
            <kbd className="rounded-4 border border-white/15 px-4 font-sans text-10 text-white/40">/</kbd>
          )}
        </label>
      </div>
      <nav ref={navRef} onKeyDown={onNavKey} className="flex flex-col gap-2 px-12 py-12">
        {groups.length === 0 && <p className="px-10 py-6 text-13 text-white/45">No menu matches</p>}
        {groups.map((group) => {
          if (group.section === 'Overview')
            return (
              <div key={group.section} className="mb-6 flex flex-col">
                {group.items.map((item) => link(item, group.icon))}
              </div>
            )
          const Icon = group.icon
          const current = group.items.some((item) => matches(item, pathname))
          const isOpen = q !== '' || current || opened.includes(group.section)
          const locked = q !== '' || current
          return (
            <div key={group.section} className="flex flex-col">
              <button
                type="button"
                aria-expanded={isOpen}
                disabled={locked}
                onClick={() => toggle(group.section, isOpen)}
                className="flex items-center justify-between gap-10 rounded-8 px-10 py-6 text-left text-13 font-medium text-white/80 hover:bg-white/6 hover:text-white disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/80"
              >
                <span className="flex items-center gap-10">
                  <Icon size={15} aria-hidden="true" />
                  {group.section}
                </span>
                <span className="flex items-center gap-6">
                  {!isOpen && <span className="text-11 font-medium tabular-nums text-white/30">{group.items.length}</span>}
                  <ChevronRight size={13} className={`text-white/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
                </span>
              </button>
              {isOpen && (
                <div className="mb-6 ml-[17px] flex flex-col gap-1 border-l border-white/10 pl-6">{group.items.map((item) => link(item))}</div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="adm-root flex min-h-screen bg-adm-bg">
      <aside className="sticky top-[var(--staging-bar,0px)] hidden h-[calc(100dvh-var(--staging-bar,0px))] w-[232px] shrink-0 flex-col self-start bg-adm-sidebar lg:flex">
        <div className="flex h-56 items-center gap-8 border-b border-white/8 px-20">
          <AureliaLogo iconSize={22} markOnly />
          <span className="text-13 font-semibold text-white">Aurelia Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="border-t border-white/8 px-20 py-12">
          <p className="text-12 font-medium text-white">Werner S.</p>
          <p className="text-11 text-white/45">Super Admin</p>
          <div className="mt-10">
            <BuildBadge dark />
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[232px] flex-col bg-adm-sidebar">
            <div className="flex h-56 items-center justify-between border-b border-white/8 px-20">
              <span className="text-13 font-semibold text-white">Aurelia Admin</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="text-white/60">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-56 shrink-0 items-center gap-12 border-b border-adm-line bg-adm-surface px-16 lg:px-24">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setOpen(true)}
            className="flex size-32 items-center justify-center rounded-8 text-adm-ink lg:hidden"
          >
            <Menu size={18} />
          </button>
          <span className="text-12 text-adm-muted">
            Environment: <span className="font-medium text-adm-ink">{BUILD.label}</span> · Data is mock
          </span>
        </header>

        <main className="flex flex-1 flex-col gap-20 p-16 lg:p-24">
          <AdminDataProvider>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </AdminDataProvider>
        </main>
      </div>
    </div>
  )
}
