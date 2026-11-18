import { describe, expect, it } from 'vitest'
import { INITIAL_JOURNEY } from './userJourney'
import { DEFAULT_GROUPS, INITIAL_TAGS, JourneyTagsSchema, coverage, missingGroups, removeGroup, saveGroup, slug, taggedMoments, toggleTag } from './journeyTags'

describe('journey tags', () => {
  const moments = taggedMoments(INITIAL_JOURNEY, INITIAL_TAGS)

  it('tags every original moment in every group, within the group rules', () => {
    expect(JourneyTagsSchema.safeParse(INITIAL_TAGS).success).toBe(true)
    expect(moments).toHaveLength(10)
    for (const m of moments) {
      expect(missingGroups(DEFAULT_GROUPS, m.assignment.tags)).toEqual([])
      for (const grp of DEFAULT_GROUPS) {
        const inGroup = m.assignment.tags.filter((t) => t.startsWith(`${grp.id}:`))
        if (!grp.multi) expect(inGroup.length, `${m.id} ${grp.id}`).toBe(1)
        for (const t of inGroup) expect(grp.tags.some((x) => `${grp.id}:${x.id}` === t), t).toBe(true)
      }
    }
  })

  it('treats a moment with no assignment as untagged and proposed', () => {
    const journey = { ...INITIAL_JOURNEY, stages: [{ ...INITIAL_JOURNEY.stages[0], moments: [{ id: 'new', title: 'New', description: '', feature: '', image: '' }] }] }
    expect(taggedMoments(journey, INITIAL_TAGS)[0].assignment).toEqual({ tags: [], status: 'proposed', note: '' })
  })

  it('keeps single-choice groups to one tag', () => {
    const time = DEFAULT_GROUPS[0]
    expect(toggleTag(['time:morning', 'need:checkin'], time, 'night')).toEqual(['need:checkin', 'time:night'])
    expect(toggleTag(['time:night'], time, 'night')).toEqual([])
    const need = DEFAULT_GROUPS.find((x) => x.id === 'need')!
    expect(toggleTag(['need:checkin'], need, 'express')).toEqual(['need:checkin', 'need:express'])
  })

  it('shows gaps in coverage', () => {
    const time = coverage(DEFAULT_GROUPS[0], moments)
    expect(time.find((r) => r.tag.id === 'evening')?.moments).toEqual([])
    expect(time.find((r) => r.tag.id === 'night')?.moments.map((m) => m.id)).toEqual(['e5'])
  })

  it('drops removed tags and groups from every moment', () => {
    const time = DEFAULT_GROUPS[0]
    const next = saveGroup(INITIAL_TAGS, { ...time, tags: time.tags.filter((t) => t.id !== 'night') })
    expect(next.assignments.e5.tags.some((t) => t.startsWith('time:'))).toBe(false)
    const without = removeGroup(INITIAL_TAGS, 'readiness')
    expect(Object.values(without.assignments).every((x) => !x.tags.some((t) => t.startsWith('readiness:')))).toBe(true)
  })

  it('makes unique ids from labels', () => {
    expect(slug('Before a meeting!', [])).toBe('before-a-meeting')
    expect(slug('Home', ['home'])).toBe('home-2')
  })
})
