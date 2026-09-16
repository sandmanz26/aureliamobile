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
  /** Put a session on the deck without starting it. */
  load: (track: Track) => void
  toggle: () => void
  stop: () => void
}

const AudioPlayerContext = createContext<AudioValue | null>(null)

/** The bed every session plays over. Mock, like the catalogue it plays under. */
const BED = '/audio/session-bed.wav'

/**
 * Playback, held above the router.
 *
 * The <audio> element lives here and nowhere else. Owned by the player screen
 * it would be torn down the moment someone walked back to the cockpit, which
 * is the opposite of what a player is for: you start a session in order to
 * carry on doing something else while it runs.
 *
 * In memory rather than storage, like the rest of a visit — a reload is a new
 * silence.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(10)
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
    element.volume = 0.7
    void element
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [])

  const stop = useCallback(() => {
    audio.current?.pause()
    setPlaying(false)
    setElapsed(0)
    setTrack(null)
  }, [])

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
    () => ({ track, playing, elapsed, duration, load, toggle, stop }),
    [track, playing, elapsed, duration, load, toggle, stop],
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
