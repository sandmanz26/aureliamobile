import { Fragment, useState } from 'react'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CoinMark } from '../components/ui/CoinPill'
import { CREDIT_HISTORY, INVITE_LINK, INVITE_REWARD, TOTAL_CREDITS } from '../lib/credits'

/** The card shadow every surface in this design shares (Figma effect 16520:822). */
const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'

/**
 * Figma "Profile/Credits" (16658:29260) — where the coin balance goes.
 *
 * The balance is drawn on nine screens and, until now, led nowhere from any of
 * them; `/credits` was a placeholder saying the screen was not built. It is the
 * third frame of the `Profile` section (16659:41283), which also carries
 * Profile and Profile/Settings — and the prototype proves the link: the coin
 * pill in the Settings header transitions to this frame.
 *
 * Three cards on a 20 gutter, 20 apart, 24 top and bottom, each radius 20 with
 * the shared shadow. No coin pill in this header — the frame hides its own
 * Trailing, which is right: the balance is the subject of the screen, so
 * repeating it in the chrome would state it twice.
 */
export function CreditsPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(INVITE_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard is permission-gated and blocked outright in some embeds.
      // Selecting the field is the fallback the user can act on.
      const field = document.getElementById('invite-link') as HTMLInputElement | null
      field?.select()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      {/* 20 across, 12 down, 20 between the back button and the title. */}
      <header className="u-sticky-top flex items-center gap-20 px-20 py-12 lg:px-24">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className={`u-press flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-default ${CARD_SHADOW}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-style-title-large-regular flex-1 truncate text-text-primary">Credits</h1>
      </header>

      <div className="mx-auto flex w-full max-w-[402px] flex-col gap-20 px-20 pb-24 pt-24 lg:max-w-[720px] lg:px-24">
        {/* Total — 64 tall, the label growing and the figure held right. */}
        <div className={`flex items-center gap-12 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}>
          <p className="text-style-body flex-1 text-text-primary">Total Credits</p>
          <span className="flex items-center gap-12">
            <CoinMark size={32} />
            {/* 24 Medium in the frame. The library has no 24 Medium style — it
                has Title Large at Semibold and Title Large Regular — so this is
                written out rather than bent onto the nearest one. */}
            <span className="text-[24px] font-medium leading-[28px] text-text-primary">{TOTAL_CREDITS}</span>
          </span>
        </div>

        {/* Invite — the only thing on this screen that earns credits. */}
        <div className={`flex flex-col gap-20 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}>
          <div className="flex flex-col gap-8">
            <h2 className="text-style-body text-text-primary">Invite Friends, Get Credits!</h2>
            <p className="text-[14px] font-light leading-[21px] text-[#525252]">
              Share the link below with a friend. When they sign up, you both get {INVITE_REWARD} credits!
            </p>
          </div>

          {/* The frame draws this as a pill with a *gradient* hairline — the
              same brand gradient as the coin, at half a pixel. A border cannot
              take a gradient, so it is a padded gradient background with the
              white field inset over it. */}
          <div
            className="rounded-full p-[1px] shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
            style={{ background: 'linear-gradient(135deg, #ff8514, #ffe270)' }}
          >
            <div className="flex h-42 items-center gap-14 rounded-full bg-surface-default pl-16 pr-12">
              <input
                id="invite-link"
                readOnly
                value={INVITE_LINK}
                aria-label="Your referral link"
                className="min-w-0 flex-1 truncate bg-transparent text-[14px] font-light leading-[19px] text-[#626262] outline-none"
              />
              <button
                type="button"
                onClick={copy}
                aria-label={copied ? 'Link copied' : 'Copy referral link'}
                className="u-press u-tap shrink-0 text-icon-default"
              >
                {copied ? <Check size={16} className="text-feedback-success" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* History — the card grows to the list rather than scrolling inside it. */}
        <div className={`flex flex-col gap-20 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}>
          <div className="flex flex-col gap-8">
            <h2 className="text-style-body text-text-primary">History</h2>
            {CREDIT_HISTORY.map((entry, index) => (
              <Fragment key={entry.id}>
                {index > 0 && <span aria-hidden="true" className="h-px w-full bg-[#F0F0F0]" />}
                <div className="flex flex-col gap-8 py-8">
                  <div className="flex items-center gap-7">
                    {/* Underlined and Regular where the rest of the line is
                        Light — the frame marks the person as the subject of the
                        sentence rather than giving them a colour. */}
                    <p className="min-w-0 flex-1 text-[14px] font-light leading-[19px] text-text-primary">
                      <span className="font-normal underline">{entry.who}</span> {entry.what}
                    </p>
                    <span className="shrink-0 text-[14px] font-light leading-[18px] text-text-secondary">
                      {entry.age}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CoinMark size={20} />
                    <span className="text-[14px] leading-[18px] text-text-primary">+{entry.amount}</span>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
