import { describe, expect, it } from 'vitest'
import { DEFAULTS } from '../lib/onboarding'
import { FALLBACK, replyTo } from '../lib/replies'
import { deckFor, inferFromWords, suggestionsFor } from './firstSession'

describe('deckFor', () => {
  it('proposes changes for the goal, not the demo deck', () => {
    const titles = deckFor({ ...DEFAULTS, goal: 'sleep' }).map((r) => r.title)
    expect(titles).toContain('Slow breath')
    expect(titles).not.toContain('Increase yellow')
    expect(titles).not.toContain('432Hz')
  })

  it('drops voice changes for someone who chose no voice, and sound changes for mostly silence', () => {
    expect(deckFor({ ...DEFAULTS, goal: 'sleep', voice: 'none' }).map((r) => r.id)).not.toContain('sleep-fade')
    expect(deckFor({ ...DEFAULTS, goal: 'focus', sounds: ['silence'] }).map((r) => r.id)).not.toContain('focus-bed')
  })

  it('falls back to the calm deck and is never empty', () => {
    expect(deckFor({ ...DEFAULTS, goal: null }).length).toBeGreaterThan(0)
    expect(deckFor({ goal: 'focus', voice: 'none', sounds: ['silence'] }).length).toBeGreaterThan(0)
  })

  it('keeps every title short enough for the folded deck', () => {
    for (const goal of ['sleep', 'calm', 'clarity', 'focus', 'regulate', 'energy']) {
      for (const r of deckFor({ ...DEFAULTS, goal })) expect(r.title.length).toBeLessThanOrEqual(13)
    }
  })

  it('claims no score for a session with no history', () => {
    expect(deckFor({ ...DEFAULTS, goal: 'calm' }).every((r) => r.improveScore === undefined)).toBe(true)
  })
})

describe('suggestionsFor', () => {
  it('never undoes a choice just made', () => {
    expect(suggestionsFor({ length: 20, voice: 'female', sounds: ['music'] })).toEqual(['Make it shorter', 'Male voice', 'Add ocean waves'])
    expect(suggestionsFor({ length: 5, voice: 'none', sounds: ['silence'] })).toEqual(['Make it longer', 'No voice at all', 'Make it quieter'])
  })

  it('phrases each chip so a reply rule answers it', () => {
    for (const chip of [...suggestionsFor(DEFAULTS), ...suggestionsFor({ length: 20, voice: 'male', sounds: ['silence'] })]) {
      expect(replyTo(chip)).not.toBe(FALLBACK)
    }
  })
})

describe('inferFromWords', () => {
  it('reads the goal and feelings off what was typed on Home', () => {
    expect(inferFromWords('I can’t fall asleep, my mind keeps racing')).toEqual({ goal: 'sleep', feelings: ['sleep', 'racing'] })
    expect(inferFromWords('My therapist said I should work on regulating my nervous system').goal).toBe('regulate')
    expect(inferFromWords('I feel anxious.')).toEqual({ goal: 'calm', feelings: ['anxious'] })
    expect(inferFromWords('exam next week and I keep getting distracted').goal).toBe('focus')
  })

  it('leaves the goal open when nothing matches', () => {
    expect(inferFromWords('hello')).toEqual({ goal: null, feelings: [] })
  })
})

describe('asOptions (one list of changes, U051)', () => {
  it('keeps the sheet entry, and its score, for a proposal the sheet already lists', async () => {
    const { asOptions, FROM_DIAGNOSIS } = await import('./addOptions')
    const { RECOMMENDATIONS } = await import('./thread')
    const options = asOptions(RECOMMENDATIONS)
    const yellow = options.find((o) => o.id === 'yellow')
    expect(yellow).toBe(FROM_DIAGNOSIS.find((o) => o.id === 'yellow'))
    expect(options.map((o) => o.id)).toEqual(RECOMMENDATIONS.map((r) => r.id))
  })

  it('turns a goal deck into rows with a kind and no invented score', async () => {
    const { asOptions } = await import('./addOptions')
    const options = asOptions(deckFor({ ...DEFAULTS, goal: 'sleep' }))
    expect(options.map((o) => o.kind)).toEqual(['movement', 'visual', 'sound'])
    expect(options.every((o) => o.improveScore === undefined)).toBe(true)
  })
})
