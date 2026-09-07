import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthShell } from './AuthShell'

/**
 * Password reset, second step — what the emailed link opens.
 *
 * The PRD listed the reset form as missing entirely: the "Forgot Password?"
 * link existed with nothing behind it. This closes that, request step included.
 * A real build validates the token in the URL before showing the form and has
 * its own expired/already-used state; here the screen assumes a good token.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mismatch = confirm.length > 0 && confirm !== password

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Those passwords don’t match.')
      return
    }
    setError(null)
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setDone(true)
    }, 600)
  }

  if (done) {
    return (
      <AuthShell header={<h1 className="text-style-title text-text-primary">Password changed</h1>} backTo="/login">
        <div className="mt-40 flex flex-col items-center gap-16 text-center">
          <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-feedback-success">
            <CheckCircle2 size={28} />
          </span>
          <p className="text-style-body text-text-primary">Your password has been updated.</p>
          <p className="text-style-body-small text-text-secondary">
            Any other device signed into this account has been signed out.
          </p>
          <Button
            variant="primary"
            className="mt-8 w-full"
            onClick={() => {
              signIn()
              navigate('/home', { replace: true })
            }}
          >
            Continue to Aurelia
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell header={<h1 className="text-style-title text-text-primary">Set a new password</h1>} backTo="/login">
      <form className="mt-40 flex flex-col gap-16" onSubmit={handleSubmit}>
        <p className="text-style-body-small text-text-secondary">
          Pick something you haven’t used on this account before. At least 8 characters.
        </p>
        <TextField
          type={showPassword ? 'text' : 'password'}
          placeholder="New password"
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
        <div className="flex flex-col gap-8">
          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            autoComplete="new-password"
            leadingIcon={<Lock size={20} />}
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {mismatch && <p className="text-style-caption px-16 text-feedback-error">Passwords don’t match yet.</p>}
        </div>

        {error && <p className="text-style-body-small text-feedback-error">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="mt-8 w-full">
          {submitting ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </AuthShell>
  )
}
