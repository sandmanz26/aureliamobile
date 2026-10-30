import { describe, expect, it } from 'vitest'
import { USERS } from './mock'
import { buildOutcomes, needsFollowUp, outcomeOf, summarise, who5Change } from './outcomes'

describe('well-being outcomes', () => {
  it('needs two WHO-5 assessments before it calls a direction', () => {
    expect(outcomeOf({ who5: [] })).toBe('too early')
    expect(outcomeOf({ who5: [40] })).toBe('too early')
    expect(who5Change({ who5: [40] })).toBeNull()
  })

  it('uses a 10-point change as meaningful', () => {
    expect(outcomeOf({ who5: [40, 50] })).toBe('improved')
    expect(outcomeOf({ who5: [40, 49] })).toBe('steady')
    expect(outcomeOf({ who5: [40, 30] })).toBe('declined')
  })

  it('flags a latest score of 28 or below for follow-up', () => {
    expect(needsFollowUp({ who5: [60, 28] })).toBe(true)
    expect(needsFollowUp({ who5: [20, 29] })).toBe(false)
    expect(needsFollowUp({ who5: [] })).toBe(false)
  })

  it('summarises only measured users into the average', () => {
    const s = summarise([
      { userId: 'a', name: 'A', goal: 'Focus', chapters: 20, who5: [40, 60], moodStart: 3, moodLatest: 4, wearable: null, restingHrStart: null, restingHrLatest: null },
      { userId: 'b', name: 'B', goal: 'Focus', chapters: 2, who5: [30], moodStart: 3, moodLatest: 3, wearable: null, restingHrStart: null, restingHrLatest: null },
    ])
    expect(s).toMatchObject({ measured: 1, improved: 1, tooEarly: 1, averageChange: 20, followUp: 0 })
  })

  it('builds stable sample data for member accounts only', () => {
    const a = buildOutcomes(USERS)
    expect(a).toEqual(buildOutcomes(USERS))
    expect(a.length).toBe(USERS.filter((u) => u.role === 'member').length)
    for (const o of a) for (const score of o.who5) expect(score).toBeGreaterThanOrEqual(0)
  })
})
