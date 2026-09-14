import { Lock } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AureliaLogo } from './ui/AureliaLogo'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { SITE_LOCK_FLAG } from '../demo/modules'
import { SITE_PASSWORD, hasUnlocked, rememberUnlock } from '../demo/siteLock'

/** The presenter console is exempt — see the note in [SiteLock]. */
const EXEMPT = '/__demo'

/**
 * A shared password in front of the site.
 *
 * What it is for: unfinished work invites feedback on things that are already
 * known and already scheduled, and that feedback costs more to answer than it
 * is worth. What it is not: security. See `demo/siteLock.ts`.
 *
 * The presenter console at /__demo is deliberately outside the lock, so the
 * console that owns the switch is always reachable and nobody can shut
 * themselves out of it. The cost is real and worth stating: anyone who knows
 * that URL can open the
 * console and turn the lock off. It is one more reason this is a courtesy and
 * not a control — but it does mean the lock stops people who wander in, not
 * people who have been told where to look.
 */
export function SiteLock({ children }: { children: React.ReactNode }) {
  const { isEnabled } = useFeatureFlags()
  const { pathname } = useLocation()
  // Read once, so unlocking re-renders through state rather than through a
  // storage read on every parent render.
  const [unlocked, setUnlocked] = useState(hasUnlocked)

  const exempt = pathname.replace(/\/+$/, '') === EXEMPT
  if (exempt || !isEnabled(SITE_LOCK_FLAG) || unlocked) return <>{children}</>

  return <LockScreen onUnlock={() => setUnlocked(true)} />
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (value.trim() !== SITE_PASSWORD) {
      setWrong(true)
      return
    }
    rememberUnlock()
    onUnlock()
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-20 py-40"
      style={{ background: 'linear-gradient(180deg, #FFFDF6 0%, #FFF1DB 55%, #FFF9EF 100%)' }}
    >
      <main className="flex w-full max-w-[402px] flex-col items-center text-center">
        <AureliaLogo iconSize={56} markOnly />

        <h1 className="text-style-title-large mt-24 text-text-primary">Aurelia is still being built</h1>
        <p className="text-style-body mt-8 text-text-secondary">
          This is a private preview. If you were given a password, it goes below.
        </p>

        <form onSubmit={submit} className="mt-32 flex w-full flex-col gap-12">
          <label htmlFor="site-password" className="sr-only">
            Preview password
          </label>
          <div
            className={`flex h-56 items-center gap-12 rounded-full border bg-surface-default px-20 ${
              wrong ? 'border-feedback-error' : 'border-border-default'
            }`}
          >
            <Lock size={18} className="shrink-0 text-icon-secondary" />
            <input
              id="site-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setWrong(false)
              }}
              placeholder="Password"
              aria-invalid={wrong}
              aria-describedby={wrong ? 'site-password-error' : undefined}
              className="text-style-body min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>

          {/* Kept in the layout either way, so the button does not jump when
              the message appears. */}
          <p
            id="site-password-error"
            role="alert"
            className={`text-style-body-small min-h-20 text-feedback-error ${wrong ? '' : 'invisible'}`}
          >
            That is not the password.
          </p>

          <button
            type="submit"
            disabled={!value.trim()}
            className="text-style-body u-press h-52 w-full rounded-full bg-button-primary-background font-semibold text-button-primary-foreground disabled:opacity-40"
          >
            Enter
          </button>
        </form>

        <p className="text-style-caption mt-32 text-text-secondary">
          Nothing here is final, and the data is invented.
        </p>
      </main>
    </div>
  )
}
