import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthShell, AuthTabs, SocialSignIn } from './AuthShell'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  // Where the visitor was headed when they hit the sign-in wall, and whatever
  // that destination needed to know — a chat that should open listening, say.
  const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function complete() {
    signIn()
    navigate(from?.pathname ?? '/home', { replace: true, state: from?.state })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    // Dummy login — no backend yet, so any submit just "signs in" after a beat
    // and returns to whatever the visitor was trying to open.
    window.setTimeout(() => {
      setSubmitting(false)
      complete()
    }, 500)
  }

  return (
    <AuthShell header={<AuthTabs value="Sign In" />} backTo="/home">
      <form className="mt-40 flex flex-col gap-16" onSubmit={handleSubmit}>
        <TextField type="email" placeholder="Email" leadingIcon={<Mail size={20} />} required />
        <TextField
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          leadingIcon={<Lock size={20} />}
          required
          trailing={
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="u-tap flex items-center"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            state={location.state}
            className="u-tap text-style-label text-text-brand"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={submitting} className="mt-8 w-full">
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <SocialSignIn onUse={complete} />

      <p className="text-style-body-small mt-24 text-center text-text-secondary">
        New here?{' '}
        <Link to="/signup" state={location.state} className="u-tap font-medium text-text-brand">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
