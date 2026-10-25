import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { NotFoundPage } from '../pages/NotFoundPage'
import { useAuth } from './AuthContext'

/**
 * Wraps a route a visitor cannot use yet.
 *
 * Two ways to arrive signed out, two answers (U049):
 * - **Forced** — the address typed, pasted, bookmarked or reloaded (React
 *   Router's first entry has the key "default"). The page answers like a 404:
 *   it does not confirm what is behind a signed-in address to someone who
 *   is not signed in. It still offers Sign in, which brings them back here.
 * - **From inside the app** — a link or button. That is someone using the
 *   product, so they go straight to sign-in and return to what they were
 *   opening, as before.
 *
 * Sign-in does not persist yet (AuthContext), so reloading a signed-in page
 * also lands on the 404; its Sign in button returns to the same page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth()
  const location = useLocation()

  if (signedIn) return <>{children}</>
  if (location.key === 'default') return <NotFoundPage reason="signed-out" />
  return <Navigate to="/login" replace state={{ from: location }} />
}
