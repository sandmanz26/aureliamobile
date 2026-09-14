/**
 * The coin balance, as one object.
 *
 * It was drawn in four places and three of them agreed — the profile had a
 * plain yellow dot where every other screen had the ringed coin. A currency
 * that looks different depending on which screen you are on does not read as
 * one currency.
 */
export function CoinPill({ points, className = '' }: { points: string; className?: string }) {
  return (
    <div className={`flex h-44 shrink-0 items-center gap-8 rounded-full bg-surface-default px-16 ${className}`}>
      <span
        className="flex size-20 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
      >
        <span className="size-8 rounded-full border-2 border-text-inverse" />
      </span>
      <span className="text-style-body-small text-text-primary">{points}</span>
    </div>
  )
}
