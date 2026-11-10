import { describe, expect, it } from 'vitest'
import {
  COHORTS,
  STUDY,
  adherence,
  buildParticipants,
  completeness,
  conditionImprovement,
  dueCount,
  evaluateCriteria,
  followUpReasons,
  isConditionResponder,
  isWho5Responder,
  studyWeek,
  who5Change,
  who5Trajectory,
} from './study'
import type { Participant } from './study'

const base: Participant = {
  id: 'P99', cohort: 'sleep', enrolledOn: STUDY.startsOn, status: 'active', wearable: null,
  who5: [40, null, null, null, null], condition: [18, null, null], phq9Alert: false,
  sessionsByWeek: [], checkIns: 0, moodLift: null, lastActiveAt: '2026-10-13T00:00:00Z',
}

describe('feedback-group study', () => {
  it('has 30 places across the six cohorts', () => {
    expect(COHORTS.reduce((s, c) => s + c.size, 0)).toBe(STUDY.target)
  })

  it('counts study weeks from the start date and clamps to 0..8', () => {
    expect(studyWeek(Date.parse('2026-10-12T12:00:00Z'))).toBe(0)
    expect(studyWeek(Date.parse('2026-11-10T09:00:00Z'))).toBe(4)
    expect(studyWeek(Date.parse('2027-03-01T00:00:00Z'))).toBe(8)
  })

  it('needs a baseline and a later WHO-5 before calling a responder (≥ 10 points)', () => {
    expect(who5Change(base)).toBeNull()
    expect(isWho5Responder({ who5: [40, 50, null, null, null] })).toBe(true)
    expect(isWho5Responder({ who5: [40, 49, null, null, null] })).toBe(false)
    expect(who5Change({ who5: [null, 60, null, null, null] })).toBeNull()
  })

  it('reads the condition measure in its better direction', () => {
    // ISI: lower is better, a 6-point drop matters
    expect(conditionImprovement({ cohort: 'sleep', condition: [18, 12, null] })).toBe(6)
    expect(isConditionResponder({ cohort: 'sleep', condition: [18, 12, null] })).toBe(true)
    // PROMIS cognition: higher is better
    expect(conditionImprovement({ cohort: 'clarity', condition: [40, 43, null] })).toBe(3)
    expect(isConditionResponder({ cohort: 'clarity', condition: [40, 43, null] })).toBe(false)
  })

  it('measures adherence as weeks with 3+ sessions', () => {
    expect(adherence({ sessionsByWeek: [3, 1, 4, 5] }, 4)).toBe(0.75)
    expect(adherence({ sessionsByWeek: [] }, 0)).toBeNull()
  })

  it('knows what is due by each week', () => {
    expect(dueCount(0)).toBe(2) // WHO-5 + condition at baseline
    expect(dueCount(4)).toBe(5) // WHO-5 ×3 + condition ×2
    expect(dueCount(8)).toBe(8)
    expect(completeness({ who5: [40, null, 45, null, null], condition: [18, 15, null] }, 4)).toBe(0.8)
  })

  it('flags people who need a human follow-up', () => {
    expect(followUpReasons({ ...base, who5: [40, 26, null, null, null] })).toEqual(['WHO-5 26'])
    expect(followUpReasons({ ...base, phq9Alert: true })).toEqual(['PHQ-9 item 9'])
  })

  it('builds a stable sample with nothing collected beyond the current week', () => {
    const a = buildParticipants(4)
    expect(a).toEqual(buildParticipants(4))
    expect(a).toHaveLength(30)
    for (const p of a) {
      expect(p.who5.slice(3).every((v) => v === null)).toBe(true) // weeks 6, 8 not yet
      expect(p.condition[2]).toBeNull() // week 8 not yet
      expect(p.sessionsByWeek).toHaveLength(4)
    }
  })

  it('evaluates every success criterion and the trajectory', () => {
    const ps = buildParticipants(4)
    const criteria = evaluateCriteria(ps, 4)
    expect(criteria.map((c) => c.id)).toEqual(['who5', 'condition', 'retention', 'adherence', 'data', 'safety'])
    expect(who5Trajectory(ps, 4)).toHaveLength(3)
    expect(evaluateCriteria(buildParticipants(0), 0)[0].status).toBe('not_yet')
    // outcome lines are not judged before week 8
    expect(criteria[0].status).toBe('not_yet')
    expect(['on_track', 'at_risk']).toContain(evaluateCriteria(buildParticipants(8), 8)[0].status)
  })
})
