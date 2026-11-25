import type { KeyboardEvent, ReactNode } from 'react'
import { Badge, type Tone } from '../../components/ui'
import {
  DROP_LABEL_TEXT,
  EFFORT_TEXT,
  FEATURES,
  PHASES,
  WIKI_ROUND_2,
  beforeAfter,
  bigPicture,
  endpointsOf,
  journeys,
  shortTitle,
  wrapWords,
  type DiagramBox,
  type DropLabel,
  type Priority,
} from '../../data/b2b2cReport'
import { useDetail, type DetailItem } from './DetailDrawer'
import { Term } from './Term'

/*
 * Admin → Reports → B2B2C report → How it works (U133, J184): four
 * hand-laid SVG diagrams that carry the idea before the numbers do. The big
 * picture, a journey per channel, before vs after, and the phases. Every box
 * opens the drawer with a plain explanation and the features and API v2
 * endpoints behind it. Labels and numbers come from data/b2b2cReport.ts.
 * Each diagram keeps its own width and scrolls inside its box below lg,
 * so the page itself never scrolls sideways at 402px.
 */

const PRIORITY_TONE: Record<Priority, Tone> = { Now: 'critical', Next: 'serious', Later: 'neutral' }
const PRIORITY_FILL: Record<Priority, string> = { Now: 'fill-adm-critical', Next: 'fill-adm-serious', Later: 'fill-adm-axis' }
const DROP_TONE: Record<DropLabel, string> = { test: 'fill-adm-s2', measured: 'fill-adm-good', judgement: 'fill-adm-serious', 'not tested': 'fill-adm-axis' }

function FeatureList({ ids }: { ids: string[] }) {
  const features = ids.map((id) => FEATURES.find((f) => f.id === id)).filter((f) => f !== undefined)
  const endpoints = endpointsOf(ids)
  if (!features.length) return null
  return (
    <div className="flex flex-col gap-10 border-t border-adm-line pt-10">
      <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">Features involved</span>
      <ul className="flex flex-col gap-6">
        {features.map((f) => (
          <li key={f.id} className="flex flex-col gap-2 text-12">
            <span className="font-medium text-adm-ink">{f.title}</span>
            <span className="flex flex-wrap gap-4">
              <Badge tone={PRIORITY_TONE[f.priority]}>{f.priority}</Badge>
              <Badge tone="neutral">{EFFORT_TEXT[f.effort]}</Badge>
            </span>
          </li>
        ))}
      </ul>
      <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">API v2 endpoints</span>
      {endpoints.length ? (
        <ul className="flex flex-col gap-2">
          {endpoints.map((e) => (
            <li key={e} className="break-words font-mono text-11 text-adm-ink-2">{e}</li>
          ))}
        </ul>
      ) : (
        <p className="text-12 text-adm-muted">None yet: frontend only, or a new endpoint the backend still has to add.</p>
      )}
    </div>
  )
}

function boxItem(kicker: string, b: { title: string; explain: string; features: string[] }, numbers?: DetailItem['numbers']): DetailItem {
  return { kicker, title: b.title, summary: b.explain, numbers, extra: <FeatureList ids={b.features} />, to: WIKI_ROUND_2, toLabel: 'Round 2 on the wiki' }
}

/** A clickable group in a diagram: Enter or Space opens it like a click. */
function Hit({ label, onOpen, children, id }: { label: string; onOpen: () => void; children: ReactNode; id: string }) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }
  return (
    <g
      tabIndex={0}
      role="button"
      data-how={id}
      aria-label={`${label}. Show details`}
      className="cursor-pointer outline-none [&:focus-visible>rect:first-of-type]:stroke-adm-accent [&:focus-visible>rect:first-of-type]:stroke-2 [&:hover>rect:first-of-type]:stroke-adm-ink-2"
      onClick={onOpen}
      onKeyDown={onKey}
    >
      <title>{label}</title>
      {children}
    </g>
  )
}

function Lines({ x, y, lines, step, className }: { x: number; y: number; lines: string[]; step: number; className: string }) {
  return (
    <text x={x} y={y} className={className}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : step}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

/** The scroll box every diagram sits in: its own width below lg, fitted to the column above it. */
function Frame({ w, h, label, children, name }: { w: number; h: number; label: string; children: ReactNode; name: string }) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-8 border border-adm-line bg-adm-bg" data-how-diagram={name}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="group" aria-label={label} className="block h-auto max-w-none lg:max-w-full">
        <defs>
          <marker id={`${name}-ink`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-adm-ink-2" />
          </marker>
          <marker id={`${name}-good`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-adm-good" />
          </marker>
          <marker id={`${name}-trust`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-adm-s2" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  )
}

function Legend({ items }: { items: { swatch: string; text: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-12 text-11 text-adm-muted" aria-hidden="true">
      {items.map((i) => (
        <span key={i.text} className="inline-flex items-center gap-4">
          <span className={`h-[3px] w-16 rounded-2 ${i.swatch}`} /> {i.text}
        </span>
      ))}
    </div>
  )
}

function DiagramTitle({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-14 font-semibold text-adm-ink">
        <span className="mr-6 tabular-nums text-adm-muted">{n}.</span>
        {title}
      </h3>
      {children && <p className="text-12 text-adm-ink-2">{children}</p>}
    </div>
  )
}

/* ------------------------------------------------------------ 1. The big picture */

function BigPicture() {
  const open = useDetail()
  const b = bigPicture()
  const W = 1110
  const H = 470
  const P = { x: 16, w: 196, h: 78, ys: [60, 180, 300] }
  const A = { x: 310, y: 150, w: 200, h: 136 }
  const PE = { x: 650, y: 160, w: 190, h: 116 }
  const PD = { x: 936, y: 178, w: 158, h: 80 }
  const cy = 218
  const reach = ['followers', 'staff, seat fees', 'customers, codes']
  const box = (d: DiagramBox, x: number, y: number, w: number, h: number, kicker: string, strong = false) => (
    <Hit key={d.id} id={d.id} label={`${d.title}: ${d.sub}`} onOpen={() => open(boxItem(kicker, d))}>
      <rect x={x} y={y} width={w} height={h} rx={10} strokeWidth={strong ? 2 : 1} className={`fill-adm-surface ${strong ? 'stroke-adm-ink' : 'stroke-adm-line'}`} />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" className={`fill-adm-ink font-semibold ${strong ? 'text-16' : 'text-13'}`}>
        {d.title}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="fill-adm-muted text-11">
        {d.sub}
      </text>
    </Hit>
  )
  const pill = (d: DiagramBox, x: number, y: number, w: number, tone: 'good' | 'trust') => (
    <Hit id={d.id} label={`${d.title}: ${d.sub}`} onOpen={() => open(boxItem('How it works', d))}>
      <rect x={x} y={y} width={w} height={52} rx={26} strokeWidth={1.5} className={`fill-adm-surface ${tone === 'good' ? 'stroke-adm-good' : 'stroke-adm-s2'}`} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" className={`font-semibold text-12 ${tone === 'good' ? 'fill-adm-good' : 'fill-adm-s2'}`}>
        {d.title}
      </text>
      <text x={x + w / 2} y={y + 38} textAnchor="middle" className="fill-adm-ink-2 text-11">
        {d.sub}
      </text>
    </Hit>
  )
  return (
    <Frame w={W} h={H} name="how-big" label="The big picture: creators, employers and partners bring people to Aurelia; people start free, then pay; money flows back to Aurelia and the creator.">
      <text x={P.x} y={44} className="fill-adm-muted text-11 font-semibold uppercase">They have the people</text>
      <text x={A.x + A.w / 2} y={A.y - 12} textAnchor="middle" className="fill-adm-muted text-11 font-semibold uppercase">What we add</text>
      <text x={PE.x + PE.w / 2} y={PE.y - 12} textAnchor="middle" className="fill-adm-muted text-11 font-semibold uppercase">Who it helps</text>
      {/* Reach: each partner to Aurelia. */}
      {P.ys.map((y, i) => {
        const y1 = y + P.h / 2
        const y2 = A.y + 30 + i * 38
        return (
          <g key={i}>
            <path d={`M ${P.x + P.w} ${y1} C ${P.x + P.w + 50} ${y1}, ${A.x - 50} ${y2}, ${A.x - 2} ${y2}`} fill="none" strokeWidth={1.5} className="stroke-adm-ink-2" markerEnd="url(#how-big-ink)" />
            <text x={P.x + P.w + 6} y={y1 - 6} className="fill-adm-ink-2 text-10">{reach[i]}</text>
          </g>
        )
      })}
      {/* Aurelia to people, and people to the paid plan. */}
      <path d={`M ${A.x + A.w} ${cy} L ${PE.x - 2} ${cy}`} strokeWidth={2} className="stroke-adm-s2" markerEnd="url(#how-big-trust)" />
      <text x={(A.x + A.w + PE.x) / 2} y={cy + 18} textAnchor="middle" className="fill-adm-ink-2 text-10">starts free</text>
      <path d={`M ${PE.x + PE.w} ${cy} L ${PD.x - 2} ${cy}`} strokeWidth={2} className="stroke-adm-ink-2" markerEnd="url(#how-big-ink)" />
      <text x={(PE.x + PE.w + PD.x) / 2} y={cy - 8} textAnchor="middle" className="fill-adm-ink-2 text-10">once it helped</text>
      {/* Trust: what Aurelia gives the person before they pay. */}
      <path d={`M ${(A.x + A.w + PE.x) / 2} ${118} L ${(A.x + A.w + PE.x) / 2} ${cy - 4}`} strokeWidth={1.5} strokeDasharray="3 3" className="stroke-adm-s2" />
      {/* Money: the person pays Aurelia; Aurelia pays the creator. */}
      <path d={`M ${PD.x + PD.w / 2} ${PD.y + PD.h} C ${PD.x + PD.w / 2} ${H - 30}, ${A.x + A.w / 2} ${H - 30}, ${A.x + A.w / 2} ${A.y + A.h + 2}`} fill="none" strokeWidth={2} strokeDasharray="6 4" className="stroke-adm-good" markerEnd="url(#how-big-good)" />
      <path d={`M ${A.x + 40} ${A.y} C ${A.x + 40} ${20}, ${P.x + P.w - 24} ${14}, ${P.x + P.w - 24} ${P.ys[0] - 2}`} fill="none" strokeWidth={2} strokeDasharray="6 4" className="stroke-adm-good" markerEnd="url(#how-big-good)" />
      <text x={A.x + 54} y={30} className="fill-adm-good text-11 font-semibold">70% of the ticket to the creator, plus a share of paid plans</text>
      {b.partners.map((d, i) => box(d, P.x, P.ys[i], P.w, P.h, 'They already have the people'))}
      {box(b.aurelia, A.x, A.y, A.w, A.h, 'What we add', true)}
      {box(b.people, PE.x, PE.y, PE.w, PE.h, 'Who it helps')}
      {box(b.paid, PD.x, PD.y, PD.w, PD.h, 'Where it ends')}
      {pill(b.trust, A.x + A.w + 4, 66, PE.x - A.x - A.w - 8, 'trust')}
      {pill(b.money, 600, H - 100, 230, 'good')}
      <text x={600 + 115} y={H - 36} textAnchor="middle" className="fill-adm-ink-2 text-10">on a creator’s journey: 70% creator, 30% Aurelia</text>
    </Frame>
  )
}

/* ------------------------------------------------------------ 2. Journeys */

const SW = 128
const SG = 24

function JourneyStrip({ j }: { j: ReturnType<typeof journeys>[number] }) {
  const open = useDetail()
  const W = 16 * 2 + j.steps.length * SW + (j.steps.length - 1) * SG
  const BY = 10
  const BH = 156
  const DY = BY + BH + 22
  const H = DY + 96
  return (
    <Frame w={W} h={H} name={`how-j-${j.id}`} label={`${j.title}: ${j.steps.map((s) => s.title).join(', then ')}.`}>
      {j.steps.map((s, i) => {
        const x = 16 + i * (SW + SG)
        const title = wrapWords(s.title, 16).slice(0, 2)
        const sees = wrapWords(s.sees, 20).slice(0, 5)
        const drop = s.drop ? wrapWords(s.drop.text, 20).slice(0, 4) : []
        return (
          <g key={s.id}>
            {i < j.steps.length - 1 && <path d={`M ${x + SW + 2} ${BY + 26} L ${x + SW + SG - 3} ${BY + 26}`} strokeWidth={1.5} className="stroke-adm-ink-2" markerEnd={`url(#how-j-${j.id}-ink)`} />}
            <Hit id={s.id} label={`Step ${i + 1}, ${s.title}: ${s.sees}`} onOpen={() => open(boxItem(`${j.title} · step ${i + 1}`, s, s.drop ? [{ label: `Drop-off (${DROP_LABEL_TEXT[s.drop.label].toLowerCase()})`, value: s.drop.text }] : undefined))}>
              <rect x={x} y={BY} width={SW} height={BH} rx={10} className="fill-adm-surface stroke-adm-line" />
              <circle cx={x + 16} cy={BY + 20} r={9} className="fill-adm-ink" />
              <text x={x + 16} y={BY + 24} textAnchor="middle" className="fill-adm-surface text-10 font-semibold">{i + 1}</text>
              <Lines x={x + 30} y={BY + 24} lines={title} step={15} className="fill-adm-ink text-12 font-semibold" />
              <text x={x + 10} y={BY + 66} className="fill-adm-muted text-10 font-semibold uppercase">They see</text>
              <Lines x={x + 10} y={BY + 82} lines={sees} step={14} className="fill-adm-ink-2 text-11" />
            </Hit>
            {s.drop && (
              <Hit id={`${s.id}-drop`} label={`Drop-off at ${s.title}: ${s.drop.text} (${DROP_LABEL_TEXT[s.drop.label]})`} onOpen={() => open(boxItem(`${j.title} · where people drop off`, s, [{ label: `Drop-off (${DROP_LABEL_TEXT[s.drop!.label].toLowerCase()})`, value: s.drop!.text }]))}>
                <rect x={x} y={DY} width={SW} height={90} rx={8} strokeDasharray="4 3" className="fill-adm-surface stroke-adm-critical" />
                <path d={`M ${x + SW / 2} ${BY + BH + 2} L ${x + SW / 2} ${DY - 3}`} strokeWidth={1.25} strokeDasharray="3 3" className="stroke-adm-critical" />
                <circle cx={x + 14} cy={DY + 14} r={4} className={DROP_TONE[s.drop.label]} />
                <text x={x + 24} y={DY + 18} className="fill-adm-muted text-10 font-semibold">{DROP_LABEL_TEXT[s.drop.label]}</text>
                <Lines x={x + 10} y={DY + 36} lines={drop} step={14} className="fill-adm-ink text-11" />
              </Hit>
            )}
          </g>
        )
      })}
    </Frame>
  )
}

/* ------------------------------------------------------------ 3. Before vs after */

function BeforeAfter() {
  const open = useDetail()
  const { before, after } = beforeAfter()
  const W = 1000
  const H = 236
  const side = (s: typeof before, x: number, good: boolean) => (
    <Hit id={s.id} label={`${s.title}: ${s.rows.map((r) => `${r.value} ${r.label}`).join('; ')}`} onOpen={() => open(boxItem(good ? 'Round 2, the new plan' : 'Round 1, what the tests rejected', s))}>
      <rect x={x} y={12} width={440} height={H - 24} rx={12} strokeWidth={good ? 2 : 1} className={`fill-adm-surface ${good ? 'stroke-adm-good' : 'stroke-adm-line'}`} />
      <text x={x + 20} y={44} className={`text-16 font-semibold ${good ? 'fill-adm-ink' : 'fill-adm-ink-2'}`}>{s.title}</text>
      <text x={x + 20} y={64} className="fill-adm-muted text-12">{s.sub}</text>
      {s.rows.map((r, i) => (
        <g key={r.label}>
          <text x={x + 92} y={110 + i * 42} textAnchor="end" className={`text-24 font-semibold tabular-nums ${good ? 'fill-adm-good' : 'fill-adm-critical'}`}>{r.value}</text>
          <text x={x + 104} y={110 + i * 42} className="fill-adm-ink-2 text-12">{r.label}</text>
        </g>
      ))}
    </Hit>
  )
  return (
    <Frame w={W} h={H} name="how-ba" label={`Before: ${before.title}. After: ${after.title}.`}>
      {side(before, 16, false)}
      <path d={`M ${464} ${H / 2} L ${536} ${H / 2}`} strokeWidth={2} className="stroke-adm-ink-2" markerEnd="url(#how-ba-ink)" />
      <text x={500} y={H / 2 - 10} textAnchor="middle" className="fill-adm-muted text-10 font-semibold uppercase">round 2</text>
      {side(after, 544, true)}
    </Frame>
  )
}

/* ------------------------------------------------------------ 4. Phases */

function Phases() {
  const open = useDetail()
  const CW = 200
  const CG = 26
  const W = 16 * 2 + PHASES.length * CW + (PHASES.length - 1) * CG
  const TOP = 64
  const cols = PHASES.map((p) => {
    const name = wrapWords(p.name, 24)
    let y = TOP + 22 + (name.length - 1) * 16 + 24
    const feats = p.build.map((id) => {
      const f = FEATURES.find((x) => x.id === id)!
      const lines = wrapWords(shortTitle(id), 28)
      const at = y
      y += lines.length * 14 + 6
      return { id, lines, at, priority: f.priority }
    })
    const gate = wrapWords(p.gate, 30)
    const gateY = y + 8
    const end = gateY + 14 + gate.length * 14 + 12
    return { p, name, feats, gate, gateY, end }
  })
  const H = Math.max(...cols.map((c) => c.end)) + 14
  return (
    <Frame w={W} h={H} name="how-ph" label={`The phases: ${PHASES.map((p) => p.name).join(', then ')}.`}>
      <path d={`M ${16} ${30} L ${W - 16} ${30}`} strokeWidth={2} className="stroke-adm-axis" markerEnd="url(#how-ph-ink)" />
      {cols.map((c, i) => {
        const x = 16 + i * (CW + CG)
        return (
          <g key={c.p.id}>
            <circle cx={x + 10} cy={30} r={6} className={i === 0 ? 'fill-adm-accent' : 'fill-adm-surface stroke-adm-ink-2'} strokeWidth={1.5} />
            <text x={x + 22} y={22} className={`text-11 font-semibold ${i === 0 ? 'fill-adm-ink' : 'fill-adm-muted'}`}>{c.p.when}</text>
            <Hit id={c.p.id} label={`${c.p.name}, ${c.p.when}. ${c.p.gate}`} onOpen={() => open({ ...boxItem('The phased plan', { title: c.p.name, explain: c.p.gate, features: c.p.build }, [{ label: 'When', value: c.p.when }]), to: '#b2b2c-plan', toLabel: 'The phased plan' })}>
              <rect x={x} y={TOP} width={CW} height={c.end - TOP} rx={10} strokeWidth={i === 0 ? 2 : 1} className={`fill-adm-surface ${i === 0 ? 'stroke-adm-accent' : 'stroke-adm-line'}`} />
              <Lines x={x + 12} y={TOP + 22} lines={c.name} step={16} className="fill-adm-ink text-13 font-semibold" />
              {c.feats.map((f) => (
                <g key={f.id}>
                  <circle cx={x + 16} cy={f.at - 4} r={3.5} className={PRIORITY_FILL[f.priority]} />
                  <Lines x={x + 26} y={f.at} lines={f.lines} step={14} className="fill-adm-ink-2 text-11" />
                </g>
              ))}
              <rect x={x + 8} y={c.gateY} width={CW - 16} height={c.end - c.gateY - 8} rx={6} strokeDasharray="4 3" className="fill-adm-bg stroke-adm-ink-2" />
              <Lines x={x + 16} y={c.gateY + 18} lines={c.gate} step={14} className="fill-adm-ink text-11 font-medium" />
            </Hit>
            {i < cols.length - 1 && <path d={`M ${x + CW + 2} ${TOP + 22} L ${x + CW + CG - 3} ${TOP + 22}`} strokeWidth={1.5} className="stroke-adm-ink-2" markerEnd="url(#how-ph-ink)" />}
          </g>
        )
      })}
    </Frame>
  )
}

/* ------------------------------------------------------------ The section */

export function B2b2cHowItWorks() {
  const js = journeys()
  return (
    <div className="flex min-w-0 flex-col gap-24">
      <div className="flex min-w-0 flex-col gap-10">
        <DiagramTitle n={1} title="The big picture">
          Creators, employers and partners already have the people. Aurelia gives those people a free start they can trust; they pay once it has helped, and the money is shared with the creator.
        </DiagramTitle>
        <Legend items={[{ swatch: 'bg-adm-ink-2', text: 'People and reach' }, { swatch: 'bg-adm-s2', text: 'Trust: what people get before paying' }, { swatch: 'bg-adm-good', text: 'Money' }]} />
        <BigPicture />
      </div>

      <div className="flex min-w-0 flex-col gap-10">
        <DiagramTitle n={2} title="One journey per channel">
          What the person sees at each step, and where people drop off. Numbers marked “From a test” come from <Term id="simulated">simulated people</Term>, not real buyers.
        </DiagramTitle>
        <div className="flex flex-wrap items-center gap-12 text-11 text-adm-muted" aria-hidden="true">
          {(['test', 'measured', 'judgement', 'not tested'] as DropLabel[]).map((l) => (
            <span key={l} className="inline-flex items-center gap-4">
              <svg width="8" height="8" className="shrink-0"><circle cx="4" cy="4" r="4" className={DROP_TONE[l]} /></svg> {DROP_LABEL_TEXT[l]}
            </span>
          ))}
        </div>
        {js.map((j) => (
          <div key={j.id} className="flex min-w-0 flex-col gap-6">
            <span className="text-13 font-semibold text-adm-ink">{j.title}</span>
            <JourneyStrip j={j} />
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-10">
        <DiagramTitle n={3} title="Before and after">
          Round 1 asked people to pay before anything had helped; the tests with <Term id="simulated">simulated people</Term> rejected it. Round 2 starts free. The free week itself is not tested yet: the free app is the nearest thing that was.
        </DiagramTitle>
        <BeforeAfter />
      </div>

      <div className="flex min-w-0 flex-col gap-10">
        <DiagramTitle n={4} title="The phases">Each phase builds its features, then must pass its gate before the next one starts.</DiagramTitle>
        <Legend items={[{ swatch: 'bg-adm-critical', text: 'Now' }, { swatch: 'bg-adm-serious', text: 'Next' }, { swatch: 'bg-adm-axis', text: 'Later' }]} />
        <Phases />
      </div>
    </div>
  )
}
