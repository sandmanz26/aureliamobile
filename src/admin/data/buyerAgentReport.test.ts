import { describe, expect, it } from 'vitest'
import pageSource from '../pages/reports/BuyerAgentReportPage.tsx?raw'
import { APP_PRICE, INPUT_KINDS, INPUT_LABEL, NOT_RECORDED, buildIterations, changedFrom, inputEdges } from './buyerAgentReport'

describe('buyer agent report: the price each iteration tested', () => {
  it('gives every iteration a price-tested entry with amount, currency, period and origin', () => {
    const its = buildIterations()
    expect(its.map((i) => i.id)).toEqual(['it-v1', 'it-v2', 'it-v3', 'it-rerun'])
    for (const it of its) {
      for (const k of ['amount', 'currency', 'period', 'origin'] as const) expect(it.priceTested[k].length, `${it.id} ${k}`).toBeGreaterThan(3)
      if (it.priceTested.differsFromApp) expect(it.priceTested.warning, it.id).toBeTruthy()
    }
  })

  it('reads the prices from the run data, not a guess', () => {
    const [v1, v2, v3, rerun] = buildIterations()
    expect(v1.priceTested.amount).toContain('$9.99')
    expect(v1.priceTested.amount).toContain('$79')
    expect(v2.priceTested.amount).toContain('₹399')
    expect(v3.priceTested.amount).toContain('$59.99')
    expect(v3.priceTested.amount).toContain('$79')
    expect(rerun.priceTested.amount).toContain(APP_PRICE.amount)
    expect(rerun.priceTested.differsFromApp).toBe(false)
  })
})

describe('buyer agent report: five inputs → report versions (U122)', () => {
  it('gives every report version all five inputs, a value or “not recorded”', () => {
    for (const it of buildIterations()) {
      expect(Object.keys(it.inputs).sort(), it.id).toEqual([...INPUT_KINDS].sort())
      for (const k of INPUT_KINDS) {
        const v = it.inputs[k]
        expect(v.short.length, `${it.id} ${k}`).toBeGreaterThan(3)
        expect(v.detail.length, `${it.id} ${k}`).toBeGreaterThan(10)
        expect(v.recorded, `${it.id} ${k}`).toBe(v.short !== NOT_RECORDED)
      }
    }
  })

  it('reads the inputs from the run data', () => {
    const [v1, v2, v3, v4] = buildIterations()
    expect(v1.inputs.personas.short).toBe('10 personas · generator 1 · seed 2026')
    expect(v2.inputs.personas.short).toBe('36 personas · generator 1 · seed 2027')
    expect(v3.inputs.personas.short).toBe('36 personas · generator 2 · seed 2028')
    expect(v4.inputs.personas.short).toContain('10 + 36 + 36')
    expect(v1.inputs.price.short).toContain('$9.99')
    expect(v1.inputs.price.short).toContain('$79')
    expect(v4.inputs.product.short).toContain('staging v3, v4, v5')
    expect(v3.inputs.ownerDocs.detail).toContain('Backend (old)')
  })

  it('draws every edge from an input to a report that used it', () => {
    const its = buildIterations()
    const edges = inputEdges(its)
    expect(edges.length).toBeGreaterThan(0)
    for (const e of edges) {
      const it = its.find((x) => x.id === e.report)
      expect(it, e.report).toBeDefined()
      expect(it!.inputs[e.input].recorded, `${e.input} → ${e.report}`).toBe(true)
      expect(it!.inputs[e.input]).toBe(e.value)
    }
    const recorded = its.reduce((n, it) => n + INPUT_KINDS.filter((k) => it.inputs[k].recorded).length, 0)
    expect(edges).toHaveLength(recorded)
  })

  it('marks what changed against the report before', () => {
    const its = buildIterations()
    expect(changedFrom(its, 0, 'personas')).toBe(false)
    expect(changedFrom(its, 1, 'personas')).toBe(true)
    expect(changedFrom(its, 1, 'product')).toBe(false)
    expect(changedFrom(its, 3, 'product')).toBe(true)
  })

  it('never names the business owner in UI strings', () => {
    expect(JSON.stringify([buildIterations(), INPUT_LABEL])).not.toMatch(/Eugene/)
    expect(pageSource).not.toMatch(/Eugene/)
  })
})
