import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { RELEASES } from '../versions/releases'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useUiVersion } from '../versions/useUiVersion'
import { PageMeta } from '../components/PageMeta'
import { CoverImage } from '../components/ui/CoverImage'
import { AnalysisShifts, AnalysisStatus, NextChapter, ProgressChart } from '../components/wellness/AnalysisParts'
import { ProgressRing } from '../components/wellness/ProgressRing'
import type { Analysis } from '../lib/wellnessAnalysis'
import { artOf, chapterBrief, findAnalysis, progressOf } from '../lib/wellnessAnalysis'

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
  // v5 (U053): the sample analyses are not shown as anyone's progress; Progress
  // holds the person's own check-ins instead.
  const v5 = useUiVersion() >= 5
  if (!analysis || v5) return <Navigate to="/wellness" replace />
  return <AnalysisView analysis={analysis} />
}

function AnalysisView({ analysis }: { analysis: Analysis }) {
  const navigate = useNavigate()
  const progress = progressOf(analysis)
  const art = artOf(analysis)

  function back() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/wellness')
  }

  function createNextChapter() {
    // The proposals are the brief: the cockpit opens on this session and
    // builds the next chapter (the next version) with them, through the same
    // path Session settings uses — one build path, not a second one.
    navigate(`/chat/${analysis.sessionSlug}`, { state: { styleChanges: chapterBrief(analysis) } })
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
            <AnalysisStatus analysis={analysis} />
            <AnalysisShifts analysis={analysis} />
          </section>

          <section className="mt-24 px-16" aria-label="Progress by chapter">
            <ProgressChart analysis={analysis} />
          </section>

          {RELEASES.analysisV2 && <HelpedList analysis={analysis} />}

          {/* What helped me? — the changes in the chapters done, by effect. */}
          {!RELEASES.analysisV2 && (
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
          )}

          {/* Next chapter: the prediction, and the proposals it is built on.
              Not in the new frame (16906:5168): the page ends on what helped. */}
          {!RELEASES.analysisV2 && (
          <div className="mt-32">
            <NextChapter
              analysis={analysis}
              onCreate={createNextChapter}
              secondary={{ label: 'Go to Session', onClick: () => navigate(`/play/${analysis.sessionSlug}`) }}
            />
          </div>
          )}
        </main>
      </div>
    </div>
  )
}

const VISIBLE = 3
const ROW_SHADOW = '0 4px 14px rgba(0, 0, 0, 0.04)'

/**
 * "What helped me?" as a list (Figma 16906:5282; U071): orb, title and one
 * line, with a chevron that opens the effect; three shown, the rest behind
 * Show more.
 */
function HelpedList({ analysis }: { analysis: Analysis }) {
  const [open, setOpen] = useState<string | null>(null)
  const [all, setAll] = useState(false)
  const shown = all ? analysis.helped : analysis.helped.slice(0, VISIBLE)
  return (
    <section className="mt-32 px-24">
      <h2 className="text-[20px] font-normal leading-[30px] text-text-primary">What helped me?</h2>
      <ul className="mt-16 flex flex-col gap-12">
        {shown.map((h) => {
          const expanded = open === h.title
          return (
            <li key={h.title} className="rounded-[20px] bg-surface-default" style={{ boxShadow: ROW_SHADOW }}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : h.title)}
                className="flex w-full items-center gap-14 rounded-[20px] px-16 py-18 text-left"
              >
                <img src={h.orb} alt="" className="size-42 shrink-0 rounded-full object-cover" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-[18px] leading-[24px] text-text-primary">{h.title}</span>
                  <span className="text-[12px] font-light leading-[18px] text-text-primary">{h.description}</span>
                </span>
                <ChevronDown size={18} className={`shrink-0 text-icon-strong transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && (
                <p className="flex items-center gap-8 px-16 pb-16 pl-[72px] text-[12px] leading-[16px] text-text-secondary">
                  Improved your score by
                  <span className="flex h-20 items-center gap-4 rounded-full bg-[#ECFBED] px-8 text-[12px] text-text-primary">
                    <span aria-hidden="true" className="text-[#5FC52C]">▲</span>
                    {h.improved}%
                  </span>
                </p>
              )}
            </li>
          )
        })}
      </ul>
      {analysis.helped.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="text-style-label u-press mt-12 h-40 w-full rounded-12 border border-[#E4E4E4] bg-surface-default text-text-primary"
        >
          {all ? 'Show less' : 'Show more'}
        </button>
      )}
    </section>
  )
}
