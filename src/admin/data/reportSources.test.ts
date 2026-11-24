import { describe, expect, it } from 'vitest'
import appSource from '../../App.tsx?raw'
import guideSource from '../../guides/GuidePage.tsx?raw'
import { B2B2C_PAGES } from '../../guides/docPages'
import { buildIterations } from './buyerAgentReport'
import { buildMatrix, buildStages } from './combinationReport'
import { BUYER_REPORT_FINDINGS, COMBINATION_FINDINGS, SOURCES, sourcesOf } from './reportSources'

const adminRoutes = new Set([...appSource.matchAll(/<Route path="([^"/:][^"]*)"/g)].map((m) => `/admin/${m[1]}`))
const wikiDocs = new Set([...guideSource.matchAll(/^\s{4}id: '([a-z0-9-]+)',$/gm)].map((m) => m[1]))

function resolves(link: string) {
  const path = link.split(/[?#]/)[0]
  if (path.startsWith('/wiki/')) {
    const [doc, page] = path.slice(6).split('/')
    if (!wikiDocs.has(doc)) return false
    return !page || (doc === 'b2b2c' && B2B2C_PAGES.some((p) => p.slug === page))
  }
  return adminRoutes.has(path)
}

describe('report sources', () => {
  it('finds the routes and wiki documents it checks against', () => {
    expect(adminRoutes.has('/admin/buyer-agent')).toBe(true)
    expect(wikiDocs.has('backend-old')).toBe(true)
  })

  it('links every source to an existing route or wiki document', () => {
    for (const s of Object.values(SOURCES)) expect(resolves(s.link), `${s.id} → ${s.link}`).toBe(true)
  })

  it('cites at least one known source in every finding', () => {
    for (const f of [...BUYER_REPORT_FINDINGS, ...COMBINATION_FINDINGS]) {
      expect(f.sources.length, f.id).toBeGreaterThan(0)
      for (const id of f.sources) expect(SOURCES[id], `${f.id} cites ${id}`).toBeDefined()
    }
  })

  it('cites in every line only sources its finding lists, and lists the report links that exist', () => {
    for (const s of buildStages(1)) {
      const finding = COMBINATION_FINDINGS.find((f) => f.id === s.findingId)!
      for (const l of s.lines) expect(finding.sources, `${s.id}: ${l.source}`).toContain(l.source)
    }
    for (const it of buildIterations()) {
      expect(BUYER_REPORT_FINDINGS.find((f) => f.id === it.id)).toBeDefined()
      expect(resolves(it.link)).toBe(true)
    }
    expect(sourcesOf(COMBINATION_FINDINGS).length).toBeGreaterThan(10)
  })

  it('never names the business owner in report text', () => {
    const text = JSON.stringify([SOURCES, buildIterations(), buildStages(1)])
    expect(text).not.toMatch(/Eugene/)
  })

  it('builds the matrix from the models: 3 offers × 2 rule sets × 3 versions', () => {
    const m = buildMatrix()
    expect(m).toHaveLength(6)
    for (const r of m) expect(r.cells).toHaveLength(3)
    // The page's reading of the matrix: the spec loses money everywhere, both redesigns stay positive.
    for (const r of m) for (const c of r.cells) expect(c.total < 0, `${r.offerId} agent ${r.agent} v${c.design}`).toBe(r.offerId === 'spec')
  })
})
