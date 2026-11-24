import { CircleHelp, Download, ExternalLink, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GuideTour, type TourStep } from '../components/GuideTour'
import { Modal } from '../components/Modal'
import { Badge, Button, FormField, PageHeader, Panel, inputClass, textareaClass } from '../components/ui'
import {
  DECISIONS_KEY,
  DECISION_STATUSES,
  DEFAULT_DECISIONS,
  DecisionsSchema,
  STAGES,
  STATUS_LABEL,
  TARGETS_KEY,
  TargetsSchema,
  biggestLeak,
  funnelMetrics,
  stageStatus,
  withNewDefaults,
  type Decision,
  type FunnelMetric,
  type StageId,
} from '../data/businessFunnel'
import { AGENT_RULES, DESIGNS, report, type AgentId, type DesignId } from '../data/buyerSim'
import { studyWeek } from '../data/study'
import { INITIAL_JOURNEY, JourneyMapSchema, STORAGE_KEY, upgradeJourney } from '../data/userJourney'
import { readJson, readString, writeJson, writeString } from '../../lib/storage'
import { RetreatFunnel } from './funnel/RetreatFunnel'

const GUIDE_KEY = 'aurelia.admin.funnelGuide'
const pct = (v: number) => `${Math.round(v * 100)}%`

/**
 * Business funnel (U108, J153): Eugene's "Moving from Bad to Good" stages,
 * adapted to the app, as the scoreboard of the dual-track loop. Targets per
 * stage, the buyer agents' prediction for a chosen version, the feedback
 * group beside it, the biggest gap, and a decision log that closes the loop.
 */
export function BusinessFunnelPage() {
  const [params, setParams] = useSearchParams()
  const agent = (Number(params.get('agent')) || 3) as AgentId
  const design = (Number(params.get('design')) || 3) as DesignId
  const view = params.get('view') === 'retreat' ? 'retreat' : 'app'
  const [now] = useState(() => Date.now())
  const week = Math.max(1, Math.min(8, studyWeek(now)))
  const [targets, setTargets] = useState<Record<string, number>>(() => readJson(TARGETS_KEY, TargetsSchema, {}))
  const [decisions, setDecisions] = useState<Decision[]>(() => withNewDefaults(readJson(DECISIONS_KEY, DecisionsSchema, DEFAULT_DECISIONS)))
  const [adding, setAdding] = useState<StageId | null>(null)
  const [guide, setGuide] = useState(() => readString(GUIDE_KEY) !== 'seen')
  const [notice, setNotice] = useState<string | null>(null)

  const metrics = funnelMetrics(agent, design, week)
  const leak = biggestLeak(metrics, targets)
  const journey = upgradeJourney(readJson(STORAGE_KEY, JourneyMapSchema, INITIAL_JOURNEY))
  const momentTitle = new Map(journey.stages.flatMap((s) => s.moments.map((m) => [m.id, m.title] as const)))
  const targetOf = (m: FunnelMetric) => targets[m.id] ?? m.target

  function setSource(a: AgentId, d: DesignId) {
    setParams({ agent: String(a), design: String(d) }, { replace: true })
  }
  function saveTargets(next: Record<string, number>) {
    setTargets(next)
    writeJson(TARGETS_KEY, next)
  }
  function saveDecisions(next: Decision[], message: string) {
    setDecisions(next)
    setNotice(writeJson(DECISIONS_KEY, next) ? message : 'Browser storage is full. Export a backup.')
    window.setTimeout(() => setNotice(null), 3000)
  }
  function exportJson() {
    const body = { exportedAt: new Date().toISOString(), source: { agent: AGENT_RULES[agent].name, design: DESIGNS[design - 1].name, studyWeek: week }, targets, metrics, decisions }
    const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'aurelia-business-funnel.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Business funnel"
        description="Eugene’s four stages from a bad state to Aurelia Plus, as they work in the app today, and the result they serve. Each stage has a target, the buyer agents’ prediction and the feedback group beside it. The stage furthest below its target is what to fix next."
        actions={
          <div className="flex flex-wrap gap-8">
            <Button size="sm" icon={<CircleHelp size={13} />} onClick={() => setGuide(true)} data-tour="guide">
              Guide
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={exportJson}>
              Export (JSON)
            </Button>
          </div>
        }
      />

      <div role="tablist" aria-label="Funnel" className="flex w-fit flex-wrap gap-4 rounded-8 bg-adm-bg p-4">
        {(
          [
            ['app', 'App: freemium to Plus'],
            ['retreat', 'Creator retreat (B2B2C)'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setParams(id === 'retreat' ? { view: 'retreat' } : {}, { replace: true })}
            className={`rounded-8 px-12 py-6 text-12 font-medium ${view === id ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'retreat' ? (
        <RetreatFunnel />
      ) : (
        <>

      <div className="flex flex-wrap items-end gap-12" data-tour="source">
        <FormField label="Agent prediction for">
          <select aria-label="Production version" className={`${inputClass} w-auto!`} value={design} onChange={(e) => setSource(agent, Number(e.target.value) as DesignId)}>
            {DESIGNS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Played by">
          <select aria-label="Agent rules" className={`${inputClass} w-auto!`} value={agent} onChange={(e) => setSource(Number(e.target.value) as AgentId, design)}>
            {([3, 2, 1] as const).map((a) => (
              <option key={a} value={a}>
                {AGENT_RULES[a].name}
                {a === 3 ? ' (best estimate)' : a === 1 ? ' (uncalibrated)' : ''}
              </option>
            ))}
          </select>
        </FormField>
        <Link to={`/admin/buyer-agent?view=versions&agent=${agent}&design=${design}`} className="mb-6 inline-flex items-center gap-4 text-12 text-adm-ink-2 underline decoration-adm-line underline-offset-2 hover:text-adm-ink">
          See every persona’s walk <ExternalLink size={11} aria-hidden="true" />
        </Link>
        {notice && (
          <span role="status" className="mb-6 text-12 text-adm-good">
            {notice}
          </span>
        )}
      </div>

      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5" data-tour="stages" aria-label="Stages">
        {STAGES.map((s, i) => {
          const own = metrics.filter((m) => m.stage === s.id)
          const head = own[0]
          const st = stageStatus(metrics, targets, s.id)
          const isLeak = leak === s.id
          return (
            <li key={s.id} className={`flex flex-col gap-6 rounded-12 border bg-adm-surface p-12 ${isLeak ? 'border-adm-critical ring-1 ring-adm-critical' : 'border-adm-line'}`}>
              <div className="flex items-center justify-between gap-6">
                <span className="text-11 font-semibold tabular-nums text-adm-muted">{i < 4 ? `Stage ${i + 1}` : 'Result'}</span>
                {isLeak ? <Badge tone="critical">Biggest gap</Badge> : <Badge tone={st.status === 'on-track' ? 'good' : 'warning'}>{st.status === 'on-track' ? 'On target' : 'Below target'}</Badge>}
              </div>
              <h2 className="text-14 font-semibold leading-[19px] text-adm-ink">{s.title}</h2>
              <p className="line-clamp-3 text-12 leading-[17px] text-adm-ink-2">{s.aurelia}</p>
              <div className="mt-auto pt-4">
                <p className="text-11 text-adm-muted">{head.label}</p>
                <p className="text-[22px] font-semibold leading-[28px] tabular-nums text-adm-ink">{pct(head.agent)}</p>
                <p className="text-11 tabular-nums text-adm-muted">target {pct(targetOf(head))}</p>
              </div>
            </li>
          )
        })}
      </ol>

      {leak && <FixNext stage={leak} metrics={metrics} targets={targets} decisions={decisions} leaveReasons={report(agent, design).leaveReasons} onAdd={() => setAdding(leak)} />}

      <Panel title="Stage by stage" description="Bars: the agent’s prediction (solid) and the feedback group (outlined), with the target as a line. The feedback group is recruited and supported, so read it as the ceiling, not the open funnel. Change a target and the gaps move." actions={<FunnelLegend />}>
        <div className="flex flex-col gap-18" data-tour="metrics">
          {STAGES.map((s) => (
            <section key={s.id} aria-label={s.title} className="flex flex-col gap-8 border-t border-adm-line pt-12 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-8">
                <h3 className="text-13 font-semibold text-adm-ink">
                  {s.title}
                  {leak === s.id && (
                    <span className="ml-8">
                      <Badge tone="critical">Biggest gap</Badge>
                    </span>
                  )}
                </h3>
                <p className="text-11 text-adm-muted">
                  Eugene: <span className="text-adm-ink-2">{s.eugene}</span>
                </p>
              </div>
              {metrics
                .filter((m) => m.stage === s.id)
                .map((m) => (
                  <MetricRow key={m.id} m={m} target={targetOf(m)} onTarget={(v) => saveTargets({ ...targets, [m.id]: v })} />
                ))}
              <p className="flex flex-wrap items-center gap-6 text-11 text-adm-muted">
                Where it happens:
                {s.moments.map((id) => (
                  <Link key={id} to="/admin/user-journey" className="rounded-full border border-adm-line px-8 py-2 text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink">
                    {momentTitle.get(id) ?? id}
                  </Link>
                ))}
              </p>
              {s.later.length > 0 && (
                <p className="text-11 leading-[16px] text-adm-muted">
                  Also from the 10 metrics (J150), measured once there is a backend: <span className="text-adm-ink-2">{s.later.join(' · ')}</span>
                </p>
              )}
            </section>
          ))}
        </div>
      </Panel>

      <Panel
        title="Decision log"
        description="The loop’s memory: what a track found, the change it led to, and whether it was shipped and measured again. Saved in this browser; export to share."
        actions={
          <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setAdding(leak ?? 'entry')}>
            Add a decision
          </Button>
        }
      >
        <ul className="flex flex-col gap-10" data-tour="log">
          {[...decisions]
            .sort((a, b) => STAGES.findIndex((s) => s.id === a.stage) - STAGES.findIndex((s) => s.id === b.stage))
            .map((d) => (
              <li key={d.id} className="grid gap-8 rounded-8 border border-adm-line p-12 lg:grid-cols-[150px_1fr_150px]">
                <div className="flex flex-col gap-4">
                  <span className="text-11 font-medium text-adm-muted">{STAGES.find((s) => s.id === d.stage)?.title}</span>
                  <span className="text-11 tabular-nums text-adm-muted">{d.date}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-13 font-semibold leading-[19px] text-adm-ink">{d.change}</p>
                  <p className="mt-2 max-w-[70ch] text-12 leading-[18px] text-adm-ink-2">{d.finding}</p>
                  <p className="mt-4 text-11 text-adm-muted">
                    From: {d.source}
                    {d.version && ` · In: ${d.version}`}
                  </p>
                  {d.result && <p className="mt-4 text-12 text-adm-ink">Result: {d.result}</p>}
                </div>
                <div className="flex flex-col gap-6 lg:items-end">
                  <select
                    aria-label={`Status of “${d.change}”`}
                    className={`${inputClass} h-28 w-auto! text-12 ${d.status === 'shipped' || d.status === 'measured' ? 'text-adm-good' : ''}`}
                    value={d.status}
                    onChange={(e) => saveDecisions(decisions.map((x) => (x.id === d.id ? { ...x, status: e.target.value as Decision['status'] } : x)), 'Status saved in this browser')}
                  >
                    {DECISION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABEL[st]}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
        </ul>
      </Panel>

      <details className="rounded-12 border border-adm-line bg-adm-surface">
        <summary className="cursor-pointer list-none px-16 py-14">
          <span className="text-15 font-semibold text-adm-ink">Where the numbers come from</span>
          <span className="ml-8 text-12 text-adm-muted">Select to open.</span>
        </summary>
        <div className="flex flex-col gap-8 border-t border-adm-line p-16 text-13 leading-[20px] text-adm-ink-2">
          <p>
            <b className="text-adm-ink">Agent:</b> {AGENT_RULES[agent].name} walking every persona of run v{agent} through {DESIGNS[design - 1].name}, step by step (Buyer agent results → By production version). A prediction, not a measurement.
          </p>
          <p>
            <b className="text-adm-ink">Feedback group:</b> the study in Experimentation (sample data until there is a backend). It is a recruited, supported group, so it runs far above an open app; read it as the ceiling, not the funnel. Stages it does not measure say why.
          </p>
          <p>
            <b className="text-adm-ink">Biggest gap:</b> the stage whose worst metric is furthest below its target, on the agent’s prediction.
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-18 text-12">
            {metrics.map((m) => (
              <li key={m.id}>
                {m.label}: {m.humanNote}.
              </li>
            ))}
          </ul>
        </div>
      </details>

        </>
      )}

      {adding && <DecisionForm stage={adding} onClose={() => setAdding(null)} onSave={(d) => saveDecisions([...decisions, d], 'Decision added')} />}
      {guide && view === 'app' && (
        <GuideTour
          steps={GUIDE}
          onClose={() => {
            setGuide(false)
            writeString(GUIDE_KEY, 'seen')
          }}
        />
      )}
    </div>
  )
}

/** The loop's next move: the biggest gap, why the agents leave, and what is proposed for that stage. */
function FixNext({ stage, metrics, targets, decisions, leaveReasons, onAdd }: { stage: StageId; metrics: FunnelMetric[]; targets: Record<string, number>; decisions: Decision[]; leaveReasons: [string, number][]; onAdd: () => void }) {
  const s = STAGES.find((x) => x.id === stage)!
  const worst = metrics
    .filter((m) => m.stage === stage)
    .map((m) => ({ m, t: targets[m.id] ?? m.target }))
    .sort((a, b) => a.m.agent / a.t - b.m.agent / b.t)[0]
  const proposed = decisions.filter((d) => d.stage === stage && d.status !== 'measured')
  return (
    <section aria-label="Fix next" className="flex flex-col gap-8 rounded-12 border border-adm-critical bg-adm-surface p-14">
      <p className="text-11 font-semibold uppercase tracking-[0.06em] text-adm-critical">Fix next</p>
      <p className="text-14 leading-[20px] text-adm-ink">
        <b>{s.title}.</b> {worst.m.label}: {pct(worst.m.agent)} against a target of {pct(worst.t)}, {Math.round((worst.t - worst.m.agent) * 100)} points short.
      </p>
      {leaveReasons.length > 0 && (
        <p className="text-12 leading-[17px] text-adm-ink-2">
          Why agents leave, across the whole funnel: {leaveReasons.slice(0, 3).map(([k, v]) => `${k.toLowerCase()} (${v})`).join(', ')}.
        </p>
      )}
      {proposed.length > 0 ? (
        <ul className="flex flex-col gap-4 text-12 leading-[17px] text-adm-ink">
          {proposed.map((d) => (
            <li key={d.id}>
              <Badge tone="neutral">{STATUS_LABEL[d.status]}</Badge> <span className="ml-4">{d.change}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
          No change is proposed for this stage yet.
          <Button size="sm" icon={<Plus size={13} />} onClick={onAdd}>
            Propose one
          </Button>
        </p>
      )}
    </section>
  )
}

function FunnelLegend() {
  return (
    <div className="flex flex-wrap items-center gap-12 text-11 text-adm-ink-2" aria-hidden="true">
      <span className="inline-flex items-center gap-4">
        <span className="h-8 w-14 rounded-2 bg-adm-s1" /> Agent
      </span>
      <span className="inline-flex items-center gap-4">
        <span className="h-8 w-14 rounded-2 border-2 border-adm-s3" /> Feedback group (sample data)
      </span>
      <span className="inline-flex items-center gap-4">
        <span className="h-12 w-2 bg-adm-ink" /> Target
      </span>
    </div>
  )
}

function MetricRow({ m, target, onTarget }: { m: FunnelMetric; target: number; onTarget: (v: number) => void }) {
  const below = m.agent < target
  return (
    <div className="grid items-center gap-x-12 gap-y-4 text-12 lg:grid-cols-[220px_1fr_150px]">
      <span className="text-adm-ink">
        {m.label}
        {m.reading && <span className="mt-2 block text-11 leading-[15px] text-adm-muted">{m.reading}</span>}
      </span>
      <div className="flex flex-col gap-3">
        <Bar value={m.agent} target={target} kind="agent" />
        {m.human !== null ? <Bar value={m.human} target={target} kind="human" /> : <span className="text-11 text-adm-muted">Feedback group: {m.humanNote}.</span>}
      </div>
      <label className="flex items-center gap-6 justify-self-start text-11 text-adm-muted lg:justify-self-end">
        <span className={below ? 'font-semibold text-adm-critical' : 'text-adm-good'}>{below ? `${Math.round((target - m.agent) * 100)} pts short` : 'On target'}</span>
        target
        <input
          type="number"
          min={1}
          max={100}
          aria-label={`Target for ${m.label}, percent`}
          className={`${inputClass} h-26 w-56! px-6 text-right text-12 tabular-nums`}
          value={Math.round(target * 100)}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v >= 1 && v <= 100) onTarget(v / 100)
          }}
        />
        %
      </label>
    </div>
  )
}

function Bar({ value, target, kind }: { value: number; target: number; kind: 'agent' | 'human' }) {
  return (
    <div className="flex items-center gap-8">
      <div className="relative h-12 flex-1 rounded-4 bg-adm-bg">
        <div
          className={`h-full rounded-4 ${kind === 'agent' ? 'bg-adm-s1' : 'border-2 border-adm-s3'}`}
          style={{ width: `${Math.max(1.5, Math.min(100, value * 100))}%` }}
        />
        <div className="absolute -inset-y-3 w-2 bg-adm-ink" style={{ left: `calc(${Math.min(100, target * 100)}% - 1px)` }} title={`Target ${pct(target)}`} />
      </div>
      <span className="w-40 text-right tabular-nums text-adm-ink">{pct(value)}</span>
    </div>
  )
}

function DecisionForm({ stage, onClose, onSave }: { stage: StageId; onClose: () => void; onSave: (d: Decision) => void }) {
  const [d, setD] = useState<Decision>(() => ({ id: Math.random().toString(36).slice(2, 9), date: new Date().toISOString().slice(0, 10), stage, finding: '', change: '', source: '', status: 'proposed', version: '', result: '' }))
  const set = (patch: Partial<Decision>) => setD({ ...d, ...patch })
  return (
    <Modal title="Add a decision" description="One finding, the change it leads to, and where it came from." onClose={onClose} width={560}>
      <div className="flex flex-col gap-12">
        <FormField label="Stage">
          <select className={inputClass} value={d.stage} onChange={(e) => set({ stage: e.target.value as StageId })}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="The change" hint="What we will do, in one line">
          <input className={inputClass} value={d.change} onChange={(e) => set({ change: e.target.value })} autoFocus />
        </FormField>
        <FormField label="The finding" hint="What a track showed, with its number">
          <textarea className={textareaClass} value={d.finding} onChange={(e) => set({ finding: e.target.value })} />
        </FormField>
        <FormField label="Where it came from" hint="Buyer agent run, feedback group week, interview…">
          <input className={inputClass} value={d.source} onChange={(e) => set({ source: e.target.value })} />
        </FormField>
        <div className="flex gap-8 border-t border-adm-line pt-12">
          <Button
            variant="primary"
            onClick={() => {
              if (!d.change.trim()) return
              onSave({ ...d, change: d.change.trim(), finding: d.finding.trim(), source: d.source.trim() })
              onClose()
            }}
          >
            Add decision
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

const GUIDE: TourStep[] = [
  {
    title: 'What this page is for',
    body: 'It is the scoreboard for proving market fit. Eugene’s four stages run from a free start to Aurelia Plus, and a fifth is the result they serve. Two tracks feed it: buyer agents predict, the feedback group and the digital retreats measure. The stage furthest below its target is what to fix next.',
  },
  { target: 'source', title: 'Pick what the agents predict', body: 'Choose a production version and whose rules play it. Agent v3’s rules are the best estimate. Switch to production v1 to see how much the older design leaks.' },
  { target: 'stages', title: 'The five stages at a glance', body: 'Each card shows what the stage is in Aurelia today and its main number against the target. A red card is the biggest gap.' },
  { target: 'metrics', title: 'Stage by stage', body: 'Every metric shows the agent’s prediction (solid bar) and the feedback group (outlined bar) against the target (the line). Edit a target and the gaps move. Where the group cannot measure something yet, the row says why.' },
  { target: 'log', title: 'Close the loop', body: 'Each decision records the finding, the change, its source and its status: proposed, decided, building, shipped, measured. When a change ships, run the agents again and write the result here.' },
  { target: 'guide', title: 'Open this again', body: 'The Guide button runs this tour again. Targets and decisions are saved in this browser; Export shares them.' },
]
