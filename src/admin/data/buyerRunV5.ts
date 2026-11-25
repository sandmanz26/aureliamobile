import type { BuyerAnswer, BuyerRun, Reference } from './buyerRuns'
import { RUN_V3 } from './buyerRunV3'
import { APP_PLUS, FEATURES, PROD_V3, RULES, VARS_BY_RUN, VAR_LABEL, answer, band, byId2, bySegment, of, tally, topThemes, usd } from './buyerPlay'

/**
 * Buyer agent run v5 (U124, J178): the same 36 personas as run v3, now on the
 * product as it is (production v3, staging v5) at the app's real price, with
 * the PRD and the business owner's documents read first, and four new persona
 * variables: the starting condition, the wearable they own, their device and
 * their language. Every figure is a prediction about synthetic people.
 */

export const V5_LEVEL = 5 as const

export const V5_REFERENCES: Reference[] = [
  { title: 'PRD overview (draft of 11 Nov 2026)', where: 'docs/PRD-OVERVIEW.md · Wiki → PRD overview', used: 'What production v3 does and does not do (built, built on sample data, not built): Quick Start before sign-in, the free limit, progress in words, Why?, the wearable asked once and off until switched on, community without ranks, English only, no account that persists.' },
  { title: 'The business owner’s freemium and state-transition brief (23 Nov 2026)', where: 'docs/briefs/2026-11-23-eugene-freemium-state-transition.md', used: 'Zero-friction entry; never block mid-crisis; price the relief, not the product; day-30 retention across categories about 4%. Behind rules 3 and 4.' },
  { title: 'The business owner’s lighthouse, “Moving from Bad to Good”', where: 'docs/briefs/EUGENE-CONTEXT.md §4.1', used: 'Entry → aha → cap → Plus: the funnel the answers are read against. Plus is $10 a month or $100 a year on the Upgrade screen.' },
  { title: 'The 2025 measurement system review (10 metrics)', where: 'docs/briefs/2026-11-23-measurement-system-review.md', used: 'Time to first play, return D1/D7/D30, forgiving consistency: why the run records week one and day 30.' },
  { title: 'Insight Timer research, round 2', where: 'Wiki → Research', used: 'Day-30 retention 3–5% of installs; prompts before listening and paywalled basics as top leave reasons.' },
  { title: 'Buyer agent runs v3 and the re-run (v4)', where: 'This page', used: 'The same 36 people; v3’s offer A (today, as text) and B (a proposal) to compare against the product as it is.' },
]

export const V5_INSTRUCTIONS = `You are a buyer test agent. Run v5: the same 36 personas as run v3 (persona generator 2, seed 2028), on Aurelia as it is today: production v3 (staging v5), at the app's own price.

Read first, and treat as evidence: the PRD overview (what is built and what is not), the business owner's freemium and state-transition brief and the lighthouse, the 2025 measurement review, the Insight Timer research, and runs v3 and v4.

New this run, for every persona: their sleep/stress starting condition (mild, moderate, severe, from their profile), the wearable they own, their device, and whether they can use an English-only app (English first, reads English, needs their own language).

${RULES}`

function build(): BuyerRun {
  const people = RUN_V3.panel.personaIds.map(byId2)
  const answers: BuyerAnswer[] = people.map((p) => answer(p, PROD_V3, V5_LEVEL))
  return {
    id: 'run-5',
    version: 5,
    title: 'v5 · The product as it is, at its real price, 36 personas with four new variables',
    date: '2026-11-25',
    kind: 'run',
    generator: 2,
    method:
      'The agent played the same 36 personas as run v3 against production v3 as it is, at the app’s real price, under written rules (listed below) after reading the PRD and the business owner’s documents. Each answer carries the reasons the rules found. No backend, no live model call. Every figure is a prediction.',
    panel: { seed: RUN_V3.panel.seed, size: people.length, personaIds: people.map((p) => p.id) },
    stimulus: {
      name: 'Production v3 (staging v5) as it is, at the app’s price',
      pitch: 'Tell Aurelia in one sentence how you feel and it builds a guided session for you: voice, sound and visuals. Quick Start plays at once; your own session comes after you sign in. A five-chapter journey follows, with progress told in words from your own check-ins.',
      offer: [
        'Quick Start plays without an account; a personal session asks to sign in',
        'Free limit: 3 sends, then 30 minutes, counted after the first build',
        `Plus: $${APP_PLUS.monthly} a month or $${APP_PLUS.yearly} a year, in US dollars everywhere (the Upgrade screen)`,
        'English only',
        ...PROD_V3.features.filter((f) => f !== 'quick-start').map((f) => FEATURES[f].label),
      ],
      priceUsd: APP_PLUS.monthly,
    },
    defaultPrice: { label: `$${APP_PLUS.monthly} · $${APP_PLUS.yearly} a year (USD everywhere)`, usd: APP_PLUS.monthly },
    usYearlyMonthly: APP_PLUS.perMonthYearly,
    variables: VARS_BY_RUN[5].map((k) => ({ key: k, label: VAR_LABEL[k] })),
    references: V5_REFERENCES,
    criteria: [
      { label: 'Question', value: 'Would these 36 people try Aurelia as it is today and pay $10 a month or $100 a year, and who does the product as built lose?' },
      { label: 'Who', value: '36 personas from persona generator 2, the same people as run v3 (seed 2028), one per region × age band.' },
      { label: 'New variables', value: `${VARS_BY_RUN[5].map((k) => VAR_LABEL[k]).join(', ')}. Each is read from the persona’s own profile (condition from pain and sleep, device from their phone), so none can contradict it.` },
      { label: 'Product version', value: 'Production v3 (staging v5), the production default, as built: not a proposal.' },
      { label: 'Price', value: `The app’s Upgrade screen: $${APP_PLUS.monthly} a month or $${APP_PLUS.yearly} a year ($8.33 a month), the same US-dollar price in every country. No regional prices.` },
      { label: 'What the agent read first', value: 'The PRD overview and the business owner’s documents (listed under “What the agent read”), the Insight Timer research, and runs v3 and v4.' },
      { label: 'Calibration', value: 'Written rules, applied to every persona in the same way: the no first, deal breakers honoured, day 30 under 1 in 8. Price answers set from willingness to pay, income and place.' },
      { label: 'Read it as', value: 'A prediction on synthetic people. The comparison with run v3 is on the same 36 people, but by written rules rather than by hand.' },
    ],
    instructions: V5_INSTRUCTIONS,
    findings: [],
    answers,
  }
}

const run = build()

/** Tallies and segments, computed from the answers (never typed). */
export function v5Tallies(r: BuyerRun = run) {
  const t = tally(r.answers)
  const v3A = tally(RUN_V3.answers.map((a) => a.control!))
  const v3B = tally(RUN_V3.answers)
  const b = band(r.answers)
  const overYearly = r.answers.filter((a) => a.prices.expensive < APP_PLUS.perMonthYearly).length
  return {
    t,
    v3A,
    v3B,
    band: b,
    overYearly,
    themes: topThemes(r.answers),
    condition: bySegment(r.answers, 'condition'),
    language: bySegment(r.answers, 'language'),
    wearable: bySegment(r.answers.map((a) => ({ ...a, vars: { w: a.vars?.wearable === 'none' ? 'none' : 'owns one' } })), 'w'),
    device: bySegment(r.answers.map((a) => ({ ...a, vars: { d: /older/.test(a.vars?.device ?? '') ? 'older phone' : 'recent phone' } })), 'd'),
    day30: r.answers.filter((a) => a.day30 === 'yes').length,
    week: r.answers.reduce((s, a) => s + (a.week ?? 0), 0) / r.answers.length,
  }
}

const seg = (rows: { key: string; n: number; tries: number; pays: number }[], key: string) => rows.find((x) => x.key === key) ?? { key, n: 0, tries: 0, pays: 0 }

function findings(): string[] {
  const x = v5Tallies()
  const n = x.t.n
  const needs = seg(x.language, 'needs own language')
  const reads = seg(x.language, 'reads English')
  const sev = seg(x.condition, 'severe')
  const mild = seg(x.condition, 'mild')
  const owns = seg(x.wearable, 'owns one')
  const older = seg(x.device, 'older phone')
  return [
    `Prediction: on production v3 as it is, ${of(x.t.tries.yes, n)} would try (${x.t.tries.maybe} maybe, ${x.t.tries.no} no) and ${of(x.t.pays.yes, n)} would pay $10 a month or $100 a year (${x.t.pays.maybe} maybe).`,
    `The same 36 people in run v3 (played by hand): ${x.v3A.tries.yes} would try today’s offer read as text (A) and ${x.v3B.tries.yes} the proposal (B). The built product lands at ${x.t.tries.yes}. B’s languages, data line and local prices are not built; Quick Start and progress in words are.`,
    `Language: ${needs.tries} of the ${needs.n} who need their own language would try an English-only app. Of the ${reads.n} who read English as a second language, ${reads.tries} would.`,
    `Starting condition decides who stays: ${of(sev.tries, sev.n)} with a severe start would try and ${sev.pays} would pay or might; with a mild start ${of(mild.tries, mild.n)} try.`,
    `Price: the fair band is ${usd(x.band.low)}–${usd(x.band.high)} a month; the yearly plan ($8.33 a month) is past “getting expensive” for ${of(x.overYearly, n)}. One US-dollar price everywhere is the second limit after language.`,
    `Top objections: ${x.themes.slice(0, 3).map(([k, c]) => `${k} (${c})`).join(', ')}.`,
    `${of(owns.n, n)} own a wearable; ${owns.tries} of them would try. Production v3 asks for it in onboarding but shows example readings until a backend exists: owners will notice the numbers are not theirs.`,
    `${of(older.n, n)} are on an older phone; ${older.tries} would try. Week one averages ${x.week.toFixed(1)} sessions per person; ${of(x.day30, n)} are sure to be using it at day 30 (the category keeps 3–5% of installs).`,
  ]
}

run.findings = findings()

export const RUN_V5: BuyerRun = run
