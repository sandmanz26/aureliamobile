import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSummary, PageTabs } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { Badge, PageHeader, Panel, inputClass, type Tone } from '../../components/ui'
import { NUM_LABEL_TEXT, type NumLabel } from '../../data/stateFlipSleep'
import { DEFAULT_FLIP, HOLD_12_WEEKS, funnelOptions, therapeuticFunnel, type FunnelStage } from '../../data/therapeuticFunnel'
import { DataSources } from '../reports/DataSources'

/*
 * Admin → AI brain → Therapeutic funnel (U148, J206): per StateFlip, from
 * "has the problem" to "stays good", with counts, drop-off, the reason and the
 * levers. Numbers from data/therapeuticFunnel.ts (read-only on stateFlips and
 * stateFlipFormulas).
 */

const ROUTE = '/admin/therapeutic-funnel'
const LABEL_TONE: Record<NumLabel, Tone> = { spec: 'critical', assumption: 'serious', computed: 'info', research: 'good' }
const pct = (x: number) => `${Math.round(x * 100)}%`
const n0 = (x: number) => (Math.round(x * 10) / 10).toFixed(x < 10 ? 1 : 0)

export function TherapeuticFunnelPage() {
  const [flipId, setFlipId] = useState(DEFAULT_FLIP)
  const [, setPageTab] = usePageTab()
  const f = therapeuticFunnel(flipId)
  const z = f.stages.find((s) => s.id === 'Z')!
  const hold = f.stages.find((s) => s.id === 'holds')!
  const options = funnelOptions()

  const picker = (
    <label className="flex min-w-0 flex-col gap-4 text-12 font-medium text-adm-ink-2 lg:w-[420px]">
      StateFlip
      <select value={flipId} onChange={(e) => setFlipId(e.target.value)} className={`${inputClass} min-w-0`} data-flip-select>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="flex flex-col gap-20">
      <PageHeader
        title="Therapeutic funnel"
        description="For one StateFlip at a time: how many simulated people get from having the problem to a good state that lasts, where they drop off, why, and what moves each stage."
        actions={picker}
      />
      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
            <PageSummary
              purpose="seeing where people drop off on the way from a bad state to a good one, and which levers move each stage."
              question={`For ${f.flip.title.toLowerCase()}, where do we lose the most people?`}
              answer={`Of ${f.stages[0].people.toFixed(0)} simulated people with the problem, about ${n0(z.people)} (${pct(z.ofProblem)}) are expected to flip and ${n0(hold.people)} to stay good. The biggest loss is before “${f.biggestDrop.title}”: about ${n0(f.biggestDrop.lost)} people. ${f.biggestDrop.why}`}
              stats={[
                { label: 'Flip (reach Z)', value: pct(z.ofProblem), note: `${n0(z.people)} of ${f.stages[0].people.toFixed(0)}` },
                { label: 'Biggest drop', value: n0(f.biggestDrop.lost), note: `before ${f.biggestDrop.title}` },
                { label: 'Stays good, 12 weeks', value: pct(hold.ofProblem), note: `assumes ${pct(HOLD_12_WEEKS)} hold` },
              ]}
              next={[
                { text: `Work on the levers of “${f.biggestDrop.title}” first (Detail).` },
                { text: 'Replace “stays good” with the pilot’s 4- and 12-week check-ins.' },
                { text: 'See how one chapter is built.', to: '/admin/session-builder', linkLabel: 'How a session is built' },
              ]}
              note="Simulated people (persona set v4) and the StateFlips formulas; nothing is measured on real people yet. “Therapeutic” is an internal name; what Aurelia says to people stays wellness."
              onDetail={() => setPageTab('detail')}
            />
            <DataSources route={ROUTE} />
          </div>
        }
      >
        <Panel title={`${f.flip.id} · ${f.flip.title}`} description={f.basis}>
          <FunnelBars stages={f.stages} />
        </Panel>
        <Panel title="Each stage: why people drop off, and what moves it" description="Counts are expected values: each person adds their probability of reaching the stage.">
          <ol className="flex flex-col gap-10">
            {f.stages.map((s, i) => (
              <StageCard key={s.id} s={s} i={i} />
            ))}
          </ol>
          <p className="text-12 text-adm-muted">
            Formulas and people: <Link to="/admin/stateflips" className="underline decoration-adm-axis underline-offset-2">StateFlips</Link>. AKP ids: the AKP catalogue there.
          </p>
        </Panel>
        <DataSources route={ROUTE} full />
      </PageTabs>
    </div>
  )
}

function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  return (
    <ol className="flex flex-col gap-8" aria-label="Funnel">
      {stages.map((s, i) => (
        <li key={s.id} className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-12" data-stage={s.id}>
          <span className="text-13 font-medium text-adm-ink lg:w-[260px] lg:shrink-0">{s.title}</span>
          <div className="flex min-w-0 flex-1 items-center gap-8">
            <div className="h-20 min-w-0 flex-1 rounded-4 bg-adm-bg">
              <div className={`h-20 rounded-4 ${s.label === 'assumption' ? 'bg-adm-s3' : 'bg-adm-s1'}`} style={{ width: `${Math.max(1, s.ofProblem * 100)}%` }} />
            </div>
            <span className="w-[120px] shrink-0 text-right text-12 tabular-nums text-adm-ink">
              {n0(s.people)} · {pct(s.ofProblem)}
            </span>
          </div>
          <span className="text-12 tabular-nums text-adm-muted lg:w-[110px] lg:shrink-0">{i === 0 ? 'start' : `−${n0(s.lost)} (${pct(1 - s.ofPrevious)})`}</span>
        </li>
      ))}
    </ol>
  )
}

function StageCard({ s, i }: { s: FunnelStage; i: number }) {
  return (
    <li className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12">
      <div className="flex flex-wrap items-center gap-8">
        <span className="text-13 font-semibold text-adm-ink">{i + 1}. {s.title}</span>
        <Badge tone={LABEL_TONE[s.label]}>{NUM_LABEL_TEXT[s.label]}</Badge>
        <span className="text-12 tabular-nums text-adm-ink-2">{n0(s.people)} people{i > 0 && `, ${pct(s.ofPrevious)} of the stage before`}</span>
      </div>
      <dl className="grid min-w-0 gap-x-12 gap-y-6 text-12 lg:grid-cols-[120px_1fr]">
        <dt className="text-adm-muted">How</dt>
        <dd className="min-w-0 text-adm-ink-2">{s.how}</dd>
        {i > 0 && (
          <>
            <dt className="text-adm-muted">Why they drop</dt>
            <dd className="min-w-0 text-adm-ink-2">{s.why}</dd>
          </>
        )}
        <dt className="text-adm-muted">Levers</dt>
        <dd className="min-w-0 text-adm-ink-2">
          <ul className="list-disc pl-16">
            {s.levers.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </dd>
        {s.akps.length > 0 && (
          <>
            <dt className="text-adm-muted">AKPs</dt>
            <dd className="flex min-w-0 flex-wrap gap-4">
              {s.akps.map((a) => <code key={a} className="rounded-4 bg-adm-bg px-4 font-mono text-11 text-adm-ink">{a}</code>)}
            </dd>
          </>
        )}
      </dl>
    </li>
  )
}
