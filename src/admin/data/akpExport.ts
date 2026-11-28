/**
 * The AKP catalogue as flat files (U150, J208): one row per AKP and one row
 * per typed link. Used by the "Download catalogue" buttons (with the admin's
 * edits applied) and by the export in docs/akp/ (scripts/akp/export.py reads
 * the JSON that akpExport.test.ts writes). Pure, apart from downloadText.
 */

import type { Akp } from './akps'

export const AKP_COLUMNS = ['id', 'name', 'function', 'family', 'kind', 'layer', 'modality', 'definition', 'used_for', 'helps', 'causal_role', 'signal', 'stateflips', 'links', 'source', 'status'] as const
export const LINK_COLUMNS = ['from', 'type', 'to', 'from_name', 'to_name'] as const

/** One AKP as a flat record, in AKP_COLUMNS order. */
export function akpRecord(a: Akp): Record<(typeof AKP_COLUMNS)[number], string> {
  return {
    id: a.id, name: a.name, function: a.fn, family: a.family, kind: a.kind, layer: a.layer, modality: a.modality === '—' ? '' : a.modality,
    definition: a.description, used_for: a.usedFor ?? '', helps: a.helps ?? '', causal_role: a.causalRole, signal: a.signal ?? '',
    stateflips: a.flips.join(' '), links: a.links.map((l) => `${l.type}:${l.to}`).join(' '), source: a.source, status: a.status,
  }
}

const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const csv = (rows: string[][]) => rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'

export function akpsCsv(as: readonly Akp[]): string {
  return csv([[...AKP_COLUMNS], ...as.map((a) => AKP_COLUMNS.map((k) => akpRecord(a)[k]))])
}

export function akpLinksCsv(as: readonly Akp[]): string {
  const name = new Map(as.map((a) => [a.id, a.name]))
  return csv([[...LINK_COLUMNS], ...as.flatMap((a) => a.links.map((l) => [a.id, l.type, l.to, a.name, name.get(l.to) ?? '']))])
}

/** Saves text as a file in the browser (UTF-8 with a BOM, so Excel reads the accents). */
export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
