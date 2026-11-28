import { describe, expect, it } from 'vitest'
import { AKP_SOURCE } from './generated/akpSource'
import { CHAPTER_FAMILIES, FAMILIES, FAMILY, akpSummary, akps, akpsForFlip, examplesOf, norm } from './akps'
import { chapterKit } from './akpAssembly'
import { DRAFTED, stateFlips } from './stateFlips'

const as = akps()
const ids = new Set(as.map((a) => a.id))

describe('the draft AKP catalogue (U141)', () => {
  it('has between 3,000 and 4,000 AKPs (v2, U150), all draft, with unique ids and no repeated source rows', () => {
    expect(as.length).toBeGreaterThanOrEqual(3000)
    expect(as.length).toBeLessThanOrEqual(4000)
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
    const v2 = (f: string) => AKP_SOURCE.v2.filter((r) => r.family === f).length
    const v1 = { identity: AKP_SOURCE.identityGrand.length + AKP_SOURCE.identityLight.length, product: AKP_SOURCE.product.length }
    // v2 rows are skipped only when a v1 AKP of the same family has the same name.
    expect(s.byFamily.identity).toBe(v1.identity + v2('identity'))
    expect(s.byFamily.product).toBe(v1.product + v2('product'))
    expect(s.byFamily.script).toBeGreaterThan(AKP_SOURCE.dojoC.length + AKP_SOURCE.dojoM.length + 30 + v2('script') - 5)
    expect(s.byFamily.brand).toBe(v2('brand'))
    expect(s.byFamily.business).toBe(v2('business'))
    expect(s.byFamily.voice).toBe(v2('voice'))
    expect(s.byFamily.analysis).toBe(v2('analysis') + 125)
    for (const f of FAMILIES) expect(s.byFamily[f], f).toBeGreaterThan(0)
    // Proportioned toward his prototype: wellness the largest function, then product, brand and business.
    expect(s.byFunction.wellness).toBeGreaterThan(s.byFunction.product)
    expect(s.byFunction.product).toBeGreaterThan(s.byFunction.business)
    expect(s.byFunction.brand).toBeGreaterThanOrEqual(400)
    expect(s.byFunction.business).toBeGreaterThanOrEqual(300)
    expect(s.fromFile + s.drafted).toBe(s.total)
  })

  it('links only to AKPs and StateFlips that exist', () => {
    const flips = new Set(stateFlips().map((f) => f.id))
    for (const a of as) {
      for (const l of a.links) expect(ids, `${a.id} → ${l.to}`).toContain(l.to)
      for (const f of a.flips) expect(flips, a.id).toContain(f)
      expect(a.source.startsWith('from ') || a.source.startsWith(DRAFTED), a.id).toBe(true)
      expect(a.fromFile).toBe(a.source.startsWith('from '))
    }
  })

  it('has no duplicate names, a definition, a measurable signal and at least one typed link on every AKP (v2)', () => {
    expect(new Set(as.map((a) => norm(a.name))).size).toBe(as.length)
    for (const a of as) {
      expect(a.links.length, a.id).toBeGreaterThan(0)
      expect(a.description.trim().length, a.id).toBeGreaterThan(3)
    }
    const v2 = as.filter((a) => AKP_SOURCE.v2.some((r) => r.id === a.id))
    expect(v2.length).toBeGreaterThan(1900)
    for (const a of v2) expect(a.signal && a.usedFor && a.helps && a.causalRole, a.id).toBeTruthy()
  })

  it('lets every StateFlip assemble a chapter: a script, voice, music and image AKP each', () => {
    for (const f of stateFlips()) {
      const k = chapterKit(f.id)
      expect(k.complete, f.id).toBe(true)
      for (const fam of CHAPTER_FAMILIES) expect(k.pieces[fam]?.flips, `${f.id} ${fam}`).toContain(f.id)
    }
  })

  it('keeps the v1 ids stable', () => {
    for (const id of ['WG-PHY-01', 'WG-PHY-01-X', 'ID-G01', 'ID-L16', 'PR-UO2', 'WS-SK9', 'WS-LU-02', 'WM-MM4', 'WI-LFT1', 'WV-ET1', 'WS-F11']) expect(ids, id).toContain(id)
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
