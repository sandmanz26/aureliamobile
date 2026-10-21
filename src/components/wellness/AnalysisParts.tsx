import { ArrowUp } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { RecommendationDeck } from '../chat/RecommendationDeck'
import type { Analysis, Metric } from '../../lib/wellnessAnalysis'
import { nextChapterOf, predictionOf, progressOf, statusOf, summaryOf } from '../../lib/wellnessAnalysis'
import { DeltaPill, ProgressRing } from './ProgressRing'

// The pieces of an analysis that more than one screen shows: the Analysis
// page (Figma 16883:15959) and, since U041, the player's drawer on a session
// that has one (Figma "Session: Chat - Player", 16886:1623). One component
// per block so the two cannot drift apart — same numbers, same type.

/** "Great Progress!" over "3% ↑ Since yesterday"; the player adds the small ring. */
export function AnalysisStatus({ analysis, ring = false }: { analysis: Analysis; ring?: boolean }) {
  const progress = progressOf(analysis)
  return (
    <div className="flex items-start justify-between gap-12">
      <div className="flex min-w-0 flex-col gap-3">
        <h2 className="text-[24px] font-normal leading-[36px] text-text-primary">{statusOf(progress).heading}</h2>
        <p className="flex items-center gap-8 text-[14px] font-light leading-[24px] text-[#7A7A7A]">
          <DeltaPill value={analysis.sinceYesterday} /> Since yesterday
        </p>
      </div>
      {ring && (
        <span className="mt-8 flex shrink-0 items-center gap-6 text-[12px] font-semibold leading-[18px] tabular-nums text-text-primary">
          <ProgressRing value={progress} size={20} stroke={3} track="#FFF1DB" />
          {progress}%
        </span>
      )}
    </div>
  )
}

/** One coloured row: a metric and its value (or the predicted gain). */
export function MetricRow({ metric, value, strong = false }: { metric: Metric; value: string; strong?: boolean }) {
  return (
    <li className={`flex items-center gap-9 text-[14px] leading-[21px] text-text-primary ${strong ? 'font-medium' : 'font-light'}`}>
      <span aria-hidden="true" className="size-8 shrink-0 rounded-full" style={{ background: metric.color }} />
      <span className="min-w-0 flex-1 truncate">{metric.label}</span>
      <span className="flex shrink-0 items-center gap-4 tabular-nums">
        {value}
        <ArrowUp size={12} strokeWidth={2} className="text-[#70C973]" />
      </span>
    </li>
  )
}

/** The generated sentence and the objective + its three shifts. */
export function AnalysisShifts({ analysis }: { analysis: Analysis }) {
  return (
    <>
      <p className="text-[14px] font-light leading-[21px] text-text-primary">{summaryOf(analysis)}</p>
      <ul className="flex flex-col gap-10">
        {analysis.metrics.map((m, i) => (
          <MetricRow key={m.id} metric={m} value={`${m.value}%`} strong={i === 0} />
        ))}
      </ul>
    </>
  )
}

/**
 * Next chapter: the prediction, the objective's predicted gain, and the
 * proposals panel ending in Create Chapter N plus one secondary action —
 * "Go to Session" on the Analysis page, "Ask Aurelia" in the player, where
 * you are already in the session.
 */
export function NextChapter({
  analysis,
  onCreate,
  secondary,
  inset = 32,
}: {
  analysis: Analysis
  onCreate: () => void
  secondary: { label: string; onClick: () => void }
  /** Side padding: 32 on the Analysis page, 20 in the player's drawer. */
  inset?: 20 | 32
}) {
  const [listOpen, setListOpen] = useState(false)
  const primary = analysis.metrics[0]
  const px = inset === 20 ? 'px-20' : 'px-32'
  const mx = inset === 20 ? 'mx-20' : 'mx-32'
  return (
    <>
      <section className={`flex flex-col gap-24 ${px}`}>
        <div className="flex flex-col gap-7">
          <h2 className="text-[24px] font-normal leading-[36px] text-text-primary">Next chapter</h2>
          <p className="text-[14px] font-light leading-[21px] text-text-primary">{predictionOf(analysis)}</p>
        </div>
        <ul>
          <MetricRow metric={primary} value={`+${analysis.predictedGain}%`} strong />
        </ul>
      </section>

      <section className={`${mx} mt-24 flex flex-col gap-8 rounded-12 bg-[#F5EEE8] p-24`}>
        <div className="flex flex-col gap-5">
          <h3 className="text-[16px] leading-[24px] text-black">Proposed improvements ({analysis.proposals.length}):</h3>
          <p className="text-[14px] font-light leading-[21px] text-text-primary">
            Here are the proposed elements that will contribute to an enhanced state.
          </p>
        </div>
        <div className="flex justify-center py-8">
          <RecommendationDeck recommendations={analysis.proposals} count={analysis.proposals.length} onOpen={() => setListOpen((v) => !v)} />
        </div>
        {listOpen && (
          <ul className="flex flex-col gap-8 rounded-12 bg-surface-default p-12">
            {analysis.proposals.map((p) => (
              <li key={p.id} className="flex items-center gap-10">
                <img src={p.orb} alt="" className="size-32 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] leading-[19px] text-text-primary">{p.title}</span>
                  <span className="block truncate text-[12px] font-light leading-[16px] text-text-secondary">{p.description}</span>
                </span>
                <span className="shrink-0 rounded-full bg-[#ECFBED] px-6 py-1 text-[11px] text-success-600">+{p.improveScore}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onCreate}
          className="u-press mt-8 flex h-46 w-full items-center justify-center rounded-16 bg-[#331B04] text-[16px] leading-[16px] text-white"
        >
          Create Chapter {nextChapterOf(analysis)}
        </button>
        <button
          type="button"
          onClick={secondary.onClick}
          className="u-press flex h-46 w-full items-center justify-center rounded-16 border border-[#331B04] text-[16px] leading-[19px] text-text-primary"
        >
          {secondary.label}
        </button>
      </section>
    </>
  )
}

/**
 * Chapters across, progress up. Solid for what happened (the chapters done),
 * dashed for what Aurelia projects (the rest). One scale for marks and labels:
 * the values are percentages, so the axis is 0–100% — the frame's 0–400 axis
 * under percentage metrics could not be read against them (U039).
 */
export function ProgressChart({ analysis }: { analysis: Analysis }) {
  // Drawn at the box's own width, not scaled from a fixed viewBox, so the
  // 12px labels stay 12px beside the 14px list above on every screen (U040).
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(370)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setW(Math.max(280, Math.round(el.clientWidth)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const H = 248
  const left = 40
  const top = 10
  const plotW = W - left - 6
  const plotH = 200
  const chapters = 3
  const xAt = (i: number) => left + (plotW * i) / chapters
  const yAt = (v: number) => top + plotH * (1 - Math.max(0, Math.min(100, v)) / 100)
  const done = analysis.chaptersDone

  // Smooth curve through points (Catmull-Rom → cubic Bézier).
  const path = (pts: [number, number][]) =>
    pts
      .map(([x, y], i) => {
        if (i === 0) return `M${x},${y}`
        const [x0, y0] = pts[i - 2] ?? pts[i - 1]
        const [x1, y1] = pts[i - 1]
        const [x3, y3] = pts[i + 1] ?? [x, y]
        const c1x = x1 + (x - x0) / 6
        const c1y = y1 + (y - y0) / 6
        const c2x = x - (x3 - x1) / 6
        const c2y = y - (y3 - y1) / 6
        return `C${c1x},${c1y} ${c2x},${c2y} ${x},${y}`
      })
      .join(' ')

  return (
    <div ref={box}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block font-sans" role="img" aria-label={`Progress by chapter. ${analysis.metrics.map((m) => `${m.label}: ${m.value}% now, projected ${m.projected[0]}% after chapter ${done + 1}`).join('. ')}.`}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={left} x2={W - 6} y1={yAt(v)} y2={yAt(v)} stroke="#EFEFEF" strokeWidth="1" />
            <text x={left - 8} y={yAt(v) + 4} textAnchor="end" fontSize="12" fill="var(--color-text-secondary)">
              {v}%
            </text>
          </g>
        ))}
        {Array.from({ length: chapters + 1 }, (_, i) => (
          <line key={i} x1={xAt(i)} x2={xAt(i)} y1={top} y2={top + plotH} stroke="#EFEFEF" strokeWidth="1" />
        ))}
        {Array.from({ length: chapters }, (_, i) => (
          <text key={i} x={(xAt(i) + xAt(i + 1)) / 2} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--color-text-primary)">
            Chapter {i + 1}
          </text>
        ))}
        <defs>
          <linearGradient id="analysis-primary" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FF881B" />
            <stop offset="1" stopColor="#FFE270" />
          </linearGradient>
        </defs>
        {/* Projections first, so the solid history paints over their joins. */}
        {analysis.metrics.map((m) => {
          const pts: [number, number][] = [
            [xAt(done), yAt(m.value)],
            ...m.projected.map((v, i) => [xAt(done + 1 + i), yAt(v)] as [number, number]),
          ]
          return (
            <path key={`${m.id}-p`} d={path(pts)} fill="none" stroke={m.color} strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
          )
        })}
        {analysis.metrics
          .slice()
          .reverse()
          .map((m, i, all) => {
            const isPrimary = i === all.length - 1
            const start = Math.round(m.value * 0.15)
            // A slow start that accelerates, the shape the frame draws.
            const pts: [number, number][] = [
              [xAt(0), yAt(start)],
              [xAt(done / 2), yAt(start + (m.value - start) * 0.35)],
              [xAt(done), yAt(m.value)],
            ]
            return (
              <path
                key={m.id}
                d={path(pts)}
                fill="none"
                stroke={isPrimary ? 'url(#analysis-primary)' : m.color}
                strokeOpacity={isPrimary ? 1 : 0.6}
                strokeWidth={isPrimary ? 6 : 3}
                strokeLinecap="round"
              />
            )
          })}
      </svg>
    </div>
  )
}
