import { PanelRightOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui'
import { b2b2cSummary } from '../../data/b2b2cReport'
import { buildIterationMap } from '../../data/iterationMap'
import { buyerSummary, combinationSummary, costSummary, uxFeedbackSummary } from '../../data/reportSummaries'
import { buildParticipants, studyWeek } from '../../data/study'
import { DetailDrawerProvider, useDetail } from './DetailDrawer'
import { reportItem } from './detailItems'
import { IterationMapView } from './IterationMapView'
import { plainText } from '../../data/glossary'

/**
 * Admin → Reports → Overview (U129, J182). How Aurelia improves, in one
 * paragraph and one map: the sources we learn from, the reports and tests
 * that read them, and the decisions and versions that came out. A click on
 * a report card or a box opens the drawer; the page does not change.
 */
export function ReportsOverviewPage() {
  return (
    <DetailDrawerProvider>
      <Overview />
    </DetailDrawerProvider>
  )
}

function Overview() {
  const open = useDetail()
  const [week] = useState(() => Math.max(1, Math.min(8, studyWeek(Date.now()))))
  const map = useMemo(() => buildIterationMap(week), [week])
  const reports = useMemo(() => {
    const participants = buildParticipants(week)
    return [
      { title: 'Buyer agent report', to: '/admin/reports/buyer-agent', s: buyerSummary() },
      { title: 'UX feedback report', to: '/admin/reports/ux-feedback', s: uxFeedbackSummary(participants, week) },
      { title: 'Cost report', to: '/admin/reports/cost', s: costSummary() },
      { title: 'B2B2C report', to: '/admin/reports/b2b2c', s: b2b2cSummary() },
      { title: 'Combination report', to: '/admin/reports/combination', s: combinationSummary(week) },
    ]
  }, [week])
  const count = (c: string) => map.nodes.filter((n) => n.column === c).length

  return (
    <div className="flex flex-col gap-16">
      <PageHeader title="Reports" description="Every report in one place, and how they connect. Click anything to see it in a side panel." />

      <section aria-labelledby="how-title" className="flex flex-col gap-8 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
        <h2 id="how-title" className="text-15 font-semibold text-adm-ink">
          How Aurelia improves: sources → tests → decisions → a new version
        </h2>
        <p className="max-w-[860px] text-14 leading-relaxed text-adm-ink-2">
          We learn from many sources: made-up people played by AI, the business owner’s documents, what the team has written in the wiki, what users tell us, and what things cost. Each report or test reads some of them and finds something. A finding becomes a decision in the decision log. Decisions that are built go into a new version of the app, and the next test starts from that version.
        </p>
      </section>

      <section aria-label="The reports" className="grid gap-12 lg:grid-cols-2 2xl:grid-cols-3">
        {reports.map((r) => (
          <button
            key={r.to}
            type="button"
            data-report-card={r.to}
            onClick={() => open(reportItem(r.title, r.to, r.s))}
            className="group flex min-w-0 flex-col gap-8 rounded-12 border border-adm-line bg-adm-surface p-16 text-left hover:border-adm-ink-2 hover:bg-adm-hover focus-visible:outline-2 focus-visible:outline-adm-accent"
          >
            <span className="flex items-center justify-between gap-8">
              <span className="text-15 font-semibold text-adm-ink">{r.title}</span>
              <PanelRightOpen size={14} aria-hidden="true" className="shrink-0 text-adm-muted group-hover:text-adm-ink" />
            </span>
            <span className="text-12 text-adm-ink">
              <span className="font-semibold uppercase tracking-wider text-adm-muted">Goal </span>
              {r.s.goal}
            </span>
            <span className="text-12 text-adm-ink-2">
              {plainText(r.s.question)}
            </span>
          </button>
        ))}
      </section>

      <Panel
        title="The iteration map"
        description={`${count('source')} kinds of source → ${count('report')} reports and tests → ${count('outcome')} decisions and versions. Hover a box to follow its lines; click it for details.`}
      >
        <IterationMapView map={map} label="Iteration map: the sources on the left feed the reports and tests in the middle, which led to the decisions and product versions on the right." />
      </Panel>
    </div>
  )
}
