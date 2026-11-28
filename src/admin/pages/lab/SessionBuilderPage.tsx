import { ArrowRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ReportHeaderCard } from '../reports/ReportHeaderCard'
import { sessionBuilderBrief } from '../../data/reportBriefs'
import { PageSummary, PageTabs } from '../../components/PageTabs'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import {
  CASCADE, CFAM_TARGETS, CONTEXT_LOOP, DOMAIN_TEXT, PLANNER, STATE_TEXT, VALUE_TEXT, cascadeSummary, workedExample,
  type BuildState, type CascadeStep, type Domain, type ValueSource,
} from '../../data/sessionBuilder'
import { DataSources } from '../reports/DataSources'

/*
 * Admin → AI brain → How a session is built (U148, J206): the business
 * owner's Meta → Path → Script cascade (16 steps, BAR / ELEMENTS workbook) as
 * a diagram, each step with purpose, inputs, what feeds it, output, and what
 * exists today; then one worked example, chapter 1 of the sleep StateFlip.
 * All content from data/sessionBuilder.ts.
 */

const ROUTE = '/admin/session-builder'
const DOMAINS: Domain[] = ['META', 'PATH', 'SCRIPT']
const STATE_TONE: Record<BuildState, Tone> = { exists: 'good', partial: 'warning', missing: 'critical' }
const VALUE_TONE: Record<ValueSource, Tone> = { workbook: 'info', computed: 'good', draft: 'serious' }
const DOMAIN_BAR: Record<Domain, string> = { META: 'bg-adm-s1', PATH: 'bg-adm-s3', SCRIPT: 'bg-adm-s4' }

export function SessionBuilderPage() {
  const brief = sessionBuilderBrief()
  const s = cascadeSummary()
  const ex = workedExample()
  return (
    <div className="flex flex-col gap-20">
      <PageHeader
        title="How a session is built"
        description="The business owner’s Meta → Path → Script cascade: 16 steps from “who is this for” to the finished script, what each needs, and what our app and API do today. With one worked example: chapter 1 of the sleep StateFlip."
      />
      <PageTabs summary={<ReportHeaderCard route="/admin/session-builder" brief={brief} />}>
      <PageSummary
              purpose="understanding how one chapter is assembled from goals, people and building blocks (AKPs), step by step, and which steps we still have to build."
              question="How does Aurelia turn a StateFlip and a person into a 10-minute script, and how much of that exists?"
              answer={`Three stages: Meta sets length, goal and person; Path picks objective, methods, techniques and a plan of bars and elements, then scores it; Script writes it. Of the ${s.steps} steps, ${s.partial} exist in part and ${s.missing} are missing; none is complete. The worked sleep example is a draft no model has run.`}
              stats={[
                { label: 'Steps in the cascade', value: `${s.steps}`, note: '3 Meta, 7 Path, 6 Script' },
                { label: 'Exist in part today', value: `${s.partial} of ${s.steps}`, note: `${s.missing} missing` },
                { label: 'Worked example, draft alignment', value: ex.alignment.score.toFixed(2), note: 'Our score, not measured' },
              ]}
              next={[
                { text: 'Check the worked example step by step and correct what the cascade should do differently (Detail).' },
                { text: 'Import BARS, ELEMENTS and the frameworks tab as data: steps 7, 8 and 14 depend on it.' },
                { text: 'Agree how alignment is scored before any tournament runs (step 9).', to: '/admin/therapeutic-funnel', linkLabel: 'Therapeutic funnel' },
              ]}
              note="Step names, inputs and databases are the workbook’s. Example values are labelled: from the workbook, computed from the sleep cohort, or our draft."
            />
        <CascadeDiagram />
        <WorkedExampleView />
        <StepTable />
        <DataSources route={ROUTE} full />
      </PageTabs>
    </div>
  )
}

/* --------------------------------------------------------------- Diagram */

function CascadeDiagram() {
  const [sel, setSel] = useState<number>(8)
  const step = CASCADE.find((c) => c.n === sel)!
  return (
    <Panel title="The cascade" description="Select a step. Colours show what exists today in our app and API contract v2.">
      <div className="grid min-w-0 gap-12 lg:grid-cols-[1fr_auto_1.4fr_auto_1.2fr] lg:items-start">
        {DOMAINS.map((d, i) => (
          <DomainColumn key={d} domain={d} sel={sel} onSel={setSel} arrow={i < DOMAINS.length - 1} />
        )).flatMap((col, i) =>
          i < DOMAINS.length - 1
            ? [col, <ArrowRight key={`a${i}`} size={18} aria-hidden="true" className="mx-auto hidden text-adm-muted lg:mt-40 lg:block" />]
            : [col],
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-8 rounded-8 border border-dashed border-adm-axis bg-adm-bg p-12" aria-label="Context loop">
        <p className="flex items-center gap-6 text-13 font-semibold text-adm-ink">
          <RotateCcw size={14} aria-hidden="true" /> Context loop: every step reads the ones before, and results flow back
        </p>
        <ul className="grid gap-8 lg:grid-cols-3">
          {CONTEXT_LOOP.map((l) => (
            <li key={l.path} className="flex min-w-0 flex-col gap-2 text-12">
              <span className="font-semibold text-adm-ink">{l.path}</span>
              <span className="text-adm-ink-2">Workbook: {l.workbook}</span>
              <span className="text-adm-ink-2">Ours: {l.ours}</span>
            </li>
          ))}
        </ul>
      </div>
      <StepDetail step={step} />
      <Legend />
    </Panel>
  )
}

function DomainColumn({ domain, sel, onSel }: { domain: Domain; sel: number; onSel: (n: number) => void; arrow: boolean }) {
  const steps = CASCADE.filter((c) => c.domain === domain)
  return (
    <section className="flex min-w-0 flex-col gap-8" aria-label={DOMAIN_TEXT[domain].title}>
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-6 text-13 font-semibold uppercase tracking-wide text-adm-ink">
          <span className={`h-10 w-10 rounded-full ${DOMAIN_BAR[domain]}`} aria-hidden="true" />
          {domain}
        </span>
        <span className="text-12 text-adm-muted">{DOMAIN_TEXT[domain].plain}</span>
      </div>
      <ol className="flex flex-col gap-6">
        {steps.map((c) => (
          <li key={c.n}>
            <button
              type="button"
              onClick={() => onSel(c.n)}
              aria-pressed={sel === c.n}
              data-step={c.n}
              className={`flex w-full min-w-0 items-center gap-8 rounded-8 border px-10 py-8 text-left text-13 transition-colors focus-visible:outline-2 focus-visible:outline-adm-accent ${
                sel === c.n ? 'border-adm-ink bg-adm-hover' : 'border-adm-line bg-adm-surface hover:bg-adm-hover'
              }`}
            >
              <span className="w-20 shrink-0 font-semibold tabular-nums text-adm-muted">{c.n}</span>
              <span className="min-w-0 flex-1 font-medium text-adm-ink">{c.name}</span>
              <StateDot state={c.state} />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

const DOT: Record<BuildState, string> = { exists: 'bg-adm-good', partial: 'bg-adm-warning', missing: 'bg-adm-critical' }

function StateDot({ state }: { state: BuildState }) {
  return (
    <span className="flex shrink-0 items-center gap-4 text-11 text-adm-muted">
      <span className={`h-8 w-8 rounded-full ${DOT[state]}`} aria-hidden="true" />
      {STATE_TEXT[state]}
    </span>
  )
}

function Legend() {
  return (
    <p className="flex flex-wrap gap-12 text-12 text-adm-muted">
      <span className="flex items-center gap-4"><span className={`h-8 w-8 rounded-full ${DOT.partial}`} aria-hidden="true" />Partly: something in the app, admin or API contract does part of it</span>
      <span className="flex items-center gap-4"><span className={`h-8 w-8 rounded-full ${DOT.missing}`} aria-hidden="true" />Missing: nothing does it yet</span>
    </p>
  )
}

function StepDetail({ step }: { step: CascadeStep }) {
  const ex = workedExample().values.find((v) => v.n === step.n)!
  return (
    <article className="flex min-w-0 flex-col gap-10 rounded-8 border border-adm-line p-12" aria-live="polite" data-step-detail={step.n}>
      <div className="flex flex-wrap items-center gap-8">
        <h3 className="text-14 font-semibold text-adm-ink">
          {step.n}. {step.name}
        </h3>
        <Badge tone="neutral">{DOMAIN_TEXT[step.domain].title}</Badge>
        <Badge tone={STATE_TONE[step.state]}>{STATE_TEXT[step.state]}</Badge>
      </div>
      <p className="text-13 text-adm-ink">{step.purpose}</p>
      <dl className="grid min-w-0 gap-x-12 gap-y-6 text-12 lg:grid-cols-[140px_1fr]">
        <Row k="Inputs (workbook)" v={step.inputs} />
        <Row k="Databases (workbook)" v={step.databases} />
        <Row k="Our data and AKPs" v={step.feeds} />
        <Row k="Output (workbook)" v={step.output} />
        <Row k="Today" v={step.today} />
        <Row k="Missing" v={step.missing} />
        <dt className="text-adm-muted">Sleep chapter 1</dt>
        <dd className="flex min-w-0 flex-col items-start gap-4 text-adm-ink">
          <Badge tone={VALUE_TONE[ex.source]}>{VALUE_TEXT[ex.source]}</Badge>
          {ex.value}
        </dd>
      </dl>
    </article>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-adm-muted">{k}</dt>
      <dd className="min-w-0 text-adm-ink-2">{v}</dd>
    </>
  )
}

/* -------------------------------------------------------- Worked example */

function WorkedExampleView() {
  const ex = workedExample()
  const p = ex.person
  return (
    <Panel
      title="Worked example: sleep, chapter 1 (wind-down)"
      description={`Draft. One person of the sleep cohort, ${p.name}, chapter 1 of the sleep StateFlip, aiming at step X. Each value says where it comes from.`}
    >
      <p className="text-12 text-adm-ink-2">
        Goal AKP <code className="font-mono text-11">{ex.goalAkp}</code>, step AKP <code className="font-mono text-11">{ex.stepAkp}</code>; strategy AKPs on this StateFlip:{' '}
        {ex.concepts.map((c, i) => (
          <span key={c.id}>
            {i > 0 && ', '}
            {c.name} <code className="font-mono text-11">{c.id}</code>
          </span>
        ))}
        . Person and numbers from the <Link to="/admin/stateflips" className="underline decoration-adm-axis underline-offset-2">StateFlips</Link> page.
      </p>
      <ol className="flex flex-col">
        {ex.values.map((v) => {
          const step = CASCADE.find((c) => c.n === v.n)!
          return (
            <li key={v.n} className="flex min-w-0 flex-col gap-4 border-t border-adm-line py-8 first:border-0 lg:flex-row lg:gap-12">
              <span className="flex shrink-0 items-center gap-6 text-13 font-semibold text-adm-ink lg:w-[240px]">
                <span className={`h-8 w-8 shrink-0 rounded-full ${DOMAIN_BAR[step.domain]}`} aria-hidden="true" />
                <span className="tabular-nums text-adm-muted">{v.n}</span> {step.name}
              </span>
              <span className="min-w-0 flex-1 text-13 text-adm-ink-2">{v.value}</span>
              <span className="shrink-0">
                <Badge tone={VALUE_TONE[v.source]}>{VALUE_TEXT[v.source]}</Badge>
              </span>
            </li>
          )
        })}
      </ol>

      <h3 className="text-14 font-semibold text-adm-ink">Step 8: the planner, bars and elements</h3>
      <p className="text-12 text-adm-muted">
        Bar and element ids, names and the example seconds and words are the workbook’s (BARS, ELEMENTS). The 10-minute column is our draft: slower and quieter at bedtime, and it ends in silence instead of the workbook’s summary and conclusion.
      </p>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-12">
          <thead className="text-adm-muted">
            <tr className="border-b border-adm-line">
              <th className="py-6 pr-8 font-medium">Phase</th>
              <th className="py-6 pr-8 font-medium">Bar</th>
              <th className="py-6 pr-8 font-medium">Element</th>
              <th className="py-6 pr-8 text-right font-medium">Workbook s / words</th>
              <th className="py-6 pr-8 text-right font-medium">10 min: s / words</th>
              <th className="py-6 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {PLANNER.map((r) => (
              <tr key={`${r.bar}-${r.element}`} className="border-b border-adm-line align-top">
                <td className="py-6 pr-8 text-adm-ink-2">{r.phase}</td>
                <td className="py-6 pr-8 text-adm-ink-2"><code className="font-mono text-11">{r.bar}</code> {r.barName}</td>
                <td className="py-6 pr-8 text-adm-ink"><code className="font-mono text-11">{r.element}</code> {r.elementName}</td>
                <td className="py-6 pr-8 text-right tabular-nums text-adm-ink-2">{r.wbSeconds} / {r.wbWords}</td>
                <td className="py-6 pr-8 text-right tabular-nums text-adm-ink">{r.seconds} / {r.words}</td>
                <td className="py-6 text-adm-ink-2">{r.note}</td>
              </tr>
            ))}
            <tr className="font-semibold text-adm-ink">
              <td className="py-6 pr-8" colSpan={3}>Total</td>
              <td className="py-6 pr-8 text-right tabular-nums">{PLANNER.reduce((t, r) => t + r.wbSeconds, 0)} / {PLANNER.reduce((t, r) => t + r.wbWords, 0)}</td>
              <td className="py-6 pr-8 text-right tabular-nums">{ex.plannedSeconds} / {ex.plannedWords}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-14 font-semibold text-adm-ink">Step 9: alignment score and CFAM metrics</h3>
      <p className="text-12 text-adm-ink-2">
        Draft alignment score <span className="font-semibold text-adm-ink">{ex.alignment.score.toFixed(2)}</span> = the average of{' '}
        {ex.alignment.parts.map((x, i) => (
          <span key={x.label}>
            {i > 0 && (i === ex.alignment.parts.length - 1 ? ' and ' : ', ')}
            {x.label.toLowerCase()} ({x.value.toFixed(2)})
          </span>
        ))}
        . Our own formula, to be replaced by the business owner’s alignment criteria.
      </p>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-12">
          <thead className="text-adm-muted">
            <tr className="border-b border-adm-line">
              <th className="py-6 pr-8 font-medium">CFAM metric</th>
              <th className="py-6 pr-8 font-medium">Before</th>
              <th className="py-6 pr-8 font-medium">Target</th>
              <th className="py-6 pr-8 font-medium">Value from</th>
              <th className="py-6 font-medium">How we would know</th>
            </tr>
          </thead>
          <tbody>
            {CFAM_TARGETS.map((m) => (
              <tr key={m.metric} className="border-b border-adm-line align-top">
                <td className="py-6 pr-8 font-medium text-adm-ink">{m.metric}</td>
                <td className="py-6 pr-8 tabular-nums text-adm-ink-2">{m.before}</td>
                <td className="py-6 pr-8 text-adm-ink">{m.target}</td>
                <td className="py-6 pr-8"><Badge tone={VALUE_TONE[m.source]}>{VALUE_TEXT[m.source]}</Badge></td>
                <td className="py-6 text-adm-ink-2">{m.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------ All steps */

function StepTable() {
  return (
    <Panel title="All 16 steps: today and missing" description="What exists in our app, admin and API contract v2 for each step, and what would have to be built.">
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-12">
          <thead className="text-adm-muted">
            <tr className="border-b border-adm-line">
              <th className="py-6 pr-8 font-medium">Step</th>
              <th className="py-6 pr-8 font-medium">Purpose</th>
              <th className="py-6 pr-8 font-medium">Fed by (ours)</th>
              <th className="py-6 pr-8 font-medium">Today</th>
              <th className="py-6 pr-8 font-medium">Missing</th>
              <th className="py-6 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {CASCADE.map((c) => (
              <tr key={c.n} className="border-b border-adm-line align-top">
                <td className="py-6 pr-8 font-medium text-adm-ink"><span className="tabular-nums text-adm-muted">{c.n}</span> {c.name}<br /><span className="text-11 font-normal text-adm-muted">{c.domain}</span></td>
                <td className="py-6 pr-8 text-adm-ink-2">{c.purpose}</td>
                <td className="py-6 pr-8 text-adm-ink-2">{c.feeds}</td>
                <td className="py-6 pr-8 text-adm-ink-2">{c.today}</td>
                <td className="py-6 pr-8 text-adm-ink-2">{c.missing}</td>
                <td className="py-6"><Badge tone={STATE_TONE[c.state]}>{STATE_TEXT[c.state]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
