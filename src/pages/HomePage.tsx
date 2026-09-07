import { useAuth } from '../auth/AuthContext'
import { GuestHome } from './home/GuestHome'
import { MemberHome } from './home/MemberHome'

/**
 * One route, two pages. /home is open to everyone, and which one it renders is
 * the only thing signing in changes about the address bar — a visitor who signs
 * in stays exactly where they were and the page fills out around them.
 */
export function HomePage() {
  const { signedIn } = useAuth()
  return signedIn ? <MemberHome /> : <GuestHome />
}
