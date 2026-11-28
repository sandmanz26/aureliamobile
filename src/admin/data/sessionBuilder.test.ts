import { describe, expect, it } from 'vitest'
import { CASCADE, PLANNER, workedExample } from './sessionBuilder'
import { therapeuticFunnel, funnelOptions } from './therapeuticFunnel'
import { sleepCohort } from './stateFlipFormulas'

describe('How a session is built (U148)', () => {
  it('has the 16 workbook steps in order, 3 Meta, 7 Path, 6 Script', () => {
    expect(CASCADE.map((c) => c.n)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1))
    expect(CASCADE.filter((c) => c.domain === 'META').length).toBe(3)
    expect(CASCADE.filter((c) => c.domain === 'PATH').length).toBe(7)
    expect(CASCADE.filter((c) => c.domain === 'SCRIPT').length).toBe(6)
  })
  it('plans exactly 10 minutes and gives a value at every step', () => {
    expect(PLANNER.reduce((t, r) => t + r.seconds, 0)).toBe(600)
    const ex = workedExample()
    expect(ex.values.map((v) => v.n)).toEqual(CASCADE.map((c) => c.n))
    expect(ex.alignment.score).toBeGreaterThan(0)
    expect(ex.alignment.score).toBeLessThanOrEqual(1)
  })
})

describe('Therapeutic funnel (U148)', () => {
  it('never grows from one stage to the next', () => {
    for (const { id } of funnelOptions().slice(0, 30)) {
      const f = therapeuticFunnel(id)
      for (let i = 1; i < f.stages.length; i++) expect(f.stages[i].people, `${id} ${f.stages[i].id}`).toBeLessThanOrEqual(f.stages[i - 1].people + 1e-9)
    }
  })
  it('flips the same share as the sleep cohort’s chance it works', () => {
    const f = therapeuticFunnel('SF-PHY-01')
    const c = sleepCohort()
    expect(f.group).toBe(c.people.length)
    expect(f.stages.find((s) => s.id === 'Z')!.people / f.group).toBeCloseTo(c.meanChance, 6)
  })
})
