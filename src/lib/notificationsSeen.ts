import { useEffect, useState } from 'react'
import { NOTIFICATIONS } from './notifications'

/**
 * Has the user opened Notifications since today's items arrived?
 *
 * There is no backend, so "unread" is modelled locally: the feed counts as
 * unread while it has any `today` items and this browser hasn't opened
 * /notifications yet. Opening the page marks it seen (localStorage), which
 * flips the drawer bell from its active to its plain icon. Assumption made
 * for U024 — a real build drives this from the feed's read state.
 */
const KEY = 'aurelia.notifications.seen'
const EVENT = 'aurelia:notifications-seen'

function seen() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function useHasUnreadNotifications() {
  const [unread, setUnread] = useState(() => NOTIFICATIONS.some((n) => n.bucket === 'today') && !seen())
  useEffect(() => {
    const sync = () => setUnread(NOTIFICATIONS.some((n) => n.bucket === 'today') && !seen())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return unread
}

export function markNotificationsSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* private mode: stays unread for this tab */
  }
  window.dispatchEvent(new Event(EVENT))
}
