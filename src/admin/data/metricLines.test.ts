import { describe, expect, it } from 'vitest'
import { STAGES } from './costModel'
import { metricLines, topDrivers } from './metricLines'

describe('metric lines (A31)', () => {
  it('has one point per Causal AI stage, density and velocity from the spec', () => {
    const l = metricLines()
    expect(l.map((p) => p.stage)).toEqual([1, 2, 3])
    for (const p of l) {
      expect(p.density).toBe(STAGES[p.stage].density)
      expect(p.velocity).toBe(STAGES[p.stage].velocity)
      expect(p.flipped).toBeGreaterThanOrEqual(0)
      expect(p.flipped).toBeLessThanOrEqual(1)
      expect(Number.isFinite(p.costPerFlip)).toBe(true)
    }
    expect(l[0].costIndex).toBe(1)
  })
  it('gets cheaper and flips more people as the stages advance', () => {
    const l = metricLines()
    expect(l[2].costPerFlip).toBeLessThan(l[0].costPerFlip)
    expect(l[2].flipped).toBeGreaterThanOrEqual(l[0].flipped)
  })
  it('ranks the drivers by how far they move cost per flip', () => {
    const d = topDrivers()
    expect(d).toHaveLength(6)
    for (let i = 1; i < d.length; i++) expect(Math.abs(d[i - 1].change)).toBeGreaterThanOrEqual(Math.abs(d[i].change))
  })
})
