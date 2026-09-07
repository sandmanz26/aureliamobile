import { ArrowLeft, BarChart3, Clock, Coins, Share2, Users, Zap } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import type { Contender } from '../lib/challenges'
import { findChallenge } from '../lib/challenges'
import { findSession } from '../lib/sessions'

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

/** Days completed, in the pill the design puts under every name. */
function DaysPill({ days, dark = false }: { days: number; dark?: boolean }) {
  return (
    <span
      className={`text-style-label inline-flex h-26 shrink-0 items-center gap-4 whitespace-nowrap rounded-full px-10 ${
        dark ? 'bg-surface-default text-text-primary' : 'border border-border-subtle bg-surface-default text-text-primary'
      }`}
    >
      <Zap size={12} className="text-brand-emphasis" />
      {days} days
    </span>
  )
}

/**
 * The top three, drawn as a podium.
 *
 * Column height encodes rank, not days — the bars are the standings, and the
 * exact figure sits on each pill next to the name. Order is 2 / 1 / 3 so the
 * winner is centre, which is what a podium means.
 */
function Podium({ top }: { top: Contender[] }) {
  const [first, second, third] = top
  const columns = [
    { contender: second, height: 'h-[86px]', size: 64, label: 'mt-8' },
    { contender: first, height: 'h-[118px]', size: 76, label: 'mt-0' },
    { contender: third, height: 'h-[62px]', size: 58, label: 'mt-16' },
  ].filter((column) => column.contender)

  return (
    <div
      className="relative flex items-end justify-center gap-10 overflow-hidden rounded-24 px-14 pt-20"
      style={{ background: 'linear-gradient(170deg, #ffe6a8, #ff9a1f)' }}
    >
      {columns.map(({ contender, height, size, label }) => (
        <div key={contender.rank} className={`flex flex-1 flex-col items-center ${label}`}>
          <span className="text-style-body-small font-semibold text-text-primary">{contender.rank}</span>
          <span className="mt-6 rounded-full bg-surface-default p-3 shadow-md">
            <PhotoCircle photo={contender.photo} size={size} gradient={AVATAR_RING} alt={contender.name} />
          </span>
          <span className="text-style-body-small mt-8 max-w-full truncate font-medium text-text-primary">
            {contender.name}
          </span>
          <span className="mt-6">
            <DaysPill days={contender.days} dark />
          </span>
          {/* The column itself — deliberately unlabelled; the pill above carries the number. */}
          <span className={`mt-10 w-full rounded-t-16 bg-white/35 ${height}`} />
        </div>
      ))}
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
              className="flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-8">
              <div className="flex h-40 items-center gap-8 rounded-full bg-surface-default px-14 shadow-sm">
                <span
                  className="flex size-16 items-center justify-center rounded-full"
                  style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
                >
                  <Coins size={10} className="text-text-inverse" />
                </span>
                <span className="text-style-label">1,323</span>
              </div>
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
          {/* Sits on the seam, as in the design — the standings live below it. */}
          <span className="absolute -top-20 left-20 flex size-40 items-center justify-center rounded-full bg-espresso-800 text-text-inverse shadow-md">
            <BarChart3 size={18} />
          </span>

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

            <div className="mt-24">
              <Podium top={podium} />
            </div>

            <div className="mt-8 flex flex-col divide-y divide-border-subtle">
              {ranked.map((contender) => (
                <div key={contender.rank} className="flex items-center gap-10 py-14">
                  <span className="text-style-body-small w-14 shrink-0 tabular-nums text-text-secondary">
                    {contender.rank}
                  </span>
                  <PhotoCircle photo={contender.photo} size={40} gradient={AVATAR_RING} alt={contender.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-style-body-small truncate font-medium text-text-primary">{contender.name}</p>
                    <p className="text-style-caption text-text-secondary">Joined {contender.joined}</p>
                  </div>
                  <DaysPill days={contender.days} />
                  {contender.trend && <TrendMark direction={contender.trend} />}
                </div>
              ))}
            </div>

            {sessions.length > 0 && (
              <section className="mt-32">
                <h2 className="text-style-title text-text-primary">Created Session</h2>
                <div className="-mx-20 mt-16 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
                  {sessions.map((session) => (
                    <div key={session.slug} className="w-[260px] shrink-0">
                      <SessionGridCard session={session} className="aspect-[260/230]" />
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
            className="text-style-body flex h-56 w-full items-center justify-center rounded-full bg-button-primary-background font-semibold text-button-primary-foreground"
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
