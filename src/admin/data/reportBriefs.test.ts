import { describe, expect, it } from 'vitest'
import appSource from '../../App.tsx?raw'
import { markedIds, plainText, unmarkedJargon, isTermId } from './glossary'
import { REPORT_BRIEF_ROUTES, briefSources, reportBrief, therapeuticFunnelBrief } from './reportBriefs'
import { buyerSummary, costFunction } from './reportSummaries'
import { funnelOptions } from './therapeuticFunnel'

// U151 (J208): every report and analysis Summary says what it is for, what it concludes and where it comes from.
const reportRoutes = [...appSource.matchAll(/<Route path="(reports[^"]*)"/g)].map((m) => `/admin/${m[1]}`)
const texts = (r: (typeof REPORT_BRIEF_ROUTES)[number]) => {
  const b = reportBrief(r)
  return [b.purpose, b.answer, b.meaning, ...b.numbers.map((n) => n.label), ...b.next.map((s) => s.text)]
}

describe('report briefs (U151)', () => {
  it('covers every report route', () => {
    for (const r of reportRoutes) expect(REPORT_BRIEF_ROUTES as readonly string[], r).toContain(r)
  })
  it.each(REPORT_BRIEF_ROUTES)('%s has a purpose, a conclusion and sources', (r) => {
    const b = reportBrief(r)
    expect(b.purpose.trim().length).toBeGreaterThan(20)
    expect(b.answer.trim().length).toBeGreaterThan(20)
    expect(b.meaning.trim().length).toBeGreaterThan(20)
    expect(b.next.length).toBeGreaterThan(0)
    expect(b.numbers.length).toBeGreaterThan(0)
    expect(b.numbers.length).toBeLessThanOrEqual(3)
    for (const n of b.numbers) expect(n.value.trim(), n.label).not.toBe('')
    expect(briefSources(r).length).toBeGreaterThan(0)
  })
  it.each(REPORT_BRIEF_ROUTES)('%s reads as plain English: one-sentence purpose, jargon marked', (r) => {
    const b = reportBrief(r)
    expect(plainText(b.purpose).match(/[.?!](\s|$)/g)?.length, b.purpose).toBe(1)
    expect(plainText(b.meaning).match(/[.?!](\s|$)/g)?.length, b.meaning).toBe(1)
    for (const t of texts(r)) {
      expect(unmarkedJargon(t), t).toEqual([])
      for (const id of markedIds(t)) expect(isTermId(id), `${r}: ${id}`).toBe(true)
    }
  })
  it('works its numbers out from the data, not typed in', () => {
    expect(reportBrief('/admin/reports/buyer-agent').numbers.map((n) => n.value)).toEqual(buyerSummary().tiles.slice(0, 3).map((t) => t.value))
    expect(reportBrief('/admin/reports').answer).toContain(`$${costFunction(1).costPerFlip.toFixed(2)}`)
  })
  it('follows the StateFlip picked on the therapeutic funnel', () => {
    const [a, b] = funnelOptions()
    expect(therapeuticFunnelBrief(a.id).answer).not.toBe(therapeuticFunnelBrief(b.id).answer)
  })
})
