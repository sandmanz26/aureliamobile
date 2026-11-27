import { describe, expect, it } from 'vitest'
import { DEFAULT_GOAL, PRESETS, STAGES, goal, presetInputs } from './costModel'
import { populationCost } from './personaConditionV4'
import { CHANCE_CAP, CHANCE_FLOOR, calibrationChapters, chanceOf, chaptersToFlip, examplePeople, factors, sleepCohort, specFlat, trajectory } from './stateFlipFormulas'
import { whoHasIt } from './stateFlipSleep'

const tenMin = presetInputs(PRESETS.find((p) => p.id === 'balanced')!, 10)

describe('chapters to flip and chance it works', () => {
  it('matches the spec’s 42 chapters at the spec’s own assumptions', () => {
    expect(calibrationChapters()).toBe(STAGES[1].specChapters)
    expect(specFlat().chapters).toBe(42)
    expect(specFlat().chance).toBe(0.54)
  })

  it('is deterministic', () => {
    expect(trajectory(30)).toEqual(trajectory(30))
    expect(chaptersToFlip(30)).toBe(chaptersToFlip(30))
    const a = sleepCohort()
    expect(a.meanChance).toBe(sleepCohort().meanChance)
  })

  it('takes longer from a worse start and for a long-standing problem', () => {
    expect(chaptersToFlip(15)).toBeGreaterThan(chaptersToFlip(40))
    expect(chaptersToFlip(40)).toBeGreaterThan(chaptersToFlip(70))
    expect(chaptersToFlip(30, 1, 'long-standing')).toBeGreaterThan(chaptersToFlip(30, 1, 'acute'))
    expect(chaptersToFlip(25, 3)).toBeLessThan(chaptersToFlip(25, 1))
  })

  it('moves fastest in the mood stretch and slowest in the skill stretch', () => {
    const t = trajectory(25)
    const step = (from: number) => {
      const i = t.findIndex((s) => s >= from)
      return t[i + 1] - t[i]
    }
    expect(step(25)).toBeGreaterThan(step(50))
    expect(step(50)).toBeGreaterThan(step(70))
  })

  it('combines the factors into a capped chance', () => {
    const avg = chanceOf({ perWeek: 3, readiness: 0.5, severity: 'moderate', topHelper: 'journaling' })
    expect(avg.raw).toBeCloseTo(0.54 * 1 * 1 * 1 * 0.95, 6)
    const top = chanceOf({ stage: 3, perWeek: 7, readiness: 1, severity: 'mild', topHelper: 'sleep audio' })
    expect(top.chance).toBe(CHANCE_CAP)
    expect(top.capped).toBe(true)
    const low = chanceOf({ perWeek: 1, readiness: 0, severity: 'severe', topHelper: 'movement' })
    expect(low.chance).toBeGreaterThanOrEqual(CHANCE_FLOOR)
    expect(low.chance).toBeLessThan(avg.chance)
  })

  it('labels every factor', () => {
    for (const f of factors()) expect(['spec', 'assumption', 'computed']).toContain(f.label)
  })
})

describe('the sleep cohort over time', () => {
  const c = sleepCohort()

  it('follows exactly the risk-free sleep group', () => {
    const w = whoHasIt()
    expect(c.people.length).toBe(w.cohort.length)
    const ids = new Set(c.people.map((p) => p.id))
    for (const x of w.cohort) expect(ids.has(x.p.id)).toBe(true)
    expect(w.cohort.some((x) => x.p.riskFlag)).toBe(false)
  })

  it('adds up every chapter', () => {
    for (const r of c.rows) {
      expect(r.active + r.dropped + r.flipped + r.notHelped).toBeCloseTo(1, 9)
      for (const v of [r.active, r.dropped, r.flipped, r.reached.X, r.reached.Y, r.reached.Z]) {
        expect(v).toBeGreaterThanOrEqual(-1e-9)
        expect(v).toBeLessThanOrEqual(1 + 1e-9)
      }
      expect(r.reached.Z).toBeCloseTo(r.flipped, 9)
      expect(r.reached.Y).toBeGreaterThanOrEqual(r.reached.Z - 1e-9)
      expect(r.reached.X).toBeGreaterThanOrEqual(r.reached.Y - 1e-9)
      const mix = r.layerMix.mood + r.layerMix.habit + r.layerMix.skill
      if (r.active > 0) expect(mix).toBeCloseTo(1, 9)
    }
    for (let i = 1; i < c.rows.length; i++) {
      expect(c.rows[i].flipped).toBeGreaterThanOrEqual(c.rows[i - 1].flipped - 1e-12)
      expect(c.rows[i].dropped).toBeGreaterThanOrEqual(c.rows[i - 1].dropped - 1e-12)
    }
  })

  it('ends with the share flipped equal to the average chance it works', () => {
    const last = c.rows[c.rows.length - 1]
    expect(last.active).toBeCloseTo(0, 9)
    expect(last.flipped).toBeCloseTo(c.meanChance, 9)
    expect(last.dropped).toBeCloseTo(c.people.reduce((t, p) => t + 0.6 * (1 - p.chance.chance), 0) / c.people.length, 9)
    for (const p of c.people) expect(p.responder * p.survival).toBeCloseTo(p.chance.chance, 9)
  })

  it('starts everyone at their own score', () => {
    const mean = c.people.reduce((t, p) => t + p.start, 0) / c.people.length
    expect(c.rows[0].scoreActive).toBeCloseTo(mean, 6)
    expect(c.rows[0].scoreAll).toBeCloseTo(mean, 6)
  })

  it('gives one worked example per severity', () => {
    const ex = examplePeople(c)
    expect(ex.map((e) => e.severity)).toEqual(['mild', 'moderate', 'severe'])
    expect(ex[2].person.chapters).toBeGreaterThan(ex[0].person.chapters)
  })
})

describe('costModel is unchanged', () => {
  it('keeps the spec journey and the population cost as they were', () => {
    expect(([1, 2, 3] as const).map((stage) => goal({ ...DEFAULT_GOAL, stage }, tenMin).chapters)).toEqual([42, 32, 22])
    expect(goal(DEFAULT_GOAL, tenMin).flipProbability).toBe(0.54)
    expect(STAGES[1]).toMatchObject({ uplift: 1.43, success: 0.54, specChapters: 42 })
    const before = populationCost()
    sleepCohort()
    expect(populationCost()).toEqual(before)
  })
})
