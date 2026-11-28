import { afterEach, describe, expect, it } from 'vitest'
import {
  FAMILY_KIND, akpEditsFile, applyAkpEdits, defaultUsedFor, describeEdit, diffFields, makeEdit, nextAkpId, parseAkpEditsImport, revertAkp, usedForLine, type AkpEdit,
} from './akpEdits'
import { FAMILY, akpById, akpSummary, akps, baseAkps, setAkpEdits } from './akps'

const base = baseAkps()
const t = new Date('2026-11-28T10:00:00Z')
const by = 'Tess'

afterEach(() => setAkpEdits([]))

describe('applyAkpEdits (U149)', () => {
  it('returns the catalogue unchanged, and never touches it, with no edits', () => {
    const out = applyAkpEdits(base, [])
    expect(out.map((a) => a.id)).toEqual(base.map((a) => a.id))
    expect(out.every((a) => !a.edited && !a.deleted && !a.added)).toBe(true)
    expect(out[0]).not.toBe(base[0])
  })

  it('keeps the family table equal to akps.ts', () => {
    for (const [f, v] of Object.entries(FAMILY_KIND)) expect([v.kind, v.fn, v.prefix]).toEqual([FAMILY[f as keyof typeof FAMILY].kind, FAMILY[f as keyof typeof FAMILY].fn, FAMILY[f as keyof typeof FAMILY].prefix])
  })

  it('applies updates, adds, deletes, restores and links in order', () => {
    const a = base.find((x) => x.id === 'WS-M2')!
    const before = JSON.stringify(a)
    const edits: AkpEdit[] = [
      makeEdit('update', 'WS-M2', by, { set: { name: 'Calm, renamed', status: 'reviewed', family: 'music' }, prev: { name: a.name } }, t),
      makeEdit('add', 'WS-NEW1', by, { value: { name: 'Box breathing', family: 'script', flips: ['SF-PHY-01'] } }, t),
      makeEdit('link-add', 'WS-NEW1', by, { to: 'WS-M2', type: 'supports' }, t),
      makeEdit('link-add', 'WS-NEW1', by, { to: 'WS-M2', type: 'supports' }, t),
      makeEdit('link-add', 'WS-NEW1', by, { to: 'WS-NEW1', type: 'supports' }, t),
      makeEdit('delete', 'WS-SK9', by, {}, t),
      makeEdit('delete', 'WS-H5', by, {}, t),
      makeEdit('restore', 'WS-H5', by, {}, t),
      makeEdit('update', 'NOPE-1', by, { set: { name: 'x' }, prev: {} }, t),
    ]
    const out = applyAkpEdits(base, edits)
    const m = new Map(out.map((x) => [x.id, x]))
    expect(m.get('WS-M2')).toMatchObject({ name: 'Calm, renamed', status: 'reviewed', family: 'music', kind: 'strategy', edited: true })
    expect(m.get('WS-NEW1')).toMatchObject({ added: true, fromFile: false, fn: 'wellness', kind: 'strategy', flips: ['SF-PHY-01'], links: [{ to: 'WS-M2', type: 'supports' }] })
    expect(m.get('WS-NEW1')!.source).toContain('Tess')
    expect(m.get('WS-SK9')!.deleted).toBe(true)
    expect(m.get('WS-H5')).toMatchObject({ deleted: false, edited: true })
    expect(out).toHaveLength(base.length + 1)
    expect(JSON.stringify(a)).toBe(before)
  })

  it('removes a generated link and ignores an add whose id is taken', () => {
    const src = base.find((x) => x.links.length)!
    const l = src.links[0]
    const out = applyAkpEdits(base, [makeEdit('link-remove', src.id, by, { to: l.to, type: l.type }, t), makeEdit('add', src.id, by, { value: { name: 'dup', family: 'video' } }, t)])
    const got = out.find((x) => x.id === src.id)!
    expect(got.links.some((x) => x.to === l.to && x.type === l.type)).toBe(false)
    expect(got.name).toBe(src.name)
  })

  it('reverts one AKP and records diffs in plain words', () => {
    const a = applyAkpEdits(base, []).find((x) => x.id === 'WS-M2')!
    expect(diffFields(a, { name: a.name, layer: a.layer })).toBeNull()
    const d = diffFields(a, { name: 'Calm 2', flips: ['SF-PHY-01'] })!
    expect(Object.keys(d.set).sort()).toEqual(['flips', 'name'])
    const e = makeEdit('update', 'WS-M2', by, d, t)
    expect(describeEdit(e)).toContain(`Name: “${a.name}” → “Calm 2”`)
    const edits = [e, makeEdit('delete', 'WS-SK9', by, {}, t)]
    expect(revertAkp(edits, 'WS-M2')).toEqual([edits[1]])
  })

  it('feeds the merged view that akps(), akpById() and the summary read', () => {
    const total = akpSummary().total
    setAkpEdits([makeEdit('delete', 'WS-SK9', by, {}, t), makeEdit('add', 'WM-NEW1', by, { value: { name: 'Rain', family: 'music' } }, t), makeEdit('add', 'WM-NEW2', by, { value: { name: 'Wind', family: 'music' } }, t)])
    expect(akpById('WS-SK9')).toBeUndefined()
    expect(akpById('WM-NEW1')?.name).toBe('Rain')
    expect(akps()).toHaveLength(base.length + 1)
    expect(akpSummary().total).toBe(total + 1)
    expect(nextAkpId('music', (id) => !!akpById(id))).toBe('WM-NEW3')
  })

  it('writes a "Used for … · helps …" line, preferring what an admin wrote', () => {
    const a = applyAkpEdits(base, []).find((x) => x.id === 'WS-M2')!
    expect(usedForLine(a, () => 'Bad sleep')).toMatch(/^Used for .+ · helps .+/)
    expect(usedForLine({ ...a, usedFor: 'setting the mood', helps: 'people unwind' }, () => undefined)).toBe('Used for setting the mood · helps people unwind')
    expect(defaultUsedFor({ family: 'product', layer: 'Onboarding', modality: '—' })).toBe('the app experience (onboarding)')
  })
})

describe('importing edits (U149)', () => {
  const good = [makeEdit('delete', 'WS-SK9', by, {}, t)]

  it('reads an exported file and a bare array', () => {
    expect(parseAkpEditsImport(JSON.stringify(akpEditsFile(good, t)))).toEqual({ ok: true, edits: good })
    expect(parseAkpEditsImport(JSON.stringify(good))).toEqual({ ok: true, edits: good })
  })

  it('refuses malformed, wrongly shaped and oversized files with a reason', () => {
    expect(parseAkpEditsImport('{nope')).toMatchObject({ ok: false, error: 'This is not a JSON file.' })
    expect(parseAkpEditsImport(JSON.stringify({ kind: 'other', version: 1, edits: [] }))).toMatchObject({ ok: false })
    const bad = parseAkpEditsImport(JSON.stringify([{ ...good[0], op: 'explode' }]))
    expect(bad.ok).toBe(false)
    expect(parseAkpEditsImport(JSON.stringify([{ ...good[0], akp: 'has spaces!' }])).ok).toBe(false)
    expect(parseAkpEditsImport(JSON.stringify([makeEdit('update', 'WS-M2', by, { set: { flips: ['not-a-flip'] }, prev: {} }, t)])).ok).toBe(false)
    expect(parseAkpEditsImport('x'.repeat(1_000_000))).toMatchObject({ ok: false })
  })
})
