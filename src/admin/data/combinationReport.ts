import { DEFAULT_DECISIONS, STAGES, funnelMetrics, stageStatus, type Status, type StageId } from './businessFunnel'
import { BUYER_RUNS, personasOf, priceRange, wellnessOf } from './buyerRuns'
import { DESIGNS, report, type AgentId, type DesignId } from './buyerSim'
import { OFFERS, OUTCOMES, PLUS_NET_YEAR1, cohort, eur, perTicket } from './retreatFunnel'
import { COMBINATION_FINDINGS, LABEL_TEXT, SOURCE_KIND, SOURCE_KINDS, sourcesOf, type SourceId, type SourceKind, type SourceLabel } from './reportSources'

/**
 * Admin → Reports → Combination report (U116, J167): one reading of Aurelia,
 * stage by stage of the business funnel, joining every source the team has.
 * Each line names its source (reportSources) and, for documents, the section
 * it comes from. Figures are computed from the models (buyerSim, businessFunnel,
 * retreatFunnel, personas); the words around them are fixed. Production v3
 * (staging v5, the default) is the version read throughout, with agent v3's
 * rules, the calibrated ones.
 */

export interface SourceLine {
  source: SourceId
  /** Where in the source, for documents: a section or a lesson. */
  cite?: string
  text: string
}

export interface StageReading {
  id: StageId
  findingId: string
  title: string
  brief: string
  /** The stage against its targets, on agent v3 × production v3 (businessFunnel.stageStatus). */
  status: Status
  lines: SourceLine[]
  agree: string
  conflict: string
  verdict: string
  next: string
  /** The decision-log entry the next move is, when there is one. */
  decision?: string
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const AGENT: AgentId = 3
const DESIGN: DesignId = 3

function bySegment<T extends string>(design: DesignId, key: (id: string) => T | undefined) {
  const r = report(AGENT, design)
  const groups = new Map<T, typeof r.walks>()
  for (const w of r.walks) {
    const k = key(w.personaId)
    if (!k) continue
    groups.set(k, [...(groups.get(k) ?? []), w])
  }
  return groups
}

/** Every stage's reading. `week` is the feedback group's study week (sample data). */
export function buildStages(week: number): StageReading[] {
  const r = report(AGENT, DESIGN)
  const r2 = report(AGENT, 2)
  const r1 = report(AGENT, 1)
  const metrics = funnelMetrics(AGENT, DESIGN, week)
  const m = (id: string) => metrics.find((x) => x.id === id)!
  const people = personasOf(r.run)
  const wellness = bySegment(DESIGN, (id) => {
    const p = people.get(id)
    return p ? wellnessOf(p).level : undefined
  })
  const attitude = bySegment(DESIGN, (id) => people.get(id)?.aiAttitude)
  const rate = (ws: typeof r.walks | undefined, f: (w: (typeof r.walks)[number]) => number) => (ws && ws.length ? ws.reduce((s, w) => s + f(w), 0) / ws.length : 0)
  const signIn = r.funnel.find((f) => f.step === 'sign-in')!
  const onboarding = r.funnel.find((f) => f.step === 'onboarding')!
  const run2 = BUYER_RUNS.find((x) => x.version === 2)!
  const run3 = BUYER_RUNS.find((x) => x.version === 3)!
  const p2 = personasOf(run2)
  const old = run2.answers.filter((a) => (p2.get(a.personaId)?.age ?? 0) >= 65)
  const band3 = priceRange(run3.answers)
  const middle = OUTCOMES.find((o) => o.id === 'middle')!
  const specOutcome = OUTCOMES.find((o) => o.id === 'spec')!
  const human = (id: string) => {
    const x = m(id)
    return x.human === null ? `${x.humanNote}.` : `${pct(x.human)}. ${x.humanNote}.`
  }
  const stage = (id: StageId) => STAGES.find((s) => s.id === id)!
  const dec = (id: string) => DEFAULT_DECISIONS.find((d) => d.id === id)!
  const status = (id: StageId) => stageStatus(metrics, {}, id).status
  const usd = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`

  return [
    {
      id: 'entry',
      findingId: 'stage-entry',
      title: stage('entry').title,
      brief: stage('entry').eugene,
      status: status('entry'),
      lines: [
        { source: 'backend-old', cite: 'How the 2025 system worked', text: 'No entry for a person: a professional assembled a campaign from a taxonomy. Nothing to reuse at this stage.' },
        { source: 'artefact', cite: 'Lesson 9', text: 'Today’s loop starts from the person’s own sentence (onboarding → build → play → check-in).' },
        { source: 'versions', text: 'Production v3: Quick Start plays before sign-in; a personal session still needs an account, asked for when the sentence is sent.' },
        { source: 'interviews', text: 'Little input, with Aurelia deciding; the landing’s “space” and map read as co-working.' },
        { source: 'buyer-rerun', text: `Agent v3 × production v3: ${pct(r.activation)} hear a session on the first visit (production v1: ${pct(r1.activation)}). Sign-in still loses ${signIn.left} of ${r.walks.length}.` },
        { source: 'buyer-v2', text: `Aged 65 or over: ${old.filter((a) => a.tries === 'yes').length} of ${old.length} would try (English only, small text, an account first).` },
        { source: 'app-funnel', text: `Target ${pct(m('activation').target)} hearing a session on the first visit; predicted ${pct(m('activation').agent)}.` },
        { source: 'feedback-group', text: `Played in week 1: ${human('activation')}` },
        { source: 'prd', cite: '§1 Summary, §9', text: 'The bet: a conversation is a better way in than a library. §9 predicts activation of 57% on v5, from an older simulation.' },
        { source: 'user-journey', text: `The stage covers journey moment ${stage('entry').moments.join(', ')}.` },
      ],
      agree: 'Every source wants the first session before any effort, and production v3 delivers it for Quick Start.',
      conflict: `The PRD’s 57% and the re-run’s ${pct(r.activation)} come from different models and different definitions; neither is measured. The account before a personal session is the gap no version closes.`,
      verdict: 'On track by prediction; the leak is the account before their own session.',
      next: dec('d1').change,
      decision: 'd1',
    },
    {
      id: 'aha',
      findingId: 'stage-aha',
      title: stage('aha').title,
      brief: stage('aha').eugene,
      status: status('aha'),
      lines: [
        { source: 'backend-old', cite: 'Feedback attribution; Script quality judge', text: 'A prompt that reads feedback against each building block of the session, and a nine-criterion judge. Neither is built today.' },
        { source: 'artefact', cite: 'Lessons 3 and 5', text: 'Safety is part of the first version; model scores are signals, not measurements.' },
        { source: 'versions', text: 'Production v3: “How do you feel now?” after listening, a Why on every suggested change, and a wearable question in onboarding.' },
        { source: 'interviews', text: '“Why is it suggesting this?”; voice quality named; wearables wanted, with consent.' },
        { source: 'buyer-rerun', text: `Completion ${pct(r.completion)} on production v3 against ${pct(r2.completion)} on v2; onboarding loses ${onboarding.left} impatient people.` },
        { source: 'personas', text: `Feels better after a session, by how they are doing: struggling ${pct(rate(wellness.get('struggling'), (w) => w.feltBetter))}, coping ${pct(rate(wellness.get('coping'), (w) => w.feltBetter))}.` },
        { source: 'app-funnel', text: `Finishes their first session: target ${pct(m('completion').target)}, predicted ${pct(m('completion').agent)}. Feels better: predicted ${pct(m('felt').agent)}.` },
        { source: 'feedback-group', text: `Felt better: ${human('felt')}` },
        { source: 'prd', cite: '§5.2 The core loop', text: 'One sentence → onboarding → a build → play → “How do you feel now?” → the next chapter.' },
        { source: 'user-journey', text: `The stage covers moments ${stage('aha').moments.join(', ')}.` },
      ],
      agree: 'Interviews, the old backend and v3 all point to the same thing: tell the person why, and learn from their check-in.',
      conflict: 'The interviews asked for the wearable; the agents say asking for it before the first session costs completion. Both can hold if the question moves.',
      verdict: 'Below target by prediction: the extra onboarding question is the cost.',
      next: dec('d2').change,
      decision: 'd2',
    },
    {
      id: 'cap',
      findingId: 'stage-cap',
      title: stage('cap').title,
      brief: stage('cap').eugene,
      status: status('cap'),
      lines: [
        { source: 'backend-old', cite: 'The three sources', text: 'The 2025 documents have no free plan or limit.' },
        { source: 'versions', text: 'Every version: 3 sends, then 30 minutes. From production v2 the limit counts only after the first build.' },
        { source: 'buyer-v1', text: 'Hitting the free limit at 3am is a moment the product can lose someone it already won.' },
        { source: 'buyer-rerun', text: `${pct(r.capHit)} expected to hit the limit in week one on production v3.` },
        { source: 'app-funnel', text: `Target ${pct(m('cap').target)}. ${m('cap').reading ?? ''}` },
        { source: 'prd', cite: '§8 Business model', text: 'The limit counts builds, the number is a placeholder; the API contract suggests 5 builds a day.' },
        { source: 'decisions', text: `${dec('d5').change} Shipped in ${dec('d5').version}.` },
      ],
      agree: 'Counting from the first build, not the first message, is settled and shipped.',
      conflict: 'Three definitions of the limit: sends then minutes (the app), builds a day (the PRD, the API contract) and 5 sessions a month (the offer the buyer agents saw).',
      verdict: 'Below target: too few reach the limit, which says the aha is not strong enough yet.',
      next: 'Pick one definition of the free limit, then fix the aha first; raising the cap would not help people who never reach it.',
    },
    {
      id: 'upsell',
      findingId: 'stage-upsell',
      title: stage('upsell').title,
      brief: stage('upsell').eugene,
      status: status('upsell'),
      lines: [
        { source: 'versions', text: 'The Upgrade screen, “Aurelia AI Plus”: $10 a month or $100 a year. Nothing can be bought yet.' },
        { source: 'buyer-v3', text: `Fair price band under offer B: ${usd(band3.low)}–${usd(band3.high)} a month; yearly-first moved answers.` },
        { source: 'buyer-rerun', text: `Of those who hit the limit, ${pct(r.capToPlus)} choose Plus (target ${pct(m('plus').target)}). Asked directly: ${r.paysYes} yes, ${r.paysMaybe} maybe of ${r.walks.length}.` },
        { source: 'retreat', text: `Another way in: redesigned retreat, middle outcome, gives ${(middle.activeWeek8 * middle.gradToPlus * 100).toFixed(1)}% Plus per ticket buyer, ${eur(PLUS_NET_YEAR1)} net each in year one.` },
        { source: 'b2b2c', cite: 'Unit economics', text: 'Course platforms take 0–10%, which sets what a creator will accept.' },
        { source: 'prd', cite: '§8 Business model', text: 'Not decided; the client’s pricing is awaited.' },
        { source: 'decisions', text: dec('d4').change },
      ],
      agree: 'The price people call fair sits below $10 a month; the yearly plan is what lands.',
      conflict: 'Three prices in play: $10 / $100 on the Upgrade screen, $9.99 / $79 in runs v1–v2, and $59.99 a year in offer B. The PRD has none.',
      verdict: 'Below target by prediction, and nothing can be bought yet, so every number here is intent, not a sale.',
      next: dec('d4').change,
      decision: 'd4',
    },
    {
      id: 'stay',
      findingId: 'stage-stay',
      title: stage('stay').title,
      brief: stage('stay').eugene,
      status: status('stay'),
      lines: [
        { source: 'artefact', cite: 'Lesson 9', text: 'Today optimises whether this person feels better and comes back for the next chapter.' },
        { source: 'versions', text: 'Production v3: progress in words from their own check-ins, a journal, the next chapter with a calendar reminder.' },
        { source: 'interviews', text: 'Scores can make people anxious; a report every two weeks; stories and friends, not rankings.' },
        { source: 'buyer-rerun', text: `Back after a week ${pct(r.d7)}, after a month ${pct(r.d30)}; “very disappointed” ${pct(r.ellis)}. Top reason to stop: ${r.leaveReasons[0]?.[0] ?? '—'}.` },
        { source: 'personas', text: `Back after a week, by attitude to AI: curious ${pct(rate(attitude.get('curious'), (w) => w.d7))}, skeptical ${pct(rate(attitude.get('skeptical'), (w) => w.d7))}.` },
        { source: 'app-funnel', text: `Targets: ${pct(m('d7').target)} back after a week, ${pct(m('d30').target)} after a month, ${pct(m('ellis').target)} very disappointed.` },
        { source: 'feedback-group', text: `Active in the latest week: ${human('d7')}` },
        { source: 'retreat', text: `The retreat spec plans on ${(specOutcome.activeWeek8 * 100).toFixed(1)}% active at week 8; the model plans on ${pct(middle.activeWeek8)}.` },
        { source: 'prd', cite: '§9 How success is measured', text: 'Predicts day 7 of 11.4% on v5, from the October simulation.' },
      ],
      agree: 'Every source puts staying on the person’s own progress, not on scores or streaks.',
      conflict: `The PRD’s 11.4% at day 7 against the re-run’s ${pct(r.d7)}, and the retreat spec’s ${(specOutcome.activeWeek8 * 100).toFixed(1)}% at week 8 against the category’s 3–5% at day 30. The higher numbers are older and less calibrated.`,
      verdict: 'Below target: the stage that decides the business, and the one no buyer agent can test.',
      next: dec('d7').change,
      decision: 'd7',
    },
  ]
}

/* ------------------------------------------------------------ The matrix */

export interface MatrixCell {
  design: DesignId
  plusRate: number
  /** Aurelia's total from a 100-seat cohort, euros. */
  total: number
}

export interface MatrixRow {
  offerId: string
  offer: string
  agent: AgentId
  margin: number
  cells: MatrixCell[]
}

export const MATRIX_SEATS = 100

/**
 * Offer × production version × agent rules. The retreat model has no design
 * version, and the buyer agents have no retreat, so the join is one
 * assumption, stated on the page: a week-8 graduate chooses Plus at the rate
 * the agents predict for someone who hits the free limit on that version.
 * Everything else is the retreat model's middle outcome.
 */
export function buildMatrix(): MatrixRow[] {
  const middle = OUTCOMES.find((o) => o.id === 'middle')!
  const rows: MatrixRow[] = []
  for (const o of OFFERS)
    for (const agent of [2, 3] as AgentId[]) {
      const cells = DESIGNS.map((d) => {
        const plusRate = report(agent, d.id).capToPlus
        return { design: d.id, plusRate, total: cohort(o, { ...middle, gradToPlus: plusRate }, MATRIX_SEATS).aureliaTotal }
      })
      rows.push({ offerId: o.id, offer: o.name, agent, margin: perTicket(o).margin, cells })
    }
  return rows
}

/* ------------------------------------------------- The layered composition */

/**
 * U121 (J176): how the Combination report is built, layer by layer, for the
 * "How this report was made" graph and its text version. Level 1 is the
 * sources the report cites (COMBINATION_FINDINGS), level 2 the building
 * blocks read or computed from them, level 3 the stage readings (buildStages),
 * level 4 the verdict and next moves. Only the building blocks are declared
 * here; every other level and every edge is derived from the data above, and
 * reportSources.test.ts checks that each node cites only the level below and
 * that every source is used.
 */

export type BlockId =
  | 'agent-prediction'
  | 'funnel-targets'
  | 'group-sample'
  | 'v5-features'
  | 'interview-signal'
  | 'prd-expectation'
  | 'backend-readiness'
  | 'retreat-economics'
  | 'decision-log'
  | 'matrix'

export interface BuildingBlock {
  id: BlockId
  title: string
  /** What it is, in one plain sentence. */
  what: string
  sources: SourceId[]
  /** Where on the page it is shown, when it has its own section. */
  anchor?: string
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  { id: 'agent-prediction', title: 'Agent prediction', what: 'What the buyer agents predict synthetic people do at each stage, on production v3 with agent v3’s rules, split by segment.', sources: ['buyer-rerun', 'buyer-v1', 'buyer-v2', 'buyer-v3', 'personas'] },
  { id: 'funnel-targets', title: 'Funnel targets', what: 'Each stage’s metrics and targets, and the journey moments the stage covers.', sources: ['app-funnel', 'user-journey'] },
  { id: 'group-sample', title: 'Feedback-group sample', what: 'The people column of the funnel from the 30-person study. Sample data until it runs on a backend.', sources: ['feedback-group'] },
  { id: 'v5-features', title: 'What production v3 offers', what: 'What the production default (staging v5) shows a person at each stage.', sources: ['versions'] },
  { id: 'interview-signal', title: 'Interview signal', what: 'What three real users said matters. Words, not numbers.', sources: ['interviews'] },
  { id: 'prd-expectation', title: 'PRD expectation', what: 'What the PRD bets on and predicts for each stage, from an older simulation.', sources: ['prd'] },
  { id: 'backend-readiness', title: 'Backend readiness', what: 'What the 2025 backend had for each stage and the lessons it leaves for the new one.', sources: ['backend-old', 'artefact'] },
  { id: 'retreat-economics', title: 'Retreat economics', what: 'The creator retreat as another way in: Aurelia’s share, week-8 activity and Plus per ticket buyer.', sources: ['retreat', 'b2b2c'] },
  { id: 'decision-log', title: 'Decisions already taken', what: 'Entries in the funnel decision log that a stage already points to, with their status.', sources: ['decisions'] },
  { id: 'matrix', title: 'Offer × version × rules', what: 'The retreat’s three offers against the Plus rate each production version predicts, under agent v2 and v3 rules.', sources: ['retreat', 'buyer-rerun', 'b2b2c'], anchor: 'matrix' },
]

/** The stage the matrix feeds: it reads the upsell through the retreat. */
export const MATRIX_FEEDS: StageId = 'upsell'

/** The building block a stage line comes from: the one non-matrix block that lists its source. */
export function blockOfSource(source: SourceId): BlockId | undefined {
  return BUILDING_BLOCKS.find((b) => b.id !== 'matrix' && b.sources.includes(source))?.id
}

export type CompLevel = 1 | 2 | 3 | 4

export interface CompNode {
  /** Unique across levels: source, block, finding and outcome ids do not collide. */
  id: string
  level: CompLevel
  title: string
  /** A short tag on the node: the source's label, a stage status, a decision id. */
  tag: string
  detail: string
  /** Ids of the nodes one level down that this one is made of. */
  inputs: string[]
  /** Level 1: the source's label and kind. */
  label?: SourceLabel
  kind?: SourceKind
  status?: Status
  /** In-app address: a source page, a section anchor (#…) or the decision log. */
  link?: string
}

export const LEVELS: { level: CompLevel; title: string; description: string }[] = [
  { level: 1, title: 'Level 1 · Sources', description: 'The evidence: runs, models, documents and what real people said.' },
  { level: 2, title: 'Level 2 · Building blocks', description: 'What we compute or read from the sources.' },
  { level: 3, title: 'Level 3 · Stage readings', description: 'Each funnel stage: where the blocks agree and conflict.' },
  { level: 4, title: 'Level 4 · Verdict', description: 'What it adds up to, and the next move per stage.' },
]

const STATUS_TEXT: Record<Status, string> = { 'on-track': 'on track', below: 'below target', unmeasured: 'unmeasured' }

/** Every node of the four levels, in display order. */
export function buildComposition(stages: StageReading[]): CompNode[] {
  const sources = sourcesOf(COMBINATION_FINDINGS).sort((a, b) => SOURCE_KINDS.indexOf(SOURCE_KIND[a.id]) - SOURCE_KINDS.indexOf(SOURCE_KIND[b.id]))
  const l1: CompNode[] = sources.map((s) => ({ id: s.id, level: 1, title: s.name, tag: LABEL_TEXT[s.label].toLowerCase(), detail: s.what, inputs: [], label: s.label, kind: SOURCE_KIND[s.id], link: s.link }))
  const l2: CompNode[] = BUILDING_BLOCKS.map((b) => ({ id: b.id, level: 2, title: b.title, tag: `${b.sources.length} source${b.sources.length > 1 ? 's' : ''}`, detail: b.what, inputs: [...b.sources], link: b.anchor ? `#${b.anchor}` : undefined }))
  const l3: CompNode[] = stages.map((s) => {
    const blocks = new Set<string>(s.lines.map((l) => blockOfSource(l.source)).filter((b): b is BlockId => !!b))
    if (s.id === MATRIX_FEEDS) blocks.add('matrix')
    return {
      id: s.findingId,
      level: 3,
      title: s.title,
      tag: STATUS_TEXT[s.status],
      detail: s.verdict,
      inputs: BUILDING_BLOCKS.filter((b) => blocks.has(b.id)).map((b) => b.id),
      status: s.status,
      link: `#${s.findingId}`,
    }
  })
  const by = (st: Status) => stages.filter((s) => s.status === st).map((s) => s.title.toLowerCase())
  const onTrack = by('on-track')
  const below = by('below')
  const verb = (xs: string[]) => (xs.length > 1 ? 'are' : 'is')
  const verdict: CompNode = {
    id: 'verdict',
    level: 4,
    title: 'Overall verdict',
    tag: `${below.length} of ${stages.length} below`,
    detail: `By prediction, ${onTrack.length ? `${onTrack.join(', ')} ${verb(onTrack)} on track` : 'no stage is on track'}${below.length ? `; ${below.join(', ')} ${verb(below)} below target` : ''}. Nothing here is measured on real use yet.`,
    inputs: l3.map((n) => n.id),
  }
  const moves: CompNode[] = stages.map((s) => ({
    id: `next-${s.id}`,
    level: 4,
    title: `Next: ${s.title}`,
    tag: s.decision ?? 'open',
    detail: s.next,
    inputs: [s.findingId],
    link: s.decision ? '/admin/business-funnel' : `#${s.findingId}`,
  }))
  return [...l1, ...l2, ...l3, verdict, ...moves]
}
