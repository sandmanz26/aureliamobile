import { useSyncExternalStore } from 'react'

/**
 * Whether the browser believes it is online. `navigator.onLine` can say
 * "online" on a network with no internet, but it is never wrong the other
 * way: "offline" really is offline. That is the case the UI uses it for.
 */
function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}
