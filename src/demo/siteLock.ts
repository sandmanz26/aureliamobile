/**
 * The shared password in front of the whole site.
 *
 * It exists to stop strangers wandering into unfinished work and filing
 * feedback on it — not to protect anything. **This is not security.** The
 * check runs in the browser, the password is inlined into the JavaScript
 * bundle at build time, and anyone willing to open devtools can read it or
 * skip the gate entirely. Never put anything behind it that would matter if
 * it leaked.
 *
 * Set `VITE_SITE_PASSWORD` in the Vercel project (or a local `.env`) to change
 * it without committing it. That keeps it out of the git history; it does not
 * keep it out of the bundle.
 */
export const SITE_PASSWORD =
  import.meta.env.VITE_SITE_PASSWORD?.trim() || 'aurelia-preview'

/** Per-browser, so nobody retypes it on every reload. */
export const UNLOCK_KEY = 'aurelia.site.unlocked'

/**
 * Storage can be unavailable or throw — a private window, blocked site data.
 * A gate that crashes on `localStorage` would lock out the person it is
 * supposed to let in, so every access is guarded and failure means "locked".
 */
export function hasUnlocked(): boolean {
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === SITE_PASSWORD
  } catch {
    return false
  }
}

export function rememberUnlock() {
  try {
    window.localStorage.setItem(UNLOCK_KEY, SITE_PASSWORD)
  } catch {
    // Unlocked for this page view only. Better than refusing to open.
  }
}

export function forgetUnlock() {
  try {
    window.localStorage.removeItem(UNLOCK_KEY)
  } catch {
    // Nothing stored to clear.
  }
}
