import { AlertTriangle, ArrowRight, Tag } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, PageHeader, Panel } from '../../components/ui'
import { STATUS_LABEL } from '../../data/businessFunnel'
import { APP_PRICE, buildIterations } from '../../data/buyerAgentReport'
import { OVERALL_SUMMARY } from '../../data/buyerRerunSummaries'
import { BUYER_REPORT_FINDINGS } from '../../data/reportSources'
import { LabelBadge, SourceChip, SourceGraph, SourcesSection } from './ReportParts'

const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/**
 * Admin → Reports → Buyer agent report (U116, J167): every buyer-agent
 * iteration as a timeline, for the business owner. The full answers stay on
 * Buyer agent results; this page says what each run asked, what changed,
 * what came out, how it moved from the one before, and what it led to.
 */
export function BuyerAgentReportPage() {
  const iterations = useMemo(() => buildIterations(), [])
  const fed = iterations.flatMap((it) => it.decisions.map((d) => ({ d, it: it.name })))
  const decisions = [...new Map(fed.map((x) => [x.d.id, x.d])).values()]

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Buyer agent report"
        description="Every time the buyer agent was run, in order: the question, what changed, what came out, how it moved from the run before, and the decision it fed. Every figure is a prediction: synthetic people answered by an AI agent. Nothing here was measured on real users."
        actions={
          <Link to="/admin/buyer-agent" className="inline-flex items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-12 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover">
            Full detail: Buyer agent results <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      <Panel title="How this report was made" description="Where each part of this report comes from. Each line is a source feeding a section.">
        <SourceGraph findings={BUYER_REPORT_FINDINGS} label="Graph: the sources on the left feed the report’s sections on the right." />
      </Panel>

      <section id="price-used" className="scroll-mt-16">
        <Panel title="Price used per iteration" description={`The price the personas saw is part of each result. Today the app asks ${APP_PRICE.amount} (${APP_PRICE.where}).`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Iteration</th>
                  <th className="py-6 pr-12 font-semibold">Price tested</th>
                  <th className="py-6 pr-12 font-semibold">Currency · period</th>
                  <th className="py-6 pr-12 font-semibold">Where it came from</th>
                  <th className="py-6 font-semibold">Against today’s app</th>
                </tr>
              </thead>
              <tbody>
                {iterations.map((it) => (
                  <tr key={it.id} className="border-b border-adm-line align-top last:border-0">
                    <td className="py-8 pr-12 font-medium whitespace-nowrap text-adm-ink">
                      <a href={`#${it.id}`} className="underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">{it.name}</a>
                    </td>
                    <td className="py-8 pr-12 font-semibold text-adm-ink">{it.priceTested.amount}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">{it.priceTested.currency} · {it.priceTested.period}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">{it.priceTested.origin}</td>
                    <td className="py-8">
                      <Badge tone={it.priceTested.differsFromApp ? 'serious' : 'good'}>{it.priceTested.differsFromApp ? 'Differs' : 'Same as the app'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section aria-label="Iterations" className="flex flex-col">
        {iterations.map((it, i) => (
          <div key={it.id} className="relative flex gap-12 pb-16 lg:gap-16">
            <div className="flex w-28 shrink-0 flex-col items-center" aria-hidden="true">
              <span className="flex h-28 w-28 items-center justify-center rounded-full bg-adm-ink text-12 font-semibold text-adm-surface">{i + 1}</span>
              {i < iterations.length - 1 && <span className="mt-4 w-2 flex-1 bg-adm-line" />}
            </div>
            <article id={it.id} className="flex min-w-0 flex-1 scroll-mt-16 flex-col gap-14 rounded-12 border border-adm-line bg-adm-surface p-16">
              <header className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex flex-wrap items-baseline gap-8">
                  <h2 className="text-15 font-semibold text-adm-ink">{it.name}</h2>
                  <span className="text-12 text-adm-muted">{fmtDate(it.date)}</span>
                </div>
                <LabelBadge label="prediction" />
              </header>

              <div className="flex flex-col gap-6 rounded-8 border border-adm-s1/40 bg-adm-s1/6 p-12">
                <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
                  <span className="inline-flex items-center gap-6 text-11 font-semibold uppercase tracking-wider text-adm-s1">
                    <Tag size={12} aria-hidden="true" /> Price tested
                  </span>
                  <span className="text-14 font-semibold text-adm-ink">{it.priceTested.amount}</span>
                </div>
                <p className="text-12 text-adm-ink-2">
                  {it.priceTested.currency} · {it.priceTested.period}. {it.priceTested.origin}
                </p>
                {it.priceTested.warning && (
                  <p className="flex items-start gap-6 text-12 font-medium text-adm-ink">
                    <AlertTriangle size={13} className="mt-2 shrink-0 text-adm-serious" aria-hidden="true" />
                    {it.priceTested.warning}
                  </p>
                )}
              </div>

              <div className="grid gap-14 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4">
                  <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">The question</h3>
                  <p className="text-13 text-adm-ink">{it.question}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">What changed from the one before</h3>
                  <ul className="flex list-disc flex-col gap-4 pl-16 text-12 text-adm-ink-2">
                    {it.changed.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Headline results (prediction)</h3>
                <dl className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
                  {it.headline.map((f) => (
                    <div key={f.label} className="flex min-w-0 flex-col gap-2 rounded-8 bg-adm-bg p-10">
                      <dt className="text-11 text-adm-muted">{f.label}</dt>
                      <dd className="text-15 font-semibold tabular-nums text-adm-ink">{f.value}</dd>
                      {f.note && <dd className="text-11 text-adm-ink-2">{f.note}</dd>}
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid gap-14 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4">
                  <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Change from the one before</h3>
                  <ul className="flex list-disc flex-col gap-4 pl-16 text-12 text-adm-ink-2">
                    {it.delta.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">The decision it fed</h3>
                  {it.decisions.length ? (
                    <ul className="flex flex-col gap-6 text-12">
                      {it.decisions.map((d) => (
                        <li key={d.id} className="flex flex-wrap items-start gap-6">
                          <Badge tone={d.status === 'shipped' || d.status === 'measured' ? 'good' : d.status === 'decided' ? 'info' : 'neutral'}>{STATUS_LABEL[d.status]}</Badge>
                          <span className="min-w-0 flex-1 text-adm-ink-2">{d.change}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-12 text-adm-ink-2">{it.decisionNote}</p>
                  )}
                </div>
              </div>

              <details className="group text-12">
                <summary className="cursor-pointer font-medium text-adm-ink-2 hover:text-adm-ink">What the run found, in its own words</summary>
                <ul className="mt-8 flex list-disc flex-col gap-4 pl-16 text-adm-ink-2">
                  {it.findings.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </details>

              <footer className="flex flex-wrap items-center justify-between gap-8 border-t border-adm-line pt-10">
                <div className="flex flex-wrap gap-6">
                  {it.sources.map((s) => (
                    <SourceChip key={s} id={s} />
                  ))}
                </div>
                <Link to={it.link} className="inline-flex items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                  Full detail <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </footer>
            </article>
          </div>
        ))}
      </section>

      <section id="decisions" className="scroll-mt-16">
        <Panel title="Decisions it fed" description="Entries in the business funnel’s decision log that cite the buyer agent. Their status is the log’s, as written in the code.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Stage</th>
                  <th className="py-6 pr-12 font-semibold">Finding</th>
                  <th className="py-6 pr-12 font-semibold">Change</th>
                  <th className="py-6 pr-12 font-semibold">From</th>
                  <th className="py-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d.id} className="border-b border-adm-line align-top last:border-0">
                    <td className="py-8 pr-12 capitalize text-adm-ink">{d.stage}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">{d.finding}</td>
                    <td className="py-8 pr-12 text-adm-ink">{d.change}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">{fed.filter((x) => x.d.id === d.id).map((x) => x.it).join(', ')}</td>
                    <td className="py-8">
                      <Badge tone={d.status === 'shipped' || d.status === 'measured' ? 'good' : 'neutral'}>{STATUS_LABEL[d.status]}</Badge>
                      {d.result && <p className="mt-4 text-11 text-adm-muted">{d.result}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section id="reading" className="scroll-mt-16">
        <Panel title="What it adds up to" description="The agent’s own reading of the re-run, written from its computed tallies (tests pin the figures it quotes).">
          <ul className="flex list-disc flex-col gap-8 pl-18 text-13 text-adm-ink-2">
            {OVERALL_SUMMARY.slice(3).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <SourcesSection
        findings={BUYER_REPORT_FINDINGS}
        limits={[
          'Every person in every run is synthetic. The agent plays them; nobody real answered.',
          'One agent plays the whole panel, so all answers share its blind spots.',
          'Panels of 10 and 36 show which segments differ; they cannot size a market.',
          'Runs v1 and v2 used persona generator 1, which made incoherent people (the run found them); comparisons across runs are approximate.',
          'Offer B in run v3 is a proposal answered as if built. Nothing can be bought yet, so “would pay” is intent.',
          'No agent can tell whether the first session actually works for someone; staying depends on that.',
          `Runs v1–v3 tested prices that are not today’s app price (${APP_PRICE.amount}): v1 the admin’s mock $9.99 / $79, v2 mock regional prices, v3 those and a proposed $59.99 a year. Their price answers and “would pay” hold for those prices only.`,
        ]}
      />
    </div>
  )
}
