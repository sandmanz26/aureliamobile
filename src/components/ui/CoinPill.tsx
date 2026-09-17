import { useSignInGate } from '../../auth/useSignInGate'

/**
 * The coin balance, as one object — and a control, not a label.
 *
 * It was drawn in **thirteen** places. Seven used this component; the other six
 * were hand-rolled copies that had drifted apart from it as well as from each
 * other: 40 tall against 44, a 16 coin against 20, a `Coins` glyph against the
 * ringed dot, Label 12 against Body Small 14. A currency that looks different
 * depending on which screen you are on does not read as one currency.
 *
 * None of the thirteen did anything when tapped. A balance is the most
 * obviously tappable thing in a header — it is a number about *you* — so
 * tapping it and getting nothing reads as a broken app rather than a missing
 * feature. It opens the credits screen now.
 *
 * Gated: what you have and how you spent it is account-shaped, so a visitor is
 * sent to sign in with `/credits` remembered rather than shown an empty ledger.
 */
export function CoinPill({
  points,
  className = '',
  /** Off only where the pill sits inside something already clickable. */
  interactive = true,
}: {
  points: string
  className?: string
  interactive?: boolean
}) {
  const gate = useSignInGate()

  const face = (
    <>
      <span
        className="flex size-20 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
      >
        <span className="size-8 rounded-full border-2 border-text-inverse" />
      </span>
      <span className="text-style-body-small text-text-primary">{points}</span>
    </>
  )

  const shape = `flex h-44 shrink-0 items-center gap-8 rounded-full bg-surface-default px-16 ${className}`

  if (!interactive) return <div className={shape}>{face}</div>

  return (
    <button type="button" onClick={() => gate('/credits')} aria-label={`${points} credits`} className={`u-press ${shape}`}>
      {face}
    </button>
  )
}
