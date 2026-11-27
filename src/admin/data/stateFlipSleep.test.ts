import { describe, expect, it } from 'vitest'
import {
  BAD_NIGHT, BAD_SCORE, DOJO_LINKS, GOOD_NIGHT, GOOD_SCORE, KEY_TERMS, MILESTONES, layerAt, milestoneOf, severityOf, sleepScore, whoHasIt,
} from './stateFlipSleep'

describe('the sleep StateFlip', () => {
  it('scores the concrete bad and good nights at 25 and 85', () => {
    expect(sleepScore(BAD_NIGHT)).toBe(BAD_SCORE)
    expect(sleepScore(GOOD_NIGHT)).toBe(GOOD_SCORE)
    expect(sleepScore({ latency: 5, wakings: 0, hours: 8, energy: 5 })).toBeLessThanOrEqual(100)
    expect(sleepScore({ latency: 120, wakings: 6, hours: 3, energy: 1 })).toBeGreaterThanOrEqual(0)
  })

  it('orders X < Y < Z, ending at the good state', () => {
    expect(MILESTONES.map((m) => m.threshold)).toEqual([45, 65, 85])
    expect(milestoneOf(44)).toBeNull()
    expect(milestoneOf(45)).toBe('X')
    expect(milestoneOf(85)).toBe('Z')
    expect([layerAt(30), layerAt(50), layerAt(70)]).toEqual(['mood', 'habit', 'skill'])
    expect(severityOf(39)).toBe('severe')
    expect(severityOf(64)).toBe('moderate')
  })

  it('cites every milestone’s DOJO ids from the links list', () => {
    const ids = new Set(DOJO_LINKS.map((d) => d.id))
    for (const m of MILESTONES) for (const d of m.dojo) expect(ids, d).toContain(d)
    expect(new Set(DOJO_LINKS.map((d) => d.layer))).toEqual(new Set(['mood', 'habit', 'skill']))
  })

  it('finds the sleep group in the v4 personas and leaves the risk-flagged out', () => {
    const w = whoHasIt()
    expect(w.cohort.length).toBe(w.sleepNeed - w.sleepNeedRisk)
    expect(w.cohort.length).toBeGreaterThan(30)
    expect(w.sleepNeedRisk).toBeGreaterThan(0)
    for (const x of w.cohort) {
      expect(x.c.excluded).toBe(false)
      expect(x.p.riskFlag).toBe(false)
      expect(x.score).toBeLessThan(GOOD_SCORE)
    }
    expect(w.bySeverity.severe + w.bySeverity.moderate + w.bySeverity.mild).toBe(w.cohort.length)
    expect(Object.values(w.byIssue).reduce((a, b) => a + b, 0)).toBe(w.cohort.length)
  })

  it('defines every key term the brief asks for', () => {
    const names = KEY_TERMS.map((k) => k.term)
    for (const t of ['Dimension', 'StateFlip', 'Universal need', 'DOJO', 'AKP', 'Chapter', 'Session', 'Check-in', 'Chance it works', 'Cost per flip', 'Causal AI stage']) expect(names).toContain(t)
  })
})
