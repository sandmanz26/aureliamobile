import { describe, expect, it } from 'vitest'
import { daysBetween, entriesFor, lastContact, overdueContacts, sampleLog, type LogEntry } from './coachingLog'
import { buildParticipants } from './study'

const e = (participantId: string, date: string, id = `${participantId}-${date}`): LogEntry => ({
  id, participantId, date, channel: 'Message', feeling: null, note: 'n', nextStep: '', escalate: false,
})

describe('coaching log', () => {
  it('counts whole days', () => {
    expect(daysBetween('2026-11-09', '2026-11-11')).toBe(2)
  })

  it('lists one participant newest first', () => {
    const log = [e('P01', '2026-11-08'), e('P02', '2026-11-10'), e('P01', '2026-11-10')]
    expect(entriesFor(log, 'P01').map((x) => x.date)).toEqual(['2026-11-10', '2026-11-08'])
    expect(lastContact(log).get('P01')).toBe('2026-11-10')
  })

  it('flags live participants not reached for two days or ever', () => {
    const ps = buildParticipants(4).slice(0, 3).map((p) => ({ ...p, status: 'active' as const }))
    const log = [e(ps[0].id, '2026-11-11'), e(ps[1].id, '2026-11-08')]
    const due = overdueContacts(ps, log, '2026-11-11')
    expect(due.map((d) => [d.participantId, d.days])).toEqual([[ps[1].id, 3], [ps[2].id, null]])
  })

  it('makes deterministic sample lines, marked sample, for live participants only', () => {
    const ps = buildParticipants(4)
    const a = sampleLog(ps, '2026-11-11')
    expect(a).toEqual(sampleLog(ps, '2026-11-11'))
    expect(a.every((x) => x.sample)).toBe(true)
    const live = new Set(ps.filter((p) => p.status === 'active' || p.status === 'paused').map((p) => p.id))
    expect(a.every((x) => live.has(x.participantId))).toBe(true)
    // Some people are deliberately overdue, so the log shows that case.
    expect(overdueContacts(ps, a, '2026-11-11').length).toBeGreaterThan(0)
  })
})
