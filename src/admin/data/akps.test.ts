import { describe, expect, it } from 'vitest'
import { AKP_SOURCE } from './generated/akpSource'
import { FAMILIES, FAMILY, akpSummary, akps, akpsForFlip, examplesOf } from './akps'
import { DRAFTED, stateFlips } from './stateFlips'

const as = akps()
const ids = new Set(as.map((a) => a.id))

describe('the draft AKP catalogue (U141)', () => {
  it('has between 950 and 1,100 AKPs, all draft, with unique ids and no repeated source rows', () => {
    expect(as.length).toBeGreaterThanOrEqual(950)
    expect(as.length).toBeLessThanOrEqual(1100)
    expect(ids.size).toBe(as.length)
    expect(as.every((a) => a.status === 'draft')).toBe(true)
    const fileRows = as.filter((a) => a.fromFile && a.family !== 'goal').map((a) => `${a.source}|${a.name}`)
    expect(new Set(fileRows).size).toBe(fileRows.length)
  })

  it('prefixes every id by its family', () => {
    for (const a of as) expect(a.id.startsWith(`${FAMILY[a.family].prefix}-`), a.id).toBe(true)
  })

  it('has the counts per family the sources give', () => {
    const s = akpSummary()
    expect(s.byFamily.goal).toBe(125 * 4)
    expect(s.byFamily.identity).toBe(AKP_SOURCE.identityGrand.length + AKP_SOURCE.identityLight.length)
    expect(s.byFamily.product).toBe(AKP_SOURCE.product.length)
    expect(s.byFamily.script).toBe(AKP_SOURCE.dojoC.length + AKP_SOURCE.dojoM.length + 10 + 10 + 10 + AKP_SOURCE.habits.length + AKP_SOURCE.frameworks.length + AKP_SOURCE.bars.length + AKP_SOURCE.elements.length)
    for (const f of FAMILIES) expect(s.byFamily[f], f).toBeGreaterThan(0)
    expect(s.byFunction.brand).toBe(0)
    expect(s.fromFile + s.drafted).toBe(s.total)
  })

  it('links only to AKPs and StateFlips that exist', () => {
    const flips = new Set(stateFlips().map((f) => f.id))
    for (const a of as) {
      for (const l of a.links) expect(ids, `${a.id} → ${l.to}`).toContain(l.to)
      for (const f of a.flips) expect(flips, a.id).toContain(f)
      expect(a.source.startsWith('from ') || a.source === DRAFTED, a.id).toBe(true)
      expect(a.fromFile).toBe(a.source.startsWith('from '))
    }
  })

  it('covers every StateFlip with at least one strategy AKP', () => {
    const s = akpSummary()
    expect(s.flipsCovered).toBe(125)
    for (const f of stateFlips()) expect(akpsForFlip(f.id).some((a) => a.kind === 'strategy'), f.id).toBe(true)
  })

  it('reads example instances from a Grand 4 layers cell', () => {
    expect(examplesOf('Binaural, harmonic, ambient, etc.')).toEqual(['Binaural', 'Harmonic', 'Ambient'])
    expect(examplesOf('Therapeutic visual goals')).toEqual([])
  })
})
