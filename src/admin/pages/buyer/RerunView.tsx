import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataTable, type Column } from '../../components/DataTable'
import { PersonaProfile } from '../../components/PersonaProfile'
import { SidePanel } from '../../components/SidePanel'
import { Badge, Button, Panel } from '../../components/ui'
import { OVERALL_SUMMARY, SUMMARIES } from '../../data/buyerRerunSummaries'
import { VERDICT_TONE, WELLNESS_LABEL, personasOf, wellnessOf } from '../../data/buyerRuns'
import { AGENT_RULES, ALL_VERSIONS, DESIGNS, STEP_LABEL, agreement, report, type AgentId, type DesignId, type Walk } from '../../data/buyerSim'

const OUTCOME_TONE = { pass: 'good', stall: 'warning', leave: 'critical', skip: 'neutral' } as const
const pct = (x: number) => `${Math.round(x * 100)}%`
const AGREEMENT = agreement()

interface Row {
  id: string
  name: string
  age: number
  country: string
  wellness: string
  tries: string
  leftAt: string
  d7: number
  pays: string
  reason: string
}

/** Buyer agent results → By production version (U104): 3 agent rule sets × production v1–v3. */
export function RerunView() {
  const [params, setParams] = useSearchParams()
  const agent = (Number(params.get('agent')) || 3) as AgentId
  const design = (Number(params.get('design')) || 3) as DesignId
  const [open, setOpen] = useState<{ id: string; tab: 'walk' | 'persona' } | null>(null)
  const select = (a: AgentId, d: DesignId) => {
    setOpen(null)
    setParams({ view: 'versions', agent: String(a), design: String(d) }, { replace: true })
  }
  const r = report(agent, design)
  const people = personasOf(r.run)
  const n = r.walks.length
  const maxReached = Math.max(...r.funnel.map((f) => f.reached))

  const rows: Row[] = r.walks.map((w) => {
    const p = people.get(w.personaId)!
    return {
      id: w.personaId,
      name: p.name,
      age: p.age,
      country: p.country,
      wellness: WELLNESS_LABEL[wellnessOf(p).level],
      tries: w.tries,
      leftAt: w.leftAt ? STEP_LABEL[w.leftAt] : '–',
      d7: Math.round(w.d7 * 100),
      pays: w.pays,
      reason: w.leaveTheme,
    }
  })
  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Persona',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen({ id: row.id, tab: 'persona' })
          }}
          className="text-left font-medium underline decoration-adm-line underline-offset-2 hover:decoration-adm-ink"
        >
          {row.name}
        </button>
      ),
    },
    { key: 'age', header: 'Age', numeric: true },
    { key: 'country', header: 'Country' },
    { key: 'wellness', header: 'Wellness' },
    { key: 'tries', header: 'Tries', render: (row) => <Badge tone={VERDICT_TONE[row.tries as 'yes']}>{row.tries}</Badge> },
    { key: 'leftAt', header: 'Leaves at' },
    { key: 'd7', header: 'Back day 7', numeric: true, render: (row) => `${row.d7}%` },
    { key: 'pays', header: 'Pays', render: (row) => <Badge tone={VERDICT_TONE[row.pays as 'yes']}>{row.pays}</Badge> },
    { key: 'reason', header: 'Why they stop' },
  ]
  const walkOpen = open ? r.walks.find((w) => w.personaId === open.id) : undefined

  return (
    <div className="flex flex-col gap-16">
      <Panel title="How the re-run worked" description="Every persona from runs v1, v2 and v3, walked step by step through the real screens of production v1, v2 and v3, under the rules each agent version played by.">
        <div className="grid gap-12 lg:grid-cols-3">
          {DESIGNS.map((d) => (
            <div key={d.id} className="rounded-8 bg-adm-bg p-12 text-12">
              <p className="font-semibold text-adm-ink">{d.name}</p>
              <ul className="mt-6 flex list-disc flex-col gap-4 pl-16 text-adm-ink-2">
                {d.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-12 text-adm-ink-2">
          <span className="font-medium text-adm-ink">In all three: </span>
          {ALL_VERSIONS.join(' ')}
        </p>
        <dl className="grid gap-x-16 gap-y-8 text-12 lg:grid-cols-[140px_1fr]">
          {([1, 2, 3] as const).map((a) => (
            <div key={a} className="contents">
              <dt className="font-medium text-adm-ink">{AGENT_RULES[a].name}</dt>
              <dd className="max-w-[760px] text-adm-ink-2">
                {AGENT_RULES[a].rules} Panel: run v{a}’s {a === 1 ? 10 : 36} personas.
              </dd>
            </div>
          ))}
          <div className="contents">
            <dt className="font-medium text-adm-ink">How the walks are made</dt>
            <dd className="max-w-[760px] text-adm-ink-2">
              The agent’s rules are written as code (246 walks would not be answered the same way twice by hand), from the runs played by hand, and checked against them on today’s app:{' '}
              {AGREEMENT.map((x) => `${x.label}: same answer for ${x.exact} of ${x.n}, opposite (yes against no) for ${x.opposite}`).join('; ')}. Every figure is a prediction; only the feedback group can measure them.
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Summary across the versions" description="The agent’s reading of all nine reports.">
        <ul className="flex max-w-[820px] list-disc flex-col gap-8 pl-18 text-13 leading-[20px] text-adm-ink">
          {OVERALL_SUMMARY.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Nine reports" description="Rows: whose rules. Columns: which production version. Each cell: hears a session on the first visit · back on day 7 · back on day 30. Select one to open its report.">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-12">
            <thead>
              <tr className="text-left text-adm-muted">
                <th className="py-6 font-medium" />
                {DESIGNS.map((d) => (
                  <th key={d.id} className="px-6 py-6 font-medium">
                    Production v{d.id} <span className="font-normal">(staging v{d.staging})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3] as const).map((a) => (
                <tr key={a} className="border-t border-adm-line">
                  <th className="py-6 pr-8 text-left font-medium text-adm-ink">{AGENT_RULES[a].name}</th>
                  {DESIGNS.map((d) => {
                    const c = report(a, d.id)
                    const active = a === agent && d.id === design
                    return (
                      <td key={d.id} className="px-6 py-6">
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => select(a, d.id)}
                          className={`w-full rounded-8 border px-10 py-8 text-left tabular-nums ${active ? 'border-adm-ink bg-adm-surface' : 'border-adm-line bg-adm-bg hover:bg-adm-hover'}`}
                        >
                          <span className="block text-15 font-semibold text-adm-ink">{pct(c.activation)}</span>
                          <span className="text-adm-ink-2">
                            day 7 {pct(c.d7)} · day 30 {pct(c.d30)}
                          </span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex flex-col gap-16 rounded-12 border border-adm-ink p-16">
        <div>
          <p className="text-11 font-semibold uppercase tracking-widest text-adm-muted">Report</p>
          <h2 className="mt-2 text-[17px] font-semibold text-adm-ink">
            {AGENT_RULES[agent].name} × {DESIGNS[design - 1].name}
          </h2>
          <p className="mt-2 text-12 text-adm-ink-2">
            {n} personas from run v{agent}, persona generator {r.run.generator}.
          </p>
        </div>

        <Panel title="Summary" description="What this report says.">
          <ul className="flex max-w-[820px] list-disc flex-col gap-8 pl-18 text-13 leading-[20px] text-adm-ink">
            {SUMMARIES[agent][design].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="The ten MVP market-fit metrics" description="Eugene’s list (J136). Predicted: what the agent expects people to do. Estimate: a figure only people can give; the agent’s guess for the feedback group to check.">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-12">
              <tbody>
                {r.metrics.map((m) => (
                  <tr key={m.id} className="border-t border-adm-line first:border-t-0">
                    <td className="py-8 pr-12 text-adm-ink">{m.label}</td>
                    <td className="py-8 pr-12 font-semibold tabular-nums text-adm-ink">{m.value}</td>
                    <td className="py-8 pr-12 text-adm-muted">{m.benchmark}</td>
                    <td className="py-8 text-right">
                      <Badge tone={m.kind === 'predicted' ? 'info' : 'warning'}>{m.kind}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-16 lg:grid-cols-[3fr_2fr]">
          <Panel title="Funnel" description="People at each step; amber slowed down there, red left there.">
            <ul className="flex flex-col gap-8">
              {r.funnel.map((f) => (
                <li key={f.step} className="grid grid-cols-[150px_1fr_72px] items-center gap-8 text-12">
                  <span className="text-adm-ink">{STEP_LABEL[f.step]}</span>
                  <span className="flex h-12 overflow-hidden rounded-full bg-adm-bg">
                    <span className="h-full bg-adm-s1" style={{ width: `${((f.reached - f.stalled - f.left) / maxReached) * 100}%` }} />
                    <span className="h-full bg-adm-warning" style={{ width: `${(f.stalled / maxReached) * 100}%` }} />
                    <span className="h-full bg-adm-critical" style={{ width: `${(f.left / maxReached) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-adm-muted">
                    {f.reached}
                    {f.left > 0 && <span className="text-adm-critical"> −{f.left}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Why they leave or stop" description="The reason at the step they left, or why they did not come back.">
            <ul className="flex flex-col gap-8">
              {r.leaveReasons.map(([k, v]) => (
                <li key={k} className="grid grid-cols-[150px_1fr_24px] items-center gap-8 text-12">
                  <span className="text-adm-ink">{k}</span>
                  <span className="h-10 rounded-full bg-adm-bg">
                    <span className="block h-full rounded-full bg-adm-s1" style={{ width: `${(v / n) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-adm-muted">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Every persona" description="Select a name for who they are, or anywhere else on the row for their walk through the screens.">
          <DataTable
            rows={rows}
            columns={columns}
            exportName={`aurelia-buyer-rerun-a${agent}-prod${design}`}
            pageSize={12}
            filters={[
              { key: 'tries', label: 'Tries', options: ['yes', 'maybe', 'no'] },
              { key: 'wellness', label: 'Wellness', options: Object.values(WELLNESS_LABEL) },
            ]}
            onRowClick={(row) => setOpen({ id: row.id, tab: 'walk' })}
          />
        </Panel>
      </div>

      {open && walkOpen && (
        <SidePanel
          width={600}
          title={people.get(open.id)!.name}
          description={`${open.id} · ${AGENT_RULES[agent].name} · production v${design}`}
          onClose={() => setOpen(null)}
          footer={<Button onClick={() => setOpen(null)}>Close</Button>}
        >
          <div role="tablist" aria-label="Show" className="mb-14 flex gap-4 rounded-8 bg-adm-bg p-4">
            {(['walk', 'persona'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={open.tab === t}
                onClick={() => setOpen({ id: open.id, tab: t })}
                className={`flex-1 rounded-8 px-10 py-6 text-12 font-medium ${open.tab === t ? 'bg-adm-surface text-adm-ink shadow-sm' : 'text-adm-ink-2 hover:text-adm-ink'}`}
              >
                {t === 'walk' ? 'Their walk' : 'Who they are'}
              </button>
            ))}
          </div>
          {open.tab === 'walk' ? <WalkDetail w={walkOpen} /> : <PersonaProfile p={people.get(open.id)!} />}
        </SidePanel>
      )}
    </div>
  )
}

function WalkDetail({ w }: { w: Walk }) {
  return (
    <div className="flex flex-col gap-14 text-13 text-adm-ink">
      <div className="flex flex-wrap gap-4">
        <Badge tone={VERDICT_TONE[w.tries]}>Tries: {w.tries}</Badge>
        <Badge tone={w.completed && w.activated ? 'good' : 'neutral'}>{w.completed && w.activated ? 'Finishes the first session' : 'Does not finish'}</Badge>
        <Badge tone={VERDICT_TONE[w.pays]}>Pays: {w.pays}</Badge>
        <Badge>Back day 1 / 7 / 30: {pct(w.d1)} / {pct(w.d7)} / {pct(w.d30)}</Badge>
      </div>
      <ol className="flex flex-col gap-8">
        {w.steps.map((s) => (
          <li key={s.id} className="rounded-8 border border-adm-line p-10">
            <div className="flex items-center justify-between gap-8">
              <p className="font-medium">{STEP_LABEL[s.id]}</p>
              <Badge tone={OUTCOME_TONE[s.outcome]}>{s.outcome}</Badge>
            </div>
            <p className="mt-4 text-12 text-adm-ink-2">{s.reason}</p>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-2 gap-8 text-12">
        <div className="rounded-8 bg-adm-bg p-8">
          <p className="text-adm-muted">Sessions in week one</p>
          <p className="font-semibold tabular-nums">{w.plays}</p>
        </div>
        <div className="rounded-8 bg-adm-bg p-8">
          <p className="text-adm-muted">Without it, they would be</p>
          <p className="font-semibold">{w.ellis === 'very' ? 'very disappointed' : w.ellis === 'somewhat' ? 'somewhat disappointed' : 'not disappointed'}</p>
        </div>
      </div>
      <p className="text-12 text-adm-ink-2">
        <span className="text-adm-muted">Why they stop: </span>
        {w.leaveTheme === 'Stays' ? w.leaveReason || 'Keeps coming back.' : `${w.leaveTheme}. ${w.leaveReason}`}
      </p>
    </div>
  )
}
