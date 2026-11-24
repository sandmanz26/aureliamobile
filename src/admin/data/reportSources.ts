/**
 * Admin → Reports (U116, J167): the one registry of sources the reports are
 * made from, and the findings each report draws from them. The Buyer agent
 * report, the Combination report and their "How this report was made" graph
 * all read this module, so a source is named, dated, labelled and linked once.
 * `reportSources.test.ts` checks every link resolves to a route or a wiki
 * document and every finding cites at least one source.
 */

/** How far a source's numbers can be trusted. Only `measured` comes from real use. */
export type SourceLabel = 'measured' | 'prediction' | 'sample' | 'estimate' | 'document'

export const LABEL_TEXT: Record<SourceLabel, string> = {
  measured: 'Measured',
  prediction: 'Prediction',
  sample: 'Sample',
  estimate: 'Estimate',
  document: 'Document',
}

export const LABEL_MEANING: Record<SourceLabel, string> = {
  measured: 'Counted from real people using the product.',
  prediction: 'What a buyer agent expects synthetic people to do. Not a measurement.',
  sample: 'Invented data that looks real, so the screens can be reasoned about.',
  estimate: 'A calculation on assumed inputs. Changes when the inputs do.',
  document: 'Written knowledge: a plan, a review, notes from people. No figures of its own.',
}

export type SourceId =
  | 'buyer-v1'
  | 'buyer-v2'
  | 'buyer-v3'
  | 'buyer-rerun'
  | 'decisions'
  | 'app-funnel'
  | 'feedback-group'
  | 'retreat'
  | 'b2b2c'
  | 'personas'
  | 'versions'
  | 'interviews'
  | 'backend-old'
  | 'artefact'
  | 'prd'
  | 'user-journey'

export interface ReportSource {
  id: SourceId
  /** Short name, shown on the graph. */
  name: string
  /** What it is, in one sentence. */
  what: string
  /** Version or date of the source as used. */
  version: string
  /** What the report takes from it. */
  taken: string
  /** In-app address: an admin page or a wiki document. */
  link: string
  label: SourceLabel
}

export const SOURCES: Record<SourceId, ReportSource> = {
  'buyer-v1': {
    id: 'buyer-v1',
    name: 'Buyer agent run v1',
    what: 'One agent played 10 synthetic personas against the app store page and Plus at $9.99.',
    version: 'Run v1 (demo), 19 Nov 2026, persona generator 1',
    taken: 'The question, the try / pay answers, the fair price band and the findings.',
    link: '/admin/buyer-agent?v=1',
    label: 'prediction',
  },
  'buyer-v2': {
    id: 'buyer-v2',
    name: 'Buyer agent run v2',
    what: '36 personas, one per region × age band, at local prices, with calibration rules against agreeable answers.',
    version: 'Run v2, 19 Nov 2026, persona generator 1',
    taken: 'The new parameters, the answers by segment (age, wellness, price by country) and the findings.',
    link: '/admin/buyer-agent?v=2',
    label: 'prediction',
  },
  'buyer-v3': {
    id: 'buyer-v3',
    name: 'Buyer agent run v3',
    what: 'The same 36-place panel from the fixed generator, each person answering today’s offer (A) and a proposed offer (B).',
    version: 'Run v3, 19 Nov 2026, persona generator 2',
    taken: 'A against B on the same people, which proposed change moved how many answers, and the findings.',
    link: '/admin/buyer-agent?v=3',
    label: 'prediction',
  },
  'buyer-rerun': {
    id: 'buyer-rerun',
    name: 'Re-run by production version',
    what: 'Each persona walked step by step through production v1, v2 and v3 under the rules of agent v1, v2 and v3, written as code.',
    version: 'Re-run (U104), rules checked against runs v2 and v3',
    taken: 'Activation, completion, return on day 7 and 30, “very disappointed”, the free limit and Plus, leave reasons.',
    link: '/admin/buyer-agent?view=versions',
    label: 'prediction',
  },
  decisions: {
    id: 'decisions',
    name: 'Funnel decision log',
    what: 'The decisions the findings fed: finding, change, source and status.',
    version: 'Defaults as of 24 Nov 2026 (d1–d8)',
    taken: 'Which decision each iteration or stage leads to, and its status.',
    link: '/admin/business-funnel',
    label: 'document',
  },
  'app-funnel': {
    id: 'app-funnel',
    name: 'Business funnel (app)',
    what: 'The brief’s stages from a free start to Aurelia Plus, with a target per metric and the buyer agents’ prediction.',
    version: 'U108; targets as set in the code',
    taken: 'The five stages, their metrics and targets, and which stage is furthest below target.',
    link: '/admin/business-funnel',
    label: 'prediction',
  },
  'feedback-group': {
    id: 'feedback-group',
    name: 'Feedback group study',
    what: 'The planned 30-person, 8-week study. Until there is a backend its participants and numbers are sample data.',
    version: 'Study starting 13 Oct 2026 (sample data)',
    taken: 'The people column of the funnel: played in week 1, felt better, active in the latest week.',
    link: '/admin/experimentation',
    label: 'sample',
  },
  retreat: {
    id: 'retreat',
    name: 'Creator retreat funnel',
    what: 'Retreat-in-a-Box as a B2B2C funnel: three offers (the terms) and three outcome scenarios, on the wiki’s unit economics.',
    version: 'U113 (J159), redesign approved 24 Nov 2026',
    taken: 'Aurelia’s share and margin per ticket, week-8 activity and Plus per ticket buyer.',
    link: '/admin/business-funnel?view=retreat',
    label: 'estimate',
  },
  b2b2c: {
    id: 'b2b2c',
    name: 'B2B2C research',
    what: 'The wiki’s research on selling through creators, employers and partners, with the unit economics and the pilot plan.',
    version: 'Wiki → B2B2C (J154)',
    taken: 'Course-platform fees, category retention and the pilot’s gates, as the retreat model uses them.',
    link: '/wiki/b2b2c/economics',
    label: 'document',
  },
  personas: {
    id: 'personas',
    name: 'Personas',
    what: '300 synthetic research personas from a seeded generator; the buyer agents play them.',
    version: 'Generator 2 (current); runs v1 and v2 stay on generator 1',
    taken: 'Who was in each panel (10, 36, 36), and the segments the answers are split by.',
    link: '/admin/personas',
    label: 'sample',
  },
  versions: {
    id: 'versions',
    name: 'Production versions',
    what: 'What each production design version shows on screen. Production v3 is staging v5, the production default.',
    version: 'Production v3 = staging v5, default since 13 Nov 2026',
    taken: 'What production v3 offers at each stage, and what every version shares.',
    link: '/admin/buyer-agent?view=versions',
    label: 'document',
  },
  interviews: {
    id: 'interviews',
    name: 'User interviews',
    what: 'Interviews with three real users, late October 2026. Staging v5 was built from them. The only source here from real people.',
    version: 'Three interviews, late Oct 2026 (J049, U053)',
    taken: 'What people said about numbers, reasons, wearables, challenges and the landing page.',
    link: '/wiki/prd',
    label: 'document',
  },
  'backend-old': {
    id: 'backend-old',
    name: 'Backend (old)',
    what: 'A summary of the 2025 backend’s documents: how it worked, its prompts, data shapes and what to reuse.',
    version: 'Wiki → Backend (old), 2025 documents',
    taken: 'What the 2025 system had for each stage, by section.',
    link: '/wiki/backend-old',
    label: 'document',
  },
  artefact: {
    id: 'artefact',
    name: 'Artefact (lessons)',
    what: 'Eleven lessons the 2025 backend teaches the new one.',
    version: 'Wiki → Artefact',
    taken: 'The lessons that apply to a stage (claims, safety, scores as signals, the person’s loop).',
    link: '/wiki/artefact',
    label: 'document',
  },
  prd: {
    id: 'prd',
    name: 'PRD overview',
    what: 'The whole product on one page: problem, who it is for, what is built, business model, how success is measured.',
    version: 'Draft written 11 Nov 2026',
    taken: 'The product’s bet, the business model, the success metrics and their predicted values.',
    link: '/wiki/prd',
    label: 'document',
  },
  'user-journey': {
    id: 'user-journey',
    name: 'User journey',
    what: 'The journey map: each moment a person goes through, which the funnel stages point to.',
    version: 'Admin → User journey (stored map)',
    taken: 'Which moments each funnel stage covers.',
    link: '/admin/user-journey',
    label: 'document',
  },
}

export interface Finding {
  /** Also the section's anchor id on the page. */
  id: string
  title: string
  sources: SourceId[]
}

export const BUYER_REPORT_FINDINGS: Finding[] = [
  { id: 'it-v1', title: 'Run v1: the format', sources: ['buyer-v1', 'personas'] },
  { id: 'it-v2', title: 'Run v2: calibrated, 36 people', sources: ['buyer-v2', 'buyer-v1', 'personas'] },
  { id: 'it-v3', title: 'Run v3: today vs the proposal', sources: ['buyer-v3', 'buyer-v2', 'personas', 'backend-old', 'artefact'] },
  { id: 'it-rerun', title: 'Re-run on production versions', sources: ['buyer-rerun', 'versions', 'personas'] },
  { id: 'decisions', title: 'Decisions it fed', sources: ['decisions', 'buyer-v3', 'buyer-rerun'] },
  { id: 'reading', title: 'What it adds up to', sources: ['buyer-rerun', 'buyer-v3', 'buyer-v2'] },
]

export const COMBINATION_FINDINGS: Finding[] = [
  { id: 'stage-entry', title: 'Entry', sources: ['backend-old', 'artefact', 'versions', 'interviews', 'buyer-rerun', 'buyer-v2', 'personas', 'app-funnel', 'feedback-group', 'prd', 'user-journey'] },
  { id: 'stage-aha', title: 'The aha moment', sources: ['backend-old', 'artefact', 'versions', 'interviews', 'buyer-rerun', 'personas', 'app-funnel', 'feedback-group', 'prd', 'user-journey'] },
  { id: 'stage-cap', title: 'The usage cap', sources: ['backend-old', 'versions', 'buyer-v1', 'buyer-rerun', 'app-funnel', 'prd', 'decisions'] },
  { id: 'stage-upsell', title: 'The upsell', sources: ['versions', 'buyer-v3', 'buyer-rerun', 'retreat', 'b2b2c', 'prd', 'decisions'] },
  { id: 'stage-stay', title: 'Staying', sources: ['artefact', 'versions', 'interviews', 'buyer-rerun', 'personas', 'app-funnel', 'feedback-group', 'retreat', 'prd'] },
  { id: 'matrix', title: 'Offer × version × rules', sources: ['retreat', 'buyer-rerun', 'b2b2c'] },
]

/** The sources a set of findings uses, in registry order. */
export function sourcesOf(findings: Finding[]): ReportSource[] {
  const used = new Set(findings.flatMap((f) => f.sources))
  return Object.values(SOURCES).filter((s) => used.has(s.id))
}
