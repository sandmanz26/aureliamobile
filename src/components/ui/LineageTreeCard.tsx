import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { SessionRecord } from '../../lib/sessions'
import { lineageDate } from '../../lib/sessions'
import { PhotoCircle } from './PhotoCircle'

/** A fork step — the same row Progress's own Lineage Tree draws (Figma
 *  "Highlight/Assessment", 16523:19712), so the two never read differently.
 *
 *  Opens the player, not this session's own detail page again — a step's
 *  own catalogue entry isn't modelled (only its title/author/note are), so
 *  the one thing every row can actually do is play the session whose
 *  lineage you are looking at (Figma 16698:8196). */
function LineageRow({
  step,
  index,
  last,
  session,
}: {
  step: SessionRecord['lineage'][number]
  index: number
  last: boolean
  session: SessionRecord
}) {
  return (
    <Fragment>
      <Link
        to={`/play/${session.slug}`}
        className={`u-press flex items-center gap-10 ${index === 0 ? 'pb-8' : last ? 'pt-8' : 'py-8'}`}
      >
        <PhotoCircle photo={last ? session.authorPhoto : 'avatar'} size={35} gradient={session.gradient} />
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="text-style-label-regular truncate text-text-primary">{step.title}</span>
          <span className="text-style-caption truncate text-text-secondary">
            Created by {step.author}, {lineageDate(index)}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-icon-strong" />
      </Link>
      {!last && <span aria-hidden="true" className="h-px shrink-0 bg-border-subtle" />}
    </Fragment>
  )
}

/**
 * The "Details" card's Lineage Tree — shared by `SessionDetailPage` and
 * `PlayerPage` so the two can't drift the way `TagRow` once did when each
 * page kept its own copy of a shared chip.
 */
export function LineageTreeCard({ session }: { session: SessionRecord }) {
  return (
    <div className="mt-12 flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <h3 className="text-style-body-small text-text-primary">Lineage Tree</h3>
      <div className="flex flex-col gap-8">
        {session.lineage.map((step, index) => (
          <LineageRow
            key={step.title}
            step={step}
            index={index}
            last={index === session.lineage.length - 1}
            session={session}
          />
        ))}
      </div>
      <button type="button" className="text-style-label-regular u-press w-fit text-text-secondary">
        See All ({session.lineage.length})
      </button>
    </div>
  )
}
