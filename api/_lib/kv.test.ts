import { describe, expect, it } from 'vitest'
import { parseBody, scopedKey } from './kv.js'

describe('scopedKey', () => {
  it('keeps the bare key for production (web_prod) and non-Vercel hosts', () => {
    expect(scopedKey('k', { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'web_prod' })).toBe('k')
    expect(scopedKey('k', {})).toBe('k')
  })

  it('scopes the staging project, which Vercel also calls production', () => {
    expect(scopedKey('k', { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'web_app' })).toBe('k:web_app')
  })

  it('scopes previews by branch, sanitised', () => {
    expect(scopedKey('k', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feat/new thing' })).toBe('k:feat-new-thing')
  })
})

describe('parseBody', () => {
  it('accepts objects and JSON strings', () => {
    expect(parseBody({ body: { a: 1 } })).toEqual({ a: 1 })
    expect(parseBody({ body: '{"a":1}' })).toEqual({ a: 1 })
  })

  it('returns undefined for malformed JSON, arrays and primitives (answered 400, not 500)', () => {
    expect(parseBody({ body: '{bad' })).toBeUndefined()
    expect(parseBody({ body: [1] })).toBeUndefined()
    expect(parseBody({ body: 'x' })).toBeUndefined()
  })
})
