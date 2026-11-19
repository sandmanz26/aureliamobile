import { describe, expect, it } from 'vitest'
import { isStaleChunkError } from './monitoring'

describe('stale build detection', () => {
  it('recognises a lazy chunk from a build that is gone', () => {
    expect(isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/AdminLayout-abc.js'))).toBe(true)
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleChunkError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isStaleChunkError(new Error('Unable to preload CSS for /assets/a.css'))).toBe(true)
  })
  it('leaves real errors alone', () => {
    expect(isStaleChunkError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false)
    expect(isStaleChunkError(undefined)).toBe(false)
  })
})
