import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULTS, firstSessionBrief, onboarded, onboardingAnswers, resetOnboarding, saveOnboarding } from './onboarding'
import { replyTo } from './replies'

describe('firstSessionBrief', () => {
  it('writes the user’s answers as one message', () => {
    expect(
      firstSessionBrief({ goal: 'sleep', feelings: ['stressed'], length: 20, voice: 'male', sounds: ['nature', 'frequencies'] }),
    ).toBe('Create my first session: 20 minutes to help me sleep better. I’m stressed. Male voice, with nature sounds and healing frequencies.')
  })

  it('works with everything skipped', () => {
    expect(firstSessionBrief(DEFAULTS)).toBe('Create my first session: 10 minutes to unwind. Female voice, with nature sounds.')
  })

  it('leaves "Not sure" out of a brief', () => {
    expect(firstSessionBrief({ ...DEFAULTS, feelings: ['unsure'] })).not.toContain('figure it out')
  })

  it('is answered by its own reply rule, not by the duration or feeling rules', () => {
    const reply = replyTo(firstSessionBrief({ ...DEFAULTS, goal: 'focus', feelings: ['stressed'] }))
    expect(reply.text).toMatch(/enough to start/)
    expect(reply.proposes).toBe(true)
  })
})

describe('onboarding storage', () => {
  beforeEach(() => resetOnboarding())

  it('starts not onboarded, and remembers once saved', () => {
    expect(onboarded()).toBe(false)
    saveOnboarding({ ...DEFAULTS, goal: 'calm' })
    expect(onboarded()).toBe(true)
    expect(onboardingAnswers()?.goal).toBe('calm')
  })

  it('treats a malformed or old-shaped record as not onboarded', () => {
    localStorage.setItem('aurelia.onboarding', '{"goal":42}')
    expect(onboarded()).toBe(false)
    localStorage.setItem('aurelia.onboarding', 'not json')
    expect(onboardingAnswers()).toBeNull()
  })
})

describe('firstSessionBrief with their own words (U050)', () => {
  it('carries the sentence typed on Home instead of the feeling line', () => {
    const brief = firstSessionBrief({ ...DEFAULTS, goal: 'sleep', feelings: ['sleep'] }, 'I can’t fall asleep, my mind keeps racing')
    expect(brief).toBe('Create my first session: 10 minutes to help me sleep better. In my words: “I can’t fall asleep, my mind keeps racing.” Female voice, with nature sounds.')
    expect(replyTo(brief).text).toMatch(/first session/)
  })
})
