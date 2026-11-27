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
 */

import { AKP_SOURCE } from './generated/akpSource'
import { DRAFTED, conceptId, from, stateFlips, tokens, type StateFlip } from './stateFlips'

export type AkpFamily = 'goal' | 'identity' | 'product' | 'script' | 'music' | 'image' | 'video'
export type AkpFunction = 'wellness' | 'product' | 'identity' | 'brand'
export type AkpKind = 'goal' | 'strategy'
export type Modality = 'Script' | 'Music' | 'Image' | 'Video' | '—'
export type LinkType = 'step-of' | 'feeds' | 'part-of' | 'supports' | 'fed-by' | 'mirrors'

export const FAMILY: Record<AkpFamily, { prefix: string; label: string; fn: AkpFunction; kind: AkpKind }> = {
  goal: { prefix: 'WG', label: 'Goal', fn: 'wellness', kind: 'goal' },
  identity: { prefix: 'ID', label: 'Identity', fn: 'identity', kind: 'goal' },
  script: { prefix: 'WS', label: 'Script', fn: 'wellness', kind: 'strategy' },
  music: { prefix: 'WM', label: 'Music', fn: 'wellness', kind: 'strategy' },
  image: { prefix: 'WI', label: 'Image', fn: 'wellness', kind: 'strategy' },
  video: { prefix: 'WV', label: 'Video', fn: 'wellness', kind: 'strategy' },
  product: { prefix: 'PR', label: 'Product', fn: 'product', kind: 'strategy' },
}
export const FAMILIES = Object.keys(FAMILY) as AkpFamily[]
export const FUNCTIONS: AkpFunction[] = ['wellness', 'product', 'identity', 'brand']
export const LINK_TEXT: Record<LinkType, string> = {
  'step-of': 'is a step of', feeds: 'feeds', 'part-of': 'is part of', supports: 'supports', 'fed-by': 'is fed by', mirrors: 'mirrors',
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
  status: 'draft'
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

export function akps(): Akp[] {
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
  return (CACHE = out)
}

export const akpById = (id: string) => akps().find((a) => a.id === id)

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
  flips: number
}

export function akpSummary(): AkpSummary {
  const as = akps()
  const byFamily = Object.fromEntries(FAMILIES.map((f) => [f, as.filter((a) => a.family === f).length])) as Record<AkpFamily, number>
  const byFunction = Object.fromEntries(FUNCTIONS.map((f) => [f, as.filter((a) => a.fn === f).length])) as Record<AkpFunction, number>
  const strategy = as.filter((a) => a.kind === 'strategy')
  const covered = new Set(strategy.flatMap((a) => a.flips))
  const beyond = new Set(strategy.filter((a) => a.layer !== 'Skills').flatMap((a) => a.flips))
  return {
    total: as.length, byFamily, byFunction,
    byKind: { goal: as.length - strategy.length, strategy: strategy.length },
    fromFile: as.filter((a) => a.fromFile).length,
    drafted: as.filter((a) => !a.fromFile).length,
    links: as.reduce((t, a) => t + a.links.length, 0),
    flipsCovered: covered.size,
    flipsCoveredBeyondSkills: beyond.size,
    flips: stateFlips().length,
  }
}

/** The AKPs that serve one StateFlip, strategy first, grouped by family. */
export function akpsForFlip(flipId: string): Akp[] {
  return akps().filter((a) => a.flips.includes(flipId) && !(a.family === 'goal' && a.layer !== 'StateFlip' && !a.id.startsWith(flipId.replace(/^SF-/, 'WG-'))))
}
