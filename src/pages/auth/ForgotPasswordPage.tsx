import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthPhotoHeader } from './AuthShell'

/**
 * Password reset, request step.
 *
 * The confirmation deliberately does not say whether the address exists — the
 * same message either way. Telling an anonymous visitor "no account with that
 * email" hands them a way to test whether any address is registered, and for a
 * wellness app that leaks something people would rather not have leaked.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 600)
  }

  if (sent) {
    return (
      <div className="flex min-h-full flex-col bg-background-default lg:items-center lg:justify-center lg:bg-background-elevated lg:py-48">
        <div className="flex h-dvh w-full max-w-[402px] flex-col overflow-hidden lg:h-auto lg:max-h-[874px] lg:rounded-24 lg:border lg:border-border-subtle lg:shadow-xl">
          <AuthPhotoHeader backTo="/login" />
          <div className="min-h-0 flex-1 overflow-y-auto px-24 pb-24 pt-20">
            <h1 className="text-style-title-large text-text-primary">Check your inbox.</h1>
            <div className="mt-24 flex flex-col items-center gap-16 text-center">
              <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-icon-default">
                <MailCheck size={26} />
              </span>
              <p className="text-style-body text-text-primary">
                If an account exists for <span className="font-medium">{email || 'that address'}</span>, a reset link
                is on its way.
              </p>
              <p className="text-style-body-small text-text-secondary">
                The link works once and expires in 30 minutes. Check your spam folder before asking for another.
              </p>

              {/* Demo affordance: there is no mail server, so the reset step is
                  reachable directly. A real build only gets here from the email. */}
              <Button variant="primary" className="mt-8 w-full" onClick={() => navigate('/reset-password')}>
                Open the reset link
              </Button>

              <button
                type="button"
                onClick={() => setSent(false)}
                className="u-tap text-style-body-small text-text-brand"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-background-default lg:items-center lg:justify-center lg:bg-background-elevated lg:py-48">
      <div className="flex h-dvh w-full max-w-[402px] flex-col overflow-hidden lg:h-auto lg:max-h-[874px] lg:rounded-24 lg:border lg:border-border-subtle lg:shadow-xl">
        <AuthPhotoHeader backTo="/login" />
        <div className="min-h-0 flex-1 overflow-y-auto px-24 pb-24 pt-20">
          <h1 className="text-style-title-large text-text-primary">Forgot password.</h1>
          <form className="mt-24 flex flex-col gap-16" onSubmit={handleSubmit}>
            <p className="text-style-body-small text-text-secondary">
              Enter the email you signed up with and we’ll send a link to set a new password.
            </p>
            <TextField
              type="email"
              placeholder="Email"
              autoComplete="email"
              leadingIcon={<Mail size={20} />}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" variant="primary" disabled={submitting} className="mt-8 w-full">
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <Link
            to="/login"
            className="u-tap text-style-body-small mt-24 flex items-center justify-center gap-8 text-text-secondary"
          >
            <ArrowLeft size={15} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
