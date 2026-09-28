/** A shimmering placeholder block. Sizing and shape come from `className`. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`u-shimmer rounded-8 ${className}`} />
}
