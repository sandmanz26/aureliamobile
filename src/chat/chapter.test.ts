import { describe, expect, it } from 'vitest'
import { chapterSummary, chapterTitle } from './chapter'

describe('chapter card helpers', () => {
  it('reads the changes as one line', () => {
    expect(chapterSummary([{ title: 'Longer' }, { title: 'Increase yellow' }, { title: 'Less movement' }])).toBe('Longer, increase yellow and less movement')
    expect(chapterSummary([{ title: 'No melody' }])).toBe('No melody')
    expect(chapterSummary([])).toBe('')
  })
  it('names the chapter from the journey, else from the builds', () => {
    expect(chapterTitle(1, 0)).toBe('Chapter 2')
    expect(chapterTitle(null, 0)).toBe('Chapter 1')
    expect(chapterTitle(null, 2)).toBe('Chapter 3')
  })
})
