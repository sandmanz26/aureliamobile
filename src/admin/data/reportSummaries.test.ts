import { describe, expect, it } from 'vitest'
import { funnelMetrics } from './businessFunnel'
import { v5Tallies } from './buyerRunV5'
import { v7Tallies } from './buyerRunV7'
import { goal, presetInputs, PRESETS, DEFAULT_GOAL } from './costModel'
import { plainText, unmarkedJargon } from './glossary'
import { v6Tallies } from './buyerRunV6'
import { breakEvenStage, buyerLevers, buyerSummary, buyerTrend, combinationSummary, costFunction, costSummary, stageStrip, uxFeedbackSummary } from './reportSummaries'
import { buildParticipants, winStatus } from './study'

const pct = (x: number) => `${Math.round(x * 100)}%`

describe('buyer summary', () => {
  it('derives its tiles from run v5 and v7', () => {
    const s = buyerSummary()
    const x5 = v5Tallies()
    const x7 = v7Tallies()
    expect(s.tiles[0].value).toBe(pct(x5.t.tries.yes / x5.t.n))
    expect(s.tiles[1].value).toBe(pct(x5.t.pays.yes / x5.t.n))
    expect(s.tiles[3].value).toBe(`${pct(x7.A.tries.yes / x7.A.n)} → ${pct(x7.B.tries.yes / x7.B.n)}`)
    expect(s.headline).toContain(`${x5.t.tries.yes} of ${x5.t.n}`)
    expect(s.tiles).toHaveLength(4)
  })
  it('has one trend point per report, v4 without try and pay', () => {
    const t = buyerTrend()
    expect(t.map((p) => p.name)).toEqual(['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'])
    expect(t.map((p) => p.label)).toEqual(t.map((_, i) => `Test ${i + 1}`))
    expect(t[3].tries).toBeNull()
    for (const p of t) for (const v of [p.tries, p.pays, p.sure30]) if (v !== null) expect(v).toBeGreaterThanOrEqual(0)
  })
  it('sorts levers by the share of answers they moved', () => {
    const l = buyerLevers()
    expect(l[0].share).toBeGreaterThanOrEqual(l[l.length - 1].share)
    expect(l.find((x) => x.theme === 'No account needed')?.moved).toBe(16)
  })
})

describe('combination summary', () => {
  it('marks exactly one stage as the biggest gap, and it is below target', () => {
    const strip = stageStrip(1)
    const gaps = strip.filter((s) => s.isGap)
    expect(gaps).toHaveLength(1)
    expect(gaps[0].status).toBe('below')
    expect(gaps[0].value).toBeLessThan(gaps[0].target)
  })
  it('counts stages on track from the funnel metrics', () => {
    const s = combinationSummary(1)
    const on = stageStrip(1).filter((x) => x.status === 'on-track').length
    expect(s.tiles[0].value).toBe(`${on} of 5`)
    expect(s.tiles[2].value).toBe(pct(funnelMetrics(3, 3, 1).find((m) => m.id === 'plus')!.agent))
    expect(s.actions.length).toBeGreaterThanOrEqual(1)
  })
})

describe('cost summary', () => {
  it('matches the cost model on the Balanced preset', () => {
    const f = costFunction(1)
    const g = goal(DEFAULT_GOAL, presetInputs(PRESETS[1], 10))
    expect(f.chapter).toBeCloseTo(g.costPerChapter)
    expect(f.costPerFlip).toBeCloseTo(g.costPerFlip)
    expect(f.costPerFlip).toBeCloseTo(f.journey / f.flip)
    expect(f.profitPerFlip).toBeCloseTo((f.revenue - f.journey) / f.flip)
  })
  it('finds the first profitable stage', () => {
    const be = breakEvenStage()
    if (be) expect(costFunction(be).profitPerFlip).toBeGreaterThanOrEqual(0)
    const s = costSummary()
    expect(plainText(s.tiles[3].value)).toBe(be ? `Stage ${be} of 3` : 'Never')
  })
})

const ux = () => uxFeedbackSummary(buildParticipants(3), 3)

describe('buyer summary by test (U129)', () => {
  it('splits the figures into test 5, test 6 and test 7, each with its own base', () => {
    const rows = buyerSummary().rows!
    const x5 = v5Tallies()
    const x6 = v6Tallies()
    const x7 = v7Tallies()
    expect(rows.map((r) => plainText(r.label))).toEqual([`Today’s app (test 5, ${x5.t.n} people)`, `Retreat vs free plan (test 6, ${x6.A.n} people)`, `Latest test (test 7, ${x7.B.n} people)`])
    expect(rows.map((r) => plainText(r.base))).toEqual([x5.t.n, x6.A.n, x7.B.n].map((n) => `${n} simulated people`))
    expect(rows[0].figures[0].value).toBe(pct(x5.t.tries.yes / x5.t.n))
    expect(rows[1].figures[0].value).toBe(pct(x6.A.tries.yes / x6.A.n))
    expect(rows[2].figures[0].value).toBe(`${pct(x7.A.tries.yes / x7.A.n)} → ${pct(x7.B.tries.yes / x7.B.n)}`)
  })
  it('names the test behind every tile', () => {
    for (const t of buyerSummary().tiles) expect(plainText(t.note ?? '')).toMatch(/^Test [57]/)
  })
})

describe('UX feedback summary (U129)', () => {
  it('counts wins from the study data and says it is sample data', () => {
    const ps = buildParticipants(3)
    const s = uxFeedbackSummary(ps, 3)
    const won = ps.filter((p) => winStatus(p) === 'won').length
    expect(s.tiles[0].value.startsWith(`${won} of `)).toBe(true)
    expect(s.tiles.every((t) => t.badge === 'sample')).toBe(true)
    expect(s.status).toBe('not-measured')
    expect(plainText(s.headline)).toMatch(/sample data/)
  })
})

describe('goal lines (U129)', () => {
  it('gives every report one goal sentence that says what it helps decide', () => {
    for (const s of [buyerSummary(), combinationSummary(1), costSummary(), ux()]) {
      expect(s.goal).toMatch(/^Helps .+ decide|^Helps .+ choose/)
      expect(plainText(s.goal).split(/(?<=\.)\s+/)).toHaveLength(1)
      expect(plainText(s.goal).split(/\s+/).length).toBeLessThanOrEqual(22)
      expect(s.detail.to.length).toBeGreaterThan(1)
    }
  })
})

it('gives every report a headline, 3–4 tiles and at least one next move', () => {
  for (const s of [buyerSummary(), combinationSummary(1), costSummary(), ux()]) {
    expect(s.headline.length).toBeGreaterThan(20)
    expect(s.tiles.length).toBeGreaterThanOrEqual(3)
    expect(s.tiles.length).toBeLessThanOrEqual(4)
    expect(s.actions.length).toBeGreaterThanOrEqual(1)
  }
})

describe('plain language (U128)', () => {
  const all = () => [buyerSummary(), combinationSummary(1), costSummary(), ux()]
  it('says what each report is', () => {
    for (const s of all()) expect(s.intro?.length ?? 0).toBeGreaterThan(30)
  })
  it('keeps glossary jargon out of the headline and tiles unless it is a marked term', () => {
    for (const s of all()) {
      const texts = [s.intro ?? '', s.goal, ...(s.rows ?? []).flatMap((r) => [r.label, r.base, ...r.figures.map((f) => f.label)]), s.question, s.headline, s.statusNote, s.sure ?? '', ...s.tiles.flatMap((t) => [t.label, t.value, t.delta ?? '', t.note ?? '']), ...s.actions.flatMap((a) => [a.text, a.linkLabel])]
      for (const t of texts) expect(unmarkedJargon(t), t).toEqual([])
    }
  })
  it('writes the headline and intro in sentences of 20 words or fewer', () => {
    for (const s of all())
      for (const t of [s.headline, s.intro ?? '', s.sure ?? ''])
        for (const sentence of plainText(t).split(/(?<=\.)\s+/)) expect(sentence.split(/\s+/).length, sentence).toBeLessThanOrEqual(20)
  })
  it('gives every number in the headline its base', () => {
    expect(plainText(buyerSummary().headline)).toMatch(/^In today’s app \(test 5\), \d+ of \d+ simulated people/)
    expect(plainText(combinationSummary(1).headline)).toMatch(/^\d of 5 steps/)
  })
})
