import { describe, expect, it } from 'vitest'
import { BUYER_RUNS, countVerdicts, personasOf, priceRange } from './buyerRuns'
import { RUN_V3 } from './buyerRunV3'
import { RUN_V5, v5Tallies } from './buyerRunV5'
import { RUN_V6, V6_A, V6_ALT, V6_B, V6_SEED, V6_SIZE, v6Best, v6Tallies } from './buyerRunV6'
import { RUN_V7, V7_ALT, V7_SEED, V7_SIZE, v7A, v7Tallies } from './buyerRunV7'
import { VARS_BY_RUN, dealBreakersHit, drawStratifiedN, expectedPlus, level, play, pool2, tally, varIncoherence, varsOf, varsUpTo, withQuickWins } from './buyerPlay'
import { incoherence } from './personas'

const LATER = [RUN_V5, RUN_V6, RUN_V7]

describe('buyer agent runs v5–v7 (U124)', () => {
  it('are in BUYER_RUNS as v5, v6, v7 on generator 2', () => {
    for (const r of LATER) {
      expect(BUYER_RUNS).toContain(r)
      expect(r.generator).toBe(2)
    }
  })

  it('answers for exactly the panel each seed draws, with the sizes asked for', () => {
    expect(RUN_V5.panel.personaIds).toEqual(RUN_V3.panel.personaIds)
    expect(RUN_V6.panel.personaIds).toEqual(drawStratifiedN(pool2(), V6_SEED, V6_SIZE).map((p) => p.id))
    expect(RUN_V7.panel.personaIds).toEqual(drawStratifiedN(pool2(), V7_SEED, V7_SIZE).map((p) => p.id))
    expect(LATER.map((r) => r.answers.length)).toEqual([36, 60, 100])
    for (const r of LATER) {
      expect(r.answers.map((a) => a.personaId)).toEqual(r.panel.personaIds)
      expect(new Set(r.panel.personaIds).size).toBe(r.panel.size)
    }
    const v7 = RUN_V7.answers.map((a) => personasOf(RUN_V7).get(a.personaId)!)
    expect(v7.filter((p) => p.country === 'Indonesia').length).toBeGreaterThan(0)
    expect(new Set(v7.map((p) => p.region)).size).toBe(6)
  })

  it('keeps every persona coherent, and every variable coherent with its persona', () => {
    for (const r of LATER)
      for (const a of r.answers) {
        const p = personasOf(r).get(a.personaId)!
        expect(incoherence(p), `${r.id} ${p.id}`).toEqual([])
        expect(varIncoherence(p, a.vars ?? {}), `${r.id} ${p.id}`).toEqual([])
      }
  })

  it('adds variables each run, and records them for every answer', () => {
    expect(LATER.map((r) => r.variables?.length)).toEqual([4, 8, 13])
    for (const [i, r] of LATER.entries()) {
      const keys = varsUpTo((5 + i) as 5 | 6 | 7)
      expect(r.variables?.map((v) => v.key)).toEqual(keys)
      for (const a of r.answers) expect(Object.keys(a.vars ?? {})).toEqual(keys)
    }
    expect(VARS_BY_RUN[7]).toContain('culture')
  })

  it('stores answers that are the rules applied to the persona, with sane shapes', () => {
    for (const a of RUN_V5.answers) {
      const p = personasOf(RUN_V5).get(a.personaId)!
      const r = play(p, V6_A, 5)
      expect([a.tries, a.pays], p.id).toEqual([r.tries, r.pays])
    }
    for (const r of LATER)
      for (const a of r.answers) {
        const p = personasOf(r).get(a.personaId)!
        expect(a.scenarios.map((s) => s.id)).toEqual(p.profile.testing.scenarios.map((s) => s.id))
        const { tooCheap, bargain, expensive, tooExpensive } = a.prices
        expect(tooCheap < bargain && bargain < expensive && expensive < tooExpensive, `${r.id} ${a.personaId}`).toBe(true)
        if (a.pays === 'yes') expect(a.plan).toMatch(/^plus/)
        if (a.tries === 'no') expect([a.plan, a.week]).toEqual(['none', 0])
        if (a.pays !== 'no') expect(a.tries).not.toBe('no')
        expect(a.reasoning.length).toBeGreaterThan(40)
      }
  })

  it('honours deal breakers: an offer that hits one never gets a yes to try or any payment', () => {
    for (const [r, offerOf] of [
      [RUN_V5, () => V6_A],
      [RUN_V6, () => V6_B],
      [RUN_V7, (found: string) => withQuickWins(v7A(found))],
    ] as const)
      for (const a of r.answers) {
        const p = personasOf(r).get(a.personaId)!
        if (dealBreakersHit(p, offerOf(varsOf(p).found)).length) {
          expect(a.tries, `${r.id} ${p.id}`).not.toBe('yes')
          expect(a.pays, `${r.id} ${p.id}`).toBe('no')
        }
      }
  })

  it('keeps day 30 near the evidence (a yes under 1 in 8)', () => {
    for (const r of LATER) expect(r.answers.filter((a) => a.day30 === 'yes').length / r.answers.length, r.id).toBeLessThan(1 / 8)
  })

  it('computes the tallies from the answers, and the findings quote them', () => {
    const x5 = v5Tallies()
    expect(x5.t.tries).toEqual(countVerdicts(RUN_V5.answers, 'tries'))
    expect(x5.t.pays).toEqual(countVerdicts(RUN_V5.answers, 'pays'))
    expect(x5.band).toEqual({ low: priceRange(RUN_V5.answers).low, high: priceRange(RUN_V5.answers).high })
    expect(RUN_V5.findings[0]).toContain(`${x5.t.tries.yes} of 36 would try`)

    const x6 = v6Tallies()
    expect(x6.B.tries).toEqual(countVerdicts(RUN_V6.answers, 'tries'))
    expect(x6.A).toEqual(tally(RUN_V6.answers.map((a) => a.control!)))
    expect(x6.ALT).toEqual(tally(RUN_V6.answers.map((a) => a.alt!)))
    for (const a of RUN_V6.answers) {
      const p = personasOf(RUN_V6).get(a.personaId)!
      expect([a.control!.tries, a.control!.pays]).toEqual([play(p, V6_A, 6).tries, play(p, V6_A, 6).pays])
      expect([a.alt!.tries, a.alt!.pays]).toEqual([play(p, V6_ALT, 6).tries, play(p, V6_ALT, 6).pays])
    }
    expect(RUN_V6.findings[0]).toContain(`(A) ${x6.A.tries.yes} of 60 would try`)
    expect(RUN_V6.findings[0]).toContain(`A ${expectedPlus(x6.A)}, B ${expectedPlus(x6.B)}`)

    const x7 = v7Tallies()
    expect(x7.B.tries).toEqual(countVerdicts(RUN_V7.answers, 'tries'))
    expect(x7.A).toEqual(tally(RUN_V7.answers.map((a) => a.control!)))
    for (const a of RUN_V7.answers) {
      const p = personasOf(RUN_V7).get(a.personaId)!
      expect([a.alt!.tries, a.alt!.pays]).toEqual([play(p, V7_ALT, 7).tries, play(p, V7_ALT, 7).pays])
    }
    expect(RUN_V7.findings[0]).toContain(`Would try ${x7.A.tries.yes} → ${x7.B.tries.yes} of 100`)
  })

  it('counts a change as moving someone only when their answer improved, and builds v7 on v6’s best', () => {
    for (const r of [RUN_V6, RUN_V7])
      for (const a of r.answers) {
        for (const c of a.movedBy ?? []) expect(Object.keys(r.changes ?? {}), c).toContain(c)
        const better = level(a.tries) > level(a.control!.tries) || level(a.pays) > level(a.control!.pays)
        if (!better) expect(a.movedBy, `${r.id} ${a.personaId}`).toEqual([])
      }
    const best = v6Best()
    for (const a of RUN_V7.answers) expect(a.control!.why.startsWith(best[(a.vars!.found as keyof typeof best)].name)).toBe(true)
  })

  it('labels every run as a prediction and never names the business owner', () => {
    for (const r of LATER) {
      expect(r.method).toMatch(/prediction/)
      expect(r.findings[0]).toMatch(/^Prediction/)
    }
    expect(JSON.stringify(LATER)).not.toMatch(/Eugene/)
  })
})
