import { PageTabs, ReportSummaryTab } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { RELEASES } from '../../../versions/releases'
import { ArrowRight, PanelRightOpen } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Panel } from '../../components/ui'
import { APP_PRICE, INPUT_KINDS, INPUT_LABEL, buildIterations, changedFrom } from '../../data/buyerAgentReport'
import { BUYER_REPORT_FINDINGS } from '../../data/reportSources'
import { buildIterationMap, mapFor } from '../../data/iterationMap'
import { DetailDrawerProvider, useDetail } from './DetailDrawer'
import { IterationMapView } from './IterationMapView'
import { InputGraph } from './InputGraph'
import { INPUT_DOT } from './reportColors'
import { LabelBadge, SourcesSection } from './ReportParts'
import { Details, SummaryBlock } from './ReportSummary'
import { DataSources } from './DataSources'
import { LatestChangeAside } from '../buyer/RunChanges'
import { BUYER_RUNS } from '../../data/buyerRuns'
import { SuccessTrend, WhatMoves } from './SummaryCharts'
import { buyerLevers, buyerSummary, buyerTrend } from '../../data/reportSummaries'
import { SEGMENT_LABEL, funnel, heat, objections, priceLadder, slopes as buildSlopes, vizTests } from '../../data/buyerViz'
import { PeopleGrid, PriceLadderChart, TestFunnels, WhatMovesSlope, WhoSaysYes, WhyNo } from './BuyerViz'
import { RichText } from './Term'

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
  return (
    <DetailDrawerProvider>
      <BuyerAgentReport />
    </DetailDrawerProvider>
  )
}

function BuyerAgentReport() {
  const iterations = useMemo(() => buildIterations(), [])
  const summary = useMemo(() => buyerSummary(), [])
  const trend = useMemo(() => buyerTrend(), [])
  const levers = useMemo(() => buyerLevers(), [])
  const map = useMemo(() => mapFor(buildIterationMap(), 'buyer'), [])
  const open = useDetail()
  const tests = useMemo(() => vizTests(), [])
  const slopes = useMemo(() => buildSlopes(), [])
  const t7 = tests[tests.length - 1]
  const f7 = funnel(t7)
  const best = [...heat(t7)].filter((c) => c.n >= 10).sort((a, b) => b.tries / b.n - a.tries / a.n)[0]
  const worst = [...heat(t7)].filter((c) => c.n >= 10).sort((a, b) => a.tries / a.n - b.tries / b.n)[0]
  const p7 = priceLadder(t7)
  const no7 = objections(t7)[0]
  const pc = (k: number, n: number) => `${Math.round((k / n) * 100)}%`

  const [, setPageTab] = usePageTab()
  const fullSummary = <SummaryBlock s={summary} aside={<LatestChangeAside version={BUYER_RUNS[BUYER_RUNS.length - 1].version} />} />
  // B6 (U146): the Summary tab stays under 150 words; the full block opens Detail.
  const summaryBlock = RELEASES.adminNav2 ? <SummaryBlock s={summary} compact /> : fullSummary

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Buyer agent report"
        description={summary.intro ?? ''}
        actions={
          <Link to="/admin/buyer-agent" className="inline-flex items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
            Every answer, in detail <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      {!RELEASES.adminNav2 && summaryBlock}
      <PageTabs summary={<ReportSummaryTab purpose="deciding whether simulated buyers would pay for Aurelia, and at what price." onDetail={() => setPageTab('detail')}>{summaryBlock}<DataSources route="/admin/reports/buyer-agent" /></ReportSummaryTab>}>
      {RELEASES.adminNav2 && (
        <Details id="full-summary" title="Full summary" hint="each test’s figures, the tile notes and how sure we are">
          {fullSummary}
        </Details>
      )}

      <p className="text-12 text-adm-muted">
        <RichText text="Every chart below is about {{simulated|simulated people}}: a prediction, not a measurement." />
      </p>

      <section id="funnels" className="min-w-0 scroll-mt-16">
        <Panel title={`Most drop out before paying: in test 7, ${f7[1].count} of ${f7[0].count} would try, ${f7[2].count} would pay, ${f7[3].count ?? 0} still use it at day 30`} description="Simulated. For each recent test: how many saw the offer, would try it, would pay for it and would still be using it a month later.">
          <TestFunnels tests={tests} />
        </Panel>
      </section>

      <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <section id="people" className="min-w-0 scroll-mt-16">
          <Panel title="Every simulated person, one mark each" description="Switch the test or the question. Tap a mark to read who that person is and why they answered as they did.">
            <PeopleGrid tests={tests} />
          </Panel>
        </section>
        <section id="who-says-yes" className="min-w-0 scroll-mt-16">
          <Panel
            title={best && worst ? `Most likely to try in test 7: ${SEGMENT_LABEL[best.segment].toLowerCase()} “${best.value}” (${pc(best.tries, best.n)}); least: ${SEGMENT_LABEL[worst.segment].toLowerCase()} “${worst.value}” (${pc(worst.tries, worst.n)})` : 'Who says yes'}
            description="Simulated. Test 7 by default; switch to test 6. Darker means more of that group said yes."
          >
            <WhoSaysYes tests={tests.slice(1)} />
          </Panel>
        </section>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <section id="price" className="min-w-0 scroll-mt-16">
          <Panel title={`$10 a month sits past what most call fair: in test 7, ${p7.overExpensive} of ${p7.n} already call it expensive`} description="Simulated. What people called too cheap, a bargain, getting expensive and too expensive, against Aurelia’s price.">
            <PriceLadderChart tests={tests} />
          </Panel>
        </section>
        <section id="why-no" className="min-w-0 scroll-mt-16">
          <Panel title={no7 ? `“${no7.label}” is the top reason not to pay in test 7 (${no7.count} of ${no7.n})` : 'Why people say no'} description="Simulated. The main reason each person gave for not paying, ranked. Tap a bar for what they said.">
            <WhyNo tests={tests} />
          </Panel>
        </section>
      </div>

      <section id="what-moves" className="grid min-w-0 scroll-mt-16 gap-16 lg:grid-cols-[3fr_2fr]">
        <Panel title={`“${slopes[0]?.theme ?? '—'}” changed the most answers`} description="Simulated. For each change we tested: among the people it moved, how many would try without it and with it.">
          <WhatMovesSlope slopes={slopes} />
        </Panel>
        <Panel title="How much of each panel a change moved" description="Each bar: the share of that test’s simulated people whose answer changed when we added the idea.">
          <WhatMoves levers={levers} />
        </Panel>
      </section>

      <section id="across-tests" className="min-w-0 scroll-mt-16">
        <Panel title="Across all seven tests, far fewer would pay than would try" description="Simulated. Oldest on the left. The people, offer and price changed between tests (written under each one), so read it as a story, not like for like. Hover or tap a test for details.">
          <SuccessTrend points={trend} />
        </Panel>
      </section>

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
              <button
                type="button"
                onClick={() => {
                  const node = map.nodes.find((n) => n.id === `r-${it.id}`)
                  open({
                    kicker: 'Buyer agent test',
                    title: it.name,
                    summary: it.question,
                    numbers: it.headline.slice(0, 4).map((f) => ({ label: f.label, value: f.value })),
                    labels: ['prediction'],
                    extra: node && it.decisions.length ? <p className="text-12 text-adm-ink-2">Led to: {it.decisions.map((d) => d.change).join(' · ')}</p> : undefined,
                    to: it.link,
                    toLabel: 'Every answer in this test',
                  })
                }}
                className="inline-flex items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink"
              >
                Details <PanelRightOpen size={12} aria-hidden="true" />
              </button>
            </footer>
          </article>
        ))}
      </section>
      </Details>

      <Details title="Sources used" hint="what each test learns from, and what came out of it">
        <Panel title="Sources used" description="Left: the kinds of source the tests read. Middle: the seven tests. Right: the decisions and versions they led to. Click a box for details.">
          <IterationMapView map={map} label="Sources used by the buyer agent tests, and the decisions and versions they led to." />
        </Panel>
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
      <DataSources route="/admin/reports/buyer-agent" full />
      </PageTabs>
    </div>
  )
}
