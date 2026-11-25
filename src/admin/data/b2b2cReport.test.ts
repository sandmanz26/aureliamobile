import { describe, expect, it } from 'vitest'
import { B2B2C_PAGES, pageMarkdown } from '../../guides/docPages'
import { B2B2C_SOURCES, CHANNELS, CHANNEL_ORDER, FEATURES, PHASES, PRIORITIES, b2b2cSummary, citedSources, featuresBy, sourceById, topFeatures } from './b2b2cReport'
import { GLOSSARY, markedIds, unmarkedJargon } from './glossary'

describe('B2B2C report data', () => {
  it('gives every feature a source, a priority, an effort and a metric', () => {
    for (const f of FEATURES) {
      expect(f.sources.length, f.id).toBeGreaterThan(0)
      for (const s of f.sources) expect(sourceById(s), `${f.id} cites ${s}`).toBeDefined()
      expect(PRIORITIES, f.id).toContain(f.priority)
      expect(['frontend', 'backend', 'new-backend'], f.id).toContain(f.effort)
      expect(f.metric.length, f.id).toBeGreaterThan(10)
      expect(f.problem.length, f.id).toBeGreaterThan(10)
      expect(f.evidence.length, f.id).toBeGreaterThan(10)
      // Endpoints are named exactly when the feature uses the backend API v2 already describes.
      if (f.effort === 'backend') expect(f.endpoints.length, f.id).toBeGreaterThan(0)
      else expect(f.endpoints, f.id).toEqual([])
    }
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length)
  })

  it('names only endpoints that exist in the API v2 pages', () => {
    const api = ['general', 'apps', 'admin'].map((slug) => pageMarkdown({ slug, title: '', note: '', file: `${slug}.md`, dir: 'api/v2' })).join('\n')
    for (const f of FEATURES) for (const e of f.endpoints) expect(api, `${f.id}: ${e}`).toContain(`\`${e.split(' ')[1]}\``)
  })

  it('cites every source with a link, a date and a label', () => {
    for (const s of B2B2C_SOURCES) {
      expect(s.url, s.id).toMatch(/^(https:\/\/|\/)/)
      expect(s.date, s.id).not.toBe('')
      expect(s.used.length, s.id).toBeGreaterThan(10)
    }
    expect(B2B2C_SOURCES.filter((s) => s.url.startsWith('https')).length).toBe(28)
    expect(citedSources().length).toBeGreaterThanOrEqual(20)
  })

  it('covers every channel and priority, has three top features and puts each feature in one phase', () => {
    for (const c of CHANNEL_ORDER) expect(featuresBy(c, 'all').length, c).toBeGreaterThan(0)
    for (const p of PRIORITIES) expect(featuresBy('all', p).length, p).toBeGreaterThan(0)
    expect(topFeatures().map((f) => f.top)).toEqual([1, 2, 3])
    expect(PHASES.flatMap((p) => p.build).sort()).toEqual(FEATURES.map((f) => f.id).sort())
    expect(CHANNELS.map((c) => c.rank)).toEqual([1, 2, 3])
  })

  it('writes the summary in plain words, and no internal ids or names anywhere', () => {
    const s = b2b2cSummary()
    const texts = [s.intro ?? '', s.question, s.headline, s.statusNote, s.sure ?? '', ...s.tiles.flatMap((t) => [t.label, t.value, t.note ?? '']), ...s.actions.map((a) => a.text), ...Object.values(s.confidence)]
    for (const t of texts) {
      expect(unmarkedJargon(t), t).toEqual([])
      for (const id of markedIds(t)) expect(Object.keys(GLOSSARY)).toContain(id)
    }
    const all = JSON.stringify({ FEATURES, CHANNELS, PHASES, B2B2C_SOURCES, s })
    expect(all).not.toMatch(/Eugene/)
    expect(all).not.toMatch(/\b[JUO]\d{2,3}\b/)
  })

  it('has the two round-2 wiki pages, without the business owner’s name or internal ids', () => {
    for (const slug of ['round-2', 'features']) {
      const p = B2B2C_PAGES.find((x) => x.slug === slug)
      expect(p, slug).toBeDefined()
      const md = pageMarkdown(p!)
      expect(md, slug).not.toMatch(/Eugene/)
      expect(md, slug).not.toMatch(/\b[JUO]\d{2,3}\b/)
    }
  })
})
