import { ArrowRight } from 'lucide-react'
import { PageTabs, PurposeLine } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { RELEASES } from '../../../versions/releases'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import { VALUE_KIND_TEXT, WORLDS, sleepJourney, sleepProcess, triangle, type Corner, type CornerId, type CornerLink, type ValueKind, type World } from '../../data/therapeuticMap'
import { DetailDrawerProvider, useDetail } from '../reports/DetailDrawer'
import { Details, GoalLine } from '../reports/ReportSummary'
import { Term } from '../reports/Term'

/*
 * Admin → Product lab → Therapeutic map (U131, J183). The Product · Business
 * · Wellness triangle with each corner's core targets, the bad-to-good
 * process for sleep as the app runs it, and the five wellness worlds.
 * "Therapeutic" is the internal metric name; the content is wellness. Data in
 * data/therapeuticMap.ts.
 */

const KIND_TONE: Record<ValueKind, Tone> = { measured: 'good', simulated: 'info', assumption: 'critical', 'not-measured': 'neutral' }
const CORNER_FILL: Record<CornerId, string> = { product: 'fill-adm-s1', business: 'fill-adm-s2', wellness: 'fill-adm-s3' }
const CORNER_BG: Record<CornerId, string> = { product: 'bg-adm-s1', business: 'bg-adm-s2', wellness: 'bg-adm-s3' }
const CORNER_XY: Record<CornerId, { x: number; y: number }> = { wellness: { x: 300, y: 50 }, product: { x: 90, y: 330 }, business: { x: 510, y: 330 } }

function KindBadge({ kind }: { kind: ValueKind }) {
  return <Badge tone={KIND_TONE[kind]}>{VALUE_KIND_TEXT[kind]}</Badge>
}

export function TherapeuticMapPage() {
  return (
    <DetailDrawerProvider>
      <TherapeuticMap />
    </DetailDrawerProvider>
  )
}

function TargetList({ c }: { c: Corner }) {
  return (
    <ul className="flex flex-col gap-6">
      {c.targets.map((t) => (
        <li key={t.label} className="flex flex-col gap-2 rounded-8 border border-adm-line p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <span className="text-12 font-semibold text-adm-ink">{t.label}</span>
            <KindBadge kind={t.kind} />
          </div>
          <span className="text-12 tabular-nums text-adm-ink-2">
            Now {t.value} · target {t.target}
          </span>
          <span className="text-11 text-adm-muted">{t.source}</span>
        </li>
      ))}
    </ul>
  )
}

function TherapeuticMap() {
  const open = useDetail()
  const [{ corners, links }] = useState(() => triangle())
  const [steps] = useState(() => sleepProcess())
  const [j] = useState(() => sleepJourney())
  const [world, setWorld] = useState<World['id']>('sleep')
  const w = WORLDS.find((x) => x.id === world) ?? WORLDS[0]
  const byId = Object.fromEntries(corners.map((c) => [c.id, c])) as Record<CornerId, Corner>

  const openCorner = (c: Corner) =>
    open({
      kicker: 'Triangle corner',
      title: c.title,
      summary: c.about,
      numbers: c.targets.map((t) => ({ label: t.label, value: `${t.value} (${VALUE_KIND_TEXT[t.kind].toLowerCase()})` })),
      extra: (
        <div className="flex flex-col gap-8">
          <h3 className="text-12 font-semibold uppercase tracking-wider text-adm-muted">Core targets</h3>
          <TargetList c={c} />
          <h3 className="text-12 font-semibold uppercase tracking-wider text-adm-muted">What it covers</h3>
          <p className="text-13 text-adm-ink-2">{c.parts.join(' → ')}</p>
        </div>
      ),
    })
  const openLink = (l: CornerLink) =>
    open({ kicker: `${byId[l.from].title} → ${byId[l.to].title}`, title: l.title, summary: l.how })

  const [, setPageTab] = usePageTab()
  const summaryBlock = (
    <>
      <GoalLine goal="Shows how a person moves from a bad state to a good one, and how that ties to the product and the business." />

      <section className="flex flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16" data-summary>
        <p className="text-15 font-semibold text-adm-ink">
          A better check-in after each chapter is what keeps a person coming back, and coming back is what Plus is paid for.
        </p>
        <p className="text-13 text-adm-ink-2">
          For sleep, the business owner’s stage 1 scenario takes someone from 25 to 85 in {j.chapters} chapters at +{j.uplift.toFixed(2)} points each, with a {Math.round(j.flipProbability * 100)}% chance of getting there. Those are <Term id="assumption">assumptions</Term>; the product numbers are <Term id="simulated">simulated</Term>, and no real person’s result is measured yet.
        </p>
      </section>
    </>
  )

  return (
    <div className="flex flex-col gap-16">
      <PageHeader title="Therapeutic map" description="Product, business and wellness as one triangle, and the steps from a bad state to a good one." />
      {!RELEASES.adminNav2 && summaryBlock}
      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
            <PurposeLine purpose="the first picture of how a person moves from a bad state to a good one, and how that ties to the product and the business." />
            {summaryBlock}
            <p className="rounded-8 border border-adm-line bg-adm-surface px-12 py-8 text-13 text-adm-ink-2">
              This is the older version. The <Link to="/admin/healing-map" className="font-semibold text-adm-ink underline">Healing map</Link> is the newer one that learns from results; this page stays for its triangle and the five wellness worlds.
            </p>
            <button type="button" onClick={() => setPageTab('detail')} className="self-end text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2">
              See the triangle, the sleep steps and the five worlds in Detail
            </button>
          </div>
        }
      >

      <Panel title="The triangle" description="Each corner has its core targets. Tap a corner or a link for details.">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <svg viewBox="0 0 600 400" className="h-auto w-full" role="img" aria-label="Product, Business and Wellness triangle">
            {links.map((l, i) => {
              const a = CORNER_XY[l.from]
              const b = CORNER_XY[l.to]
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              return (
                <g
                  key={`${l.from}-${l.to}`}
                  role="button"
                  tabIndex={0}
                  aria-label={l.title}
                  data-corner-link={`${l.from}-${l.to}`}
                  className="cursor-pointer outline-none"
                  onClick={() => openLink(l)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLink(l)
                    }
                  }}
                >
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-transparent" strokeWidth={24} />
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-adm-axis" strokeWidth={2} />
                  <circle cx={mx} cy={my} r={14} className="fill-adm-surface stroke-adm-ink" strokeWidth={1.5} />
                  <text x={mx} y={my} dy="0.35em" textAnchor="middle" className="fill-adm-ink text-[13px] font-semibold">
                    {i + 1}
                  </text>
                </g>
              )
            })}
            {corners.map((c) => {
              const p = CORNER_XY[c.id]
              return (
                <g
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.title} corner`}
                  data-corner={c.id}
                  className="cursor-pointer outline-none"
                  onClick={() => openCorner(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openCorner(c)
                    }
                  }}
                >
                  <circle cx={p.x} cy={p.y} r={40} className={CORNER_FILL[c.id]} />
                  <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="fill-white text-[16px] font-semibold">
                    {c.title}
                  </text>
                </g>
              )
            })}
            <text x={300} y={235} textAnchor="middle" className="fill-adm-muted text-[13px]">
              uplift → coming back → Plus
            </text>
          </svg>
          <ul className="flex flex-col gap-8">
            {links.map((l, i) => (
              <li key={`${l.from}-${l.to}`}>
                <button type="button" onClick={() => openLink(l)} className="flex w-full flex-col gap-2 rounded-8 border border-adm-line p-10 text-left hover:bg-adm-hover">
                  <span className="flex items-center gap-6 text-11 font-semibold uppercase tracking-wider text-adm-muted">
                    {i + 1}. {byId[l.from].title} <ArrowRight size={12} aria-hidden="true" /> {byId[l.to].title}
                  </span>
                  <span className="text-13 font-semibold text-adm-ink">{l.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {corners.map((c) => (
            <div key={c.id} className="flex min-w-0 flex-col gap-8 rounded-12 border border-adm-line p-12" data-corner-card={c.id}>
              <button type="button" onClick={() => openCorner(c)} className="flex items-center gap-8 text-left text-14 font-semibold text-adm-ink hover:underline">
                <span className={`size-10 rounded-full ${CORNER_BG[c.id]}`} aria-hidden="true" />
                {c.title}
              </button>
              <p className="text-12 text-adm-muted">{c.about}</p>
              <TargetList c={c} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="From bad sleep to good sleep, step by step" description="How the app runs it today, with the number we watch at each step. Tap a step.">
        <ol className="grid gap-8 md:grid-cols-4 xl:grid-cols-7">
          {steps.map((s, i) => (
            <li key={s.id} className="min-w-0">
              <button
                type="button"
                data-step={s.id}
                onClick={() =>
                  open({
                    kicker: `Step ${i + 1} of ${steps.length}`,
                    title: s.title,
                    summary: s.inApp,
                    numbers: [{ label: s.metric, value: s.value }, { label: 'Kind of number', value: VALUE_KIND_TEXT[s.kind] }],
                  })
                }
                className="flex h-full w-full flex-col gap-4 rounded-8 border border-adm-line p-10 text-left hover:bg-adm-hover"
              >
                <span className="text-11 font-semibold text-adm-muted">Step {i + 1}</span>
                <span className="text-13 font-semibold text-adm-ink">{s.title}</span>
                <span className="text-11 text-adm-ink-2">{s.inApp}</span>
                <span className="mt-auto pt-4 text-12 font-semibold tabular-nums text-adm-ink">{s.value}</span>
                <span className="text-11 text-adm-muted">{s.metric}</span>
                <KindBadge kind={s.kind} />
              </button>
            </li>
          ))}
        </ol>
        <p className="text-12 text-adm-muted">After the check-in, the next chapter starts again at step 2 until the score reaches 85. The cost model behind these numbers is in Reports → Cost report.</p>
      </Panel>

      <Panel title="Five wellness worlds" description="The business owner’s scenario from the spec: stage 1 (today) → stage 3 (after 100,000+ sessions). Not measured.">
        <div className="flex flex-wrap gap-6" role="tablist" aria-label="Wellness world">
          {WORLDS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={x.id === world}
              data-world-tab={x.id}
              onClick={() => setWorld(x.id)}
              className={`rounded-full border px-12 py-4 text-12 font-medium ${x.id === world ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink-2 hover:bg-adm-hover'}`}
            >
              {x.title}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-world-card={w.id}
          onClick={() =>
            open({
              kicker: 'The business owner’s scenario',
              title: `${w.title}: ${w.bad} → ${w.good}`,
              summary: 'Figures from the spec PDF, §5. They are design assumptions, not results; the only measured costs are the 2025 test sessions.',
              labels: ['scenario'],
              numbers: [
                { label: 'Chapters to flip', value: `${w.chapters[0]} → ${w.chapters[1]}` },
                { label: 'Cost per flip', value: `$${w.costPerFlip[0].toFixed(2)} → $${w.costPerFlip[1].toFixed(2)}` },
                { label: 'Flip chance', value: `${Math.round(w.success[0] * 1000) / 10}% → ${Math.round(w.success[1] * 1000) / 10}%` },
              ],
            })
          }
          className="flex flex-col gap-8 rounded-12 border border-adm-line p-12 text-left hover:bg-adm-hover"
        >
          <span className="flex flex-wrap items-center gap-8 text-14 font-semibold text-adm-ink">
            {w.bad} <ArrowRight size={14} aria-hidden="true" /> {w.good}
            <Badge tone="critical">The business owner’s scenario</Badge>
          </span>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              ['Chapters to flip', `${w.chapters[0]} → ${w.chapters[1]}`],
              ['Cost per flip', `$${w.costPerFlip[0].toFixed(2)} → $${w.costPerFlip[1].toFixed(2)}`],
              ['Flip chance', `${Math.round(w.success[0] * 1000) / 10}% → ${Math.round(w.success[1] * 1000) / 10}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2 rounded-8 bg-adm-bg p-10">
                <dt className="text-11 text-adm-muted">{k}</dt>
                <dd className="text-14 font-semibold tabular-nums text-adm-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </button>
      </Panel>

      <Details title="What the words mean here" hint="flip, uplift, chapter">
        <ul className="flex list-disc flex-col gap-4 pl-18 text-13 text-adm-ink-2">
          <li><strong>Flip</strong>: one person going from a bad state (25 out of 100 on their own check-in) to a good one (85).</li>
          <li><strong>Uplift per chapter</strong>: how many points the check-in after a chapter rises over the one before.</li>
          <li><strong>Chapter</strong>: one AI-made audio session in a person’s journey.</li>
          <li>“Therapeutic” is only the internal name of this metric line. What the product says to people stays wellness: no claim that anything treats a condition.</li>
        </ul>
      </Details>
      </PageTabs>
    </div>
  )
}
