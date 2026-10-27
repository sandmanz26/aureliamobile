import { describe, expect, it } from 'vitest'
import { SIGNAL_SOURCES, connectionsForWearable, sourcesInGroup } from './signals'

describe('wearable-first data sources (v5, U053)', () => {
  it('switches on only the wearable chosen in onboarding', () => {
    const on = Object.entries(connectionsForWearable('whoop')).filter(([, v]) => v).map(([k]) => k)
    expect(on).toEqual(['whoop'])
    expect(Object.values(connectionsForWearable('none')).every((v) => !v)).toBe(true)
    expect(Object.values(connectionsForWearable(undefined)).every((v) => !v)).toBe(true)
  })

  it('lists Whoop in v5 only, leaving v1–v4 and admin unchanged', () => {
    expect(SIGNAL_SOURCES.some((s) => s.id === 'whoop')).toBe(false)
    expect(sourcesInGroup('Biological').map((s) => s.id)).not.toContain('whoop')
    expect(sourcesInGroup('Biological', true).map((s) => s.id)).toContain('whoop')
  })
})
