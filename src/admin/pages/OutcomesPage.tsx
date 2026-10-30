import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart } from '../components/Charts'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, Panel, StatCard } from '../components/ui'
import { useAdminData } from '../data/AdminDataContext'
import type { Outcome } from '../data/outcomes'
import { FOLLOW_UP_AT, GOALS, MEANINGFUL_CHANGE, OUTCOME_TONE, buildOutcomes, needsFollowUp, outcomeOf, summarise, who5Change } from '../data/outcomes'

interface Row {
  userId: string
  name: string
  goal: string
  chapters: number
  who5Start: number | ''
  who5Latest: number | ''
  who5Change: number | ''
  mood: string
  heart: string
  outcome: Outcome
  followUp: 'yes' | 'no'
}

const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`

/**
 * Well-being outcomes (U056) — Eugene's "how well have each user improved
 * their well-being therapeutically". One row per member, read from the
 * same three sources the consumer app has or plans: a WHO-5 score every
 * two weeks, the after-session check-ins, and a wearable where connected.
 */
export function OutcomesPage() {
  const { users } = useAdminData()
  const outcomes = useMemo(() => buildOutcomes(users), [users])
  const summary = summarise(outcomes)

  const rows: Row[] = outcomes.map((o) => {
    const change = who5Change(o)
    return {
      userId: o.userId,
      name: o.name,
      goal: o.goal,
      chapters: o.chapters,
      who5Start: o.who5[0] ?? '',
      who5Latest: o.who5.length > 1 ? o.who5[o.who5.length - 1] : '',
      who5Change: change ?? '',
      mood: o.moodStart !== null && o.moodLatest !== null ? `${o.moodStart} → ${o.moodLatest}` : '—',
      heart:
        o.wearable && o.restingHrStart !== null
          ? o.restingHrLatest !== null
            ? `${o.restingHrStart} → ${o.restingHrLatest} bpm`
            : `${o.restingHrStart} bpm (first week)`
          : '—',
      outcome: outcomeOf(o),
      followUp: needsFollowUp(o) ? 'yes' : 'no',
    }
  })

  // Goals nobody has two scores for yet are left out rather than drawn as 0.
  const byGoal = GOALS.flatMap((goal) => {
    const measured = outcomes.filter((o) => o.goal === goal).map(who5Change).filter((c): c is number => c !== null)
    return measured.length
      ? [{ label: `${goal} (${measured.length})`, value: Math.round((measured.reduce((s, c) => s + c, 0) / measured.length) * 10) / 10 }]
      : []
  })

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (row) => (
        <Link to={`/admin/users/${row.userId}`} className="font-medium text-adm-ink hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: 'goal', header: 'Goal', sortable: true },
    { key: 'chapters', header: 'Chapters', numeric: true, sortable: true },
    { key: 'who5Start', header: 'WHO-5 start', numeric: true, sortable: true },
    { key: 'who5Latest', header: 'WHO-5 latest', numeric: true, sortable: true },
    {
      key: 'who5Change',
      header: 'Change',
      numeric: true,
      sortable: true,
      render: (row) =>
        row.who5Change === '' ? (
          <span className="text-adm-muted">—</span>
        ) : (
          <span className={row.who5Change >= MEANINGFUL_CHANGE ? 'text-adm-good' : row.who5Change <= -MEANINGFUL_CHANGE ? 'text-adm-critical' : ''}>
            {signed(row.who5Change)}
          </span>
        ),
    },
    { key: 'mood', header: 'Check-ins (1–5)' },
    { key: 'heart', header: 'Resting heart rate' },
    {
      key: 'outcome',
      header: 'Outcome',
      sortable: true,
      render: (row) => (
        <span className="flex flex-wrap items-center gap-4">
          <Badge tone={OUTCOME_TONE[row.outcome]}>{row.outcome}</Badge>
          {row.followUp === 'yes' && <Badge tone="warning">follow up</Badge>}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Well-being outcomes"
        description="How each user's well-being has changed since they started: a WHO-5 well-being score every two weeks, their check-ins after each session, and their wearable where one is connected. Sample data until there is a backend."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Measured" value={`${summary.measured}`} hint={`of ${outcomes.length} members, 2+ WHO-5 scores`} />
        <StatCard
          label="Improved"
          value={summary.measured ? `${Math.round((summary.improved / summary.measured) * 100)}%` : '—'}
          hint={`${summary.improved} users, +${MEANINGFUL_CHANGE} or more`}
        />
        <StatCard
          label="Average change"
          value={summary.averageChange === null ? '—' : `${signed(Math.round(summary.averageChange * 10) / 10)}`}
          hint="WHO-5 points, measured users"
        />
        <StatCard label="Follow up" value={`${summary.followUp}`} hint={`latest WHO-5 at ${FOLLOW_UP_AT} or below`} />
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Where people are" description="Members by outcome so far.">
          <BarChart
            data={[
              { label: 'Improved', value: summary.improved },
              { label: 'Steady', value: summary.steady },
              { label: 'Declined', value: summary.declined },
              { label: 'Too early to tell', value: summary.tooEarly },
            ]}
            height={0}
          />
        </Panel>
        <Panel title="Average change by goal" description="WHO-5 points, users with two or more scores (how many in brackets).">
          <BarChart data={byGoal} format={(v) => signed(v)} color="var(--color-adm-good)" height={0} />
        </Panel>
      </div>

      <Panel title="Every user" description="Sort by change to see who improved most, or filter to those who need a follow-up.">
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={['name', 'goal']}
          filters={[
            { key: 'outcome', label: 'Outcome', options: ['improved', 'steady', 'declined', 'too early'] },
            { key: 'goal', label: 'Goal', options: [...GOALS] },
            { key: 'followUp', label: 'Follow up', options: ['yes', 'no'] },
          ]}
          exportName="wellbeing-outcomes"
        />
      </Panel>

      <Panel title="How to read this" description="What the numbers can and cannot say.">
        <ul className="flex list-disc flex-col gap-6 pl-18 text-13 text-adm-ink-2">
          <li>
            <b className="text-adm-ink">WHO-5</b> is a five-question well-being index from 0 to 100, widely used in research and
            primary care. A change of {MEANINGFUL_CHANGE} points is the threshold its authors treat as meaningful.
          </li>
          <li>
            A latest score of {FOLLOW_UP_AT} or below is the index's own cue that someone should check in with the person. It is
            flagged for a human to look at, not for Aurelia to act on.
          </li>
          <li>
            Self-reported and observational: it shows how people changed while using Aurelia, not that Aurelia caused it, and it
            is not a clinical diagnosis. Claims to users or partners need the wording agreed in Compliance first.
          </li>
          <li>The app does not ask the WHO-5 yet. Asking it at the start and with each two-week report is the proposed source.</li>
        </ul>
      </Panel>
    </>
  )
}
