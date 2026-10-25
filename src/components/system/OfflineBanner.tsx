import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOnlineStatus } from '../../lib/useOnlineStatus'

/**
 * Says so when there is no connection (U049). The app keeps working — every
 * screen and the mock data are cached by the service worker — so this is a
 * note, not a blocker: what will not happen offline is new cover photos,
 * syncing flags/notes/insights to other browsers, and (later) anything that
 * asks the AI. When the connection returns it says "Back online" briefly.
 *
 * Nothing renders while online, so the frozen layout is untouched in the
 * normal case. Portalled, and offset by the staging bar.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)
  const [showBack, setShowBack] = useState(false)

  // Remember an outage while rendering, so the "Back online" note can follow it.
  if (!online && !wasOffline) setWasOffline(true)
  if (online && wasOffline) {
    setWasOffline(false)
    setShowBack(true)
  }

  useEffect(() => {
    if (!showBack) return
    const timer = window.setTimeout(() => setShowBack(false), 2500)
    return () => window.clearTimeout(timer)
  }, [showBack])

  if (online && !showBack) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      data-insights-ignore=""
      className="pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-16"
      style={{ top: 'calc(var(--staging-bar, 0px) + 8px)' }}
    >
      <p
        className={`u-fade flex items-center gap-8 rounded-full px-14 py-8 text-[13px] leading-[18px] shadow-[0_5px_24px_4px_rgba(0,0,0,0.08)] ${
          online ? 'bg-[#ECFBED] text-success-600' : 'bg-[#331B04] text-white'
        }`}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online ? 'Back online' : 'You’re offline — saved screens still work'}
      </p>
    </div>,
    document.body,
  )
}
