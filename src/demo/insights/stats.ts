import type { ClickEvent } from './tracker'

/**
 * The element-level read of Click insights (U034): every control people
 * tapped on a screen, one row each, with how many tapped it, how soon, what
 * it did, and where on it the finger landed — so the report says "the Join
 * pill in Monthly Challenge, 41% of visitors, mostly its left edge, opens the
 * challenge", not just "/explore was opened".
 */
export interface ElementStat {
  key: string
  page: string
  label: string
  kind: string
  section: string
  sel?: string
  taps: ClickEvent[]
  sessions: number
  /** Sessions that opened this screen at all. */
  viewers: number
  medianMs?: number
  medianDepth?: number
  navigated: number
  changed: number
  nothing: number
  rage: number
  dead: number
  topTo?: [string, number]
}

export const median = (values: number[]) => {
  if (!values.length) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export function countBy<T>(items: T[], key: (item: T) => string | undefined) {
  const map = new Map<string, number>()
  for (const item of items) {
    const k = key(item)
    if (k !== undefined) map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

export const layoutOf = (vw: number) => (vw < 640 ? 'mobile' : vw < 1024 ? 'tablet' : 'desktop')

/** Events before U034 have no element detail; fall back to label/tag. */
const kindOf = (e: ClickEvent) => e.kind ?? (e.label?.startsWith('(not a control)') ? 'not a control' : e.tag === 'a' ? 'link' : e.tag ?? '?')

export function elementStats(events: ClickEvent[]): ElementStat[] {
  const viewersByPage = new Map<string, Set<string>>()
  for (const e of events) {
    if (e.type !== 'view') continue
    if (!viewersByPage.has(e.page)) viewersByPage.set(e.page, new Set())
    viewersByPage.get(e.page)!.add(e.sid)
  }
  const groups = new Map<string, ClickEvent[]>()
  for (const e of events) {
    if (e.type !== 'click') continue
    const key = `${e.page}|${e.sel ?? e.label ?? e.tag}`
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups.entries()]
    .map(([key, taps]) => {
      const first = taps[taps.length - 1]
      const sessions = new Set(taps.map((t) => t.sid)).size
      return {
        key,
        page: first.page,
        label: countBy(taps, (t) => t.label)[0]?.[0] ?? first.tag ?? '?',
        kind: countBy(taps, kindOf)[0]?.[0] ?? '?',
        section: countBy(taps, (t) => t.section)[0]?.[0] ?? '—',
        sel: first.sel,
        taps,
        sessions,
        viewers: Math.max(viewersByPage.get(first.page)?.size ?? 0, sessions),
        medianMs: median(taps.flatMap((t) => (t.ms === undefined ? [] : [t.ms]))),
        medianDepth: median(taps.flatMap((t) => (t.sy === undefined ? [] : [t.sy]))),
        navigated: taps.filter((t) => t.fx === 'navigated').length,
        changed: taps.filter((t) => t.fx === 'changed').length,
        nothing: taps.filter((t) => t.fx === 'nothing').length,
        rage: taps.filter((t) => t.rage).length,
        dead: taps.filter((t) => t.dead || t.label?.startsWith('(not a control)')).length,
        topTo: countBy(taps, (t) => t.to)[0],
      }
    })
    .sort((a, b) => b.taps.length - a.taps.length)
}

export const seconds = (ms?: number) =>
  ms === undefined ? '—' : ms < 1000 ? `${ms}ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 60000)}m`

export const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : '—')

export function heatmapUrl(page: string, sel?: string) {
  return `${page}?heatmap=elements${sel ? `&el=${encodeURIComponent(sel)}` : ''}`
}
