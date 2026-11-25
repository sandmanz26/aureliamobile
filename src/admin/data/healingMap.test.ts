import { describe, expect, it } from 'vitest'
import { LEARNED_FROM_REAL_RESULTS, LINKS, MIN_PEOPLE_FOR_LEARNED, NODES, PROVENANCE_TEXT, linkCounts, node, pathsThrough, visibleLinks } from './healingMap'

describe('healing map', () => {
  it('gives every link a provenance label', () => {
    for (const l of LINKS) expect(PROVENANCE_TEXT[l.provenance], `${l.from}>${l.to}`).toBeTruthy()
  })
  it('gives every research-backed link a citation and no invented strength', () => {
    for (const l of LINKS.filter((x) => x.provenance === 'research')) {
      expect(l.citation?.text, `${l.from}>${l.to}`).toBeTruthy()
      expect(l.citation?.url).toMatch(/^https:\/\//)
      expect(l.strength).toBeUndefined()
    }
  })
  it('claims no learned link while there are no real results', () => {
    expect(LEARNED_FROM_REAL_RESULTS).toBe(false)
    expect(LINKS.filter((l) => l.provenance === 'learned')).toEqual([])
  })
  it('would require enough people behind any learned link', () => {
    for (const l of LINKS.filter((x) => x.provenance === 'learned')) expect(l.people ?? 0).toBeGreaterThanOrEqual(MIN_PEOPLE_FOR_LEARNED)
  })
  it('links only bad → block → good, between nodes that exist', () => {
    for (const l of LINKS) {
      const pair = `${node(l.from)?.ring}>${node(l.to)?.ring}`
      expect(['bad>block', 'block>good'], `${l.from}>${l.to}`).toContain(pair)
    }
    expect(new Set(NODES.map((n) => n.id)).size).toBe(NODES.length)
    for (const n of NODES) expect(LINKS.some((l) => l.from === n.id || l.to === n.id), n.id).toBe(true)
  })
  it('keeps sample strengths in 0–1 and has both kinds of link', () => {
    for (const l of LINKS.filter((x) => x.provenance === 'sample')) {
      expect(l.strength).toBeGreaterThan(0)
      expect(l.strength).toBeLessThanOrEqual(1)
    }
    const c = linkCounts()
    expect(c.sample).toBeGreaterThan(0)
    expect(c.research).toBeGreaterThan(0)
  })
  it('filters by world and to research-backed links', () => {
    expect(visibleLinks({ world: 'all', researchOnly: true }).every((l) => l.provenance === 'research')).toBe(true)
    expect(visibleLinks({ world: 'sleep', researchOnly: false }).length).toBeLessThan(LINKS.length)
    expect(pathsThrough('poor-sleep', LINKS).some((l) => l.to === 'deep-sleep')).toBe(true)
  })
  it('uses wellness words, never cure or treatment', () => {
    const text = JSON.stringify({ NODES, PROVENANCE_TEXT })
    expect(text).not.toMatch(/\b(cure|cures|treat|treatment|diagnos|disorder|insomnia)/i)
  })
})
