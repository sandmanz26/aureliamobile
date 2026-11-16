import { describe, expect, it } from 'vitest'
import raw from '../../design-tokens/figma-export.json?raw'
import { parseExport, semanticUsage } from './tokens'

describe('design system tokens', () => {
  const t = parseExport(raw)

  it('counts the same variables the design-system history records', () => {
    expect(t.total).toBe(251)
    expect(Object.fromEntries(t.collections.map((c) => [c.name, c.count]))).toEqual({
      'Aurelia Brand': 68,
      'Aurelia Primitives': 68,
      'Aurelia Semantic': 33,
      'Aurelia Numbers': 50,
      'Aurelia Typography': 32,
    })
  })

  it('lists all sixteen text styles with sizes from the scale', () => {
    expect(t.textStyles).toHaveLength(16)
    expect(t.textStyles.find((s) => s.name === 'display')).toMatchObject({ size: 48, lineHeight: 56, weightValue: 600 })
  })

  it('keeps the radius scale closed and ordered', () => {
    expect(t.radius.map(([k]) => k)).toEqual(['0', '2', '4', '8', '12', '16', '24', '32', 'full'])
  })

  it('names what every semantic colour is for', () => {
    expect(t.semantic.every((s) => semanticUsage(s.name))).toBe(true)
  })
})
