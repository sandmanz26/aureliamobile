import { useState } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Coins,
  Library,
  MoreHorizontal,
  Pencil,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { progressFor } from '../lib/progress'
import type { ProgressTab, Version } from '../lib/progress'
import { findSession } from '../lib/sessions'

/** The card shadow every surface in this design shares (Figma effect 16520:822). */
const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'

const TABS: { id: ProgressTab; label: string; icon: typeof Library }[] = [
  { id: 'chapters', label: 'Chapters', icon: Library },
  { id: 'social', label: 'Social Impact', icon: Users },
  { id: 'insights', label: 'Insights', icon: Sparkles },
]

/** The frame's chips: 35 tall, radius 40, 12/8 padding, 8 to the label, 7 apart. */
function Tab({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof Library
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-35 shrink-0 items-center gap-8 rounded-full border px-12 text-[12px] leading-none transition-colors ${
        active
          ? 'border-text-primary bg-text-primary text-text-inverse'
          : 'border-[#d6d6d6] bg-transparent text-text-primary'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </button>
  )
}

/** A stat tile — 174 tall in the frame, and the figure is the point of it. */
function Stat({
  value,
  label,
  coin = false,
  className = '',
}: {
  value: string
  label: string
  coin?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW} ${className}`}
    >
      {coin && (
        <span
          aria-hidden="true"
          className="mb-12 flex size-48 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
        >
          <Coins size={22} className="text-text-inverse" />
        </span>
      )}
      <p className="text-[28px] leading-[32px] font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="text-style-body-small text-text-secondary">{label}</p>
    </div>
  )
}

/**
 * One cut of the session. The art carries the transport and the figure it
 * moved; the body below opens to the chapter that changed.
 */
function VersionCard({ version, open, onToggle }: { version: Version; open: boolean; onToggle: () => void }) {
  return (
    <article className={`overflow-hidden rounded-[20px] bg-surface-default ${CARD_SHADOW}`}>
      <div className="relative h-120">
        <CoverImage photo={version.photo} gradient={version.gradient} width={724} height={240} scrim={false} />
        {/* The frame darkens the art by a fifth so the two controls on it read
            at any cover. */}
        <span aria-hidden="true" className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-16 top-16 flex items-center justify-between gap-12">
          <span className="flex size-32 items-center justify-center rounded-full bg-white/25 text-text-inverse backdrop-blur-sm">
            <Play size={14} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="flex h-32 items-center gap-4 rounded-full bg-[#ecfbed] px-12 text-[12px] leading-none text-text-primary">
            <ArrowUp size={14} className="text-success-600" />
            {version.delta}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-12 p-16">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-12 text-left"
        >
          <span className="text-style-body text-text-primary">{version.title}</span>
          {open ? (
            <ChevronUp size={20} className="shrink-0 text-icon-default" />
          ) : (
            <ChevronDown size={20} className="shrink-0 text-icon-default" />
          )}
        </button>

        {open && (
          /* The rule down the left is the frame's: it marks the chapter as a
             quotation from the session rather than more card copy. */
          <div className="flex flex-col gap-8 border-l border-border-subtle pl-16">
            <p className="text-style-body-small font-semibold text-text-primary">{version.chapter}</p>
            <p className="text-style-body-small text-text-secondary">{version.detail}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-12">
          <span className="flex min-w-0 items-center gap-8">
            <PhotoCircle photo={version.authorPhoto} size={24} gradient={version.gradient} />
            <span className="text-style-body-small truncate text-text-primary">{version.author}</span>
          </span>
          <span className="text-style-body-small shrink-0 text-text-secondary">{version.minutes}</span>
        </div>
      </div>
    </article>
  )
}

/**
 * Figma "Progress" (16523:19484 / 19606 / 19752) — what a session has done
 * since it was made, behind Insights in the cockpit's menu.
 *
 * Three tabs over one shell, which is how the frames are drawn: the header and
 * the chip row are identical across all three and only the body changes. The
 * tab is in the URL rather than in state so a link can open any of them, and
 * so going back from a lineage entry returns to the tab you left.
 */
export function ProgressPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const session = findSession(slug)
  const [openVersion, setOpenVersion] = useState<string | null>('v3')

  if (!session) return <Navigate to="/sessions" replace />

  const tab = (params.get('tab') as ProgressTab) ?? 'chapters'
  const progress = progressFor(session)

  return (
    <div className="min-h-dvh bg-background-default pb-40">
      <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
        {/* Header: 68 tall on the page gutter, 20 between the back button and
            the title, which is Regular 24/24 like every other screen title. */}
        <header className="u-sticky-top flex h-68 items-center gap-16 px-20">
          <div className="flex min-w-0 flex-1 items-center gap-20">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className={`flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong ${CARD_SHADOW}`}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="truncate text-[24px] font-normal! leading-[24px] text-text-primary">Sessions</h1>
          </div>
          <button
            type="button"
            aria-label="More options"
            className={`flex size-44 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong ${CARD_SHADOW}`}
          >
            <MoreHorizontal size={20} />
          </button>
        </header>

        <div className="flex flex-col gap-32 p-20">
          <div className="-mx-20 flex gap-7 overflow-x-auto px-20 pb-2">
            {TABS.map((item) => (
              <Tab
                key={item.id}
                active={tab === item.id}
                label={item.label}
                icon={item.icon}
                onClick={() => setParams({ tab: item.id }, { replace: true })}
              />
            ))}
          </div>

          {tab === 'chapters' && (
            <>
              {/* The objective is the one card on this screen with a gradient
                  hairline: it is what every figure below is measured against,
                  and the only thing here you can edit. */}
              <section
                className={`flex items-center gap-12 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}
                style={{
                  border: '1px solid transparent',
                  backgroundImage:
                    'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(140deg, #ffe682, #fcc181)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex size-36 shrink-0 items-center justify-center rounded-full text-icon-strong"
                  style={{ background: '#FFF1DB' }}
                >
                  <Sparkles size={18} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-4">
                  <span className="text-style-body-small text-text-secondary">Objective</span>
                  <span className="text-style-body truncate text-text-primary">{progress.objective}</span>
                </span>
                <button
                  type="button"
                  aria-label="Edit objective"
                  className="u-press shrink-0 text-icon-default"
                >
                  <Pencil size={16} />
                </button>
              </section>

              <section className="flex flex-col gap-16">
                <h2 className="text-[14px] font-light! leading-[14px] text-[#9a9a9a]">Version History</h2>
                {progress.versions.map((version) => (
                  <VersionCard
                    key={version.id}
                    version={version}
                    open={openVersion === version.id}
                    onToggle={() => setOpenVersion((current) => (current === version.id ? null : version.id))}
                  />
                ))}
              </section>
            </>
          )}

          {tab === 'social' && (
            <div className="flex flex-col gap-16">
              {/* 174 tall: one wide tile beside two stacked, as the frame has
                  it — earnings is the figure the other two explain. */}
              <div className="flex h-174 gap-12">
                <Stat value={progress.earnings} label="Earnings" coin className="w-[180px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-12">
                  <Stat value={progress.timesPlayed} label="Times played" className="flex-1" />
                  <Stat value={progress.recreated} label="Recreated" className="flex-1" />
                </div>
              </div>

              <section className={`flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 ${CARD_SHADOW}`}>
                <h2 className="text-style-title text-text-primary">Community</h2>
                {progress.community.length === 0 ? (
                  <p className="text-style-body-small text-text-secondary">
                    Nothing yet — this one is not published, so nobody can play it but you.
                  </p>
                ) : (
                  <>
                    {progress.community.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between gap-16 border-b border-border-subtle pb-20 last:border-0 last:pb-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-style-body text-text-primary">
                            <span className="underline">{event.person}</span> {event.did}
                          </span>
                          <span className="text-style-body-small mt-4 block text-text-secondary">{event.when}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-6">
                          <span
                            aria-hidden="true"
                            className="flex size-20 items-center justify-center rounded-full"
                            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
                          >
                            <Coins size={11} className="text-text-inverse" />
                          </span>
                          <span className="text-style-body text-text-primary">{event.coins}</span>
                        </span>
                      </div>
                    ))}
                    <button type="button" className="text-style-body u-press w-fit text-text-primary">
                      See All ({progress.communityTotal})
                    </button>
                  </>
                )}
              </section>

              <section className={`flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 ${CARD_SHADOW}`}>
                <h2 className="text-style-title text-text-primary">Lineage Tree</h2>
                {progress.lineage.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/session/${session.slug}`}
                    className="u-press flex items-center gap-12 border-b border-border-subtle pb-20 last:border-0 last:pb-0"
                  >
                    <PhotoCircle photo={entry.authorPhoto} size={40} gradient={session.gradient} />
                    <span className="min-w-0 flex-1">
                      <span className="text-style-body block truncate text-text-primary">{entry.title}</span>
                      <span className="text-style-body-small block truncate text-text-secondary">
                        Created by {entry.author}, {entry.date}
                      </span>
                    </span>
                    <ChevronRight size={20} className="shrink-0 text-icon-default" />
                  </Link>
                ))}
                <button type="button" className="text-style-body u-press w-fit text-text-primary">
                  See All ({progress.lineageTotal})
                </button>
              </section>
            </div>
          )}

          {tab === 'insights' && (
            <div className="flex flex-col gap-16">
              {progress.insights.map((insight) => (
                <article
                  key={insight.id}
                  className={`flex flex-col gap-8 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}
                >
                  {/* items-start, not centre: a title that wraps to two lines
                      would otherwise float the glyph into the gap between
                      them. mt-2 puts it on the first line's optical centre. */}
                  <h2 className="flex items-start gap-12 text-style-title text-text-primary">
                    <Sparkles size={20} className="mt-2 shrink-0 text-icon-strong" />
                    {insight.title}
                  </h2>
                  <p className="text-style-body-small text-text-secondary">{insight.body}</p>
                  <p className="text-style-body-small text-text-secondary/70">{insight.date}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
