import { describe, expect, it } from 'vitest'
import { populationCost } from './personaConditionV4'
import { sleepCohort } from './stateFlipFormulas'
import { stateFlipCosts } from './stateFlipCosts'

describe('cost per StateFlip (U145)', () => {
  const c = stateFlipCosts()

  it('costs every StateFlip with a group, and sleep matches the sleep cohort', () => {
    expect(c.rows).toHaveLength(125)
    const sleep = c.rows.find((r) => r.flip.id === 'SF-PHY-01')!
    expect(sleep.costPerFlip).toBeCloseTo(sleepCohort().costPerFlip, 10)
    for (const r of c.rows) expect(r.costPerFlip).toBeCloseTo((r.costPerChapter * r.chaptersPlayed) / r.meanChance, 10)
  })

  it('weights dimensions by people and reuses the population cost', () => {
    for (const d of c.byDimension) {
      const rs = c.rows.filter((r) => r.flip.dimension === d.dimension)
      expect(d.costPerFlip).toBeCloseTo(rs.reduce((t, r) => t + r.group * r.costPerFlip, 0) / rs.reduce((t, r) => t + r.group, 0), 10)
      expect(d.cheapest.costPerFlip).toBeLessThanOrEqual(d.dearest.costPerFlip)
    }
    expect(c.population.averageCost).toBe(populationCost().averageCost)
  })
})
