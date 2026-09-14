import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronUp, CircleDollarSign, LogOut, Menu, Plus, User, UserX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GoogleMark } from './auth/AuthShell'
import { useAuth } from '../auth/AuthContext'
import { CoinPill } from '../components/ui/CoinPill'
import { useDrawer } from '../layouts/DrawerContext'

/** One tappable line in the list under the accounts block. */
function Row({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-16 border-t border-border-subtle py-20 text-left ${
        tone === 'danger' ? 'text-danger-600' : 'text-text-primary'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-style-body">{label}</span>
    </button>
  )
}

/**
 * Figma 16523:13934 — what the gear on the profile opens.
 *
 * This is also where sign-out lives. It had been unreachable from anywhere in
 * the UI since it left the drawer, which meant the only way out of an account
 * was to reload the page.
 */
export function AccountSettingsPage() {
  const { openDrawer } = useDrawer()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [accountsOpen, setAccountsOpen] = useState(true)
  const [connected, setConnected] = useState(true)

  return (
    <div className="mx-auto max-w-[720px] px-20 py-16 lg:px-24 lg:py-24">
      <header className="flex items-center justify-between gap-12">
        <div className="flex min-w-0 items-center gap-12">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-style-title-large truncate text-text-primary">Settings</h1>
        </div>
        <CoinPill points="1,323" className="shadow-sm" />
      </header>

      <section className="mt-32">
        <button
          type="button"
          onClick={() => setAccountsOpen((open) => !open)}
          aria-expanded={accountsOpen}
          className="flex w-full items-center gap-16 text-text-primary"
        >
          <User size={24} className="shrink-0" />
          <span className="text-style-body flex-1 text-left">Connected Accounts</span>
          <ChevronUp
            size={20}
            className={`shrink-0 transition-transform ${accountsOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {accountsOpen && (
          <div className="mt-16 flex flex-col gap-16">
            <div className="flex items-center gap-16 rounded-16 bg-surface-default p-16 shadow-sm">
              <span className="flex size-44 shrink-0 items-center justify-center rounded-full bg-[#fdf1e3]">
                <GoogleMark />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-style-body block truncate text-text-primary">Adam Nilson</span>
                <span className="text-style-body-small block truncate text-text-secondary">
                  adamnilson@gmail.com
                </span>
              </span>
              {/* The account stays listed when switched off — disconnecting is a
                  separate, heavier thing than pausing the sign-in. */}
              <button
                type="button"
                role="switch"
                aria-checked={connected}
                aria-label="Use this account"
                onClick={() => setConnected((on) => !on)}
                className={`relative h-28 w-52 shrink-0 rounded-full transition-colors ${
                  connected ? 'bg-icon-strong' : 'bg-border-default'
                }`}
              >
                <span
                  className={`absolute top-2 size-24 rounded-full bg-surface-default transition-all ${
                    connected ? 'left-26' : 'left-2'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              className="u-press flex items-center justify-center gap-12 rounded-16 bg-surface-default p-20 shadow-sm"
            >
              <Plus size={20} className="text-icon-default" />
              <span className="text-style-body text-text-primary">Add another Google account</span>
            </button>
          </div>
        )}
      </section>

      <div className="mt-32">
        <Row icon={<CircleDollarSign size={24} />} label="Coin Redemption" />
        <Row icon={<UserX size={24} />} label="Account Deletion" />
        <Row
          icon={<LogOut size={24} />}
          label="Log Out"
          onClick={() => {
            signOut()
            navigate('/home')
          }}
        />
      </div>
    </div>
  )
}
