import { DEFAULT_DECISIONS, STATUS_LABEL, type Decision } from './businessFunnel'
import { buildIterations } from './buyerAgentReport'
import { buildStages } from './combinationReport'
import { B2B2C_FINDINGS, BUYER_REPORT_FINDINGS, COMBINATION_FINDINGS, COST_FINDINGS, SOURCES, UX_FEEDBACK_FINDINGS, type Finding, type SourceId, type SourceLabel } from './reportSources'
import { buyerTrend } from './reportSummaries'
import { PRODUCTION_VERSIONS } from '../../versions/versions'

/**
 * Admin → Reports → Overview (U129, J182): how Aurelia improves, as one map.
 * Left, the kinds of source we learn from; middle, the reports and tests
 * that read them; right, what came out: the decisions in the funnel's
 * decision log and the production versions they shipped in. Nothing here is
 * typed in by hand: every node and every edge is derived from the registry
 * (reportSources), the buyer iterations, the combination stages, the
 * decision log and versions.ts. `iterationMap.test.ts` re-derives each edge.
 */

export type MapColumn = 'source' | 'report' | 'outcome'
export type ReportKey = 'buyer' | 'combination' | 'cost' | 'ux' | 'b2b2c'

export interface MapNode {
  id: string
  column: MapColumn
  title: string
  /** A few words under the title. */
  tag: string
  /** The drawer's short summary. */
  summary: string
  numbers: { label: string; value: string }[]
  labels: SourceLabel[]
  to: string
  toLabel: string
  /** The reports this node belongs to, for the per-report map. */
  reports: ReportKey[]
}

export interface MapEdge {
  from: string
  to: string
  /** Why the edge is there, in a few words: the data that backs it. */
  why: string
}

/** The six kinds of source, in the owner's words, and the registry entries each covers. */
export const SOURCE_GROUPS: { id: string; title: string; summary: string; sources: SourceId[]; to: string }[] = [
  { id: 'g-personas', title: 'Personas', summary: 'Made-up people, each with an age, a country and a life. AI plays them in the tests.', sources: ['personas'], to: '/admin/personas' },
  { id: 'g-owner', title: 'The business owner’s documents', summary: 'The briefs, the spec and the chats the business owner sent.', sources: ['owner-docs', 'spec-causal', 'owner-chat'], to: '/wiki/backend-old' },
  { id: 'g-wiki', title: 'Knowledge (wiki)', summary: 'What the team has written down: the product plan, research and the old backend.', sources: ['prd', 'backend-old', 'artefact', 'b2b2c', 'user-journey'], to: '/wiki/prd' },
  { id: 'g-feedback', title: 'User feedback', summary: 'What people told us: three real interviews, and the feedback group study (sample data until it runs).', sources: ['interviews', 'feedback-group'], to: '/admin/reports/ux-feedback' },
  { id: 'g-cost', title: 'Cost data', summary: 'What AI suppliers charge, and last year’s real bills.', sources: ['cost-2025', 'supplier-prices'], to: '/admin/reports/cost' },
  { id: 'g-versions', title: 'Product versions', summary: 'What each version of the app shows on screen, and the prices it shows.', sources: ['versions', 'buyer-prices'], to: '/admin/buyer-agent?view=versions' },
]

const REPORT_PAGES: Record<ReportKey, { title: string; to: string; findings: Finding[] }> = {
  buyer: { title: 'Buyer agent report', to: '/admin/reports/buyer-agent', findings: BUYER_REPORT_FINDINGS },
  combination: { title: 'Combination report', to: '/admin/reports/combination', findings: COMBINATION_FINDINGS },
  cost: { title: 'Cost report', to: '/admin/reports/cost', findings: COST_FINDINGS },
  ux: { title: 'UX feedback report', to: '/admin/reports/ux-feedback', findings: UX_FEEDBACK_FINDINGS },
  b2b2c: { title: 'B2B2C report', to: '/admin/reports/b2b2c', findings: B2B2C_FINDINGS },
}

const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`)
const uniq = <T>(xs: T[]) => [...new Set(xs)]

/** The sources one middle node reads, from the registry's findings. */
function sourcesFor(findings: Finding[]): SourceId[] {
  return uniq(findings.flatMap((f) => f.sources))
}

/** The production versions a decision names ("Production v2 and v3"). */
export function versionsOf(d: Decision): number[] {
  if (!/production/i.test(d.version)) return []
  return [...d.version.matchAll(/v(\d)/g)].map((m) => Number(m[1])).filter((v) => PRODUCTION_VERSIONS.some((p) => p.id === v))
}

export interface IterationMap {
  nodes: MapNode[]
  edges: MapEdge[]
  /** What each middle node reads, for the test. */
  reads: Record<string, SourceId[]>
  /** What each middle node led to, for the test. */
  leadsTo: Record<string, string[]>
}

export function buildIterationMap(week = 1): IterationMap {
  const trend = buyerTrend()
  const iterations = buildIterations()
  const stages = buildStages(week)
  const nodes: MapNode[] = []
  const edges: MapEdge[] = []
  const reads: Record<string, SourceId[]> = {}
  const leadsTo: Record<string, string[]> = {}

  // Middle: each buyer test, then the three other reports.
  for (const it of iterations) {
    const t = trend.find((p) => p.id === it.id)!
    const id = `r-${it.id}`
    reads[id] = sourcesFor(BUYER_REPORT_FINDINGS.filter((f) => f.id === it.id))
    leadsTo[id] = it.decisions.map((d) => d.id)
    nodes.push({
      id,
      column: 'report',
      title: `Buyer agent ${t.label.toLowerCase()}`,
      tag: `${t.n} people · ${it.date.slice(8, 10)} Nov`,
      summary: t.change,
      numbers: [
        { label: 'People asked', value: `${t.n}` },
        { label: 'Would try', value: pct(t.tries) },
        { label: 'Would pay', value: pct(t.pays) },
        { label: 'Back after a month', value: pct(t.sure30) },
      ],
      labels: ['prediction'],
      to: it.link,
      toLabel: 'Every answer in this test',
      reports: ['buyer'],
    })
  }
  const others: [ReportKey, string, string, SourceLabel[]][] = [
    ['ux', 'How the feedback group is doing, week by week. Sample data until the real study runs.', 'Feedback group', ['sample']],
    ['cost', 'What one audio session costs to make, and what helping one person sleep well costs.', 'Costs and profit', ['estimate', 'measured', 'scenario']],
    ['b2b2c', 'Which partner channel to build first, and the features it needs.', 'Channels and features', ['document', 'prediction', 'estimate']],
    ['combination', 'Every source joined, step by step of the customer journey, to pick what to fix first.', 'All sources joined', ['prediction', 'document', 'sample']],
  ]
  for (const [key, summary, tag, labels] of others) {
    const page = REPORT_PAGES[key]
    const id = `r-${key}`
    reads[id] = sourcesFor(page.findings)
    leadsTo[id] = key === 'combination' ? uniq(stages.map((s) => s.decision).filter((d): d is string => !!d)) : []
    nodes.push({ id, column: 'report', title: page.title, tag, summary, numbers: [{ label: 'Sources read', value: `${reads[id].length}` }, { label: 'Decisions it led to', value: `${leadsTo[id].length}` }], labels, to: page.to, toLabel: `Open the ${page.title.toLowerCase()}`, reports: [key] })
  }

  // Left: a source kind is on the map when some report reads it.
  for (const g of SOURCE_GROUPS) {
    const users = nodes.filter((n) => n.column === 'report' && reads[n.id].some((s) => g.sources.includes(s)))
    nodes.push({
      id: g.id,
      column: 'source',
      title: g.title,
      tag: `${users.length} ${users.length === 1 ? 'report' : 'reports and tests'}`,
      summary: g.summary,
      numbers: [{ label: 'Sources of this kind', value: `${g.sources.length}` }, { label: 'Used by', value: `${users.length}` }],
      labels: uniq(g.sources.map((s) => SOURCES[s].label)),
      to: g.to,
      toLabel: 'Open the source',
      reports: uniq(users.flatMap((u) => u.reports)),
    })
    for (const u of users) {
      const used = g.sources.filter((s) => reads[u.id].includes(s))
      edges.push({ from: g.id, to: u.id, why: `Reads ${used.map((s) => SOURCES[s].name).join(', ')}` })
    }
  }

  // Right: the decisions, then the production versions they shipped in.
  for (const d of DEFAULT_DECISIONS) {
    const id = `d-${d.id}`
    const from = nodes.filter((n) => n.column === 'report' && leadsTo[n.id].includes(d.id))
    nodes.push({
      id,
      column: 'outcome',
      title: d.change.length > 60 ? `${d.change.slice(0, 57).trimEnd()}…` : d.change,
      tag: `Decision · ${STATUS_LABEL[d.status]}`,
      summary: `${d.change} Why: ${d.finding}`,
      numbers: [{ label: 'Status', value: STATUS_LABEL[d.status] }, { label: 'Logged', value: d.date }, ...(d.version ? [{ label: 'Shipped in', value: d.version }] : []), ...(d.result ? [{ label: 'Result', value: d.result }] : [])],
      labels: ['document'],
      to: '/admin/business-funnel',
      toLabel: 'Open the decision log',
      reports: uniq(from.flatMap((n) => n.reports)),
    })
    for (const n of from) edges.push({ from: n.id, to: id, why: `${n.title} led to this decision` })
  }
  for (const v of PRODUCTION_VERSIONS) {
    const id = `v-${v.id}`
    const from = DEFAULT_DECISIONS.filter((d) => versionsOf(d).includes(v.id))
    nodes.push({
      id,
      column: 'outcome',
      title: `Product version ${v.id}`,
      tag: v.id === PRODUCTION_VERSIONS.length ? 'Live today' : 'Earlier version',
      summary: v.summary,
      numbers: [{ label: 'Decisions in it', value: `${from.length}` }],
      labels: ['document'],
      to: '/admin/buyer-agent?view=versions',
      toLabel: 'What each version shows',
      reports: uniq(from.flatMap((d) => nodes.find((n) => n.id === `d-${d.id}`)!.reports)),
    })
    for (const d of from) edges.push({ from: `d-${d.id}`, to: id, why: `Shipped in ${d.version}` })
  }

  return { nodes, edges, reads, leadsTo }
}

/** The map cut down to one report: its own middle node(s), what feeds them and what came out of them. */
export function mapFor(map: IterationMap, report: ReportKey): IterationMap {
  const keep = new Set(map.nodes.filter((n) => n.column === 'report' && n.reports.includes(report)).map((n) => n.id))
  for (const e of map.edges) if (keep.has(e.to) && e.from.startsWith('g-')) keep.add(e.from)
  for (const e of map.edges) if (keep.has(e.from) && !e.from.startsWith('g-')) keep.add(e.to)
  for (const e of map.edges) if (keep.has(e.from) && e.from.startsWith('d-')) keep.add(e.to)
  return { ...map, nodes: map.nodes.filter((n) => keep.has(n.id)), edges: map.edges.filter((e) => keep.has(e.from) && keep.has(e.to)) }
}

export const COLUMN_TITLE: Record<MapColumn, string> = {
  source: 'What we learn from',
  report: 'Reports and tests',
  outcome: 'What came out',
}
