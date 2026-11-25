import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Panel } from '../../components/ui'
import { APP_PRICE, INPUT_KINDS, INPUT_LABEL, buildIterations, changedFrom } from '../../data/buyerAgentReport'
import { BUYER_REPORT_FINDINGS } from '../../data/reportSources'
import { InputGraph } from './InputGraph'
import { INPUT_DOT } from './reportColors'
import { LabelBadge, SourcesSection } from './ReportParts'
import { Details, SummaryBlock } from './ReportSummary'
import { SuccessTrend, WhatMoves } from './SummaryCharts'
import { buyerLevers, buyerSummary, buyerTrend } from '../../data/reportSummaries'

const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/**
 * Admin → Reports → Buyer agent report, rebuilt in U122 (J177). A buyer
 * report is made from five inputs: the personas, the product version, the
 * PRD, the business owner's documents and the price given at the time. Each
 * report version is shown with the value it used for each; every value comes
 * from buildInputs() in data/buyerAgentReport.ts, which cites the journal
 * where the run data is silent and says "not recorded" where nothing says.
 */
export function BuyerAgentReportPage() {
  const iterations = useMemo(() => buildIterations(), [])
  const summary = useMemo(() => buyerSummary(), [])
  const trend = useMemo(() => buyerTrend(), [])
  const levers = useMemo(() => buyerLevers(), [])

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Buyer agent report"
        description="What synthetic buyers, played by an AI agent, say about trying and paying for Aurelia. Every figure is a prediction."
        actions={
          <Link to="/admin/buyer-agent" className="inline-flex items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
            Full detail: Buyer agent results <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      <SummaryBlock s={summary} />

      <div className="grid gap-16 lg:grid-cols-[3fr_2fr]">
        <Panel title="Success trend, report v1 → v7" description="Would try, would pay and sure at day 30, on the offer each report led with. Hover a report for what changed.">
          <SuccessTrend points={trend} />
        </Panel>
        <section id="what-moves" className="min-w-0 scroll-mt-16">
          <Panel title="What moves success" description="Share of a report’s answers each change moved (v3, v6, v7).">
            <WhatMoves levers={levers} />
          </Panel>
        </section>
      </div>

      <Details title="How each report was made" hint="the five inputs and what changed between reports">
      <section id="input-graph" className="scroll-mt-16">
        <Panel title="Inputs → report versions" description="Each row is one of the five inputs, each column a report version. A cell is the exact value that report used.">
          <InputGraph iterations={iterations} />
        </Panel>
      </section>

      <section id="what-changed" className="scroll-mt-16">
        <Panel title="What changed between reports" description="The same five inputs, with the cells that differ from the report before highlighted.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Input</th>
                  {iterations.map((it) => (
                    <th key={it.id} className="py-6 pr-12 font-semibold">
                      <a href={`#${it.id}`} className="underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                        {it.name}
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INPUT_KINDS.map((k) => (
                  <tr key={k} className="border-b border-adm-line align-top last:border-0">
                    <th scope="row" className="py-8 pr-12 font-semibold whitespace-nowrap text-adm-ink">
                      <span className="inline-flex items-center gap-6">
                        <span className={`h-8 w-8 rounded-full ${INPUT_DOT[k]}`} aria-hidden="true" />
                        {INPUT_LABEL[k]}
                      </span>
                    </th>
                    {iterations.map((it, i) => {
                      const v = it.inputs[k]
                      const changed = changedFrom(iterations, i, k)
                      return (
                        <td key={it.id} className={`py-8 pr-12 ${changed ? 'bg-adm-s2/10 font-semibold text-adm-ink' : v.recorded ? 'text-adm-ink-2' : 'italic text-adm-muted'}`}>
                          {i > 0 && !changed ? <span className="text-adm-muted">= {v.short}</span> : v.short}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      </Details>

      <Details title="Every report, one card each" hint="question, inputs and headline results">
      <section aria-label="Report versions" className="grid gap-16 lg:grid-cols-2">
        {iterations.map((it) => (
          <article key={it.id} id={it.id} className="flex min-w-0 scroll-mt-16 flex-col gap-12 rounded-12 border border-adm-line bg-adm-surface p-16">
            <header className="flex flex-wrap items-center justify-between gap-8">
              <div className="flex flex-wrap items-baseline gap-8">
                <h2 className="text-15 font-semibold text-adm-ink">{it.name}</h2>
                <span className="text-12 text-adm-muted">{fmtDate(it.date)}</span>
              </div>
              <LabelBadge label="prediction" />
            </header>

            <div className="flex flex-col gap-4">
              <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">The question it answered</h3>
              <p className="text-13 text-adm-ink">{it.question}</p>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Inputs used</h3>
              <dl className="grid grid-cols-[130px_1fr] gap-x-10 gap-y-4 text-12">
                {INPUT_KINDS.map((k) => (
                  <div key={k} className="contents">
                    <dt className="flex items-center gap-6 text-adm-muted">
                      <span className={`h-6 w-6 shrink-0 rounded-full ${INPUT_DOT[k]}`} aria-hidden="true" />
                      {INPUT_LABEL[k]}
                    </dt>
                    <dd className={it.inputs[k].recorded ? 'min-w-0 text-adm-ink' : 'min-w-0 italic text-adm-muted'}>{it.inputs[k].short}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Headline results (prediction)</h3>
              <dl className="grid grid-cols-2 gap-8">
                {it.headline.slice(0, 4).map((f) => (
                  <div key={f.label} className="flex min-w-0 flex-col gap-2 rounded-8 bg-adm-bg p-10">
                    <dt className="text-11 text-adm-muted">{f.label}</dt>
                    <dd className="text-14 font-semibold tabular-nums text-adm-ink">{f.value}</dd>
                    {f.note && <dd className="text-11 text-adm-ink-2">{f.note}</dd>}
                  </div>
                ))}
              </dl>
            </div>

            <footer className="mt-auto flex justify-end border-t border-adm-line pt-10">
              <Link to={it.link} className="inline-flex items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                Full detail <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </footer>
          </article>
        ))}
      </section>
      </Details>

      <Details title="Sources and limits">
      <SourcesSection
        findings={BUYER_REPORT_FINDINGS}
        labels={['prediction', 'sample', 'document']}
        limits={[
          'Every person in every report is synthetic. The agent plays them; nobody real answered.',
          'One agent plays the whole panel, so all answers share its blind spots. Panels of 10 and 36 show which segments differ; they cannot size a market.',
          'No report records reading the PRD, so the PRD input is “not recorded” for all four.',
          'Reports v1–v3 walked no screens: they read the offer as text. Only report v4 walked real production versions.',
          `Reports v1–v3 tested prices that are not today’s app price (${APP_PRICE.amount}); their price answers hold for those prices only.`,
          'Reports v1 and v2 used persona generator 1, which made incoherent people; comparisons across reports are approximate.',
        ]}
      />
      </Details>
    </div>
  )
}
