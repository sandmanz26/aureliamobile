import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { CoverKey } from '../lib/photos'

export interface Track {
  /**
   * Identity, not a route. A cut of a session — a version, or a draft playing
   * under its own name — is its own recording and needs its own key, or
   * loading it would find the session already on the deck and keep playing
   * the wrong one. Use [href] to link back to it.
   */
  slug: string
  /** Where this cut is played. The mini player used to link to `/play/{slug}`,
   *  which for a keyed cut is not a URL that resolves to it. */
  href: string
  title: string
  author: string
  photo: CoverKey
  gradient: string
}

interface AudioValue {
  track: Track | null
  playing: boolean
  elapsed: number
  duration: number
  /** Whether the bed is silenced. A preference, not a property of the track. */
  muted: boolean
  /** Put a session on the deck without starting it. */
  load: (track: Track) => void
  toggle: () => void
  stop: () => void
  /**
   * Move the playhead. Clamped here rather than at every call site, so a skip
   * button can hand it `elapsed + 15` past the end without checking.
   */
  seek: (seconds: number) => void
  toggleMuted: () => void
}

const AudioPlayerContext = createContext<AudioValue | null>(null)

/** The bed every session plays over. Mock, like the catalogue it plays under. */
const BED = '/audio/session-bed.wav'

/** Loud enough to sit under a room, quiet enough not to announce itself. */
const VOLUME = 0.7

/**
 * Silence outlives the visit, unlike everything else here.
 *
 * The rest of this app forgets on reload on purpose — sign-in, the deck, the
 * thread. Mute is the one thing where forgetting is the failure: you turn the
 * sound off because you are somewhere you cannot make noise, and you are still
 * in that room after a refresh. Per-browser and best-effort; a private window
 * or blocked storage just means it starts audible.
 */
const MUTED_KEY = 'aurelia.audio.muted'

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Playback, held above the router.
 *
 * The <audio> element lives here and nowhere else. Owned by the player screen
 * it would be torn down the moment someone walked back to the cockpit, which
 * is the opposite of what a player is for: you start a session in order to
 * carry on doing something else while it runs.
 *
 * In memory rather than storage, like the rest of a visit — a reload is a new
 * silence. Mute is the one exception, and for a reason: see MUTED_KEY.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(10)
  const [muted, setMuted] = useState(readMuted)
  const audio = useRef<HTMLAudioElement>(null)
  const raf = useRef<number | null>(null)

  const load = useCallback((next: Track) => {
    setTrack((current) => {
      // Re-loading the session already on the deck would restart it, and
      // returning to the player mid-session is exactly when that must not
      // happen.
      if (current?.slug === next.slug) return current
      setElapsed(0)
      return next
    })
  }, [])

  const toggle = useCallback(() => {
    const element = audio.current
    if (!element) return
    if (!element.paused) {
      element.pause()
      setPlaying(false)
      return
    }
    element.volume = VOLUME
    void element
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [])

  const stop = useCallback(() => {
    const element = audio.current
    if (element) {
      element.pause()
      element.currentTime = 0
    }
    setPlaying(false)
    setElapsed(0)
    setTrack(null)
  }, [])

  const seek = useCallback(
    (seconds: number) => {
      const next = Math.min(duration, Math.max(0, seconds))
      const element = audio.current
      if (element) element.currentTime = next
      // Set here as well as on the element: paused, nothing is reading the
      // clock, so the bar would not move until the next play.
      setElapsed(next)
    },
    [duration],
  )

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current
      try {
        localStorage.setItem(MUTED_KEY, String(next))
      } catch {
        // A browser that refuses storage still mutes; it just forgets.
      }
      return next
    })
  }, [])

  // Held on the element rather than passed as a prop: React does not reliably
  // reflect `muted` to the DOM on first render, and a muted player that is
  // audible for one press is worse than no mute at all.
  useEffect(() => {
    if (audio.current) audio.current.muted = muted
  }, [muted])

  // A new recording starts at its own beginning. Without this the element kept
  // the playhead from the last one, so opening a fresh session while one was
  // running dropped you seven seconds into it — and the rAF clock below wrote
  // that straight back over the zero load() had just set.
  useEffect(() => {
    if (audio.current) audio.current.currentTime = 0
  }, [track?.slug])

  // One clock, read off the element, so the bar and the mini player cannot
  // drift from each other or from what is audible.
  useEffect(() => {
    if (!playing) return
    const tick = () => {
      const element = audio.current
      if (element) setElapsed(element.currentTime)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [playing])

  const value = useMemo<AudioValue>(
    () => ({ track, playing, elapsed, duration, muted, load, toggle, stop, seek, toggleMuted }),
    [track, playing, elapsed, duration, muted, load, toggle, stop, seek, toggleMuted],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio
        ref={audio}
        src={BED}
        loop
        preload="auto"
        onLoadedMetadata={(event) => {
          const value_ = event.currentTarget.duration
          if (Number.isFinite(value_) && value_ > 0) setDuration(value_)
        }}
      />
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider')
  return context
}
