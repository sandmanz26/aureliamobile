import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Wraps a route a visitor cannot use yet. The attempted location travels with
 * the redirect, so signing in returns them to what they were trying to open
 * rather than dumping them back on Home.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth()
  const location = useLocation()

  if (!signedIn) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}
