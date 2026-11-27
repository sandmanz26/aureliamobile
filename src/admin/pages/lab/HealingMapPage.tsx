import { ExternalLink, Minus, Plus } from 'lucide-react'
import { PageTabs, PurposeLine } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { RELEASES } from '../../../versions/releases'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import {
  LINKS, MIN_PEOPLE_FOR_LEARNED, NODES, PROVENANCE_MEANING, PROVENANCE_TEXT, RING_LABEL, WORLDS,
  linkCounts, linkKey, node, nodeCounts, pathsThrough, strengthText, visibleLinks,
  type HealingLink, type HealingNode, type MapFilter, type Provenance, type Ring, type WorldId,
} from '../../data/healingMap'
import { DetailDrawerProvider, useDetail } from '../reports/DetailDrawer'
import { Details, GoalLine } from '../reports/ReportSummary'
import { Term } from '../reports/Term'

/*
 * Admin → Product lab → Healing Map (U131, J183). Rings like Insight Timer's
 * Map of Healing, but ours: bad states inside, the app's building blocks in
 * the middle, good states outside. Every link says where its strength comes
 * from. All data lives in data/healingMap.ts.
 */

const WORLD_FILL: Record<WorldId, string> = { sleep: 'fill-adm-s1', mental: 'fill-adm-s2', emotional: 'fill-adm-s3', relational: 'fill-adm-s4', spiritual: 'fill-adm-accent' }
const WORLD_BG: Record<WorldId, string> = { sleep: 'bg-adm-s1', mental: 'bg-adm-s2', emotional: 'bg-adm-s3', relational: 'bg-adm-s4', spiritual: 'bg-adm-accent' }
const PROV_TONE: Record<Provenance, Tone> = { sample: 'neutral', research: 'good', learned: 'info' }
const RADIUS: Record<Ring, number> = { bad: 120, block: 235, good: 335 }
const RINGS: Ring[] = ['bad', 'block', 'good']

interface Pos {
  x: number
  y: number
  angle: number
}

/** Each world gets a fifth of the circle; its nodes spread evenly inside it on every ring. */
function layout(): Record<string, Pos> {
  const out: Record<string, Pos> = {}
  const sector = (Math.PI * 2) / WORLDS.length
  WORLDS.forEach((w, i) => {
    for (const ring of RINGS) {
      const own = NODES.filter((n) => n.world === w.id && n.ring === ring)
      own.forEach((n, k) => {
        const angle = -Math.PI / 2 + i * sector + ((k + 0.5) * sector) / own.length
        out[n.id] = { x: Math.cos(angle) * RADIUS[ring], y: Math.sin(angle) * RADIUS[ring], angle }
      })
    }
  })
  return out
}
const POS = layout()

function linkPath(l: HealingLink) {
  const a = POS[l.from]
  const b = POS[l.to]
  const ra = Math.hypot(a.x, a.y)
  const rb = Math.hypot(b.x, b.y)
  const mid = (ra + rb) / 2
  const c1 = { x: Math.cos(a.angle) * mid, y: Math.sin(a.angle) * mid }
  const c2 = { x: Math.cos(b.angle) * mid, y: Math.sin(b.angle) * mid }
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`
}

export function HealingMapPage() {
  return (
    <DetailDrawerProvider>
      <HealingMap />
    </DetailDrawerProvider>
  )
}

function ProvBadge({ p }: { p: Provenance }) {
  return <Badge tone={PROV_TONE[p]}>{PROVENANCE_TEXT[p]}</Badge>
}

function NodeLinks({ n, links }: { n: HealingNode; links: HealingLink[] }) {
  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-12 font-semibold uppercase tracking-wider text-adm-muted">Links ({links.length})</h3>
      <ul className="flex flex-col gap-8">
        {links.map((l) => {
          const other = node(l.from === n.id ? l.to : l.from)
          return (
            <li key={linkKey(l)} className="flex flex-col gap-4 rounded-8 border border-adm-line p-10" data-link-provenance={l.provenance}>
              <p className="text-13 font-semibold text-adm-ink">
                {l.from === n.id ? '→ ' : '← '}
                {other?.label}
                <span className="font-normal text-adm-muted"> · {other ? RING_LABEL[other.ring].toLowerCase() : ''}</span>
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <ProvBadge p={l.provenance} />
                <span className="text-12 text-adm-ink-2">{strengthText(l)}</span>
              </div>
              {l.citation && (
                <a href={l.citation.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-4 text-11 text-adm-muted underline decoration-adm-axis underline-offset-2 hover:text-adm-ink">
                  <span>{l.citation.text}</span>
                  <ExternalLink size={10} aria-hidden="true" className="mt-2 shrink-0" />
                </a>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-11 text-adm-muted">
        A link means “often followed by”, never “causes” or “cures”. No link is learned from users yet: the map learns once real check-in results exist, and a learned link shows only with at least {MIN_PEOPLE_FOR_LEARNED} people behind it.
      </p>
    </div>
  )
}

function HealingMap() {
  const open = useDetail()
  const [filter, setFilter] = useState<MapFilter>({ world: 'all', researchOnly: false })
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const links = visibleLinks(filter)
  const active = new Set(links.flatMap((l) => [l.from, l.to]))
  const path = selected ? pathsThrough(selected, links) : []
  const pathKeys = new Set(path.map(linkKey))
  const pathNodes = new Set(path.flatMap((l) => [l.from, l.to]))
  const nc = nodeCounts()
  const lc = linkCounts()

  function choose(n: HealingNode) {
    setSelected(n.id)
    const own = LINKS.filter((l) => l.from === n.id || l.to === n.id)
    const world = WORLDS.find((w) => w.id === n.world)
    open({
      kicker: `${RING_LABEL[n.ring]} · ${world?.label ?? ''}`,
      title: n.label,
      summary: n.about,
      numbers: [
        { label: 'Links', value: String(own.length) },
        { label: 'Research-backed', value: String(own.filter((l) => l.provenance === 'research').length) },
        ...(n.inApp ? [{ label: 'In the app', value: n.inApp }] : []),
        { label: 'Learned from users', value: 'None yet' },
      ],
      extra: <NodeLinks n={n} links={own} />,
    })
  }

  const chip = (on: boolean) =>
    `inline-flex items-center gap-6 rounded-full border px-10 py-4 text-12 font-medium ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line bg-adm-surface text-adm-ink-2 hover:bg-adm-hover'}`

  const [, setPageTab] = usePageTab()
  const summaryBlock = (
    <>
      <GoalLine goal="Shows which building blocks help which bad state, and how sure we are." />

      <section className="flex flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16" data-summary>
        <p className="text-15 font-semibold text-adm-ink">
          {nc.bad} bad states · {nc.block} building blocks · {nc.good} good states · {LINKS.length} links
        </p>
        <p className="text-13 text-adm-ink-2">
          Like Insight Timer’s Map of Healing, but ours is meant to learn from results: how often a building block was followed by a better check-in. There are no real results yet, so {lc.sample ?? 0} links are a{' '}
          <Term id="sample">design sample</Term>, {lc.research ?? 0} are backed by a cited published review, and {lc.learned ?? 0} are learned from users.
        </p>
        <div className="flex flex-wrap gap-6">
          {(['sample', 'research', 'learned'] as Provenance[]).map((p) => (
            <span key={p} title={PROVENANCE_MEANING[p]}>
              <ProvBadge p={p} /> <span className="text-12 tabular-nums text-adm-muted">{lc[p] ?? 0}</span>
            </span>
          ))}
        </div>
      </section>
    </>
  )

  return (
    <div className="flex flex-col gap-16">
      <PageHeader title="Healing Map" description="Which building blocks of a session tend to help which bad state, and where each link comes from." />
      {!RELEASES.adminNav2 && summaryBlock}
      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
            <PurposeLine purpose="seeing which building blocks of a session tend to help which bad state, and how sure we are of each link." />
            {summaryBlock}
            <p className="rounded-8 border border-adm-line bg-adm-surface px-12 py-8 text-13 text-adm-ink-2">
              Next step: replace the design-sample links with cited research or learned results. The <Link to="/admin/therapeutic-map" className="font-semibold text-adm-ink underline">Therapeutic map</Link> is the older version of this idea.
            </p>
            <button type="button" onClick={() => setPageTab('detail')} className="self-end text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2">
              Open the full map and how it will learn in Detail
            </button>
          </div>
        }
      >

      <Panel title="The map" description="Tap a state or a building block to see its paths and where each link comes from.">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-6" role="group" aria-label="Filter by wellness world">
            <button type="button" className={chip(filter.world === 'all')} aria-pressed={filter.world === 'all'} onClick={() => setFilter({ ...filter, world: 'all' })}>
              All worlds
            </button>
            {WORLDS.map((w) => (
              <button key={w.id} type="button" data-world={w.id} className={chip(filter.world === w.id)} aria-pressed={filter.world === w.id} onClick={() => setFilter({ ...filter, world: w.id })}>
                <span className={`size-8 rounded-full ${WORLD_BG[w.id]}`} aria-hidden="true" />
                {w.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <label className="inline-flex items-center gap-8 text-13 text-adm-ink">
              <input type="checkbox" data-research-only checked={filter.researchOnly} onChange={(e) => setFilter({ ...filter, researchOnly: e.target.checked })} />
              Show only research-backed links
            </label>
            <div className="flex items-center gap-4" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.5))} className="rounded-8 border border-adm-line p-6 text-adm-ink hover:bg-adm-hover disabled:opacity-40">
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="w-40 text-center text-12 tabular-nums text-adm-muted">{Math.round(zoom * 100)}%</span>
              <button type="button" aria-label="Zoom in" disabled={zoom >= 2.5} onClick={() => setZoom(Math.min(2.5, zoom + 0.5))} className="rounded-8 border border-adm-line p-6 text-adm-ink hover:bg-adm-hover disabled:opacity-40">
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[80vh] w-full overflow-auto rounded-12 border border-adm-line bg-adm-bg" data-map-scroll>
            <svg
              viewBox="-470 -420 940 840"
              style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? 820 : undefined }}
              className="mx-auto block h-auto max-w-none"
              role="img"
              aria-label="Healing Map: bad states inside, building blocks in the middle, good states outside"
            >
              {RINGS.map((ring) => (
                <circle key={ring} r={RADIUS[ring]} className="fill-none stroke-adm-line" strokeDasharray="2 6" />
              ))}
              <text x={0} y={-6} textAnchor="middle" className="fill-adm-muted text-[12px] font-semibold">
                Inside: bad states
              </text>
              <text x={0} y={10} textAnchor="middle" className="fill-adm-muted text-[11px]">
                middle: building blocks
              </text>
              <text x={0} y={25} textAnchor="middle" className="fill-adm-muted text-[11px]">
                outside: good states
              </text>
              <g>
                {links.map((l) => {
                  const on = !selected || pathKeys.has(linkKey(l))
                  const w = l.provenance === 'research' ? 2.5 : 0.8 + (l.strength ?? 0) * 2.5
                  return (
                    <path
                      key={linkKey(l)}
                      d={linkPath(l)}
                      data-link={linkKey(l)}
                      className={`fill-none ${l.provenance === 'research' ? 'stroke-adm-good' : 'stroke-adm-axis'} transition-opacity`}
                      strokeWidth={selected && on ? w + 1 : w}
                      strokeDasharray={l.provenance === 'sample' ? '5 4' : undefined}
                      opacity={on ? 0.9 : 0.08}
                    />
                  )
                })}
              </g>
              {NODES.map((n) => {
                const p = POS[n.id]
                const visible = active.has(n.id)
                const lit = selected ? pathNodes.has(n.id) : visible
                const right = Math.cos(p.angle) >= 0
                const lx = p.x + Math.cos(p.angle) * 14
                const ly = p.y + Math.sin(p.angle) * 14
                const isSel = selected === n.id
                return (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={visible ? 0 : -1}
                    aria-label={`${n.label}, ${RING_LABEL[n.ring].toLowerCase()}`}
                    aria-pressed={isSel}
                    data-node={n.id}
                    className="cursor-pointer outline-none"
                    opacity={lit ? 1 : 0.2}
                    onClick={() => choose(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        choose(n)
                      }
                    }}
                  >
                    <circle cx={p.x} cy={p.y} r={18} className="fill-transparent" />
                    <circle cx={p.x} cy={p.y} r={n.ring === 'block' ? 7 : 9} className={`${WORLD_FILL[n.world]} ${isSel ? 'stroke-adm-ink' : 'stroke-adm-surface'}`} strokeWidth={isSel ? 3 : 2} />
                    <text
                      x={lx}
                      y={ly}
                      dy="0.35em"
                      textAnchor={Math.abs(Math.cos(p.angle)) < 0.2 ? 'middle' : right ? 'start' : 'end'}
                      className={`fill-adm-ink text-[13px] ${n.ring === 'block' ? 'font-normal' : 'font-semibold'}`}
                      style={{ paintOrder: 'stroke' }}
                      stroke="var(--color-adm-bg)"
                      strokeWidth={4}
                      strokeLinejoin="round"
                    >
                      {n.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-12 text-11 text-adm-muted">
            <span className="inline-flex items-center gap-6">
              <svg width="28" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="28" y2="3" className="stroke-adm-axis" strokeWidth={2} strokeDasharray="5 4" />
              </svg>
              Design sample (width = invented strength)
            </span>
            <span className="inline-flex items-center gap-6">
              <svg width="28" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="28" y2="3" className="stroke-adm-good" strokeWidth={2.5} />
              </svg>
              Research evidence (cited, no score)
            </span>
            {selected && (
              <button type="button" onClick={() => setSelected(null)} className="text-12 font-medium text-adm-ink underline underline-offset-2">
                Clear selection
              </button>
            )}
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {RINGS.map((ring) => (
              <div key={ring} className="flex min-w-0 flex-col gap-6">
                <h3 className="text-12 font-semibold uppercase tracking-wider text-adm-muted">{RING_LABEL[ring]}s</h3>
                <div className="flex flex-wrap gap-6">
                  {NODES.filter((n) => n.ring === ring && active.has(n.id)).map((n) => (
                    <button key={n.id} type="button" data-node-chip={n.id} onClick={() => choose(n)} className={chip(selected === n.id)}>
                      <span className={`size-8 rounded-full ${WORLD_BG[n.world]}`} aria-hidden="true" />
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Details title="How the map will learn" hint="the loop, the honesty rules">
        <ol className="grid gap-8 md:grid-cols-5">
          {['Check-in before', 'Session building blocks', 'Check-in after', 'The map updates', 'Next chapter uses what helped'].map((t, i) => (
            <li key={t} className="flex flex-col gap-4 rounded-8 border border-adm-line p-10">
              <span className="text-11 font-semibold text-adm-muted">Step {i + 1}</span>
              <span className="text-13 font-semibold text-adm-ink">{t}</span>
            </li>
          ))}
        </ol>
        <ul className="flex list-disc flex-col gap-4 pl-18 text-13 text-adm-ink-2">
          <li>Until there are real users, every strength on the map is a design sample and says so.</li>
          <li>A learned link appears only with at least {MIN_PEOPLE_FOR_LEARNED} distinct people behind it, and shows how many.</li>
          <li>Words describe association, never cause: “often followed by a better check-in”, not “works”.</li>
          <li>Research links are shown as citations, kept apart from learned results, and never turned into a score.</li>
          <li>Public wording stays wellness: no claim that anything treats or cures.</li>
        </ul>
      </Details>

      <Details title="Theirs and ours" hint="Insight Timer’s Map of Healing">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-8 border border-adm-line p-12">
            <p className="text-13 font-semibold text-adm-ink">Insight Timer’s Map of Healing</p>
            <p className="text-13 text-adm-ink-2">933 practices, 75 mechanisms, 340 body changes and 131 conditions from 250,000 papers (company claim). A link counts documented connections; it does not learn from anyone’s results.</p>
          </div>
          <div className="flex flex-col gap-4 rounded-8 border border-adm-line p-12">
            <p className="text-13 font-semibold text-adm-ink">Aurelia’s Healing Map</p>
            <p className="text-13 text-adm-ink-2">
              {nc.bad} bad states, {nc.block} building blocks, {nc.good} good states. A link will mean how often a block was followed by a better check-in, for you first and for everyone once enough people share. Today it is a design sample with {lc.research ?? 0} cited links.
            </p>
          </div>
        </div>
      </Details>
      </PageTabs>
    </div>
  )
}
