import { describe, expect, it } from 'vitest'
import { BUYER_RUNS, countVerdicts, priceRange, themeCounts } from './buyerRuns'
import { RUN_CHANGES, allRunChanges, declareRunChange, headlineDelta, isReproducible, offersOf, runChange, trendHeadline } from './runChanges'

describe('run changes: every run says what changed (U137)', () => {
  it('every run after the first has a change record against its predecessor', () => {
    const versions = BUYER_RUNS.map((r) => r.version)
    for (let i = 1; i < versions.length; i++) {
      const d = RUN_CHANGES.find((x) => x.version === versions[i])
      expect(d, `run v${versions[i]} has no change record: declare what changed (offer, panel, rules) in runChanges.ts`).toBeDefined()
      expect(d!.previous).toBe(versions[i - 1])
      for (const k of ['offer', 'panel', 'rules'] as const) expect(d![k].note.length).toBeGreaterThan(10)
      expect(offersOf(versions[i]).b.length).toBeGreaterThan(5)
    }
    expect(RUN_CHANGES.every((d) => versions.includes(d.version))).toBe(true)
  })

  it('declareRunChange refuses a run without a reason', () => {
    const ok = { version: 9, previous: 7, offers: { b: 'Something' }, offer: { changed: true, note: 'x' }, panel: { changed: false, note: 'y' }, rules: { changed: false, note: 'z' }, reproducible: true }
    expect(() => declareRunChange(ok)).not.toThrow()
    expect(() => declareRunChange({ ...ok, panel: { changed: true, note: ' ' } })).toThrow(/panel/)
    expect(() => declareRunChange({ ...ok, previous: 9 })).toThrow()
  })

  it('declares reproducible exactly when both runs replay by rules', () => {
    for (const d of RUN_CHANGES) expect(d.reproducible).toBe(isReproducible(d.previous) && isReproducible(d.version))
  })
})

describe('run changes: the numbers', () => {
  it('the headline values match what the results page shows', () => {
    for (const c of allRunChanges()) {
      const run = BUYER_RUNS.find((r) => r.version === c.version)!
      const n = run.answers.length
      const h = (id: string) => c.headlines.find((x) => x.id === id)!
      expect(h('tryB').curCount).toEqual({ k: countVerdicts(run.answers, 'tries').yes, n })
      expect(h('payB').curCount).toEqual({ k: countVerdicts(run.answers, 'pays').yes, n })
      expect(h('fairLow').cur).toBe(priceRange(run.answers).low)
      expect(h('fairHigh').cur).toBe(priceRange(run.answers).high)
      expect(h('objection').curCount!.k).toBe(themeCounts(run.answers)[0][1])
    }
  })

  it('the steps add up to each change', () => {
    for (const c of allRunChanges())
      for (const h of c.headlines) expect(h.steps.reduce((s, x) => s + x.value, 0)).toBeCloseTo(h.delta, 9)
  })

  it('replayed runs reproduce their published answers, so the split is measured', () => {
    for (const v of [6, 7]) {
      const c = runChange(v)!
      expect(c.headlines.every((h) => h.measured)).toBe(true)
      expect(c.headlines.find((h) => h.id === 'tryB')!.steps.map((s) => s.kind)).toEqual(['offer', 'panel', 'rules'])
    }
  })

  it('v6 → v7: the offer explains most of Would try B, and B is flagged as a different offer', () => {
    const h = headlineDelta(7, 'tryB')!
    expect(h.prevCount).toEqual({ k: 2, n: 60 })
    expect(h.curCount).toEqual({ k: 61, n: 100 })
    expect(h.likeForLike).toBe(false)
    expect(h.warning).toMatch(/Not like for like/)
    const offer = h.steps.find((s) => s.kind === 'offer')!.value
    expect(offer).toBeGreaterThan(0.4)
    expect(h.flips.some((f) => f.cause === 'offer')).toBe(true)
  })

  it('v6 → v7: the fair price fell through the country mix, not what people say they would pay', () => {
    const h = headlineDelta(7, 'fairHigh')!
    expect(h.prev).toBe(5.25)
    expect(h.cur).toBe(4.75)
    expect(h.steps.find((s) => s.kind === 'price-place')!.value).toBeLessThan(0)
    expect(h.steps.find((s) => s.kind === 'offer')!.value).toBe(0)
  })

  it('v5 → v6: A is the same offer, so its offer effect is zero', () => {
    const h = headlineDelta(6, 'tryA')!
    expect(h.likeForLike).toBe(true)
    expect(h.steps.find((s) => s.kind === 'offer')!.value).toBe(0)
  })

  it('v3 → v5: the same people, so the panel explains nothing', () => {
    const c = runChange(5)!
    expect(c.panel.samePeople).toBe(36)
    for (const h of c.headlines) expect(h.steps.find((s) => s.kind === 'panel')!.value).toBe(0)
    expect(c.headlines.find((h) => h.id === 'tryB')!.flips.every((f) => f.cause === 'same person')).toBe(true)
  })

  it('hand-written runs are labelled as not measured', () => {
    for (const v of [2, 3]) {
      const c = runChange(v)!
      expect(c.headlines.every((h) => !h.measured)).toBe(true)
      expect(c.summary.join(' ')).toMatch(/cannot be replayed/)
    }
  })

  it('the first run has nothing to compare with', () => {
    expect(runChange(1)).toBeNull()
    expect(headlineDelta(1, 'tryB')).toBeNull()
  })
})

describe('run changes: Report metrics trend rows', () => {
  it('maps a buyer trend row to its headline', () => {
    expect(trendHeadline('buyer-try-v7')).toEqual({ version: 7, previous: 6, id: 'tryB' })
    expect(trendHeadline('buyer-try-v6')).toEqual({ version: 6, previous: 5, id: 'tryA' })
    expect(trendHeadline('buyer-fair-v5')).toEqual({ version: 5, previous: 3, id: 'fairHigh' })
    expect(trendHeadline('buyer-try-v1')).toBeNull()
    expect(trendHeadline('cost-flip-1')).toBeNull()
  })
})
