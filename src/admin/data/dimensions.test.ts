import { describe, expect, it } from 'vitest'
import { DIMENSION_IDS, WORLD_TO_DIMENSION, worldMappingLine } from './dimensions'
import { WORLDS as HEALING_WORLDS } from './healingMap'
import { DIMENSIONS } from './personaConditionV4'
import { STATEFLIP_DIMENSIONS } from './stateFlips'
import { WORLDS as THERAPEUTIC_WORLDS } from './therapeuticMap'

describe('one shared list of five dimensions (U145)', () => {
  it('is the list personas and StateFlips use', () => {
    expect(DIMENSIONS).toEqual(DIMENSION_IDS)
    expect(STATEFLIP_DIMENSIONS.map((d) => d.id)).toEqual(DIMENSION_IDS)
  })

  it('maps every Healing Map and Therapeutic map world onto exactly the five', () => {
    for (const worlds of [HEALING_WORLDS, THERAPEUTIC_WORLDS]) {
      expect(new Set(worlds.map((w) => WORLD_TO_DIMENSION[w.id])).size).toBe(5)
    }
    expect(worldMappingLine([{ id: 'sleep', label: 'Sleep' }])).toBe('Sleep → Physical')
  })
})
