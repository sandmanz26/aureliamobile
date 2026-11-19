import { Copy, Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DataTable, type Column } from '../components/DataTable'
import { PersonaProfile } from '../components/PersonaProfile'
import { RerunView } from './buyer/RerunView'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, PageHeader, Panel, StatCard } from '../components/ui'
import {
  BUYER_RUNS,
  DEFINITIONS,
  OUTCOME_TONE,
  PLAN_LABEL,
  THEME_LABEL,
  VERDICT_TONE,
  WELLNESS_LABEL,
  countVerdicts,
  personasOf,
  priceSeen,
  priceRange,
  scenarioCounts,
  themeCounts,
  wellnessOf,
  type BuyerAnswer,
  type BuyerRun,
} from '../data/buyerRuns'
import { V3_CHANGES } from '../data/buyerRunV3'
import { GOAL_LABEL, type Persona } from '../data/personas'

const SCALE_MAX = 20
const WELLNESS_TONE = { struggling: 'critical', strained: 'warning', coping: 'good' } as const

interface Row {
  id: string
  name: string
  age: number
  ageBand: string
  region: string
  country: string
  goal: string
  wellness: string
  localPrice: string
  tries: string
  pays: string
  plan: string
  bargain: number
  theme: string
  week: number | string
  aTries: string
  confidence: number
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const money = (n: number) => `$${n % 1 ? n.toFixed(2) : n}`

export function BuyerResultsPage() {
  const [params, setParams] = useSearchParams()
  const latest = BUYER_RUNS[BUYER_RUNS.length - 1]
  const view = params.get('view') === 'versions' ? 'versions' : 'runs'
  const run = BUYER_RUNS.find((r) => String(r.version) === params.get('v')) ?? latest
  const [open, setOpen] = useState<{ id: string; tab: 'answer' | 'persona' } | null>(null)
  const [notice, setNotice] = useState('')
  const n = run.answers.length
  const people = personasOf(run)
  const persona = (id: string) => people.get(id)!
  const ab = run.answers.some((a) => a.control)
  const tally = (k: 'tries' | 'pays') => {
    const o = { yes: 0, maybe: 0, no: 0 }
    for (const a of run.answers) if (a.control) o[a.control[k]] += 1
    return o
  }
  const ctlTries = tally('tries')
  const ctlPays = tally('pays')
  const moved = new Map<string, number>()
  for (const a of run.answers) for (const c of a.movedBy ?? []) moved.set(c, (moved.get(c) ?? 0) + 1)
  const hasUsage = run.answers.some((a) => a.week !== undefined)

  const tries = countVerdicts(run.answers, 'tries')
  const pays = countVerdicts(run.answers, 'pays')
  const range = priceRange(run.answers)
  const themes = themeCounts(run.answers)
  const outcomes = scenarioCounts(run.answers)
  const issues = run.answers.filter((a) => a.personaIssue)

  const rows: Row[] = run.answers.map((a) => {
    const p = persona(a.personaId)
    return {
      id: a.personaId,
      name: p.name,
      age: p.age,
      ageBand: p.ageBand,
      region: p.region,
      country: p.country,
      goal: GOAL_LABEL[p.goal],
      wellness: WELLNESS_LABEL[wellnessOf(p).level],
      localPrice: priceSeen(run, p.country).label.split(' · ')[0],
      tries: a.tries,
      pays: a.pays,
      plan: PLAN_LABEL[a.plan],
      bargain: a.prices.bargain,
      theme: THEME_LABEL[a.theme],
      week: a.week ?? '–',
      aTries: a.control?.tries ?? '',
      confidence: a.confidence,
    }
  })

  const verdictCell = (v: string) => <Badge tone={VERDICT_TONE[v as keyof typeof VERDICT_TONE]}>{v}</Badge>
  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Persona',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen({ id: r.id, tab: 'persona' })
          }}
          className="text-left font-medium underline decoration-adm-line underline-offset-2 hover:decoration-adm-ink"
        >
          {r.name}
        </button>
      ),
    },
    { key: 'age', header: 'Age', numeric: true },
    { key: 'region', header: 'Region' },
    { key: 'country', header: 'Country' },
    {
      key: 'wellness',
      header: 'Wellness',
      render: (r) => <Badge tone={WELLNESS_TONE[r.wellness.toLowerCase() as keyof typeof WELLNESS_TONE]}>{r.wellness}</Badge>,
    },
    ...(ab ? [{ key: 'aTries' as const, header: 'Tries A', render: (r: Row) => verdictCell(r.aTries) }] : []),
    { key: 'tries', header: ab ? 'Tries B' : 'Tries', render: (r) => verdictCell(r.tries) },
    { key: 'pays', header: ab ? 'Pays B' : 'Pays', render: (r) => verdictCell(r.pays) },
    { key: 'localPrice', header: 'Saw Plus at' },
    { key: 'bargain', header: 'A bargain at', numeric: true, render: (r) => money(r.bargain) },
    ...(hasUsage ? [{ key: 'week' as const, header: 'Week 1', numeric: true }] : []),
    { key: 'theme', header: 'Main objection' },
    { key: 'confidence', header: 'Conf.', numeric: true, render: (r) => `${r.confidence}/5` },
  ]

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(`${what} copied`)
    } catch {
      setNotice('Copy failed. Select the text and copy it by hand.')
    }
  }

  const answer = open ? run.answers.find((a) => a.personaId === open.id) : undefined
  const pct = (v: number) => `${Math.min(100, (v / SCALE_MAX) * 100)}%`
  const ages = run.answers.map((a) => persona(a.personaId).age)
  const panel = run.answers.map((a) => persona(a.personaId))

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Buyer agent results"
        description="A buyer agent reads a panel of synthetic personas and one thing to test (a pitch, a price, a screen) and answers as each of them: would they try it, would they pay, at what price, what stops them and what would change their mind. Use it to compare options and find questions for real people. It is not evidence of demand."
        actions={
          <div className="flex flex-wrap items-center gap-8">
            <Button size="sm" icon={<Copy size={13} />} onClick={() => copy(run.instructions, 'Agent instructions')}>
              Agent instructions
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={() => download(`aurelia-buyer-v${run.version}.json`, JSON.stringify(run, null, 2))}>
              Run as JSON
            </Button>
          </div>
        }
      />

      <div role="tablist" aria-label="View" className="flex w-fit gap-4 rounded-8 bg-adm-bg p-4">
        {(
          [
            ['runs', 'Runs'],
            ['versions', 'By production version'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => {
              setOpen(null)
              setParams(id === 'versions' ? { view: 'versions' } : {}, { replace: true })
            }}
            className={`rounded-8 px-12 py-6 text-12 font-medium ${view === id ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'versions' ? (
        <RerunView />
      ) : (
        <>
      <div role="tablist" aria-label="Run version" className="flex flex-wrap gap-8">
        {BUYER_RUNS.map((r) => {
          const active = r.id === run.id
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setOpen(null)
                setParams({ v: String(r.version) }, { replace: true })
              }}
              className={`flex flex-col items-start rounded-12 border px-14 py-10 text-left ${active ? 'border-adm-ink bg-adm-surface' : 'border-adm-line bg-adm-bg hover:bg-adm-hover'}`}
            >
              <span className="text-13 font-semibold text-adm-ink">
                v{r.version}
                {r.id === latest.id && <span className="ml-6 text-11 font-medium text-adm-muted">latest</span>}
              </span>
              <span className="text-12 text-adm-ink-2">
                {r.answers.length} personas · {r.date}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Badge tone="warning">{run.kind === 'demo' ? 'Demo' : 'Run'} · synthetic</Badge>
        <span>
          {run.title}. {run.method}
        </span>
        {notice && (
          <span role="status" className="text-adm-good">
            {notice}
          </span>
        )}
      </div>

      <Panel title="How this run worked" description="The criteria the agent ran under, so anyone can judge how far to trust it.">
        <dl className="grid gap-x-16 gap-y-10 text-13 lg:grid-cols-[180px_1fr]">
          {run.criteria.map((c) => (
            <div key={c.label} className="contents">
              <dt className="font-medium text-adm-ink">{c.label}</dt>
              <dd className="max-w-[760px] leading-[20px] text-adm-ink-2">{c.value}</dd>
            </div>
          ))}
        </dl>
        <details className="rounded-8 bg-adm-bg px-12 py-10 text-12">
          <summary className="cursor-pointer font-medium text-adm-ink">What the answers mean</summary>
          <dl className="mt-8 grid gap-x-16 gap-y-6 lg:grid-cols-[160px_1fr]">
            {DEFINITIONS.map((d) => (
              <div key={d.label} className="contents">
                <dt className="font-medium text-adm-ink">{d.label}</dt>
                <dd className="max-w-[760px] text-adm-ink-2">{d.value}</dd>
              </div>
            ))}
          </dl>
        </details>
        <details className="rounded-8 bg-adm-bg px-12 py-10 text-12">
          <summary className="cursor-pointer font-medium text-adm-ink">The agent’s instructions</summary>
          <pre className="mt-8 overflow-x-auto whitespace-pre-wrap font-sans text-adm-ink-2">{run.instructions}</pre>
        </details>
      </Panel>

      <Panel title="Who was in the panel" description={`${n} personas, aged ${Math.min(...ages)}–${Math.max(...ages)}, from ${new Set(panel.map((p) => p.country)).size} countries.`}>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <Mix title="Region" items={count(panel.map((p) => p.region))} />
          <Mix title="Age band" items={count(panel.map((p) => p.ageBand)).sort((x, y) => x[0].localeCompare(y[0]))} />
          <Mix title="Wellness" items={count(panel.map((p) => WELLNESS_LABEL[wellnessOf(p).level]))} />
          <Mix title="Goal" items={count(panel.map((p) => GOAL_LABEL[p.goal]))} />
        </div>
      </Panel>

      <Panel title="What was tested" description={run.stimulus.name}>
        <p className="max-w-[720px] text-13 leading-[20px] text-adm-ink">{run.stimulus.pitch}</p>
        <ul className="flex flex-wrap gap-6">
          {run.stimulus.offer.map((o) => (
            <li key={o} className="rounded-8 bg-adm-bg px-10 py-6 text-12 text-adm-ink-2">
              {o}
            </li>
          ))}
        </ul>
      </Panel>

      {run.control && (
        <Panel title="Compared with" description={run.control.name}>
          <ul className="flex flex-wrap gap-6">
            {run.control.offer.map((o) => (
              <li key={o} className="rounded-8 bg-adm-bg px-10 py-6 text-12 text-adm-ink-2">
                {o}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {run.references && (
        <Panel title="What the agent read" description="The documents the agent treated as evidence before answering, and what it took from each.">
          <ul className="flex flex-col gap-10 text-13">
            {run.references.map((r) => (
              <li key={r.title} className="grid gap-2 lg:grid-cols-[260px_1fr] lg:gap-16">
                <p>
                  <span className="font-medium text-adm-ink">{r.title}</span>
                  <span className="block text-12 text-adm-muted">{r.where}</span>
                </p>
                <p className="max-w-[760px] leading-[20px] text-adm-ink-2">{r.used}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label={ab ? 'Would try B' : 'Would try'} value={`${tries.yes} of ${n}`} hint={ab ? `today (A): ${ctlTries.yes} of ${n}` : `${tries.maybe} maybe, ${tries.no} no`} />
        <StatCard label={ab ? 'Would pay B' : 'Would pay'} value={`${pays.yes} of ${n}`} hint={ab ? `${pays.maybe} maybe · A: ${ctlPays.yes} yes, ${ctlPays.maybe} maybe` : `${pays.maybe} maybe, ${pays.no} no`} />
        <StatCard label="Price that feels fair" value={`${money(range.low)}–${money(range.high)}`} hint={`Plus is ${money(run.stimulus.priceUsd)} in the US`} />
        <StatCard label="Test cases" value={`${outcomes.pass} pass`} hint={`${outcomes.risk} at risk, ${outcomes.fail} fail`} />
      </div>

      <Panel title="What it tells us" description="The agent’s reading of the panel. Hypotheses to check with real people.">
        <ul className="flex max-w-[760px] list-disc flex-col gap-8 pl-18 text-13 leading-[20px] text-adm-ink">
          {run.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Panel>

      {moved.size > 0 && (
        <Panel title="Which changes moved people" description="How many personas answered B differently from A because of each change, as the agent judged it. One persona can name several.">
          <ul className="flex flex-col gap-8">
            {[...moved.entries()]
              .sort((x, y) => y[1] - x[1])
              .map(([c, k]) => {
                const info = V3_CHANGES[c as keyof typeof V3_CHANGES]
                return (
                  <li key={c} className="grid items-center gap-x-8 gap-y-2 text-12 lg:grid-cols-[260px_1fr_24px]">
                    <span className="text-adm-ink" title={info?.source}>
                      {info?.label ?? c}
                    </span>
                    <span className="h-10 rounded-full bg-adm-bg">
                      <span className="block h-full rounded-full bg-adm-s1" style={{ width: `${(k / n) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-adm-muted">{k}</span>
                    <span className="text-11 text-adm-muted lg:col-span-3">From: {info?.source}</span>
                  </li>
                )
              })}
          </ul>
        </Panel>
      )}

      <Panel title="By segment" description="Each group’s answers. Small groups: read the direction, not the number.">
        <div className="grid gap-16 lg:grid-cols-3">
          <SegmentTable title="Region" run={run} keyOf={(p) => p.region} />
          <SegmentTable title="Age band" run={run} keyOf={(p) => p.ageBand} sort />
          <SegmentTable title="Wellness" run={run} keyOf={(p) => WELLNESS_LABEL[wellnessOf(p).level]} />
        </div>
      </Panel>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="Price" description="Medians of the four price answers, in US dollars a month.">
          <div className="flex flex-col gap-10">
            <div className="relative h-28 rounded-8 bg-adm-bg">
              <div className="absolute inset-y-0 rounded-8 bg-adm-good/20" style={{ left: pct(range.low), width: `calc(${pct(range.high)} - ${pct(range.low)})` }} />
              <div className="absolute inset-y-[-4px] w-2 bg-adm-critical" style={{ left: pct(run.stimulus.priceUsd) }} title="US price" />
            </div>
            <div className="flex justify-between text-11 tabular-nums text-adm-muted">
              {[0, 5, 10, 15, 20].map((v) => (
                <span key={v}>${v}</span>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-8 text-12 sm:grid-cols-4">
              {(
                [
                  ['Too cheap to trust', range.tooCheap],
                  ['A bargain', range.low],
                  ['Getting expensive', range.high],
                  ['Too expensive', range.tooExpensive],
                ] as const
              ).map(([label, v]) => (
                <div key={label} className="rounded-8 bg-adm-bg p-8">
                  <dt className="text-adm-muted">{label}</dt>
                  <dd className="font-semibold tabular-nums">{money(v)}</dd>
                </div>
              ))}
            </dl>
            <p className="text-12 text-adm-ink-2">Green is the fair band. The red line is Plus in the US ({money(run.stimulus.priceUsd)}); the US yearly plan works out at {run.version >= 3 ? '$5.00' : '$6.58'} a month.</p>
          </div>
        </Panel>

        <Panel title="Why people hesitate" description="Each persona’s main objection, grouped.">
          <ul className="flex flex-col gap-8">
            {themes.map(([t, c]) => (
              <li key={t} className="grid grid-cols-[150px_1fr_24px] items-center gap-8 text-12">
                <span className="text-adm-ink">{THEME_LABEL[t]}</span>
                <span className="h-10 rounded-full bg-adm-bg">
                  <span className="block h-full rounded-full bg-adm-s1" style={{ width: `${(c / n) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-adm-muted">{c}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Every answer" description="Select a name for the persona’s profile, or anywhere else on the row for their answer and test cases.">
        <DataTable
          rows={rows}
          columns={columns}
          exportName={`aurelia-buyer-v${run.version}`}
          pageSize={12}
          filters={[
            { key: 'region', label: 'Region', options: [...new Set(rows.map((r) => r.region))] },
            { key: 'ageBand', label: 'Age', options: [...new Set(rows.map((r) => r.ageBand))].sort() },
            { key: 'wellness', label: 'Wellness', options: Object.values(WELLNESS_LABEL) },
            { key: 'tries', label: 'Tries', options: ['yes', 'maybe', 'no'] },
            { key: 'pays', label: 'Pays', options: ['yes', 'maybe', 'no'] },
          ]}
          onRowClick={(r) => setOpen({ id: r.id, tab: 'answer' })}
        />
      </Panel>

      {issues.length > 0 && (
        <Panel title="Persona problems found" description="Personas that did not hold together while the agent played them. They go back to the generator.">
          <ul className="flex flex-col gap-6 text-12 text-adm-ink">
            {issues.map((a) => (
              <li key={a.personaId}>
                <button type="button" onClick={() => setOpen({ id: a.personaId, tab: 'persona' })} className="font-medium underline decoration-adm-line underline-offset-2 hover:decoration-adm-ink">
                  {persona(a.personaId).name}
                </button>{' '}
                ({a.personaId}): {a.personaIssue}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {open && answer && (
        <SidePanel
          width={600}
          title={persona(open.id).name}
          description={`${open.id} · v${run.version} · persona generator ${run.generator}`}
          onClose={() => setOpen(null)}
          footer={<Button onClick={() => setOpen(null)}>Close</Button>}
        >
          <div role="tablist" aria-label="Show" className="mb-14 flex gap-4 rounded-8 bg-adm-bg p-4">
            {(['answer', 'persona'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={open.tab === t}
                onClick={() => setOpen({ id: open.id, tab: t })}
                className={`flex-1 rounded-8 px-10 py-6 text-12 font-medium ${open.tab === t ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
              >
                {t === 'answer' ? 'Their answer' : 'Who they are'}
              </button>
            ))}
          </div>
          {open.tab === 'answer' ? (
            <AnswerDetail a={answer} p={persona(open.id)} run={run} onPersona={() => setOpen({ id: open.id, tab: 'persona' })} />
          ) : (
            <PersonaProfile p={persona(open.id)} />
          )}
        </SidePanel>
      )}
        </>
      )}
    </div>
  )
}

function count(values: string[]): [string, number][] {
  const m = new Map<string, number>()
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function Mix({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div>
      <h3 className="text-11 font-semibold uppercase tracking-widest text-adm-muted">{title}</h3>
      <ul className="mt-6 flex flex-col gap-4 text-12">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-8">
            <span className="text-adm-ink">{k}</span>
            <span className="tabular-nums text-adm-muted">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SegmentTable({ title, run, keyOf, sort }: { title: string; run: BuyerRun; keyOf: (p: Persona) => string; sort?: boolean }) {
  const people = personasOf(run)
  const ab = run.answers.some((a) => a.control)
  const groups = new Map<string, BuyerAnswer[]>()
  for (const a of run.answers) {
    const k = keyOf(people.get(a.personaId)!)
    groups.set(k, [...(groups.get(k) ?? []), a])
  }
  const entries = [...groups.entries()]
  if (sort) entries.sort((x, y) => x[0].localeCompare(y[0]))
  else entries.sort((x, y) => y[1].length - x[1].length)
  const usage = run.answers.some((a) => a.week !== undefined)
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full text-12">
        <thead>
          <tr className="text-left text-adm-muted">
            <th className="py-4 font-medium">{title}</th>
            <th className="py-4 text-right font-medium">n</th>
            {ab && <th className="py-4 text-right font-medium" title="Tries today's offer (A)">Try A</th>}
            <th className="py-4 text-right font-medium">{ab ? 'Try B' : 'Try'}</th>
            <th className="py-4 text-right font-medium" title="Pays yes or maybe">Pay?</th>
            {usage && <th className="py-4 text-right font-medium" title="Average sessions in week one">Wk 1</th>}
            <th className="py-4 text-right font-medium" title="Fair band, USD a month">Fair</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {entries.map(([k, as]) => {
            const r = priceRange(as)
            return (
              <tr key={k} className="border-t border-adm-line">
                <td className="py-6 text-adm-ink">{k}</td>
                <td className="py-6 text-right text-adm-muted">{as.length}</td>
                {ab && <td className="py-6 text-right text-adm-muted">{as.filter((a) => a.control?.tries === 'yes').length}</td>}
                <td className="py-6 text-right">{as.filter((a) => a.tries === 'yes').length}</td>
                <td className="py-6 text-right">{as.filter((a) => a.pays !== 'no').length}</td>
                {usage && <td className="py-6 text-right">{(as.reduce((s, a) => s + (a.week ?? 0), 0) / as.length).toFixed(1)}</td>}
                <td className="whitespace-nowrap py-6 text-right">
                  {money(r.low)}–{money(r.high)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8 border-t border-adm-line pt-14">
      <h3 className="text-11 font-semibold uppercase tracking-widest text-adm-muted">{title}</h3>
      {children}
    </section>
  )
}

function AnswerDetail({ a, p, run, onPersona }: { a: BuyerAnswer; p: Persona; run: BuyerRun; onPersona: () => void }) {
  const w = wellnessOf(p)
  return (
    <div className="flex flex-col gap-14 text-13 text-adm-ink">
      <div>
        <p className="text-12 text-adm-ink-2">
          {p.age} · {p.occupation} · {p.city}, {p.country} ({p.region}) · {p.language} · {p.income} income · would pay {p.willingnessToPay}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Badge tone="info">{GOAL_LABEL[p.goal]}</Badge>
          <Badge tone={VERDICT_TONE[a.tries]}>Tries: {a.tries}</Badge>
          <Badge tone={VERDICT_TONE[a.pays]}>Pays: {a.pays}</Badge>
          <Badge>{PLAN_LABEL[a.plan]}</Badge>
          <Badge>Confidence {a.confidence} of 5</Badge>
        </div>
        <button type="button" onClick={onPersona} className="mt-8 text-12 underline decoration-adm-line underline-offset-2 hover:decoration-adm-ink">
          See who {p.name.split(' ')[0]} is
        </button>
      </div>
      <p className="rounded-8 bg-adm-bg px-12 py-10 italic text-adm-ink-2">“{a.quote}”</p>

      {a.control && (
        <Section title="Today (A) against the proposal (B)">
          <div className="grid grid-cols-2 gap-8 text-12">
            <div className="rounded-8 border border-adm-line p-10">
              <p className="font-medium">A · today</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Badge tone={VERDICT_TONE[a.control.tries]}>Tries: {a.control.tries}</Badge>
                <Badge tone={VERDICT_TONE[a.control.pays]}>Pays: {a.control.pays}</Badge>
              </div>
              <p className="mt-6 text-adm-ink-2">{a.control.why}</p>
            </div>
            <div className="rounded-8 border border-adm-ink p-10">
              <p className="font-medium">B · proposed</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Badge tone={VERDICT_TONE[a.tries]}>Tries: {a.tries}</Badge>
                <Badge tone={VERDICT_TONE[a.pays]}>Pays: {a.pays}</Badge>
              </div>
              <p className="mt-6 text-adm-ink-2">
                {a.movedBy?.length ? `Moved by: ${a.movedBy.map((c) => V3_CHANGES[c as keyof typeof V3_CHANGES]?.label ?? c).join('; ')}.` : 'Nothing in B changed the answer.'}
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section title="How they are doing">
        <div className="grid grid-cols-2 gap-8 text-12 sm:grid-cols-4">
          <Fact label="Wellness" value={WELLNESS_LABEL[w.level]} />
          <Fact label="Pain" value={`${w.pain} of 10`} />
          <Fact label="Sleep" value={`${w.sleepHours} h · ${w.sleepQuality} of 5`} />
          <Fact label="Saw Plus at" value={priceSeen(run, p.country).label} />
        </div>
        <p className="text-12 text-adm-ink-2">
          {w.conditions.length > 0 && <>Conditions: {w.conditions.join(', ')}. </>}
          Wearing them down: {w.stressors.join(', ')}. Connection: {p.profile.testing.connectivity}.
        </p>
      </Section>

      <Section title="Why">
        <p className="leading-[20px]">{a.reasoning}</p>
      </Section>

      <Section title="What stops them, what would flip it">
        <p>
          <span className="text-adm-muted">{THEME_LABEL[a.theme]}: </span>
          {a.objection}
        </p>
        <p>
          <span className="text-adm-muted">Would flip it: </span>
          {a.flip}
        </p>
      </Section>

      {a.week !== undefined && (
        <Section title="Use">
          <div className="grid grid-cols-2 gap-8 text-12">
            <Fact label="Sessions in week one" value={`${a.week} of 7`} />
            <Fact label="Still using at day 30" value={a.day30 ?? '–'} />
          </div>
        </Section>
      )}

      <Section title="Price answers (USD a month)">
        <div className="grid grid-cols-4 gap-8 text-12">
          <Fact label="Too cheap" value={money(a.prices.tooCheap)} />
          <Fact label="A bargain" value={money(a.prices.bargain)} />
          <Fact label="Expensive" value={money(a.prices.expensive)} />
          <Fact label="Too expensive" value={money(a.prices.tooExpensive)} />
        </div>
      </Section>

      <Section title="Test cases">
        <ul className="flex flex-col gap-8">
          {a.scenarios.map((s) => {
            const sc = p.profile.testing.scenarios.find((x) => x.id === s.id)
            return (
              <li key={s.id} className="rounded-8 border border-adm-line p-10">
                <div className="flex items-center justify-between gap-8">
                  <p className="font-medium">{sc?.title ?? s.id}</p>
                  <Badge tone={OUTCOME_TONE[s.outcome]}>{s.outcome}</Badge>
                </div>
                {sc && <p className="mt-4 text-12 text-adm-muted">Expect: {sc.expect}</p>}
                <p className="mt-4 text-12">{s.note}</p>
              </li>
            )
          })}
        </ul>
      </Section>

      {a.personaIssue && (
        <Section title="Persona problem">
          <p className="text-12">{a.personaIssue}</p>
        </Section>
      )}

      <Section title="More">
        <Link to="/admin/personas" className="text-12 underline hover:text-adm-ink">
          All personas
        </Link>
      </Section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-8 bg-adm-bg p-8">
      <p className="text-adm-muted">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  )
}
