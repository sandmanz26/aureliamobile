import { describe, expect, it } from 'vitest'
import { INITIAL_TAGS } from './journeyTags'
import { parseAnyImport, toBundle } from './journeyBundle'
import { INITIAL_JOURNEY } from './userJourney'

describe('journey export bundle', () => {
  it('round-trips the map and the tags together', () => {
    expect(parseAnyImport(JSON.stringify(toBundle(INITIAL_JOURNEY, INITIAL_TAGS)))).toEqual({ journey: INITIAL_JOURNEY, tags: INITIAL_TAGS })
  })

  it('still reads the older single exports', () => {
    expect(parseAnyImport(JSON.stringify(INITIAL_JOURNEY))).toEqual({ journey: INITIAL_JOURNEY })
    expect(parseAnyImport(JSON.stringify(INITIAL_TAGS))).toEqual({ tags: INITIAL_TAGS })
    expect(parseAnyImport('nope')).toBeNull()
    expect(parseAnyImport('{"hello": 1}')).toBeNull()
  })
})
