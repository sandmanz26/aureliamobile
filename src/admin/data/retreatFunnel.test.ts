import { describe, expect, it } from 'vitest'
import { OFFERS, OUTCOMES, cohort, perTicket, pilotGates } from './retreatFunnel'

const offer = (id: string) => OFFERS.find((o) => o.id === id)!
const outcome = (id: string) => OUTCOMES.find((o) => o.id === id)!

describe('retreat funnel', () => {
  it('matches the wiki’s Unit economics, Model 1 (one €19.99 web ticket, 60/40 on net)', () => {
    const t = perTicket(offer('spec'))
    expect(t.net).toBeCloseTo(16.13, 2)
    expect(t.creator).toBeCloseTo(9.68, 2)
    expect(t.aurelia).toBeCloseTo(6.45, 2)
    expect(t.margin).toBeCloseTo(-10.57, 2) // middle AI tier and the $14 box, as on the wiki
  })

  it('matches Model 2 per 100 buyers (middle AI, no box)', () => {
    const noBox = { ...offer('spec'), boxPerBuyer: 0 }
    const low = cohort(noBox, outcome('low'), 100)
    const mid = cohort(noBox, outcome('middle'), 100)
    const spec = cohort(noBox, outcome('spec'), 100)
    expect([low.plus, mid.plus, spec.plus].map((n) => Math.round(n * 100) / 100)).toEqual([3, 10.5, 22.95])
    // The wiki rounds the per-ticket share to €6.45 first, so allow €1.
    for (const [c, wiki] of [[low, 278], [mid, 294], [spec, 310]] as const) expect(Math.abs(c.aureliaTicket - wiki)).toBeLessThanOrEqual(1)
  })

  it('makes the redesign profitable on the ticket where the spec is not', () => {
    expect(perTicket(offer('spec')).margin).toBeLessThan(0)
    expect(perTicket(offer('redesign')).margin).toBeGreaterThan(0)
    expect(perTicket(offer('redesign39')).margin).toBeGreaterThan(perTicket(offer('redesign')).margin)
  })

  it('judges the pilot gates: the spec fails on cost, the middle redesign passes all five', () => {
    const spec = pilotGates(offer('spec'), outcome('middle'), 200)
    expect(spec.find((g) => g.id === 'cost')!.pass).toBe(false)
    expect(pilotGates(offer('redesign'), outcome('middle'), 200).every((g) => g.pass)).toBe(true)
    expect(pilotGates(offer('redesign'), outcome('low'), 80).filter((g) => !g.pass).map((g) => g.id)).toEqual(['seats', 'active', 'plus', 'refunds'])
  })
})
