import { describe, expect, it } from 'vitest'
import { VALUE_KIND_TEXT, WORLDS, sleepProcess, triangle } from './therapeuticMap'

describe('therapeutic map', () => {
  it('gives each corner core targets, each labelled by kind and source', () => {
    const { corners, links } = triangle()
    expect(corners.map((c) => c.id)).toEqual(['product', 'business', 'wellness'])
    for (const c of corners) {
      expect(c.targets.length).toBeGreaterThan(0)
      for (const t of c.targets) {
        expect(VALUE_KIND_TEXT[t.kind]).toBeTruthy()
        expect(t.source).not.toBe('')
      }
    }
    expect(links).toHaveLength(3)
  })
  it('walks the sleep process from check-in to next chapter', () => {
    const p = sleepProcess()
    expect(p[0].id).toBe('pre')
    expect(p.at(-1)?.id).toBe('next')
    expect(p.find((x) => x.id === 'bites')?.inApp).toMatch(/Slow breath/)
  })
  it('has the five worlds with stage 1 above stage 3', () => {
    expect(WORLDS).toHaveLength(5)
    for (const w of WORLDS) expect(w.chapters[0]).toBeGreaterThan(w.chapters[1])
  })
})
