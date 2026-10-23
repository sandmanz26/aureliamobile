import { describe, expect, it } from 'vitest'
import { UNSURE_ASK, feelingSentence } from './feelings'

describe('feelingSentence', () => {
  it('is empty with nothing picked', () => {
    expect(feelingSentence([])).toBe('')
  })

  it('capitalises a single feeling and ends it with a full stop', () => {
    expect(feelingSentence(['stressed'])).toBe('I’m stressed.')
  })

  it('joins several with commas and "and", in the list order', () => {
    expect(feelingSentence(['sleep', 'stressed', 'focus'])).toBe('I can’t sleep well, I’m stressed and I can’t focus.')
  })

  it('"Not sure" wins over everything else and asks for help naming it', () => {
    expect(feelingSentence(['stressed', 'unsure'])).toBe(UNSURE_ASK)
  })
})
