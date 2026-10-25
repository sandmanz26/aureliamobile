import { RefreshCw, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { reportError } from '../../lib/monitoring'

/** Checks for a new build every hour while the app stays open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000

/** The session audio the player loops (AudioPlayerContext). */
const SESSION_AUDIO = '/audio/session-bed.wav'

/**
 * Puts the session audio in the offline cache with one full download, once a
 * worker controls the page. The player's own requests are byte ranges, which
 * are answered from this copy but never create it.
 */
async function warmAudioCache() {
  if (!navigator.serviceWorker?.controller || !('caches' in window)) return
  const cache = await caches.open('session-audio')
  if (await cache.match(SESSION_AUDIO)) return
  await fetch(SESSION_AUDIO)
}

/**
 * Registers the service worker and, when a new build has downloaded, offers
 * it (U049). The new version waits for the tap rather than taking over on its
 * own: an automatic reload mid-session would cut off whatever the person is
 * listening to. "Later" hides the note; the new build then loads on the next
 * visit.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      void warmAudioCache().catch(() => {})
      window.setInterval(() => void registration.update().catch(() => {}), UPDATE_CHECK_MS)
    },
    onRegisterError(error) {
      reportError(error, { source: 'service-worker' })
    },
  })

  if (!needRefresh) return null

  return createPortal(
    <div
      role="status"
      data-insights-ignore=""
      className="fixed inset-x-0 bottom-16 z-[70] flex justify-center px-16 lg:bottom-24"
    >
      <div className="u-fade flex items-center gap-12 rounded-16 bg-[#331B04] py-10 pl-16 pr-8 text-white shadow-[0_5px_24px_4px_rgba(0,0,0,0.15)]">
        <p className="text-[14px] leading-[20px]">A new version of Aurelia is ready</p>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="u-press flex h-32 items-center gap-6 rounded-full bg-white px-12 text-[13px] font-medium text-[#331B04]"
        >
          <RefreshCw size={13} /> Reload
        </button>
        <button
          type="button"
          aria-label="Later"
          onClick={() => setNeedRefresh(false)}
          className="u-press flex size-32 items-center justify-center rounded-full text-white/80"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
