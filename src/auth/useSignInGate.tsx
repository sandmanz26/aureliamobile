import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * For controls that sit on an open page but need an account behind them — the
 * "Ask Aurelia" field, the CTAs, a community card.
 *
 * Give it where the tap was aiming and it either goes there, or sends the
 * visitor to sign in with that destination remembered so they land on it
 * afterwards rather than back on Home.
 *
 * Called with no destination it only reports whether the user is signed in,
 * which is what a control that does its own navigating needs — a card whose
 * <Link> should be cancelled, say.
 */
export function useSignInGate() {
  const { signedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (destination?: string, state?: unknown) => {
      if (!signedIn) {
        navigate('/login', {
          state: { from: destination ? { pathname: destination, state } : location },
        })
        return false
      }
      if (destination) navigate(destination, { state })
      return true
    },
    [signedIn, navigate, location],
  )
}
