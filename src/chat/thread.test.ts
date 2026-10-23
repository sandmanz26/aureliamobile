import { describe, expect, it } from 'vitest'
import { nextVersionLabel, sessionNameOf } from './thread'

describe('version labels', () => {
  it('bumps the minor version', () => {
    expect(nextVersionLabel('Sleep meditation v1.3')).toBe('Sleep meditation v1.4')
  })

  it('bumps a major-only version', () => {
    expect(nextVersionLabel('Focus v2')).toBe('Focus v3')
  })

  it('starts at v2 when there is no version yet', () => {
    expect(nextVersionLabel('Evening calm')).toBe('Evening calm v2')
  })

  it('separates the name from the version, so renaming keeps the number', () => {
    expect(sessionNameOf('Sleep meditation v1.3')).toBe('Sleep meditation')
    expect(sessionNameOf('Evening calm')).toBe('Evening calm')
  })
})
