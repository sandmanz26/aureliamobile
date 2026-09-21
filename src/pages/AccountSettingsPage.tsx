import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, ChevronUp, CircleDollarSign, FlaskConical, LogOut, Plus, User, UserX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GoogleMark } from './auth/AuthShell'
import { useAuth } from '../auth/AuthContext'
import { CoinPill } from '../components/ui/CoinPill'
import { usePlayerBeta } from '../lib/playerBeta'

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
      className={`u-press flex h-56 w-full items-center gap-12 border-t border-[#D6D6D6] text-left ${
        tone === 'danger' ? 'text-danger-600' : 'text-text-primary'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-style-body">{label}</span>
    </button>
  )
}

/** Same switch as My Wellness's source rows (Figma ".switch", 16523:14071) —
 *  not exported from there, so redrawn here rather than reached across pages
 *  for one shared control. */
function Switch({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`u-press relative h-22 w-40 shrink-0 rounded-full transition-colors ${
        on ? 'bg-text-primary' : 'bg-[#e5e5e5]'
      }`}
    >
      <span
        className={`absolute top-2 size-18 rounded-full bg-surface-default transition-all ${
          on ? 'left-20' : 'left-2'
        }`}
      />
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
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [accountsOpen, setAccountsOpen] = useState(true)

  const [playerBeta, setPlayerBeta] = usePlayerBeta()

  return (
    <div className="mx-auto max-w-[720px] px-20 py-16 lg:px-24 lg:py-24">
      <header className="u-sticky-top flex items-center justify-between gap-12">
        <div className="flex min-w-0 items-center gap-20">
          {/* Back, not the drawer: this screen is opened by the gear on your
              own profile, so the way out is the way you came. */}
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-style-title-large-regular truncate text-text-primary">Settings</h1>
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
          <div className="mt-20 flex flex-col gap-12">
            <div className="flex items-center gap-12 rounded-[20px] bg-surface-default p-16 shadow-sm">
              <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-[#FFF1DB]">
                <GoogleMark />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-style-body block truncate text-text-primary">Adam Nilson</span>
                <span className="text-style-body-small block truncate text-text-secondary">
                  adamnilson@gmail.com
                </span>
              </span>
              {/* A tick, not a switch. The frame draws `tick-square`: the row
                  states that this account is the one you are signed in with,
                  and offers no way to pause it. Disconnecting is Account
                  Deletion's business, and inventing a toggle here put a control
                  in front of the user that nothing behind it honoured. */}
              <Check size={24} className="shrink-0 text-icon-default" aria-label="Signed in with this account" />
            </div>

            <button
              type="button"
              className="u-press flex h-48 items-center justify-center gap-8 rounded-[40px] bg-surface-default shadow-sm"
            >
              <Plus size={20} className="text-icon-default" />
              <span className="text-[14px] leading-[18px] text-icon-strong">Add another Google account</span>
            </button>
          </div>
        )}
      </section>

      <div className="mt-32">
        {/* "Credit Redemption" in the frame, not "Coin". The product calls the
            currency credits everywhere else — including the screen this opens. */}
        <Row
          icon={<CircleDollarSign size={24} />}
          label="Credit Redemption"
          onClick={() => navigate('/credits')}
        />
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

      {/* Not in the frame — a real opt-in rather than a walkthrough switch, so
          it lives where a visitor's own preferences do rather than in
          /__demo. Off by default, on until turned off again, per browser. */}
      <div className="mt-32">
        <h2 className="text-style-caption uppercase tracking-widest text-text-secondary">Experimental</h2>
        <div className="mt-12 flex items-center gap-12 rounded-[20px] bg-surface-default p-16 shadow-sm">
          <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#FFF1DB] text-[#FF881B]">
            <FlaskConical size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-style-body block text-text-primary">Player Beta</span>
            <span className="text-style-body-small block text-text-secondary">
              Swipe between a session and its earlier cuts from a single card.
            </span>
          </span>
          <Switch on={playerBeta} onChange={setPlayerBeta} label="Player Beta" />
        </div>
      </div>
    </div>
  )
}
