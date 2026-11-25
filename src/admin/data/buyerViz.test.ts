import { describe, expect, it } from 'vitest'
import { RUN_V5 } from './buyerRunV5'
import { v6Tallies } from './buyerRunV6'
import { v7Tallies } from './buyerRunV7'
import { funnel, heat, objections, priceLadder, slopes, vizTests } from './buyerViz'

describe('buyer report charts (U130)', () => {
  const tests = vizTests()
  const [t5, t6, t7] = tests

  it('covers tests 5, 6 and 7 with their full panels', () => {
    expect(tests.map((t) => t.rows.length)).toEqual([36, 60, 100])
    expect(t5.rows.length).toBe(RUN_V5.answers.length)
  })

  it('funnels agree with the runs’ own tallies', () => {
    const f6 = funnel(t6)
    expect(f6[1].count).toBe(v6Tallies().A.tries.yes)
    expect(f6[2].count).toBe(v6Tallies().A.pays.yes)
    expect(f6[3].count).toBeNull()
    const f7 = funnel(t7)
    expect(f7[1].count).toBe(v7Tallies().B.tries.yes)
    expect(f7[3].count).toBe(v7Tallies().day30B)
    for (const t of tests) expect(funnel(t)[0].count).toBe(t.rows.length)
  })

  it('every segment of the heat map adds back to the panel', () => {
    for (const t of [t6, t7]) {
      const cells = heat(t)
      for (const seg of new Set(cells.map((c) => c.segment))) {
        const rows = cells.filter((c) => c.segment === seg)
        expect(rows.reduce((s, c) => s + c.n, 0)).toBe(t.rows.length)
        expect(rows.reduce((s, c) => s + c.tries, 0)).toBe(funnel(t)[1].count)
      }
    }
    expect(new Set(heat(t7).map((c) => c.segment))).toEqual(new Set(['ageBand', 'region', 'condition', 'found', 'aiTrust']))
  })

  it('the price ladder climbs', () => {
    for (const t of tests) {
      const p = priceLadder(t)
      expect(p.tooCheap).toBeLessThanOrEqual(p.bargain)
      expect(p.bargain).toBeLessThanOrEqual(p.expensive)
      expect(p.expensive).toBeLessThanOrEqual(p.tooExpensive)
    }
  })

  it('objections count everyone who would not pay, ranked', () => {
    for (const t of tests) {
      const o = objections(t)
      const notPaying = t.rows.filter((r) => r.pays !== 'yes').length
      expect(o.reduce((s, x) => s + x.count, 0)).toBe(notPaying)
      expect(o.map((x) => x.count)).toEqual([...o.map((x) => x.count)].sort((a, b) => b - a))
      for (const x of o) expect(x.quotes.length).toBeGreaterThan(0)
    }
  })

  it('slopes never lose people and name six changes', () => {
    const s = slopes()
    expect(s).toHaveLength(6)
    for (const x of s) {
      expect(x.before).toBeLessThanOrEqual(x.moved)
      expect(x.after).toBeLessThanOrEqual(x.moved)
    }
    expect(s.some((x) => x.moved > 0)).toBe(true)
  })
})
