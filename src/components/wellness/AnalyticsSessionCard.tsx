import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Analysis } from '../../lib/wellnessAnalysis'
import { artOf, progressOf, statusOf } from '../../lib/wellnessAnalysis'
import { CoverImage } from '../ui/CoverImage'
import { DeltaPill, ProgressRing } from './ProgressRing'

/**
 * Figma "My Wellness/Analytics" card (16883:14859, U039): 362 wide, radius 20,
 * the brand gradient hairline (#FF8514 → #FFE270), the shared card shadow.
 * The header row is the session's art (49, r12), "Session N: …" over the
 * objective, and an arrow; the foot row is the progress ring, "60%, Great
 * Progress!" and the change since yesterday. The whole card opens the
 * analysis.
 */
export function AnalyticsSessionCard({ analysis }: { analysis: Analysis }) {
  const progress = progressOf(analysis)
  const art = artOf(analysis)
  return (
    <Link
      to={`/wellness/analysis/${analysis.id}`}
      className="u-press flex flex-col gap-16 rounded-[20px] bg-surface-default py-16 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]"
      style={{
        border: '1px solid transparent',
        backgroundImage:
          'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(45deg, #FF8514, #FFE270)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="flex items-center gap-12 px-16">
        <span className="relative size-49 shrink-0 overflow-hidden rounded-12">
          <CoverImage photo={art.photo} gradient={art.gradient} width={120} height={120} scrim={false} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="truncate text-[12px] font-light leading-[12px] text-[#525252]">{analysis.sessionLabel}</span>
          <span className="truncate text-[16px] font-medium leading-[19px] text-text-primary">{analysis.objective}</span>
        </span>
        <ArrowRight size={20} strokeWidth={1.5} className="shrink-0 text-text-primary" />
      </div>
      <div className="flex items-center justify-between gap-11 px-24">
        <span className="flex min-w-0 items-center gap-6">
          <ProgressRing value={progress} size={23} stroke={3.3} track="#FFF1DB" />
          <span className="truncate text-[14px] font-medium leading-[28px] text-black/98">
            {progress}%, {statusOf(progress).short}
          </span>
        </span>
        <DeltaPill value={analysis.sinceYesterday} />
      </div>
    </Link>
  )
}
