import { describe, expect, it } from 'vitest'
import { INITIAL_JOURNEY, JourneyMapSchema, addItem, counts, parseImport, removeItem, updateItem, updateStage } from './userJourney'

describe('user journey map', () => {
  it('starts with four stages, ten moments and three screens', () => {
    expect(JourneyMapSchema.safeParse(INITIAL_JOURNEY).success).toBe(true)
    expect(counts(INITIAL_JOURNEY)).toEqual({ stages: 4, moments: 10, screens: 3 })
  })

  it('adds, edits and removes an item without touching other stages', () => {
    let map = addItem(INITIAL_JOURNEY, 'share', 'screens', 'x1')
    expect(counts(map).screens).toBe(4)
    const added = map.stages[3].screens[0]
    map = updateItem(map, 'share', 'screens', { ...added, title: 'Recap card' })
    expect(map.stages[3].screens[0].title).toBe('Recap card')
    expect(map.stages[0]).toBe(INITIAL_JOURNEY.stages[0])
    map = removeItem(map, 'share', 'screens', 'x1')
    expect(counts(map).screens).toBe(3)
  })

  it('keeps a stage title when the new one is blank', () => {
    const map = updateStage(INITIAL_JOURNEY, 'reflect', { title: '  ', question: 'When?' })
    expect(map.stages[0].title).toBe('Reflect')
    expect(map.stages[0].question).toBe('When?')
  })

  it('imports its own export and the original blueprint format', () => {
    expect(parseImport(JSON.stringify(INITIAL_JOURNEY))).toEqual(INITIAL_JOURNEY)
    const legacy = {
      version: 2,
      stages: [{ id: 'reflect', title: 'Reflect', question: 'Q', color: '#000', scenes: [{ id: 'r1', title: 'A', image: 'assets/scene-01.webp' }], screens: [] }],
    }
    const map = parseImport(JSON.stringify(legacy))
    expect(map?.stages[0].moments[0]).toEqual({ id: 'r1', title: 'A', description: '', feature: '', image: '/admin/user-journey/scene-01.webp' })
    expect(parseImport('{"stages": []}')).toBeNull()
    expect(parseImport('not json')).toBeNull()
  })
})
