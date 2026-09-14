import { Check, MicOff, RotateCcw, Trash2, Volume2, VolumeX } from 'lucide-react'
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
  const [speaker, setSpeaker] = useState(true)
  const [muted, setMuted] = useState(false)
  const startedAt = useRef(Date.now())

  // Timer + animated levels. A real build feeds these from an AnalyserNode;
  // the shape of the component does not change when that is swapped in.
  useEffect(() => {
    if (phase !== 'recording' || muted) return
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - startedAt.current)
      setLevels((current) => [...current.slice(1), 0.25 + Math.random() * 0.75])
    }, 110)
    return () => window.clearInterval(timer)
  }, [phase, muted])

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
      <div className="u-pop flex flex-col gap-12 px-20 pb-16 pt-8">
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
  const live = !busy && !muted

  return (
    <div className="relative flex flex-col items-center gap-20 px-20 pb-24 pt-48">
      {/* The warm wash is the whole signal that the mic is open — it rises off
          the bottom edge rather than sitting in a box, so the screen itself
          changes state rather than growing a control panel. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,216,107,0) 0%, rgba(255,216,107,0.35) 55%, rgba(255,203,71,0.75) 100%)',
        }}
      />

      <p className="text-style-body-small relative text-text-secondary" role="status">
        {busy ? 'Transcribing…' : muted ? 'Paused' : 'Listening..'}
      </p>

      <div className="relative flex w-full items-center justify-between gap-12">
        <div className="flex items-center gap-12">
          <button
            type="button"
            aria-label={speaker ? 'Mute Aurelia’s voice' : 'Unmute Aurelia’s voice'}
            aria-pressed={!speaker}
            onClick={() => setSpeaker((value) => !value)}
            className="u-press flex size-64 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
          >
            {speaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          <button
            type="button"
            aria-label={muted ? 'Unmute your microphone' : 'Mute your microphone'}
            aria-pressed={muted}
            onClick={() => setMuted((value) => !value)}
            className={`u-press flex size-64 items-center justify-center rounded-full shadow-sm ${
              muted ? 'bg-icon-strong text-icon-inverse' : 'bg-surface-default text-icon-strong'
            }`}
          >
            <MicOff size={22} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPhase('transcribing')}
          disabled={busy}
          className="text-style-body u-press flex h-64 items-center gap-12 rounded-full bg-surface-default px-28 text-text-primary shadow-sm disabled:opacity-50"
        >
          {/* The bars keep moving while the mic is open: without them the
              screen says it is listening and shows nothing that is. */}
          <span className="flex h-16 items-end gap-[2px]" aria-hidden="true">
            {levels.slice(-5).map((level, index) => (
              <span
                key={index}
                className="w-[3px] rounded-full bg-icon-strong transition-[height] duration-100"
                style={{ height: `${(live ? level : 0.2) * 100}%`, opacity: live ? 0.9 : 0.4 }}
              />
            ))}
          </span>
          Stop
        </button>
      </div>

      {/* The way out, without ending up with a clip you did not want. */}
      <button
        type="button"
        onClick={onCancel}
        className="text-style-caption relative text-text-secondary underline-offset-2 hover:underline"
      >
        Cancel
      </button>
    </div>
  )
}
