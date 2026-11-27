import { describe, expect, it } from 'vitest'
import { DIMENSIONS, ISSUES } from './personaConditionV4'
import { sleepCohort, summarise } from './stateFlipFormulas'
import { DOJO_LINKS, MILESTONES } from './stateFlipSleep'
import { AKP_SOURCE } from './generated/akpSource'
import { FLIP_DETAILS, WHO } from './stateFlipDetails'
import { DRAFTED, STATEFLIP_DIMENSIONS, flipNumbers, stateFlipById, stateFlipSummary, stateFlips } from './stateFlips'

const fs = stateFlips()

describe('the 125 StateFlips (U141)', () => {
  it('has 25 in each of the five dimensions, with unique ids', () => {
    expect(fs).toHaveLength(125)
    for (const d of DIMENSIONS) expect(fs.filter((f) => f.dimension === d)).toHaveLength(25)
    expect(new Set(fs.map((f) => f.id)).size).toBe(125)
    expect(STATEFLIP_DIMENSIONS.map((d) => d.code)).toEqual(['MEN', 'EMO', 'REL', 'SPI', 'PHY'])
  })

  it('reuses the 5 × 10 condition issues as 01–10 and adds 15 from the workbooks', () => {
    for (const d of DIMENSIONS) {
      const mine = fs.filter((f) => f.dimension === d)
      expect(mine.slice(0, 10).map((f) => f.issues[0])).toEqual(ISSUES[d].map((i) => i.id))
      for (const f of mine.slice(10)) expect(f.origin).toBe('workbook')
    }
    const s = stateFlipSummary()
    expect(s.fromIssues).toBe(50)
    expect(s.fromUN + s.fromDuals).toBe(75)
  })

  it('has no duplicates: titles are unique, and the 15 added per dimension repeat no good state', () => {
    expect(new Set(fs.map((f) => f.title.toLowerCase())).size).toBe(125)
    for (const d of DIMENSIONS) {
      const mine = fs.filter((f) => f.dimension === d)
      const base = new Set(mine.slice(0, 10).map((f) => f.good.toLowerCase()))
      const extra = mine.slice(10).map((f) => f.good.toLowerCase())
      expect(new Set(extra).size).toBe(15)
      for (const g of extra) expect(base.has(g), g).toBe(false)
    }
  })

  it('labels every source and links needs, duals, concepts and skills to rows that exist', () => {
    const un = new Set(AKP_SOURCE.un.map((u) => u.id))
    const duals = new Set(AKP_SOURCE.duals.map((d) => d.id))
    const skills = new Set(AKP_SOURCE.skills.map((s) => s.id))
    const concepts = new Set([...AKP_SOURCE.dojoC.map((c) => `DOJO_C ${c.id}`), ...AKP_SOURCE.dojoM.map((c) => `DOJO_M ${c.id}`)])
    for (const f of fs) {
      expect(f.source.startsWith('from ') || f.source === DRAFTED, f.id).toBe(true)
      expect(f.measure.source === DRAFTED || f.id === 'SF-PHY-01').toBe(true)
      if (f.need.kind === 'UN') expect(un, f.id).toContain(f.need.id)
      if (f.need.kind === 'dual') expect(duals, f.id).toContain(f.need.id)
      for (const d of f.dojo.duals) expect(duals, f.id).toContain(d)
      for (const s of f.dojo.skills) expect(skills, f.id).toContain(s)
      for (const c of f.dojo.concepts) expect(concepts, `${f.id} ${c}`).toContain(c)
      expect(f.dojo.skills.length, f.id).toBeGreaterThan(0)
      expect(f.milestones.map((m) => m.threshold)).toEqual([45, 65, 85])
      expect(f.measure.markers).toHaveLength(4)
    }
    expect(stateFlipSummary().linkedToUN).toBeGreaterThan(60)
  })

  it('keeps sleep exactly as stateFlipSleep built it', () => {
    const sleep = stateFlipById('SF-PHY-01')!
    expect(sleep.milestones.map((m) => m.title)).toEqual(MILESTONES.map((m) => m.title))
    for (const c of sleep.dojo.concepts) expect(DOJO_LINKS.map((l) => l.id)).toContain(c)
    const n = flipNumbers(sleep)
    const c = sleepCohort()
    expect([n.group, n.medianChapters, n.meanChance, n.costPerFlip]).toEqual([c.people.length, c.medianChapters, c.meanChance, c.costPerFlip])
  })

  it('generalises the sleep formulas: summarise() on the sleep group gives sleepCohort’s numbers', () => {
    const c = sleepCohort()
    const s = summarise(c.people)
    expect(s.medianChapters).toBe(c.medianChapters)
    expect(s.meanChance).toBeCloseTo(c.meanChance, 12)
    expect(s.chaptersPlayed).toBeCloseTo(c.chaptersPlayed, 12)
    expect(s.costPerFlip).toBeCloseTo(c.costPerFlip, 12)
  })

  it('computes a group, chapters, chance and cost for every StateFlip', () => {
    for (const f of fs) {
      const n = flipNumbers(f)
      expect(n.withIssue, f.id).toBeGreaterThan(0)
      expect(n.group, f.id).toBeLessThanOrEqual(n.withIssue + (f.id === 'SF-PHY-01' ? 1000 : 0))
      if (n.group) {
        expect(n.meanChance, f.id).toBeGreaterThan(0.05)
        expect(n.meanChance, f.id).toBeLessThan(0.9)
        expect(n.medianChapters, f.id).toBeGreaterThan(0)
        expect(n.costPerFlip, f.id).toBeGreaterThan(0)
      }
    }
  })
})

describe('per-StateFlip steps, check-ins and cohorts (U145)', () => {
  it('gives no two StateFlips the same milestone or check-in text', () => {
    const whats = fs.flatMap((f) => f.milestones.map((m) => m.what))
    expect(new Set(whats).size).toBe(whats.length)
    expect(new Set(fs.map((f) => f.measure.markers[0].question)).size).toBe(125)
    expect(new Set(fs.map((f) => f.measure.markers[3].question)).size).toBe(125)
  })

  it('has a written detail for every StateFlip but sleep, with cohort issues from its own dimension', () => {
    for (const f of fs) {
      if (f.id === 'SF-PHY-01') continue
      const d = FLIP_DETAILS[f.id]
      expect(d, f.id).toBeDefined()
      if (f.n > 10) {
        expect(d.issues?.length, f.id).toBeGreaterThan(0)
        for (const i of d.issues!) expect(ISSUES[f.dimension].map((x) => x.id), `${f.id} ${i}`).toContain(i)
        if (d.who) expect(WHO[d.who]).toBeDefined()
      }
    }
  })

  it('gives StateFlips 11–25 their own cohorts, so their numbers differ', () => {
    for (const d of DIMENSIONS) {
      const extra = fs.filter((f) => f.dimension === d && f.n > 10).map((f) => flipNumbers(f))
      expect(new Set(extra.map((n) => n.ids.join(','))).size, d).toBeGreaterThanOrEqual(13)
      for (const n of extra) expect(n.group).toBeGreaterThan(4)
    }
  })

  it('drops keyword needs that were wrong and fixes shifted labels', () => {
    expect(stateFlipById('SF-PHY-04')!.need.kind).toBe('none')
    expect(stateFlipById('SF-PHY-01')!.need.id).toBe('DI003')
  })
})
