import { describe, expect, it } from 'vitest'
import { STATED_CEILING, buildMetrics, checkWtp, formatDelta, formatValue, median, metricDefs, numbersIn, parseOf, summarize } from './reportMetrics'

const rows = buildMetrics(4)
const byId = (id: string) => rows.find((r) => r.def.id === id)!

describe('report metrics', () => {
  it('has unique ids and a formula, a source and a place shown for each', () => {
    expect(new Set(rows.map((r) => r.def.id)).size).toBe(rows.length)
    expect(rows.length).toBeGreaterThanOrEqual(60)
    for (const r of rows) {
      expect(r.def.formula.length, r.def.id).toBeGreaterThan(10)
      expect(r.def.source, r.def.id).not.toBe('')
      expect(r.def.shownAt, r.def.id).not.toBe('')
    }
  })

  it('runs every compute, with inputs, steps and a finite value', () => {
    for (const def of metricDefs(4)) {
      if (!def.compute) {
        expect(def.assumption, `${def.id} has no data: it must say why`).toBeTruthy()
        continue
      }
      const d = def.compute()
      expect(Number.isFinite(d.value), def.id).toBe(true)
      expect(d.inputs.length, def.id).toBeGreaterThan(0)
      expect(d.steps.length, def.id).toBeGreaterThan(0)
    }
  })

  it('reads a displayed number wherever the report shows one', () => {
    for (const r of rows) if (!['cost-flip-s2', 'retreat-aurelia-share'].includes(r.def.id)) expect(r.displayed, r.def.id).not.toBeNull()
  })

  it('agrees with the reports where it says Consistent', () => {
    for (const r of rows.filter((x) => x.quality === 'consistent' && x.displayed !== null)) {
      const tol = r.def.tolerance ?? (r.def.unit === 'count' ? 0.001 : r.def.unit === 'number' ? 0.051 : 0.0051)
      expect(Math.abs(r.displayed! - r.recomputed!), `${r.def.id}: shown ${r.displayed}, data ${r.recomputed}`).toBeLessThanOrEqual(tol)
    }
  })

  it('lists the mismatches it found, each with both numbers', () => {
    const mism = rows.filter((r) => r.quality === 'mismatch')
    expect(mism.map((r) => r.def.id)).toEqual([])
    for (const r of mism) expect(r.checks[0].text).toMatch(/Shown .* but the data gives/)
  })

  it('marks numbers with no data behind them as assumptions', () => {
    const un = rows.filter((r) => r.quality === 'untraceable')
    expect(un.length).toBeGreaterThan(0)
    for (const r of un) {
      expect(r.recomputed).toBeNull()
      expect(r.checks[0].text).toMatch(/^Assumption:/)
    }
  })

  it('never shows a share above 100%', () => {
    for (const r of rows.filter((x) => x.def.unit === 'share')) {
      if (r.displayed !== null) expect(r.displayed, r.def.id).toBeLessThanOrEqual(1)
      if (r.recomputed !== null) expect(r.recomputed, r.def.id).toBeLessThanOrEqual(1)
    }
  })

  it('flags small samples', () => {
    expect(byId('buyer-try-v1').checks.some((c) => /Small sample: 10/.test(c.text))).toBe(true)
    expect(byId('buyer-try-v7').checks.some((c) => /Small sample/.test(c.text))).toBe(false)
  })

  it('lists who counted: test 7 would-try names each of the 100 people', () => {
    const d = byId('buyer-try-v7').derivation!
    expect(d.breakdown!.rows).toHaveLength(100)
    const counted = d.breakdown!.rows.filter((r) => r.cells[4] === 'counted').length
    expect(counted / 100).toBeCloseTo(d.value, 10)
  })

  it('follows each series: previous, delta and whether it got better', () => {
    const t7 = byId('buyer-try-v7')
    expect(t7.trend!.previousStep).toBe('Test 6')
    expect(t7.trend!.delta).toBeCloseTo(t7.value! - byId('buyer-try-v6').value!, 10)
    expect(t7.trend!.better).toBe(t7.trend!.delta > 0)
    const s3 = byId('cost-flip-s3')
    expect(s3.trend!.previousStep).toBe('Stage 2')
    expect(s3.trend!.better).toBe(true)
    expect(byId('buyer-try-v1').trend).toBeNull()
  })

  it('sums up', () => {
    const s = summarize(rows)
    expect(s.consistent + s.mismatch + s.untraceable).toBe(s.total)
    expect(s.improved + s.worse).toBeLessThanOrEqual(s.withTrend)
  })
})

describe('willingness to pay', () => {
  it('cannot report $2 when the people themselves say $50 (the owner’s example)', () => {
    const checks = checkWtp([50, 50], 2)
    expect(checks[0].level).toBe('fail')
    expect(checks[0].text).toMatch(/outside what the people said/)
    expect(checkWtp([50, 50], 50).every((c) => c.level === 'ok')).toBe(true)
    expect(checkWtp([10, 20, 30], 8).some((c) => c.level === 'warn')).toBe(true)
  })

  it('reports each run’s fair price inside the range its people gave, with each person listed', () => {
    for (const v of [1, 2, 3, 5, 6, 7]) {
      const r = byId(`buyer-fair-v${v}`)
      const d = r.derivation!
      expect(d.checks![0].level, `test ${v}`).toBe('ok')
      expect(d.breakdown!.rows.length).toBe(d.n)
      for (const row of d.breakdown!.rows) expect(Object.keys(STATED_CEILING)).toContain(row.cells[3])
    }
  })

  it('is the median of every “getting expensive” answer', () => {
    expect(median([1, 3, 2])).toBe(2)
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
})

describe('reading and writing numbers', () => {
  it('parses what the reports print', () => {
    expect(parseOf('8 of 10')).toEqual([8, 10])
    expect(numbersIn('$36.55 → $3.02')).toEqual([36.55, 3.02])
    expect(numbersIn('−$16.56')).toEqual([-16.56])
  })
  it('formats values and deltas in their unit', () => {
    expect(formatValue('share', 0.4166)).toBe('41.7%')
    expect(formatValue('usd', -16.556)).toBe('−$16.56')
    expect(formatDelta('share', 0.19)).toBe('+19 pts')
    expect(formatDelta('usd', -1.5)).toBe('−$1.50')
  })
})
