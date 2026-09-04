import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
  /** Turned off in the /__demo console: still listed, but inert. */
  disabled?: boolean
}

export function NavItem({ to, icon, label, disabled }: NavItemProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Not part of this walkthrough"
        className="text-style-body pointer-events-none flex cursor-not-allowed items-center gap-12 rounded-12 px-12 py-14 text-text-secondary opacity-45 select-none"
      >
        <span className="size-6 rounded-full bg-transparent" />
        <span className="text-icon-default">{icon}</span>
        <span className="flex-1">{label}</span>
        <Lock size={14} className="text-icon-default" />
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-12 rounded-12 px-12 py-14 text-style-body transition-colors ${
          isActive ? 'text-text-primary' : 'text-text-primary hover:bg-background-elevated'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`size-6 rounded-full ${isActive ? 'bg-brand-default' : 'bg-transparent'}`} />
          <span className="text-icon-default">{icon}</span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
