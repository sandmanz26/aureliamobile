import { ArrowLeft, ArrowRight, Clock, Play, Share2, Trophy, Users } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import type { CoverKey } from '../lib/photos'
import type { Contender } from '../lib/challenges'
import { findChallenge } from '../lib/challenges'
import { findSession } from '../lib/sessions'
import { CoinPill } from '../components/ui/CoinPill'

const AVATAR_RING = 'conic-gradient(from 200deg, var(--color-gold-300), var(--color-blue-300), var(--color-gold-300))'

/**
 * Movement since the last update, as a solid triangle — the reference uses a
 * plain up/down mark rather than a trend line, which reads better at 8px.
 * Colour alone never carries it: the direction is in the shape.
 */
function TrendMark({ direction }: { direction: 'up' | 'down' }) {
  const up = direction === 'up'
  return (
    <span
      role="img"
      aria-label={up ? 'Moved up' : 'Moved down'}
      className="size-0 shrink-0"
      style={{
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        ...(up
          ? { borderBottom: '7px solid var(--color-feedback-success)' }
          : { borderTop: '7px solid var(--color-feedback-error)' }),
      }}
    />
  )
}

/** Plays, in the pill the design puts under each podium cover and on each row. */
function PlaysPill({ plays, dark = false }: { plays: string; dark?: boolean }) {
  return (
    <span
      className={`text-style-label inline-flex h-26 min-w-0 max-w-full items-center gap-4 whitespace-nowrap rounded-full px-10 ${
        dark ? 'bg-surface-default text-text-primary shadow-sm' : 'border border-border-subtle bg-surface-default text-text-primary'
      }`}
    >
      <Play size={11} className="shrink-0" fill="currentColor" />
      <span className="tabular-nums">{plays}</span>
    </span>
  )
}

/** A session cover as a disc, with the play mark the design puts over it. */
function CoverDisc({ photo, size, alt }: { photo: CoverKey; size: number; alt: string }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <PhotoCircle photo={photo} size={size} gradient={AVATAR_RING} alt={alt} />
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex items-center justify-center rounded-full bg-black/35 text-text-inverse backdrop-blur-sm"
          style={{ width: size * 0.42, height: size * 0.42 }}
        >
          <Play size={Math.round(size * 0.2)} fill="currentColor" />
        </span>
      </span>
    </span>
  )
}

/**
 * The top three, drawn as a podium.
 *
 * Column height encodes rank, not plays — the bars are the standings, and the
 * exact figure sits on the pill under each cover. Order is 2 / 1 / 3 so the
 * winner is centre, which is what a podium means.
 */
function Podium({ top }: { top: Contender[] }) {
  const [first, second, third] = top
  const columns = [
    { contender: second, height: 'h-[86px]', size: 64, label: 'mt-16' },
    { contender: first, height: 'h-[118px]', size: 76, label: 'mt-0' },
    { contender: third, height: 'h-[62px]', size: 58, label: 'mt-24' },
  ].filter((column) => column.contender)

  return (
    <div
      className="relative flex items-end justify-center gap-8 overflow-hidden rounded-24 px-12 pt-16"
      style={{ background: 'linear-gradient(170deg, #ffe6a8, #ff9a1f)' }}
    >
      {columns.map(({ contender, height, size, label }) => {
        const session = findSession(contender.sessionSlug)
        if (!session) return null
        return (
          <div key={contender.rank} className={`flex min-w-0 flex-1 flex-col items-center ${label}`}>
            <span className="text-style-body-small font-semibold text-text-primary">{contender.rank}</span>
            <span className="relative mt-6 rounded-full bg-surface-default p-3 shadow-md">
              <CoverDisc photo={session.photo} size={size} alt={session.title} />
            </span>
            {/* The count sits on the cover's edge, as the design overlaps it. */}
            <span className="-mt-13 relative z-10">
              <PlaysPill plays={contender.plays} dark />
            </span>
            <span className="text-style-body-small mt-8 line-clamp-2 max-w-full text-center font-medium text-text-primary">
              {session.title}
            </span>
            <span className="mt-6 flex min-w-0 max-w-full items-center gap-4">
              <PhotoCircle photo={contender.creatorPhoto} size={16} gradient={AVATAR_RING} alt="" />
              <span className="text-style-caption truncate text-text-primary">{contender.creator}</span>
            </span>
            {/* The column itself — deliberately unlabelled; the pill carries the number. */}
            <span className={`mt-10 w-full rounded-t-16 bg-white/35 ${height}`} />
          </div>
        )
      })}
    </div>
  )
}

export function ChallengeDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const challenge = findChallenge(slug)

  if (!challenge) return <Navigate to="/sessions" replace />

  const podium = challenge.leaderboard.slice(0, 3)
  const ranked = challenge.leaderboard.slice(3)
  const sessions = challenge.sessionSlugs.map(findSession).filter((session) => session !== undefined)

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      {/* Hero, with the sheet below overlapping it. */}
      <div className="relative">
        <div className="relative aspect-[402/300] w-full overflow-hidden">
          <CoverImage photo={challenge.photo} gradient={challenge.gradient} width={820} height={620} scrim={false} />
          <div className="relative flex items-center justify-between gap-12 px-20 pt-16">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="u-press flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-8">
              <CoinPill points="1,323" className="shadow-sm" />
              <button
                type="button"
                aria-label="Share challenge"
                className="flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative -mt-24 rounded-t-24 bg-background-default pt-24">
          {/* Sits on the seam, as in the design. It is a labelled way in rather
              than a bare glyph — "what do I get for this" is the first thing a
              challenge has to answer, and an unlabelled chart icon does not. */}
          <button
            type="button"
            className="text-style-label u-press absolute -top-22 left-20 flex h-44 items-center gap-8 rounded-full bg-espresso-800/85 px-16 text-text-inverse shadow-md backdrop-blur-sm"
          >
            <Trophy size={16} />
            Rewards
            <ArrowRight size={15} />
          </button>

          <div className="mx-auto w-full max-w-[402px] px-20 pb-140 lg:max-w-[720px] lg:px-24">
            <div className="flex flex-wrap gap-8">
              <span className="text-style-label inline-flex h-34 items-center gap-6 rounded-full border border-border-subtle px-14 text-text-primary">
                <Users size={13} />
                {challenge.joined} joined
              </span>
              <span className="text-style-label inline-flex h-34 items-center gap-6 rounded-full border border-border-subtle px-14 text-text-primary">
                <Clock size={13} />
                Ends in {challenge.endsInDays} days
              </span>
            </div>

            <h1 className="text-style-title-large mt-16 text-text-primary">{challenge.title}</h1>
            <p className="text-style-body mt-8 text-text-secondary">{challenge.summary}</p>

            {/* A challenge that has just opened has no board, and `Podium`
                would render its gradient block with nothing standing on it —
                a trophy plinth for nobody. The empty state says what is
                actually true and what would change it. */}
            {podium.length === 0 ? (
              <div className="mt-24 flex flex-col items-center gap-8 rounded-24 border border-border-subtle px-20 py-32 text-center">
                <span className="flex size-56 items-center justify-center rounded-full bg-background-elevated">
                  <Trophy size={24} className="text-icon-secondary" />
                </span>
                <h2 className="text-style-body mt-8 text-text-primary">No one on the board yet</h2>
                <p className="text-style-body-small max-w-[280px] font-light! text-text-secondary">
                  This one just opened. Join it, make a session for it, and yours is the first name here.
                </p>
              </div>
            ) : (
              <div className="mt-24">
                <Podium top={podium} />
              </div>
            )}

            <div className="mt-8 flex flex-col divide-y divide-border-subtle">
              {ranked.map((contender) => {
                const session = findSession(contender.sessionSlug)
                if (!session) return null
                return (
                  <div key={contender.rank} className="flex items-center gap-10 py-14">
                    <span className="text-style-body-small w-14 shrink-0 tabular-nums text-text-secondary">
                      {contender.rank}
                    </span>
                    <CoverDisc photo={session.photo} size={40} alt={session.title} />
                    <div className="min-w-0 flex-1">
                      <p className="text-style-body-small truncate font-medium text-text-primary">{session.title}</p>
                      <p className="text-style-caption truncate text-text-secondary">by {contender.creator}</p>
                    </div>
                    <PlaysPill plays={contender.plays} />
                    {contender.trend && <TrendMark direction={contender.trend} />}
                  </div>
                )
              })}
            </div>

            {sessions.length === 0 ? (
              <section className="mt-32">
                <h2 className="text-style-title text-text-primary">Created Session</h2>
                {/* Shown rather than hidden: an absent heading reads as a
                    screen still loading, where an empty one reads as a
                    challenge nobody has made anything for yet — which is the
                    invitation. */}
                <p className="text-style-body-small mt-16 font-light! text-text-secondary">
                  Nothing made for this one yet. A session you build and publish while you are in it lands here.
                </p>
              </section>
            ) : (
              <section className="mt-32">
                <h2 className="text-style-title text-text-primary">Created Session</h2>
                <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
                  {sessions.map((session) => (
                    <div key={session.slug} className="w-[234px] shrink-0">
                      <SessionGridCard session={session} className="aspect-[234/351] w-full" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* The one action the screen exists for, reachable from anywhere on it. */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-background-default/95 px-20 py-12 backdrop-blur lg:px-24">
        <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
          <button
            type="button"
            className="text-style-body u-press flex h-56 w-full items-center justify-center rounded-full bg-button-primary-background font-semibold text-button-primary-foreground"
          >
            Join Challenge
          </button>
          {challenge.yourDay !== null && (
            <p className="text-style-caption mt-8 text-center text-text-secondary">
              You are on day {challenge.yourDay} of {challenge.totalDays} · about {challenge.minutesPerDay} min a day
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
