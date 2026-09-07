import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Who is looking at the app.
 *
 * Home is open to everyone — a visitor can read the pitch, see what the
 * community made, and get a feel for the product before handing over an email.
 * The moment they try to *do* something (ask Aurelia, open a session, recreate,
 * press a CTA) they are asked to sign in, and land back where they were headed.
 *
 * There is no backend yet, so "signed in" is a flag in localStorage. Everything
 * that reads it goes through this context, so swapping in a real session token
 * is one file.
 */
interface AuthValue {
  signedIn: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

const STORAGE_KEY = 'aurelia.auth.signedIn'

function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Private mode — the visitor simply starts signed out.
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(readStored)

  const write = useCallback((next: boolean) => {
    setSignedIn(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Non-fatal: the flag still holds for this tab's lifetime.
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ signedIn, signIn: () => write(true), signOut: () => write(false) }),
    [signedIn, write],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
