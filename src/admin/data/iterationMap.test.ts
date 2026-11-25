import { describe, expect, it } from 'vitest'
import { PRODUCTION_VERSIONS } from '../../versions/versions'
import { DEFAULT_DECISIONS } from './businessFunnel'
import { buildIterations } from './buyerAgentReport'
import { buildStages } from './combinationReport'
import { SOURCE_GROUPS, buildIterationMap, mapFor, versionsOf } from './iterationMap'
import { B2B2C_FINDINGS, BUYER_REPORT_FINDINGS, COMBINATION_FINDINGS, COST_FINDINGS, SOURCES, UX_FEEDBACK_FINDINGS } from './reportSources'

const map = buildIterationMap(1)
const node = (id: string) => map.nodes.find((n) => n.id === id)

describe('iteration map (U129)', () => {
  it('has the six source kinds, eleven reports and tests, the decisions and the versions', () => {
    expect(map.nodes.filter((n) => n.column === 'source').map((n) => n.title)).toEqual(['Personas', 'The business owner’s documents', 'Knowledge (wiki)', 'User feedback', 'Cost data', 'Product versions'])
    expect(map.nodes.filter((n) => n.column === 'report')).toHaveLength(11)
    expect(map.nodes.filter((n) => n.column === 'outcome')).toHaveLength(DEFAULT_DECISIONS.length + PRODUCTION_VERSIONS.length)
    expect(new Set(map.nodes.map((n) => n.id)).size).toBe(map.nodes.length)
  })

  it('groups only real registry sources', () => {
    for (const g of SOURCE_GROUPS) for (const s of g.sources) expect(SOURCES[s], `${g.id}: ${s}`).toBeDefined()
  })

  it('backs every edge with data', () => {
    const iterations = buildIterations()
    const stages = buildStages(1)
    const findingsOf: Record<string, string[]> = {
      'r-ux': UX_FEEDBACK_FINDINGS.flatMap((f) => f.sources),
      'r-b2b2c': B2B2C_FINDINGS.flatMap((f) => f.sources),
      'r-cost': COST_FINDINGS.flatMap((f) => f.sources),
      'r-combination': COMBINATION_FINDINGS.flatMap((f) => f.sources),
      ...Object.fromEntries(BUYER_REPORT_FINDINGS.filter((f) => f.id.startsWith('it-')).map((f) => [`r-${f.id}`, f.sources])),
    }
    expect(map.edges.length).toBeGreaterThan(20)
    for (const e of map.edges) {
      expect(node(e.from), e.from).toBeDefined()
      expect(node(e.to), e.to).toBeDefined()
      if (e.from.startsWith('g-')) {
        // A source kind feeds a report only when that report's findings cite a source of that kind.
        const g = SOURCE_GROUPS.find((x) => x.id === e.from)!
        expect(findingsOf[e.to].some((s) => (g.sources as string[]).includes(s)), `${e.from} → ${e.to}`).toBe(true)
      } else if (e.from.startsWith('r-') && e.to.startsWith('d-')) {
        // A report leads to a decision only when its own data names that decision.
        const d = e.to.slice(2)
        const it = iterations.find((x) => `r-${x.id}` === e.from)
        if (it) expect(it.decisions.map((x) => x.id), `${e.from} → ${e.to}`).toContain(d)
        else {
          expect(e.from).toBe('r-combination')
          expect(stages.map((s) => s.decision)).toContain(d)
        }
      } else if (e.from.startsWith('d-') && e.to.startsWith('v-')) {
        // A decision reaches a version only when the decision log says it shipped there.
        const d = DEFAULT_DECISIONS.find((x) => `d-${x.id}` === e.from)!
        expect(versionsOf(d)).toContain(Number(e.to.slice(2)))
      } else throw new Error(`unexpected edge ${e.from} → ${e.to}`)
    }
  })

  it('connects every report to a source, and every decision to the report that found it', () => {
    for (const n of map.nodes.filter((x) => x.column === 'report')) expect(map.edges.some((e) => e.to === n.id), n.id).toBe(true)
    for (const d of DEFAULT_DECISIONS) expect(map.edges.some((e) => e.to === `d-${d.id}`), d.id).toBe(true)
  })

  it('reads the shipped decisions into versions', () => {
    expect(versionsOf(DEFAULT_DECISIONS.find((d) => d.id === 'd5')!)).toEqual([2, 3])
    expect(map.edges.some((e) => e.to === 'v-3')).toBe(true)
  })

  it('cuts the map down to one report', () => {
    const cost = mapFor(map, 'cost')
    expect(cost.nodes.filter((n) => n.column === 'report').map((n) => n.id)).toEqual(['r-cost'])
    expect(cost.nodes.some((n) => n.id === 'g-cost')).toBe(true)
    const buyer = mapFor(map, 'buyer')
    expect(buyer.nodes.filter((n) => n.column === 'report')).toHaveLength(7)
    for (const e of buyer.edges) expect(buyer.nodes.some((n) => n.id === e.from) && buyer.nodes.some((n) => n.id === e.to)).toBe(true)
  })

  it('never names the business owner', () => {
    expect(JSON.stringify(map)).not.toMatch(/Eugene/)
  })
})
