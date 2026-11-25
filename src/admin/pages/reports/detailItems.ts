import { DEFAULT_DECISIONS, STATUS_LABEL } from '../../data/businessFunnel'
import type { MapNode } from '../../data/iterationMap'
import { COLUMN_TITLE } from '../../data/iterationMap'
import { SOURCES, type SourceId } from '../../data/reportSources'
import type { ReportSummary, Tile } from '../../data/reportSummaries'
import type { DetailItem } from './DetailDrawer'

/* What the reports drawer shows for each kind of thing (U129, J182). Pure, so it stays out of the component files. */

export function decisionItem(id: string): DetailItem {
  const d = DEFAULT_DECISIONS.find((x) => x.id === id)
  if (!d) return { title: 'Decision not found', to: '/admin/business-funnel', toLabel: 'Open the decision log' }
  return {
    kicker: 'Decision',
    title: d.change,
    summary: `Why: ${d.finding}`,
    numbers: [{ label: 'Status', value: STATUS_LABEL[d.status] }, { label: 'Logged', value: d.date }, { label: 'Where it came from', value: d.source }, ...(d.version ? [{ label: 'Shipped in', value: d.version }] : [])],
    labels: ['document'],
    to: '/admin/business-funnel',
    toLabel: 'Open the decision log',
  }
}

export function sourceItem(id: SourceId, cite?: string): DetailItem {
  const s = SOURCES[id]
  return {
    kicker: 'Source',
    title: s.name,
    summary: s.what,
    numbers: [{ label: 'Version', value: s.version }, { label: 'Taken from it', value: s.taken }, ...(cite ? [{ label: 'Cited here', value: cite }] : [])],
    labels: [s.label],
    to: s.link,
    toLabel: 'Open the source',
  }
}

export function nodeItem(n: MapNode): DetailItem {
  return { kicker: COLUMN_TITLE[n.column], title: n.title, summary: n.summary, numbers: n.numbers, labels: n.labels, to: n.to, toLabel: n.toLabel }
}

export function tileItem(t: Tile, s: ReportSummary): DetailItem {
  return {
    kicker: 'Key number',
    title: t.label,
    summary: t.note,
    numbers: [{ label: 'Value', value: t.value }, ...(t.delta ? [{ label: 'Change', value: t.delta }] : [])],
    labels: [t.badge],
    to: s.detail.to,
    toLabel: s.detail.label,
  }
}

export function reportItem(title: string, to: string, s: ReportSummary): DetailItem {
  return {
    kicker: 'Report',
    title,
    summary: `Goal: ${s.goal} ${s.headline}`,
    numbers: s.tiles.map((t) => ({ label: t.label, value: t.value })),
    labels: [...new Set(s.tiles.map((t) => t.badge))],
    to,
    toLabel: 'Open full page',
  }
}
