import { describe, expect, it } from 'vitest'
import { filterToc, prepareDoc, slugify } from './prepareDoc'

describe('slugify', () => {
  it('makes unique, selector-safe ids', () => {
    const used = new Set<string>()
    expect(slugify('0 · Summary', used)).toBe('s-0-summary')
    expect(slugify('0 · Summary', used)).toBe('s-0-summary-2')
    expect(slugify('Café & “quotes”', used)).toBe('cafe-quotes')
  })
})

describe('prepareDoc', () => {
  it('ids headings, wraps tables and lists the contents', () => {
    const { html, toc } = prepareDoc('<h2>One</h2><p>alpha</p><h3>Two</h3><p>beta</p><table><tr><td>x</td></tr></table>')
    expect(toc.map((e) => [e.id, e.level])).toEqual([
      ['one', 2],
      ['two', 3],
    ])
    expect(toc[0].search).toContain('beta')
    expect(html).toContain('<div class="table-wrap"><table>')
  })

  it('anchors a guideline module on its card', () => {
    const { toc } = prepareDoc('<h2 id="g">People</h2><section class="mod" id="users"><h3>Users</h3><p>suspend</p></section>')
    expect(toc[1]).toMatchObject({ id: 'users', text: 'Users', level: 3 })
    expect(toc[1].search).toContain('suspend')
  })

  it('keeps web and guide links, turns repository paths into text', () => {
    const { html } = prepareDoc('<p><a href="https://x.test">w</a> <a href="/guide/api">g</a> <a href="/admin/x">a</a> <a href="../HANDOFF.md">h</a></p>')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('href="/guide/api"')
    expect(html).toContain('href="/admin/x"')
    expect(html).toContain('<span class="repo-ref">h</span>')
  })
})

describe('filterToc', () => {
  it('keeps a parent when a child matches', () => {
    const { toc } = prepareDoc('<h2>A</h2><h3>B</h3><p>needle</p><h2>C</h2><p>other</p>')
    expect(filterToc(toc, 'needle').map((e) => e.text)).toEqual(['A', 'B'])
    expect(filterToc(toc, '')).toHaveLength(3)
  })
})
