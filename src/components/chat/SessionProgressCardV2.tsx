import { GeneratingShape } from './GeneratingShape'
import { RotatingStatus } from './RotatingStatus'
import { CARD_SHADOW } from '../../lib/shadows'

/**
 * Demo option 2 for the generating state — /__demo `chat.generatingV2`.
 *
 * A morphing-shape mark and a status line that rotates through what the
 * build is doing, instead of the static circular thumbnail and single
 * "Creating your new session.." message `SessionProgressCard` shows. Covers
 * only the generating phase: once the build finishes, `ChatPage` switches
 * back to `SessionProgressCard` for the ready state regardless of which
 * option drew the loading — there is no reference yet for what a "finished"
 * option 2 looks like, and the thumbnail-plus-play treatment already works.
 */
export function SessionProgressCardV2({ title }: { title: string }) {
  return (
    <div className={`flex w-full items-center gap-16 rounded-24 bg-surface-default p-16 ${CARD_SHADOW}`}>
      <GeneratingShape size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-style-body-small truncate text-text-primary">{title}</p>
        <RotatingStatus />
      </div>
    </div>
  )
}
