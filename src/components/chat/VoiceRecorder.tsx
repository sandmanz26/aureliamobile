import { Check, Mic, RotateCcw, Square, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/**
 * Voice capture with a visible result, rather than a state that ends silently.
 *
 * recording → a live waveform and a running timer, so it is obvious the mic is
 * open; stopping transcribes and lands in `review`, where the words are shown
 * and can be sent, re-recorded, or thrown away. Nothing is sent to the thread
 * until the user confirms it — the transcript is a draft, not a fait accompli.
 */
type Phase = 'recording' | 'transcribing' | 'review'

interface VoiceRecorderProps {
  /** Confirmed transcript plus how long the clip ran, so the thread can show both. */
  onSend: (transcript: string, durationMs: number) => void
  onCancel: () => void
}

// Stands in for speech-to-text until a real service is wired up.
const SAMPLE_TRANSCRIPT =
  'Make it about twenty minutes, a bit slower, and keep the ocean sound underneath the whole way through.'

const BAR_COUNT = 28

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [phase, setPhase] = useState<Phase>('recording')
  const [elapsed, setElapsed] = useState(0)
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0.15))
  const [transcript, setTranscript] = useState('')
  const startedAt = useRef(Date.now())

  // Timer + animated levels. A real build feeds these from an AnalyserNode;
  // the shape of the component does not change when that is swapped in.
  useEffect(() => {
    if (phase !== 'recording') return
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - startedAt.current)
      setLevels((current) => [...current.slice(1), 0.25 + Math.random() * 0.75])
    }, 110)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'transcribing') return
    const timer = window.setTimeout(() => {
      setTranscript(SAMPLE_TRANSCRIPT)
      setPhase('review')
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [phase])

  function restart() {
    startedAt.current = Date.now()
    setElapsed(0)
    setTranscript('')
    setLevels(Array(BAR_COUNT).fill(0.15))
    setPhase('recording')
  }

  if (phase === 'review') {
    return (
      <div className="flex flex-col gap-12 px-20 pb-16 pt-8">
        <div className="flex flex-col gap-8 rounded-16 border border-border-subtle bg-surface-default p-16">
          <div className="flex items-center justify-between">
            <span className="text-style-caption text-text-secondary">Transcript · {formatDuration(elapsed)}</span>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Discard recording"
              className="text-icon-default hover:text-text-primary"
            >
              <Trash2 size={15} />
            </button>
          </div>
          {/* Editable, because transcription is never perfect. */}
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={3}
            className="text-style-body-small w-full resize-none bg-transparent text-text-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={restart}
            className="text-style-body-small flex h-44 items-center gap-8 rounded-full border border-border-subtle px-16 text-text-primary"
          >
            <RotateCcw size={15} />
            Record again
          </button>
          <button
            type="button"
            onClick={() => onSend(transcript.trim(), elapsed)}
            disabled={!transcript.trim()}
            className="text-style-body-small flex h-44 flex-1 items-center justify-center gap-8 rounded-full bg-icon-strong px-16 font-medium text-text-inverse disabled:opacity-40"
          >
            <Check size={16} />
            Send
          </button>
        </div>
      </div>
    )
  }

  const busy = phase === 'transcribing'

  return (
    <div className="relative flex flex-col items-center gap-16 overflow-hidden px-20 pb-24 pt-12">
      <span className="pointer-events-none absolute -bottom-24 left-1/2 size-[241px] -translate-x-1/2 rounded-full bg-brand-default opacity-30 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-16 left-1/2 size-[201px] -translate-x-1/2 rounded-full bg-primary-200 opacity-40 blur-3xl" />

      <div className="relative flex items-center gap-10">
        {!busy && <span className="size-8 animate-pulse rounded-full bg-danger-500" />}
        <p className="text-style-body-small text-text-strong">{busy ? 'Transcribing…' : 'Listening..'}</p>
        <span className="text-style-body-small tabular-nums text-text-secondary">{formatDuration(elapsed)}</span>
      </div>

      {/* Live level meter — the thing that makes it read as actually recording. */}
      <div className="relative flex h-40 items-center gap-[3px]" aria-hidden="true">
        {levels.map((level, index) => (
          <span
            key={index}
            className="w-[3px] rounded-full bg-icon-strong transition-[height] duration-100"
            style={{ height: `${(busy ? 0.2 : level) * 100}%`, opacity: busy ? 0.35 : 0.85 }}
          />
        ))}
      </div>

      <div className="relative flex items-center gap-8">
        <button
          type="button"
          onClick={() => setPhase('transcribing')}
          disabled={busy}
          className="text-style-body-small flex h-56 items-center gap-10 rounded-full bg-surface-default px-18 text-text-primary disabled:opacity-50"
        >
          <Square size={16} fill="currentColor" />
          Stop
        </button>
        <button
          type="button"
          aria-label="Cancel recording"
          onClick={onCancel}
          className="flex h-56 w-57 items-center justify-center rounded-full bg-surface-default text-icon-strong"
        >
          <Mic size={19} />
        </button>
      </div>
    </div>
  )
}
