import { ChevronRight, CircleHelp, Download, ExternalLink, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepTab, usePageTab } from '../components/pageTab'
import { PageSummary, PageTabs } from '../components/PageTabs'
import { RELEASES } from '../../versions/releases'
import { GuideTour, type TourStep } from '../components/GuideTour'
import { Modal } from '../components/Modal'
import { Badge, Button, FormField, PageHeader, Panel, inputClass, textareaClass } from '../components/ui'
import { stageShort, type StageCell } from '../data/reportSummaries'
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
import { InfoTip } from './funnel/InfoTip'
import { RetreatFunnel } from './funnel/RetreatFunnel'
import { Details } from './reports/ReportSummary'
import { StageStrip } from './reports/SummaryCharts'

const GUIDE_KEY = 'aurelia.admin.funnelGuide'
const pct = (v: number) => `${Math.round(v * 100)}%`

/**
 * Business funnel (U108, J153; lighter to read since U127, J180): the brief's "Moving from Bad to Good" stages,
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
  // adminNav2 (U142): no tour over the page on a first visit; the Guide button opens it.
  const [guide, setGuide] = useState(() => !RELEASES.adminNav2 && readString(GUIDE_KEY) !== 'seen')
  const [, setPageTab] = usePageTab()
  const [notice, setNotice] = useState<string | null>(null)

  const metrics = funnelMetrics(agent, design, week)
  const leak = biggestLeak(metrics, targets)
  const journey = upgradeJourney(readJson(STORAGE_KEY, JourneyMapSchema, INITIAL_JOURNEY))
  const momentTitle = new Map(journey.stages.flatMap((s) => s.moments.map((m) => [m.id, m.title] as const)))
  const targetOf = (m: FunnelMetric) => targets[m.id] ?? m.target

  function setSource(a: AgentId, d: DesignId) {
    setParams((prev) => keepTab(prev, { agent: String(a), design: String(d) }), { replace: true })
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

  const worstOf = (stage: StageId) =>
    metrics
      .filter((m) => m.stage === stage)
      .reduce((a, b) => (b.agent / targetOf(b) < a.agent / targetOf(a) ? b : a))
  const cells: StageCell[] = STAGES.map((s) => {
    const w = worstOf(s.id)
    return { id: s.id, title: s.title, status: stageStatus(metrics, targets, s.id).status === 'on-track' ? 'on-track' : 'below', metric: w.label, value: w.agent, target: targetOf(w), isGap: s.id === leak }
  })
  const onTrack = cells.filter((c) => c.status === 'on-track').length
  const gapCell = cells.find((c) => c.isGap)
  const kpi = (id: string) => {
    const m = metrics.find((x) => x.id === id)
    return m ? { label: m.label, value: pct(m.agent), target: targetOf(m), good: m.agent >= targetOf(m) } : null
  }
  const plus = kpi('plus')
  const d30 = kpi('d30')

  return (
    <div className="flex flex-col gap-20">
      <PageHeader
        title="Business funnel"
        description="Two funnels to Aurelia Plus: the app’s five stages and the creator retreat."
        actions={
          <div className="flex flex-wrap gap-8">
            <Button
              size="sm"
              icon={<CircleHelp size={13} />}
              onClick={() => {
                if (RELEASES.adminNav2) setPageTab('detail')
                setGuide(true)
              }}
              data-tour="guide"
            >
              {RELEASES.adminNav2 ? 'Tour' : 'Guide'}
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={() => downloadJson({ source: { agent: AGENT_RULES[agent].name, design: DESIGNS[design - 1].name, studyWeek: week }, targets, metrics, decisions })}>
              Export (JSON)
            </Button>
          </div>
        }
      />

      <PageTabs
        summary={
          <PageSummary
            purpose="seeing how many people get from a first visit to paying for Aurelia Plus, and which stage loses the most."
            question="Where does the funnel leak most, and what do we fix first?"
            answer={
              gapCell
                ? `${gapCell.title} is furthest below target: ${gapCell.metric} is ${pct(gapCell.value)} against ${pct(gapCell.target)}. ${onTrack} of ${cells.length} stages are on track.`
                : `All ${cells.length} stages are on track.`
            }
            stats={[
              { label: 'Stages on track', value: `${onTrack} of ${cells.length}` },
              ...(plus ? [{ label: plus.label, value: plus.value, note: `target ${pct(plus.target)}` }] : []),
              ...(d30 ? [{ label: d30.label, value: d30.value, note: `target ${pct(d30.target)}` }] : []),
            ]}
            next={[
              ...(gapCell ? [{ text: `Agree one change for ${gapCell.title} and log it as a decision (Detail → the stage).` }] : []),
              { text: 'Check the targets are the ones the team agreed.' },
              { text: 'Compare with the creator retreat funnel (Detail → Creator retreat).' },
            ]}
            note={`Predicted by the buyer agents (${AGENT_RULES[agent].name}, ${DESIGNS[design - 1].name}); not measured on real users.`}
            onDetail={() => setPageTab('detail')}
          />
        }
      >
      <div className="flex flex-wrap items-center justify-between gap-12">
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
              onClick={() => setParams((prev) => keepTab(prev, id === 'retreat' ? { view: 'retreat' } : {}), { replace: true })}
              className={`rounded-8 px-12 py-6 text-13 font-medium ${view === id ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'app' && (
          <div className="flex flex-wrap items-center gap-8 text-12 text-adm-muted" data-tour="source">
            <span>Prediction</span>
            <select aria-label="Production version" className={`${inputClass} h-30 w-auto! text-12`} value={design} onChange={(e) => setSource(agent, Number(e.target.value) as DesignId)}>
              {DESIGNS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select aria-label="Agent rules" className={`${inputClass} h-30 w-auto! text-12`} value={agent} onChange={(e) => setSource(Number(e.target.value) as AgentId, design)}>
              {([3, 2, 1] as const).map((a) => (
                <option key={a} value={a}>
                  {AGENT_RULES[a].name}
                  {a === 3 ? ' (best estimate)' : a === 1 ? ' (uncalibrated)' : ''}
                </option>
              ))}
            </select>
            <Link
              to={`/admin/buyer-agent?view=versions&agent=${agent}&design=${design}`}
              aria-label="See every persona’s walk"
              title="See every persona’s walk"
              className="inline-flex size-28 items-center justify-center rounded-8 text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink"
            >
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
            {notice && (
              <span role="status" className="text-12 text-adm-good">
                {notice}
              </span>
            )}
          </div>
        )}
      </div>

      {view === 'retreat' ? (
        <RetreatFunnel />
      ) : (
        <>
          <section aria-label="Summary" className="flex min-w-0 flex-col gap-16 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
            <p className="text-18 font-semibold leading-snug text-adm-ink">
              {onTrack} of {cells.length} stages on target
              {gapCell && (
                <span className="text-adm-ink-2">
                  {' '}
                  · biggest gap: {stageShort(gapCell.id)}, {Math.round((gapCell.target - gapCell.value) * 100)} pts short
                </span>
              )}
            </p>

            <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <Tile label="Stages on target" value={`${onTrack} of ${cells.length}`} note={cells.filter((c) => c.status === 'on-track').map((c) => stageShort(c.id)).join(', ') || 'none'} />
              {gapCell ? <Tile label="Biggest gap" value={`−${Math.round((gapCell.target - gapCell.value) * 100)} pts`} note={stageShort(gapCell.id)} bad /> : <Tile label="Biggest gap" value="None" note="all on target" />}
              {plus && <Tile label={plus.label} value={plus.value} note={`target ${pct(plus.target)}`} bad={!plus.good} />}
              {d30 && <Tile label={d30.label} value={d30.value} note={`target ${pct(d30.target)}`} bad={!d30.good} />}
            </dl>

            <div data-tour="stages">
              <StageStrip cells={cells} />
            </div>

            {leak && <FixNext stage={leak} decisions={decisions} leaveReasons={report(agent, design).leaveReasons} onAdd={() => setAdding(leak)} />}
          </section>

          <Panel title="Stage by stage" description="Agent prediction against your target. Edit a target and the gaps move." actions={<FunnelLegend />}>
            <div className="flex flex-col gap-20" data-tour="metrics">
              {STAGES.map((s, i) => (
                <section key={s.id} id={`stage-${s.id}`} aria-label={s.title} className="flex scroll-mt-16 flex-col gap-10 border-t border-adm-line pt-16 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-8">
                    <span className="text-11 font-semibold tabular-nums text-adm-muted">{i + 1}</span>
                    <h3 className="text-14 font-semibold text-adm-ink">{s.title}</h3>
                    <InfoTip label={`About ${s.title}`}>
                      <span>
                        <b className="text-adm-ink">The brief:</b> {s.eugene}
                      </span>
                      <span>
                        <b className="text-adm-ink">In Aurelia:</b> {s.aurelia}
                      </span>
                      {s.later.length > 0 && (
                        <span>
                          <b className="text-adm-ink">Later, with a backend:</b> {s.later.join(' · ')}
                        </span>
                      )}
                    </InfoTip>
                    {leak === s.id && <Badge tone="critical">Biggest gap</Badge>}
                    <span className="flex flex-wrap items-center gap-4 lg:ml-auto">
                      <MapPin size={12} className="text-adm-muted" aria-label="Where it happens" />
                      {s.moments.map((id) => (
                        <Link key={id} to="/admin/user-journey" className="rounded-full border border-adm-line px-8 py-2 text-11 text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink">
                          {momentTitle.get(id) ?? id}
                        </Link>
                      ))}
                    </span>
                  </div>
                  {metrics
                    .filter((m) => m.stage === s.id)
                    .map((m) => (
                      <MetricRow key={m.id} m={m} target={targetOf(m)} onTarget={(v) => saveTargets({ ...targets, [m.id]: v })} />
                    ))}
                </section>
              ))}
            </div>
          </Panel>

          <Panel
            title="Decision log"
            description="Finding → change → status. Saved in this browser."
            actions={
              <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setAdding(leak ?? 'entry')}>
                Add a decision
              </Button>
            }
          >
            <ul className="flex flex-col divide-y divide-adm-line" data-tour="log">
              {[...decisions]
                .sort((a, b) => STAGES.findIndex((s) => s.id === a.stage) - STAGES.findIndex((s) => s.id === b.stage))
                .map((d) => (
                  <DecisionRow
                    key={d.id}
                    d={d}
                    onStatus={(status) => saveDecisions(decisions.map((x) => (x.id === d.id ? { ...x, status } : x)), 'Status saved in this browser')}
                  />
                ))}
            </ul>
          </Panel>

          <Details title="How to read this, and where the numbers come from">
            <dl className="grid gap-x-16 gap-y-10 text-13 leading-[20px] text-adm-ink-2 lg:grid-cols-[160px_1fr]">
              <dt className="font-semibold text-adm-ink">Agent</dt>
              <dd>
                {AGENT_RULES[agent].name} walking every persona of run v{agent} through {DESIGNS[design - 1].name}. A prediction, not a measurement.
              </dd>
              <dt className="font-semibold text-adm-ink">Feedback group</dt>
              <dd>The study in Experimentation (sample data). Recruited and supported, so read it as the ceiling, not the open funnel.</dd>
              <dt className="font-semibold text-adm-ink">Biggest gap</dt>
              <dd>The stage whose worst metric is furthest below its target, on the agent’s prediction.</dd>
            </dl>
            <ul className="flex flex-col gap-4 text-12 leading-[18px] text-adm-ink-2">
              {metrics.map((m) => (
                <li key={m.id}>
                  <span className="font-medium text-adm-ink">{m.label}:</span> {m.humanNote}.
                </li>
              ))}
            </ul>
          </Details>
        </>
      )}
      </PageTabs>

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

/** Export: a module-level helper, so the timestamp is read on click, not during render. */
function downloadJson(data: object) {
  const body = { exportedAt: new Date().toISOString(), ...data }
  const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'aurelia-business-funnel.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Tile({ label, value, note, bad }: { label: string; value: string; note: string; bad?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-12">
      <dt className="text-11 font-medium text-adm-muted">{label}</dt>
      <dd className={`text-24 font-semibold leading-tight tabular-nums ${bad ? 'text-adm-critical' : 'text-adm-ink'}`}>{value}</dd>
      <dd className="text-12 text-adm-ink-2">{note}</dd>
    </div>
  )
}

/** The loop's next move as one line: the first open change for the biggest gap, or a way to propose one. */
function FixNext({ stage, decisions, leaveReasons, onAdd }: { stage: StageId; decisions: Decision[]; leaveReasons: [string, number][]; onAdd: () => void }) {
  const next = decisions.find((d) => d.stage === stage && d.status !== 'measured')
  return (
    <div aria-label="Fix next" role="group" className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-8 border border-adm-critical bg-adm-critical/6 px-12 py-10 text-13">
      <span className="text-11 font-semibold uppercase tracking-wider text-adm-critical">Fix next</span>
      <Badge tone="neutral">{stageShort(stage)}</Badge>
      <span className="order-last min-w-0 basis-full text-adm-ink lg:order-none lg:basis-0 lg:flex-1">{next ? next.change : 'No change proposed yet.'}</span>
      {leaveReasons.length > 0 && (
        <InfoTip label="Why agents leave" align="right">
          <b className="text-adm-ink">Why agents leave, whole funnel</b>
          {leaveReasons.slice(0, 3).map(([k, v]) => (
            <span key={k}>
              {k} · {v}
            </span>
          ))}
        </InfoTip>
      )}
      {next ? (
        <Badge tone="info">{STATUS_LABEL[next.status]}</Badge>
      ) : (
        <Button size="sm" icon={<Plus size={13} />} onClick={onAdd}>
          Propose one
        </Button>
      )}
    </div>
  )
}

function DecisionRow({ d, onStatus }: { d: Decision; onStatus: (s: Decision['status']) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="flex flex-col gap-8 py-10 first:pt-0 last:pb-0">
      <div className="flex items-center gap-8">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Hide the finding' : 'Show the finding'}
          onClick={() => setOpen(!open)}
          className="inline-flex size-24 shrink-0 items-center justify-center rounded-4 text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
        >
          <ChevronRight size={15} aria-hidden="true" className={`transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        <span className="hidden w-64 shrink-0 sm:inline-flex">
          <Badge tone="neutral">{stageShort(d.stage)}</Badge>
        </span>
        <button type="button" onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left text-13 font-medium leading-[19px] text-adm-ink">
          {d.change}
        </button>
        <select
          aria-label={`Status of “${d.change}”`}
          className={`${inputClass} h-28 w-auto! shrink-0 text-12 ${d.status === 'shipped' || d.status === 'measured' ? 'text-adm-good' : ''}`}
          value={d.status}
          onChange={(e) => onStatus(e.target.value as Decision['status'])}
        >
          {DECISION_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABEL[st]}
            </option>
          ))}
        </select>
      </div>
      {open && (
        <div className="flex flex-col gap-4 pl-32 text-12 leading-[18px] text-adm-ink-2 sm:pl-104">
          {d.finding && <p className="max-w-[70ch]">{d.finding}</p>}
          <p className="text-11 text-adm-muted">
            {STAGES.find((s) => s.id === d.stage)?.title} · {d.date} · From: {d.source || '—'}
            {d.version && ` · In: ${d.version}`}
          </p>
          {d.result && <p className="text-adm-ink">Result: {d.result}</p>}
        </div>
      )}
    </li>
  )
}

function FunnelLegend() {
  return (
    <div className="flex flex-wrap items-center gap-12 text-11 text-adm-ink-2" aria-hidden="true">
      <span className="inline-flex items-center gap-4">
        <span className="h-8 w-14 rounded-2 bg-adm-s1" /> Agent
      </span>
      <span className="inline-flex items-center gap-4">
        <span className="h-8 w-14 rounded-2 border-2 border-adm-s3" /> Feedback group
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
    <div className="grid items-center gap-x-16 gap-y-6 text-13 lg:grid-cols-[240px_1fr_auto]">
      <span className="flex items-center gap-4 text-adm-ink">
        {m.label}
        <InfoTip label={`About ${m.label}`}>
          {m.reading && <span>{m.reading}</span>}
          <span>
            <b className="text-adm-ink">Feedback group:</b> {m.humanNote}.
          </span>
        </InfoTip>
      </span>
      <div className="flex flex-col gap-4">
        <Bar value={m.agent} target={target} kind="agent" />
        {m.human !== null && <Bar value={m.human} target={target} kind="human" />}
      </div>
      <div className="flex items-center gap-8 justify-self-start lg:justify-self-end">
        <span className="w-72">
          <Badge tone={below ? 'critical' : 'good'}>{below ? `−${Math.round((target - m.agent) * 100)} pts` : 'On target'}</Badge>
        </span>
        <label className="flex items-center gap-4 text-11 text-adm-muted">
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
    </div>
  )
}

function Bar({ value, target, kind }: { value: number; target: number; kind: 'agent' | 'human' }) {
  return (
    <div className="flex items-center gap-8">
      <div className="relative h-10 flex-1 rounded-4 bg-adm-bg">
        <div
          className={`h-full rounded-4 ${kind === 'agent' ? 'bg-adm-s1' : 'border-2 border-adm-s3'}`}
          style={{ width: `${Math.max(1.5, Math.min(100, value * 100))}%` }}
        />
        <div className="absolute -inset-y-3 w-2 bg-adm-ink" style={{ left: `calc(${Math.min(100, target * 100)}% - 1px)` }} title={`Target ${pct(target)}`} />
      </div>
      <span className={`w-40 text-right tabular-nums ${kind === 'agent' ? 'font-semibold text-adm-ink' : 'text-adm-ink-2'}`}>{pct(value)}</span>
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
    body: 'It is the scoreboard for proving market fit. The brief’s four stages run from a free start to Aurelia Plus, and a fifth is the result they serve. Two tracks feed it: buyer agents predict, the feedback group and the digital retreats measure. The stage furthest below its target is what to fix next.',
  },
  { target: 'source', title: 'Pick what the agents predict', body: 'The two selects beside the tabs: a production version and whose rules play it. Agent v3’s rules are the best estimate.' },
  { target: 'stages', title: 'The five stages at a glance', body: 'One number per stage against its target; the outlined card is the biggest gap. Fix next names the change for it. Click a stage to jump to its rows.' },
  { target: 'metrics', title: 'Stage by stage', body: 'Each row: the agent’s prediction (solid bar), the feedback group (outlined) where measured, the target line and the gap. Edit a target and the gaps move. The (i) explains a stage or a metric.' },
  { target: 'log', title: 'Close the loop', body: 'One line per decision with its status. Open the arrow for the finding and its source. When a change ships, run the agents again and write the result here.' },
  { target: 'guide', title: 'Open this again', body: 'The Guide button runs this tour again. Targets and decisions are saved in this browser; Export shares them.' },
]
