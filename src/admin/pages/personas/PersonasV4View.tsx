import { Download, LifeBuoy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Button, Panel, inputClass } from '../../components/ui'
import { AGE_BANDS, PERSONA_COUNT_V4, SCENARIOS, SCENARIO_IDS, SEED_V4, SOURCES, TARGETS, countBy, generatePersonasV4, type Band3, type PersonaV4, type ScenarioId } from '../../data/personasV4'
import { DetailDrawerProvider, useDetail } from '../reports/DetailDrawer'
import { Term } from '../reports/Term'

/*
 * Persona set v4 (U134): 1,000 people from cited distributions. Charts of the
 * mix, filters, a paged card grid (24 at a time, so 1,000 never render at
 * once) and the shared detail drawer for one person's full profile.
 */

const PAGE = 24
const BAND_TONE = { mild: 'good', moderate: 'warning', severe: 'critical' } as const
const BAND_BG: Record<Band3, string> = { mild: 'bg-adm-good', moderate: 'bg-adm-warning', severe: 'bg-adm-critical' }
const pct = (n: number, d: number) => `${Math.round((n / d) * 1000) / 10}%`

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Bars({ data, total }: { data: [string, number][]; total: number }) {
  const max = Math.max(...data.map(([, n]) => n), 1)
  return (
    <ul className="flex flex-col gap-6">
      {data.map(([label, n]) => (
        <li key={label} className="flex flex-col gap-2">
          <div className="flex justify-between gap-8 text-12">
            <span className="min-w-0 truncate text-adm-ink">{label}</span>
            <span className="shrink-0 tabular-nums text-adm-muted">
              {n} · {pct(n, total)}
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-adm-hover">
            <div className="h-full rounded-full bg-adm-s1" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Pyramid({ ps }: { ps: PersonaV4[] }) {
  const rows = [...AGE_BANDS].reverse().map((b) => ({ b, w: ps.filter((p) => p.ageBand === b && p.sex === 'woman').length, m: ps.filter((p) => p.ageBand === b && p.sex === 'man').length }))
  const max = Math.max(...rows.flatMap((r) => [r.w, r.m]), 1)
  return (
    <div className="flex flex-col gap-4" role="img" aria-label="Age pyramid: women left, men right">
      <div className="grid grid-cols-[1fr_48px_1fr] text-11 text-adm-muted">
        <span className="text-right">Women</span>
        <span />
        <span>Men</span>
      </div>
      {rows.map((r) => (
        <div key={r.b} className="grid grid-cols-[1fr_48px_1fr] items-center gap-4 text-11">
          <div className="flex items-center justify-end gap-4">
            <span className="tabular-nums text-adm-muted">{r.w}</span>
            <div className="h-12 rounded-l-4 bg-adm-s2" style={{ width: `${(r.w / max) * 80}%` }} />
          </div>
          <span className="text-center text-adm-ink-2">{r.b}</span>
          <div className="flex items-center gap-4">
            <div className="h-12 rounded-r-4 bg-adm-s1" style={{ width: `${(r.m / max) * 80}%` }} />
            <span className="tabular-nums text-adm-muted">{r.m}</span>
          </div>
        </div>
      ))}
      <p className="text-11 text-adm-muted">{ps.filter((p) => p.sex === 'non-binary').length} non-binary people are not shown in the pyramid.</p>
    </div>
  )
}

function BandMix({ ps }: { ps: PersonaV4[] }) {
  const n = (b: Band3) => ps.filter((p) => p.wellness.band === b).length
  const bands: Band3[] = ['severe', 'moderate', 'mild']
  return (
    <div className="flex flex-col gap-10">
      <div className="flex h-16 overflow-hidden rounded-full" role="img" aria-label={bands.map((b) => `${b} ${n(b)}`).join(', ')}>
        {bands.map((b) => (
          <div key={b} className={BAND_BG[b]} style={{ width: `${(n(b) / Math.max(ps.length, 1)) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-col gap-4 text-12">
        {bands.map((b) => (
          <li key={b} className="flex justify-between gap-8">
            <span className="flex items-center gap-6 text-adm-ink">
              <span className={`size-8 rounded-full ${BAND_BG[b]}`} aria-hidden="true" />
              {b[0].toUpperCase() + b.slice(1)}
            </span>
            <span className="tabular-nums text-adm-muted">
              {n(b)} · {pct(n(b), Math.max(ps.length, 1))}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-11 text-adm-muted">
        From the <Term id="wellness-score" />: below 40 severe, 40–64 moderate, 65 and up mild.
      </p>
    </div>
  )
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-8 border-b border-adm-line py-6 text-12 last:border-0">
      <dt className="text-adm-muted">{k}</dt>
      <dd className="min-w-0 text-adm-ink">{children}</dd>
    </div>
  )
}

function Profile({ p }: { p: PersonaV4 }) {
  const w = p.wellness
  return (
    <div className="flex flex-col gap-12">
      {p.riskFlag && (
        <div className="flex gap-8 rounded-8 border border-adm-critical/40 bg-adm-critical/8 p-10 text-12 text-adm-ink">
          <LifeBuoy size={16} className="shrink-0 text-adm-critical" aria-hidden="true" />
          <span>
            <Term id="risk-flag" />: the AI routes {p.name.split(' ')[0]} to “Need help now?” and offers nothing for sale.
          </span>
        </div>
      )}
      <section>
        <h3 className="mb-4 text-12 font-semibold text-adm-ink">Why they might try Aurelia</h3>
        <p className="text-12 text-adm-ink-2">{p.mightTry}</p>
        <h3 className="mt-8 mb-4 text-12 font-semibold text-adm-ink">Why they might not</h3>
        <p className="text-12 text-adm-ink-2">{p.mightNot}</p>
      </section>
      <dl>
        <Row k="Who">
          {p.age}, {p.sex}, {p.city}, {p.country} ({p.region})
        </Row>
        <Row k="Language">
          {p.language}
          {p.language !== 'English' && (p.readsEnglish ? ', reads English' : ', needs the app in their own language')}
        </Row>
        <Row k="Work">
          {p.occupation} ({p.work}
          {p.shiftWork ? (p.nightShift ? ', night shifts' : ', rotating shifts') : ''})
        </Row>
        <Row k="Home">
          {p.household}; {p.lifeStage}
        </Row>
        <Row k="Income">
          {p.income} for {p.country}, about ${p.incomeUsdMonth.toLocaleString('en-US')} a month
        </Row>
        <Row k="Also">{[p.caregiving && 'gives unpaid care', p.chronicPain && 'chronic pain'].filter(Boolean).join(', ') || 'nothing else noted'}</Row>
        <Row k={'Life situation'}>
          {SCENARIOS[p.scenario].label}: started {p.onsetWeeksAgo} weeks ago, {p.duration}
        </Row>
        <Row k="Bad nights after">{p.badNightTriggers.join('; ')}</Row>
        <Row k="Sleep">
          {w.sleep.band} · {w.sleep.hours} h · {w.sleep.latencyMin} min to fall asleep · wakes {w.sleep.wakeUps}× · bed {w.sleep.bedtime}, up {w.sleep.wake}
        </Row>
        <Row k="Stress">
          {w.stress.band}
          {w.stress.stressedYesterday ? '; stressed a lot of yesterday' : ''}
        </Row>
        <Row k="Mood / worry">
          low mood {w.mood}, worry {w.anxiety} (<Term id="screening">screening only</Term>)
        </Row>
        <Row k="Energy">{w.energy} of 5</Row>
        <Row k="Habits">
          {w.activeMinutesWeek} active min a week · {w.caffeineCups} coffees or teas a day · {w.alcoholDrinksWeek} drinks a week · {w.screenInBedMin} min on the phone in bed
        </Row>
        <Row k="Day to day">{w.functioning}</Row>
        <Row k="Phone">
          {p.device}, {p.deviceAge}
          {p.wearable !== 'none' ? `; wears a ${p.wearable}` : '; no wearable'}
        </Row>
        <Row k="Apps before">{p.priorApp === 'none' ? 'never used a meditation or sleep app' : `${p.priorApp} (${p.priorAppOutcome})`}</Row>
        <Row k="Towards AI">{p.aiAttitude}</Row>
      </dl>
    </div>
  )
}

function Card({ p }: { p: PersonaV4 }) {
  const open = useDetail()
  return (
    <button
      type="button"
      data-persona={p.id}
      onClick={() =>
        open({
          kicker: `${p.id} · made-up person`,
          title: p.name,
          summary: p.story.join(' '),
          numbers: [
            { label: '{{wellness-score}}', value: `${p.wellness.score} (${p.wellness.band})` },
            { label: '{{life-situation}}', value: SCENARIOS[p.scenario].label },
            { label: 'Age', value: String(p.age) },
            { label: 'Country', value: p.country },
          ],
          extra: <Profile p={p} />,
        })
      }
      className="flex min-w-0 flex-col gap-6 rounded-12 border border-adm-line bg-adm-surface p-12 text-left hover:bg-adm-hover"
    >
      <div className="flex items-start justify-between gap-8">
        <span className="min-w-0 truncate text-13 font-semibold text-adm-ink">{p.name}</span>
        <Badge tone={BAND_TONE[p.wellness.band]}>{p.wellness.score}</Badge>
      </div>
      <span className="text-12 text-adm-ink-2">
        {p.age} · {p.sex} · {p.country}
      </span>
      <span className="text-12 text-adm-muted">{SCENARIOS[p.scenario].label}</span>
      {p.riskFlag && (
        <span className="flex items-center gap-4 text-11 font-medium text-adm-critical">
          <LifeBuoy size={12} aria-hidden="true" /> Need help now?
        </span>
      )}
    </button>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="flex min-w-0 flex-col gap-4 text-12 text-adm-ink-2">
      {label}
      <select className={`${inputClass} h-32 text-12`} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}

function View() {
  const all = useMemo(() => generatePersonasV4(), [])
  const [region, setRegion] = useState('')
  const [age, setAge] = useState('')
  const [scenario, setScenario] = useState('')
  const [band, setBand] = useState('')
  const [riskOnly, setRiskOnly] = useState(false)
  const [page, setPage] = useState(0)

  const shown = useMemo(
    () => all.filter((p) => (!region || p.region === region) && (!age || p.ageBand === age) && (!scenario || p.scenario === scenario) && (!band || p.wellness.band === band) && (!riskOnly || p.riskFlag)),
    [all, region, age, scenario, band, riskOnly],
  )
  const pages = Math.max(1, Math.ceil(shown.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const set = (f: (v: string) => void) => (v: string) => {
    f(v)
    setPage(0)
  }

  const n = all.length
  const risk = all.filter((p) => p.riskFlag).length
  const workers = all.filter((p) => p.work === 'employed' || p.work === 'self-employed')
  const s = (f: (p: PersonaV4) => boolean, base = all) => base.filter(f).length / base.length
  const checks: { what: string; target: number; got: number; src: string }[] = [
    { what: 'Sleep problems (insomnia symptoms)', target: TARGETS.insomniaSymptoms, got: s((p) => p.wellness.sleep.band !== 'good'), src: 'ohayon' },
    { what: 'Very poor sleep (insomnia disorder level)', target: TARGETS.insomniaDisorder, got: s((p) => p.wellness.sleep.band === 'very poor'), src: 'ohayon' },
    { what: 'Stressed a lot of yesterday', target: TARGETS.stressedYesterday, got: s((p) => p.wellness.stress.stressedYesterday), src: 'gallup' },
    { what: 'Any low-mood symptoms', target: TARGETS.lowMoodAny, got: s((p) => p.wellness.mood !== 'none'), src: 'nhis-dep' },
    { what: 'Any worry (anxiety) symptoms', target: TARGETS.anxietyAny, got: s((p) => p.wellness.anxiety !== 'none'), src: 'nhis-anx' },
    { what: 'Shift work (of people in work)', target: TARGETS.shiftOfWorkers, got: s((p) => p.shiftWork, workers), src: 'eurofound' },
    { what: 'Gives unpaid care', target: TARGETS.caregiving, got: s((p) => p.caregiving), src: 'aarp' },
    { what: 'Chronic pain', target: TARGETS.chronicPain, got: s((p) => p.chronicPain), src: 'cdc-pain' },
    { what: 'Less than 150 active minutes a week', target: TARGETS.insufficientActivity, got: s((p) => p.wellness.activeMinutesWeek < 150), src: 'who-pa' },
    { what: 'Used a meditation or sleep app before', target: TARGETS.priorApp, got: s((p) => p.priorApp !== 'none'), src: 'prior-app' },
    { what: 'Wears a smartwatch or tracker', target: 0.21, got: s((p) => p.wearable !== 'none'), src: 'pew' },
    { what: 'Risk flag', target: TARGETS.riskFlag, got: risk / n, src: 'risk' },
  ]
  const kindOf = (id: string) => SOURCES.find((x) => x.id === id)?.kind ?? 'assumption'
  const regions = [...new Set(all.map((p) => p.region))].sort()

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center gap-8 text-12 text-adm-ink-2">
        <Badge tone="warning">Made up</Badge>
        <span className="min-w-0">
          {PERSONA_COUNT_V4.toLocaleString('en-US')} made-up people, the same on every machine (start number {SEED_V4}). Their ages, countries, phones, sleep, stress and mood follow the figures in “Where these numbers come from” below. Each has a{' '}
          <Term id="life-situation" />, a starting <Term id="wellness-score" /> and a short story. They are for research by AI, not evidence.
        </span>
        <Button size="sm" icon={<Download size={13} />} onClick={() => download('aurelia-personas-v4.json', JSON.stringify(all, null, 2))}>
          All 1,000 as JSON
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        {[
          ['People', n.toLocaleString('en-US')],
          ['Countries', String(new Set(all.map((p) => p.country)).size)],
          ['Severe at the start', String(all.filter((p) => p.wellness.band === 'severe').length)],
          ['Risk flag (sent to help)', String(risk)],
        ].map(([k, v]) => (
          <div key={k} className="flex min-w-0 flex-col gap-4 rounded-12 border border-adm-line bg-adm-surface p-12">
            <span className="text-12 text-adm-muted">{k}</span>
            <span className="text-20 font-semibold text-adm-ink tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Age and sex" description="Women left, men right. From UN population figures per country.">
          <Pyramid ps={all} />
        </Panel>
        <Panel title="Countries" description="Weighted to Aurelia’s markets, Indonesia first.">
          <Bars data={countBy(all, (p) => p.country)} total={n} />
        </Panel>
        <Panel title="Starting wellness" description="How bad things are at the start.">
          <BandMix ps={all} />
        </Panel>
        <Panel title="Life situations" description="What is going on for each person right now.">
          <Bars data={countBy(all, (p) => SCENARIOS[p.scenario].label)} total={n} />
        </Panel>
        <Panel title="Sleep" description="Screening-style sleep bands, like a short sleep questionnaire.">
          <Bars data={countBy(all, (p) => p.wellness.sleep.band)} total={n} />
        </Panel>
        <Panel title="Risk flag" description="People the AI must send to “Need help now?” instead of selling.">
          <p className="text-28 font-semibold text-adm-critical tabular-nums">{risk}</p>
          <p className="text-12 text-adm-ink-2">
            {pct(risk, n)} of the set have a <Term id="risk-flag" />. They are counted here, kept in every study, and never marketed to.
          </p>
        </Panel>
      </div>

      <Panel title="This set against the figures it aims for" description="Each row: the figure we aimed for, what the 1,000 came out at, and whether the figure was measured or is our own assumption.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-12">
            <thead>
              <tr className="text-left text-adm-muted">
                <th className="py-6 pr-8 font-medium">What</th>
                <th className="py-6 pr-8 text-right font-medium">Aimed for</th>
                <th className="py-6 pr-8 text-right font-medium">This set</th>
                <th className="py-6 font-medium">Kind</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.what} className="border-t border-adm-line">
                  <td className="py-6 pr-8 text-adm-ink">{c.what}</td>
                  <td className="py-6 pr-8 text-right tabular-nums">{pct(c.target, 1)}</td>
                  <td className="py-6 pr-8 text-right tabular-nums">{pct(c.got, 1)}</td>
                  <td className="py-6">{kindOf(c.src) === 'measured' ? <Term id="measured">measured statistic</Term> : <Term id="assumption">our assumption</Term>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="All 1,000 people" description={`Filter, then select a card for the full profile. ${shown.length} match.`}>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <Select label="Region" value={region} onChange={set(setRegion)} options={regions.map((r) => [r, r])} />
          <Select label="Age" value={age} onChange={set(setAge)} options={AGE_BANDS.map((b) => [b, b])} />
          <Select label="Life situation" value={scenario} onChange={set(setScenario)} options={SCENARIO_IDS.map((id: ScenarioId) => [id, SCENARIOS[id].label])} />
          <Select label="Wellness band" value={band} onChange={set(setBand)} options={[['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']]} />
          <label className="flex items-center gap-6 self-end pb-6 text-12 text-adm-ink-2">
            <input
              type="checkbox"
              checked={riskOnly}
              onChange={(e) => {
                setRiskOnly(e.target.checked)
                setPage(0)
              }}
            />
            Risk flag only
          </label>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="persona-grid">
          {shown.slice(cur * PAGE, cur * PAGE + PAGE).map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>
        {shown.length === 0 && <p className="text-12 text-adm-muted">Nobody matches these filters.</p>}
        <div className="flex flex-wrap items-center justify-between gap-8 text-12 text-adm-ink-2">
          <span>
            Page {cur + 1} of {pages}
          </span>
          <div className="flex gap-8">
            <Button size="sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>
              Previous
            </Button>
            <Button size="sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Where these numbers come from" description="Measured statistics were counted by someone else; our assumptions are choices we made, often guided by a measured figure.">
        <ul className="flex flex-col gap-8">
          {SOURCES.map((src) => (
            <li key={src.id} className="flex flex-col gap-2 border-b border-adm-line pb-8 text-12 last:border-0">
              <div className="flex flex-wrap items-center gap-6">
                <span className="font-semibold text-adm-ink">{src.what}</span>
                <Badge tone={src.kind === 'measured' ? 'good' : 'neutral'}>{src.kind === 'measured' ? 'Measured statistic' : 'Our assumption'}</Badge>
              </div>
              <span className="text-adm-ink-2">{src.figure}</span>
              <a href={src.url} target="_blank" rel="noreferrer" className="break-words text-adm-muted underline hover:text-adm-ink">
                {src.cite} ({src.year})
              </a>
            </li>
          ))}
        </ul>
        <p className="text-11 text-adm-muted">
          Mood and worry use <Term id="screening">screening bands</Term> for role-play only. Nothing here diagnoses anyone.
        </p>
      </Panel>
    </div>
  )
}

/** Persona set v4, with the shared detail drawer. */
export function PersonasV4View() {
  return (
    <DetailDrawerProvider>
      <View />
    </DetailDrawerProvider>
  )
}
