import { ArrowRight, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge, type Tone } from '../../components/ui'
import type { TermId } from '../../data/glossary'
import type { ReportSummary, SummaryStatus } from '../../data/reportSummaries'
import { LABEL_TEXT, type SourceLabel } from '../../data/reportSources'
import { LABEL_TONE } from './reportColors'
import { RichText, Term } from './Term'

/*
 * The summary-first top of every Admin → Report (U126, J179): the question,
 * a one-sentence answer, 3–4 KPI tiles, the next moves and how sure we are.
 * Everything below it folds into closed <Details> sections.
 */

const STATUS: Record<SummaryStatus, { tone: Tone; text: string }> = {
  'on-track': { tone: 'good', text: 'On track' },
  'at-risk': { tone: 'critical', text: 'At risk' },
  'not-measured': { tone: 'neutral', text: 'Not measured' },
}

/** What kind of number a tile is, in words, with the glossary behind it (U128). */
const TILE_LABEL: Partial<Record<SourceLabel, { text: string; term: TermId }>> = {
  prediction: { text: 'Simulated', term: 'simulated' },
  estimate: { text: 'Estimate', term: 'estimate' },
  scenario: { text: 'Assumption', term: 'assumption' },
  measured: { text: 'Measured', term: 'measured' },
}

function TileLabel({ label }: { label: SourceLabel }) {
  const t = TILE_LABEL[label]
  const badge = <Badge tone={LABEL_TONE[label]}>{t?.text ?? LABEL_TEXT[label]}</Badge>
  return t ? <Term id={t.term}>{badge}</Term> : badge
}

function ActionLink({ to, children }: { to: string; children: ReactNode }) {
  const cls = 'inline-flex shrink-0 items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink'
  if (to.startsWith('#')) {
    const open = () => {
      const el = document.getElementById(to.slice(1))
      const det = el?.closest('details') ?? (el instanceof HTMLDetailsElement ? el : null)
      if (det) det.open = true
    }
    return (
      <a href={to} onClick={open} className={cls}>
        {children} <ArrowRight size={12} aria-hidden="true" />
      </a>
    )
  }
  return (
    <Link to={to} className={cls}>
      {children} <ArrowRight size={12} aria-hidden="true" />
    </Link>
  )
}

export function SummaryBlock({ s, aside }: { s: ReportSummary; aside?: ReactNode }) {
  const st = STATUS[s.status]
  return (
    <section aria-label="Summary" className="flex min-w-0 flex-col gap-14 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-8">
          <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">The question</span>
          <span className="text-12 text-adm-ink-2">
            <RichText text={s.question} />
          </span>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <p className="max-w-[860px] text-18 font-semibold leading-snug text-adm-ink">
            <RichText text={s.headline} />
          </p>
          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            <Badge tone={st.tone}>{st.text}</Badge>
            <span className="text-11 text-adm-muted">{s.statusNote}</span>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {s.tiles.map((t) => (
          <div key={t.label} className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-12">
            <dt className="flex flex-wrap items-center justify-between gap-4 text-11 font-medium text-adm-muted">
              <span>
                <RichText text={t.label} />
              </span>
              <TileLabel label={t.badge} />
            </dt>
            <dd className="text-24 font-semibold leading-tight tabular-nums text-adm-ink">
              <RichText text={t.value} />
            </dd>
            {t.delta && (
              <dd className={`text-12 font-medium tabular-nums ${t.deltaGood ? 'text-adm-good' : 'text-adm-critical'}`}>
                <RichText text={t.delta} />
              </dd>
            )}
            {t.note && (
              <dd className="text-11 text-adm-ink-2">
                <RichText text={t.note} />
              </dd>
            )}
          </div>
        ))}
      </dl>

      {aside}

      <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <h2 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">What to do next</h2>
          <ol className="flex flex-col gap-6">
            {s.actions.map((a, i) => (
              <li key={a.text} className="flex flex-col gap-4 rounded-8 border border-adm-line p-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
                <span className="text-13 text-adm-ink">
                  <span className="mr-6 font-semibold tabular-nums">{i + 1}.</span>
                  <RichText text={a.text} />
                </span>
                <ActionLink to={a.to}>{a.linkLabel}</ActionLink>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <h2 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">How sure are we</h2>
          {s.sure && (
            <p className="text-13 font-medium text-adm-ink">
              <RichText text={s.sure} />
            </p>
          )}
          <dl className="flex flex-col overflow-hidden rounded-8 border border-adm-line text-12">
            {([
              ['Measured', 'good', s.confidence.measured],
              [s.sure ? 'Simulated' : 'Predicted', 'info', s.confidence.predicted],
              ['Assumed', 'serious', s.confidence.assumed],
            ] as const).map(([k, tone, v]) => (
              <div key={k} className="flex items-start gap-8 border-b border-adm-line p-8 last:border-0">
                <dt className="w-[76px] shrink-0">
                  <Badge tone={tone}>{k}</Badge>
                </dt>
                <dd className="min-w-0 text-adm-ink-2">
                  <RichText text={v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** A collapsible block below the summary, closed by default. */
export function Details({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <details id={id} className="group min-w-0 scroll-mt-16 rounded-12 border border-adm-line bg-adm-surface">
      <summary className="flex cursor-pointer list-none items-center gap-8 p-14 text-14 font-semibold text-adm-ink hover:bg-adm-hover [&::-webkit-details-marker]:hidden">
        <ChevronRight size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-90" />
        <span>{title}</span>
        {hint && <span className="hidden text-12 font-normal text-adm-muted lg:inline">· {hint}</span>}
      </summary>
      <div className="flex min-w-0 flex-col gap-16 border-t border-adm-line p-12 lg:p-16">{children}</div>
    </details>
  )
}
