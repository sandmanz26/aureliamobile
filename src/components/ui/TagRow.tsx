/**
 * Topic hashtags, wrapped, with the overflow folded into one "+N" chip
 * rather than letting a long list wrap the row indefinitely.
 *
 * Pulled out of `SessionDetailPage` (its original home) so `WellnessPage`
 * doesn't redeclare the same component with a different `max` — the second
 * copy is exactly how `CARD_SHADOW` ended up duplicated four times.
 */
export function TagRow({ tags, max = 6 }: { tags: string[]; max?: number }) {
  const shown = tags.slice(0, max)
  const overflow = tags.length - shown.length
  return (
    <div className="flex flex-wrap gap-8">
      {shown.map((tag) => (
        <span key={tag} className="text-style-body-small rounded-full bg-[#1E3A8A] px-12 py-6 text-[#BFDBFE]">
          #{tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-style-body-small rounded-full bg-[#1E3A8A] px-12 py-6 text-[#BFDBFE]">+{overflow}</span>
      )}
    </div>
  )
}
