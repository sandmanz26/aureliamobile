import { describe, expect, it } from 'vitest'
import appSource from '../../App.tsx?raw'
import { REPORT_DATA_SOURCES, SOURCE_META, dataSourcesFor } from './dataSources'
import { SOURCES, type SourceId } from './reportSources'

// Every report route, plus the lab pages that show numbers (StateFlips has its own sources panel).
const reportRoutes = [...appSource.matchAll(/<Route path="(reports[^"]*)"/g)].map((m) => `/admin/${m[1]}`)
const LAB_ROUTES = ['/admin/personas', '/admin/business-funnel', '/admin/user-journey', '/admin/session-builder', '/admin/therapeutic-funnel']

describe('data sources per report (U146)', () => {
  it('finds the report routes', () => {
    expect(reportRoutes).toContain('/admin/reports')
    expect(reportRoutes).toContain('/admin/reports/buyer-agent')
  })
  it('registers at least one source for every report route and lab page', () => {
    for (const r of [...reportRoutes, ...LAB_ROUTES]) expect(dataSourcesFor(r).length, r).toBeGreaterThan(0)
  })
  it('names only known sources, each with a type, file, date, link and what it feeds', () => {
    for (const [route, page] of Object.entries(REPORT_DATA_SOURCES)) {
      for (const u of page.uses) {
        expect(SOURCES[u.id], `${route}: ${u.id}`).toBeDefined()
        expect(u.feeds.length, `${route}: ${u.id}`).toBeGreaterThan(0)
      }
    }
    for (const id of Object.keys(SOURCES) as SourceId[]) {
      const m = SOURCE_META[id]
      expect(m.file && m.date && SOURCES[id].link, id).toBeTruthy()
    }
  })
})
