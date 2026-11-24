/**
 * Documents that are a summary plus detail pages (U110, J154): `/wiki/:doc`
 * opens the summary, `/wiki/:doc/:page` a detail page, so the summary can
 * link to the full evidence and a reader can see what the research covered.
 * Pages are Markdown files in docs/, read as they stand.
 */
export interface DocPage {
  slug: string
  title: string
  /** One line under the title in the page strip. */
  note: string
  /** The Markdown file in docs/research/b2b2c/, without the folder. */
  file: string
}

export const B2B2C_PAGES: DocPage[] = [
  { slug: 'summary', title: 'Summary', note: 'The answer, the plan and what the research covered.', file: '00-summary.md' },
  { slug: 'ideation', title: 'Ideation', note: 'Every B2B2C model for Aurelia, scored.', file: '01-ideation.md' },
  { slug: 'creators', title: 'Creators and cohorts', note: 'Splits, cohort completion, creator funnels.', file: '02-creators.md' },
  { slug: 'employers', title: 'Employers and insurers', note: 'Pricing, engagement, what buyers demand.', file: '03-employers.md' },
  { slug: 'partners', title: 'Partners', note: 'Hotels, gyms, telcos, devices, gifting.', file: '04-partners.md' },
  { slug: 'economics', title: 'Unit economics', note: 'Conversion, retention, fees, AI cost, the model.', file: '05-economics.md' },
  { slug: 'regulation', title: 'Claims and regulation', note: 'What may be said, data, safety, contracts.', file: '06-regulation.md' },
  { slug: 'plan', title: 'Plan', note: 'What to test first, in what order, and the gates.', file: '07-plan.md' },
  { slug: 'roast', title: 'Roast', note: 'What a sceptic attacks, and what changed.', file: '08-roast.md' },
  { slug: 'sources', title: 'Full report and sources', note: 'The deep research report, every source.', file: '09-full-report.md' },
]

const files = import.meta.glob('../../docs/research/b2b2c/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export function pageMarkdown(p: DocPage): string {
  return files[`../../docs/research/b2b2c/${p.file}`] ?? `# ${p.title}\n\nThis page is missing: \`docs/research/b2b2c/${p.file}\`.`
}

/** Every `/wiki/b2b2c/<slug>` link in a text, for the link check. */
export function pageLinks(markdown: string): string[] {
  return [...markdown.matchAll(/\/wiki\/b2b2c\/([a-z0-9-]+)/g)].map((m) => m[1])
}
