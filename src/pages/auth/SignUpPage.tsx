import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthShell, AuthTabs, SocialSignIn } from './AuthShell'

/** Weak / fair / strong, from length plus variety. Enough to be honest, not a lecture. */
function strengthOf(password: string) {
  if (!password) return null
  let score = password.length >= 8 ? 1 : 0
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (password.length >= 12) score += 1
  if (score <= 2) return { label: 'Weak', bars: 1, color: 'bg-feedback-error' }
  if (score === 3) return { label: 'Fair', bars: 2, color: 'bg-feedback-warning' }
  return { label: 'Strong', bars: 3, color: 'bg-feedback-success' }
}

export function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = strengthOf(password)
  // Only complain once there is something to complain about — an error next to
  // an empty field is noise, not help.
  const mismatch = confirm.length > 0 && confirm !== password

  function complete() {
    signIn()
    navigate(from?.pathname ?? '/home', { replace: true, state: from?.state })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setError('Those passwords don’t match. Check the second one.')
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    setError(null)
    setSubmitting(true)
    // No backend yet: a valid-looking form creates the account and signs in.
    window.setTimeout(() => {
      setSubmitting(false)
      complete()
    }, 600)
  }

  return (
    <AuthShell header={<AuthTabs value="Sign Up" />} backTo="/home">
      <form className="mt-40 flex flex-col gap-16" onSubmit={handleSubmit}>
        <TextField
          type="text"
          placeholder="Full name"
          autoComplete="name"
          leadingIcon={<User size={20} />}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          type="email"
          placeholder="Email"
          autoComplete="email"
          leadingIcon={<Mail size={20} />}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className="flex flex-col gap-8">
          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="new-password"
            leadingIcon={<Lock size={20} />}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            trailing={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          {strength && (
            <div className="flex items-center gap-8 px-16">
              <span className="flex flex-1 gap-4" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={`h-4 flex-1 rounded-full ${index < strength.bars ? strength.color : 'bg-border-subtle'}`}
                  />
                ))}
              </span>
              <span className="text-style-caption text-text-secondary">{strength.label}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            autoComplete="new-password"
            leadingIcon={<Lock size={20} />}
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {mismatch && <p className="text-style-caption px-16 text-feedback-error">Passwords don’t match yet.</p>}
        </div>

        <button
          type="button"
          onClick={() => setAccepted((v) => !v)}
          aria-pressed={accepted}
          className="flex items-start gap-10 text-left"
        >
          <span
            className={`mt-2 flex size-20 shrink-0 items-center justify-center rounded-4 border ${
              accepted ? 'border-transparent bg-brand-emphasis text-text-inverse' : 'border-border-default'
            }`}
          >
            {accepted && <Check size={13} />}
          </span>
          <span className="text-style-body-small text-text-secondary">
            I agree to the <span className="text-text-brand">Terms</span> and the{' '}
            <span className="text-text-brand">Privacy Policy</span>, including how Aurelia uses my mood, sleep and voice
            data.
          </span>
        </button>

        {error && <p className="text-style-body-small text-feedback-error">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting || !accepted} className="mt-8 w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <SocialSignIn onUse={complete} />

      <p className="text-style-body-small mt-24 text-center text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-medium text-text-brand">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
