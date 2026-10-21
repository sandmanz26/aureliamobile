import { ArrowLeft, ArrowUp } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { RecommendationDeck } from '../components/chat/RecommendationDeck'
import { CoverImage } from '../components/ui/CoverImage'
import { DeltaPill, ProgressRing } from '../components/wellness/ProgressRing'
import type { Analysis } from '../lib/wellnessAnalysis'
import {
  artOf,
  findAnalysis,
  nextChapterOf,
  predictionOf,
  progressOf,
  statusOf,
  summaryOf,
} from '../lib/wellnessAnalysis'

/**
 * Figma "Analysis" (16883:15959, U039) — one session's progress toward its
 * objective, opened from a My Wellness › Analytics card. Design v2 and up.
 *
 * Read top to bottom it answers: how far am I (the ring), is it working (the
 * heading, the change since yesterday, the shifts), why (what helped), and
 * what next (the predicted gain and the proposed changes, with a button that
 * builds the next chapter from them).
 *
 * Everything is derived from one `Analysis` record (lib/wellnessAnalysis), so
 * the numbers agree with each other and with the Analytics card.
 */
export function WellnessAnalysisPage() {
  const { id } = useParams()
  const analysis = findAnalysis(id)
  if (!analysis) return <Navigate to="/wellness" replace />
  return <AnalysisView analysis={analysis} />
}

function AnalysisView({ analysis }: { analysis: Analysis }) {
  const navigate = useNavigate()
  const progress = progressOf(analysis)
  const status = statusOf(progress)
  const art = artOf(analysis)
  const [primary, ...shifts] = analysis.metrics
  const next = nextChapterOf(analysis)
  const [deckOpen, setDeckOpen] = useState(false)

  function back() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/wellness')
  }

  function createNextChapter() {
    // The proposals are the brief: the cockpit opens on this session and
    // builds the next chapter (the next version) with them, through the same
    // path Session settings uses — one build path, not a second one.
    const names = analysis.proposals.map((p) => p.title)
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]
    navigate(`/chat/${analysis.sessionSlug}`, { state: { styleChanges: `Create Chapter ${next} with ${list}` } })
  }

  return (
    <div className="-mt-[30px] min-h-full bg-surface-default lg:mt-0 lg:bg-background-default lg:py-24">
      <PageMeta title={`${analysis.objective} — Analysis`} description={`Progress on ${analysis.objective}: ${progress}%.`} />
      <div className="relative mx-auto w-full lg:max-w-[720px] lg:overflow-hidden lg:rounded-24 lg:bg-surface-default lg:shadow-sm">
        {/* Hero: the session's art under a 60% black fade, the ring, the objective. */}
        <header className="relative h-348 overflow-hidden text-white">
          <CoverImage photo={art.photo} gradient={art.gradient} width={900} height={700} scrim={false} />
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
          <button
            type="button"
            aria-label="Back"
            onClick={back}
            className="u-press absolute left-20 top-20 z-10 flex size-44 items-center justify-center rounded-12 bg-surface-default text-text-primary shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute inset-x-0 top-[68px] flex flex-col items-center">
            <ProgressRing value={progress} size={120} stroke={10} track="rgba(255,255,255,0.3)" arc="#FFFFFF" inner="rgba(0,0,0,0.12)">
              <span className="text-[27px] font-medium leading-[28px]">{progress}%</span>
            </ProgressRing>
            <h1 className="mt-24 px-20 text-center text-[24px] font-medium leading-[28px]">{analysis.objective}</h1>
            <p className="mt-8 text-[14px] font-light leading-[16px]">{analysis.sessionLabel}</p>
          </div>
        </header>

        <main className="relative -mt-20 rounded-t-32 bg-surface-default pb-40">
          {/* Status, change since yesterday, summary, the shifts. */}
          <section className="flex flex-col gap-24 px-32 pt-24">
            <div className="flex flex-col gap-3">
              <h2 className="text-[24px] font-normal leading-[36px] text-text-primary">{status.heading}</h2>
              <p className="flex items-center gap-8 text-[14px] font-light leading-[24px] text-[#7A7A7A]">
                <DeltaPill value={analysis.sinceYesterday} /> Since yesterday
              </p>
            </div>
            <p className="text-[14px] font-light leading-[21px] text-text-primary">{summaryOf(analysis)}</p>
            <ul className="flex flex-col gap-10">
              {[primary, ...shifts].map((m, i) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-9 text-[14px] leading-[21px] text-text-primary ${i === 0 ? 'font-medium' : 'font-light'}`}
                >
                  <span aria-hidden="true" className="size-8 shrink-0 rounded-full" style={{ background: m.color }} />
                  <span className="min-w-0 flex-1 truncate">{m.label}</span>
                  <span className="flex shrink-0 items-center gap-4 tabular-nums">
                    {m.value}%
                    <ArrowUp size={12} strokeWidth={2} className="text-[#70C973]" />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-24 px-16" aria-label="Progress by chapter">
            <ProgressChart analysis={analysis} />
          </section>

          {/* What helped me? — the changes in the chapters done, by effect. */}
          <section className="mt-32">
            <h2 className="px-24 text-[20px] font-normal leading-[30px] text-text-primary">What helped me?</h2>
            <div className="mt-16 flex gap-12 overflow-x-auto px-24 pb-8">
              {analysis.helped.map((h) => (
                <article key={h.title} className="flex w-[190px] shrink-0 flex-col gap-12 rounded-12 border border-[#ECECEC] bg-surface-default p-16 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <img src={h.orb} alt="" className="size-42 rounded-full object-cover" />
                  <div className="flex flex-col gap-2">
                    <p className="text-[16px] leading-[24px] text-text-primary">{h.title}</p>
                    <p className="text-[12px] font-light leading-[18px] text-text-primary">{h.description}</p>
                  </div>
                  <p className="mt-auto flex items-center gap-8 text-[10px] leading-[12px] text-text-primary">
                    Improved Score
                    <span className="flex h-20 items-center gap-4 rounded-full bg-[#ECFBED] px-8 text-[12px] text-text-primary">
                      <span aria-hidden="true" className="text-[#5FC52C]">▲</span>
                      {h.improved}%
                    </span>
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Next chapter: the prediction, and the proposals it is built on. */}
          <section className="mt-32 flex flex-col gap-24 px-32">
            <div className="flex flex-col gap-7">
              <h2 className="text-[24px] font-normal leading-[36px] text-text-primary">Next chapter</h2>
              <p className="text-[14px] font-light leading-[21px] text-text-primary">{predictionOf(analysis)}</p>
            </div>
            <p className="flex items-center gap-9">
              <span aria-hidden="true" className="size-8 shrink-0 rounded-full" style={{ background: primary.color }} />
              <span className="min-w-0 flex-1 text-[14px] font-medium leading-[21px] text-text-primary">{primary.label}</span>
              <span className="flex items-center gap-4 text-[14px] font-medium leading-[21px] tabular-nums text-text-primary">
                +{analysis.predictedGain}%
                <ArrowUp size={12} strokeWidth={2} className="text-[#70C973]" />
              </span>
            </p>
          </section>

          <section className="mx-32 mt-24 flex flex-col gap-8 rounded-12 bg-[#F5EEE8] p-24">
            <div className="flex flex-col gap-5">
              <h3 className="text-[16px] leading-[24px] text-black">Proposed improvements ({analysis.proposals.length}):</h3>
              <p className="text-[14px] font-light leading-[21px] text-text-primary">
                Here are the proposed elements that will contribute to an enhanced state.
              </p>
            </div>
            <div className="flex justify-center py-8">
              <RecommendationDeck
                recommendations={analysis.proposals}
                count={analysis.proposals.length}
                onOpen={() => setDeckOpen((v) => !v)}
              />
            </div>
            {deckOpen && (
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
              onClick={createNextChapter}
              className="u-press mt-8 flex h-46 w-full items-center justify-center rounded-16 bg-[#331B04] text-[16px] leading-[16px] text-white"
            >
              Create Chapter {next}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/play/${analysis.sessionSlug}`)}
              className="u-press flex h-46 w-full items-center justify-center rounded-16 border border-[#331B04] text-[16px] leading-[19px] text-text-primary"
            >
              Go to Session
            </button>
          </section>
        </main>
      </div>
    </div>
  )
}

/**
 * Chapters across, progress up. Solid for what happened (the chapters done),
 * dashed for what Aurelia projects (the rest). One scale for marks and labels:
 * the values are percentages, so the axis is 0–100% — the frame's 0–400 axis
 * under percentage metrics could not be read against them (U039).
 */
function ProgressChart({ analysis }: { analysis: Analysis }) {
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
