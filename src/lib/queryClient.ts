import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query'
import { HttpError } from './http'
import { reportError } from './monitoring'

/**
 * Server-state cache for the whole app (TanStack Query).
 *
 * Everything fetched from `/api/*` goes through a query or a mutation, so it
 * is cached, de-duplicated (two components asking for the same thing make one
 * request), cancelled when nobody needs it, and retried sensibly. This is the
 * layer the AI backend plugs into: sessions, conversations, builds and
 * analyses become query keys rather than state copied into components.
 *
 * Defaults, and why:
 * - `staleTime` 30s — the demo's data changes rarely; screens should not
 *   refetch on every mount. Live data (flags) sets its own poll.
 * - Retries only what can succeed on a second try (`HttpError.retryable`),
 *   at most twice with backoff; a 400 is never retried.
 * - No refetch on window focus by default: an AI conversation must not jump
 *   because someone switched tabs. Opt in per query where it helps.
 * - Errors are reported once, centrally, rather than per component.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2) return false
  return error instanceof HttpError ? error.retryable : false
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // A query whose failure is an expected state (no endpoint locally, the
      // local-only fallback) opts out with `meta: { reportErrors: false }`.
      onError: (error, query) => {
        if (query.meta?.reportErrors === false) return
        reportError(error, { source: `query:${String(query.queryKey[0])}` })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) =>
        reportError(error, { source: `mutation:${String(mutation.options.mutationKey?.[0] ?? 'anonymous')}` }),
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
