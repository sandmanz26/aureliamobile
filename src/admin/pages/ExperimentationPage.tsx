import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { BarChart, LineChart } from '../components/Charts'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Legend, PageHeader, Panel, StatCard } from '../components/ui'
import { StudyVersionSwitch } from './ExperimentationV2Page'
import type { CohortId, Participant, ParticipantStatus } from '../data/study'
import {
  COHORTS,
  CONDITION_WEEKS,
  CRITERION_TONE,
  MEASURES,
  STATUS_TONE,
  STUDY,
  WHO5_FOLLOW_UP,
  WHO5_MCID,
  WHO5_WEEKS,
  adherence,
  buildParticipants,
  cohortOf,
  completeness,
  conditionImprovement,
  evaluateCriteria,
  followUpReasons,
  isConditionResponder,
  isWho5Responder,
  studyWeek,
  weekDate,
  who5Change,
  who5Trajectory,
} from '../data/study'

const COHORT_COLORS: Record<CohortId, string> = {
  sleep: 'var(--color-adm-s1)',
  calm: 'var(--color-adm-s2)',
  clarity: 'var(--color-adm-s3)',
  energy: 'var(--color-adm-s4)',
  focus: 'var(--color-adm-accent)',
  regulate: 'var(--color-adm-ink-2)',
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`)
const signed = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}`)
const arrow = (xs: (number | null)[]) => {
  const first = xs[0]
  const lastValue = [...xs].reverse().find((v) => v !== null)
  if (first === null || first === undefined) return '—'
  return lastValue === undefined || lastValue === first ? String(first) : `${first} → ${lastValue}`
}

type Tab = 'overview' | 'participants' | 'protocol' | 'quality'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'protocol', label: 'What we collect' },
  { id: 'quality', label: 'Data & safety' },
]

function useStudy() {
  const [now] = useState(() => Date.now())
  const week = studyWeek(now)
  const participants = useMemo(() => buildParticipants(week), [week])
  return { week, participants }
}

/**
 * Experimentation · feedback-group study (U058). Eugene: "a section in admin
 * where we can track and measure the feedback group in validation of
 * therapeutic outcomes to our MVP", over 2 months. Rules and sample data are
 * in data/study.ts; the protocol and its reasons are in the PDF beside the
 * other reviews.
 */
export function ExperimentationPage() {
  const { week, participants } = useStudy()
  const [tab, setTab] = useState<Tab>('overview')
  const endsOn = weekDate(STUDY.weeks)

  return (
    <>
      <PageHeader
        title="Experimentation · feedback group"
        description={`${STUDY.target} people, each with one issue Aurelia targets, use it for ${STUDY.weeks} weeks. We measure whether their well-being and their own issue improve on validated questionnaires, and whether they keep using it. Sample data until the study runs on the backend.`}
        actions={
          <div className="flex flex-wrap items-center gap-8">
            <Badge tone="info">{week >= STUDY.weeks ? 'Completed' : week === 0 ? 'Starting' : 'Running'} · week {week} of {STUDY.weeks}</Badge>
            <StudyVersionSwitch current={1} />
          </div>
        }
      />

      <StudyTimeline week={week} endsOn={endsOn} />

      <div role="tablist" aria-label="Study views" className="flex flex-wrap gap-6 border-b border-adm-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-10 py-8 text-13 font-medium ${tab === t.id ? 'border-adm-ink text-adm-ink' : 'border-transparent text-adm-muted hover:text-adm-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview week={week} participants={participants} />}
      {tab === 'participants' && <Participants week={week} participants={participants} />}
      {tab === 'protocol' && <Protocol />}
      {tab === 'quality' && <Quality week={week} participants={participants} />}
    </>
  )
}

function StudyTimeline({ week, endsOn }: { week: number; endsOn: string }) {
  return (
    <section aria-label="Study timeline" className="rounded-12 border border-adm-line bg-adm-surface p-16">
      <div className="flex flex-wrap items-baseline justify-between gap-8 text-12 text-adm-muted">
        <span>
          {date(weekDate(0))} → {date(endsOn)} · {STUDY.id}
        </span>
        <span>WHO-5 every 2 weeks · cohort measure and PHQ-9 at weeks 0, 4, 8 · check-in after every session</span>
      </div>
      <ol className="mt-12 grid grid-cols-9 gap-4">
        {Array.from({ length: STUDY.weeks + 1 }, (_, w) => {
          const done = w < week
          const now = w === week
          const who5 = (WHO5_WEEKS as readonly number[]).includes(w)
          const cond = (CONDITION_WEEKS as readonly number[]).includes(w)
          return (
            <li key={w} className="flex min-w-0 flex-col gap-4">
              <span className={`h-6 rounded-full ${done ? 'bg-adm-good' : now ? 'bg-adm-accent' : 'bg-adm-hover'}`} />
              <span className={`text-11 tabular-nums ${now ? 'font-semibold text-adm-ink' : 'text-adm-muted'}`}>Wk {w}</span>
              <span className="truncate text-10 text-adm-muted">{[who5 && 'WHO-5', cond && 'Cohort + PHQ-9'].filter(Boolean).join(' · ') || ' '}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Overview({ week, participants }: { week: number; participants: Participant[] }) {
  const criteria = evaluateCriteria(participants, week)
  const active = participants.filter((p) => p.status === 'active' || p.status === 'completed').length
  const measured = participants.map(isWho5Responder).filter((r): r is boolean => r !== null)
  const complete = participants.reduce((s, p) => s + completeness(p, week), 0) / participants.length
  const followUps = participants.filter((p) => followUpReasons(p).length > 0).length
  const trajectory = who5Trajectory(participants, week)

  return (
    <>
      <div className="grid grid-cols-2 gap-12 lg:grid-cols-5">
        <StatCard label="Enrolled" value={`${participants.length} / ${STUDY.target}`} hint={`${COHORTS.length} cohorts`} />
        <StatCard label="Active" value={String(active)} hint={`${participants.filter((p) => p.status === 'withdrawn').length} withdrawn`} />
        <StatCard label="WHO-5 +10 so far" value={measured.length ? pct(measured.filter(Boolean).length / measured.length) : '—'} hint={`of ${measured.length} with 2+ scores`} />
        <StatCard label="Data collected" value={pct(complete)} hint="of assessments due" />
        <StatCard label="Follow-ups" value={String(followUps)} hint="need a person" />
      </div>

      <Panel title="Success criteria" description="Set before the study starts, so the result cannot be read to fit. Interim until week 8.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-left text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 font-medium">Question</th>
                <th className="px-10 py-8 font-medium">Pass line</th>
                <th className="px-10 py-8 font-medium">Now</th>
                <th className="px-10 py-8 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id} className="border-b border-adm-line last:border-b-0">
                  <td className="px-10 py-10 font-medium text-adm-ink">{c.label}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{c.target}</td>
                  <td className="px-10 py-10 tabular-nums text-adm-ink">
                    {c.display}
                    <span className="block text-11 text-adm-muted">{c.note}</span>
                  </td>
                  <td className="px-10 py-10">
                    <Badge tone={CRITERION_TONE[c.status]}>{c.status.replace('_', ' ')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Well-being by cohort" description={`Mean WHO-5 (0–100) at each assessment. A rise of ${WHO5_MCID} points is meaningful for one person.`}>
          {trajectory.length > 1 ? (
            <>
              <LineChart
                data={trajectory}
                xKey="date"
                series={COHORTS.map((c) => ({ key: c.id, label: c.label, color: COHORT_COLORS[c.id] }))}
                height={240}
              />
              <Legend items={COHORTS.map((c) => ({ label: c.label, color: COHORT_COLORS[c.id] }))} />
            </>
          ) : (
            <p className="py-8 text-13 text-adm-muted">The first follow-up WHO-5 is at week 2.</p>
          )}
        </Panel>
        <Panel title="By cohort" description="Each cohort has its own validated measure.">
          <CohortTable week={week} participants={participants} />
        </Panel>
      </div>

      <Panel title="What this can and cannot show" description="Read before quoting any number from this page.">
        <ul className="flex list-disc flex-col gap-6 pl-18 text-13 text-adm-ink-2">
          <li>
            <b className="text-adm-ink">It can show</b> whether people improve while using Aurelia, how many, on which issue, and whether they keep
            using it: enough to decide whether the MVP is worth a controlled trial.
          </li>
          <li>
            <b className="text-adm-ink">It cannot show</b> that Aurelia caused the change. There is no control group, 30 people is small (a 50%
            responder rate has a 95% range of roughly 32–68%), and people who sign up to feel better often do.
          </li>
          <li>Nothing here is a clinical diagnosis or a claim we can make to users. Claims need Compliance wording first.</li>
          <li>
            A WHO-5 of {WHO5_FOLLOW_UP} or below, or any PHQ-9 item 9 answer above zero, goes to the study lead the same day. Aurelia never handles it
            on its own.
          </li>
        </ul>
      </Panel>
    </>
  )
}

function CohortTable({ week, participants }: { week: number; participants: Participant[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-13">
        <thead>
          <tr className="border-b border-adm-line text-left text-11 uppercase tracking-wider text-adm-muted">
            <th className="px-8 py-8 font-medium">Cohort</th>
            <th className="px-8 py-8 text-right font-medium">n</th>
            <th className="px-8 py-8 text-right font-medium">WHO-5 Δ</th>
            <th className="px-8 py-8 text-right font-medium">Own measure</th>
            <th className="px-8 py-8 text-right font-medium">Adherent</th>
          </tr>
        </thead>
        <tbody>
          {COHORTS.map((c) => {
            const ps = participants.filter((p) => p.cohort === c.id)
            const changes = ps.map(who5Change).filter((v): v is number => v !== null)
            const resp = ps.map(isConditionResponder).filter((v): v is boolean => v !== null)
            const adh = ps.map((p) => adherence(p, week)).filter((v): v is number => v !== null)
            return (
              <tr key={c.id} className="border-b border-adm-line last:border-b-0">
                <td className="px-8 py-8">
                  <span className="flex items-center gap-6 text-adm-ink">
                    <span aria-hidden="true" className="size-8 shrink-0 rounded-full" style={{ background: COHORT_COLORS[c.id] }} />
                    {c.label}
                  </span>
                  <span className="block pl-14 text-11 text-adm-muted">{c.measure.short}</span>
                </td>
                <td className="px-8 py-8 text-right tabular-nums">{ps.length}</td>
                <td className="px-8 py-8 text-right tabular-nums">{changes.length ? signed(Math.round(changes.reduce((s, v) => s + v, 0) / changes.length)) : '—'}</td>
                <td className="px-8 py-8 text-right tabular-nums">{resp.length ? `${resp.filter(Boolean).length}/${resp.length} met` : '—'}</td>
                <td className="px-8 py-8 text-right tabular-nums">{adh.length ? pct(adh.filter((a) => a >= 0.6).length / adh.length) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface Row {
  id: string
  cohort: string
  status: ParticipantStatus
  wearable: string
  who5: string
  who5Change: number | ''
  condition: string
  conditionMet: 'yes' | 'no' | '—'
  adherence: number | ''
  completeness: number
  followUp: string
  lastActive: string
}

function Participants({ week, participants }: { week: number; participants: Participant[] }) {
  const rows: Row[] = participants.map((p) => {
    const met = isConditionResponder(p)
    const adh = adherence(p, week)
    return {
      id: p.id,
      cohort: cohortOf(p.cohort).label,
      status: p.status,
      wearable: p.wearable ?? '—',
      who5: arrow(p.who5),
      who5Change: who5Change(p) ?? '',
      condition: `${cohortOf(p.cohort).measure.short} ${arrow(p.condition)}`,
      conditionMet: met === null ? '—' : met ? 'yes' : 'no',
      adherence: adh === null ? '' : Math.round(adh * 100),
      completeness: Math.round(completeness(p, week) * 100),
      followUp: followUpReasons(p).join(', '),
      lastActive: p.lastActiveAt,
    }
  })

  const columns: Column<Row>[] = [
    { key: 'id', header: 'Participant', sortable: true, render: (r) => <Link to={`/admin/experimentation/${r.id}`} className="font-medium text-adm-ink hover:underline">{r.id}</Link> },
    { key: 'cohort', header: 'Cohort', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
    { key: 'who5', header: 'WHO-5' },
    {
      key: 'who5Change',
      header: 'Δ',
      numeric: true,
      sortable: true,
      render: (r) => (r.who5Change === '' ? <span className="text-adm-muted">—</span> : <span className={r.who5Change >= WHO5_MCID ? 'text-adm-good' : r.who5Change <= -WHO5_MCID ? 'text-adm-critical' : ''}>{signed(r.who5Change)}</span>),
    },
    { key: 'condition', header: 'Own measure' },
    { key: 'conditionMet', header: 'Met', sortable: true },
    { key: 'adherence', header: 'Adherence', numeric: true, sortable: true, render: (r) => (r.adherence === '' ? '—' : `${r.adherence}%`) },
    { key: 'completeness', header: 'Data', numeric: true, sortable: true, render: (r) => <span className={r.completeness < 85 ? 'text-adm-critical' : ''}>{r.completeness}%</span> },
    { key: 'followUp', header: 'Follow up', render: (r) => (r.followUp ? <Badge tone="warning">{r.followUp}</Badge> : null) },
    { key: 'lastActive', header: 'Last active', sortable: true, render: (r) => date(r.lastActive) },
  ]

  return (
    <Panel title="Participants" description="Pseudonymous ids only. Names and contact details stay with the research team, never in this tool.">
      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={['id', 'cohort', 'followUp']}
        filters={[
          { key: 'cohort', label: 'Cohort', options: COHORTS.map((c) => c.label) },
          { key: 'status', label: 'Status', options: ['active', 'paused', 'withdrawn', 'completed'] },
          { key: 'conditionMet', label: 'Met own measure', options: ['yes', 'no', '—'] },
        ]}
        exportName="feedback-group-participants"
        pageSize={15}
      />
    </Panel>
  )
}

function Protocol() {
  const roleTone = { primary: 'info', secondary: 'neutral', safety: 'critical', engagement: 'neutral', experience: 'neutral' } as const
  const inAppTone = { yes: 'good', partly: 'warning', no: 'critical' } as const
  return (
    <>
      <Panel title="Data we need to collect" description="Every measure, when it is asked, where it comes from, and whether production can collect it today.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-left text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 font-medium">Measure</th>
                <th className="px-10 py-8 font-medium">Role</th>
                <th className="px-10 py-8 font-medium">When</th>
                <th className="px-10 py-8 font-medium">Source</th>
                <th className="px-10 py-8 font-medium">In the app today</th>
                <th className="px-10 py-8 font-medium">To build</th>
              </tr>
            </thead>
            <tbody>
              {MEASURES.map((m) => (
                <tr key={m.id} className="border-b border-adm-line align-top last:border-b-0">
                  <td className="px-10 py-10">
                    <span className="font-medium text-adm-ink">{m.name}</span>
                    <span className="mt-2 block text-12 text-adm-muted">{m.what}</span>
                  </td>
                  <td className="px-10 py-10"><Badge tone={roleTone[m.role]}>{m.role}</Badge></td>
                  <td className="px-10 py-10 text-adm-ink-2">{m.when}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{m.source}</td>
                  <td className="px-10 py-10"><Badge tone={inAppTone[m.inApp]}>{m.inApp}</Badge></td>
                  <td className="px-10 py-10 text-12 text-adm-ink-2">{m.build}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Cohort measures" description="One validated questionnaire per issue, with the change that matters for one person.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-left text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 font-medium">Cohort</th>
                <th className="px-10 py-8 font-medium">App goal</th>
                <th className="px-10 py-8 font-medium">Measure</th>
                <th className="px-10 py-8 font-medium">Range</th>
                <th className="px-10 py-8 font-medium">Meaningful change</th>
                <th className="px-10 py-8 text-right font-medium">Places</th>
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c) => (
                <tr key={c.id} className="border-b border-adm-line last:border-b-0">
                  <td className="px-10 py-10 font-medium text-adm-ink">{c.label}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{c.goal}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{c.measure.name}</td>
                  <td className="px-10 py-10 tabular-nums text-adm-ink-2">{c.measure.min}–{c.measure.max}</td>
                  <td className="px-10 py-10 text-adm-ink-2">{c.measure.mcid} points {c.measure.better === 'lower' ? 'lower' : 'higher'}</td>
                  <td className="px-10 py-10 text-right tabular-nums">{c.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}

function Quality({ week, participants }: { week: number; participants: Participant[] }) {
  const missing = participants.filter((p) => p.status !== 'withdrawn' && completeness(p, week) < 1)
  const followUps = participants.filter((p) => followUpReasons(p).length > 0)
  const byCohort = COHORTS.map((c) => {
    const ps = participants.filter((p) => p.cohort === c.id)
    return { label: c.label, value: Math.round((ps.reduce((s, p) => s + completeness(p, week), 0) / ps.length) * 100) }
  })
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <Panel title="Follow-ups for a person" description={`PHQ-9 item 9, WHO-5 ≤ ${WHO5_FOLLOW_UP}, or a paused participant. Handled the same day by the study lead.`}>
        {followUps.length ? (
          <ul className="flex flex-col divide-y divide-adm-line">
            {followUps.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-12 py-8 text-13">
                <Link to={`/admin/experimentation/${p.id}`} className="font-medium text-adm-ink hover:underline">
                  {p.id} <span className="font-normal text-adm-muted">· {cohortOf(p.cohort).label}</span>
                </Link>
                <Badge tone="warning">{followUpReasons(p).join(', ')}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-13 text-adm-muted">None open.</p>
        )}
      </Panel>
      <Panel title="Data collected by cohort" description="Share of assessments due so far that were answered. Below 85% weakens the result.">
        <BarChart data={byCohort} format={(v) => `${v}%`} color="var(--color-adm-good)" height={0} />
      </Panel>
      <Panel title="Missing assessments" description="Send a reminder; after two misses, the research team calls.">
        {missing.length ? (
          <ul className="flex flex-col divide-y divide-adm-line">
            {missing.map((p) => {
              const gaps = [
                ...WHO5_WEEKS.filter((w, i) => w <= week && p.who5[i] === null).map((w) => `WHO-5 wk ${w}`),
                ...CONDITION_WEEKS.filter((w, i) => w <= week && p.condition[i] === null).map((w) => `${cohortOf(p.cohort).measure.short} wk ${w}`),
              ]
              return (
                <li key={p.id} className="flex items-center justify-between gap-12 py-8 text-13">
                  <Link to={`/admin/experimentation/${p.id}`} className="font-medium text-adm-ink hover:underline">{p.id}</Link>
                  <span className="text-12 text-adm-ink-2">{gaps.join(' · ')}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="py-8 text-13 text-adm-muted">Nothing missing.</p>
        )}
      </Panel>
    </div>
  )
}

/** One participant's study record. */
export function ExperimentationParticipantPage() {
  const { pid } = useParams()
  const { week, participants } = useStudy()
  const p = participants.find((x) => x.id === pid)
  if (!p) return <Navigate to="/admin/experimentation" replace />
  const cohort = cohortOf(p.cohort)
  const who5Rows = WHO5_WEEKS.filter((w) => w <= week).map((w, i) => ({ date: weekDate(w), who5: p.who5[i] ?? 0 }))
  const imp = conditionImprovement(p)
  const reasons = followUpReasons(p)

  return (
    <>
      <div className="flex items-center gap-12 border-b border-adm-line pb-16">
        <Link to="/admin/experimentation" aria-label="Back to the study" className="flex size-32 shrink-0 items-center justify-center rounded-8 border border-adm-line text-adm-ink-2 hover:bg-adm-hover">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-8">
            <h1 className="text-19 font-semibold text-adm-ink">{p.id}</h1>
            <Badge tone="info">{cohort.label}</Badge>
            <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
            {reasons.length > 0 && <Badge tone="warning">Follow up: {reasons.join(', ')}</Badge>}
          </div>
          <p className="mt-2 text-13 text-adm-ink-2">
            Goal “{cohort.goal}” · enrolled {date(p.enrolledOn)} · {p.wearable ?? 'no wearable'} · week {week} of {STUDY.weeks}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="WHO-5" value={arrow(p.who5)} hint={who5Change(p) === null ? 'needs a second score' : `${signed(who5Change(p))} points (${WHO5_MCID} is meaningful)`} />
        <StatCard label={cohort.measure.short} value={arrow(p.condition)} hint={imp === null ? 'measured at weeks 4 and 8' : `${signed(imp)} better (${cohort.measure.mcid} is meaningful)`} />
        <StatCard label="Adherence" value={pct(adherence(p, week))} hint="weeks with 3+ sessions" />
        <StatCard label="Mood lift per session" value={p.moodLift === null ? '—' : signed(p.moodLift)} hint={`${p.checkIns} check-ins, 1–5 scale`} />
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <Panel title="WHO-5 over time" description="0–100, every two weeks. 0 = not collected.">
          {who5Rows.length > 1 ? <LineChart data={who5Rows} xKey="date" series={[{ key: 'who5', label: 'WHO-5', color: 'var(--color-adm-s1)' }]} height={200} /> : <p className="py-8 text-13 text-adm-muted">Baseline only so far.</p>}
        </Panel>
        <Panel title="Sessions played per week" description="Played, not opened. Three a week is the adherence line.">
          <BarChart data={p.sessionsByWeek.map((n, i) => ({ label: `Week ${i + 1}`, value: n }))} height={0} />
        </Panel>
      </div>

      <Panel title="Assessments" description="What was collected and what is still due.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-13">
            <thead>
              <tr className="border-b border-adm-line text-left text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-10 py-8 font-medium">Week</th>
                <th className="px-10 py-8 font-medium">Due</th>
                <th className="px-10 py-8 text-right font-medium">WHO-5</th>
                <th className="px-10 py-8 text-right font-medium">{cohort.measure.short}</th>
              </tr>
            </thead>
            <tbody>
              {WHO5_WEEKS.map((w, i) => {
                const ci = (CONDITION_WEEKS as readonly number[]).indexOf(w)
                const future = w > week
                return (
                  <tr key={w} className="border-b border-adm-line last:border-b-0">
                    <td className="px-10 py-8 tabular-nums">Wk {w}</td>
                    <td className="px-10 py-8 text-adm-ink-2">{date(weekDate(w))}</td>
                    <td className="px-10 py-8 text-right tabular-nums">{future ? <span className="text-adm-muted">due</span> : (p.who5[i] ?? <span className="text-adm-critical">missed</span>)}</td>
                    <td className="px-10 py-8 text-right tabular-nums">{ci < 0 ? '' : future ? <span className="text-adm-muted">due</span> : (p.condition[ci] ?? <span className="text-adm-critical">missed</span>)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-12 text-adm-muted">Interview notes and contact details are kept by the research team, outside this tool.</p>
      </Panel>
    </>
  )
}
