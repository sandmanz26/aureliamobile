import { describe, expect, it } from 'vitest'
import { APP_PRICE, buildIterations } from './buyerAgentReport'

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
