import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart } from '../components/Charts'
import type { Tone } from '../components/ui'
import { Badge, PageHeader, Panel, StatCard } from '../components/ui'
import type { Band, Participant, TaskKind, WinStatus } from '../data/study'
import {
  COHORTS,
  STUDY,
  WIN_TONE,
  bandOf,
  bandShift,
  bandsFor,
  buildParticipants,
  cohortOf,
  doseBuckets,
  studyWeek,
  weekDate,
  weekTasks,
  who5Change,
  winStatus,
} from '../data/study'

const TONE_COLOR: Record<Tone, string> = {
  good: 'var(--color-adm-good)',
  info: 'var(--color-adm-s1)',
  warning: 'var(--color-adm-warning)',
  serious: 'var(--color-adm-serious)',
  critical: 'var(--color-adm-critical)',
  neutral: 'var(--color-adm-hover)',
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const signed = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}`)

type Tab = 'wins' | 'week' | 'engagement'

/** The v1 | v2 switch both pages carry, so a reviewer can compare. */
export function StudyVersionSwitch({ current }: { current: 1 | 2 }) {
  return (
    <nav aria-label="Section version" className="flex items-center gap-2 rounded-8 border border-adm-line bg-adm-surface p-2 text-12">
      {[1, 2].map((v) => (
        <Link
          key={v}
          to={v === 1 ? '/admin/experimentation' : '/admin/experimentation/v2'}
          aria-current={current === v ? 'page' : undefined}
          className={`rounded-4 px-10 py-4 font-medium ${current === v ? 'bg-adm-ink text-adm-surface' : 'text-adm-ink-2 hover:bg-adm-hover'}`}
        >
          Version {v}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Experimentation · feedback group, version 2 (U060), for review beside v1.
 * v1 is the researcher's view (criteria, completeness, protocol). v2 reads the
 * same study the way Eugene framed it — "solve and win them" — and as the
 * study team's week: who won, who is improving, what has to happen this week,
 * and whether use goes with change.
 */
export function ExperimentationV2Page() {
  const [now] = useState(() => Date.now())
  const week = studyWeek(now)
  const participants = useMemo(() => buildParticipants(week), [week])
  const [tab, setTab] = useState<Tab>('wins')

  return (
    <>
      <PageHeader
        title="Experimentation · feedback group"
        description="Version 2, for review: the same 30-person study read as wins (moving from the problem range into the healthy range), the study team's week, and whether more use goes with more change. Sample data."
        actions={<StudyVersionSwitch current={2} />}
      />

      <details className="rounded-12 border border-adm-line bg-adm-surface px-16 py-12 text-13 text-adm-ink-2">
        <summary className="cursor-pointer font-medium text-adm-ink">What is different from version 1</summary>
        <ul className="mt-8 flex list-disc flex-col gap-4 pl-18">
          <li><b className="text-adm-ink">Wins, not only change.</b> A meaningful change counts as <i>improving</i>; reaching the healthy band of the measure counts as a <i>win</i> ("bad sleep → good sleep"). People who started healthy are shown apart: they had little to win.</li>
          <li><b className="text-adm-ink">Where people started and where they are now</b>, per cohort, in the published severity bands of each questionnaire.</li>
          <li><b className="text-adm-ink">This week</b> is a checklist for the study team: calls first, then missed questionnaires, then what is due, nudges and interviews.</li>
          <li><b className="text-adm-ink">Engagement</b> shows every participant's weeks as a heat strip and whether heavier use goes with a bigger WHO-5 change. That is an association, not proof.</li>
          <li>Version 1 keeps the success criteria, the protocol and data quality. Both versions read the same data and the same rules.</li>
        </ul>
      </details>

      <div role="tablist" aria-label="Version 2 views" className="flex flex-wrap gap-6 border-b border-adm-line">
        {([['wins', 'Wins'], ['week', `This week (${week})`], ['engagement', 'Engagement']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-10 py-8 text-13 font-medium ${tab === id ? 'border-adm-ink text-adm-ink' : 'border-transparent text-adm-muted hover:text-adm-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'wins' && <Wins participants={participants} week={week} />}
      {tab === 'week' && <ThisWeek participants={participants} week={week} />}
      {tab === 'engagement' && <Engagement participants={participants} week={week} />}
    </>
  )
}

function BandBar({ bands, counts, label }: { bands: Band[]; counts: number[]; label: string }) {
  const total = counts.reduce((s, c) => s + c, 0)
  return (
    <div className="flex items-center gap-8">
      <span className="w-[44px] shrink-0 text-11 text-adm-muted">{label}</span>
      <div className="flex h-14 flex-1 overflow-hidden rounded-4 bg-adm-hover" role="img" aria-label={`${label}: ${bands.map((b, i) => `${counts[i]} ${b.label}`).join(', ')}`}>
        {total > 0 &&
          bands.map((b, i) =>
            counts[i] ? <span key={b.label} title={`${counts[i]} ${b.label}`} style={{ width: `${(counts[i] / total) * 100}%`, background: TONE_COLOR[b.tone] }} className="border-r-2 border-adm-surface last:border-r-0" /> : null,
          )}
      </div>
    </div>
  )
}

function Wins({ participants, week }: { participants: Participant[]; week: number }) {
  const statuses = participants.map((p) => ({ p, s: winStatus(p) }))
  const count = (s: WinStatus) => statuses.filter((x) => x.s === s).length
  const judged = statuses.filter((x) => x.s !== 'too early' && x.s !== 'started healthy').length

  return (
    <>
      <div className="grid grid-cols-2 gap-12 lg:grid-cols-5">
        <StatCard label="Won" value={`${count('won')}`} hint={`of ${judged} with a later score`} />
        <StatCard label="Improving" value={`${count('improving')}`} hint="meaningful change, not healthy yet" />
        <StatCard label="Steady" value={`${count('steady')}`} hint="no meaningful change" />
        <StatCard label="Worse" value={`${count('worse')}`} hint="meaningful change the wrong way" />
        <StatCard label="Started healthy" value={`${count('started healthy')}`} hint="little to win: a recruitment signal" />
      </div>
      {week < STUDY.weeks && (
        <p className="text-12 text-adm-muted">
          Interim at week {week}: the cohort measures are asked at weeks 0, 4 and 8, so most wins can only show up at week 8.
        </p>
      )}

      <div className="grid gap-12 lg:grid-cols-3">
        {COHORTS.map((c) => {
          const shift = bandShift(participants, c.id)
          const mine = statuses.filter((x) => x.p.cohort === c.id)
          const won = mine.filter((x) => x.s === 'won').length
          return (
            <Panel key={c.id} title={c.label} description={`${c.measure.name} · healthy band: ${bandsFor(c.measure.id).find((b) => b.healthy)?.label}`}>
              <p className="text-13 text-adm-ink">
                <span className="text-22 font-semibold tabular-nums">{won}</span>
                <span className="text-adm-muted"> of {mine.length} won</span>
              </p>
              <div className="flex flex-col gap-6">
                <BandBar bands={shift.bands} counts={shift.start} label="Start" />
                <BandBar bands={shift.bands} counts={shift.now} label="Now" />
                <ul className="flex flex-wrap gap-x-10 gap-y-2 text-11 text-adm-muted">
                  {shift.bands.map((b) => (
                    <li key={b.label} className="flex items-center gap-4">
                      <span aria-hidden="true" className="size-8 rounded-2" style={{ background: TONE_COLOR[b.tone] }} />
                      {b.label}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="flex flex-wrap gap-6" aria-label="Participants">
                {mine.map(({ p, s }) => (
                  <li key={p.id}>
                    <Link to={`/admin/experimentation/${p.id}`} title={s} className="hover:opacity-80">
                      <Badge tone={WIN_TONE[s]}>{p.id} · {s}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )
        })}
      </div>

      <Panel title="Well-being bands across the group" description="WHO-5 at baseline and at the latest score. Below 50 is low well-being; 28 or below is a follow-up cue.">
        <Who5Shift participants={participants} />
      </Panel>
    </>
  )
}

function Who5Shift({ participants }: { participants: Participant[] }) {
  const bands = bandsFor('who5')
  const withLater = participants.filter((p) => p.who5[0] !== null && p.who5.slice(1).some((v) => v !== null))
  const tally = (pick: (p: Participant) => number) => bands.map((b) => withLater.filter((p) => bandOf('who5', pick(p)).label === b.label).length)
  const latest = (p: Participant) => [...p.who5].reverse().find((v) => v !== null) as number
  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      <BandBar bands={bands} counts={tally((p) => p.who5[0] as number)} label="Start" />
      <BandBar bands={bands} counts={tally(latest)} label="Now" />
      <p className="text-11 text-adm-muted">{withLater.length} people with a baseline and a later WHO-5 · {bands.map((b) => b.label).join(' / ')}</p>
    </div>
  )
}

const KIND_LABEL: Record<TaskKind, string> = {
  'follow-up': 'Follow-ups: call today',
  reminder: 'Missed questionnaires',
  questionnaire: 'Due this week',
  nudge: 'Low use: check in',
  interview: 'Interviews',
}
const KIND_TONE: Record<TaskKind, Tone> = { 'follow-up': 'critical', reminder: 'warning', questionnaire: 'info', nudge: 'neutral', interview: 'neutral' }

function ThisWeek({ participants, week }: { participants: Participant[]; week: number }) {
  const tasks = weekTasks(participants, week)
  const [ticked, setTicked] = useState<Set<string>>(() => new Set())
  const kinds = [...new Set(tasks.map((t) => t.kind))]
  const isDone = (id: string, done: boolean) => done || ticked.has(id)
  const open = tasks.filter((t) => !isDone(t.id, t.done)).length
  const cohortLabel = new Map(participants.map((p) => [p.id, cohortOf(p.cohort).label]))
  const [showDone, setShowDone] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 gap-12 lg:grid-cols-5">
        <StatCard label="Open this week" value={String(open)} hint={`week ${week} · ${date(weekDate(week))} → ${date(weekDate(Math.min(week + 1, STUDY.weeks)))}`} />
        {kinds.slice(0, 4).map((k) => (
          <StatCard key={k} label={KIND_LABEL[k]} value={String(tasks.filter((t) => t.kind === k && !isDone(t.id, t.done)).length)} hint={`of ${tasks.filter((t) => t.kind === k).length}`} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-8">
        <p className="text-12 text-adm-muted">Ticks are kept on this page only until the study runs on the backend; questionnaires tick themselves when answered.</p>
        <label className="flex items-center gap-6 text-12 text-adm-ink-2">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show answered questionnaires ({tasks.filter((t) => t.done).length})
        </label>
      </div>
      <div className="grid gap-12 lg:grid-cols-2">
        {kinds.map((k) => (
          <Panel key={k} title={KIND_LABEL[k]} actions={<Badge tone={KIND_TONE[k]}>{tasks.filter((t) => t.kind === k && !isDone(t.id, t.done)).length} open</Badge>}>
            <ul className="flex flex-col divide-y divide-adm-line">
              {tasks
                .filter((t) => t.kind === k && (showDone || !t.done))
                .map((t) => {
                  const done = isDone(t.id, t.done)
                  return (
                    <li key={t.id} className="flex items-center gap-10 py-8 text-13">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`${t.participantId}: ${t.text}`}
                        disabled={t.done}
                        onClick={() => setTicked((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else n.add(t.id); return n })}
                        className={`flex size-18 shrink-0 items-center justify-center rounded-4 border ${done ? 'border-adm-good bg-adm-good text-white' : 'border-adm-line bg-adm-surface'} disabled:opacity-70`}
                      >
                        {done && <Check size={12} />}
                      </button>
                      <Link to={`/admin/experimentation/${t.participantId}`} className="w-[36px] shrink-0 font-medium text-adm-ink hover:underline">{t.participantId}</Link>
                      <span className={`min-w-0 flex-1 ${done ? 'text-adm-muted line-through' : 'text-adm-ink-2'}`}>{t.text}</span>
                      <span className="hidden text-11 text-adm-muted sm:inline">{cohortLabel.get(t.participantId)}</span>
                    </li>
                  )
                })}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  )
}

function shade(n: number) {
  if (n === 0) return 'var(--color-adm-hover)'
  if (n <= 2) return 'color-mix(in oklab, var(--color-adm-good) 30%, transparent)'
  if (n <= 4) return 'color-mix(in oklab, var(--color-adm-good) 65%, transparent)'
  return 'var(--color-adm-good)'
}

function Engagement({ participants, week }: { participants: Participant[]; week: number }) {
  const dose = doseBuckets(participants, week)
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Panel title="Every participant's weeks" description="Sessions played per week (darker = more). Three a week is the adherence line. Grouped by cohort.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-12">
            <thead>
              <tr className="text-left text-11 uppercase tracking-wider text-adm-muted">
                <th className="px-6 py-6 font-medium">Who</th>
                {Array.from({ length: week }, (_, i) => (
                  <th key={i} className="px-2 py-6 text-center font-medium">W{i + 1}</th>
                ))}
                <th className="px-6 py-6 text-right font-medium">WHO-5 Δ</th>
                <th className="px-6 py-6 font-medium">Own measure</th>
              </tr>
            </thead>
            <tbody>
              {COHORTS.flatMap((c) =>
                participants
                  .filter((p) => p.cohort === c.id)
                  .map((p, i) => (
                    <tr key={p.id} className={i === 0 ? 'border-t border-adm-line' : ''}>
                      <td className="px-6 py-3">
                        <Link to={`/admin/experimentation/${p.id}`} className="font-medium text-adm-ink hover:underline">{p.id}</Link>
                        {i === 0 && <span className="ml-6 text-11 text-adm-muted">{c.label}</span>}
                      </td>
                      {p.sessionsByWeek.map((n, w) => (
                        <td key={w} className="px-2 py-3">
                          <span title={`Week ${w + 1}: ${n} sessions`} className={`block h-16 rounded-2 text-center text-10 leading-[16px] ${n >= 5 ? 'text-white' : 'text-adm-ink'}`} style={{ background: shade(n) }}>
                            {n}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-3 text-right tabular-nums">{signed(who5Change(p))}</td>
                      <td className="px-6 py-3"><Badge tone={WIN_TONE[winStatus(p)]}>{winStatus(p)}</Badge></td>
                    </tr>
                  )),
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Does more use go with more change?" description="Mean WHO-5 change by average sessions per week. With 30 people this is a direction, not proof, and people who feel better may simply use it more.">
        <BarChart data={dose.map((d) => ({ label: `${d.label} (${d.n})`, value: d.meanChange ?? 0 }))} format={(v) => signed(v)} color="var(--color-adm-good)" height={0} />
        <p className="text-11 text-adm-muted">The number in brackets is how many people fall in each group.</p>
      </Panel>
    </div>
  )
}
