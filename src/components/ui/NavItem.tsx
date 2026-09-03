import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
}

export function NavItem({ to, icon, label }: NavItemProps) {
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
