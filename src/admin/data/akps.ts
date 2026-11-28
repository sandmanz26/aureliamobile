/**
 * Admin → Product lab → StateFlips → AKP catalogue (U141, J203): a first
 * draft of about 1,000 atomic knowledge points. Every one is status "draft".
 *
 * Two kinds:
 * - Goal AKPs say what to reach: the 125 StateFlips (WG-), their X / Y / Z
 *   steps (WG-…-X) and the Wellness Identity dimensions (ID-).
 * - Strategy and tactic AKPs say how: the DOJO concepts, skills, moods,
 *   states and habits, the BAR bars, elements and script frameworks (WS-
 *   script), the Grand 4 layers' instances for music (WM-), image (WI-) and
 *   video (WV-), and the UI/UX product AKPs (PR-, keeping the sheet's own IDs
 *   such as UO2 or SC1).
 *
 * Built from src/admin/data/generated/akpSource.ts (scripts/akp/extract.py
 * reads the workbooks) and stateFlips.ts; deterministic, no React. Each AKP's
 * `source` is "from <workbook / tab / ID>" or "drafted by us — to review".
 * Brand is a function with no AKPs yet: the marketing sheet has not arrived.
 *
 * Since U149 admins can edit the catalogue: akpEdits.ts keeps an overlay of
 * edits and akps() returns the merged view (baseAkps() is the generated one).
 */

import { readJson } from '../../lib/storage'
import { applyAkpEdits, akpEditsSchema, type AkpEdit, type AkpStatus, type AkpView } from './akpEdits'
import { AKP_SOURCE } from './generated/akpSource'
import { DRAFTED, conceptId, from, stateFlips, tokens, type StateFlip } from './stateFlips'

export type AkpFamily = 'goal' | 'identity' | 'product' | 'script' | 'music' | 'image' | 'video' | 'voice' | 'business' | 'brand' | 'analysis'
export type AkpFunction = 'wellness' | 'product' | 'identity' | 'brand' | 'business' | 'analysis'
/** goal: what to reach; strategy: how (levers, including tactics); measure: how an effect is read (Analysis). */
export type AkpKind = 'goal' | 'strategy' | 'measure'
export type Modality = 'Script' | 'Music' | 'Image' | 'Video' | 'Voice' | '—'
export type LinkType = 'drives' | 'step-of' | 'feeds' | 'part-of' | 'supports' | 'fed-by' | 'mirrors' | 'measures'

export const FAMILY: Record<AkpFamily, { prefix: string; label: string; fn: AkpFunction; kind: AkpKind }> = {
  goal: { prefix: 'WG', label: 'Goal', fn: 'wellness', kind: 'goal' },
  identity: { prefix: 'ID', label: 'Identity', fn: 'identity', kind: 'goal' },
  script: { prefix: 'WS', label: 'Script', fn: 'wellness', kind: 'strategy' },
  music: { prefix: 'WM', label: 'Music', fn: 'wellness', kind: 'strategy' },
  image: { prefix: 'WI', label: 'Image', fn: 'wellness', kind: 'strategy' },
  video: { prefix: 'WV', label: 'Video', fn: 'wellness', kind: 'strategy' },
  product: { prefix: 'PR', label: 'Product', fn: 'product', kind: 'strategy' },
  voice: { prefix: 'WN', label: 'Voice', fn: 'wellness', kind: 'strategy' },
  business: { prefix: 'BZ', label: 'Business', fn: 'business', kind: 'strategy' },
  brand: { prefix: 'BR', label: 'Brand', fn: 'brand', kind: 'strategy' },
  analysis: { prefix: 'AN', label: 'Analysis', fn: 'analysis', kind: 'measure' },
}
export const FAMILIES = Object.keys(FAMILY) as AkpFamily[]
export const FUNCTIONS: AkpFunction[] = ['wellness', 'product', 'business', 'brand', 'analysis', 'identity']
export const LINK_TEXT: Record<LinkType, string> = {
  drives: 'drives', 'step-of': 'is a step of', feeds: 'feeds', 'part-of': 'is part of', supports: 'supports', 'fed-by': 'is fed by', mirrors: 'mirrors', measures: 'measures',
}

export interface Akp {
  id: string
  name: string
  family: AkpFamily
  fn: AkpFunction
  kind: AkpKind
  layer: string
  modality: Modality
  description: string
  causalRole: string
  /** StateFlips (SF-…) this AKP serves. */
  flips: string[]
  links: { to: string; type: LinkType }[]
  source: string
  fromFile: boolean
  /** Draft from the generator; an admin can mark it reviewed or approved (U149). */
  status: AkpStatus
  /** Plain-language "used for" and "helps", written by an admin; generated from the fields when absent (akpEdits.ts usedForLine). */
  usedFor?: string
  helps?: string
  /** How its effect would be measured (v2, U150). */
  signal?: string
}

const S = AKP_SOURCE
const pad = (n: number, w = 2) => String(n).padStart(w, '0')
const slug = (s: string) => s.replace(/#/g, '-').replace(/[^A-Za-z0-9-]+/g, '-')

/* ----------------------------------------------- Drafted instances by us */

/**
 * Where a Grand 4 layer names fewer than three example instances, we draft
 * enough to make three, so each layer of each modality has something to show.
 * Every one is labelled "drafted by us — to review".
 */
const DRAFT_INSTANCES: Record<string, string[]> = {
  'Music|Musical Outcomes': ['Deep rest', 'Settled breathing', 'Lifted mood'],
  'Music|Musical Mechanisms': ['Tempo slowing', 'Breath-paced phrasing'],
  'Music|Musical Emotions & States': ['Calm', 'Warmth', 'Hope'],
  'Music|Compositional Methods': ['Generative ambient'],
  'Music|Compositional Frameworks': ['Entrainment model'],
  'Music|Sonic Personas (Archetypes)': ['Healer'],
  'Music|Sonic Environments': ['Night rain'],
  'Image|Visual Outcomes': ['Visual calm', 'Sense of safety', 'Wonder'],
  'Image|Visual Mechanisms': ['Slow visual rhythm'],
  'Image|Visual Mood & Symbolism': ['Dawn light', 'Still water', 'Open horizon'],
  'Image|Visual Methods': ['Soft focus'],
  'Image|Visual Techniques': ['Warm grading'],
  'Image|Visual Frameworks': ['Rule of calm space'],
  'Image|Visual Archetypes': ['The Guide'],
  'Image|Visual Styles & Tones': ['Warm earthy'],
  'Image|Lighting, Framing, Texture, Motion, Symbolism': ['Low-key lighting', 'Centred framing', 'Slow drift motion'],
  'Video|Video Outcomes': ['Settled body', 'Clear mind', 'Felt connection'],
  'Video|Narrative Dynamics': ['Slow reveal'],
  'Video|Cinematic Methods': ['Long take'],
  'Video|Cinematic Frameworks': ['Breath-synced editing'],
  'Video|Visual Archetypes': ['Healer'],
  'Video|Camera, Sound, Aspect, Edits': ['Locked-off camera', 'Room tone', 'Vertical 9:16'],
}

/** "Binaural, harmonic, ambient, etc." → ["Binaural", "Harmonic", "Ambient"]; a sentence without commas names no instances. */
export function examplesOf(text: string): string[] {
  if (!text.includes(',')) return []
  return text
    .split(',')
    .map((x) => x.replace(/\betc\.?$/i, '').replace(/\.$/, '').trim())
    .filter((x) => x && x.split(' ').length <= 3 && !/\d|×/.test(x))
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
}

/* --------------------------------------------------------- The builder */

const want = (text: string) => tokens(text)
/** The StateFlips whose words a strategy AKP shares most, at most `k`. */
function flipsByWords(fs: StateFlip[], text: string, k: number): string[] {
  const w = want(text)
  return fs
    .map((f, i) => {
      let s = 0
      for (const t of tokens(f.bad, f.good)) if (w.has(t)) s++
      return { id: f.id, s, i }
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, k)
    .map((x) => x.id)
}

let CACHE: Akp[] | undefined

/** The generated catalogue, before any admin edit. */
export function baseAkps(): Akp[] {
  if (CACHE) return CACHE
  const fs = stateFlips()
  const out: Akp[] = []
  const add = (a: Omit<Akp, 'fn' | 'kind' | 'status' | 'fromFile'> & { fn?: AkpFunction }) =>
    out.push({ ...a, fn: a.fn ?? FAMILY[a.family].fn, kind: FAMILY[a.family].kind, status: 'draft', fromFile: a.source.startsWith('from ') })

  /* Goals: 125 StateFlips and their steps. */
  for (const f of fs) {
    const id = f.id.replace(/^SF-/, 'WG-')
    add({ id, name: f.title, family: 'goal', layer: 'StateFlip', modality: '—', description: `From “${f.bad}” to “${f.good}”. Universal need: ${f.need.label}.`, causalRole: 'Target state: what a session’s chapters aim at.', flips: [f.id], links: [{ to: 'ID-G01', type: 'feeds' }], source: f.source })
    for (const m of f.milestones) {
      const sleep = f.id === 'SF-PHY-01'
      add({
        id: `${id}-${m.id}`, name: `${m.id}: ${m.title}`, family: 'goal', layer: `Step ${m.id} (${m.layer})`, modality: '—',
        description: `${m.what} Reached at a check-in score of ${m.threshold}.`, causalRole: `Milestone on the way to ${f.id}; the ${m.layer} layer moves most here.`,
        flips: [f.id], links: [{ to: id, type: 'step-of' }], source: sleep ? from('stateFlipSleep.ts (U140)', 'DOJO workbook', 'DOJO_M and Causal layering rows') : DRAFTED,
      })
    }
  }

  /* Identity: Grand 12 and Light 35. */
  S.identityGrand.forEach((g, i) => add({ id: `ID-G${pad(i + 1)}`, name: g.name, family: 'identity', layer: 'Grand 12', modality: '—', description: g.role, causalRole: g.downstream ? `Shapes: ${g.downstream}` : 'Shapes how sessions are chosen and framed.', flips: [], links: [], source: from('Wellness identity workbook', 'Grand', g.name) }))
  const lightId = new Map<string, string>()
  S.identityLight.forEach((l, i) => lightId.set(l.name, `ID-L${pad(i + 1)}`))
  S.identityLight.forEach((l) => add({ id: lightId.get(l.name)!, name: l.name, family: 'identity', layer: l.parent ? `Light · ${l.parent}` : 'Light (group)', modality: '—', description: l.role, causalRole: 'A finer identity signal the planner can read.', flips: [], links: l.parent ? [{ to: lightId.get(l.parent)!, type: 'part-of' }] : [], source: from('Wellness identity workbook', 'Light', l.name) }))

  /* Product AKPs, keeping the sheet's IDs. */
  const prodIds = new Set(S.product.map((p) => p.id))
  for (const p of S.product) {
    const up = /^([A-Z]{2}\d+)/.exec(p.upstream)?.[1]
    add({ id: `PR-${slug(p.id)}`, name: p.name, family: 'product', layer: p.dimension, modality: '—', description: p.role, causalRole: p.dimRole, flips: [], links: up && prodIds.has(up) ? [{ to: `PR-${up}`, type: 'fed-by' }] : [], source: from('UI/UX product AKPs workbook', p.dimension, p.id) })
  }

  /* Script: DOJO concepts (chakras C1–C7 and meridians), skills, moods, states, habits. */
  const scriptRole = (layer: string) => S.grand4.find((g) => g.modality === 'Script' && g.layer === layer)?.role ?? ''
  const flipsWithConcept = (cid: string) => fs.filter((f) => f.dojo.concepts.includes(cid)).map((f) => f.id)
  for (const [sheet, rows] of [['DOJO_C', S.dojoC], ['DOJO_M', S.dojoM]] as const) {
    const seen = new Map<string, number>()
    for (const c of rows) {
      const k = (seen.get(c.ves) ?? 0) + 1
      seen.set(c.ves, k)
      add({ id: `WS-${c.ves}-${pad(k)}`, name: c.name, family: 'script', layer: 'Concepts', modality: 'Script', description: `${c.objective} (${c.obstacle} → ${c.wellness}, frame ${c.frame.replace(/#\d$/, '')})`, causalRole: scriptRole('Concepts'), flips: flipsWithConcept(conceptId({ sheet, id: c.id })), links: [], source: from('DOJO workbook', sheet, c.id) })
    }
  }
  for (const s of S.skills) add({ id: `WS-${s.id}`, name: s.name, family: 'script', layer: 'Skills', modality: 'Script', description: s.role, causalRole: scriptRole('Skills'), flips: fs.filter((f) => f.dojo.skills.includes(s.id)).map((f) => f.id), links: [], source: from('DOJO workbook', 'DB-skills', s.id) })
  for (const m of S.moods) add({ id: `WS-${m.id}`, name: m.name, family: 'script', layer: 'Moods', modality: 'Script', description: m.role, causalRole: scriptRole('Moods'), flips: flipsByWords(fs, `${m.name} ${m.role}`, 3), links: [{ to: `WS-${m.parent}`, type: 'supports' }], source: from('DOJO workbook', 'DB-skills', m.id) })
  for (const st of S.states) add({ id: `WS-${st.id}`, name: st.name, family: 'script', layer: 'States', modality: 'Script', description: st.role, causalRole: 'Seconds to hours: the foundational layer moods build on.', flips: flipsByWords(fs, `${st.name} ${st.role}`, 2), links: [{ to: `WS-${st.parent}`, type: 'supports' }], source: from('DOJO workbook', 'DB-skills', st.id) })
  for (const h of S.habits) add({ id: `WS-${h.id}`, name: h.name, family: 'script', layer: 'Methods (habits)', modality: 'Script', description: h.role, causalRole: scriptRole('Methods'), flips: flipsByWords(fs, `${h.name} ${h.role}`, 3), links: [], source: from('DOJO workbook', 'DB-skills', h.id) })
  for (const fw of S.frameworks) add({ id: `WS-${fw.id}`, name: fw.name, family: 'script', layer: 'Frameworks', modality: 'Script', description: `${fw.focus}: ${fw.role}`, causalRole: scriptRole('Frameworks'), flips: [], links: [], source: from('BAR elements workbook', 'Frameworks KB', fw.id) })
  for (const b of S.bars) add({ id: `WS-${slug(b.id)}`, name: b.name, family: 'script', layer: 'Bars', modality: 'Script', description: `${b.segment}, ${b.phase}: ${b.role}`, causalRole: 'A block of a chapter’s script, in order.', flips: [], links: [], source: from('BAR elements workbook', 'BARS', b.id) })
  const barIds = new Set(S.bars.map((b) => b.id))
  for (const e of S.elements) add({ id: `WS-${slug(e.id)}`, name: e.name, family: 'script', layer: 'Elements', modality: 'Script', description: `${e.section}: ${e.role}`, causalRole: 'The smallest piece of a bar: a line or a pause.', flips: [], links: barIds.has(e.bar) ? [{ to: `WS-${slug(e.bar)}`, type: 'part-of' }] : [], source: from('BAR elements workbook', 'ELEMENTS', e.id) })

  /* Music, image, video: the Grand 4 layers' named instances, plus a few drafted. */
  const scriptMoods = new Map(S.moods.map((m) => [m.name.toLowerCase(), `WS-${m.id}`]))
  const counter: Record<string, number> = {}
  for (const g of S.grand4) {
    if (g.modality === 'Script') continue
    const family = g.modality.toLowerCase() as AkpFamily
    const fromSheet = examplesOf(g.examples)
    const drafted = (DRAFT_INSTANCES[`${g.modality}|${g.layer}`] ?? []).filter((x) => !fromSheet.includes(x))
    const code = g.layer.split(/[^A-Za-z]+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('').slice(0, 3)
    for (const [name, src] of [...fromSheet.map((x) => [x, from('Grand 4 layers workbook', g.modality, g.layer)] as const), ...drafted.map((x) => [x, DRAFTED] as const)]) {
      const key = `${FAMILY[family].prefix}-${code}`
      counter[key] = (counter[key] ?? 0) + 1
      const mood = scriptMoods.get(name.toLowerCase())
      add({
        id: `${key}${counter[key]}`, name, family, layer: g.layer, modality: g.modality as Modality, description: `${g.layer} (${g.hierarchy}): ${name}.`, causalRole: g.role,
        flips: flipsByWords(fs, name, 2), links: mood ? [{ to: mood, type: 'mirrors' }] : [], source: src,
      })
    }
  }

  /* v2 (U150): the rows scripts/akp/extract.py drafts (voice, more media and script, identity values, product, business, brand, analysis). */
  const WELLNESS_V2 = new Set<AkpFamily>(['script', 'music', 'image', 'video', 'voice'])
  const seen = new Set(out.map((a) => `${a.family}|${norm(a.name)}`))
  for (const r of S.v2) {
    const family = r.family as AkpFamily
    const key = `${family}|${norm(r.name)}`
    if (seen.has(key)) continue // a v1 AKP of the same family already says it
    seen.add(key)
    add({
      id: r.id, name: r.name, family, layer: r.layer, modality: r.modality as Modality, description: r.definition, causalRole: r.causal,
      usedFor: r.usedFor, helps: r.helps, signal: r.signal, flips: WELLNESS_V2.has(family) ? flipsByWords(fs, r.words, 3) : [],
      links: r.links.filter(([to]) => to).map(([to, type]) => ({ to, type: type as LinkType })), source: r.source,
    })
  }
  /* Analysis: one check-in marker per StateFlip (TheraGPS reads them to know where a person is on the route). */
  for (const f of fs) {
    const wg = f.id.replace(/^SF-/, 'WG-')
    add({
      id: `AN-CK-${f.id.slice(3)}`, name: `Check-in marker: ${f.title}`, family: 'analysis', layer: 'TheraGPS “Governor” · Route position', modality: '—',
      description: `The check-in score (0–100) for “${f.bad}” → “${f.good}”, asked before and after chapters; it says which of X, Y or Z the person has reached.`,
      causalRole: 'A measurement, not a lever: it places the person on the route and scores the chapter’s AKPs.', usedFor: 'knowing where a person is on their StateFlip', helps: 'route and re-route the journey',
      signal: `This is a measure: the StateFlip’s check-in questions (${f.measure.markers.length} markers), scored 0–100, before and after each chapter.`,
      flips: [f.id], links: [{ to: wg, type: 'measures' }], source: DRAFTED,
    })
  }
  finish(out, fs)
  return (CACHE = out)
}

/* ------------------------------------------------- v2 clean-up passes (U150) */

/** Normalised name: lower case, letters and digits only, for duplicate checks. */
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** The families a chapter needs one of each (the 2026-11-27 brief: script, music, voice, image). */
export const CHAPTER_FAMILIES: AkpFamily[] = ['script', 'voice', 'music', 'image']

/** Where a product dimension's output goes (the UI/UX sheet's Logic layers 0 → 4, drafted by us). */
const PRODUCT_DOWNSTREAM: Record<string, string> = {
  CS: 'UO', SC: 'UO', UO: 'UM', FF: 'UM', SA: 'ST', UM: 'IM', IM: 'NM', PS: 'NM', NM: 'IT', IT: 'DP', ST: 'DP', PE: 'DP', DP: 'CS',
  AX: 'ST', TS: 'FF', DV: 'CS', PZ: 'UM', MS: 'FF',
}

function bestByWords(cands: Akp[], text: string): Akp | undefined {
  const w = tokens(text)
  let top: Akp | undefined
  let topScore = 0
  for (const c of cands) {
    let n = 0
    for (const t of tokens(c.name)) if (w.has(t)) n++
    if (n > topScore) [top, topScore] = [c, n]
  }
  return top
}

/**
 * The roast's fixes, applied to the whole catalogue (v1 and v2) without
 * changing any id:
 * 1. names unique: the X / Y / Z steps carry their StateFlip; any other
 *    clash gets its layer, then its id, in brackets;
 * 2. every StateFlip can assemble a chapter: at least one script, voice,
 *    music and image AKP each (missing ones are given the least-used AKP of
 *    that family, so the load spreads; to review);
 * 3. every wellness strategy AKP serves at least one StateFlip (same rule);
 * 4. every AKP has at least one typed link.
 */
function finish(out: Akp[], fs: StateFlip[]) {
  const flipTitle = new Map(fs.map((f) => [f.id, f.title]))
  const byId = new Map(out.map((a) => [a.id, a]))
  // 1. Names.
  for (const a of out) if (a.family === 'goal' && a.layer.startsWith('Step ')) a.name = `${a.name} (${flipTitle.get(a.flips[0])})`
  const used = new Set<string>()
  for (const a of out) {
    if (used.has(norm(a.name))) a.name = `${a.name} (${a.layer.replace(/^Light · /, '')})`
    if (used.has(norm(a.name))) a.name = `${a.name.replace(/ \([^)]*\)$/, '')} (${a.id})`
    used.add(norm(a.name))
  }
  // 2 and 3. Flips, spreading the load.
  const load = new Map<string, number>(out.map((a) => [a.id, a.flips.length]))
  const give = (a: Akp, flip: string) => {
    if (a.flips.includes(flip)) return
    a.flips = [...a.flips, flip]
    load.set(a.id, (load.get(a.id) ?? 0) + 1)
  }
  const strategyOf = (fam: AkpFamily) => out.filter((a) => a.family === fam && a.kind === 'strategy')
  for (const fam of CHAPTER_FAMILIES) {
    const pool = strategyOf(fam)
    for (const f of fs) {
      if (pool.some((a) => a.flips.includes(f.id))) continue
      const pick = pool.reduce((m, a) => ((load.get(a.id) ?? 0) < (load.get(m.id) ?? 0) ? a : m), pool[0])
      give(pick, f.id)
    }
  }
  const flipLoad = new Map<string, number>(fs.map((f) => [f.id, 0]))
  for (const a of out) if (a.kind === 'strategy') for (const f of a.flips) flipLoad.set(f, (flipLoad.get(f) ?? 0) + 1)
  for (const a of out) {
    if (a.kind !== 'strategy' || a.fn !== 'wellness' || a.flips.length) continue
    const f = fs.reduce((m, x) => ((flipLoad.get(x.id) ?? 0) < (flipLoad.get(m.id) ?? 0) ? x : m), fs[0])
    give(a, f.id)
    flipLoad.set(f.id, (flipLoad.get(f.id) ?? 0) + 1)
  }
  // 4. Links.
  const grand = out.filter((a) => a.family === 'identity' && a.layer === 'Grand 12')
  const lightGroups = out.filter((a) => a.family === 'identity' && a.layer === 'Light (group)')
  const stages = out.filter((a) => a.layer === 'Funnel stage')
  for (const a of out) {
    if (a.links.length) continue
    if (a.flips.length && a.kind !== 'goal') {
      a.links = [{ to: a.flips[0].replace(/^SF-/, 'WG-'), type: a.kind === 'measure' ? 'measures' : 'drives' }]
    } else if (a.family === 'identity' && a.layer === 'Grand 12') {
      const g = bestByWords(lightGroups, `${a.name} ${a.description}`) ?? lightGroups[0]
      a.links = [{ to: g.id, type: 'fed-by' }]
    } else if (a.family === 'identity') {
      const g = bestByWords(grand, `${a.name} ${a.description}`) ?? grand[0]
      a.links = [{ to: g.id, type: 'feeds' }]
    } else if (a.family === 'product') {
      const code = /^PR-([A-Z]{2})\d/.exec(a.id)?.[1] ?? ''
      const down = out.filter((b) => b.family === 'product' && b.id !== a.id && new RegExp(`^PR-${PRODUCT_DOWNSTREAM[code] ?? 'UO'}\\d+$`).test(b.id))
      const t = bestByWords(down, `${a.name} ${a.description}`) ?? down[Number(/\d+/.exec(a.id)?.[0] ?? 1) % Math.max(1, down.length)]
      if (t) a.links = [{ to: t.id, type: 'feeds' }]
    } else if (a.layer === 'Funnel stage') {
      const i = stages.indexOf(a)
      a.links = [{ to: stages[(i + 1) % stages.length].id, type: 'feeds' }]
    } else if (a.family === 'brand') {
      const t = bestByWords(stages, `${a.name} ${a.description}`) ?? stages[0]
      a.links = [{ to: t.id, type: 'supports' }]
    } else if (a.family === 'analysis') {
      const pool = out.filter((b) => WELLNESS_STRATEGY.has(b.family))
      const t = bestByWords(pool, a.name) ?? byId.get('WG-PHY-01')!
      a.links = [{ to: t.id, type: 'measures' }]
    }
  }
}
const WELLNESS_STRATEGY = new Set<AkpFamily>(['script', 'music', 'image', 'video', 'voice'])

export const baseAkpById = (id: string) => baseAkps().find((a) => a.id === id)

/* ------------------------------------------------- Admin edits (U149) */

/**
 * The edits in force, replayed over the generated catalogue by
 * applyAkpEdits. Seeded from this browser's copy (localStorage) on first
 * read; akpEditsSync.ts replaces them when the shared store answers and
 * every change goes through setAkpEdits, so akps(), akpSummary() and the
 * report metrics always read the same merged view.
 */
export const AKP_EDITS_KEY = 'aurelia.admin.akpEdits'
let EDITS: AkpEdit[] | undefined
let MERGED: { edits: AkpEdit[]; all: AkpView[]; live: AkpView[]; byId: Map<string, AkpView> } | undefined
const listeners = new Set<() => void>()

export function getAkpEdits(): AkpEdit[] {
  return (EDITS ??= readJson(AKP_EDITS_KEY, akpEditsSchema, []))
}

export function setAkpEdits(next: AkpEdit[]) {
  if (next === EDITS) return
  EDITS = next
  for (const l of listeners) l()
}

export function subscribeAkpEdits(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

function merged() {
  const edits = getAkpEdits()
  if (MERGED?.edits === edits) return MERGED
  const all = applyAkpEdits(baseAkps(), edits)
  const live = all.filter((a) => !a.deleted)
  return (MERGED = { edits, all, live, byId: new Map(all.map((a) => [a.id, a])) })
}

/** The catalogue with the admin's edits applied, soft-deleted AKPs left out. What every list, graph and count reads. */
export function akps(): AkpView[] {
  return merged().live
}

/** Including soft-deleted ones (flagged `deleted`), for the editor's "show deleted". */
export function akpsWithDeleted(): AkpView[] {
  return merged().all
}

/** An AKP by id in the merged view; undefined when it does not exist or is deleted. */
export const akpById = (id: string): AkpView | undefined => {
  const a = merged().byId.get(id)
  return a && !a.deleted ? a : undefined
}
/** Like akpById, but finds soft-deleted AKPs too. */
export const akpByIdAny = (id: string): AkpView | undefined => merged().byId.get(id)

/* --------------------------------------------------------------- Summary */

export interface AkpSummary {
  total: number
  byFamily: Record<AkpFamily, number>
  byFunction: Record<AkpFunction, number>
  byKind: Record<AkpKind, number>
  fromFile: number
  drafted: number
  links: number
  /** StateFlips served by at least one strategy AKP. */
  flipsCovered: number
  /** StateFlips served by at least one strategy AKP other than a skill. */
  flipsCoveredBeyondSkills: number
  /** StateFlips with at least one script, voice, music and image AKP: a chapter can be assembled (v2, U150). */
  flipsChapterReady: number
  flips: number
}

export function akpSummary(): AkpSummary {
  const as = akps()
  const byFamily = Object.fromEntries(FAMILIES.map((f) => [f, as.filter((a) => a.family === f).length])) as Record<AkpFamily, number>
  const byFunction = Object.fromEntries(FUNCTIONS.map((f) => [f, as.filter((a) => a.fn === f).length])) as Record<AkpFunction, number>
  const strategy = as.filter((a) => a.kind === 'strategy')
  const measure = as.filter((a) => a.kind === 'measure').length
  const covered = new Set(strategy.flatMap((a) => a.flips))
  const beyond = new Set(strategy.filter((a) => a.layer !== 'Skills').flatMap((a) => a.flips))
  return {
    total: as.length, byFamily, byFunction,
    byKind: { goal: as.length - strategy.length - measure, strategy: strategy.length, measure },
    fromFile: as.filter((a) => a.fromFile).length,
    drafted: as.filter((a) => !a.fromFile).length,
    links: as.reduce((t, a) => t + a.links.filter((l) => akpById(l.to)).length, 0),
    flipsCovered: covered.size,
    flipsCoveredBeyondSkills: beyond.size,
    flipsChapterReady: stateFlips().filter((f) => CHAPTER_FAMILIES.every((fam) => strategy.some((a) => a.family === fam && a.flips.includes(f.id)))).length,
    flips: stateFlips().length,
  }
}

/** The AKPs that serve one StateFlip, strategy first, grouped by family. */
export function akpsForFlip(flipId: string): Akp[] {
  return akps().filter((a) => a.flips.includes(flipId) && !(a.family === 'goal' && a.layer !== 'StateFlip' && !a.id.startsWith(flipId.replace(/^SF-/, 'WG-'))))
}
