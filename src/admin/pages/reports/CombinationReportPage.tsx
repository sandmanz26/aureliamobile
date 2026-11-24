import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, PageHeader, Panel } from '../../components/ui'
import { DESIGNS } from '../../data/buyerSim'
import { MATRIX_SEATS, buildMatrix, buildStages, type StageReading } from '../../data/combinationReport'
import { COMBINATION_FINDINGS } from '../../data/reportSources'
import { OUTCOMES, eur } from '../../data/retreatFunnel'
import { studyWeek } from '../../data/study'
import { LabelBadge, SourceChip, SourceGraph, SourcesSection } from './ReportParts'

const STATUS = { 'on-track': { tone: 'good', text: 'On track (prediction)' }, below: { tone: 'critical', text: 'Below target (prediction)' }, unmeasured: { tone: 'neutral', text: 'Unmeasured' } } as const

function Stage({ s, n }: { s: StageReading; n: number }) {
  return (
    <section id={s.findingId} className="flex min-w-0 scroll-mt-16 flex-col gap-14 rounded-12 border border-adm-line bg-adm-surface p-16">
      <header className="flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="text-15 font-semibold text-adm-ink">
            {n}. {s.title}
          </h2>
          <p className="mt-2 text-12 text-adm-muted">The brief: {s.brief}</p>
        </div>
        <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].text}</Badge>
      </header>

      <div className="flex flex-col gap-6">
        <h3 className="text-11 font-semibold uppercase tracking-wider text-adm-muted">What each source says</h3>
        <ul className="flex flex-col divide-y divide-adm-line">
          {s.lines.map((l) => (
            <li key={`${l.source}-${l.text}`} className="flex flex-col gap-4 py-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="lg:w-[280px] lg:shrink-0">
                <SourceChip id={l.source} cite={l.cite} />
              </div>
              <p className="min-w-0 flex-1 text-13 text-adm-ink-2">{l.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid gap-10 md:grid-cols-2">
        <div className="rounded-8 bg-adm-bg p-12">
          <dt className="text-11 font-semibold uppercase tracking-wider text-adm-good">Where they agree</dt>
          <dd className="mt-4 text-13 text-adm-ink">{s.agree}</dd>
        </div>
        <div className="rounded-8 bg-adm-bg p-12">
          <dt className="text-11 font-semibold uppercase tracking-wider text-adm-critical">Where they conflict</dt>
          <dd className="mt-4 text-13 text-adm-ink">{s.conflict}</dd>
        </div>
        <div className="rounded-8 border border-adm-line p-12">
          <dt className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Combined verdict</dt>
          <dd className="mt-4 text-13 font-medium text-adm-ink">{s.verdict}</dd>
        </div>
        <div className="rounded-8 border border-adm-line p-12">
          <dt className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Next move</dt>
          <dd className="mt-4 text-13 font-medium text-adm-ink">
            {s.next}
            {s.decision && (
              <Link to="/admin/business-funnel" className="ml-6 text-12 font-normal text-adm-ink-2 underline decoration-adm-axis underline-offset-2 hover:text-adm-ink">
                Decision {s.decision} in the log
              </Link>
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/**
 * Admin → Reports → Combination report (U116, J167): one reading of Aurelia,
 * stage by stage of the business funnel, joining the 2025 backend, the
 * production version, the interviews, the personas and buyer agents, the
 * funnels and the PRD. Production v3 (staging v5) with agent v3's rules.
 */
export function CombinationReportPage() {
  const [week] = useState(() => Math.max(1, Math.min(8, studyWeek(Date.now()))))
  const [stages] = useState(() => buildStages(week))
  const [matrix] = useState(() => buildMatrix())
  const middle = OUTCOMES.find((o) => o.id === 'middle')!

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Combination report"
        description="Aurelia read stage by stage of the business funnel, with every source side by side: the 2025 backend, what production v3 offers, what real users said, the personas and buyer agents, the funnels and the PRD. For each stage: what each source says, where they agree and conflict, and one verdict with a next move."
      />

      <Panel title="How this report was made" description="Which source feeds which part of the report. The colour of a line is the kind of source it comes from.">
        <SourceGraph findings={COMBINATION_FINDINGS} label="Graph: the sources on the left feed the funnel stages and the matrix on the right." />
      </Panel>

      <Panel title="How to read it" description="The version and rules every stage is read on.">
        <ul className="flex list-disc flex-col gap-4 pl-18 text-13 text-adm-ink-2">
          <li>The product is production v3 (staging v5), the production default. The buyer-agent figures are agent v3’s rules, the calibrated ones.</li>
          <li>
            Only the user interviews come from real people, and they are words, not numbers. Every figure is labelled: <LabelBadge label="prediction" /> <LabelBadge label="sample" /> <LabelBadge label="estimate" />.
          </li>
          <li>The feedback group column is sample data at study week {week}; it runs far above an open app because the group is recruited and supported.</li>
        </ul>
      </Panel>

      {stages.map((s, i) => (
        <Stage key={s.id} s={s} n={i + 1} />
      ))}

      <section id="matrix" className="scroll-mt-16">
        <Panel
          title="Offer × production version × agent rules"
          description={`The creator retreat’s three offers, each with the Plus rate the agents predict on each production version. Aurelia’s total from a ${MATRIX_SEATS}-seat cohort, year one, in euros.`}
        >
          <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
            <LabelBadge label="estimate" />
            <span>
              One assumption joins the two models: a week-8 graduate chooses Plus at the rate the agents predict for someone who hits the free limit on that version. Everything else is the retreat model’s “{middle.name}” outcome ({Math.round(middle.activeWeek8 * 100)}% active at week 8, {Math.round(middle.refundRate * 1000) / 10}% refunds).
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Offer</th>
                  <th className="py-6 pr-12 font-semibold">Rules</th>
                  <th className="py-6 pr-12 text-right font-semibold">Margin a ticket</th>
                  {DESIGNS.map((d) => (
                    <th key={d.id} className="py-6 pr-12 text-right font-semibold">
                      Prod v{d.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((r) => (
                  <tr key={`${r.offerId}-${r.agent}`} className="border-b border-adm-line last:border-0">
                    <td className="py-8 pr-12 font-medium text-adm-ink">{r.offer}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">Agent v{r.agent}</td>
                    <td className={`py-8 pr-12 text-right tabular-nums ${r.margin < 0 ? 'text-adm-critical' : 'text-adm-ink'}`}>{eur(r.margin)}</td>
                    {r.cells.map((c) => (
                      <td key={c.design} className="py-8 pr-12 text-right tabular-nums">
                        <span className={c.total < 0 ? 'font-semibold text-adm-critical' : 'font-semibold text-adm-ink'}>{eur(c.total)}</span>
                        <span className="block text-11 text-adm-muted">Plus {(c.plusRate * 100).toFixed(1)}%</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-12 text-adm-ink-2">
            Read across a row: the production version changes the Plus rate, which moves the total, but the offer’s terms decide its sign. The spec loses money on every ticket under every version and rule set; both redesigns stay positive. Agent v1’s rules are left out as uncalibrated.
          </p>
        </Panel>
      </section>

      <SourcesSection
        findings={COMBINATION_FINDINGS}
        limits={[
          'Nothing here is measured on real use: there is no backend, sign-in does not persist and nothing can be bought.',
          'The user interviews are three people, on an older build (they describe the v2 sample conversation); they say what matters, not how many.',
          'Buyer-agent numbers are synthetic people played by one agent; the feedback group column is sample data until the study runs on a backend.',
          'The PRD’s predicted figures come from an earlier simulation than the re-run, so the two disagree by design, not by error.',
          'The matrix joins two models with one stated assumption; it ranks options, it does not forecast revenue.',
          'The 2025 backend documents came without code; what they say it did is unverified.',
        ]}
      />
    </div>
  )
}
