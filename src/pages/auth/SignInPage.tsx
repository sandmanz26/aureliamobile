import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AureliaLogo } from '../../components/ui/AureliaLogo'
import { CoverImage } from '../../components/ui/CoverImage'
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
    <div className="flex min-h-full flex-col bg-background-default lg:items-center lg:justify-center lg:bg-background-elevated lg:py-48">
      <div className="relative h-dvh w-full max-w-[402px] overflow-hidden lg:aspect-[402/874] lg:h-auto lg:max-h-[874px] lg:w-[402px] lg:rounded-24 lg:shadow-xl">
        <CoverImage
          photo="affirmations"
          gradient="linear-gradient(160deg, var(--color-warning-600), var(--color-gold-300))"
          width={800}
          height={1600}
          scrim={false}
          className="absolute inset-0"
        />

        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/home')}
          className="u-press absolute left-16 top-16 z-10 flex size-44 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
        </button>
        {/* pointer-events-none: this spans the full width to center the mark,
            and without it the empty part of that strip sits over the back
            button (both at top-16) and swallows its clicks. */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center">
          <AureliaLogo inverse />
        </div>

        {/* Figma's "Body": the bottom 480/874 (54.92%) of the frame, fading
            from transparent at its own top to solid by its own midpoint. */}
        <div className="absolute inset-x-0 bottom-0 flex h-[54.92%] flex-col overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, var(--color-background-default) 50%, var(--color-background-default) 100%)',
            }}
          />
          <div className="relative flex flex-1 flex-col px-24 pb-24 pt-16">
            <h1 className="text-style-title-large text-text-primary">Welcome to Aurelia.</h1>

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

            <p className="text-style-caption mt-auto pt-24 text-center text-text-secondary">
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
    </div>
  )
}
