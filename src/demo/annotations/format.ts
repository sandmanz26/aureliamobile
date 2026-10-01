/**
 * Review annotations — the data shape and its .txt round trip.
 *
 * The file is meant to be read by a person (opened in any text editor, pasted
 * into a ticket) and still parse back losslessly:
 *
 *   # Aurelia review annotations
 *   # version: 1
 *   # exported: 2026-10-01T07:06:00.000Z
 *
 *   --- #1 a8f3k2
 *   page: /chat
 *   pos: 42.5, 61.2
 *   viewport: 390x844
 *   scroll: 240
 *   created: 2026-10-01T07:01:12.000Z
 *   updated: 2026-10-01T07:02:40.000Z
 *   note:
 *   Bubble sits too close
 *   to the composer.
 *
 * A note line that happens to start with "--- #" or "\" is written with a
 * leading "\" and unescaped on read. CRLF files (saved again from Notepad)
 * parse the same.
 */

export type Annotation = {
  id: string
  /** The route's pathname — "/chat", "/play/dolphins-frequency". */
  page: string
  /** Percent of the viewport (0–100), so a pin lands on the same area on another phone width. */
  x: number
  y: number
  /** Viewport the note was written at — context for whoever reads the file. */
  vw: number
  vh: number
  /**
   * `window.scrollY` when the pin was placed (or last dragged). `y` alone is
   * only a fraction of one screenful — without this, a pin rendered content-
   * relative would land wherever the page happened to be scrolled to on
   * reload, not where it was dropped. Added together they give the pin's
   * fixed spot in the full document: `scrollY + (y / 100) * vh`.
   */
  scrollY: number
  text: string
  createdAt: string
  updatedAt: string
}

const HEADER = '# Aurelia review annotations'
const BLOCK = '--- #'

export function newAnnotationId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3)
}

const clampPct = (n: number) => Math.min(100, Math.max(0, Number.isFinite(n) ? n : 50))
const escapeLine = (line: string) => (line.startsWith(BLOCK) || line.startsWith('\\') ? `\\${line}` : line)
const unescapeLine = (line: string) => (line.startsWith('\\') ? line.slice(1) : line)

/** By page, then top to bottom — the order a reviewer reads a screen in. */
export function sortAnnotations(list: Annotation[]): Annotation[] {
  return [...list].sort((a, b) =>
    a.page === b.page ? a.y - b.y || a.x - b.x : a.page.localeCompare(b.page),
  )
}

export function serializeAnnotations(list: Annotation[]): string {
  const out: string[] = [HEADER, '# version: 1', `# exported: ${new Date().toISOString()}`, '']
  sortAnnotations(list).forEach((a, i) => {
    out.push(
      `${BLOCK}${i + 1} ${a.id}`,
      `page: ${a.page}`,
      `pos: ${a.x.toFixed(1)}, ${a.y.toFixed(1)}`,
      `viewport: ${Math.round(a.vw)}x${Math.round(a.vh)}`,
      `scroll: ${Math.round(a.scrollY)}`,
      `created: ${a.createdAt}`,
      `updated: ${a.updatedAt}`,
      'note:',
      ...(a.text ? a.text.replace(/\r\n?/g, '\n').split('\n').map(escapeLine) : []),
      '',
    )
  })
  return out.join('\n')
}

export function parseAnnotations(raw: string): Annotation[] {
  const lines = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n')
  const result: Annotation[] = []
  let current: Partial<Annotation> | null = null
  let note: string[] | null = null

  const flush = () => {
    if (!current) return
    const now = new Date().toISOString()
    while (note && note.length && note[note.length - 1] === '') note.pop()
    result.push({
      id: current.id || newAnnotationId(),
      page: current.page || '/',
      x: clampPct(current.x ?? 50),
      y: clampPct(current.y ?? 50),
      vw: current.vw || 0,
      vh: current.vh || 0,
      // Older exports (before scroll was tracked) have no line for it — 0 is
      // the right default anyway, since those pins were meant to be read at
      // the top of the page.
      scrollY: current.scrollY || 0,
      text: (note ?? []).join('\n'),
      createdAt: current.createdAt || now,
      updatedAt: current.updatedAt || current.createdAt || now,
    })
    current = null
    note = null
  }

  for (const line of lines) {
    if (line.startsWith(BLOCK)) {
      flush()
      current = { id: line.slice(BLOCK.length).trim().split(/\s+/)[1] }
      continue
    }
    if (!current) continue // the header, or anything above the first block
    if (note) {
      note.push(unescapeLine(line))
      continue
    }
    const match = line.match(/^(\w+):\s?(.*)$/)
    if (!match) continue
    const [, key, value] = match
    switch (key) {
      case 'page':
        current.page = value.trim() || '/'
        break
      case 'pos': {
        const [x, y] = value.split(',').map((s) => parseFloat(s))
        current.x = x
        current.y = y
        break
      }
      case 'viewport': {
        const [w, h] = value.toLowerCase().split('x').map((s) => parseInt(s, 10))
        current.vw = w || 0
        current.vh = h || 0
        break
      }
      case 'scroll':
        current.scrollY = parseInt(value, 10) || 0
        break
      case 'created':
        current.createdAt = value.trim()
        break
      case 'updated':
        current.updatedAt = value.trim()
        break
      case 'note':
        note = value ? [unescapeLine(value)] : []
        break
    }
  }
  flush()
  return result
}

export function annotationsFileName(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `aurelia-annotations-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.txt`
}
