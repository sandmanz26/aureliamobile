import { Copy, Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type Column } from '../components/DataTable'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, PageHeader, Panel, StatCard } from '../components/ui'
import {
  BUYER_RUNS,
  OUTCOME_TONE,
  PLAN_LABEL,
  THEME_LABEL,
  VERDICT_TONE,
  countVerdicts,
  priceRange,
  scenarioCounts,
  themeCounts,
  type BuyerAnswer,
} from '../data/buyerRuns'
import { GOAL_LABEL, generatePersonas, type Persona } from '../data/personas'

const PERSONAS = new Map(generatePersonas().map((p) => [p.id, p]))
const SCALE_MAX = 20

interface Row {
  id: string
  name: string
  age: number
  country: string
  goal: string
  tries: string
  pays: string
  plan: string
  bargain: number
  theme: string
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
  const [runId, setRunId] = useState(BUYER_RUNS[0].id)
  const [openId, setOpenId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const run = BUYER_RUNS.find((r) => r.id === runId) ?? BUYER_RUNS[0]
  const n = run.answers.length

  const tries = countVerdicts(run.answers, 'tries')
  const pays = countVerdicts(run.answers, 'pays')
  const range = priceRange(run.answers)
  const themes = themeCounts(run.answers)
  const outcomes = scenarioCounts(run.answers)
  const issues = run.answers.filter((a) => a.personaIssue)

  const rows: Row[] = run.answers.map((a) => {
        const p = PERSONAS.get(a.personaId)!
        return {
          id: a.personaId,
          name: p.name,
          age: p.age,
          country: p.country,
          goal: GOAL_LABEL[p.goal],
          tries: a.tries,
          pays: a.pays,
          plan: PLAN_LABEL[a.plan],
          bargain: a.prices.bargain,
          theme: THEME_LABEL[a.theme],
          confidence: a.confidence,
        }
      })

  const verdictCell = (v: string) => <Badge tone={VERDICT_TONE[v as keyof typeof VERDICT_TONE]}>{v}</Badge>
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Persona', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'age', header: 'Age', numeric: true },
    { key: 'country', header: 'Country' },
    { key: 'goal', header: 'Goal' },
    { key: 'tries', header: 'Tries', render: (r) => verdictCell(r.tries) },
    { key: 'pays', header: 'Pays', render: (r) => verdictCell(r.pays) },
    { key: 'plan', header: 'Ends up on' },
    { key: 'bargain', header: 'A bargain at', numeric: true, render: (r) => money(r.bargain) },
    { key: 'theme', header: 'Main objection' },
    { key: 'confidence', header: 'Confidence', numeric: true, render: (r) => `${r.confidence} of 5` },
  ]

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(`${what} copied`)
    } catch {
      setNotice('Copy failed. Select the text and copy it by hand.')
    }
  }

  const open = openId ? run.answers.find((a) => a.personaId === openId) : undefined
  const pct = (v: number) => `${Math.min(100, (v / SCALE_MAX) * 100)}%`

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Buyer agent results"
        description="A buyer agent reads a panel of synthetic personas and one thing to test (a pitch, a price, a screen) and answers as each of them: would they try it, would they pay, at what price, what stops them and what would change their mind. Use it to compare options and find questions for real people. It is not evidence of demand."
        actions={
          <div className="flex flex-wrap items-center gap-8">
            {BUYER_RUNS.length > 1 && (
              <select aria-label="Run" value={run.id} onChange={(e) => setRunId(e.target.value)} className="h-32 rounded-8 border border-adm-line bg-adm-surface px-10 text-13">
                {BUYER_RUNS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            )}
            <Button size="sm" icon={<Copy size={13} />} onClick={() => copy(run.instructions, 'Agent instructions')}>
              Agent instructions
            </Button>
            <Button size="sm" icon={<Download size={13} />} onClick={() => download(`aurelia-buyer-${run.id}.json`, JSON.stringify(run, null, 2))}>
              Run as JSON
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Badge tone="warning">{run.kind === 'demo' ? 'Demo' : 'Run'} · synthetic</Badge>
        <span>
          {run.title} · {run.date} · {n} of the{' '}
          <Link to="/admin/personas" className="underline hover:text-adm-ink">
            personas
          </Link>
          , seed {run.panel.seed}. {run.method}
        </span>
        {notice && (
          <span role="status" className="text-adm-good">
            {notice}
          </span>
        )}
      </div>

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

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Would try" value={`${tries.yes} of ${n}`} hint={`${tries.maybe} maybe`} />
        <StatCard label="Would pay" value={`${pays.yes} of ${n}`} hint={`${pays.maybe} maybe, ${pays.no} no`} />
        <StatCard label="Price that feels fair" value={`${money(range.low)}–${money(range.high)}`} hint={`tested at ${money(run.stimulus.priceUsd)}`} />
        <StatCard label="Test cases" value={`${outcomes.pass} pass`} hint={`${outcomes.risk} at risk, ${outcomes.fail} fail`} />
      </div>

      <Panel title="What it tells us" description="The agent’s reading of the panel. Hypotheses to check with real people.">
        <ul className="flex max-w-[760px] list-disc flex-col gap-8 pl-18 text-13 leading-[20px] text-adm-ink">
          {run.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="Price" description="Medians of the four price answers, in US dollars a month.">
          <div className="flex flex-col gap-10">
            <div className="relative h-28 rounded-8 bg-adm-bg">
              <div className="absolute inset-y-0 rounded-8 bg-adm-good/20" style={{ left: pct(range.low), width: `calc(${pct(range.high)} - ${pct(range.low)})` }} />
              <div className="absolute inset-y-[-4px] w-2 bg-adm-critical" style={{ left: pct(run.stimulus.priceUsd) }} title="Tested price" />
            </div>
            <div className="flex justify-between text-11 tabular-nums text-adm-muted">
              {[0, 5, 10, 15, 20].map((v) => (
                <span key={v}>${v}</span>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-8 text-12 sm:grid-cols-4">
              {[
                ['Too cheap to trust', range.tooCheap],
                ['A bargain', range.low],
                ['Getting expensive', range.high],
                ['Too expensive', range.tooExpensive],
              ].map(([label, v]) => (
                <div key={label} className="rounded-8 bg-adm-bg p-8">
                  <dt className="text-adm-muted">{label}</dt>
                  <dd className="font-semibold tabular-nums">{money(v as number)}</dd>
                </div>
              ))}
            </dl>
            <p className="text-12 text-adm-ink-2">
              Green is the fair band. The red line is the tested price ({money(run.stimulus.priceUsd)}); the yearly plan works out at {money(+(79 / 12).toFixed(2))} a month.
            </p>
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

      <Panel title="Every answer" description="Select a row for the full answer, the three test cases and the persona.">
        <DataTable
          rows={rows}
          columns={columns}
          exportName={`aurelia-buyer-${run.id}`}
          pageSize={10}
          filters={[
            { key: 'tries', label: 'Tries', options: ['yes', 'maybe', 'no'] },
            { key: 'pays', label: 'Pays', options: ['yes', 'maybe', 'no'] },
          ]}
          onRowClick={(r) => setOpenId(r.id)}
        />
      </Panel>

      {issues.length > 0 && (
        <Panel title="Persona problems found" description="Personas that did not hold together while the agent played them. They go back to the generator.">
          <ul className="flex flex-col gap-6 text-12 text-adm-ink">
            {issues.map((a) => (
              <li key={a.personaId}>
                <span className="font-medium">{PERSONAS.get(a.personaId)!.name}</span> ({a.personaId}): {a.personaIssue}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {open && (
        <SidePanel
          width={600}
          title={PERSONAS.get(open.personaId)!.name}
          description={`${open.personaId} · ${run.title}`}
          onClose={() => setOpenId(null)}
          footer={<Button onClick={() => setOpenId(null)}>Close</Button>}
        >
          <AnswerDetail a={open} p={PERSONAS.get(open.personaId)!} />
        </SidePanel>
      )}
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

function AnswerDetail({ a, p }: { a: BuyerAnswer; p: Persona }) {
  return (
    <div className="flex flex-col gap-14 text-13 text-adm-ink">
      <div>
        <p className="text-12 text-adm-ink-2">
          {p.age} · {p.occupation} · {p.city}, {p.country} · {p.income} income · would pay {p.willingnessToPay}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Badge tone="info">{GOAL_LABEL[p.goal]}</Badge>
          <Badge tone={VERDICT_TONE[a.tries]}>Tries: {a.tries}</Badge>
          <Badge tone={VERDICT_TONE[a.pays]}>Pays: {a.pays}</Badge>
          <Badge>{PLAN_LABEL[a.plan]}</Badge>
          <Badge>Confidence {a.confidence} of 5</Badge>
        </div>
      </div>
      <p className="rounded-8 bg-adm-bg px-12 py-10 italic text-adm-ink-2">“{a.quote}”</p>

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

      <Section title="Price answers (USD a month)">
        <div className="grid grid-cols-4 gap-8 text-12">
          {(
            [
              ['Too cheap', a.prices.tooCheap],
              ['A bargain', a.prices.bargain],
              ['Expensive', a.prices.expensive],
              ['Too expensive', a.prices.tooExpensive],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="rounded-8 bg-adm-bg p-8">
              <p className="text-adm-muted">{label}</p>
              <p className="font-semibold tabular-nums">{money(v)}</p>
            </div>
          ))}
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

      <Section title="Persona">
        <p className="text-12 leading-[18px] text-adm-ink-2">{p.profile.bio}</p>
        <Link to="/admin/personas" className="text-12 underline hover:text-adm-ink">
          All personas
        </Link>
      </Section>
    </div>
  )
}
