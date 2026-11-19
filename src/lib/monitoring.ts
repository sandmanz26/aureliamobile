import { readString, writeString } from './storage'
/**
 * Error reporting — the seam for a real service.
 *
 * Today there is nothing to report to, so errors go to the console (dev
 * builds log everything; production logs once per distinct message so a loop
 * cannot flood the console). When Sentry or an equivalent is chosen, it is
 * initialised in `installErrorReporting` and `reportError` forwards to it —
 * no caller changes.
 *
 * Never put user content in `context`: no message text, no field values.
 * Screen names and ids are fine.
 */
export interface ErrorContext {
  /** Where it happened: "ErrorBoundary", "query:config", "chat.send". */
  source: string
  [key: string]: string | number | boolean | undefined
}

const seen = new Set<string>()

export function reportError(error: unknown, context: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error)
  if (!import.meta.env.DEV) {
    const key = `${context.source}:${message}`
    if (seen.has(key)) return
    seen.add(key)
  }
  console.error(`[${context.source}]`, error, context)
}

/**
 * A lazy route's file from an older build that is gone after a deploy (J145).
 * The page was loaded before the deploy, so it asks for a hashed chunk the new
 * deployment does not have; the fix is to load the new build, not an error.
 */
export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk \S+ failed/i.test(message)
}

const RELOAD_KEY = 'aurelia.staleChunkReload'

/** Reloads once for a new build; returns false if it just did, so a real error is not hidden by a loop. */
export function reloadForNewBuild(now = Date.now()): boolean {
  const last = Number(readString(RELOAD_KEY, 'session') ?? 0)
  if (now - last < 30_000) return false
  writeString(RELOAD_KEY, String(now), 'session')
  window.location.reload()
  return true
}

let installed = false

/** Catch what no boundary can: errors in handlers, timers and unhandled promises. */
export function installErrorReporting(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, { source: 'window.error' })
  })
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { source: 'unhandledrejection' })
  })
  // Vite's own signal that a lazy chunk failed to load: after a deploy, load the new build.
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault()
  })
}
