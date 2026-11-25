import { describe, expect, it } from 'vitest'
import { BUYER_RUNS, EXCLUDED, countVerdicts, drawStratified, personasOf, priceRange, scenarioCounts, themeCounts, wellnessOf } from './buyerRuns'
import { V3_CHANGES } from './buyerRunV3'
import { drawPanel, generatePersonas, incoherence } from './personas'

describe('buyer agent runs', () => {
  const all = generatePersonas(undefined, undefined, 1)
  const byId = new Map(all.map((p) => [p.id, p]))

  it('answers for exactly the panel the seed draws', () => {
    for (const run of BUYER_RUNS.filter((r) => r.version <= 3)) {
      const pool = [...personasOf(run).values()]
      const drawn = (run.version === 1 ? drawPanel(pool, run.panel.size, run.panel.seed) : run.version === 2 ? drawStratified(pool, run.panel.seed) : drawStratified(pool, run.panel.seed, [])).map((p) => p.id)
      expect(run.panel.personaIds, run.id).toEqual(drawn)
      expect(run.answers.map((a) => a.personaId)).toEqual(run.panel.personaIds)
    }
  })

  it('walks each persona’s own scenarios, with sane prices', () => {
    for (const run of BUYER_RUNS)
      for (const a of run.answers) {
        const p = personasOf(run).get(a.personaId)
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

  it('gives every run criteria and versions in order (v4 is the re-run, not a hand-played panel)', () => {
    expect(BUYER_RUNS.map((r) => r.version)).toEqual([1, 2, 3, 5, 6, 7])
    for (const r of BUYER_RUNS) expect(r.criteria.length).toBeGreaterThan(4)
  })

  it('runs v3 as an A/B on generator 2, with every change traced', () => {
    const run = BUYER_RUNS.find((r) => r.version === 3)!
    expect(run.generator).toBe(2)
    expect(run.references?.length).toBeGreaterThan(2)
    const ps = run.answers.map((a) => personasOf(run).get(a.personaId)!)
    expect(new Set(ps.map((p) => p.region)).size).toBe(6)
    expect(new Set(ps.map((p) => p.ageBand)).size).toBe(6)
    for (const p of ps) expect(incoherence(p), p.id).toEqual([])
    const lv = (v: string) => (v === 'yes' ? 2 : v === 'maybe' ? 1 : 0)
    for (const a of run.answers) {
      expect(a.control, a.personaId).toBeDefined()
      for (const c of a.movedBy ?? []) expect(Object.keys(V3_CHANGES)).toContain(c)
      if (lv(a.tries) > lv(a.control!.tries) || lv(a.pays) > lv(a.control!.pays)) expect(a.movedBy!.length, a.personaId).toBeGreaterThan(0)
    }
    const control = { yes: 0, maybe: 0, no: 0 }
    for (const a of run.answers) control[a.control!.tries] += 1
    expect(control).toEqual({ yes: 13, maybe: 15, no: 8 })
    expect(countVerdicts(run.answers, 'tries')).toEqual({ yes: 25, maybe: 9, no: 2 })
    expect(countVerdicts(run.answers, 'pays')).toEqual({ yes: 4, maybe: 22, no: 10 })
    expect(run.answers.filter((a) => a.day30 === 'yes').length / run.answers.length).toBeLessThan(1 / 8)
  })
})
