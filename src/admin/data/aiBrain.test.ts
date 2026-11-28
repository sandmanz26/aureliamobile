import { describe, expect, it } from 'vitest'
import { CORE_FNS, brainMetrics, functionChance, mvpChance, prototypeMap, rankFeatures, stageChance, topThreeEffect, weeklyReport } from './aiBrain'
import { PARTS_A, runV8, v8Change, v8Split, v8Tallies } from './buyerRunV8'
import { ALL_RUN_DECLARATIONS, V8_CHANGE, V9_CHANGE } from './runChanges'
import { OWNER_ASKS, parseAsks, statusOf } from './ownerAsks'

describe('buyer agent test 8 (U147)', () => {
  it('plays set v4 without the 25 risk-flagged', () => {
    const r = runV8()
    expect(r.total).toBe(1000)
    expect(r.excluded).toBe(25)
    expect(r.answers).toHaveLength(975)
    expect(r.answers.every((a) => /^SF-[A-Z]{3}-\d{2}$/.test(a.flipId))).toBe(true)
  })
  it('never pays more surely than it tries, and tallies add up', () => {
    for (const a of runV8().answers) for (const s of [a.a, a.b]) {
      if (s.tries === 'no') expect(s.pays).toBe('no')
      if (s.tries === 'maybe') expect(s.pays).not.toBe('yes')
    }
    const x = v8Tallies()
    expect(x.tryB.yes + x.tryB.maybe + x.tryB.no).toBe(x.n)
    expect(x.dims.reduce((s, d) => s + d.n, 0)).toBe(x.n)
  })
  it('the split adds up to B − A', () => {
    const s = v8Split()
    const x = v8Tallies()
    expect(s[0].paid).toBe(x.paidA)
    expect(s[s.length - 1].paid).toBe(x.paidB)
    expect(s.reduce((t, r) => t + r.step, 0)).toBeCloseTo(x.paidB - x.paidA, 9)
    expect(PARTS_A.named).toBe(false)
  })
  it('declares its change', () => {
    expect(ALL_RUN_DECLARATIONS.at(-2)).toBe(V8_CHANGE)
    expect(ALL_RUN_DECLARATIONS.at(-1)).toBe(V9_CHANGE)
    expect(V8_CHANGE.previous).toBe(7)
    expect(v8Change().lines).toHaveLength(5)
  })
})

describe('AI brain (U147)', () => {
  it('stage chance is capped at 1 and respects direction', () => {
    expect(stageChance({ target: 0.5, current: 1, better: 'up' })).toBe(1)
    expect(stageChance({ target: 0.5, current: 0.25, better: 'up' })).toBe(0.5)
    expect(stageChance({ target: 1, current: 4, better: 'down' })).toBe(0.25)
  })
  it('chances are products of stage chances', () => {
    const m = brainMetrics()
    for (const f of CORE_FNS) {
      const p = functionChance(m, f)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
    expect(mvpChance(m)).toBeCloseTo(CORE_FNS.reduce((p, f) => p * functionChance(m, f), 1), 12)
  })
  it('ranks features by impact × confidence ÷ effort, and the top 3 never lower the chance', () => {
    const r = rankFeatures()
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score)
    const t = topThreeEffect()
    expect(t.mvpAfter).toBeGreaterThanOrEqual(t.mvpBefore)
  })
  it('maps the prototype numbers and writes a weekly report', () => {
    const p = prototypeMap()
    expect(p.filter((r) => r.fn.match(/^(Wellness|Brand|Product|Business)$/)).reduce((s, r) => s + (r.prototype ?? 0), 0)).toBe(10087)
    expect(weeklyReport()).toMatch(/Buyer agent test 9/)
  })
})

describe('your asks (U147)', () => {
  it('reads §0 of the brief, with no personal name', () => {
    expect(OWNER_ASKS.length).toBeGreaterThanOrEqual(40)
    expect(OWNER_ASKS[0].id).toBe('A1')
    for (const a of OWNER_ASKS) expect(`${a.ask} ${a.statusText}`).not.toMatch(/Eugene|Hussein/)
  })
  it('parses a row and its status', () => {
    const md = '## 0. List\n| # | Ask | From | Status |\n| --- | --- | --- | --- |\n| A9 | Cost it | row 1 | on staging and production |\n\n## 1. Next'
    expect(parseAsks(md)).toEqual([expect.objectContaining({ id: 'A9', status: 'live' })])
    expect(statusOf('waiting on him')).toBe('waiting')
    expect(statusOf('done')).toBe('done')
  })
})
