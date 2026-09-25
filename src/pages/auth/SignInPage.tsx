import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AureliaLogo } from '../../components/ui/AureliaLogo'
import { CoverImage } from '../../components/ui/CoverImage'
import { AppleMark, GoogleMark } from './AuthShell'

/**
 * The new "Welcome to Aurelia." gate (Figma 16698:15285) — a full-bleed photo
 * over the two social buttons, replacing the email/password form. Sign-in has
 * no real backend to check credentials against, so nothing about the account
 * flow was actually lost: either button calls the same mock `complete()` the
 * old form did.
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
      <div className="relative flex w-full max-w-[402px] flex-1 flex-col overflow-hidden lg:flex-none lg:rounded-24 lg:shadow-xl">
        <div className="relative h-[54vh] min-h-[340px] w-full shrink-0 overflow-hidden lg:h-[420px]">
          <CoverImage
            photo="affirmations"
            gradient="linear-gradient(160deg, var(--color-warning-600), var(--color-gold-300))"
            width={800}
            height={900}
            scrim={false}
          />
          {/* The white panel below starts solid, so the photo only needs to fade
              into it over its own bottom half (Figma's Body gradient stops at
              50% of its 480px) rather than the whole photo. */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-default to-transparent" />
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate('/home')}
            className="u-press absolute left-16 top-16 flex size-44 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute inset-x-0 top-16 flex justify-center">
            <AureliaLogo inverse />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-24 pb-24 pt-16">
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
  )
}
