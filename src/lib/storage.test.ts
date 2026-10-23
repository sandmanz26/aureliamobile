import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { readJson, readString, removeKey, writeJson, writeString } from './storage'

const shape = z.object({ n: z.number() })

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips validated JSON', () => {
    expect(writeJson('k', { n: 1 })).toBe(true)
    expect(readJson('k', shape, { n: 0 })).toEqual({ n: 1 })
  })

  it('falls back on missing, malformed or wrongly shaped values', () => {
    expect(readJson('missing', shape, { n: 0 })).toEqual({ n: 0 })
    localStorage.setItem('k', '{oops')
    expect(readJson('k', shape, { n: 0 })).toEqual({ n: 0 })
    localStorage.setItem('k', '{"n":"one"}')
    expect(readJson('k', shape, { n: 0 })).toEqual({ n: 0 })
  })

  it('reads, writes and removes strings', () => {
    writeString('s', 'v')
    expect(readString('s')).toBe('v')
    removeKey('s')
    expect(readString('s')).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    try {
      expect(readString('s')).toBeNull()
      expect(readJson('k', shape, { n: 9 })).toEqual({ n: 9 })
    } finally {
      Storage.prototype.getItem = original
    }
  })
})
