import { describe, expect, it } from 'vitest'
import { B2B2C_PAGES, pageLinks, pageMarkdown } from './docPages'

describe('B2B2C research pages', () => {
  it('has a file behind every page', () => {
    for (const p of B2B2C_PAGES) expect(pageMarkdown(p), p.file).not.toContain('This page is missing')
  })

  it('links only to pages that exist, and the summary links to every page', () => {
    const slugs = new Set(B2B2C_PAGES.map((p) => p.slug))
    for (const p of B2B2C_PAGES) for (const l of pageLinks(pageMarkdown(p))) expect(slugs.has(l), `${p.slug} → ${l}`).toBe(true)
    const fromSummary = new Set(pageLinks(pageMarkdown(B2B2C_PAGES[0])))
    for (const p of B2B2C_PAGES.slice(1)) expect(fromSummary.has(p.slug), p.slug).toBe(true)
  })
})
