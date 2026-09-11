import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AureliaLogo } from '../../components/ui/AureliaLogo'
import { useHiddenScrollbars } from '../../hooks/useHiddenScrollbars'
import { MobileStatusBar } from '../../components/ui/MobileStatusBar'

interface AuthShellProps {
  /** Sits where the Sign In / Sign Up tabs do — tabs, or a plain title. */
  header: ReactNode
  /** Where the back arrow goes. */
  backTo: string
  children: ReactNode
}

/**
 * The frame every account screen shares: status bar, back arrow, the header
 * slot, and the mark. Four screens use it, so the chrome is defined once and a
 * change to it cannot leave one of them looking different from the rest.
 */
export function AuthShell({ header, backTo, children }: AuthShellProps) {
  const navigate = useNavigate()
  useHiddenScrollbars()

  return (
    <div className="flex min-h-full flex-col items-center bg-background-default lg:justify-center lg:px-24 lg:py-48">
      <div className="w-full max-w-[402px] lg:mx-auto">
        <div className="sticky top-0 z-40 bg-background-default/80 backdrop-blur-md lg:hidden">
          <MobileStatusBar />
        </div>
        <div className="px-24 pt-16 lg:px-0 lg:pt-0">
          <div className="relative flex h-44 items-center justify-center">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(backTo)}
              className="absolute left-0 flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default"
            >
              <ArrowLeft size={20} />
            </button>
            {header}
          </div>

          <div className="mt-40 flex justify-center">
            <AureliaLogo />
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

/** Shared between Sign In and Sign Up, which are one control in two places. */
export function AuthTabs({ value }: { value: 'Sign In' | 'Sign Up' }) {
  const navigate = useNavigate()
  const options = [
    { label: 'Sign In', to: '/login' },
    { label: 'Sign Up', to: '/signup' },
  ] as const

  return (
    <div className="inline-flex gap-4 rounded-full bg-background-elevated p-4">
      {options.map((option) => {
        const active = option.label === value
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => navigate(option.to)}
            className={`text-style-label rounded-full px-20 py-8 transition-colors ${
              active ? 'bg-surface-default text-text-strong' : 'bg-transparent text-text-secondary'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.32Z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A10 10 0 0 0 10 20Z" />
      <path fill="#FBBC05" d="M4.4 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.34-2.58Z" />
      <path fill="#EA4335" d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96Z" />
    </svg>
  )
}

export function AppleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="text-icon-default">
      <path d="M15.6 10.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.3-.9-2.3-3Z" />
      <path d="M13.6 4.2c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  )
}

/** "Or continue using" rule plus the two social buttons, identical on both forms. */
export function SocialSignIn({ onUse }: { onUse: () => void }) {
  return (
    <>
      <div className="mt-24 flex items-center gap-12">
        <div className="h-1 flex-1 bg-border-subtle" />
        <span className="text-style-body-small">Or continue using</span>
        <div className="h-1 flex-1 bg-border-subtle" />
      </div>

      <div className="mt-24 grid grid-cols-2 gap-12">
        <button
          type="button"
          onClick={onUse}
          aria-label="Continue with Google"
          className="flex h-52 items-center justify-center rounded-full border border-button-secondary-border bg-button-secondary-background transition-colors hover:bg-background-elevated"
        >
          <GoogleMark />
        </button>
        <button
          type="button"
          onClick={onUse}
          aria-label="Continue with Apple"
          className="flex h-52 items-center justify-center rounded-full border border-button-secondary-border bg-button-secondary-background transition-colors hover:bg-background-elevated"
        >
          <AppleMark />
        </button>
      </div>
    </>
  )
}
