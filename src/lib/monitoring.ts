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
}
