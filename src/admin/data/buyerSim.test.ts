import { describe, expect, it } from 'vitest'
import { STEPS, agreement, report } from './buyerSim'

const pct = (x: number) => Math.round(x * 100)

describe('buyer agent re-run on the production versions', () => {
  it('walks every persona through every step, the same way every time', () => {
    for (const a of [1, 2, 3] as const)
      for (const d of [1, 2, 3] as const) {
        const r = report(a, d)
        expect(r.walks.length).toBe(a === 1 ? 10 : 36)
        for (const w of r.walks) {
          expect(w.steps.map((s) => s.id)).toEqual(STEPS)
          expect(w.d7).toBeLessThanOrEqual(w.d1)
          expect(w.d30).toBeLessThanOrEqual(w.d7)
          if (!w.activated) expect(w.tries).toBe('no')
        }
        expect(report(a, d)).toEqual(r)
        expect(r.metrics).toHaveLength(10)
      }
  })

  it('agrees with the hand-played runs, never the opposite way', () => {
    for (const x of agreement()) {
      expect(x.opposite).toBe(0)
      expect(x.exact / x.n).toBeGreaterThan(0.5)
    }
  })

  // The figures the written summaries quote (buyerRerunSummaries.ts).
  it('keeps the numbers the summaries quote', () => {
    const r = (a: 1 | 2 | 3, d: 1 | 2 | 3) => report(a, d)
    expect(pct(r(2, 1).activation)).toBe(53)
    expect(pct(r(3, 1).activation)).toBe(61)
    expect(pct(r(2, 2).activation)).toBe(81)
    expect(pct(r(3, 3).activation)).toBe(89)
    expect(pct(r(2, 3).d7)).toBe(10)
    expect(pct(r(2, 2).d7)).toBe(8)
    expect(pct(r(3, 2).completion)).toBe(63)
    expect(pct(r(3, 3).completion)).toBe(53)
    expect(r(3, 3).funnel.find((f) => f.step === 'onboarding')!.left).toBe(3)
    expect(pct(r(3, 3).ellis)).toBe(43)
    expect(pct(r(3, 2).ellis)).toBe(33)
    expect(r(2, 3).paysYes).toBe(2)
    expect(r(2, 1).funnel.find((f) => f.step === 'first-build')!.stalled).toBe(19)
    expect(r(3, 1).funnel.find((f) => f.step === 'sign-in')!.left).toBe(7)
  })
})
