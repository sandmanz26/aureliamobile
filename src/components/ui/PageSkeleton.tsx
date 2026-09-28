import { Skeleton } from './Skeleton'

/**
 * The `<Suspense>` fallback for a lazily-loaded route. Every consumer page
 * draws its own header (menu circle, title, a pill on the right) before its
 * own body, so this mirrors that shape in outline rather than showing
 * nothing — a generic stand-in, not a per-page recreation. Held under 2s on
 * a warm cache in practice; this only appears at all the first time a route
 * chunk is fetched in a session.
 */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto flex max-w-[960px] flex-col gap-24 px-20 py-16">
      <div className="flex h-44 items-center gap-16">
        <Skeleton className="size-44 shrink-0 rounded-full" />
        <Skeleton className="h-24 w-112 rounded-8" />
        <div className="flex-1" />
        <Skeleton className="h-36 w-72 shrink-0 rounded-full" />
      </div>

      <Skeleton className="h-160 w-full rounded-16" />

      <div className="grid grid-cols-2 gap-12">
        <Skeleton className="aspect-[173/230] w-full rounded-16" />
        <Skeleton className="aspect-[173/230] w-full rounded-16" />
      </div>

      <div className="flex flex-col gap-12">
        <Skeleton className="h-72 w-full rounded-16" />
        <Skeleton className="h-72 w-full rounded-16" />
        <Skeleton className="h-72 w-full rounded-16" />
      </div>
    </div>
  )
}
