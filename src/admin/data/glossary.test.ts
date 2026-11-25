import { describe, expect, it } from 'vitest'
import { GLOSSARY, markedIds, plainText, segments, unmarkedJargon } from './glossary'
import { buyerSummary, combinationSummary, costSummary } from './reportSummaries'

const summaries = () => [buyerSummary(), combinationSummary(1), costSummary()]

describe('glossary', () => {
  it('defines every entry in plain words', () => {
    for (const [id, e] of Object.entries(GLOSSARY)) {
      expect(e.term, id).not.toBe('')
      expect(e.plain.length, id).toBeGreaterThan(20)
      for (const sentence of e.plain.split(/(?<=[.:])\s/)) expect(sentence.split(/\s+/).length, `${id}: ${sentence}`).toBeLessThanOrEqual(20)
    }
  })
  it('splits marked text into plain runs and terms', () => {
    expect(segments('a {{points}} b {{test|round}} c')).toEqual([{ text: 'a ' }, { text: 'points', term: 'points' }, { text: ' b ' }, { text: 'round', term: 'test' }, { text: ' c' }])
    expect(plainText('16 of 36 {{simulated|simulated people}}')).toBe('16 of 36 simulated people')
    expect(unmarkedJargon('the funnel and {{journey|the funnel}}')).toEqual(['funnel'])
  })
  it('has a definition for every term a summary marks', () => {
    for (const s of summaries()) {
      const texts = [s.intro ?? '', s.question, s.headline, s.statusNote, s.sure ?? '', ...s.tiles.flatMap((t) => [t.label, t.value, t.delta ?? '', t.note ?? '']), ...s.actions.map((a) => a.text), ...Object.values(s.confidence)]
      for (const t of texts) for (const id of markedIds(t)) expect(Object.keys(GLOSSARY), `${id} in “${t}”`).toContain(id)
    }
  })
})
