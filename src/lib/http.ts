import type { ZodType } from 'zod'

/**
 * The one way this app talks to its own API.
 *
 * - **Timeouts.** A request that never answers would otherwise hang a spinner
 *   forever; every call has a deadline (10s unless the caller says otherwise)
 *   and is also cancelled by the caller's signal — React Query passes one, so
 *   leaving a screen cancels what it asked for.
 * - **Validation.** The response is checked against a schema before anyone
 *   reads it. A server that changes shape (or a proxy that answers with an HTML
 *   error page) becomes a typed `HttpError`, not an `undefined` three
 *   components later.
 * - **Typed failures.** `HttpError.status` is 0 for network/timeout failures,
 *   the HTTP status otherwise, so retry logic can tell "offline" from "bad
 *   request" (see `queryClient.ts`).
 *
 * When the AI backend arrives, its endpoints go through this too; streaming
 * responses will need their own reader, but the timeout, cancellation and
 * error type stay the same.
 */
export class HttpError extends Error {
  readonly status: number
  readonly url: string

  constructor(message: string, status: number, url: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'HttpError'
    this.status = status
    this.url = url
  }

  /** Worth trying again: offline, timed out, rate-limited or a server error. Not a 4xx. */
  get retryable() {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500
  }
}

export interface RequestOptions<T> {
  schema: ZodType<T>
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
  /** Survive the page being closed (analytics flushes). */
  keepalive?: boolean
}

const DEFAULT_TIMEOUT_MS = 10_000

/** `AbortSignal.timeout`/`any` are recent (Safari 16 / 17.4); fall back on older phones. */
function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  const controller = new AbortController()
  setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), ms)
  return controller.signal
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals)
  const controller = new AbortController()
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason)
      break
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true })
  }
  return controller.signal
}

export async function requestJson<T>(url: string, options: RequestOptions<T>): Promise<T> {
  const { schema, method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, keepalive } = options
  const deadline = timeoutSignal(timeoutMs)
  const combined = signal ? anySignal([signal, deadline]) : deadline

  let response: Response
  try {
    response = await fetch(url, {
      method,
      cache: 'no-store',
      signal: combined,
      keepalive,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    // The caller cancelled: rethrow untouched so React Query treats it as a cancellation.
    if (signal?.aborted) throw error
    const timedOut = deadline.aborted
    throw new HttpError(timedOut ? `Timed out after ${timeoutMs}ms` : 'Network error', 0, url, { cause: error })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    throw new HttpError(`Expected JSON (HTTP ${response.status})`, response.status || 0, url, { cause: error })
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `HTTP ${response.status}`
    throw new HttpError(message, response.status, url)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new HttpError(`Unexpected response shape from ${url}`, response.status, url, { cause: parsed.error })
  }
  return parsed.data
}
