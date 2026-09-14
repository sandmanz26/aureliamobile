import { Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAudioPlayer } from '../../audio/AudioPlayerContext'
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
 */
export function MiniPlayer() {
  const { track, playing, elapsed, duration, toggle } = useAudioPlayer()
  if (!track) return null

  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0

  return (
    /* h-68 is the frame's, held rather than left to the content: PhotoCircle
       renders a ring around its size, so letting the row set the height made
       the card 76. */
    <div className="relative h-68 overflow-hidden rounded-[20px] bg-surface-default shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center gap-12 px-16 pb-4">
        <Link to={`/play/${track.slug}`} state={{ origin: 'own' }} className="u-press shrink-0">
          <PhotoCircle photo={track.photo} size={32} gradient={track.gradient} alt="" />
        </Link>

        <Link to={`/play/${track.slug}`} state={{ origin: 'own' }} className="min-w-0 flex-1">
          <p className="text-style-body truncate text-text-primary">{track.title}</p>
          <p className="text-style-label truncate font-normal! text-text-secondary">{track.author}</p>
        </Link>

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
