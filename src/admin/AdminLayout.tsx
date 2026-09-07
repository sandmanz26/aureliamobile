import {
  Activity,
  Bell,
  Coins,
  CreditCard,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Scale,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'

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
      { to: '/admin/roles', label: 'Roles & permissions', icon: ShieldCheck, flag: 'adminRoles' },
    ],
  },
  {
    section: 'Content',
    items: [
      { to: '/admin/sessions', label: 'Sessions', icon: FileText, flag: 'adminSessions' },
      { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, flag: 'adminModeration' },
    ],
  },
  {
    section: 'Intelligence',
    items: [{ to: '/admin/ai', label: 'AI monitoring', icon: Activity, flag: 'adminAi' }],
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
      { to: '/admin/audit', label: 'Audit log', icon: ScrollText, flag: 'adminAudit' },
      { to: '/admin/settings', label: 'Settings', icon: Settings, flag: 'adminSettings' },
    ],
  },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isEnabled } = useFeatureFlags()
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => isEnabled(item.flag)),
  })).filter((group) => group.items.length > 0)

  return (
    <nav className="flex flex-col gap-18 px-12 py-16" onClick={onNavigate}>
      {groups.map((group) => (
        <div key={group.section} className="flex flex-col gap-2">
          <p className="px-10 pb-4 text-10 font-semibold uppercase tracking-widest text-white/35">{group.section}</p>
          {group.items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-10 rounded-8 px-10 py-8 text-13 transition-colors ${
                    isActive ? 'bg-white/12 font-medium text-white' : 'text-white/65 hover:bg-white/6 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-adm-bg">
      <aside className="hidden w-[232px] shrink-0 flex-col bg-adm-sidebar lg:flex">
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
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex size-32 items-center justify-center rounded-8 text-adm-ink lg:hidden"
          >
            <Menu size={18} />
          </button>
          <span className="text-12 text-adm-muted">
            Environment: <span className="font-medium text-adm-ink">staging</span> · Data is mock
          </span>
        </header>

        <main className="flex flex-1 flex-col gap-20 p-16 lg:p-24">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
