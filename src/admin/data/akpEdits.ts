/**
 * Editable AKPs (U149, J207): an overlay of edits on top of the generated
 * catalogue. The catalogue (akps.ts, built from generated/akpSource.ts) is
 * never changed; what an admin adds, edits, deletes or links is kept here as
 * an ordered list of edits, each with who made it, when and what changed.
 * `applyAkpEdits(base, edits)` replays them into the merged view that the
 * catalogue list, the graph, the StateFlip links and the report metrics read.
 *
 * Pure: no React, no storage, no network. The store (akps.ts) and the sync
 * (akpEditsSync.ts) sit on top. Only types are imported from akps.ts, so the
 * two modules do not import each other at runtime; the small family table
 * below is restated and a test keeps it equal to akps.ts's FAMILY.
 */

import { z } from 'zod'
import type { Akp, AkpFamily, AkpFunction, AkpKind, LinkType, Modality } from './akps'

export const AKP_FAMILY_IDS = ['goal', 'identity', 'script', 'music', 'image', 'video', 'product'] as const satisfies readonly AkpFamily[]
export const AKP_FUNCTION_IDS = ['wellness', 'product', 'identity', 'brand'] as const satisfies readonly AkpFunction[]
export const AKP_MODALITIES = ['Script', 'Music', 'Image', 'Video', '—'] as const satisfies readonly Modality[]
export const AKP_LINK_TYPES = ['drives', 'supports', 'part-of', 'step-of', 'feeds', 'fed-by', 'mirrors'] as const satisfies readonly LinkType[]
export const AKP_STATUSES = ['draft', 'reviewed', 'approved'] as const
export type AkpStatus = (typeof AKP_STATUSES)[number]

/** Kind and default function per family; equal to FAMILY in akps.ts (tested). */
export const FAMILY_KIND: Record<AkpFamily, { kind: AkpKind; fn: AkpFunction; prefix: string }> = {
  goal: { kind: 'goal', fn: 'wellness', prefix: 'WG' },
  identity: { kind: 'goal', fn: 'identity', prefix: 'ID' },
  script: { kind: 'strategy', fn: 'wellness', prefix: 'WS' },
  music: { kind: 'strategy', fn: 'wellness', prefix: 'WM' },
  image: { kind: 'strategy', fn: 'wellness', prefix: 'WI' },
  video: { kind: 'strategy', fn: 'wellness', prefix: 'WV' },
  product: { kind: 'strategy', fn: 'product', prefix: 'PR' },
}

/* ---------------------------------------------------------------- Schema */

export const MAX_EDITS = 2000
/** Serialised size cap, the same on the server (api/akp-edits.ts). */
export const MAX_EDITS_BYTES = 900_000

const akpId = z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/)
const flipId = z.string().regex(/^SF-[A-Z]+-\d{2}$/)

export const akpFieldsSchema = z
  .object({
    name: z.string().min(1).max(200),
    family: z.enum(AKP_FAMILY_IDS),
    fn: z.enum(AKP_FUNCTION_IDS),
    layer: z.string().max(120),
    modality: z.enum(AKP_MODALITIES),
    description: z.string().max(2000),
    usedFor: z.string().max(300),
    helps: z.string().max(300),
    causalRole: z.string().max(1000),
    flips: z.array(flipId).max(125),
    status: z.enum(AKP_STATUSES),
  })
  .partial()
export type AkpFields = z.infer<typeof akpFieldsSchema>
export type AkpField = keyof AkpFields
export const AKP_FIELDS: AkpField[] = ['name', 'family', 'fn', 'layer', 'modality', 'status', 'description', 'usedFor', 'helps', 'causalRole', 'flips']
export const FIELD_LABEL: Record<AkpField, string> = {
  name: 'Name', family: 'Family', fn: 'Function', layer: 'Layer', modality: 'Modality', status: 'Status', description: 'Description',
  usedFor: 'Used for', helps: 'Helps', causalRole: 'Causal role', flips: 'StateFlips served',
}

const meta = { id: z.string().min(1).max(40), at: z.string().min(1).max(40), by: z.string().min(1).max(60), akp: akpId }

export const akpEditSchema = z.discriminatedUnion('op', [
  z.object({ ...meta, op: z.literal('add'), value: akpFieldsSchema.required({ name: true, family: true }) }),
  z.object({ ...meta, op: z.literal('update'), set: akpFieldsSchema, prev: akpFieldsSchema.catch({}) }),
  z.object({ ...meta, op: z.literal('delete') }),
  z.object({ ...meta, op: z.literal('restore') }),
  z.object({ ...meta, op: z.literal('link-add'), to: akpId, type: z.enum(AKP_LINK_TYPES) }),
  z.object({ ...meta, op: z.literal('link-remove'), to: akpId, type: z.enum(AKP_LINK_TYPES) }),
])
export type AkpEdit = z.infer<typeof akpEditSchema>

export const akpEditsSchema = z.array(akpEditSchema).max(MAX_EDITS)

/** The export file: what "Export JSON" writes and "Import JSON" reads. */
export const akpEditsFileSchema = z.object({ kind: z.literal('aurelia-akp-edits'), version: z.literal(1), exportedAt: z.string().max(40).optional(), edits: akpEditsSchema })
export type AkpEditsFile = z.infer<typeof akpEditsFileSchema>

export function akpEditsFile(edits: AkpEdit[], now = new Date()): AkpEditsFile {
  return { kind: 'aurelia-akp-edits', version: 1, exportedAt: now.toISOString(), edits }
}

/**
 * Reads an exported file (or a bare array of edits). Anything malformed, too
 * large or naming a field this version does not know is refused as a whole,
 * with the first problem in plain words: a partial import would replay edits
 * out of their order.
 */
export function parseAkpEditsImport(text: string): { ok: true; edits: AkpEdit[] } | { ok: false; error: string } {
  if (text.length > MAX_EDITS_BYTES) return { ok: false, error: `The file is larger than ${Math.round(MAX_EDITS_BYTES / 1000)} kB.` }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This is not a JSON file.' }
  }
  const parsed = Array.isArray(raw) ? akpEditsSchema.safeParse(raw) : akpEditsFileSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const where = issue?.path.length ? ` at ${issue.path.join('.')}` : ''
    return { ok: false, error: `Not an AKP edits file${where}: ${issue?.message ?? 'wrong shape'}.` }
  }
  return { ok: true, edits: Array.isArray(parsed.data) ? parsed.data : parsed.data.edits }
}

/* ----------------------------------------------------------------- Apply */

export interface AkpView extends Akp {
  /** Soft-deleted: hidden from the catalogue, the graph and the counts, restorable. */
  deleted: boolean
  /** Changed by at least one edit (its own fields, links or deletion). */
  edited: boolean
  /** Added in the admin, not in the generated catalogue. */
  added: boolean
}

function blank(id: string, v: AkpFields & { name: string; family: AkpFamily }, by: string): AkpView {
  const fam = FAMILY_KIND[v.family]
  return {
    id, name: v.name, family: v.family, fn: v.fn ?? fam.fn, kind: fam.kind, layer: v.layer ?? '', modality: v.modality ?? '—',
    description: v.description ?? '', causalRole: v.causalRole ?? '', usedFor: v.usedFor, helps: v.helps, flips: v.flips ?? [], links: [],
    source: `added in the admin by ${by}`, fromFile: false, status: v.status ?? 'draft', deleted: false, edited: true, added: true,
  }
}

function setFields(a: AkpView, set: AkpFields): AkpView {
  const next: AkpView = { ...a, edited: true }
  for (const k of AKP_FIELDS) {
    if (set[k] === undefined) continue
    ;(next as unknown as Record<string, unknown>)[k] = k === 'flips' ? [...(set.flips ?? [])] : set[k]
  }
  if (set.family) next.kind = FAMILY_KIND[set.family].kind
  return next
}

/**
 * Replays `edits` over `base`, in order, without touching `base`. An edit that
 * no longer applies (an update to an AKP that does not exist, an add whose id
 * is taken, a link to itself) is skipped rather than failing the rest.
 */
export function applyAkpEdits(base: readonly Akp[], edits: readonly AkpEdit[]): AkpView[] {
  const order = base.map((a) => a.id)
  const map = new Map<string, AkpView>(base.map((a) => [a.id, { ...a, deleted: false, edited: false, added: false }]))
  for (const e of edits) {
    const cur = map.get(e.akp)
    switch (e.op) {
      case 'add':
        if (cur) break
        map.set(e.akp, blank(e.akp, e.value, e.by))
        order.push(e.akp)
        break
      case 'update':
        if (cur) map.set(e.akp, setFields(cur, e.set))
        break
      case 'delete':
      case 'restore':
        if (cur) map.set(e.akp, { ...cur, deleted: e.op === 'delete', edited: true })
        break
      case 'link-add':
        if (cur && e.to !== e.akp && !cur.links.some((l) => l.to === e.to && l.type === e.type)) map.set(e.akp, { ...cur, links: [...cur.links, { to: e.to, type: e.type }], edited: true })
        break
      case 'link-remove':
        if (cur && cur.links.some((l) => l.to === e.to && l.type === e.type)) map.set(e.akp, { ...cur, links: cur.links.filter((l) => !(l.to === e.to && l.type === e.type)), edited: true })
        break
    }
  }
  return order.map((id) => map.get(id)!)
}

/* --------------------------------------------------------- Edit helpers */

let seq = 0
/** A short, unique-enough id for one edit (time + counter + random). */
export function editId(now = Date.now()): string {
  seq = (seq + 1) % 1296
  return `${now.toString(36)}${seq.toString(36).padStart(2, '0')}${Math.random().toString(36).slice(2, 6)}`
}

export function makeEdit<T extends AkpEdit['op']>(op: T, akp: string, by: string, rest: Omit<Extract<AkpEdit, { op: T }>, 'id' | 'at' | 'by' | 'akp' | 'op'>, now = new Date()): Extract<AkpEdit, { op: T }> {
  return { id: editId(now.getTime()), at: now.toISOString(), by: by.trim().slice(0, 60) || 'admin', akp, op, ...rest } as Extract<AkpEdit, { op: T }>
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '')

/** The fields of `next` that differ from `a`, as `set` and `prev` for one update edit; null when nothing changed. */
export function diffFields(a: AkpView, next: AkpFields): { set: AkpFields; prev: AkpFields } | null {
  const set: Record<string, unknown> = {}
  const prev: Record<string, unknown> = {}
  for (const k of AKP_FIELDS) {
    if (next[k] === undefined) continue
    const before = (a as unknown as Record<string, unknown>)[k]
    if (same(before, next[k])) continue
    set[k] = next[k]
    prev[k] = before ?? ''
  }
  return Object.keys(set).length ? { set: set as AkpFields, prev: akpFieldsSchema.catch({}).parse(prev) } : null
}

/** Every edit whose subject is `id`, oldest first. */
export const editsFor = (edits: readonly AkpEdit[], id: string) => edits.filter((e) => e.akp === id)
/** "Revert to original": drops every edit made to one AKP. */
export const revertAkp = (edits: readonly AkpEdit[], id: string) => edits.filter((e) => e.akp !== id)

/** The next free id for an AKP added in the admin, e.g. WS-NEW3. */
export function nextAkpId(family: AkpFamily, taken: (id: string) => boolean): string {
  const p = FAMILY_KIND[family].prefix
  for (let i = 1; ; i++) if (!taken(`${p}-NEW${i}`)) return `${p}-NEW${i}`
}

const show = (v: unknown) => (Array.isArray(v) ? v.join(', ') || 'none' : v === undefined || v === '' ? 'empty' : String(v))

/** One edit in plain words, for the history list: "Name: “A” → “B”". */
export function describeEdit(e: AkpEdit): string {
  switch (e.op) {
    case 'add':
      return `Added “${e.value.name}”`
    case 'update':
      return (Object.keys(e.set) as AkpField[]).map((k) => `${FIELD_LABEL[k]}: “${show(e.prev[k])}” → “${show(e.set[k])}”`).join('; ')
    case 'delete':
      return 'Deleted (restorable)'
    case 'restore':
      return 'Restored'
    case 'link-add':
      return `Link added: ${e.type} ${e.to}`
    case 'link-remove':
      return `Link removed: ${e.type} ${e.to}`
  }
}

/* ------------------------------------------------- Easy to understand */

const lower = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)

/** What the AKP is used for, generated from its fields when nobody has written it. */
export function defaultUsedFor(a: Pick<Akp, 'family' | 'layer' | 'modality'>): string {
  const layer = lower(a.layer.replace(/\s*\(.*\)$/, '')) || 'a piece'
  switch (a.family) {
    case 'goal':
      return a.layer === 'StateFlip' ? 'the change a session aims at' : `a step on the way (${layer})`
    case 'identity':
      return `reading who the person is (${layer})`
    case 'product':
      return `the app experience (${layer})`
    default:
      return `the ${a.modality === '—' ? a.family : a.modality.toLowerCase()} of a chapter (${layer})`
  }
}

/** Who or what it helps, generated from the StateFlips it serves. */
export function defaultHelps(a: Pick<Akp, 'family' | 'flips' | 'kind'>, flipTitle: (id: string) => string | undefined): string {
  if (a.flips.length) {
    const first = flipTitle(a.flips[0]) ?? a.flips[0]
    return a.flips.length === 1 ? lower(first) : `${lower(first)} and ${a.flips.length - 1} more`
  }
  if (a.family === 'product') return 'every session feel easy'
  if (a.family === 'identity') return 'choose and frame sessions'
  return a.kind === 'goal' ? 'the person get there' : 'no goal linked yet'
}

/** The one-line sentence on every AKP: "Used for … · helps …". */
export function usedForLine(a: Pick<Akp, 'family' | 'layer' | 'modality' | 'flips' | 'kind' | 'usedFor' | 'helps'>, flipTitle: (id: string) => string | undefined): string {
  return `Used for ${a.usedFor?.trim() || defaultUsedFor(a)} · helps ${a.helps?.trim() || defaultHelps(a, flipTitle)}`
}
