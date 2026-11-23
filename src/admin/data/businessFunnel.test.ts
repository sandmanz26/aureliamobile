import { describe, expect, it } from 'vitest'
import { STEPS, report } from './buyerSim'
import { DEFAULT_DECISIONS, DecisionsSchema, STAGES, biggestLeak, funnelMetrics, stageStatus, withNewDefaults } from './businessFunnel'
import { INITIAL_JOURNEY } from './userJourney'

describe('business funnel', () => {
  it('maps every buyer-agent step to exactly one stage, and every moment to the journey', () => {
    const steps = STAGES.flatMap((s) => s.steps)
    expect([...steps].sort()).toEqual([...STEPS].sort())
    const moments = new Set(INITIAL_JOURNEY.stages.flatMap((s) => s.moments.map((m) => m.id)))
    for (const s of STAGES) for (const m of s.moments) expect(moments.has(m), `${s.id} ${m}`).toBe(true)
  })

  it('gives every stage a metric, all as shares with a target', () => {
    const ms = funnelMetrics(3, 3, 6)
    for (const s of STAGES) expect(ms.some((m) => m.stage === s.id), s.id).toBe(true)
    for (const m of ms) {
      expect(m.agent).toBeGreaterThanOrEqual(0)
      expect(m.agent).toBeLessThanOrEqual(1)
      if (m.human !== null) expect(m.human).toBeLessThanOrEqual(1)
      expect(m.target).toBeGreaterThan(0)
      expect(m.humanNote.length).toBeGreaterThan(10)
    }
  })

  it('finds the stage furthest below target, and none when all are met', () => {
    const ms = funnelMetrics(3, 3, 6)
    const leak = biggestLeak(ms, {})
    expect(leak).not.toBeNull()
    const all = Object.fromEntries(ms.map((m) => [m.id, 0.0001]))
    expect(biggestLeak(ms, all)).toBeNull()
    expect(stageStatus(ms, all, 'entry').status).toBe('on-track')
  })

  it('agrees with the re-run: production v1 leaks at entry more than v3', () => {
    const v1 = funnelMetrics(3, 1, 6).find((m) => m.id === 'activation')!.agent
    const v3 = funnelMetrics(3, 3, 6).find((m) => m.id === 'activation')!.agent
    expect(v1).toBeLessThan(v3)
  })

  it('ships a valid decision log', () => {
    expect(DecisionsSchema.safeParse(DEFAULT_DECISIONS).success).toBe(true)
  })

  it('keeps d7 true to the re-run: nothing brings them back leads, 8 of 36', () => {
    const r = report(3, 3)
    expect(r.walks.length).toBe(36)
    expect(r.leaveReasons[0]).toEqual(['Nothing brings them back', 8])
  })

  it('adds new default decisions to a stored log without touching its edits', () => {
    const stored = DEFAULT_DECISIONS.filter((d) => d.id !== 'd7').map((d) => ({ ...d, status: 'decided' as const }))
    const merged = withNewDefaults(stored)
    expect(merged.find((d) => d.id === 'd7')).toBeTruthy()
    expect(merged.find((d) => d.id === 'd1')!.status).toBe('decided')
    expect(merged.length).toBe(DEFAULT_DECISIONS.length)
  })
})
