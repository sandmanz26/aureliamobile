import { useState } from 'react'
import { Check, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** What the plan is worth, said as the product would say it. */
const BENEFITS = [
  {
    title: 'More AI sessions',
    body: 'Create more sessions and keep exploring your wellness journey without hitting your current limit.',
  },
  {
    title: 'More room to explore',
    body: 'Keep creating, reflecting, and discovering with Aurelia AI.',
  },
  // Requested by Daniel: the value here is publicity, not a feature — a
  // published session getting picked up for the community to regenerate is
  // the thing worth naming, not the mechanism behind it.
  {
    title: 'Priority placement in Explore',
    body: 'Your sessions get prioritized in Explore for the community to regenerate — so you earn more publicity and recognition.',
  },
]

/** Annual is the same plan billed yearly, at two months off. */
const PRICES = {
  monthly: { amount: '$10', per: '/ month' },
  annual: { amount: '$100', per: '/ year' },
} as const

/**
 * Figma "Free Limit" — the paywall the cockpit's Upgrade button opens.
 *
 * A full screen rather than a sheet: it is the only thing being asked, and a
 * sheet over a thread you have just been stopped from using would keep the
 * dead composer in view behind it.
 *
 * It closes with an X and no other chrome — no back arrow, no menu. Nothing
 * here leads anywhere except back to what you were doing.
 */
export function UpgradePage() {
  const navigate = useNavigate()
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const price = PRICES[cycle]

  return (
    <div
      className="relative flex min-h-[calc(100vh-54px)] flex-col lg:min-h-screen"
      /* The warm wash is the only decoration, and it sits under the card
         rather than behind the copy — the page argues in words, not colour. */
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF6E9 62%, #FFD9A3 100%)' }}
    >
      <div className="flex justify-end px-20 pt-12 lg:px-24">
        <button
          type="button"
          aria-label="Close"
          onClick={() => navigate(-1)}
          className="u-press flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[402px] flex-col px-20 pb-40 lg:max-w-[560px] lg:px-24">
        <h1 className="mt-16 text-center text-[28px] leading-[36px] text-text-primary">
          Upgrade for more access to <span className="text-[#FF881B]">Aurelia AI</span>
        </h1>
        <p className="mt-12 text-center text-[14px] font-light leading-[21px] text-[#525252]">
          Save more with annual billing!
        </p>

        {/* Segmented, not two buttons: they are one choice with two positions,
            and the pill that moves says which one you are on. */}
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="mx-auto mt-24 flex rounded-full bg-surface-default/70 p-4"
        >
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={cycle === option}
              onClick={() => setCycle(option)}
              className={`u-press flex h-36 w-[92px] items-center justify-center rounded-full text-[14px] leading-[19px] capitalize transition-colors ${
                cycle === option ? 'bg-surface-default text-text-primary shadow-sm' : 'text-text-secondary'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <section className="mt-24 rounded-[20px] border border-[#FFD9A3] bg-surface-default p-20 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] leading-[16px] text-[#FF881B]">Recommended</p>
          <h2 className="mt-4 text-[20px] leading-[28px] text-text-primary">Aurelia AI Plus</h2>
          <p className="mt-8 text-[14px] font-light leading-[21px] text-[#525252]">
            More access to AI-powered sessions, insights, and personalized wellness support.
          </p>

          <p className="mt-16 flex items-baseline gap-6">
            <span className="text-[28px] leading-[34px] text-text-primary">{price.amount}</span>
            <span className="text-[14px] font-light leading-[19px] text-[#525252]">{price.per}</span>
          </p>

          <button
            type="button"
            className="u-press mt-20 flex h-52 w-full items-center justify-center rounded-full bg-interactive-primary text-[16px] leading-[19px] text-text-inverse"
          >
            Get Aurelia AI Plus
          </button>

          <span aria-hidden="true" className="mt-20 block h-px w-full bg-[#F0F0F0]" />

          <p className="mt-20 flex items-center gap-8 text-[16px] leading-[24px] text-text-primary">
            <Sparkles size={18} className="text-[#FF881B]" />
            Aurelia AI
          </p>

          <ul className="mt-16 flex flex-col gap-16">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex gap-8">
                <Check size={18} className="mt-3 shrink-0 text-text-primary" strokeWidth={2.5} />
                <div className="flex min-w-0 flex-col gap-4">
                  <p className="text-[14px] leading-[19px] text-text-primary">{benefit.title}</p>
                  <p className="text-[12px] font-light leading-[18px] text-[#525252]">{benefit.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
