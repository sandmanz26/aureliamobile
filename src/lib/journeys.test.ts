import { describe, expect, it } from 'vitest'
import { STORIES, findStory, storyDate } from './journeys'
import { findSession } from './sessions'

describe('personal journeys', () => {
  it('every story ends on a session that exists', () => {
    for (const s of STORIES) {
      expect(findSession(s.session), s.slug).toBeTruthy()
      for (const b of s.blocks) if (b.kind === 'session') expect(findSession(b.slug), s.slug).toBeTruthy()
    }
  })
  it('finds by slug and formats the date', () => {
    expect(findStory('i-needed-a-pause')?.author).toBe('Olivia Bennett')
    expect(findStory('nope')).toBeUndefined()
    expect(storyDate('2026-11-03')).toBe('3 November 2026')
  })
})
