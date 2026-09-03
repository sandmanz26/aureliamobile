import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { Button } from '../components/ui/Button'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { TextField } from '../components/ui/TextField'

const TABS = ['Sign In', 'Sign Up'] as const

export function SignInPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Sign In')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    // TODO: wire up to real auth once a backend exists.
    window.setTimeout(() => setSubmitting(false), 600)
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-background-default px-24 py-48">
      <div className="w-full max-w-[402px]">
        <div className="relative flex h-44 items-center justify-center">
          <button
            type="button"
            aria-label="Back"
            className="absolute left-0 flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default"
          >
            <ArrowLeft size={20} />
          </button>
          <SegmentedControl options={TABS} value={tab} onChange={(v) => setTab(v as (typeof TABS)[number])} />
        </div>

        <div className="mt-40 flex justify-center">
          <AureliaLogo />
        </div>

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
                className="flex items-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <div className="flex justify-end">
            <button type="button" className="text-style-label text-text-brand">
              Forgot Password?
            </button>
          </div>

          <Button type="submit" variant="primary" disabled={submitting} className="mt-8 w-full">
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-24 flex items-center gap-12">
          <div className="h-1 flex-1 bg-border-subtle" />
          <span className="text-style-body-small">Or continue using</span>
          <div className="h-1 flex-1 bg-border-subtle" />
        </div>

        <div className="mt-24 grid grid-cols-2 gap-12">
          <Button variant="secondary" className="w-full">
            <GoogleMark />
          </Button>
          <Button variant="secondary" className="w-full">
            <AppleMark />
          </Button>
        </div>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.32Z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A10 10 0 0 0 10 20Z" />
      <path fill="#FBBC05" d="M4.4 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.34-2.58Z" />
      <path fill="#EA4335" d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96Z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="text-icon-default">
      <path d="M15.6 10.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.3-.9-2.3-3Z" />
      <path d="M13.6 4.2c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  )
}
