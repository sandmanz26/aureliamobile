import { describe, expect, it } from 'vitest'
import { akpById } from './akps'
import { conditionsV4 } from './personaConditionV4'
import { generatePersonasV4 } from './personasV4'
import { IDENTITY_DIMENSIONS, identitiesV4, identityIncoherence, identityOf, identitySummary } from './personaIdentityV4'

// FNV-1a over the JSON: enough to notice a single changed byte.
const digest = (x: unknown) => {
  let h = 0x811c9dc5
  for (const ch of JSON.stringify(x)) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  return h.toString(16)
}
const ps = generatePersonasV4()
const cs = conditionsV4()

describe('persona set v4: wellness identity (U141)', () => {
  it('leaves the v4 set and its conditions byte-identical', () => {
    // v4 digest as pinned since U138; condition digest taken before this change.
    expect(digest(ps)).toBe('d4753d70')
    expect(digest(ps.map((p) => cs.get(p.id)))).toBe('4b182cab')
    expect(identitiesV4().size).toBe(1000)
    expect(digest(ps.map((p) => cs.get(p.id)))).toBe('4b182cab')
  })

  it('is deterministic and pinned', () => {
    for (const p of ps.slice(0, 50)) expect(identityOf(p, cs.get(p.id)!)).toEqual(identitiesV4().get(p.id))
    expect(digest([...identitiesV4().values()])).toBe('d04352aa')
  })

  it('fills all twelve Grand dimensions, each tied to an identity AKP that exists', () => {
    expect(IDENTITY_DIMENSIONS).toHaveLength(12)
    for (const d of IDENTITY_DIMENSIONS) expect(akpById(d.akp)?.name).toBe(d.name)
    for (const x of identitiesV4().values()) for (const d of IDENTITY_DIMENSIONS) expect(x.dims[d.key].value.length).toBeGreaterThan(0)
  })

  it('holds together for all 1,000 (incoherence 0)', () => {
    const bad = ps.flatMap((p) => identityIncoherence(p, cs.get(p.id)!, identitiesV4().get(p.id)!).map((x) => `${p.id}: ${x}`))
    expect(bad).toEqual([])
    expect(identitySummary().incoherent).toBe(0)
  })

  it('gives every mindspace AKP an id in the catalogue and leaves brand as a placeholder', () => {
    for (const x of identitiesV4().values()) {
      for (const k of ['wellness', 'product', 'business'] as const) for (const a of x.mindspace[k].akps) expect(akpById(a), a).toBeDefined()
      expect(x.mindspace.brand.akps).toEqual([])
    }
  })
})
