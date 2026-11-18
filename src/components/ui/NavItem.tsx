import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
  /** Turned off in the /__demo console: still listed, but inert. */
  disabled?: boolean
  /** Matches only the exact path — for a parent route with children below it. */
  end?: boolean
  /** Tighter rows for the desktop sidebar (U093); the drawer keeps the Figma 56px rows. */
  compact?: boolean
}

/**
 * Figma "Menu List Item" (inside 16651:12647) — 281 x 56, 16/20 padding, 12
 * between the icon and the label, and the icon is **24**, not 20. The label is
 * `Aurelia/Body` on `text/primary`: 16/24 regular, which is what makes the row
 * 56 tall (16 + 24 + 16).
 */
export function NavItem({ to, icon, label, disabled, end, compact = false }: NavItemProps) {
  const row = compact ? 'px-14 py-10 text-[15px] leading-[22px]' : 'text-style-body px-20 py-16'
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Not part of this walkthrough"
        className={`pointer-events-none flex cursor-not-allowed items-center gap-12 rounded-12 text-text-secondary opacity-45 select-none ${row}`}
      >
        <span className="text-icon-default">{icon}</span>
        <span className="flex-1">{label}</span>
        <Lock size={14} className="text-icon-default" />
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `u-press relative flex items-center gap-12 rounded-12 ${row} ${
          isActive ? 'text-text-primary' : 'text-text-primary hover:bg-background-elevated'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-2 size-6 rounded-full bg-brand-default" aria-hidden="true" />
          )}
          <span className="text-icon-default">{icon}</span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
