import { ChevronRight, GitBranch, Shuffle, X } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { SessionRecord } from '../../lib/sessions'
import { SESSIONS } from '../../lib/sessions'
import type { LineageStep } from '../../lib/sessionHistory'
import { lineageSteps, recentRecreations } from '../../lib/sessionHistory'
import { isPublished } from '../../lib/sessions'
import { PhotoCircle } from './PhotoCircle'

/** Rows shown on the card before See All. */
const CARD_ROWS = 3

/**
 * A lineage step that is a real catalogue session opens that session's page.
 * Most intermediate steps ("Ground floor", "Deep blue, slower") exist only as
 * names in someone's lineage, so they are not links — before U037 every row
 * opened the player of the session you were already looking at, whatever row
 * you pressed.
 */
function stepHref(step: LineageStep, session: SessionRecord) {
  if (step.self) return undefined
  const match = SESSIONS.find((s) => s.title === step.title && s.slug !== session.slug)
  return match ? `/session/${match.slug}` : undefined
}

/** A fork step — Figma "Highlight/Assessment" (16523:19712), plus the version
 *  the step was built from (U037), so a creator can see which cut of theirs
 *  people actually rebuild. */
function LineageRow({ step, last, session }: { step: LineageStep; last: boolean; session: SessionRecord }) {
  const href = stepHref(step, session)
  const body = (
    <>
      <PhotoCircle photo={step.self ? session.authorPhoto : 'avatar'} size={35} gradient={session.gradient} />
      <span className="flex min-w-0 flex-1 flex-col gap-4">
        <span className="flex min-w-0 items-center gap-6">
          <span className="text-style-label-regular truncate text-text-primary">{step.title}</span>
          {step.self && (
            <span className="shrink-0 rounded-full bg-[#FFF1DB] px-6 py-1 text-[10px] leading-[14px] text-text-strong">This session</span>
          )}
        </span>
        <span className="text-style-caption truncate text-text-secondary">
          Created by {step.author}, {step.date}
        </span>
        {step.builtOn ? (
          <span className="flex min-w-0 items-center gap-4 text-[11px] leading-[14px] text-text-brand">
            <GitBranch size={11} className="shrink-0" />
            <span className="truncate">Built on {step.builtOn}</span>
          </span>
        ) : (
          <span className="text-[11px] leading-[14px] text-text-secondary">Original template</span>
        )}
      </span>
      {href && <ChevronRight size={16} className="shrink-0 text-icon-strong" />}
    </>
  )
  const cls = `flex items-center gap-10 py-8`
  return (
    <Fragment>
      {href ? (
        <Link to={href} className={`u-press ${cls}`}>
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
      {!last && <span aria-hidden="true" className="h-px shrink-0 bg-border-subtle" />}
    </Fragment>
  )
}

/** The whole tree: where it came from, and who has rebuilt it since. */
export function LineageSheet({ session, onClose }: { session: SessionRecord; onClose: () => void }) {
  const steps = lineageSteps(session)
  const recreations = recentRecreations(session)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40 lg:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lineage-title"
        className="u-sheet flex max-h-[85dvh] w-full max-w-[402px] flex-col overflow-y-auto rounded-t-24 bg-surface-default px-20 pb-[calc(24px+env(safe-area-inset-bottom))] pt-24 lg:max-w-[520px] lg:rounded-24"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-16">
          <div className="min-w-0">
            <h2 id="lineage-title" className="text-style-title text-text-primary">Lineage</h2>
            <p className="text-style-body-small truncate text-text-secondary">{session.title}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="u-press -m-8 p-8 text-icon-default">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-style-label mt-20 text-text-secondary">Where it came from</h3>
        <div className="mt-8 flex flex-col">
          {steps.map((step, i) => (
            <LineageRow key={`${step.title}-${i}`} step={step} last={i === steps.length - 1} session={session} />
          ))}
        </div>

        <h3 className="text-style-label mt-24 flex items-center gap-6 text-text-secondary">
          <Shuffle size={13} /> Rebuilt from this session
        </h3>
        {isPublished(session) ? (
          <>
            <p className="text-style-body-small mt-4 text-text-primary">
              Recreated <span className="font-medium">{session.recreated}</span> times. Most recent:
            </p>
            <div className="mt-8 flex flex-col">
              {recreations.map((r, i) => (
                <Fragment key={r.title}>
                  <div className="flex items-center gap-10 py-8">
                    <PhotoCircle photo={r.photo} size={35} gradient={session.gradient} />
                    <span className="flex min-w-0 flex-1 flex-col gap-4">
                      <span className="text-style-label-regular truncate text-text-primary">{r.title}</span>
                      <span className="text-style-caption truncate text-text-secondary">
                        By {r.author}, {r.date}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-background-elevated px-8 py-2 text-[11px] text-text-secondary">
                      from {r.builtOn}
                    </span>
                  </div>
                  {i < recreations.length - 1 && <span aria-hidden="true" className="h-px bg-border-subtle" />}
                </Fragment>
              ))}
            </div>
          </>
        ) : (
          <p className="text-style-body-small mt-4 text-text-secondary">
            Not published yet, so nobody can rebuild it. Publish to let others recreate their own version.
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}

/**
 * The "Details" card's Lineage Tree — shared by `SessionDetailPage` and
 * `PlayerPage` so the two can't drift the way `TagRow` once did when each
 * page kept its own copy of a shared chip.
 *
 * U037: each step names the version it was built from; the header says how
 * many times the session has been rebuilt; See All opens the whole tree
 * (ancestry + recent rebuilds) instead of being a dead button.
 */
export function LineageTreeCard({ session }: { session: SessionRecord }) {
  const [open, setOpen] = useState(false)
  const steps = lineageSteps(session)
  // The newest steps are the relevant ones — this session and what it was
  // built from — so a long chain keeps its tail on the card.
  const shown = steps.slice(-CARD_ROWS)
  const published = isPublished(session)

  return (
    <div className="mt-12 flex flex-col gap-16 rounded-[20px] bg-surface-default p-20 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <div className="flex items-baseline justify-between gap-12">
        <h3 className="text-style-body-small text-text-primary">Lineage Tree</h3>
        {published && (
          <span className="text-style-caption flex items-center gap-4 text-text-secondary">
            <Shuffle size={11} /> Recreated {session.recreated}×
          </span>
        )}
      </div>
      <div className="flex flex-col">
        {shown.map((step, index) => (
          <LineageRow key={`${step.title}-${index}`} step={step} last={index === shown.length - 1} session={session} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-style-label-regular u-press w-fit font-medium text-text-brand"
      >
        See All
      </button>
      {open && <LineageSheet session={session} onClose={() => setOpen(false)} />}
    </div>
  )
}
