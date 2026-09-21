import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAudioPlayer } from '../../audio/AudioPlayerContext'
import { playerHref, usePlayerBeta } from '../../lib/playerBeta'
import { PhotoCircle } from '../ui/PhotoCircle'

/**
 * Figma "Chat: Play" (16523:18533) — the session that is running, parked in
 * the cockpit header: 362x68, radius 20, on the shared card shadow.
 *
 * It exists so that starting a session is not a decision to leave the
 * conversation. Tapping it goes back to the full player; the transport stays
 * here so it can be paused without going anywhere.
 *
 * Renders nothing when there is no session loaded, which is what keeps it out
 * of the header until the first play.
 *
 * **The sound switch is not in the frame.** It is here because silence is
 * global and this is where you are when you notice you need it: the card is on
 * screen precisely when a session is running and you are doing something else.
 * Reachable only from the full player, the switch would be two taps away at
 * the moment it is wanted, and — worse — a muted session playing here would
 * have nothing on it to say why it is silent.
 */
export function MiniPlayer() {
  const { track, playing, elapsed, duration, muted, toggle, toggleMuted } = useAudioPlayer()
  const [betaEnabled] = usePlayerBeta()
  if (!track) return null

  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0
  // Opted in from Settings, this bar opens the swipeable version card instead
  // of the plain player — the same track, a different door.
  const href = playerHref(track.href, betaEnabled)

  return (
    /* h-68 is the frame's, held rather than left to the content: PhotoCircle
       renders a ring around its size, so letting the row set the height made
       the card 76. */
    <div className="relative h-68 overflow-hidden rounded-[20px] bg-surface-default shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center gap-12 px-16 pb-4">
        <Link to={href} state={{ origin: 'own' }} className="u-press shrink-0">
          <PhotoCircle photo={track.photo} size={32} gradient={track.gradient} alt="" />
        </Link>

        <Link to={href} state={{ origin: 'own' }} className="min-w-0 flex-1">
          <p className="text-style-body truncate text-text-primary">{track.title}</p>
          <p className="text-style-label truncate font-normal! text-text-secondary">{track.author}</p>
        </Link>

        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={muted}
          className="u-press flex size-32 shrink-0 items-center justify-center text-icon-default"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className="u-press flex size-32 shrink-0 items-center justify-center text-[#ff881b]"
        >
          {playing ? (
            <Pause size={20} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={20} fill="currentColor" strokeWidth={0} />
          )}
        </button>
      </div>

      {/* Flush to the card's bottom edge and clipped by its radius, so the bar
          is the card's own base rather than a rule sitting above it. */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[#ff881b]/15">
        <div
          className="h-full rounded-r-full"
          style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #ff881b, #ffc500)' }}
        />
      </div>
    </div>
  )
}
