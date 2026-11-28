import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePageTab } from '../../components/pageTab'
import { Badge, type Tone } from '../../components/ui'
import type { TermId } from '../../data/glossary'
import { briefSources, type BriefStep, type Confidence, type ReportBrief } from '../../data/reportBriefs'
import { DataSourceTypeBadge } from './DataSources'
import { RichText, Term } from './Term'

/*
 * The top of every report and analysis Summary tab (U151, J208), one look
 * everywhere: 1. what the report is for, 2. its conclusion (the answer, up to
 * three key numbers with how far to trust each, what it means for us, the
 * next steps), 3. where it comes from (a compact list of the sources, with a
 * link to the full Data sources block at the end of Detail). Copy and numbers
 * come from data/reportBriefs.ts; sources from data/dataSources.ts.
 */

const CONFIDENCE: Record<Confidence, { text: string; tone: Tone; term: TermId }> = {
  measured: { text: 'Measured', tone: 'good', term: 'measured' },
  simulated: { text: 'Simulated', tone: 'info', term: 'simulated' },
  assumed: { text: 'Assumed', tone: 'serious', term: 'assumption' },
}

/** How many sources the compact list shows before "and N more". */
const MAX_SOURCES = 6

const linkCls = 'inline-flex shrink-0 items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink'

export function ConfidenceBadge({ c }: { c: Confidence }) {
  const k = CONFIDENCE[c]
  return (
    <Term id={k.term}>
      <Badge tone={k.tone}>{k.text}</Badge>
    </Term>
  )
}

function BlockLabel({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-8 text-12 font-semibold uppercase tracking-wider text-adm-muted">
      <span aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-adm-ink text-11 text-adm-surface tabular-nums">
        {n}
      </span>
      {children}
    </h2>
  )
}

function StepLink({ s }: { s: BriefStep }) {
  if (!s.to) return null
  const label = s.linkLabel ?? 'Open'
  if (s.to.startsWith('#')) {
    return (
      <a href={s.to} className={linkCls}>
        {label} <ArrowRight size={12} aria-hidden="true" />
      </a>
    )
  }
  return (
    <Link to={s.to} className={linkCls}>
      {label} <ArrowRight size={12} aria-hidden="true" />
    </Link>
  )
}

export function ReportHeaderCard({ route, brief }: { route: string; brief: ReportBrief }) {
  const [, setTab] = usePageTab()
  const sources = briefSources(route)
  const shown = sources.slice(0, MAX_SOURCES)
  const more = sources.length - shown.length

  function toDetail(selector?: string) {
    setTab('detail')
    if (!selector) return
    // Detail un-hides after the URL change renders; wait for it, then scroll.
    let tries = 0
    const go = () => {
      const el = document.querySelector<HTMLElement>(selector)
      if (el?.offsetParent) el.scrollIntoView({ block: 'start' })
      else if (tries++ < 30) requestAnimationFrame(go)
    }
    requestAnimationFrame(go)
  }

  return (
    <section aria-label="Summary" data-report-header={route} className="flex min-w-0 flex-col rounded-12 border border-adm-line bg-adm-surface">
      <div data-block="purpose" className="flex flex-col gap-6 border-b border-adm-line p-16 lg:px-20">
        <BlockLabel n={1}>What this report is for</BlockLabel>
        <p className="max-w-[920px] text-15 font-medium leading-snug text-adm-ink">
          <RichText text={brief.purpose} />
        </p>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div data-block="conclusion" className="flex min-w-0 flex-col gap-12 border-b border-adm-line p-16 lg:border-r lg:border-b-0 lg:px-20">
          <BlockLabel n={2}>Conclusion</BlockLabel>
          <p className="text-16 font-semibold leading-snug text-adm-ink">
            <RichText text={brief.answer} />
          </p>
          <dl className="grid gap-8 sm:grid-cols-3">
            {brief.numbers.slice(0, 3).map((x) => (
              <div key={x.label} data-key-number className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-10">
                <dt className="text-12 leading-snug text-adm-muted">
                  <RichText text={x.label} />
                </dt>
                <dd className="text-20 font-semibold leading-tight tabular-nums text-adm-ink">{x.value}</dd>
                <dd>
                  <ConfidenceBadge c={x.confidence} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="rounded-8 border-l-4 border-adm-ink bg-adm-bg px-12 py-8 text-13 text-adm-ink" data-meaning>
            <span className="font-semibold">What it means for us: </span>
            <RichText text={brief.meaning} />
          </p>
          <div className="flex flex-col gap-6">
            <h3 className="text-13 font-semibold text-adm-ink">Next steps</h3>
            <ol className="flex flex-col gap-6">
              {brief.next.slice(0, 2).map((s, i) => (
                <li key={s.text} className="flex flex-col gap-4 text-13 text-adm-ink lg:flex-row lg:items-baseline lg:justify-between lg:gap-12">
                  <span>
                    <span className="mr-6 font-semibold tabular-nums">{i + 1}.</span>
                    <RichText text={s.text} />
                  </span>
                  <StepLink s={s} />
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div data-block="sources" className="flex min-w-0 flex-col gap-10 p-16 lg:px-20">
          <BlockLabel n={3}>Where it comes from</BlockLabel>
          <ul className="flex flex-col">
            {shown.map((s) => (
              <li key={s.id} data-brief-source={s.id} className="flex min-w-0 flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-adm-line py-6 first:border-0 first:pt-0">
                <span className="min-w-0 text-13 text-adm-ink">{s.source.name}</span>
                <DataSourceTypeBadge type={s.type} />
              </li>
            ))}
          </ul>
          {more > 0 && <p className="text-12 text-adm-muted">and {more} more</p>}
          <button type="button" onClick={() => toDetail('[data-sources="full"]')} className={`${linkCls} self-start`}>
            All sources, with files and dates <ArrowRight size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex justify-end border-t border-adm-line px-16 py-10 lg:px-20">
        <button type="button" onClick={() => toDetail()} className="inline-flex items-center gap-4 text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
          See everything in Detail <ArrowRight size={13} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
