import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { dayKey, entryFor, readDaily } from '../../lib/dailyCheckIn'
import { readJourney } from '../../lib/journey'
import { findSession } from '../../lib/sessions'
import { RELEASES } from '../../versions/releases'
import { DailyCheckInSheet } from './DailyCheckInSheet'

/** Screens where the sheet would interrupt something: signing in, onboarding, the admin, the documents, the console. */
const HOLD = /^\/(login|signup|forgot-password|reset-password|welcome|admin|guide|__demo)/

/**
 * Opens the daily check-in after every sign-in (U068). The demo does not keep
 * sign-in, so "every sign-in" is every visit; while it is a demo the sheet
 * comes back even when today is answered, with the answers filled in (J079).
 * It waits out onboarding and the sign-in screens, then opens on the first
 * ordinary screen.
 */
export function DailyCheckInGate() {
  const { signedIn } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [today] = useState(() => dayKey(new Date()))
  // A sign-in is the moment signedIn turns true: remember it until it can be
  // shown (React's "adjust state when a prop changes" pattern, no effect).
  const [seen, setSeen] = useState(signedIn)
  const [pending, setPending] = useState(false)
  if (signedIn !== seen) {
    setSeen(signedIn)
    setPending(signedIn)
  }

  if (!RELEASES.dailyCheckIn || !pending || HOLD.test(pathname)) return null
  return <DailyCheckInSheet date={today} initial={entryFor(readDaily(), today)} onDone={() => setPending(false)} onClose={() => setPending(false)} onOpenJournal={() => {
    setPending(false)
    // The Journal is a tab of the session's About page (Figma 16906:5450): the
    // person's own journey session if there is one, else the session they
    // are most likely to have played, the catalogue's first.
    const slug = findSession(readJourney()?.slug ?? '')?.slug ?? 'inner-frequency'
    navigate(`/progress/${slug}?tab=journal`)
  }} />
}
