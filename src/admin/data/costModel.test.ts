import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GOAL, GRAPH_EDGES, GRAPH_NODES, LENGTHS, MEASURED_2025, MEDIA, PRESETS, SUPPLIERS,
  chapterCost, downstream, goal, presetInputs, total, type Stage,
} from './costModel'

const balanced = PRESETS.find((p) => p.id === 'balanced')!
const tenMin = presetInputs(balanced, 10)

describe('cost model', () => {
  it('gives every supplier a price, a label, a source and pros and cons', () => {
    for (const s of SUPPLIERS) {
      expect(s.price, s.id).not.toBe('')
      expect(s.sourceUrl, s.id).toMatch(/^(https:\/\/|\/wiki\/)/)
      expect(s.pros.length, s.id).toBeGreaterThan(0)
      expect(s.cons.length, s.id).toBeGreaterThan(0)
    }
    for (const m of MEDIA) expect(SUPPLIERS.filter((s) => s.media === m).length, m).toBeGreaterThanOrEqual(2)
  })

  it('prices a 10-minute chapter as the wiki notes do: Haiku about $0.001, tts-1 about $0.10', () => {
    const c = chapterCost({ minutes: 10, wordsPerMinute: 105, models: { script: 'haiku-5.5', voice: 'tts-1', music: 'music-library', image: 'flux-dev', video: 'none-video' }, personalisation: 'full', cacheHit: 1 })
    expect(c.script).toBeCloseTo(0.0012, 3)
    expect(c.voice).toBeCloseTo(0.0945, 3)
    expect(c.music + c.image + c.video).toBe(0)
  })

  it('orders the presets Lean < Balanced < Premium at every length, and longer costs more', () => {
    for (const m of LENGTHS) {
      const [l, b, p] = PRESETS.map((x) => total(chapterCost(presetInputs(x, m))))
      expect(l).toBeLessThan(b)
      expect(b).toBeLessThan(p)
    }
    expect(total(chapterCost(presetInputs(balanced, 3)))).toBeLessThan(total(chapterCost(tenMin)))
  })

  it('keeps the 2025 measured baseline adding up to €40.27', () => {
    expect(MEDIA.reduce((s, m) => s + MEASURED_2025.byMedia[m], 0)).toBeCloseTo(40.28, 1)
    for (const c of MEASURED_2025.campaigns) expect(c.script + c.voice + c.image + c.music + c.video).toBeCloseTo(c.total, 1)
  })

  it('reproduces the spec’s chapters to flip at the default (25 → 85, 10 min, fully personal)', () => {
    expect(([1, 2, 3] as Stage[]).map((stage) => goal({ ...DEFAULT_GOAL, stage }, tenMin).chapters)).toEqual([42, 32, 22])
  })

  it('makes cost per flip fall and profit per flip rise across the stages', () => {
    const r = ([1, 2, 3] as Stage[]).map((stage) => goal({ ...DEFAULT_GOAL, stage }, tenMin))
    expect(r[0].costPerFlip).toBeGreaterThan(r[1].costPerFlip)
    expect(r[1].costPerFlip).toBeGreaterThan(r[2].costPerFlip)
    expect(r[2].profitPerFlip).toBeGreaterThan(r[0].profitPerFlip)
  })

  it('needs more chapters from a worse start and fewer chapters a week lowers the flip chance', () => {
    const severe = goal({ ...DEFAULT_GOAL, baseline: 10 }, tenMin)
    const mild = goal({ ...DEFAULT_GOAL, baseline: 60 }, tenMin)
    expect(severe.chapters).toBeGreaterThan(goal(DEFAULT_GOAL, tenMin).chapters)
    expect(mild.chapters).toBeLessThan(goal(DEFAULT_GOAL, tenMin).chapters)
    expect(goal({ ...DEFAULT_GOAL, chaptersPerWeek: 1 }, tenMin).flipProbability).toBeLessThan(goal(DEFAULT_GOAL, tenMin).flipProbability)
  })

  it('connects every graph edge to known nodes, and a model change reaches profit but not uplift', () => {
    const ids = new Set(GRAPH_NODES.map((n) => n.id))
    for (const [a, b] of GRAPH_EDGES) expect(ids.has(a) && ids.has(b), `${a}→${b}`).toBe(true)
    const d = downstream('models')
    expect(d.has('profit')).toBe(true)
    expect(d.has('uplift')).toBe(false)
  })
})
