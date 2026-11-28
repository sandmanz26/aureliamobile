import { describe, expect, it } from 'vitest'
import { runV8 } from './buyerRunV8'
import { V9_PARTS_A, runV9, v9Change, v9Findings, v9Split, v9Tallies } from './buyerRunV9'
import { v9BrainImpact } from './aiBrain'
import { akpById } from './akps'
import { ALL_RUN_DECLARATIONS, V9_CHANGE } from './runChanges'

describe('buyer agent test 9 (U150)', () => {
  const r = runV9()

  it('plays the same 975 people as test 8, and A is test 8’s B person by person', () => {
    expect(r.answers).toHaveLength(975)
    expect(r.excluded).toBe(25)
    const v8 = new Map(runV8().answers.map((a) => [a.personaId, a]))
    for (const a of r.answers) {
      const b8 = v8.get(a.personaId)!.b
      expect([a.a.tries, a.a.pays, a.a.tryScore, a.a.payScore], a.personaId).toEqual([b8.tries, b8.pays, b8.tryScore, b8.payScore])
    }
    expect(V9_PARTS_A.matched).toBe(false)
  })

  it('shows everyone a first chapter assembled from catalogue AKPs, with their own length', () => {
    for (const a of r.answers) {
      expect(a.chapter.preview).toMatch(/^Your first chapter: .+, \d+ min\.$/)
      expect(a.chapter.pieces).toHaveLength(7)
      for (const q of a.chapter.pieces) expect(akpById(q.akp.id), q.akp.id).toBeDefined()
      expect(a.chapter.pieces.map((q) => q.akp.family)).toEqual(expect.arrayContaining(['script', 'voice', 'music', 'image']))
    }
    // Worry or panic rules out breath holds: nobody with that flag is given 4-7-8.
    for (const a of r.answers) if (a.chapter.pieces[0].matched.includes('no breath holds')) expect(a.chapter.pieces[0].akp.name).toBe('Extended exhale 4 in 6 out')
    expect(r.answers.some((a) => a.chapter.pieces[0].matched.includes('no breath holds'))).toBe(true)
    expect(v9Tallies().distinctPreviews).toBeGreaterThan(20)
  })

  it('never pays more surely than it tries; tallies and the split add up', () => {
    for (const a of r.answers) for (const s of [a.a, a.b]) {
      if (s.tries === 'no') expect(s.pays).toBe('no')
      if (s.tries === 'maybe') expect(s.pays).not.toBe('yes')
    }
    const x = v9Tallies()
    expect(x.payB.yes + x.payB.maybe + x.payB.no).toBe(x.n)
    expect(x.dims.reduce((t, d) => t + d.n, 0)).toBe(x.n)
    expect(x.archetypes.reduce((t, d) => t + d.n, 0)).toBe(x.n)
    const s = v9Split()
    expect(s[0].paid).toBe(x.paidA)
    expect(s.at(-1)!.paid).toBe(x.paidB)
    expect(s.reduce((t, q) => t + q.step, 0)).toBeCloseTo(x.paidB - x.paidA, 9)
  })

  it('declares its change and feeds the AI brain', () => {
    expect(ALL_RUN_DECLARATIONS.at(-1)).toBe(V9_CHANGE)
    expect(V9_CHANGE.previous).toBe(8)
    expect(v9Change().lines).toHaveLength(5)
    expect(v9Findings()).toHaveLength(5)
    const im = v9BrainImpact()
    expect(im.paidAfter).toBeGreaterThanOrEqual(im.paidBefore)
    expect(im.businessAfter).toBeGreaterThanOrEqual(im.businessBefore)
  })
})
