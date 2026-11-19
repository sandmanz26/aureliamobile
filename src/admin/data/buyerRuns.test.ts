import { describe, expect, it } from 'vitest'
import { BUYER_RUNS, countVerdicts, priceRange, scenarioCounts, themeCounts } from './buyerRuns'
import { drawPanel, generatePersonas } from './personas'

describe('buyer agent runs', () => {
  const all = generatePersonas()
  const byId = new Map(all.map((p) => [p.id, p]))

  it('answers for exactly the panel the seed draws', () => {
    for (const run of BUYER_RUNS) {
      const drawn = drawPanel(all, run.panel.size, run.panel.seed).map((p) => p.id)
      expect(run.panel.personaIds, run.id).toEqual(drawn)
      expect(run.answers.map((a) => a.personaId)).toEqual(run.panel.personaIds)
    }
  })

  it('walks each persona’s own scenarios, with sane prices', () => {
    for (const run of BUYER_RUNS)
      for (const a of run.answers) {
        const p = byId.get(a.personaId)
        expect(p, a.personaId).toBeDefined()
        expect(a.scenarios.map((s) => s.id)).toEqual(p!.profile.testing.scenarios.map((s) => s.id))
        const { tooCheap, bargain, expensive, tooExpensive } = a.prices
        expect(tooCheap < bargain && bargain < expensive && expensive < tooExpensive, a.personaId).toBe(true)
        if (a.pays === 'yes') expect(a.plan).toMatch(/^plus/)
        if (a.tries === 'no') expect(a.plan).toBe('none')
      }
  })

  it('tallies the demo run', () => {
    const run = BUYER_RUNS[0]
    expect(countVerdicts(run.answers, 'tries')).toEqual({ yes: 8, maybe: 2, no: 0 })
    expect(countVerdicts(run.answers, 'pays')).toEqual({ yes: 1, maybe: 4, no: 5 })
    expect(priceRange(run.answers)).toMatchObject({ low: 3, high: 6 })
    expect(themeCounts(run.answers)[0][1]).toBeGreaterThanOrEqual(2)
    const s = scenarioCounts(run.answers)
    expect(s.pass + s.risk + s.fail).toBe(30)
  })
})
