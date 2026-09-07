import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * For controls that sit on an open page but need an account behind them — the
 * "Ask Aurelia" field, the CTAs, a community card.
 *
 * Returns a guard: give it what should happen for a signed-in user, and it
 * either runs it or sends the visitor to sign in first, remembering where they
 * were so they come back to the same screen.
 */
export function useSignInGate() {
  const { signedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (action?: () => void) => {
      if (!signedIn) {
        navigate('/login', { state: { from: location } })
        return false
      }
      action?.()
      return true
    },
    [signedIn, navigate, location],
  )
}
