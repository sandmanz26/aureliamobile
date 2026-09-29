import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

/**
 * The catch-all route. Before this existed, an unmatched path rendered
 * nothing — React Router has no route to pick, so the outlet was empty —
 * and `vercel.json` rewrites every path to `index.html` with a 200, so a
 * dead link looked like a blank page that loaded successfully rather than a
 * 404. `noindex` here matters for exactly that reason: without it, every
 * mistyped or removed URL would be a soft-404 a crawler could index.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background-default px-24 text-center">
      <PageMeta title="Page not found" />
      <meta name="robots" content="noindex" />
      <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-icon-default">
        <SearchX size={24} />
      </span>
      <div className="flex flex-col gap-8">
        <h1 className="text-style-title text-text-primary">Page not found</h1>
        <p className="text-style-body-small max-w-[320px] text-text-secondary">
          The link may be old, or the address was mistyped. Nothing here was lost.
        </p>
      </div>
      <Link
        to="/home"
        className="u-press mt-8 inline-flex items-center justify-center gap-8 rounded-full bg-button-primary-background px-24 py-14 text-style-body font-semibold text-button-primary-foreground hover:bg-button-primary-background-pressed"
      >
        Back to Home
      </Link>
    </div>
  )
}
