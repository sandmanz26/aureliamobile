import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, ChevronUp, CircleDollarSign, LogOut, Plus, User, UserX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GoogleMark } from './auth/AuthShell'
import { useAuth } from '../auth/AuthContext'
import { CoinPill } from '../components/ui/CoinPill'

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

/**
 * "Are you sure?" — Account Deletion had no handler at all, the same gap
 * "New session" and a profile card's controls used to have. There is no
 * backend to delete anything from, so confirming does what deleting an
 * account would have to anyway: end the session. Cancel and the backdrop
 * both back out without touching it.
 */
function DeleteAccountDialog({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="u-fade fixed inset-0 z-50 flex items-center justify-center bg-icon-strong/20 px-20"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[362px] flex-col items-center gap-16 rounded-24 bg-surface-default px-24 py-32 text-center"
      >
        {/* A filled badge, not lucide's outline glyph — the frame draws a solid
            coral triangle with a white mark inside, not a stroke icon. */}
        <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            className="fill-danger-300"
          />
          <rect x="11" y="9" width="2" height="6" rx="1" fill="white" />
          <circle cx="12" cy="17.5" r="1" fill="white" />
        </svg>
        <h2 className="text-style-title text-text-primary">Are you sure?</h2>
        <p className="text-style-body-small text-text-secondary">
          Deleting your account will permanently remove your account and data. You won&rsquo;t be able to sign in
          again. Are you sure you want to continue?
        </p>
        <div className="mt-8 flex w-full gap-12">
          <button
            type="button"
            onClick={onClose}
            className="u-press flex h-47 flex-1 items-center justify-center rounded-full border border-[#D6D6D6] text-style-body text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="u-press flex h-47 flex-1 items-center justify-center rounded-full bg-feedback-error text-style-body font-medium text-text-inverse"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  /**
   * Leaves the account, from either door.
   *
   * `navigate` first, `signOut` after: this screen is behind `RequireAuth`,
   * and calling them in the other order — or even in the same tick — let
   * `signOut`'s re-render land while the route was still `/settings`, so
   * `RequireAuth` saw a signed-out user on a guarded page and threw the
   * departure to `/login` out from under it. Measured: the navigate to
   * `/home` was landing and then being overwritten ~20ms later. Not a
   * one-off — Log Out had the same bug, silently, since the screen shipped.
   */
  function endSession() {
    navigate('/home')
    setTimeout(signOut, 50)
  }

  function deleteAccount() {
    setConfirmingDelete(false)
    endSession()
  }

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
        <Row
          icon={<UserX size={24} />}
          label="Account Deletion"
          tone="danger"
          onClick={() => setConfirmingDelete(true)}
        />
        <Row icon={<LogOut size={24} />} label="Log Out" onClick={endSession} />
      </div>

      {confirmingDelete && (
        <DeleteAccountDialog onConfirm={deleteAccount} onClose={() => setConfirmingDelete(false)} />
      )}
    </div>
  )
}
