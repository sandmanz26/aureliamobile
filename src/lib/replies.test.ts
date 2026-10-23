import { describe, expect, it } from 'vitest'
import { FALLBACK, REPLY_RULE_IDS, replyTo } from './replies'

describe('replyTo', () => {
  it('has unique rule ids', () => {
    expect(new Set(REPLY_RULE_IDS).size).toBe(REPLY_RULE_IDS.length)
  })

  it('answers a feeling with a proposal', () => {
    expect(replyTo('I’m so stressed today').proposes).toBe(true)
  })

  it('reads both apostrophes the same (phones type the curly one)', () => {
    expect(replyTo('I can’t sleep').text).toBe(replyTo("I can't sleep").text)
  })

  it('falls back honestly when nothing matches', () => {
    expect(replyTo('qwertyuiop')).toBe(FALLBACK)
  })
})
