import { useEffect, useState } from 'react'

/**
 * The one real, user-facing feature flag in this app.
 *
 * Everything in `/__demo` decides what a *walkthrough* shows — a presenter's
 * switch, published for an audience that never touches the console
 * themselves. This is the opposite kind of thing: a visitor's own opt-in to
 * an experimental screen, off by default, flipped from their own Settings,
 * remembered on their own device. It has no business going through
 * `/api/config` — a beta someone turned on for themselves must not become
 * everyone's default the next time someone presses Publish.
 */
const KEY = 'aurelia.playerBeta'

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

function write(value: boolean) {
  try {
    window.localStorage.setItem(KEY, String(value))
  } catch {
    // Private mode, or storage blocked — the choice holds for this tab's
    // lifetime and no longer, same as every other local-only preference here.
  }
}

export function usePlayerBeta(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState(read)

  // A second tab flipping the switch should not leave this one out of step —
  // the same reasoning FeatureFlags gives its own storage listener.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === KEY) setEnabled(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function set(next: boolean) {
    write(next)
    setEnabled(next)
  }

  return [enabled, set]
}

/** Rewrites a `/play/...` URL to its `/player-beta/...` counterpart when the
 *  beta is on. Used by every place in the app that links to the player, so
 *  turning the switch on redirects existing links rather than requiring two
 *  copies of each one. */
export function playerHref(href: string, betaEnabled: boolean): string {
  return betaEnabled ? href.replace(/^\/play\//, '/player-beta/') : href
}
