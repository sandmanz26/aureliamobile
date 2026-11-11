/**
 * Turns a guide's HTML (the admin guideline fragment, or Markdown already
 * rendered by `marked`) into what GuidePage shows: headings get stable ids,
 * tables get a scrolling wrapper, links that only make sense inside the
 * repository become plain text, and a contents list is collected with the
 * text each entry covers, so search can match a section by what it says.
 */

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
  /** Lower-cased text of the heading and everything under it, for search. */
  search: string
}

export interface PreparedDoc {
  html: string
  toc: TocEntry[]
}

export function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section'
  // An id that starts with a digit is awkward in CSS selectors: prefix it.
  const stem = /^\d/.test(base) ? `s-${base}` : base
  let id = stem
  let n = 2
  while (used.has(id)) id = `${stem}-${n++}`
  used.add(id)
  return id
}

/** Text from `start` (exclusive) up to the next heading at `level` or above. */
function sectionText(start: Element, level: number): string {
  let text = start.textContent ?? ''
  let node = start.nextElementSibling
  while (node) {
    const m = /^H([1-6])$/.exec(node.tagName)
    if (m && Number(m[1]) <= level) break
    text += ' ' + (node.textContent ?? '')
    node = node.nextElementSibling
  }
  return text
}

export function prepareDoc(html: string): PreparedDoc {
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html')
  const root = doc.getElementById('root')
  if (!root) return { html, toc: [] }

  const used = new Set<string>()
  root.querySelectorAll('[id]').forEach((el) => used.add(el.id))

  const toc: TocEntry[] = []
  root.querySelectorAll('h2, h3').forEach((h) => {
    const level = h.tagName === 'H2' ? 2 : 3
    const text = (h.textContent ?? '').trim()
    if (!text) return
    // A module card in the admin guideline: the card is the anchor and the
    // card's whole text is what search matches.
    const card = level === 3 ? h.closest('section[id]') : null
    if (card && card.querySelector('h3') === h) {
      toc.push({ id: card.id, text, level: 3, search: (card.textContent ?? '').toLowerCase() })
      return
    }
    if (!h.id) h.id = slugify(text, used)
    toc.push({ id: h.id, text, level, search: sectionText(h, level).toLowerCase() })
  })

  root.querySelectorAll('table').forEach((t) => {
    if (t.parentElement?.classList.contains('table-wrap')) return
    const wrap = doc.createElement('div')
    wrap.className = 'table-wrap'
    t.replaceWith(wrap)
    wrap.appendChild(t)
  })

  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    // In-app paths (/guide, /admin …) are routed by GuidePage.
    if (href.startsWith('#') || href.startsWith('/')) return
    if (/^https?:\/\//.test(href)) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
      return
    }
    // A path inside the repository (`../HANDOFF.md`) has no page here.
    const span = doc.createElement('span')
    span.className = 'repo-ref'
    span.innerHTML = a.innerHTML
    a.replaceWith(span)
  })

  return { html: root.innerHTML, toc }
}

/** The entries a search keeps: an h2 stays when any of its h3s match. */
export function filterToc(toc: TocEntry[], query: string): TocEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return toc
  const keep = new Set<number>()
  let parent = -1
  toc.forEach((e, i) => {
    if (e.level === 2) parent = i
    if (e.search.includes(q)) {
      keep.add(i)
      if (e.level === 3 && parent >= 0) keep.add(parent)
    }
  })
  return toc.filter((_, i) => keep.has(i))
}
