import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, RotateCcw, X } from 'lucide-react'
import type { DraftVersion } from '../../chat/ChatSessionContext'

/**
 * Every cut this thread has made, and a way back to any of them.
 *
 * The thread already records what was *asked* for, but a transcript does not
 * play: ask for a female voice, hear it, and want the one from before, and
 * there was nothing to go back to. This is that list — each version named as
 * the progress card named it, with the request that produced it underneath.
 *
 * Reverting moves the pointer rather than deleting what came after. Losing
 * three cuts because you wanted to hear the second one again is a worse
 * surprise than a history that keeps growing.
 */

/** "4 min ago" reads better than a clock time in a list of things that
 *  happened minutes apart. */
function ago(at: number) {
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} d ago`
}

interface VersionHistorySheetProps {
  versions: DraftVersion[]
  currentId: string | null
  /** The newest one is still being made, so it is not somewhere to go back to
   *  yet — and saying so is more use than hiding it. */
  building: boolean
  progress: number
  onRevert: (id: string) => void
  onClose: () => void
}

export function VersionHistorySheet({
  versions,
  currentId,
  building,
  progress,
  onRevert,
  onClose,
}: VersionHistorySheetProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Newest first: the one you want is almost always the one before this one.
  const rows = [...versions].reverse()

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        className="u-sheet flex max-h-[80dvh] w-full max-w-[402px] flex-col rounded-t-24 bg-surface-default px-20 pb-24 pt-24 lg:max-w-[560px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-16">
          <div>
            <h2 className="text-style-title-large text-text-primary">Version history</h2>
            <p className="text-style-caption mt-2 text-text-secondary">
              {versions.length === 1 ? '1 version' : `${versions.length} versions`} of this session
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="u-press flex size-32 shrink-0 items-center justify-center rounded-full text-icon-default"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-16 flex flex-col gap-8 overflow-y-auto">
          {rows.map((version, index) => {
            // Only the newest can be the one in flight, and only while the
            // build is running.
            const inFlight = building && index === 0
            const current = version.id === currentId && !inFlight
            return (
              <div
                key={version.id}
                className={`flex flex-col gap-8 rounded-16 border p-14 ${
                  current ? 'border-brand-default bg-brand-default/10' : 'border-border-subtle bg-surface-default'
                }`}
              >
                <div className="flex items-start justify-between gap-12">
                  <div className="min-w-0">
                    <p className="text-style-body-small truncate text-text-primary">{version.label}</p>
                    <p className="text-style-caption mt-2 text-text-secondary">
                      {inFlight ? `Creating — ${progress}%` : ago(version.at)}
                    </p>
                  </div>
                  {current && (
                    <span className="text-style-caption flex shrink-0 items-center gap-4 rounded-full bg-brand-default px-8 py-4 text-text-strong">
                      <Check size={12} />
                      Current
                    </span>
                  )}
                </div>

                {/* What was asked for, which is the only thing that tells two
                    versions apart once they are both just a name and a time. */}
                <p className="text-style-caption text-text-secondary">{version.change}</p>

                {!current && !inFlight && (
                  <button
                    type="button"
                    onClick={() => onRevert(version.id)}
                    className="text-style-label u-press flex h-32 w-fit items-center gap-6 rounded-full border border-border-subtle pl-12 pr-14 text-text-primary"
                  >
                    <RotateCcw size={12} className="text-icon-default" />
                    Revert to this version
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
