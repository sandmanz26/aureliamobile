import { describe, expect, it } from 'vitest'
import { generatePersonas, incoherence } from './personas'
import { AGE_BANDS, AGE_PROFILES, PERSONA_COUNT_V4, PLACES_V4, SCENARIO_IDS, SOURCES, TARGETS, buyerVarsV4, generatePersonasV4, incoherenceV4, type PersonaV4 } from './personasV4'

const all = generatePersonasV4()
const share = (f: (p: PersonaV4) => boolean, base: PersonaV4[] = all) => base.filter(f).length / base.length

describe('persona set v4', () => {
  it('makes 1,000 with unique ids, the same every time from its seed', () => {
    expect(all).toHaveLength(PERSONA_COUNT_V4)
    expect(new Set(all.map((p) => p.id)).size).toBe(PERSONA_COUNT_V4)
    expect(generatePersonasV4(PERSONA_COUNT_V4, 20264)).toEqual(all)
    expect(generatePersonasV4(50, 7)).toEqual(generatePersonasV4(50, 7))
    expect(generatePersonasV4(50, 7)).not.toEqual(generatePersonasV4(50, 8))
  })

  it('leaves generators 1 and 2 as they were', () => {
    expect(generatePersonas(undefined, undefined, 1)[0].id).toBe('P001')
    expect(generatePersonas(undefined, undefined, 2).every((p) => incoherence(p).length === 0)).toBe(true)
  })

  it('is coherent: incoherence() finds nothing in any of the 1,000', () => {
    const bad = all.flatMap((p) => incoherence(p).map((x) => `${p.id}: ${x}`))
    expect(bad).toEqual([])
  })

  it('catches the new kinds of contradiction', () => {
    const p = all.find((x) => x.sex === 'man' && x.age > 40 && x.age < 55 && x.work === 'employed' && !x.nightShift)!
    expect(incoherenceV4({ ...p, scenario: 'menopause' }).join()).toMatch(/menopause/)
    expect(incoherenceV4({ ...p, work: 'student' }).join()).toMatch(/student/)
    expect(incoherenceV4({ ...p, incomeUsdMonth: p.incomeUsdMonth * 20 }).join()).toMatch(/income/)
    expect(incoherenceV4({ ...p, nightShift: true, shiftWork: true }).join()).toMatch(/night shift worker going to bed/)
    expect(incoherenceV4({ ...p, wellness: { ...p.wellness, band: 'severe', score: 20, functioning: 'mostly fine day to day, a bad night now and then' } }).join()).toMatch(/fine day to day/)
    expect(incoherenceV4({ ...p, riskFlag: true }).join()).toMatch(/risk/)
  })

  it('gives every persona an age, a life situation and a wellness condition', () => {
    for (const p of all) {
      expect(p.age, p.id).toBeGreaterThanOrEqual(18)
      expect(SCENARIO_IDS).toContain(p.scenario)
      expect(p.badNightTriggers.length).toBeGreaterThan(0)
      expect(p.wellness.score).toBeGreaterThanOrEqual(0)
      expect(p.wellness.score).toBeLessThanOrEqual(100)
      expect(p.story).toHaveLength(3)
      expect(p.name).not.toMatch(/eugene/i)
    }
    expect(new Set(all.map((p) => p.scenario)).size).toBe(SCENARIO_IDS.length)
    expect(new Set(all.map((p) => p.wellness.band)).size).toBe(3)
  })

  it('keeps the country mix within 3 percentage points of the market weights', () => {
    for (const pl of PLACES_V4) expect(Math.abs(share((p) => p.country === pl.country) - pl.weight / 100), pl.country).toBeLessThan(0.03)
  })

  it('matches UN age shares by country group and an even sex split', () => {
    for (const [group, prof] of Object.entries(AGE_PROFILES)) {
      const countries = PLACES_V4.filter((x) => x.ageGroup === group).map((x) => x.country)
      const ps = all.filter((p) => countries.includes(p.country))
      if (ps.length < 150) continue
      AGE_BANDS.forEach((b, i) => expect(Math.abs(share((p) => p.ageBand === b, ps) - prof[i] / 100), `${group} ${b}`).toBeLessThan(0.07))
    }
    expect(Math.abs(share((p) => p.sex === 'woman') - 0.5)).toBeLessThan(0.04)
    expect(share((p) => p.age >= 65)).toBeGreaterThan(0.1)
  })

  it('follows phone share by country', () => {
    const ios = (c: string) => share((p) => p.device === 'iPhone', all.filter((p) => p.country === c))
    expect(ios('United States')).toBeGreaterThan(0.42)
    expect(ios('Indonesia')).toBeLessThan(0.2)
    expect(ios('India')).toBeLessThan(0.15)
  })

  it('hits the cited wellness shares', () => {
    expect(Math.abs(share((p) => p.wellness.sleep.band !== 'good') - TARGETS.insomniaSymptoms)).toBeLessThan(0.01)
    expect(Math.abs(share((p) => p.wellness.sleep.band === 'very poor') - TARGETS.insomniaDisorder)).toBeLessThan(0.01)
    expect(Math.abs(share((p) => p.wellness.stress.stressedYesterday) - TARGETS.stressedYesterday)).toBeLessThan(0.01)
    expect(Math.abs(share((p) => p.wellness.mood !== 'none') - TARGETS.lowMoodAny)).toBeLessThan(0.01)
    expect(Math.abs(share((p) => p.wellness.anxiety !== 'none') - TARGETS.anxietyAny)).toBeLessThan(0.01)
    expect(Math.abs(share((p) => p.wellness.activeMinutesWeek < 150) - TARGETS.insufficientActivity)).toBeLessThan(0.01)
    const women = all.filter((p) => p.sex === 'woman')
    const men = all.filter((p) => p.sex === 'man')
    expect(share((p) => p.wellness.mood !== 'none', women)).toBeGreaterThan(share((p) => p.wellness.mood !== 'none', men))
    expect(share((p) => p.wellness.anxiety !== 'none', all.filter((p) => p.age < 25))).toBeGreaterThan(share((p) => p.wellness.anxiety !== 'none', all.filter((p) => p.age >= 65)))
  })

  it('hits the cited life-circumstance shares within tolerance', () => {
    const workers = all.filter((p) => p.work === 'employed' || p.work === 'self-employed')
    expect(Math.abs(share((p) => p.shiftWork, workers) - TARGETS.shiftOfWorkers)).toBeLessThan(0.05)
    expect(Math.abs(share((p) => p.caregiving) - TARGETS.caregiving)).toBeLessThan(0.04)
    expect(Math.abs(share((p) => p.chronicPain) - TARGETS.chronicPain)).toBeLessThan(0.04)
    expect(Math.abs(share((p) => p.priorApp !== 'none') - TARGETS.priorApp)).toBeLessThan(0.04)
    const wear = share((p) => p.wearable !== 'none')
    expect(wear).toBeGreaterThan(0.12)
    expect(wear).toBeLessThan(0.3)
  })

  it('flags a small, sane share for help, and never markets to them', () => {
    const flagged = all.filter((p) => p.riskFlag)
    expect(flagged.length / all.length).toBeGreaterThanOrEqual(0.015)
    expect(flagged.length / all.length).toBeLessThanOrEqual(0.05)
    for (const p of flagged) {
      expect(p.routing).toBe('Need help now?')
      expect(p.marketable).toBe(false)
      expect(['moderate', 'severe']).toContain(p.wellness.mood)
    }
    expect(all.filter((p) => !p.riskFlag).every((p) => p.marketable && p.routing === 'normal')).toBe(true)
  })

  it('cites every source with a URL and a year, labelled measured or assumption', () => {
    for (const s of SOURCES) {
      expect(s.url, s.id).toMatch(/^https:\/\//)
      expect(s.year).toBeGreaterThan(1999)
      expect(['measured', 'assumption']).toContain(s.kind)
    }
    expect(SOURCES.filter((s) => s.kind === 'measured').length).toBeGreaterThan(10)
  })

  it('gives buyer runs every variable they read', () => {
    const v = buyerVarsV4(all[0])
    for (const k of ['condition', 'wearable', 'device', 'language', 'found', 'priorApp', 'churn', 'budget', 'lifeStage', 'needTime', 'aiTrust', 'privacy', 'culture']) expect(v[k as keyof typeof v], k).toBeTruthy()
  })
})
