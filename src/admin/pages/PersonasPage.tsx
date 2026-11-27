import { Copy, Download, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type Column } from '../components/DataTable'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, PageHeader, Panel, inputClass } from '../components/ui'
import { GOAL_LABEL, PERSONA_COUNT, SEED, distribution, drawPanel, generatePersonas, personaPrompt, type Generator, type Persona } from '../data/personas'
import { PersonaProfile } from '../components/PersonaProfile'
import { PersonasV4View } from './personas/PersonasV4View'
import { PageSummary, PageTabs } from '../components/PageTabs'
import { usePageTab } from '../components/pageTab'
import { SCENARIOS, generatePersonasV4 } from '../data/personasV4'

type SetId = 'v4' | 'v2' | 'v1'
const SETS: { id: SetId; label: string }[] = [
  { id: 'v4', label: 'Set v4 · 1,000' },
  { id: 'v2', label: 'Set v2 · 300' },
  { id: 'v1', label: 'Set v1 · 300' },
]

interface Row {
  id: string
  name: string
  age: number
  country: string
  goal: string
  work: string
  experience: string
  ai: string
  pay: string
  flags: string
}

const toRow = (p: Persona): Row => ({
  id: p.id,
  name: p.name,
  age: p.age,
  country: p.country,
  goal: GOAL_LABEL[p.goal],
  work: p.workPattern,
  experience: p.experience,
  ai: p.aiAttitude,
  pay: p.willingnessToPay,
  flags: p.flags.join(', ') || '—',
})

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Personas: a switch between persona sets. Set v4 (U134, the default) is
 * 1,000 people from cited distributions; sets v1 and v2 (U096, U103) are the
 * 300 from generators 1 and 2, kept as they were for the runs pinned to them.
 */
export function PersonasPage() {
  const [set, setSet] = useState<SetId>('v4')
  const [, setTab] = usePageTab()
  // Summary (U142): the facts of set v4, the default.
  const facts = useMemo(() => {
    const ps = generatePersonasV4()
    const scen = new Map<string, number>()
    for (const p of ps) scen.set(p.scenario, (scen.get(p.scenario) ?? 0) + 1)
    const top = [...scen.entries()].sort((a, b) => b[1] - a[1])[0]
    return {
      count: ps.length,
      countries: new Set(ps.map((p) => p.country)).size,
      risk: ps.filter((p) => p.riskFlag).length,
      top: top ? `${SCENARIOS[top[0] as keyof typeof SCENARIOS].label} (${top[1]})` : '',
    }
  }, [])
  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title="Personas"
        description="Made-up people with different lives, goals and doubts, as candidates for research run by AI: interviews in role, concept and copy tests, pricing checks. Use them to form and sharpen ideas before real users are asked, not as evidence."
      />
      <PageTabs
        summary={
          <PageSummary
            purpose="choosing made-up people to run AI research on (interviews in role, concept, copy and price tests) before real users are asked."
            question="Who do our tests run on, and who must never be sold to?"
            answer={`${facts.count.toLocaleString('en-US')} made-up people from ${facts.countries} countries; ${facts.risk} carry a risk flag and go to the help screen, never a sale.`}
            stats={[
              { label: 'People in set v4', value: facts.count.toLocaleString('en-US') },
              { label: 'Countries', value: String(facts.countries) },
              { label: 'Risk-flagged', value: String(facts.risk), note: 'routed to help, never sold to' },
            ]}
            next={[
              { text: `Most common life situation: ${facts.top}. Check it matches who we want to reach.` },
              { text: 'Pick a panel in Detail and copy its role-play prompts into a test.' },
              { text: 'See what simulated buyers said in the Buyer agent report.', to: '/admin/reports/buyer-agent', linkLabel: 'Buyer agent report' },
            ]}
            note="Synthetic people for forming ideas, not evidence. Sets v1 and v2 (300 each) stay for the runs pinned to them."
            onDetail={() => setTab('detail')}
          />
        }
      >
      <div role="tablist" aria-label="Persona set" className="flex w-fit max-w-full flex-wrap gap-4 rounded-8 border border-adm-line bg-adm-surface p-4">
        {SETS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={set === x.id}
            onClick={() => setSet(x.id)}
            className={`rounded-4 px-10 py-6 text-12 font-medium ${set === x.id ? 'bg-adm-ink text-adm-surface' : 'text-adm-ink-2 hover:bg-adm-hover'}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      {set === 'v4' ? <PersonasV4View /> : <LegacyPersonas key={set} gen={set === 'v1' ? 1 : 2} />}
      </PageTabs>
    </div>
  )
}

/**
 * Sets v1 and v2 (U096): 300 synthetic people as candidates for AI-run
 * research. Browse and filter them, read one with its role-play prompt, or
 * draw a balanced panel and export it for a research run.
 */
function LegacyPersonas({ gen }: { gen: Generator }) {
  const PERSONAS = useMemo(() => generatePersonas(undefined, undefined, gen), [gen])
  const [open, setOpen] = useState<Persona | null>(null)
  const [size, setSize] = useState(20)
  const [panelSeed, setPanelSeed] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)
  const byId = useMemo(() => new Map(PERSONAS.map((p) => [p.id, p])), [PERSONAS])
  const panel = useMemo(() => drawPanel(PERSONAS, size, panelSeed), [PERSONAS, size, panelSeed])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(t)
  }, [notice])

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(`${what} copied`)
    } catch {
      setNotice('Copy failed. Select the text and copy it by hand.')
    }
  }

  const columns: Column<Row>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '64px' },
    {
      key: 'name',
      header: 'Persona',
      sortable: true,
      render: (row) => (
        <button type="button" className="text-left font-medium text-adm-ink underline-offset-2 hover:underline" onClick={() => setOpen(byId.get(row.id) ?? null)}>
          {row.name}
        </button>
      ),
    },
    { key: 'age', header: 'Age', numeric: true, sortable: true },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'goal', header: 'Goal', sortable: true },
    { key: 'work', header: 'Work', sortable: true },
    { key: 'experience', header: 'Meditation', sortable: true },
    { key: 'ai', header: 'Towards AI', sortable: true },
    { key: 'pay', header: 'Would pay', sortable: true },
    { key: 'flags', header: 'To test for' },
  ]
  const rows = PERSONAS.map(toRow)
  const options = (k: keyof Row) => [...new Set(rows.map((r) => String(r[k])))].sort()

  const dists: { title: string; data: [string, number][] }[] = [
    { title: 'Goal', data: distribution(PERSONAS, 'goal').map(([k, n]) => [GOAL_LABEL[k as Persona['goal']], n]) },
    { title: 'Age', data: distribution(PERSONAS, 'ageBand').sort((a, b) => a[0].localeCompare(b[0])) },
    { title: 'Region', data: distribution(PERSONAS, 'region') },
    { title: 'Meditation experience', data: distribution(PERSONAS, 'experience') },
    { title: 'Towards AI', data: distribution(PERSONAS, 'aiAttitude') },
    { title: 'Would pay', data: distribution(PERSONAS, 'willingnessToPay') },
  ]

  return (
    <div className="flex flex-col gap-16">
      <PageHeader
        title={`Set v${gen}`}
        description={`${PERSONA_COUNT} synthetic people with different lives, goals and doubts, as candidates for research run by AI: interviews in role, concept and copy tests, pricing checks. Use them to form and sharpen hypotheses before real users are asked, not as evidence.`}
        actions={
          <div className="flex flex-wrap gap-8">
            <Button size="sm" icon={<Download size={13} />} onClick={() => download(`aurelia-personas-v${gen}.json`, JSON.stringify(PERSONAS, null, 2), 'application/json')}>
              All as JSON
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Badge tone="warning">Synthetic</Badge>
        <span>
          Generated from seed {SEED} with generator {gen}, so everyone sees the same {PERSONA_COUNT}; a check keeps every one of them coherent (age, work, household, money). Each links to the{' '}
          <Link to="/admin/user-journey" className="underline hover:text-adm-ink">
            user journey
          </Link>{' '}
          moments they would hit.
        </span>
      </div>

      <Panel
        title="Draw a research panel"
        description="A balanced set, the same number from each goal, reproducible from its panel number. Export it with a role-play prompt per persona for an AI research run."
        actions={
          <div className="flex flex-wrap items-center gap-8">
            <label className="flex items-center gap-6 text-12 text-adm-ink-2">
              Size
              <select className={`${inputClass} h-30 w-auto! text-12`} value={size} onChange={(e) => setSize(Number(e.target.value))}>
                {[6, 12, 20, 30, 60, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Button size="sm" icon={<Shuffle size={13} />} onClick={() => setPanelSeed((s) => s + 1)}>
              Draw another
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Download size={13} />}
              onClick={() =>
                download(
                  `aurelia-research-panel-${panelSeed}-${size}.json`,
                  JSON.stringify({ panel: panelSeed, size, synthetic: true, personas: panel.map((p) => ({ ...p, prompt: personaPrompt(p) })) }, null, 2),
                  'application/json',
                )
              }
            >
              Export panel
            </Button>
          </div>
        }
      >
        <p className="text-12 text-adm-muted">
          Panel {panelSeed} · {panel.length} personas
        </p>
        <div className="flex flex-wrap gap-6">
          {panel.map((p) => (
            <button key={p.id} type="button" onClick={() => setOpen(p)} className="rounded-full border border-adm-line px-10 py-4 text-12 text-adm-ink hover:bg-adm-hover">
              {p.name} · {p.age} · {GOAL_LABEL[p.goal]}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
        {dists.map((d) => (
          <Panel key={d.title} title={d.title}>
            <ul className="flex flex-col gap-6">
              {d.data.map(([label, n]) => (
                <li key={label} className="flex flex-col gap-2">
                  <div className="flex justify-between gap-8 text-12">
                    <span className="text-adm-ink">{label}</span>
                    <span className="tabular-nums text-adm-muted">{n}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-adm-hover">
                    <div className="h-full rounded-full bg-adm-s1" style={{ width: `${(n / PERSONA_COUNT) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <Panel title="All personas" description="Search, filter and sort. Select any row to open the full profile, its test cases and its role-play prompt.">
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={['id', 'name', 'country', 'goal', 'flags']}
          filters={[
            { key: 'goal', label: 'Goal', options: options('goal') },
            { key: 'country', label: 'Country', options: options('country') },
            { key: 'experience', label: 'Meditation', options: options('experience') },
            { key: 'ai', label: 'Towards AI', options: options('ai') },
          ]}
          onRowClick={(row) => setOpen(byId.get(row.id) ?? null)}
          exportName="aurelia-personas"
          pageSize={20}
        />
      </Panel>

      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-8 bg-adm-ink px-14 py-10 text-12 text-adm-surface shadow-lg">
          {notice}
        </div>
      )}

      {open && (
        <SidePanel
          width={600}
          title={open.name}
          description={`${open.id} · synthetic persona`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <Button variant="primary" icon={<Copy size={13} />} onClick={() => copy(personaPrompt(open), 'Prompt')}>
                Copy role-play prompt
              </Button>
              <Button onClick={() => setOpen(null)}>Close</Button>
            </>
          }
        >
          <PersonaProfile p={open} />
        </SidePanel>
      )}
    </div>
  )
}
