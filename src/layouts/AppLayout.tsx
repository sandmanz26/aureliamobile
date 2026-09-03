import { Bell, Compass, HelpCircle, ListMusic, Plus, User, UserPlus, Waves } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { Button } from '../components/ui/Button'
import { NavItem } from '../components/ui/NavItem'

const recentSessions = [
  { title: 'Sleep Meditation', author: 'Adam Nilson' },
  { title: 'Morning Mindfulness', author: 'Adam Nilson' },
  { title: 'Stress relief techniques', author: 'Marcus Lee' },
]

export function AppLayout() {
  return (
    <div className="flex min-h-full bg-background-default">
      <aside className="flex w-[313px] shrink-0 flex-col gap-24 border-r border-border-subtle bg-surface-default px-24 py-24">
        <div className="flex items-center justify-between">
          <AureliaLogo iconSize={30} />
          <button type="button" aria-label="Notifications" className="text-icon-default">
            <Bell size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <NavItem to="/profile" icon={<User size={20} />} label="Profile" />
          <NavItem to="/explore" icon={<Compass size={20} />} label="Explore" />
          <NavItem to="/sessions" icon={<ListMusic size={20} />} label="Sessions" />
          <NavItem to="/wellness" icon={<Waves size={20} />} label="My wellness" />
        </nav>

        <div className="flex flex-col gap-12">
          <p className="text-style-body-small px-12">Latest</p>
          <div className="flex flex-col gap-16">
            {recentSessions.map((session) => (
              <div key={session.title} className="flex items-center gap-12 px-12">
                <div
                  className="size-40 shrink-0 rounded-full"
                  style={{ background: 'conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))' }}
                />
                <div className="min-w-0">
                  <p className="text-style-label truncate">{session.title}</p>
                  <p className="text-style-caption truncate">{session.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          className="w-full"
          style={{ background: 'linear-gradient(90deg, var(--color-gold-600), var(--color-gold-300))' }}
        >
          New session
        </Button>

        <div className="mt-auto flex flex-col gap-4 border-t border-border-subtle pt-16">
          <button type="button" className="flex items-center gap-12 rounded-12 px-12 py-14 text-style-body text-text-primary hover:bg-background-elevated">
            <UserPlus size={20} className="text-icon-default" />
            Invite a Friend
          </button>
          <button type="button" className="flex items-center gap-12 rounded-12 px-12 py-14 text-style-body text-text-primary hover:bg-background-elevated">
            <HelpCircle size={20} className="text-icon-default" />
            Help
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
