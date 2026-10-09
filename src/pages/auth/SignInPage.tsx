import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import authHero from '../../assets/auth-hero.png'
import { PageMeta } from '../../components/PageMeta'
import { AureliaLogo } from '../../components/ui/AureliaLogo'
import { AppleMark, GoogleMark } from './AuthShell'

/**
 * The "Welcome to Aurelia." gate (Figma 16698:15285) — a full-bleed photo
 * behind the two social buttons, replacing the email/password form. Sign-in
 * has no real backend to check credentials against, so nothing about the
 * account flow was actually lost: either button calls the same mock
 * `complete()` the old form did.
 *
 * **The photo runs the full height of the card.** Only the bottom 480 of the
 * frame's 874 ("Body" in Figma) carries the white panel, and that panel is
 * itself a gradient — transparent at its own top, solid by its own midpoint
 * — not a flat white box dropped under a fixed-height photo above it. A
 * first pass got this ratio wrong (a short, separately-sized photo box
 * followed by a flat panel) and the whole screen read compressed against the
 * reference even though every individual piece was present.
 *
 * `/signup` and `/forgot-password` have no other link into them anywhere in
 * the app (grepped), so both stay reachable from the small line under the
 * legal text even though the reference doesn't show either — dropping them
 * would strand two working screens, not simplify this one.
 */
export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from

  function complete() {
    signIn()
    navigate(from?.pathname ?? '/home', { replace: true, state: from?.state })
  }

  return (
    <div data-tablet="signin" className="flex min-h-full flex-col bg-background-default lg:min-h-dvh lg:items-center lg:justify-center lg:p-40">
      <PageMeta title="Sign in" description="Sign in to Aurelia to build and play your personalized sessions." />
      {/* Desktop is a split screen, not the phone frame floating in the
          middle of the window: the whole screen is one centred card (thin
          border, soft shadow, max 1040x640) with the photo as an inset
          panel carrying its own headline and the form beside it. All of it is lg: — below that this is the 402-wide
          mobile screen exactly as before. */}
      <div className="relative flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-background-default lg:h-[min(640px,calc(100dvh-80px))] lg:w-[min(1040px,calc(100vw-80px))] lg:max-w-none lg:flex-row lg:rounded-24 lg:border lg:border-black/8 lg:bg-surface-default lg:p-12 lg:shadow-[0_24px_64px_-16px_rgba(27,16,6,0.18)]">
        {/* The photo is the one flexible element on this screen — `flex-1
            min-h-0` lets it shrink all the way to nothing before the form
            below gives up any of its own height. Figma's 661/874 ratio is
            what it gets on a tall screen with room to spare; `object-cover`
            crops instead of squishing on anything shorter, so the sign-in
            buttons and the legal/sign-up line are never the thing that runs
            out of room. */}
        <div className="relative min-h-0 w-full flex-1 lg:h-full lg:w-[440px] lg:flex-none lg:overflow-hidden lg:rounded-16">
          <img src={authHero} alt="" className="size-full object-cover" />
          {/* Figma's "Body" fade (394→634 of an 874 frame) falls at
              59.6%→95.9% of this 661-tall image — transparent, then solid
              by 95.9%, so the rest of the image and the page below both read
              as one continuous white field. */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, transparent 59.6%, var(--color-background-default) 95.9%, var(--color-background-default) 100%)',
            }}
          />
          {/* Desktop only: the panel says what the product is, so the photo
              earns its space instead of being wallpaper. */}
          <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,transparent_35%,rgba(27,16,6,0.75)_100%)] lg:block" />
          <div className="absolute inset-x-32 bottom-32 hidden text-text-inverse lg:block">
            <h2 className="text-style-title-large max-w-[360px] text-balance">Wellness, shaped around how you feel.</h2>
            <p className="text-style-body-small mt-12 max-w-[400px] text-white/80">
              Meditations, soundscapes and breathwork — generated in a conversation, for this moment rather than a playlist.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/home')}
          className="u-press absolute left-16 top-16 z-10 flex size-44 items-center justify-center rounded-12 bg-black/30 text-white backdrop-blur-sm lg:left-28 lg:top-28"
        >
          <ArrowLeft size={20} />
        </button>
        {/* pointer-events-none: this spans the full width to center the mark,
            and without it the empty part of that strip sits over the back
            button (both at top-16) and swallows its clicks. */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center lg:inset-x-auto lg:left-[232px] lg:top-28 lg:-translate-x-1/2">
          <AureliaLogo inverse />
        </div>

        {/* shrink-0: this is the content that actually matters on the
            screen — it always renders at its full natural size, and the
            photo above is what gives up space for it, never the reverse. */}
        <div className="flex shrink-0 flex-col px-24 pb-24 pt-16 lg:flex-1 lg:justify-center lg:items-center lg:px-56 lg:*:w-full lg:*:max-w-[360px] lg:py-48">
          <h1 className="v2-center text-style-title-large text-text-primary">Welcome to Aurelia.</h1>

          <div className="mt-24 flex flex-col gap-12">
            <button
              type="button"
              onClick={complete}
              className="u-press flex h-44 w-full items-center justify-center gap-12 rounded-full border border-button-secondary-border text-style-body-small font-medium text-text-primary"
            >
              <GoogleMark />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={complete}
              className="u-press flex h-44 w-full items-center justify-center gap-12 rounded-full border border-button-secondary-border text-style-body-small font-medium text-text-primary"
            >
              <AppleMark />
              Continue with Apple
            </button>
          </div>

          <p className="text-style-caption mt-auto pt-24 text-center text-text-secondary lg:mt-0">
            By continuing, you agree to Aurelia{' '}
            <span className="font-medium underline">Privacy Policy</span> and{' '}
            <span className="font-medium underline">Terms of Use</span>
          </p>
          <p className="text-style-caption mt-12 text-center text-text-secondary">
            New here?{' '}
            <Link to="/signup" state={location.state} className="u-tap font-medium text-text-brand">
              Create an account
            </Link>{' '}
            ·{' '}
            <Link to="/forgot-password" state={location.state} className="u-tap font-medium text-text-brand">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
