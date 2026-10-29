import { describe, expect, it } from 'vitest'
import { PRODUCTION_VERSION, PRODUCTION_VERSIONS, UI_VERSIONS } from './versions'

describe('production versions', () => {
  it('maps every production version to a staging version that exists', () => {
    for (const v of PRODUCTION_VERSIONS) expect(UI_VERSIONS.some((u) => u.id === v.ui)).toBe(true)
  })

  it('offers the production default, numbered from 1', () => {
    expect(PRODUCTION_VERSIONS.map((v) => v.id)).toEqual([1, 2])
    expect(PRODUCTION_VERSIONS.some((v) => v.ui === PRODUCTION_VERSION)).toBe(true)
  })
})
