import { CORE_FNS, FUNCTION_LABEL, brainMetrics, functionChance, mvpChance, pct as brainPct, topThreeEffect } from './aiBrain'
import { b2b2cSummary, CHANNELS, featuresBy } from './b2b2cReport'
import { STAGES as FUNNEL_STAGES, biggestLeak, funnelMetrics, stageStatus, type FunnelMetric, type StageId } from './businessFunnel'
import { dataSourcesFor } from './dataSources'
import { LINKS, linkCounts, nodeCounts } from './healingMap'
import { generatePersonas } from './personas'
import { SCENARIOS, generatePersonasV4 } from './personasV4'
import { buildMetrics, metricsReportSummary } from './reportMetrics'
import { buyerSummary, costFunction, costSummary, stageShort, stageStrip, uxFeedbackSummary, type Tile } from './reportSummaries'
import type { SourceLabel } from './reportSources'
import { cascadeSummary, workedExample } from './sessionBuilder'
import { sleepCohort, specFlat } from './stateFlipFormulas'
import { whoHasIt } from './stateFlipSleep'
import { buildParticipants, studyWeek, type Participant } from './study'
import { DEFAULT_FLIP, HOLD_12_WEEKS, therapeuticFunnel } from './therapeuticFunnel'
import { INITIAL_JOURNEY, allMoments, screensFor, type JourneyMap } from './userJourney'

/**
 * One reading standard for the Summary tab of every report and analysis page
 * (U151, J208). The business owner asked that each one says, at a glance,
 * what it is for, what it concludes and where its data comes from. Each
 * builder below returns those three for one route, in plain English, with
 * every number worked out from the same data modules the page's Detail reads
 * (nothing typed in). The sources come from `dataSources.ts`. Text may carry
 * `{{termId|shown}}` glossary marks. `reportBriefs.test.ts` checks every
 * route has all three parts, at most three key numbers, no unmarked jargon,
 * and a Summary of about 180 words or fewer.
 */

/** How far a key number can be trusted, in the three words the owner reads. */
export type Confidence = 'measured' | 'simulated' | 'assumed'

export interface BriefNumber {
  label: string
  value: string
  confidence: Confidence
}

export interface BriefStep {
  text: string
  /** A route (opens it) or a `#anchor` in Detail (opens Detail there). */
  to?: string
  linkLabel?: string
}

export interface ReportBrief {
  /** The question the page answers and the decision it informs, in one sentence. */
  purpose: string
  /** The answer, in one or two plain sentences. */
  answer: string
  /** Up to three key numbers. */
  numbers: BriefNumber[]
  /** What it means for us, in one sentence. */
  meaning: string
  /** One or two next steps. */
  next: BriefStep[]
}

export const REPORT_BRIEF_ROUTES = [
  '/admin/reports',
  '/admin/reports/buyer-agent',
  '/admin/reports/ux-feedback',
  '/admin/reports/combination',
  '/admin/reports/cost',
  '/admin/reports/b2b2c',
  '/admin/reports/metrics',
  '/admin/ai-brain',
  '/admin/stateflips',
  '/admin/personas',
  '/admin/user-journey',
  '/admin/business-funnel',
  '/admin/therapeutic-funnel',
  '/admin/healing-map',
  '/admin/session-builder',
] as const

export type BriefRoute = (typeof REPORT_BRIEF_ROUTES)[number]

const pct = (x: number) => `${Math.round(x * 100)}%`
const usd = (v: number) => `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`
const n0 = (x: number) => (Math.round(x * 10) / 10).toFixed(x < 10 ? 1 : 0)
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/** A report tile's label kind, as one of the three confidence words. */
export function confidenceOf(label: SourceLabel): Confidence {
  if (label === 'measured') return 'measured'
  if (label === 'prediction' || label === 'sample') return 'simulated'
  return 'assumed'
}

const fromTile = (t: Tile, label = t.label, confidence = confidenceOf(t.badge)): BriefNumber => ({ label, value: t.value, confidence })

const defaultWeek = () => Math.max(1, Math.min(8, studyWeek(Date.now())))

/* ---------------------------------------------------------------- Reports */

export function overviewBrief(week = defaultWeek()): ReportBrief {
  const buyer = buyerSummary()
  const cost = costFunction(1)
  const strip = stageStrip(week)
  const on = strip.filter((s) => s.status === 'on-track').length
  return {
    purpose: 'Shows every report in one place, so you can see what each one answers and decide which to read first.',
    answer: `Aurelia is not proven yet. ${buyer.tiles[1].value} of {{simulated|simulated people}} would pay $10 a month, helping one person sleep well costs ${usd(cost.costPerFlip)} today, and ${on} of ${strip.length} {{journey|customer journey}} steps reach their {{target}}.`,
    numbers: [
      fromTile(buyer.tiles[1]),
      { label: 'Cost to help one person sleep well, today', value: usd(cost.costPerFlip), confidence: 'assumed' },
      { label: 'Journey steps that reach their goal', value: `${on} of ${strip.length}`, confidence: 'simulated' },
    ],
    meaning: 'Nothing here rests on real users yet, so the reports tell us what to test first, not what will happen.',
    next: [
      { text: 'Read the Combination report: it names the one step to fix first.', to: '/admin/reports/combination', linkLabel: 'Combination report' },
      { text: 'Start the feedback group with real people, so the first numbers become measured.', to: '/admin/reports/ux-feedback', linkLabel: 'UX feedback report' },
    ],
  }
}

export function buyerBrief(): ReportBrief {
  const s = buyerSummary()
  const [tries, pays, fair] = s.tiles
  return {
    purpose: 'Answers whether people would pay for Aurelia and at what price, so we can set the price and the offer before real users arrive.',
    answer: `Interest, yes; $10 a month, no. ${tries.value} of {{simulated|simulated people}} would try Aurelia, only ${pays.value} would pay $10 a month, and most call ${fair.value} a month fair.`,
    numbers: [fromTile(tries), fromTile(pays), fromTile(fair)],
    meaning: 'At $10 a month most people would not pay, so the price or what it includes has to change before launch.',
    next: [s.actions[0], s.actions[s.actions.length - 1]].map((a) => ({ text: a.text, to: a.to, linkLabel: a.linkLabel })),
  }
}

export function uxBrief(participants?: Participant[], week?: number): ReportBrief {
  const w = week ?? Math.max(0, Math.min(8, studyWeek(Date.now())))
  const s = uxFeedbackSummary(participants ?? buildParticipants(w), w)
  const [healthy, , staying, use] = s.tiles
  return {
    purpose: 'Answers whether Aurelia helps the people who use it and whether they keep using it, so we know what to change in the app next.',
    answer: `Not known yet: the {{feedback-group}} has not started, so every figure is {{sample|sample data}}. In that sample, ${healthy.value} people reached the healthy range and ${staying.value} are still taking part.`,
    numbers: [fromTile(healthy), fromTile(staying, 'Still taking part'), fromTile(use, 'Use it three times a week or more')],
    meaning: 'We cannot say Aurelia helps anyone until real people take part; the screens are ready for when they do.',
    next: s.actions.slice(0, 2).map((a) => ({ text: a.text, to: a.to, linkLabel: a.linkLabel })),
  }
}

export function combinationBrief(week = defaultWeek()): ReportBrief {
  const strip = stageStrip(week)
  const on = strip.filter((s) => s.status === 'on-track')
  const gap = strip.find((s) => s.isGap)
  const metrics = funnelMetrics(3, 3, week)
  const plus = metrics.find((m) => m.id === 'plus')!
  return {
    purpose: 'Joins every source we have to find the step of the customer journey where we lose the most people, so we know which step to fix first.',
    answer: gap
      ? `Only ${on.length} of ${strip.length} steps reach their {{target}}. The weakest is “${stageShort(gap.id).toLowerCase()}”: ${pct(gap.value)} ${lower(gap.metric)}, against a goal of ${pct(gap.target)}.`
      : `All ${strip.length} steps of the {{journey|customer journey}} reach their {{target}}.`,
    numbers: [
      { label: 'Steps that reach their goal', value: `${on.length} of ${strip.length}`, confidence: 'simulated' },
      ...(gap ? [{ label: `${gap.metric} (goal ${pct(gap.target)})`, value: pct(gap.value), confidence: 'simulated' as const }] : []),
      { label: `Start paying at the free limit (goal ${pct(plus.target)})`, value: pct(plus.agent), confidence: 'simulated' },
    ],
    meaning: gap
      ? `Fix “${stageShort(gap.id).toLowerCase()}” before bringing in more people: otherwise most of them are lost at that step.`
      : 'Every step is on track, so the next gain comes from bringing in more people.',
    next: [
      { text: 'After each session, let people pick the time of the next one and set a reminder.', to: '/admin/business-funnel', linkLabel: 'See the decision' },
      { text: 'When the free sessions run out, show people their own progress first, then the price.', to: '#stage-upsell', linkLabel: 'Step: Starts paying' },
    ],
  }
}

export function costBrief(): ReportBrief {
  const s = costSummary()
  const s1 = costFunction(1)
  const s3 = costFunction(3)
  const price = usd(s1.revenue / s1.flip)
  return {
    purpose: 'Works out what it costs to help one person sleep well and when we make money, so we can choose AI suppliers and a price.',
    answer: s1.profitPerFlip < 0
      ? `Not profitable yet: helping one person sleep well costs ${usd(s1.costPerFlip)} today, so at ${price} per person helped we lose ${usd(-s1.profitPerFlip)} each. Once the AI has learned, it falls to ${usd(s3.costPerFlip)}.`
      : `Profitable from the start: helping one person sleep well costs ${usd(s1.costPerFlip)} against ${price} paid.`,
    numbers: [fromTile(s.tiles[0]), fromTile(s.tiles[1]), fromTile(s.tiles[2])],
    meaning: 'The price only pays once the AI has learned from many sessions, so the first months need money behind them.',
    next: s.actions.slice(0, 2).map((a) => ({ text: a.text, to: a.to, linkLabel: a.linkLabel })),
  }
}

export function b2b2cBrief(): ReportBrief {
  const s = b2b2cSummary()
  const best = CHANNELS[0]
  const now = featuresBy('all', 'Now').length
  return {
    purpose: 'Compares partner channels (creators, employers, gifts) to decide which one to build first and what it needs.',
    answer: `Build the ${lower(best.short)} first, with a free first week: people pay after it has helped, not before. A self-serve team plan comes next.`,
    numbers: [
      { label: `${best.short}, score`, value: `${best.score18 + best.sim} of 21`, confidence: 'assumed' },
      fromTile(s.tiles[2], 'Paying people: free app vs ticket up front'),
      { label: 'Features needed now', value: String(now), confidence: 'assumed' },
    ],
    meaning: 'Creators can bring buyers we cannot reach alone, but only if their followers can try it before they pay.',
    next: s.actions.slice(0, 2).map((a) => ({ text: a.text, to: a.to, linkLabel: a.linkLabel })),
  }
}

export function metricsBrief(week = defaultWeek()): ReportBrief {
  const s = metricsReportSummary(buildMetrics(week))
  const [trace, differ, improved] = s.tiles
  return {
    purpose: 'Checks where every number in the reports comes from and how it is worked out, so you know which ones to rely on.',
    answer: `The sums hold: ${trace.value} numbers {{traceable|trace back to data}} and ${differ.value} differ from it. Results are mixed: ${improved.value} comparable numbers improved since the last test.`,
    numbers: [fromTile(trace), fromTile(differ), fromTile(improved)],
    meaning: 'The reports add up, but they still rest on made-up people and assumptions, so use them to choose tests, not to spend money.',
    next: [s.actions[0], s.actions[s.actions.length - 1]].map((a) => ({ text: a.text, to: a.to, linkLabel: a.linkLabel })),
  }
}

/* --------------------------------------------------------------- AI brain */

export function aiBrainBrief(): ReportBrief {
  const m = brainMetrics()
  const mvp = mvpChance(m)
  const weakest = [...CORE_FNS].sort((a, b) => functionChance(m, a) - functionChance(m, b))[0]
  const t3 = topThreeEffect()
  return {
    purpose: 'Shows how likely we are to reach the {{mvp|MVP}} goals, and which features would raise that chance most, so we know what to build next.',
    answer: `Unlikely today: the chance that all three core areas reach their {{target}} is ${brainPct(mvp)}. ${FUNCTION_LABEL[weakest]} is furthest away; the top 3 features would raise the chance to ${brainPct(t3.mvpAfter)}.`,
    numbers: [
      { label: 'Chance all three reach their goal', value: brainPct(mvp), confidence: 'simulated' },
      { label: `${FUNCTION_LABEL[weakest]}: chance to reach its goal`, value: brainPct(functionChance(m, weakest)), confidence: 'simulated' },
      { label: 'With the top 3 features', value: `${brainPct(t3.mvpBefore)} → ${brainPct(t3.mvpAfter)}`, confidence: 'assumed' },
    ],
    meaning: `${FUNCTION_LABEL[weakest]} holds the whole chance down, so features that help it come first.`,
    next: [
      { text: `Build the top 3 features first, starting with ${lower(t3.top[0].name)}.`, to: '#features', linkLabel: 'Feature ranking' },
      { text: 'Replace these numbers with real ones as soon as the pilot starts.' },
    ],
  }
}

export function stateFlipsBrief(): ReportBrief {
  const who = whoHasIt()
  const c = sleepCohort()
  const spec = specFlat()
  const last = c.rows[c.rows.length - 1]
  return {
    purpose: 'Explains how Aurelia turns bad sleep into good sleep and how likely it is to work, to test whether the plan’s promise holds.',
    answer: `About half: ${pct(last.flipped)} of the ${who.cohort.length} {{simulated|simulated people}} with a sleep need reach good sleep, below the plan’s ${pct(spec.chance)}, because many start with severe sleep problems.`,
    numbers: [
      { label: '{{chance-it-works|Chance it works}}, average', value: pct(c.meanChance), confidence: 'simulated' },
      { label: '{{chapter|Audio sessions}} to good sleep, middle person', value: String(c.medianChapters), confidence: 'simulated' },
      { label: '{{dropout|Stopped}} before the end', value: pct(last.dropped), confidence: 'assumed' },
    ],
    meaning: 'Expect fewer people to succeed than the plan says, and set the price and the support around that.',
    next: [
      { text: 'Test the sleep journey with real people and compare their check-ins with this curve.' },
      { text: 'See where people drop off, stage by stage.', to: '/admin/therapeutic-funnel', linkLabel: 'Therapeutic funnel' },
    ],
  }
}

export function personasBrief(): ReportBrief {
  const ps = generatePersonasV4()
  const scen = new Map<string, number>()
  for (const p of ps) scen.set(p.scenario, (scen.get(p.scenario) ?? 0) + 1)
  const top = [...scen.entries()].sort((a, b) => b[1] - a[1])[0]
  const risk = ps.filter((p) => p.riskFlag).length
  const countries = new Set(ps.map((p) => p.country)).size
  return {
    purpose: 'Shows who our AI tests run on and who must never be sold to, so we can choose made-up people for research before real users.',
    answer: `${ps.length.toLocaleString('en-US')} made-up people from ${countries} countries. ${risk} carry a {{risk-flag}} and are sent to help, never to a sale.`,
    numbers: [
      { label: 'Made-up people', value: ps.length.toLocaleString('en-US'), confidence: 'simulated' },
      { label: 'Countries', value: String(countries), confidence: 'simulated' },
      { label: 'Risk-flagged', value: String(risk), confidence: 'simulated' },
    ],
    meaning: 'They shape ideas quickly and cheaply, but they are not evidence: real people must confirm what we decide.',
    next: [
      ...(top ? [{ text: `Check that the most common {{life-situation}}, ${lower(SCENARIOS[top[0] as keyof typeof SCENARIOS].label)} (${top[1]}), matches who we want to reach.` }] : []),
      { text: 'See what they said as buyers.', to: '/admin/reports/buyer-agent', linkLabel: 'Buyer agent report' },
    ],
  }
}

export interface JourneyFacts {
  moments: number
  screens: number
  gaps: number
  topGap?: { title: string; demand: number }
}

/** The stored journey's facts, without the browser's edits or the tags view. */
export function journeyFacts(map: JourneyMap = INITIAL_JOURNEY): JourneyFacts {
  const demand = new Map<string, number>()
  for (const p of generatePersonas()) for (const id of p.moments) demand.set(id, (demand.get(id) ?? 0) + 1)
  const moments = allMoments(map).map((x) => x.moment)
  const gaps = moments.filter((m) => screensFor(map, m.id).length === 0).map((m) => ({ title: m.title, demand: demand.get(m.id) ?? 0 })).sort((a, b) => b.demand - a.demand)
  return { moments: moments.length, screens: map.stages.reduce((n, s) => n + s.screens.length, 0), gaps: gaps.length, topGap: gaps[0] }
}

export function userJourneyBrief(f: JourneyFacts = journeyFacts()): ReportBrief {
  return {
    purpose: 'Maps when people reach for Aurelia and which of those moments has no screen yet, so we know what to design or build next.',
    answer: f.topGap
      ? `“${f.topGap.title}” is the biggest gap: ${f.topGap.demand} of 300 {{persona|personas}} have this moment and no screen serves it. ${f.gaps} of ${f.moments} moments have no screen.`
      : `Every one of the ${f.moments} moments has at least one screen behind it.`,
    numbers: [
      { label: 'Moments with no screen', value: `${f.gaps} of ${f.moments}`, confidence: 'assumed' },
      ...(f.topGap ? [{ label: 'Made-up people who hit the biggest gap', value: `${f.topGap.demand} of 300`, confidence: 'simulated' as const }] : []),
      { label: 'Screens', value: String(f.screens), confidence: 'assumed' },
    ],
    meaning: f.topGap
      ? 'Designing for the moment most people hit gives more value for the effort than the next feature idea.'
      : 'There is no gap to fill today, so the next work is checking that each screen really serves its moment.',
    next: [
      ...(f.topGap ? [{ text: `Decide what should serve “${f.topGap.title}” (open it in Detail).` }] : []),
      ...(f.topGap ? [] : [{ text: 'Check the review status of each moment and its screens (Detail → Tags).' }]),
      { text: 'Export the journey and share it with the team when it changes.' },
    ],
  }
}

export interface FunnelFacts {
  metrics: FunnelMetric[]
  targets: Record<string, number>
}

export function businessFunnelBrief(f: FunnelFacts = { metrics: funnelMetrics(3, 3, defaultWeek()), targets: {} }): ReportBrief {
  const targetOf = (m: FunnelMetric) => f.targets[m.id] ?? m.target
  const leak = biggestLeak(f.metrics, f.targets)
  const onTrack = FUNNEL_STAGES.filter((s) => stageStatus(f.metrics, f.targets, s.id).status === 'on-track').length
  const worstOf = (stage: StageId) => f.metrics.filter((m) => m.stage === stage).reduce((a, b) => (b.agent / targetOf(b) < a.agent / targetOf(a) ? b : a))
  const gap = leak ? worstOf(leak) : null
  const kpi = (id: string, label: string): BriefNumber[] => {
    const m = f.metrics.find((x) => x.id === id)
    return m ? [{ label: `${label} (goal ${pct(targetOf(m))})`, value: pct(m.agent), confidence: 'simulated' }] : []
  }
  return {
    purpose: 'Follows people from a first visit to paying for {{paid-plan|Aurelia Plus}} and finds the step that loses the most, so we know what to fix first.',
    answer: leak && gap
      ? `“${stageShort(leak)}” loses the most: ${lower(gap.label)} is ${pct(gap.agent)} against a {{target}} of ${pct(targetOf(gap))}. ${onTrack} of ${FUNNEL_STAGES.length} steps are on track.`
      : `All ${FUNNEL_STAGES.length} steps are on track.`,
    numbers: [{ label: 'Steps on track', value: `${onTrack} of ${FUNNEL_STAGES.length}`, confidence: 'simulated' }, ...kpi('plus', 'Choose to pay at the free limit'), ...kpi('d30', 'Still using after a month')],
    meaning: leak ? `Until “${stageShort(leak).toLowerCase()}” improves, more visitors mostly means more people who leave.` : 'The next gain comes from bringing in more people.',
    next: [
      ...(leak ? [{ text: `Agree one change for “${stageShort(leak).toLowerCase()}” and log it as a decision (Detail).` }] : []),
      { text: 'Compare with the creator retreat (Detail → Creator retreat).' },
    ],
  }
}

export function therapeuticFunnelBrief(flipId: string = DEFAULT_FLIP): ReportBrief {
  const f = therapeuticFunnel(flipId)
  const z = f.stages.find((s) => s.id === 'Z')!
  const hold = f.stages.find((s) => s.id === 'holds')!
  return {
    purpose: 'Shows, for one bad-to-good change, where people drop off on the way, so we know which stage to improve first.',
    answer: `For ${lower(f.flip.title)}, about ${pct(z.ofProblem)} of ${f.stages[0].people.toFixed(0)} {{simulated|simulated people}} reach the good state and ${pct(hold.ofProblem)} still feel good after 12 weeks. Most are lost before “${f.biggestDrop.title}”.`,
    numbers: [
      { label: 'Reach the good state', value: pct(z.ofProblem), confidence: 'simulated' },
      { label: 'Lost at the biggest drop', value: n0(f.biggestDrop.lost), confidence: 'simulated' },
      { label: `Still good after 12 weeks (assumes ${pct(HOLD_12_WEEKS)} hold)`, value: pct(hold.ofProblem), confidence: 'assumed' },
    ],
    meaning: `Improving “${f.biggestDrop.title}” would help more people than work on any other stage.`,
    next: [
      { text: `Work on the levers of “${f.biggestDrop.title}” first (Detail).` },
      { text: 'Replace the 12-week figure with the pilot’s real check-ins.' },
    ],
  }
}

export function healingMapBrief(): ReportBrief {
  const nc = nodeCounts()
  const lc = linkCounts()
  const research = lc.research ?? 0
  const sample = lc.sample ?? 0
  const learned = lc.learned ?? 0
  return {
    purpose: 'Shows which building blocks of a session tend to help which bad state, and how sure we are, so we know which links need evidence first.',
    answer: `The map links ${nc.bad} bad states to ${nc.good} good ones through ${nc.block} building blocks. ${research} of its ${LINKS.length} links are backed by published research; ${sample} are a {{sample|design sample}}, and none is learned from users yet.`,
    numbers: [
      { label: 'Links backed by research', value: `${research} of ${LINKS.length}`, confidence: 'assumed' },
      { label: 'Design-sample links', value: String(sample), confidence: 'simulated' },
      { label: 'Links learned from users', value: String(learned), confidence: 'measured' },
    ],
    meaning: 'Until real check-ins exist, the map shows ideas to test, not proof that a building block helps.',
    next: [
      { text: 'Replace the design-sample links with cited research or learned results.' },
      { text: 'Compare with the older Therapeutic map.', to: '/admin/therapeutic-map', linkLabel: 'Therapeutic map' },
    ],
  }
}

export function sessionBuilderBrief(): ReportBrief {
  const s = cascadeSummary()
  const ex = workedExample()
  return {
    purpose: 'Explains how Aurelia turns a goal and a person into a 10-minute script and how much of that exists, so we know what to build next.',
    answer: `It takes ${s.steps} steps in three stages: set the goal, plan the path, write the script. ${s.partial} steps exist in part, ${s.missing} are missing and none is complete.`,
    numbers: [
      { label: 'Steps that exist in part', value: `${s.partial} of ${s.steps}`, confidence: 'assumed' },
      { label: 'Steps missing', value: String(s.missing), confidence: 'assumed' },
      { label: 'Worked example, our draft score', value: ex.alignment.score.toFixed(2), confidence: 'assumed' },
    ],
    meaning: 'Most of the engine is still to be built, so a script made fully by the AI is some way off.',
    next: [
      { text: 'Import the workbook’s bars, elements and frameworks as data: three steps depend on it.' },
      { text: 'Agree how a script is scored before any {{tournament}} runs.' },
    ],
  }
}

/** Every route's brief with its default inputs (the page passes live ones where it has them). */
export const REPORT_BRIEFS: Record<BriefRoute, () => ReportBrief> = {
  '/admin/reports': () => overviewBrief(),
  '/admin/reports/buyer-agent': buyerBrief,
  '/admin/reports/ux-feedback': () => uxBrief(),
  '/admin/reports/combination': () => combinationBrief(),
  '/admin/reports/cost': costBrief,
  '/admin/reports/b2b2c': b2b2cBrief,
  '/admin/reports/metrics': () => metricsBrief(),
  '/admin/ai-brain': aiBrainBrief,
  '/admin/stateflips': stateFlipsBrief,
  '/admin/personas': personasBrief,
  '/admin/user-journey': () => userJourneyBrief(),
  '/admin/business-funnel': () => businessFunnelBrief(),
  '/admin/therapeutic-funnel': () => therapeuticFunnelBrief(),
  '/admin/healing-map': healingMapBrief,
  '/admin/session-builder': sessionBuilderBrief,
}

export const reportBrief = (route: BriefRoute) => REPORT_BRIEFS[route]()

/** The sources block's rows: the page's registered data sources. */
export const briefSources = (route: string) => dataSourcesFor(route)
