import { CalendarCheck, ChevronRight, History, Lock, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SessionRecord } from '../../lib/sessions'
import { isOwnSession, publishInfo, versionHistory } from '../../lib/sessionHistory'
import { LineageTreeCard } from './LineageTreeCard'

const CARD = 'mt-12 rounded-[20px] bg-surface-default p-20 shadow-[0_4px_14px_rgba(0,0,0,0.08)]'

/** When it went public, and which cut is live (U037). */
function PublishCard({ session }: { session: SessionRecord }) {
  const info = publishInfo(session)
  if (!info) {
    return (
      <div className={`${CARD} flex items-start gap-12`}>
        <Lock size={16} className="mt-2 shrink-0 text-icon-default" />
        <div>
          <p className="text-style-body-small text-text-primary">Not published</p>
          <p className="text-style-caption mt-2 text-text-secondary">A draft — only you can play it until you publish.</p>
        </div>
      </div>
    )
  }
  const rows = [
    ['Published', info.publishedOn],
    ['Last updated', info.updatedOn],
    ['Live version', info.liveVersion],
  ]
  return (
    <div className={CARD}>
      <p className="text-style-body-small flex items-center gap-8 text-text-primary">
        <CalendarCheck size={16} className="text-icon-default" /> Publishing
      </p>
      <dl className="mt-12 grid grid-cols-3 gap-8">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-style-caption text-text-secondary">{label}</dt>
            <dd className="text-style-body-small mt-2 truncate tabular-nums text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * The creator's own view of their cuts (U037): which one listeners get (Live)
 * and which one is playing now, newest first. Only on sessions you made —
 * a listener has no use for someone else's drafts of a session.
 */
function VersionHistoryCard({ session, playingId, playBase }: { session: SessionRecord; playingId?: string | null; playBase?: string }) {
  const history = versionHistory(session)
  const playing = playingId && history.some((v) => v.id === playingId) ? playingId : (history.find((v) => v.live) ?? history[0]).id

  return (
    <div className={CARD}>
      <div className="flex items-baseline justify-between gap-12">
        <p className="text-style-body-small flex items-center gap-8 text-text-primary">
          <History size={16} className="text-icon-default" /> Version history
        </p>
        <span className="text-style-caption text-text-secondary">{history.length} versions</span>
      </div>
      <ol className="mt-12 flex flex-col">
        {history.map((v, i) => {
          const isPlaying = v.id === playing
          return (
            <li key={v.id} className="relative flex gap-12 pb-12 last:pb-0">
              {/* The rail: a timeline, newest at the top. */}
              {i < history.length - 1 && (
                <span aria-hidden="true" className="absolute left-[7px] top-18 h-[calc(100%-14px)] w-px bg-border-subtle" />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-4 size-15 shrink-0 rounded-full border-2 ${
                  isPlaying ? 'border-[#FF881B] bg-[#FF881B]' : v.live ? 'border-[#FF881B] bg-surface-default' : 'border-border-subtle bg-surface-default'
                }`}
              />
              <Link
                to={`${playBase ?? `/play/${session.slug}`}?v=${v.id}`}
                replace={!!playBase}
                state={{ origin: 'own' }}
                className="u-press flex min-w-0 flex-1 items-start justify-between gap-8"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-6">
                    <span className="text-style-body-small font-medium text-text-primary">{v.label}</span>
                    {v.live && <span className="rounded-full bg-[#ECFBED] px-6 py-1 text-[10px] leading-[14px] text-success-600">Live</span>}
                    {isPlaying && (
                      <span className="flex items-center gap-2 rounded-full bg-[#FFF1DB] px-6 py-1 text-[10px] leading-[14px] text-text-strong">
                        <Play size={8} fill="currentColor" strokeWidth={0} /> You are here
                      </span>
                    )}
                  </span>
                  <span className="text-style-caption mt-2 block truncate text-text-secondary">
                    {v.change} · {v.date}
                  </span>
                </span>
                <ChevronRight size={16} className="mt-2 shrink-0 text-icon-strong" />
              </Link>
            </li>
          )
        })}
      </ol>
      <Link to={`/progress/${session.slug}?tab=chapters`} className="text-style-label-regular mt-12 inline-block font-medium text-text-brand">
        Manage versions
      </Link>
    </div>
  )
}

/**
 * The "Details" section under a session (player sheet and detail page):
 * publishing facts, the creator's version history, and the lineage.
 */
export function SessionDetails({
  session,
  playingId,
  playBase,
}: {
  session: SessionRecord
  /** The `?v=` the player is on, if any. */
  playingId?: string | null
  /** Set on the player so choosing a version replaces the URL in place. */
  playBase?: string
}) {
  return (
    <>
      <PublishCard session={session} />
      {isOwnSession(session) && <VersionHistoryCard session={session} playingId={playingId} playBase={playBase} />}
      <LineageTreeCard session={session} />
    </>
  )
}
