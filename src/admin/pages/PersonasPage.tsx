import { Copy, Download, Shuffle, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type Column } from '../components/DataTable'
import { SidePanel } from '../components/SidePanel'
import { Badge, Button, PageHeader, Panel, inputClass } from '../components/ui'
import { GOAL_LABEL, PERSONA_COUNT, SEED, distribution, drawPanel, generatePersonas, personaPrompt, type Persona } from '../data/personas'
import { INITIAL_JOURNEY } from '../data/userJourney'

const PERSONAS = generatePersonas()
const MOMENT_TITLE = new Map(INITIAL_JOURNEY.stages.flatMap((s) => s.moments.map((m) => [m.id, m.title] as const)))

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
 * Personas (U096): 300 synthetic people as candidates for AI-run research.
 * Browse and filter them, read one with its role-play prompt, or draw a
 * balanced panel and export it for a research run.
 */
export function PersonasPage() {
  const [open, setOpen] = useState<Persona | null>(null)
  const [size, setSize] = useState(20)
  const [panelSeed, setPanelSeed] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)
  const byId = useMemo(() => new Map(PERSONAS.map((p) => [p.id, p])), [])
  const panel = useMemo(() => drawPanel(PERSONAS, size, panelSeed), [size, panelSeed])

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
        <button type="button" className="font-medium text-adm-ink underline-offset-2 hover:underline" onClick={() => setOpen(byId.get(row.id) ?? null)}>
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
        title="Personas"
        description={`${PERSONA_COUNT} synthetic people with different lives, goals and doubts, as candidates for research run by AI: interviews in role, concept and copy tests, pricing checks. Use them to form and sharpen hypotheses before real users are asked, not as evidence.`}
        actions={
          <div className="flex flex-wrap gap-8">
            <Button size="sm" icon={<Download size={13} />} onClick={() => download('aurelia-personas.json', JSON.stringify(PERSONAS, null, 2), 'application/json')}>
              All as JSON
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Badge tone="warning">Synthetic</Badge>
        <span>
          Generated from seed {SEED}, so everyone sees the same {PERSONA_COUNT}. Each links to the{' '}
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

      <Panel title="All personas" description="Search, filter and sort. Select a name to read the persona and its role-play prompt.">
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

const LEVEL_WIDTH = { low: '25%', medium: '55%', high: '90%' } as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8 border-t border-adm-line pt-14">
      <h3 className="text-11 font-semibold uppercase tracking-widest text-adm-muted">{title}</h3>
      {children}
    </section>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map((x) => (
        <span key={x} className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink">
          {x}
        </span>
      ))}
    </div>
  )
}

/** One persona as a person: who they are, a day, how they feel, what wins or loses them. */
function PersonaProfile({ p }: { p: Persona }) {
  const f = p.profile
  const initials = p.name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="flex flex-col gap-14 text-13 text-adm-ink">
      <div className="flex items-center gap-12">
        <span className="flex size-56 shrink-0 items-center justify-center rounded-full bg-adm-hover text-[17px] font-semibold text-adm-ink-2" aria-hidden="true">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-15 font-semibold">
            {p.name}, {p.age} <span className="text-12 font-normal text-adm-muted">({f.pronouns})</span>
          </p>
          <p className="text-12 text-adm-ink-2">
            {p.occupation} · {p.city}, {p.country}
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Badge tone="info">{GOAL_LABEL[p.goal]}</Badge>
            <Badge>{p.experience === 'never' ? 'New to meditation' : `Meditation: ${p.experience}`}</Badge>
            <Badge tone={p.aiAttitude === 'distrustful' || p.aiAttitude === 'skeptical' ? 'warning' : 'good'}>AI: {p.aiAttitude}</Badge>
          </div>
        </div>
      </div>
      <p className="leading-[20px]">{f.bio}</p>
      <p className="rounded-8 bg-adm-bg px-12 py-10 italic text-adm-ink-2">“{f.quotes[0]}”</p>

      <Section title="A weekday">
        <ol className="flex flex-col gap-6">
          {f.day.map((d) => (
            <li key={d.time + d.what} className="grid grid-cols-[72px_1fr] gap-8 text-12">
              <span className="tabular-nums text-adm-muted">{d.time}</span>
              <span>{d.what}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="How they are doing">
        <div className="grid grid-cols-3 gap-8 text-12">
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Sleep</p>
            <p className="font-semibold tabular-nums">
              {f.sleep.hours} h · {f.sleep.bedtime}–{f.sleep.wake}
            </p>
          </div>
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Sleep quality</p>
            <p className="font-semibold tabular-nums">{f.sleep.quality} of 5</p>
          </div>
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Screen time</p>
            <p className="font-semibold tabular-nums">{f.screenTimeHours} h a day</p>
          </div>
        </div>
        <p className="text-12">
          <span className="text-adm-muted">Right now: </span>
          {p.name.split(' ')[0]} {p.struggle}. It hits at: {p.triggers.join('; ')}.
        </p>
        <div className="flex flex-col gap-4 text-12">
          <span className="text-adm-muted">What weighs on them</span>
          <Chips items={f.stressors} />
          <span className="mt-4 text-adm-muted">How they cope now</span>
          <Chips items={f.coping} />
          {p.flags.length > 0 && (
            <>
              <span className="mt-4 text-adm-muted">Circumstances to test for</span>
              <Chips items={p.flags} />
            </>
          )}
        </div>
      </Section>

      <Section title="Personality and values">
        <div className="flex flex-col gap-6">
          {(Object.entries(f.personality) as [string, keyof typeof LEVEL_WIDTH][]).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[130px_1fr_56px] items-center gap-8 text-12">
              <span className="capitalize text-adm-ink-2">{k}</span>
              <span className="h-6 overflow-hidden rounded-full bg-adm-hover">
                <span className="block h-full rounded-full bg-adm-s1" style={{ width: LEVEL_WIDTH[v] }} />
              </span>
              <span className="text-adm-muted">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-12">
          <span className="text-adm-muted">Traits: </span>
          {f.traits.join(', ')} · <span className="text-adm-muted">Values: </span>
          {f.values.join(', ')}
        </p>
      </Section>

      <Section title="Life and tech">
        <dl className="grid grid-cols-[130px_1fr] gap-x-12 gap-y-6 text-12">
          {(
            [
              ['Home', p.household],
              ['Work', `${p.workPattern}; ${p.income} income`],
              ['Language', p.language],
              ['Phone', `${f.phone}; mostly ${f.topApps.join(', ')}`],
              ['Wearable', p.wearable],
              ['Wellness apps', f.appHistory],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-adm-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Winning them, losing them">
        <dl className="grid grid-cols-[130px_1fr] gap-x-12 gap-y-6 text-12">
          {(
            [
              ['Success looks like', f.success],
              ['Would hear about it', f.wouldHearAbout],
              ['How they decide', f.decides],
              ['Would pay', p.willingnessToPay],
              ['Prefers', `${p.length} min, ${p.voice === 'none' ? 'no voice' : `${p.voice} voice`}, ${p.sound}; spiritual language: ${p.spiritual}`],
              ['Privacy', p.privacy],
              ['Barriers', p.barriers.join('; ')],
              ['Deal breakers', f.dealBreakers.join('; ')],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-adm-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="In their words">
        <ul className="flex flex-col gap-6 text-12 italic text-adm-ink-2">
          {f.quotes.map((q) => (
            <li key={q}>“{q}”</li>
          ))}
        </ul>
      </Section>

      <Section title="User journey moments">
        <Chips items={p.moments.map((m) => MOMENT_TITLE.get(m) ?? m)} />
      </Section>

      <Section title="Role-play prompt">
        <span className="inline-flex items-center gap-6 text-12 text-adm-muted">
          <Users size={13} /> For an AI research run. Copy it with the button below.
        </span>
        <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-8 border border-adm-line bg-adm-bg p-10 text-11 leading-[16px] text-adm-ink-2">{personaPrompt(p)}</pre>
      </Section>
    </div>
  )
}
