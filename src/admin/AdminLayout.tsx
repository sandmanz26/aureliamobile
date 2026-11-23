import {
  BookOpen,
  Contact,
  ShoppingBag,
  Filter,
  HeartPulse,
  Target,
  Microscope,
  Activity,
  Bell,
  Coins,
  ChevronRight,
  CreditCard,
  FileText,
  FlaskConical,
  LayoutDashboard,
  MessageSquareText,
  Menu,
  Radio,
  Route,
  Scale,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  icon: LucideIcon
  /** Only the index route needs exact matching. */
  end?: boolean
  /** Flag id in the /__demo registry — lets a walkthrough hide this module. */
  flag: string
}

const NAV: { section: string; items: NavItem[] }[] = [
  { section: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, flag: 'admin' }] },
  {
    section: 'People',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users, flag: 'adminUsers' },
      { to: '/admin/outcomes', label: 'Well-being outcomes', icon: HeartPulse, flag: 'adminOutcomes' },
      { to: '/admin/roles', label: 'Roles & permissions', icon: ShieldCheck, flag: 'adminRoles' },
    ],
  },
  {
    section: 'Experimentation',
    items: [
      { to: '/admin/experimentation', label: 'Feedback group · v1', icon: Microscope, end: true, flag: 'adminExperimentation' },
      { to: '/admin/experimentation/v2', label: 'Feedback group · v2', icon: Target, flag: 'adminExperimentation' },
    ],
  },
  {
    // "Product lab" since U096: the team's own research and planning tools.
    section: 'Product lab',
    // Tags, review and coverage are tabs inside User journey (U092).
    items: [
      { to: '/admin/user-journey', label: 'User journey', icon: Route, flag: 'adminUserJourney' },
      // On both sites since J153 (RELEASES).
      ...(RELEASES.personas ? [{ to: '/admin/personas', label: 'Personas', icon: Contact, flag: 'adminPersonas' }] : []),
      ...(RELEASES.businessFunnel ? [{ to: '/admin/business-funnel', label: 'Business funnel', icon: Filter, flag: 'adminBusinessFunnel' }] : []),
      ...(RELEASES.buyerAgent ? [{ to: '/admin/buyer-agent', label: 'Buyer agent results', icon: ShoppingBag, flag: 'adminBuyerAgent' }] : []),
    ],
  },
  {
    section: 'Content',
    items: [
      { to: '/admin/sessions', label: 'Sessions', icon: FileText, flag: 'adminSessions' },
      { to: '/admin/challenges', label: 'Challenges', icon: Trophy, flag: 'adminChallenges' },
      { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, flag: 'adminModeration' },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { to: '/admin/ai', label: 'AI monitoring', icon: Activity, flag: 'adminAi' },
      { to: '/admin/cockpit-rules', label: 'Cockpit rules', icon: MessageSquareText, flag: 'adminCockpitRules' },
    ],
  },
  {
    section: 'Revenue',
    items: [
      { to: '/admin/revenue', label: 'Revenue', icon: TrendingUp, flag: 'adminRevenue' },
      { to: '/admin/pricing', label: 'Pricing', icon: Tag, flag: 'adminPricing' },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard, flag: 'adminPayments' },
      { to: '/admin/coins', label: 'Coins & rewards', icon: Coins, flag: 'adminCoins' },
    ],
  },
  {
    section: 'Growth',
    items: [
      { to: '/admin/experiments', label: 'Experiments', icon: FlaskConical, flag: 'adminExperiments' },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, flag: 'adminNotifications' },
    ],
  },
  {
    section: 'Platform',
    items: [
      { to: '/admin/compliance', label: 'Compliance', icon: Scale, flag: 'adminCompliance' },
      { to: '/admin/signal-sources', label: 'Signal sources', icon: Radio, flag: 'adminSignalSources' },
      { to: '/admin/audit', label: 'Audit log', icon: ScrollText, flag: 'adminAudit' },
      { to: '/admin/settings', label: 'Settings', icon: Settings, flag: 'adminSettings' },
      // Outside the admin shell: the team wiki at /wiki.
      { to: '/wiki/admin', label: 'Wiki', icon: BookOpen, flag: 'admin' },
    ],
  },
]

const OpenSections = z.array(z.string())
const OPEN_KEY = 'aurelia.admin.navOpen'

function matches(item: NavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
}

/**
 * The admin menu, grouped. Each group folds (U090: the full list of 22
 * modules was taller than the screen): the group holding the current page is
 * always open, and the groups someone opened stay open in this browser.
 * Overview has one item and no heading.
 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isEnabled } = useFeatureFlags()
  const { pathname } = useLocation()
  const [opened, setOpened] = useState<string[]>(() => readJson(OPEN_KEY, OpenSections, []))
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => isEnabled(item.flag)),
  })).filter((group) => group.items.length > 0)

  function toggle(section: string, isOpen: boolean) {
    const next = isOpen ? opened.filter((x) => x !== section) : [...opened, section]
    setOpened(next)
    writeJson(OPEN_KEY, next)
  }

  const link = (item: NavItem) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-10 rounded-8 px-10 py-6 text-13 transition-colors ${
            isActive ? 'bg-white/12 font-medium text-white' : 'text-white/65 hover:bg-white/6 hover:text-white'
          }`
        }
      >
        <Icon size={15} />
        {item.label}
      </NavLink>
    )
  }

  return (
    <nav className="flex flex-col gap-2 px-12 py-12">
      {groups.map((group) => {
        if (group.section === 'Overview') return <div key={group.section} className="mb-6 flex flex-col">{group.items.map(link)}</div>
        const current = group.items.some((item) => matches(item, pathname))
        const isOpen = current || opened.includes(group.section)
        return (
          <div key={group.section} className="flex flex-col">
            <button
              type="button"
              aria-expanded={isOpen}
              disabled={current}
              onClick={() => toggle(group.section, isOpen)}
              className="flex items-center justify-between rounded-8 px-10 py-6 text-left text-10 font-semibold uppercase tracking-widest text-white/40 hover:bg-white/6 hover:text-white/70 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/40"
            >
              <span>{group.section}</span>
              <span className="flex items-center gap-6 normal-case tracking-normal">
                {!isOpen && <span className="text-11 font-medium tabular-nums text-white/30">{group.items.length}</span>}
                <ChevronRight size={13} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
              </span>
            </button>
            {isOpen && <div className="flex flex-col gap-1 pb-6">{group.items.map(link)}</div>}
          </div>
        )
      })}
    </nav>
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
