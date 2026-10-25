import { SearchX } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

/**
 * The 404 page, for two cases:
 *
 * - **missing** — the catch-all route. Before it existed an unmatched path
 *   rendered nothing, and `vercel.json` rewrites every path to `index.html`
 *   with a 200, so a dead link looked like a blank page that loaded fine.
 * - **signed-out** — an address that needs an account, opened directly while
 *   signed out (RequireAuth, U049). Same page, so it neither confirms nor
 *   denies what is there; it adds Sign in, which returns to this address.
 *
 * `noindex` because every one of these is a soft 404 to a crawler.
 */
export function NotFoundPage({ reason = 'missing' }: { reason?: 'missing' | 'signed-out' }) {
  const location = useLocation()
  const signedOut = reason === 'signed-out'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background-default px-24 text-center">
      <PageMeta title="Page not found" />
      <meta name="robots" content="noindex" />
      <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-icon-default">
        <SearchX size={24} />
      </span>
      <div className="flex flex-col gap-8">
        <p className="text-style-label tracking-[0.08em] text-text-secondary">404</p>
        <h1 className="text-style-title text-text-primary">Page not found</h1>
        <p className="text-style-body-small max-w-[320px] text-text-secondary">
          {signedOut
            ? 'This page isn’t available right now. If it’s yours, sign in to open it.'
            : 'The link may be old, or the address was mistyped. Nothing here was lost.'}
        </p>
      </div>
      <div className="mt-8 flex flex-col items-center gap-12">
        {signedOut && (
          <Link
            to="/login"
            state={{ from: { pathname: location.pathname, search: location.search } }}
            className="u-press inline-flex items-center justify-center gap-8 rounded-full bg-button-primary-background px-24 py-14 text-style-body font-semibold text-button-primary-foreground hover:bg-button-primary-background-pressed"
          >
            Sign in
          </Link>
        )}
        <Link
          to="/home"
          className={
            signedOut
              ? 'u-tap text-style-body-small font-medium text-text-primary'
              : 'u-press inline-flex items-center justify-center gap-8 rounded-full bg-button-primary-background px-24 py-14 text-style-body font-semibold text-button-primary-foreground hover:bg-button-primary-background-pressed'
          }
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
