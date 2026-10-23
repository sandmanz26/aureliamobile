import { describe, expect, it } from 'vitest'
import type { Annotation } from './format'
import { parseAnnotations, serializeAnnotations } from './format'

const note = (over: Partial<Annotation> = {}): Annotation => ({
  id: 'abc123',
  page: '/chat',
  x: 42.5,
  y: 61.2,
  vw: 390,
  vh: 844,
  scrollY: 240,
  ui: 2,
  text: 'Bubble sits too close\nto the composer.',
  createdAt: '2026-10-01T07:01:12.000Z',
  updatedAt: '2026-10-01T07:02:40.000Z',
  ...over,
})

describe('annotation .txt format', () => {
  it('round-trips losslessly', () => {
    const list = [note(), note({ id: 'def456', page: '/home', text: 'Second' })]
    expect(parseAnnotations(serializeAnnotations(list))).toEqual(expect.arrayContaining(list))
  })

  it('escapes note lines that look like a block header', () => {
    const tricky = note({ text: '--- #2 not a header\n\\ starts with a backslash' })
    const [back] = parseAnnotations(serializeAnnotations([tricky]))
    expect(back.text).toBe(tricky.text)
  })

  it('reads a file saved again with Windows line endings', () => {
    const crlf = serializeAnnotations([note()]).replace(/\n/g, '\r\n')
    expect(parseAnnotations(crlf)[0].text).toBe(note().text)
  })

  it('returns nothing for a file that is not an export', () => {
    expect(parseAnnotations('hello world')).toEqual([])
  })
})
