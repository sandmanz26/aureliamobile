import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface VoiceMessageProps {
  durationMs: number
  /** What was said — shown under the player, the way messaging apps do it. */
  transcript: string
}

// A stable pseudo-waveform per clip: derived from the duration, so the same
// message draws the same bars on every render instead of dancing on each keystroke.
function waveform(durationMs: number, bars = 26) {
  let seed = Math.max(1, Math.round(durationMs / 37))
  return Array.from({ length: bars }, () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return 0.25 + (seed % 1000) / 1000 * 0.75
  })
}

function formatDuration(ms: number) {
  const total = Math.max(1, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * A sent voice note: scrubbing bar, duration, and the transcript underneath.
 *
 * Playback here is a timer against the recorded duration — there is no audio
 * file behind a mocked recording. Swapping in an <audio> element later means
 * replacing `progress` with its currentTime; nothing else about the bubble changes.
 */
export function VoiceMessage({ durationMs, transcript }: VoiceMessageProps) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const bars = useRef(waveform(durationMs))

  useEffect(() => {
    if (!playing) return
    const step = 60 / durationMs
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value + step >= 1) {
          setPlaying(false)
          return 0
        }
        return value + step
      })
    }, 60)
    return () => window.clearInterval(timer)
  }, [playing, durationMs])

  const played = playing || progress > 0 ? progress : 0

  return (
    <div className="flex max-w-[283px] flex-col gap-8 rounded-16 bg-brand-default px-14 py-10 text-text-strong">
      <div className="flex items-center gap-10">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? 'Pause voice message' : 'Play voice message'}
          className="flex size-32 shrink-0 items-center justify-center rounded-full bg-icon-strong text-icon-inverse"
        >
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <span className="flex h-24 flex-1 items-center gap-[2px]" aria-hidden="true">
          {bars.current.map((level, index) => (
            <span
              key={index}
              className="w-[2px] rounded-full bg-icon-strong"
              style={{ height: `${level * 100}%`, opacity: index / bars.current.length <= played ? 0.95 : 0.35 }}
            />
          ))}
        </span>
        <span className="text-style-caption shrink-0 tabular-nums">{formatDuration(durationMs)}</span>
      </div>
      <p className="text-style-body-small border-t border-black/10 pt-8">{transcript}</p>
    </div>
  )
}
