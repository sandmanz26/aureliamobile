import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Who is looking at the app.
 *
 * Home is open to everyone — a visitor can read the pitch, see what the
 * community made, and get a feel for the product before handing over an email.
 * The moment they try to *do* something (ask Aurelia, open a session, recreate,
 * press a CTA) they are asked to sign in, and land back where they were headed.
 *
 * Deliberately not persisted: every visit starts signed out, so the first thing
 * anyone opening the app sees is the case for it, not a session someone left
 * behind. Signing in holds for as long as the page is open — enough to walk the
 * whole product — and a reload returns to the front door.
 *
 * There is no backend yet. When there is one, this is the file that gains a
 * real session token, and persistence becomes the token's lifetime rather than
 * a flag: a returning user should not be signed out by a refresh once their
 * account holds anything worth coming back to.
 */
interface AuthValue {
  signedIn: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false)

  const value = useMemo<AuthValue>(
    () => ({ signedIn, signIn: () => setSignedIn(true), signOut: () => setSignedIn(false) }),
    [signedIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
