import { describe, expect, it } from 'vitest'
import { BUYER_RUNS, EXCLUDED, countVerdicts, drawStratified, priceRange, scenarioCounts, themeCounts, wellnessOf } from './buyerRuns'
import { drawPanel, generatePersonas } from './personas'

describe('buyer agent runs', () => {
  const all = generatePersonas()
  const byId = new Map(all.map((p) => [p.id, p]))

  it('answers for exactly the panel the seed draws', () => {
    for (const run of BUYER_RUNS) {
      const drawn = (run.version === 1 ? drawPanel(all, run.panel.size, run.panel.seed) : drawStratified(all, run.panel.seed)).map((p) => p.id)
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

  it('gives v2 every region and age band, without the excluded, with usage', () => {
    const run = BUYER_RUNS.find((r) => r.version === 2)!
    const ps = run.panel.personaIds.map((id) => byId.get(id)!)
    expect(new Set(ps.map((p) => p.region)).size).toBe(6)
    expect(new Set(ps.map((p) => p.ageBand)).size).toBe(6)
    for (const id of EXCLUDED) expect(run.panel.personaIds).not.toContain(id)
    for (const a of run.answers) {
      expect(a.week, a.personaId).toBeGreaterThanOrEqual(0)
      expect(a.week, a.personaId).toBeLessThanOrEqual(7)
      expect(a.day30, a.personaId).toBeDefined()
      if (a.tries === 'no') expect(a.week).toBe(0)
    }
    expect(countVerdicts(run.answers, 'tries')).toEqual({ yes: 15, maybe: 16, no: 5 })
    expect(new Set(ps.map((p) => wellnessOf(p).level)).size).toBe(3)
  })

  it('gives every run criteria and versions in order', () => {
    BUYER_RUNS.forEach((r, i) => {
      expect(r.version).toBe(i + 1)
      expect(r.criteria.length).toBeGreaterThan(4)
    })
  })
})
