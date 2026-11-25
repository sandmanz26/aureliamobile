import { describe, expect, it } from 'vitest'
import { B2B2C_PAGES, pageMarkdown } from '../../guides/docPages'
import { B2B2C_SOURCES, CHANNELS, CHANNEL_ORDER, FEATURES, PHASES, PRIORITIES, b2b2cSummary, beforeAfter, bigPicture, citedSources, endpointsOf, featuresBy, howNumbers, journeys, shortTitle, sourceById, topFeatures, wrapWords } from './b2b2cReport'
import { JARGON } from './glossary'
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

  it('derives the diagram numbers from the buyer tests, matching the wiki', () => {
    const n = howNumbers()
    expect(n.t6).toMatchObject({ n: 60, freeTry: 25, freePlus: 17.5, ticketTry: 2, ticketPlus: 1, ticket39Plus: 0.5, employer: 21, trust: 25 })
    expect(n.t7).toMatchObject({ followers: 35, freeTry: 26, freeNot: 9, freePayYes: 10, freePayMaybe: 5, freePlus: 12.5, ticketTry: 7, ticketPlus: 4 })
    const round2 = pageMarkdown(B2B2C_PAGES.find((x) => x.slug === 'round-2')!)
    expect(round2).toContain(`Among ${n.t7.followers} creator followers, ${n.t7.ticketTry} would buy the ticket against ${n.t7.freeTry} trying the free app; expected paying people ${n.t7.ticketPlus} against ${n.t7.freePlus}`)
    const { before, after } = beforeAfter()
    expect(before.rows.map((r) => r.value)).toEqual(['2', '1', '4'])
    expect(after.rows.map((r) => r.value)).toEqual(['25', '17.5', '12.5'])
  })

  it('gives the diagrams real features, plain labels and no internal ids', () => {
    const b = bigPicture()
    const boxes = [...b.partners, b.aurelia, b.people, b.paid, b.money, b.trust]
    const js = journeys()
    expect(js.map((j) => j.id)).toEqual(['creator', 'employer', 'partner'])
    expect(js[0].steps).toHaveLength(8)
    const all = [...boxes, ...js.flatMap((j) => j.steps), beforeAfter().after]
    const ids = new Set(FEATURES.map((f) => f.id))
    for (const x of all) {
      for (const f of x.features) expect(ids, `${x.id}: ${f}`).toContain(f)
      for (const id of markedIds(x.explain)) expect(Object.keys(GLOSSARY)).toContain(id)
      expect(unmarkedJargon(x.explain), x.explain).toEqual([])
    }
    // Labels drawn inside the SVG cannot carry a glossary tooltip, so they carry no jargon at all.
    const drawn = [...boxes.flatMap((x) => [x.title, x.sub]), ...js.flatMap((j) => [j.title, ...j.steps.flatMap((s) => [s.title, s.sees, s.drop?.text ?? ''])]), ...PHASES.flatMap((p) => [p.name, p.when, p.gate, ...p.build.map(shortTitle)])]
    for (const t of drawn) for (const re of JARGON) expect(re.test(t), `${t} ~ ${re}`).toBe(false)
    expect(JSON.stringify({ b, js, ba: beforeAfter() })).not.toMatch(/Eugene|\b[JUO]\d{2,3}\b/)
  })

  it('wraps diagram text and lists endpoints once', () => {
    expect(wrapWords('Pay after week one: the journey', 12)).toEqual(['Pay after', 'week one:', 'the journey'])
    expect(wrapWords('', 10)).toEqual([])
    expect(wrapWords('supercalifragilistic word', 5)).toEqual(['supercalifragilistic', 'word'])
    expect(endpointsOf(['free-week', 'free-week', 'real-quotes'])).toEqual(['POST /journeys', 'GET /me/entitlements'])
    expect(shortTitle('help-now')).toBe('Need help now? on every feelings screen')
  })
})
