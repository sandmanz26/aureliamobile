import { describe, expect, it } from 'vitest'
import { INITIAL_JOURNEY } from './userJourney'
import { PERSONA_COUNT, distribution, drawPanel, generatePersonas, personaPrompt } from './personas'

describe('personas', () => {
  const all = generatePersonas()

  it('makes 300 with unique ids, the same every time', () => {
    expect(all).toHaveLength(PERSONA_COUNT)
    expect(new Set(all.map((p) => p.id)).size).toBe(PERSONA_COUNT)
    expect(generatePersonas()).toEqual(all)
  })

  it('keeps each persona coherent', () => {
    for (const p of all) {
      expect(p.age).toBeGreaterThanOrEqual(18)
      expect(p.age).toBeLessThanOrEqual(82)
      if (p.workPattern === 'retired') expect(p.age, p.id).toBeGreaterThan(50)
      if (p.workPattern === 'student') expect(p.age, p.id).toBeLessThan(40)
      if (p.aiAttitude === 'distrustful') expect(p.barriers).toContain('does not trust AI with feelings')
      expect(p.moments.length).toBeGreaterThan(0)
      if (p.experience === 'never') expect(p.apps, p.id).toEqual([])
    }
  })

  it('links only to moments that exist in the user journey', () => {
    const ids = new Set(INITIAL_JOURNEY.stages.flatMap((s) => s.moments.map((m) => m.id)))
    for (const p of all) for (const m of p.moments) expect(ids.has(m), `${p.id} ${m}`).toBe(true)
  })

  it('covers the variety a research panel needs', () => {
    expect(distribution(all, 'goal')).toHaveLength(6)
    expect(distribution(all, 'ageBand').length).toBeGreaterThanOrEqual(6)
    expect(distribution(all, 'country').length).toBeGreaterThanOrEqual(15)
    expect(distribution(all, 'aiAttitude')).toHaveLength(4)
    expect(distribution(all, 'experience')).toHaveLength(4)
    expect(all.filter((p) => p.flags.length > 0).length).toBeGreaterThan(60)
  })

  it('draws a balanced, reproducible panel', () => {
    const panel = drawPanel(all, 30, 7)
    expect(panel).toHaveLength(30)
    expect(drawPanel(all, 30, 7)).toEqual(panel)
    for (const [, n] of distribution(panel, 'goal')) expect(n).toBe(5)
  })

  it('writes a role-play prompt that says it is synthetic', () => {
    const prompt = personaPrompt(all[0])
    expect(prompt).toContain(all[0].name)
    expect(prompt).toContain('synthetic research persona')
  })
})
