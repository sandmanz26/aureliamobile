// FNV-1a over the JSON: enough to notice a single changed byte.
import { describe, expect, it } from 'vitest'
import { generatePersonas } from './personas'
import { generatePersonasV4, incoherenceV4 } from './personasV4'
import {
  COND_BANDS,
  DIMENSIONS,
  ISSUES,
  QUICK_CONDITION,
  condBandOf,
  conditionForBuyer,
  conditionForCost,
  conditionIncoherence,
  conditionOf,
  conditionSummary,
  conditionsV4,
  perWeekOf,
  populationCost,
  sessionMinutesOf,
} from './personaConditionV4'

const digest = (x: unknown) => {
  let h = 0x811c9dc5
  for (const ch of JSON.stringify(x)) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  return h.toString(16)
}
const ps = generatePersonasV4()
const cs = ps.map((p) => conditionsV4().get(p.id)!)

describe('persona set v4: current condition (U138)', () => {
  it('leaves generators 1 and 2 and the published v4 set byte-identical', () => {
    // Digests taken from web_app at e3f6a2d, before this change.
    expect([digest(generatePersonas(300, 2026, 1)), digest(generatePersonas(300, 2026, 2)), digest(ps)]).toEqual(['d584ab44', 'dbde99b4', 'd4753d70'])
    expect(ps.every((p) => !('condition' in p))).toBe(true)
  })

  it('holds together for all 1,000, alongside the v4 coherence check', () => {
    const bad = ps.flatMap((p, i) => conditionIncoherence(p, cs[i]).map((x) => `${p.id}: ${x}`))
    expect(bad).toEqual([])
    expect(ps.filter((p) => incoherenceV4(p).length)).toEqual([])
    expect(conditionSummary().incoherent).toBe(0)
  })

  it('is deterministic: the same persona gives the same condition', () => {
    for (const p of ps.slice(0, 50)) expect(conditionOf(p)).toEqual(conditionOf(p))
    expect(digest(cs)).toBe(digest(ps.map(conditionOf)))
  })

  it('has ten issues per dimension, each with a DOJO dual and a source', () => {
    for (const d of DIMENSIONS) {
      expect(ISSUES[d]).toHaveLength(10)
      expect(new Set(ISSUES[d].map((i) => i.id)).size).toBe(10)
      for (const i of ISSUES[d]) {
        expect(i.dojo.length, i.id).toBeGreaterThan(5)
        expect(i.goal, i.id).toMatch(/^I want /)
      }
      // Every issue is somebody's
      for (const i of ISSUES[d]) expect(cs.some((c) => c.dims[d].issue === i.id), `${d}/${i.id}`).toBe(true)
    }
  })

  it('bands scores on the Cost report’s quick conditions', () => {
    for (const b of COND_BANDS) expect(condBandOf(QUICK_CONDITION[b])).toBe(b)
  })

  it('has sane distributions per dimension, main need and readiness', () => {
    const s = conditionSummary()
    for (const d of DIMENSIONS) {
      expect(s.meanByDim[d], d).toBeGreaterThan(50)
      expect(s.meanByDim[d], d).toBeLessThan(85)
      expect(s.bandsByDim[d].good, d).toBeLessThan(750)
      expect(s.mainNeed[d], d).toBeGreaterThanOrEqual(30)
    }
    // Physical (sleep) is the most common main need for a sleep-first set; at least two bands of severity exist everywhere
    expect(Math.max(...DIMENSIONS.map((d) => s.mainNeed[d]))).toBe(s.mainNeed.physical)
    for (const d of DIMENSIONS) expect(s.bandsByDim[d].moderate + s.bandsByDim[d].severe, d).toBeGreaterThan(40)
    // Stages of change: most people are not yet acting
    expect(s.readiness['not yet'] + s.readiness.thinking).toBeGreaterThan(500)
    expect(s.readiness.maintaining).toBe(ps.filter((p) => p.priorAppOutcome === 'still uses it').length)
    expect(s.readyShare).toBeGreaterThan(0.2)
    expect(s.readyShare).toBeLessThan(0.5)
    expect(s.acuity.ongoing).toBeGreaterThan(s.acuity.acute)
  })

  it('reads worse people as needier, for the buyer agent', () => {
    const b = ps.map((p, i) => ({ p, c: cs[i], b: conditionForBuyer(p, cs[i]) })).filter((x) => !x.b.excluded)
    const severe = b.filter((x) => x.p.wellness.band === 'severe')
    const mild = b.filter((x) => x.p.wellness.band === 'mild')
    const mean = (xs: typeof b, f: (x: (typeof b)[number]) => number) => xs.reduce((t, x) => t + f(x), 0) / xs.length
    expect(mean(severe, (x) => x.b.needIntensity)).toBeGreaterThan(mean(mild, (x) => x.b.needIntensity) + 10)
    for (const x of b) {
      expect(x.b.needIntensity).toBe(Math.round(0.6 * (100 - x.c.overall) + 0.4 * (100 - x.c.dims[x.c.mainNeed].score)))
      expect(x.b.urgency).toBeGreaterThanOrEqual(0)
      expect(x.b.urgency).toBeLessThanOrEqual(100)
      expect(x.b.readiness).toBeGreaterThan(0)
      expect(x.b.readiness).toBeLessThanOrEqual(1)
      expect(x.b.why).toHaveLength(5)
      expect(x.b.modality).toBe(x.c.helpers[0])
    }
  })

  it('never offers anything to a risk-flagged person, and leaves them out of cost', () => {
    const flagged = ps.filter((p) => p.riskFlag)
    expect(flagged.length).toBe(25)
    for (const p of flagged) {
      const c = conditionsV4().get(p.id)!
      expect(c.excluded).toBe(true)
      expect(c.routing).toBe('Need help now?')
      const b = conditionForBuyer(p, c)
      expect(b.excluded).toBe(true)
      expect(b.routing).toBe('Need help now?')
      expect(b.readiness).toBe(0)
      const k = conditionForCost(p, c)
      expect(k.excluded).toBe(true)
      expect(k.costPerPerson).toBe(0)
    }
    const pop = populationCost()
    expect(pop.excluded).toBe(25)
    expect(pop.people).toBe(975)
  })

  it('costs a person with costModel’s own session logic', () => {
    expect(sessionMinutesOf(4)).toBe(3)
    expect(sessionMinutesOf(8)).toBe(5)
    expect(sessionMinutesOf(25)).toBe(10)
    expect(perWeekOf(10)).toBe(3)
    expect(perWeekOf(20)).toBe(6)
    const p = ps.find((x) => !x.riskFlag)!
    const k = conditionForCost(p)
    for (const d of DIMENSIONS) expect(k.dims[d].gap).toBe(Math.max(0, k.dims[d].target - k.dims[d].start))
    const others = DIMENSIONS.filter((d) => d !== k.mainNeed).reduce((t, d) => t + k.dims[d].chapters, 0)
    expect(k.chapters).toBe(k.dims[k.mainNeed].chapters + Math.ceil(0.5 * others))
    expect(k.costPerPerson).toBeCloseTo(k.chapters * k.costPerChapter, 10)
    // The population average is finite, positive and the plain mean of the 975
    const pop = populationCost()
    expect(pop.averageCost).toBeGreaterThan(1)
    expect(pop.averageCost).toBeLessThan(100)
    const sum = ps.filter((x) => !x.riskFlag).reduce((t, x) => t + conditionForCost(x).costPerPerson, 0)
    expect(pop.averageCost).toBeCloseTo(sum / 975, 8)
    // A later stage costs less per person
    expect(populationCost(3).averageCost).toBeLessThan(pop.averageCost)
  })
})
