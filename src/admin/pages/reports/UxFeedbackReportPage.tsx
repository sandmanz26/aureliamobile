import { PageTabs, ReportSummaryTab } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { RELEASES } from '../../../versions/releases'
import { useMemo, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui'
import { plainText } from '../../data/glossary'
import { buildIterationMap, mapFor } from '../../data/iterationMap'
import { UX_FEEDBACK_FINDINGS } from '../../data/reportSources'
import { uxFeedbackSummary } from '../../data/reportSummaries'
import { buildParticipants, studyWeek } from '../../data/study'
import { FeedbackGroupViews } from '../ExperimentationV2Page'
import { DetailDrawerProvider } from './DetailDrawer'
import { IterationMapView } from './IterationMapView'
import { SourcesSection } from './ReportParts'
import { Details, SummaryBlock } from './ReportSummary'
import { DataSources } from './DataSources'

/**
 * Admin → Reports → UX feedback report (U129, J182): the latest feedback
 * group view (it was Product lab → Feedback group · v2) under the same
 * summary-first top as the other reports. Every figure is sample data until
 * the study runs on real accounts.
 */
export function UxFeedbackReportPage() {
  const [week] = useState(() => Math.max(0, Math.min(8, studyWeek(Date.now()))))
  const participants = useMemo(() => buildParticipants(week), [week])
  const summary = useMemo(() => uxFeedbackSummary(participants, week), [participants, week])
  const map = useMemo(() => mapFor(buildIterationMap(Math.max(1, week)), 'ux'), [week])

  const [, setPageTab] = usePageTab()
  const summaryBlock = (
        <SummaryBlock s={summary} />
  )

  return (
    <DetailDrawerProvider>
      <div className="flex flex-col gap-16">
        <PageHeader title="UX feedback report" description={plainText(summary.intro ?? '')} />

        {!RELEASES.adminNav2 && summaryBlock}
        <PageTabs summary={<ReportSummaryTab purpose="seeing what the feedback group tells us about the app, and what to change next." onDetail={() => setPageTab('detail')}>{summaryBlock}<DataSources route="/admin/reports/ux-feedback" /></ReportSummaryTab>}>

        <section id="ux-views" className="flex min-w-0 scroll-mt-16 flex-col gap-16">
          <FeedbackGroupViews participants={participants} week={week} />
        </section>

        <Details title="Sources used" hint="what this report learns from, and what came out of it">
          <Panel title="Sources used" description="Left: the kinds of source this report reads. Right: what it has led to so far. Click a box for details.">
            <IterationMapView map={map} label="Sources used by the UX feedback report, and what it led to." />
          </Panel>
          <SourcesSection
            findings={UX_FEEDBACK_FINDINGS}
            labels={['sample']}
            limits={[
              'Every person, score and session here is sample data, made up to look real. The study has not started.',
              'Wins can only show at week 8: the questionnaires are asked at weeks 0, 4 and 8.',
              'More use going with more change is a hint, not proof.',
            ]}
          />
        </Details>
        <DataSources route="/admin/reports/ux-feedback" full />
        </PageTabs>
      </div>
    </DetailDrawerProvider>
  )
}
