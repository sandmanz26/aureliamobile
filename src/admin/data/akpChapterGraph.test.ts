import { describe, expect, it } from 'vitest'
import { CHAPTER_GOAL, CHAPTER_LINKS, CHAPTER_MODALITIES, CHAPTER_PHASES, chapterNodes } from './akpChapterGraph'
import { akpById } from './akps'
import { DRAFTED } from './stateFlips'

describe('sleep chapter 1 as AKPs (U145)', () => {
  const nodes = chapterNodes()
  const ids = new Set(nodes.map((n) => n.id))

  it('has 20 strategy AKPs across script, music, voice and image, and 30 links', () => {
    expect(nodes).toHaveLength(20)
    expect(ids.size).toBe(20)
    for (const m of CHAPTER_MODALITIES) expect(nodes.some((n) => n.modality === m), m).toBe(true)
    expect(CHAPTER_LINKS).toHaveLength(30)
  })

  it('links only nodes that exist, and every node is linked', () => {
    for (const l of CHAPTER_LINKS) {
      expect(ids.has(l.from), l.from).toBe(true)
      expect(ids.has(l.to) || l.to === CHAPTER_GOAL.id, l.to).toBe(true)
    }
    for (const n of nodes) expect(CHAPTER_LINKS.some((l) => l.from === n.id || l.to === n.id), n.id).toBe(true)
    expect(akpById(CHAPTER_GOAL.id)).toBeDefined()
  })

  it('uses catalogue AKPs where they exist and labels the drafted voice ones', () => {
    for (const n of nodes) {
      if (n.inCatalogue) expect(akpById(n.id), n.id).toBeDefined()
      else expect(n.source).toBe(DRAFTED)
    }
  })

  it('gives every node a phase it drives and phase shares summing to 1', () => {
    const driven = new Set(CHAPTER_PHASES.flatMap((p) => p.drivers))
    for (const n of nodes) expect(driven.has(n.id), n.id).toBe(true)
    expect(CHAPTER_PHASES.reduce((t, p) => t + p.share, 0)).toBeCloseTo(1, 10)
  })
})
