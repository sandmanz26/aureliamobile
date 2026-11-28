/**
 * Admin → Reports (U116, J167): the one registry of sources the reports are
 * made from, and the findings each report draws from them. The Buyer agent
 * report, the Combination report and their "How this report was made" graph
 * all read this module, so a source is named, dated, labelled and linked once.
 * `reportSources.test.ts` checks every link resolves to a route or a wiki
 * document and every finding cites at least one source.
 */

/** How far a source's numbers can be trusted. Only `measured` comes from real use. */
export type SourceLabel = 'measured' | 'prediction' | 'sample' | 'estimate' | 'document' | 'company-price' | 'third-party' | 'scenario'

export const LABEL_TEXT: Record<SourceLabel, string> = {
  measured: 'Measured',
  prediction: 'Prediction',
  sample: 'Sample',
  estimate: 'Estimate',
  document: 'Document',
  'company-price': 'Company price',
  'third-party': 'Third-party',
  scenario: 'Scenario',
}

export const LABEL_MEANING: Record<SourceLabel, string> = {
  measured: 'Counted from real people using the product.',
  prediction: 'What a buyer agent expects synthetic people to do. Not a measurement.',
  sample: 'Invented data that looks real, so the screens can be reasoned about.',
  estimate: 'A calculation on assumed inputs. Changes when the inputs do.',
  document: 'Written knowledge: a plan, a review, notes from people. No figures of its own.',
  'company-price': 'A price as the supplier states it on its own page, with the date it was read.',
  'third-party': 'A figure from someone other than the supplier, not confirmed at the source.',
  scenario: 'The business owner’s assumptions (the spec PDF), shown to see where they lead. Not measured.',
}

export type SourceId =
  | 'buyer-v1'
  | 'buyer-v2'
  | 'buyer-v3'
  | 'buyer-rerun'
  | 'buyer-v5'
  | 'buyer-v6'
  | 'buyer-v7'
  | 'buyer-v8'
  | 'buyer-v9'
  | 'akps'
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
  | 'cost-2025'
  | 'supplier-prices'
  | 'spec-causal'
  | 'owner-chat'
  | 'owner-docs'
  | 'buyer-prices'
  | 'cost-model'
  | 'sleep-cohort'
  | 'owner-thesis'
  | 'bar-elements'

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
  'buyer-v9': {
    id: 'buyer-v9',
    name: 'Buyer agent test 9',
    what: 'The same 975 people as test 8 answering test 8’s StateFlip journey (A) and the same journey with their own first chapter shown, assembled from AKPs matched to their identity and condition (B), by written rules.',
    version: 'Test 9, 28 Nov 2026, persona set v4, v9 rules (U150)',
    taken: 'Would try and would pay A → B, by dimension and archetype, the objections, B’s effect split into its parts, and the chance-to-target impact.',
    link: '/admin/reports/buyer-agent?tab=detail#test-9',
    label: 'prediction',
  },
  'buyer-v8': {
    id: 'buyer-v8',
    name: 'Buyer agent test 8',
    what: '975 people of persona set v4 (25 risk-flagged left out) answering v7’s best offer and a journey for their own StateFlip with a free first week, by written rules from conditionForBuyer.',
    version: 'Test 8, 27 Nov 2026, persona set v4, v8 rules (U147)',
    taken: 'Would try and would pay A → B, by dimension, the objections, and B’s effect split into its parts.',
    link: '/admin/reports/buyer-agent?tab=detail#test-8',
    label: 'prediction',
  },
  akps: {
    id: 'akps',
    name: 'AKP catalogue',
    what: 'The draft AKPs (goal, strategy, voice, product, business, brand, analysis, identity) read from the business owner’s sheets, plus those drafted by us, linked to the 125 StateFlips.',
    version: 'akps.ts v2, 28 Nov 2026 (all draft, U150)',
    taken: 'AKP counts per function and the StateFlips covered.',
    link: '/admin/stateflips',
    label: 'prediction',
  },
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
  'buyer-v5': {
    id: 'buyer-v5',
    name: 'Buyer agent run v5',
    what: 'The same 36 personas as run v3 on production v3 as it is, at the app’s price, with four new persona variables and the PRD and the business owner’s documents read first.',
    version: 'Run v5, 25 Nov 2026, persona generator 2, written rules (U124)',
    taken: 'Try / pay on the product as built, the price band, the losses by language, condition, wearable and device.',
    link: '/admin/buyer-agent?v=5',
    label: 'prediction',
  },
  'buyer-v6': {
    id: 'buyer-v6',
    name: 'Buyer agent run v6',
    what: '60 personas on a new seed answering plain freemium and the creator retreat at €19.99 and €39, with four more variables (channel, prior app and churn, budget).',
    version: 'Run v6, 25 Nov 2026, persona generator 2, written rules (U124)',
    taken: 'Freemium against the retreat, followers against the rest, €19.99 against €39, the best offer per channel.',
    link: '/admin/buyer-agent?v=6',
    label: 'prediction',
  },
  'buyer-v7': {
    id: 'buyer-v7',
    name: 'Buyer agent run v7',
    what: '100 personas on a new seed answering v6’s best offer and the same with Insight-Timer-style quick wins, with five more variables (life stage, time of need, AI trust, privacy, culture).',
    version: 'Run v7, 25 Nov 2026, persona generator 2, written rules (U124)',
    taken: 'What each quick win moves, what the free library costs in payers, and the segments (Indonesia included).',
    link: '/admin/buyer-agent?v=7',
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
  'cost-2025': {
    id: 'cost-2025',
    name: '2025 old admin costs',
    what: 'The 2025 backend’s vendor cost analytics: what the test sessions (“campaigns”) really cost, by media.',
    version: '8 Mar 2025 – 20 Apr 2026; screenshot in the chat of 24 Nov 2026',
    taken: '€40.27 in total, split by media, and the ten costliest campaigns.',
    link: '/wiki/backend-old',
    label: 'measured',
  },
  'supplier-prices': {
    id: 'supplier-prices',
    name: 'Supplier price pages',
    what: 'Anthropic, OpenAI, ElevenLabs, Google, Black Forest Labs and Stability AI, as each states its API prices; plus the wiki’s AI cost table.',
    version: 'Read 24 Nov 2026; Anthropic and OpenAI TTS from the wiki notes (Nov 2026)',
    taken: 'The price, unit and date of every model in the catalogue. Google TTS and OpenAI’s per-image price are estimates.',
    link: '/wiki/b2b2c/economics',
    label: 'company-price',
  },
  'spec-causal': {
    id: 'spec-causal',
    name: 'MVP, Causal AI & Admin spec',
    what: 'The business owner’s 9-page spec PDF: the bad-to-good sleep flip, the three Causal AI stages and the three metric lines.',
    version: 'Spec PDF received 24 Nov 2026 (J171)',
    taken: 'Stage uplift, success rate and cost factor; 25 → 85 as the target; $19.99 per flip; density and velocity.',
    link: '/admin/reports/cost#goal-stages',
    label: 'scenario',
  },
  'owner-chat': {
    id: 'owner-chat',
    name: 'The business owner’s chat, 24 Nov',
    what: 'The request for this report: cost per 3, 5 and 10 minute chapter across script, voice, music and image, the bad-to-good journey and three metric lines.',
    version: 'Chat of 24 Nov 2026, parts 0–1, task A/B/C',
    taken: 'What to compute, the media, the lengths, and the profit graph.',
    link: '/admin/reports/cost',
    label: 'document',
  },
  'owner-docs': {
    id: 'owner-docs',
    name: 'The business owner’s documents',
    what: 'The briefs and documents the business owner sent: the buyer-test-agent idea, the 2025 backend documents, the market-fit brief.',
    version: 'As of each run, 19 Nov 2026 (context timeline rows 17, 24–26)',
    taken: 'Which of them each buyer report version read, or that it read none.',
    link: '/wiki/backend-old',
    label: 'document',
  },
  'buyer-prices': {
    id: 'buyer-prices',
    name: 'Prices shown to the personas',
    what: 'The price each run showed: the admin’s mock plans, its mock regional table, a proposed list, and the app’s Upgrade screen.',
    version: 'Admin mock PLANS and regional table; offer B (run v3); Upgrade screen $10 / $100',
    taken: 'The price in each buyer report version, and whether it is the app’s.',
    link: '/admin/pricing',
    label: 'document',
  },
  'cost-model': {
    id: 'cost-model',
    name: 'Cost model',
    what: 'The chapter cost and the bad-to-good journey worked out from the supplier prices and the spec’s three Causal AI stages (cost factor, uplift, success, density, velocity).',
    version: 'costModel.ts as of 27 Nov 2026 (U131 onwards)',
    taken: 'Cost per chapter and per flip by stage, and how much each driver moves it.',
    link: '/admin/reports/cost',
    label: 'estimate',
  },
  'sleep-cohort': {
    id: 'sleep-cohort',
    name: 'Sleep cohort (StateFlips)',
    what: 'The simulated people in the 1,000 v4 personas with a sleep need and no risk flag, each with a sleep score from the check-in formula.',
    version: 'StateFlips U140 (J202), persona set v4',
    taken: 'Who is in the sleep cohort and their starting score, for the share expected to flip.',
    link: '/admin/stateflips',
    label: 'sample',
  },
  'owner-thesis': {
    id: 'owner-thesis',
    name: 'The business owner’s thesis (deck)',
    what: 'His deck and chat: the meta-AI engine, 120,000 AKPs, 500 billion variations, 5 billion state-flips a year, a $1 per flip floor. His thesis, not measured.',
    version: 'Chats of 24 and 27 Nov 2026',
    taken: 'The scale claims, each with what would make it measurable.',
    link: '/wiki/b2b2c/owner-thesis',
    label: 'scenario',
  },
  'bar-elements': {
    id: 'bar-elements',
    name: 'BAR / ELEMENTS operating model (workbook)',
    what: 'The business owner’s workbook on how a script is built: the Meta → Path → Script cascade, bars, elements, CFAM metrics and the script assessment framework.',
    version: 'Workbook of 27 Nov 2026 (27 tabs)',
    taken: 'The 16 steps and the example values marked “from the workbook”.',
    link: '/admin/session-builder',
    label: 'document',
  },
}

/** The kind of evidence a source is, for grouping it on a graph (U121). Coarse on purpose: a handful of groups a reader can scan. */
export const SOURCE_KINDS = ['Buyer agents', 'Funnels and models', 'Product', 'Real people', '2025 backend wiki', 'Costs', 'The business owner'] as const
export type SourceKind = (typeof SOURCE_KINDS)[number]

export const SOURCE_KIND: Record<SourceId, SourceKind> = {
  'buyer-v1': 'Buyer agents',
  'buyer-v2': 'Buyer agents',
  'buyer-v3': 'Buyer agents',
  'buyer-rerun': 'Buyer agents',
  'buyer-v5': 'Buyer agents',
  'buyer-v6': 'Buyer agents',
  'buyer-v7': 'Buyer agents',
  'buyer-v8': 'Buyer agents',
  'buyer-v9': 'Buyer agents',
  akps: 'Product',
  personas: 'Buyer agents',
  'app-funnel': 'Funnels and models',
  'feedback-group': 'Funnels and models',
  retreat: 'Funnels and models',
  b2b2c: 'Funnels and models',
  decisions: 'Funnels and models',
  versions: 'Product',
  prd: 'Product',
  'user-journey': 'Product',
  interviews: 'Real people',
  'backend-old': '2025 backend wiki',
  artefact: '2025 backend wiki',
  'cost-2025': 'Costs',
  'supplier-prices': 'Costs',
  'spec-causal': 'The business owner',
  'owner-chat': 'The business owner',
  'owner-docs': 'The business owner',
  'buyer-prices': 'Product',
  'cost-model': 'Costs',
  'sleep-cohort': 'Funnels and models',
  'owner-thesis': 'The business owner',
  'bar-elements': 'The business owner',
}

export interface Finding {
  /** Also the section's anchor id on the page. */
  id: string
  title: string
  sources: SourceId[]
}

export const BUYER_REPORT_FINDINGS: Finding[] = [
  { id: 'input-graph', title: 'Inputs → report versions', sources: ['personas', 'versions', 'prd', 'owner-docs', 'buyer-prices'] },
  { id: 'what-changed', title: 'What changed between reports', sources: ['personas', 'versions', 'prd', 'owner-docs', 'buyer-prices'] },
  { id: 'it-v1', title: 'Report v1', sources: ['personas', 'versions', 'owner-docs', 'buyer-prices', 'buyer-v1'] },
  { id: 'it-v2', title: 'Report v2', sources: ['personas', 'versions', 'owner-docs', 'buyer-prices', 'buyer-v2'] },
  { id: 'it-v3', title: 'Report v3', sources: ['personas', 'versions', 'owner-docs', 'buyer-prices', 'buyer-v3'] },
  { id: 'it-rerun', title: 'Report v4 · re-run', sources: ['personas', 'versions', 'owner-docs', 'buyer-prices', 'buyer-rerun'] },
  { id: 'it-v5', title: 'Report v5', sources: ['personas', 'versions', 'prd', 'owner-docs', 'buyer-prices', 'buyer-v5'] },
  { id: 'it-v6', title: 'Report v6', sources: ['personas', 'versions', 'prd', 'owner-docs', 'buyer-prices', 'buyer-v6', 'retreat'] },
  { id: 'it-v7', title: 'Report v7', sources: ['personas', 'versions', 'prd', 'owner-docs', 'buyer-prices', 'buyer-v7'] },
]

export const COMBINATION_FINDINGS: Finding[] = [
  { id: 'stage-entry', title: 'Entry', sources: ['backend-old', 'artefact', 'versions', 'interviews', 'buyer-rerun', 'buyer-v2', 'personas', 'app-funnel', 'feedback-group', 'prd', 'user-journey'] },
  { id: 'stage-aha', title: 'The aha moment', sources: ['backend-old', 'artefact', 'versions', 'interviews', 'buyer-rerun', 'personas', 'app-funnel', 'feedback-group', 'prd', 'user-journey'] },
  { id: 'stage-cap', title: 'The usage cap', sources: ['backend-old', 'versions', 'buyer-v1', 'buyer-rerun', 'app-funnel', 'prd', 'decisions'] },
  { id: 'stage-upsell', title: 'The upsell', sources: ['versions', 'buyer-v3', 'buyer-rerun', 'retreat', 'b2b2c', 'prd', 'decisions'] },
  { id: 'stage-stay', title: 'Staying', sources: ['artefact', 'versions', 'interviews', 'buyer-rerun', 'personas', 'app-funnel', 'feedback-group', 'retreat', 'prd'] },
  { id: 'matrix', title: 'Offer × version × rules', sources: ['retreat', 'buyer-rerun', 'b2b2c'] },
]

export const COST_FINDINGS: Finding[] = [
  { id: 'cost-catalogue', title: 'Supplier catalogue', sources: ['supplier-prices', 'b2b2c'] },
  { id: 'cost-variations', title: 'Cost per chapter, variations', sources: ['supplier-prices', 'b2b2c', 'cost-2025', 'owner-chat'] },
  { id: 'goal-graph', title: 'Bad to good: the graph', sources: ['spec-causal', 'supplier-prices', 'owner-chat', 'versions'] },
  { id: 'goal-stages', title: 'Cost falls, uplift rises', sources: ['spec-causal', 'supplier-prices', 'cost-2025'] },
  { id: 'metric-lines', title: 'Three metric lines', sources: ['spec-causal', 'cost-2025', 'owner-chat'] },
]

/** The B2B2C report: round 2 research, the business owner’s retreat brief and the buyer tests. */
export const B2B2C_FINDINGS: Finding[] = [
  { id: 'b2b2c-channels', title: 'The channels compared', sources: ['b2b2c', 'owner-docs', 'owner-chat', 'buyer-v6', 'buyer-v7', 'personas'] },
  { id: 'b2b2c-features', title: 'What we must build', sources: ['b2b2c', 'retreat', 'buyer-v6', 'buyer-v7', 'personas'] },
]

/** The UX feedback report (U129): the latest feedback group view, on the study's sample data. */
export const UX_FEEDBACK_FINDINGS: Finding[] = [{ id: 'ux-views', title: 'Wins, this week and how much they use it', sources: ['feedback-group'] }]

/** The sources a set of findings uses, in registry order. */
export function sourcesOf(findings: Finding[]): ReportSource[] {
  const used = new Set(findings.flatMap((f) => f.sources))
  return Object.values(SOURCES).filter((s) => used.has(s.id))
}
