/**
 * Per-page `<title>` and meta description, without a Helmet-style library.
 *
 * React 19 hoists any `<title>`, `<meta>` or `<link>` rendered anywhere in
 * the tree into `<head>` itself, and cleans it up on unmount — this just
 * gives that a typed, one-line call site. Render it once near the top of a
 * page component; the tab title and the meta description update as soon as
 * that page mounts, and revert when it unmounts.
 *
 * This only reaches clients that execute JavaScript. A crawler that reads
 * raw HTML (most social-preview bots, and search crawlers that skip
 * rendering) still only sees `index.html`'s static title and description —
 * fixing that needs server rendering or prerendering, which is a bigger
 * decision than this component. See `index.html` for the static fallback
 * and `robots.txt` for why nothing here is meant to be indexed yet.
 */
export function PageMeta({ title, description }: { title: string; description?: string }) {
  return (
    <>
      {/* A single interpolated string, not `{title} · Aurelia` (two JSX
          children) — React only hoists a `<title>` whose child is one
          string. Two children rendered fine in the tree but left
          `document.title` untouched, silently. */}
      <title>{`${title} · Aurelia`}</title>
      {description && <meta name="description" content={description} />}
    </>
  )
}
