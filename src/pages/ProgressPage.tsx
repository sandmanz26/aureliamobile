import { Fragment, useId, useState } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Library,
  MoreHorizontal,
  Pencil,
  Play,
  Sparkles,
  Target,
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
      className={`flex h-35 shrink-0 items-center gap-8 rounded-full border px-12 text-[12px] leading-[19px] transition-colors ${
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

/**
 * The coin, as the frame draws it: a 40px disc on a #FFE682 -> #FF881B
 * diagonal, not a lucide glyph inside a coloured circle. It appears at 40 in
 * the earnings tile and at 20 on a community row.
 */
function Coin({ size = 40 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0.8" y1="0.8" x2="39.2" y2="39.2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE682" />
          <stop offset="1" stopColor="#FF881B" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`} />
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
    </svg>
  )
}

/**
 * A figure and its name — Figma "Highlight/Assessment" (16523:19649, 19661).
 *
 * 20 left and right, 10 top and bottom — not 16 all round — and the figure is
 * Regular 22/25 in plain black, not the bold 28 it had been read as. The
 * earnings tile is the tall one and the only one carrying the coin, 10 above
 * the figure; the figure and its label sit 3 apart.
 */
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
      className={`flex flex-col items-center justify-center gap-10 rounded-[20px] bg-surface-default px-20 py-10 ${CARD_SHADOW} ${className}`}
    >
      {coin && <Coin />}
      <span className="flex flex-col items-center gap-3">
        <span className="text-[22px] leading-[25px] tabular-nums text-black">{value}</span>
        <span className="text-[12px] leading-[19px] text-[#9a9a9a]">{label}</span>
      </span>
    </div>
  )
}

/**
 * One cut of the session — Figma "card" (16523:19540).
 *
 * Every number below is off the node rather than eyeballed: the art is 120
 * tall under a fifth of black, the two controls sit on a 32px row inset 16
 * from the card, and the body is 16 all round with 12 between its blocks.
 */
function VersionCard({
  version,
  playTo,
  open,
  onToggle,
}: {
  version: Version
  /** The player, asked for this cut rather than for the session. */
  playTo: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <article className={`overflow-hidden rounded-[20px] bg-surface-default ${CARD_SHADOW}`}>
      <div className="relative h-120">
        <CoverImage photo={version.photo} gradient={version.gradient} width={724} height={240} scrim={false} />
        {/* The frame darkens the art by a fifth so the two controls on it read
            at any cover. */}
        <span aria-hidden="true" className="absolute inset-0 bg-black/20" />

        {/* 330x32 inset 16, 12 between the two. */}
        <div className="absolute inset-x-16 top-16 flex h-32 items-center justify-between gap-12">
          {/* The glyph plays this cut, not the session: each version is its
              own recording, and hearing what a change did is the reason the
              card carries a figure for it at all. */}
          <Link
            to={playTo}
            state={{ origin: 'own' }}
            aria-label={`Play ${version.title}`}
            className="u-press flex size-32 items-center justify-center rounded-full bg-white/20 text-text-inverse backdrop-blur-[10px]"
          >
            <Play size={16} fill="currentColor" strokeWidth={0} />
          </Link>
          {/* 8 all round, 4 to the figure, and the figure is green — not the
              ink token, which is what it was read as before. */}
          <span className="flex h-32 items-center gap-4 rounded-full bg-[#ecfbed] px-8">
            <ArrowUp size={16} className="text-[#0cba65]" />
            <span className="text-[14px] font-medium leading-[19px] text-[#0cba65]">{version.delta}</span>
          </span>
        </div>
      </div>

      {/* 12 between blocks when the chapter is showing, 16 when it is not —
          the frame draws the two states as separate cards and they differ. */}
      <div className={`flex flex-col p-16 ${open ? 'gap-12' : 'gap-16'}`}>
        <div className="flex flex-col gap-8">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex w-full items-center gap-8 text-left"
          >
            <span className="min-w-0 flex-1 truncate text-[14px] leading-[21px] text-text-primary">
              {version.title}
            </span>
            {open ? (
              <ChevronUp size={16} className="shrink-0 text-icon-strong" />
            ) : (
              <ChevronDown size={16} className="shrink-0 text-icon-strong" />
            )}
          </button>

          {open && (
            /* The rule is the frame's own: a 1px #D6D6D6 hairline the full
               height of the block, 4 in from the card's text column and 12
               from the copy, marking the chapter as a quotation rather than
               more card text. */
            <div className="flex gap-12 pl-4">
              <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-[#d6d6d6]" />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-8">
                <p className="text-[12px] font-medium leading-[19px] text-text-primary">{version.chapter}</p>
                <p className="text-[12px] font-light! leading-[18px] text-[#525252]">{version.detail}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          <span className="flex min-w-0 flex-1 items-center gap-8">
            <PhotoCircle photo={version.authorPhoto} size={16} gradient={version.gradient} />
            <span className="truncate text-[10px] leading-[10px] text-text-primary">{version.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-4">
            <Clock size={10} className="text-icon-strong" />
            <span className="text-[10px] font-light! leading-[10px] text-text-primary">{version.minutes}</span>
          </span>
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
              {/* Figma "Frame 10" (16523:19525) — 362x68, 16 all round, 12
                  between blocks, and the one card on this screen with a
                  gradient hairline: it is what every figure on the other two
                  tabs is measured against, and the only thing here you edit. */}
              <section
                className={`flex h-68 items-center gap-12 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}
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
                  <Target size={20} strokeWidth={1.5} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                  <span className="text-[12px] font-light! leading-[12px] text-[#525252]">Objective</span>
                  <span className="truncate text-[14px] leading-[19px] text-text-primary">{progress.objective}</span>
                </span>
                <button
                  type="button"
                  aria-label="Edit objective"
                  className="u-press shrink-0 text-icon-strong"
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
                    playTo={`/play/${session.slug}?v=${version.id}`}
                    open={openVersion === version.id}
                    onToggle={() => setOpenVersion((current) => (current === version.id ? null : version.id))}
                  />
                ))}
              </section>
            </>
          )}

          {tab === 'social' && (
            <div className="flex flex-col gap-16">
              {/* 174 tall: one 180-wide tile beside two 81s, as the frame has
                  it — earnings is the figure the other two explain. */}
              <div className="flex h-174 gap-12">
                <Stat value={progress.earnings} label="Earnings" coin className="w-[180px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-12">
                  <Stat value={progress.timesPlayed} label="Times played" className="h-81" />
                  <Stat value={progress.recreated} label="Recreated" className="h-81" />
                </div>
              </div>

              {/* Figma "Highlight/Assessment" (16523:19679) — 20 all round, 20
                  between the list and See All, 8 inside the list, and each row
                  carries 7 above and below its own copy. */}
              <section className={`flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 ${CARD_SHADOW}`}>
                <div className="flex flex-col gap-8">
                  <h2 className="text-[14px] leading-[19px] text-text-primary">Community</h2>
                  {progress.community.length === 0 ? (
                    <p className="text-[12px] font-light! leading-[19px] text-[#525252]">
                      Nothing yet — this one is not published, so nobody can play it but you.
                    </p>
                  ) : (
                    progress.community.map((event) => (
                      <Fragment key={event.id}>
                        {/* items-start: the coin sits on the first line of a
                            message that runs to two. */}
                        <div className="flex items-start gap-20 py-7">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] leading-[19px] text-text-primary">
                              <span className="underline">{event.person}</span> {event.did}
                            </span>
                            <span className="block text-[10px] leading-[19px] text-[#828282]">{event.when}</span>
                          </span>
                          <span className="flex h-20 shrink-0 items-center gap-3">
                            <Coin size={20} />
                            <span className="text-[14px] leading-[14px] text-text-primary">{event.coins}</span>
                          </span>
                        </div>
                        {/* The frame rules under every row here, the last one
                            included — and at #F0F0F0, lighter than the #D6D6D6
                            the lineage card uses. */}
                        <span aria-hidden="true" className="h-px shrink-0 bg-[#f0f0f0]" />
                      </Fragment>
                    ))
                  )}
                </div>
                {progress.community.length > 0 && (
                  <button type="button" className="u-press w-fit text-[12px] leading-[18px] text-[#525252]">
                    See All ({progress.communityTotal})
                  </button>
                )}
              </section>

              {/* Figma "Highlight/Assessment" (16523:19712). Its shadow is not
                  the one every other card here shares: 0 4 14 at 8%, tighter
                  and darker, which is why it is spelled out. */}
              <section className="flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                <h2 className="text-[14px] leading-[19px] text-text-primary">Lineage Tree</h2>
                <div className="flex flex-col gap-8">
                  {progress.lineage.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {/* The 8 of padding falls between the row and the rule,
                          so the first row carries it below, the last above and
                          the ones between on both sides. */}
                      <Link
                        to={`/session/${session.slug}`}
                        className={`u-press flex items-center gap-10 ${
                          index === 0
                            ? 'pb-8'
                            : index === progress.lineage.length - 1
                              ? 'pt-8'
                              : 'py-8'
                        }`}
                      >
                        <PhotoCircle photo={entry.authorPhoto} size={35} gradient={session.gradient} />
                        <span className="flex min-w-0 flex-1 flex-col gap-4">
                          <span className="truncate text-[13px] leading-[19px] text-text-primary">{entry.title}</span>
                          <span className="truncate text-[10px] leading-[15px] text-[#525252]">
                            Created by {entry.author}, {entry.date}
                          </span>
                        </span>
                        {/* The frame draws a 16px caret in a 24 box. It points
                            down there because the row is a disclosure in the
                            prototype; here the row opens the session, so it
                            points the way it goes. */}
                        <span className="flex size-24 shrink-0 items-center justify-center text-icon-strong">
                          <ChevronRight size={16} />
                        </span>
                      </Link>
                      {index < progress.lineage.length - 1 && (
                        <span aria-hidden="true" className="h-px shrink-0 bg-[#d6d6d6]" />
                      )}
                    </Fragment>
                  ))}
                </div>
                <button type="button" className="u-press w-fit text-[12px] leading-[18px] text-[#525252]">
                  See All ({progress.lineageTotal})
                </button>
              </section>
            </div>
          )}

          {/* Figma "Frame 97" (16523:19792) — 12 between cards, not 16, and
              each is 16 all round with the glyph 12 from a column that runs
              title, body, date at 8 apart. */}
          {tab === 'insights' && (
            <div className="flex flex-col gap-12">
              {progress.insights.map((insight) => (
                <article
                  key={insight.id}
                  className={`flex gap-12 rounded-[20px] bg-surface-default p-16 ${CARD_SHADOW}`}
                >
                  <Sparkles
                    size={20}
                    fill="currentColor"
                    strokeWidth={0}
                    aria-hidden="true"
                    className="shrink-0 text-text-primary"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-8">
                    <h2 className="text-[14px] leading-[19px] text-text-primary">{insight.title}</h2>
                    <p className="text-[12px] font-light! leading-[19px] text-[#525252]">{insight.body}</p>
                    <span className="text-[10px] leading-[15px] text-[#9a9a9a]">{insight.date}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
