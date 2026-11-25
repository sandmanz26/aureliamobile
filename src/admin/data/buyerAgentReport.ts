import { DEFAULT_DECISIONS, type Decision } from './businessFunnel'
import { BUYER_RUNS, countVerdicts, personasOf, priceRange, type BuyerAnswer, type BuyerRun } from './buyerRuns'
import { AGENT_RULES, DESIGNS, agreement, report } from './buyerSim'
import { V3_CHANGES, type V3Change } from './buyerRunV3'
import { OVERALL_SUMMARY } from './buyerRerunSummaries'
import { RUN_V5, v5Tallies } from './buyerRunV5'
import { RUN_V6, V6_CHANGES, v6Best, v6Tallies } from './buyerRunV6'
import { RUN_V7, v7Tallies } from './buyerRunV7'
import type { Reference } from './buyerRuns'
import { PLANS } from './commerce'
import type { SourceId } from './reportSources'

/**
 * Admin → Reports → Buyer agent report (U116, J167). Every buyer-agent
 * iteration as one timeline entry, with every figure computed from the run
 * data (buyerRuns, buyerRunV2, buyerRunV3) or the re-run (buyerSim). The
 * sentences around the figures are fixed; the figures are not typed in.
 * All of it is prediction: synthetic people, answered by an agent.
 */

export interface Figure {
  label: string
  value: string
  note?: string
}

/** The price an iteration showed its personas: part of the result (U117). */
export interface PriceTested {
  /** Amount and period, as shown. */
  amount: string
  currency: string
  period: string
  /** Where the price came from. */
  origin: string
  /** True when it is not today's app price ($10 a month or $100 a year). */
  differsFromApp: boolean
  warning?: string
}

/** Today's price in the app: the Upgrade screen after the free limit (src/pages/UpgradePage.tsx). */
export const APP_PRICE = { amount: '$10 a month or $100 a year', where: 'the app’s Upgrade screen, shown after the free limit' }

export interface Iteration {
  /** Matches the finding id in reportSources. */
  id: 'it-v1' | 'it-v2' | 'it-v3' | 'it-rerun' | 'it-v5' | 'it-v6' | 'it-v7'
  name: string
  date: string
  question: string
  changed: string[]
  headline: Figure[]
  delta: string[]
  decisions: Decision[]
  /** Why no decision is listed, when none is. */
  decisionNote?: string
  findings: string[]
  priceTested: PriceTested
  link: string
  sources: SourceId[]
  /** The five inputs this report version was made from (U122, J177). */
  inputs: Record<InputKind, InputValue>
}

export const pct = (x: number) => `${Math.round(x * 100)}%`
const share = (k: number, n: number) => (n ? k / n : 0)
const pts = (a: number, b: number) => {
  const d = Math.round((b - a) * 100)
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} points`
}
const money = (v: number) => `$${v.toFixed(v % 1 ? 2 : 0)}`
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)

function criterion(run: BuyerRun, label: string) {
  return run.criteria.find((c) => c.label === label)?.value ?? ''
}

function decisions(ids: string[]) {
  return ids.map((id) => DEFAULT_DECISIONS.find((d) => d.id === id)).filter((d): d is Decision => Boolean(d))
}

/** The tallies one run's answers give. */
export function runTallies(answers: BuyerAnswer[]) {
  const n = answers.length
  const tries = countVerdicts(answers, 'tries')
  const pays = countVerdicts(answers, 'pays')
  const band = priceRange(answers)
  const weeks = answers.map((a) => a.week).filter((w): w is number => typeof w === 'number')
  const sureDay30 = answers.filter((a) => a.day30 === 'yes').length
  return { n, tries, pays, band, week: weeks.length ? mean(weeks) : null, sureDay30 }
}

/** v3's control answers (offer A, today), in the same shape for the tallies that apply. */
function controlTallies(run: BuyerRun) {
  const ctl = run.answers.filter((a) => a.control)
  const tries = { yes: 0, maybe: 0, no: 0 }
  const pays = { yes: 0, maybe: 0, no: 0 }
  for (const a of ctl) {
    tries[a.control!.tries] += 1
    pays[a.control!.pays] += 1
  }
  return { n: ctl.length, tries, pays }
}

/** How many answers each proposed change moved in run v3, most first. */
export function movedBy(run: BuyerRun): [V3Change, number][] {
  const m = new Map<V3Change, number>()
  for (const a of run.answers) for (const c of a.movedBy ?? []) m.set(c as V3Change, (m.get(c as V3Change) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

/** Answers from people aged 65 or over in a run (by persona profile). */
function olderShare(run: BuyerRun) {
  const people = personasOf(run)
  const old = run.answers.filter((a) => (people.get(a.personaId)?.age ?? 0) >= 65)
  return { n: old.length, tries: old.filter((a) => a.tries === 'yes').length }
}

export function buildIterations(): Iteration[] {
  const inputs = buildInputs()
  return buildBase().map((it) => ({ ...it, inputs: inputs[it.id] }))
}

function buildBase(): Omit<Iteration, 'inputs'>[] {
  const [r1, r2, r3] = [1, 2, 3].map((v) => BUYER_RUNS.find((r) => r.version === v)!)
  const t1 = runTallies(r1.answers)
  const t2 = runTallies(r2.answers)
  const t3 = runTallies(r3.answers)
  const a3 = controlTallies(r3)
  const moved = movedBy(r3)
  const old2 = olderShare(r2)
  const best = report(3, 3)
  const prodV1 = report(3, 1)
  const prodV2 = report(3, 2)
  const v2rules = [report(2, 2), report(2, 3)]
  const agree = agreement()
  const walks = ([1, 2, 3] as const).reduce((s, a) => s + report(a, 1).walks.length * DESIGNS.length, 0)
  const top = best.leaveReasons[0]

  return [
    {
      id: 'it-v1',
      name: 'Report v1',
      date: r1.date,
      question: criterion(r1, 'Question'),
      changed: ['The first run: it set the format every later run keeps (try, pay, four price answers, objection, test cases).', criterion(r1, 'Who')],
      headline: [
        { label: 'Would try', value: `${t1.tries.yes} of ${t1.n}`, note: `${t1.tries.maybe} maybe, ${t1.tries.no} no` },
        { label: 'Would pay for Plus', value: `${t1.pays.yes} of ${t1.n}`, note: `${t1.pays.maybe} maybe` },
        { label: 'Fair price band', value: `${money(t1.band.low)}–${money(t1.band.high)} a month`, note: `Plus was shown at ${money(r1.stimulus.priceUsd)}` },
      ],
      delta: ['The first iteration: nothing to compare with.'],
      decisions: [],
      decisionNote: 'No entry in the decision log. It fed run v2: the agent was too agreeable, so v2 added calibration rules.',
      findings: r1.findings.slice(0, 3),
      priceTested: {
        amount: r1.stimulus.offer.find((o) => o.startsWith('Plus')) ?? money(r1.stimulus.priceUsd),
        currency: 'US dollars, the same for everyone',
        period: 'a month, or a year',
        origin: 'The admin’s mock plan table (Commerce → PLANS: Plus $9.99 a month, $79 a year). Not the app’s price.',
        differsFromApp: true,
        warning: `Not today’s app price (${APP_PRICE.amount}): $0.01 lower a month and $21 lower a year, and no regional prices.`,
      },
      link: '/admin/buyer-agent?v=1',
      sources: ['buyer-v1', 'personas'],
    },
    {
      id: 'it-v2',
      name: 'Report v2',
      date: r2.date,
      question: criterion(r2, 'Question'),
      changed: [criterion(r2, 'Who'), criterion(r2, 'New parameters'), 'Calibration rules: look for the reason to say no first; a deal breaker the product hits today makes the answer no.'],
      headline: [
        { label: 'Would try', value: `${t2.tries.yes} of ${t2.n}`, note: `${t2.tries.maybe} maybe, ${t2.tries.no} no` },
        { label: 'Would pay for Plus', value: `${t2.pays.yes} of ${t2.n}`, note: `${t2.pays.maybe} maybe` },
        { label: 'Fair price band', value: `${money(t2.band.low)}–${money(t2.band.high)} a month` },
        { label: 'Sessions in week one', value: (t2.week ?? 0).toFixed(1), note: 'average per person' },
        { label: 'Aged 65 or over who would try', value: `${old2.tries} of ${old2.n}` },
      ],
      delta: [
        `Would try: ${pct(share(t1.tries.yes, t1.n))} → ${pct(share(t2.tries.yes, t2.n))} of the panel (${pts(share(t1.tries.yes, t1.n), share(t2.tries.yes, t2.n))}). Mostly the calibration, not a different product.`,
        `Fair band moved from ${money(t1.band.low)}–${money(t1.band.high)} to ${money(t2.band.low)}–${money(t2.band.high)}, now at local prices.`,
        `A different panel (${t1.n} → ${t2.n} people), so compare shares, not counts.`,
      ],
      decisions: decisions(['d3']),
      findings: r2.findings.slice(0, 4),
      priceTested: {
        amount: r2.stimulus.offer.filter((o) => o.includes('$9.99')).join(' · '),
        currency: 'Local currency where there is a local price; US dollars elsewhere. Answers in USD.',
        period: 'a month (a year in the US only)',
        origin: 'The admin’s regional pricing table (Commerce → REGION_PRICING, mock), as each persona’s country would see it.',
        differsFromApp: true,
        warning: `The app has no regional prices today; it asks ${APP_PRICE.amount} everywhere.`,
      },
      link: '/admin/buyer-agent?v=2',
      sources: ['buyer-v2', 'buyer-v1', 'personas'],
    },
    {
      id: 'it-v3',
      name: 'Report v3',
      date: r3.date,
      question: criterion(r3, 'Question'),
      changed: [criterion(r3, 'Who'), criterion(r3, 'What they saw'), criterion(r3, 'What the agent read first')],
      headline: [
        { label: 'Would try, today’s offer (A)', value: `${a3.tries.yes} of ${a3.n}`, note: `${a3.tries.no} no` },
        { label: 'Would try, proposed offer (B)', value: `${t3.tries.yes} of ${t3.n}`, note: `${t3.tries.no} no` },
        { label: 'Would pay, B', value: `${t3.pays.yes} yes, ${t3.pays.maybe} maybe`, note: `A: ${a3.pays.yes} yes, ${a3.pays.maybe} maybe` },
        { label: 'Sure to use at day 30, B', value: `${t3.sureDay30} of ${t3.n}`, note: `${pct(share(t3.sureDay30, t3.n))}; the category keeps 3–5%` },
        { label: 'Change that moved most answers', value: moved[0] ? V3_CHANGES[moved[0][0]].label : '—', note: moved[0] ? `${moved[0][1]} of ${t3.n} answers` : undefined },
      ],
      delta: [
        `B against A on the same people: would try ${a3.tries.yes} → ${t3.tries.yes} (${pts(share(a3.tries.yes, a3.n), share(t3.tries.yes, t3.n))}). This is the reliable comparison: same people, same agent.`,
        `Today’s offer against run v2: ${pct(share(t2.tries.yes, t2.n))} → ${pct(share(a3.tries.yes, a3.n))} would try, on a new generator and panel.`,
        `Next most moving changes: ${moved.slice(1, 4).map(([c, k]) => `${V3_CHANGES[c].label.toLowerCase()} (${k})`).join(', ')}.`,
      ],
      decisions: decisions(['d1', 'd3']),
      findings: r3.findings.slice(0, 4),
      priceTested: {
        amount: `A (today): ${r3.control?.offer[0].match(/Plus [^,]+/)?.[0] ?? 'as in v2'} · B (proposal): ${r3.stimulus.offer.find((o) => o.startsWith('Plus')) ?? ''}`,
        currency: 'Local currency in 7 (A) or 17 (B) countries; US dollars elsewhere. Answers in USD.',
        period: 'A: a month or a year. B: yearly first, then monthly',
        origin: 'A: the v2 stimulus (admin mock table). B: a proposed price list (buyerRunV3 V3_PRICES), anchored on Insight Timer’s $59.99 a year.',
        differsFromApp: true,
        warning: `Neither A nor B is today’s app price (${APP_PRICE.amount}). B’s $59.99 a year is $40 below the app’s yearly price.`,
      },
      link: '/admin/buyer-agent?v=3',
      sources: ['buyer-v3', 'buyer-v2', 'personas', 'backend-old', 'artefact'],
    },
    {
      id: 'it-rerun',
      name: 'Report v4 · re-run on production versions',
      date: r3.date,
      question: 'If each persona walks through the real screens of production v1, v2 and v3, step by step, which version keeps the most people, and where does each lose them?',
      changed: [
        `The answers are no longer played by hand: the rules of the three agents are written as code and walked through ${DESIGNS.length} production versions, ${walks} walks in all.`,
        `Checked against the hand-played runs: ${agree.map((x) => `${x.label} ${x.exact} of ${x.n} the same, ${x.opposite} opposite`).join('; ')}.`,
        `Read ${AGENT_RULES[3].name.toLowerCase()} as the best estimate; ${AGENT_RULES[1].name.toLowerCase()} were not calibrated.`,
      ],
      headline: [
        { label: 'Hears a session on the first visit', value: pct(best.activation), note: 'agent v3 rules × production v3' },
        { label: 'Finishes their own first session', value: pct(best.completion), note: 'of those who heard one' },
        { label: 'Back after a week / a month', value: `${pct(best.d7)} / ${pct(best.d30)}`, note: 'the category keeps 3–5% at day 30' },
        { label: '“Very disappointed” without it', value: pct(best.ellis), note: 'among those still active; 40% is the usual bar' },
        { label: 'Top reason they leave', value: top ? top[0] : '—', note: top ? `${top[1]} of ${best.walks.length}` : undefined },
      ],
      delta: [
        `Against run v3’s offer B, which was a proposal: ${pct(share(t3.sureDay30, t3.n))} sure at day 30 there, ${pct(best.d30)} here on the real screens.`,
        `Production v1 → v3 (agent v3 rules): first-visit listening ${pct(prodV1.activation)} → ${pct(best.activation)}; back after a week ${pct(prodV1.d7)} → ${pct(best.d7)}.`,
        `Production v2 → v3: completion ${pct(prodV2.completion)} → ${pct(best.completion)} (agent v3 rules); back after a week ${pct(v2rules[0].d7)} → ${pct(v2rules[1].d7)} (agent v2 rules).`,
      ],
      decisions: decisions(['d1', 'd2', 'd7', 'd5', 'd6']),
      findings: OVERALL_SUMMARY.slice(0, 3),
      priceTested: {
        amount: `${APP_PRICE.amount}, after the free limit`,
        currency: 'US dollars',
        period: 'a month or a year',
        origin: `The real Upgrade screen of production v1–v3 (${APP_PRICE.where}). Whether a persona would pay is still judged against the price it saw in its own run (v1/v2 local Plus, v3 offer B), about $9.99 in the US.`,
        differsFromApp: false,
      },
      link: '/admin/buyer-agent?view=versions',
      sources: ['buyer-rerun', 'versions', 'personas'],
    },
    ...buildLater(best),
  ]
}

/** Reports v5–v7 (U124, J178): every figure from the run files' computed tallies. */
function buildLater(rerunBest: ReturnType<typeof report>): Omit<Iteration, 'inputs'>[] {
  const x5 = v5Tallies()
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  const best6 = v6Best()
  const bestNames = [...new Set(Object.values(best6).map((o) => o.name))]
  const allFreemium = Object.values(best6).every((o) => o.entry === 'freemium')
  const n5 = x5.t.n
  const top = (rows: [string, number][], n: number) => (rows[0] ? `${rows[0][0]} (${rows[0][1]} of ${n})` : '—')
  const label = (k: string) => V6_CHANGES[k]?.label ?? k
  return [
    {
      id: 'it-v5',
      name: 'Report v5',
      date: RUN_V5.date,
      question: criterion(RUN_V5, 'Question'),
      changed: [criterion(RUN_V5, 'New variables'), criterion(RUN_V5, 'Product version'), criterion(RUN_V5, 'Price'), 'The PRD and the business owner’s documents read explicitly, and listed under “What the agent read”.'],
      headline: [
        { label: 'Would try (prediction)', value: `${x5.t.tries.yes} of ${n5}`, note: `${x5.t.tries.maybe} maybe, ${x5.t.tries.no} no` },
        { label: 'Would pay $10 / $100 (prediction)', value: `${x5.t.pays.yes} of ${n5}`, note: `${x5.t.pays.maybe} maybe` },
        { label: 'Fair price band', value: `${money(x5.band.low)}–${money(x5.band.high)} a month`, note: `yearly plan ($8.33) past “getting expensive” for ${x5.overYearly} of ${n5}` },
        { label: 'Top objection', value: top(x5.themes, n5) },
        { label: 'Sure at day 30 (prediction)', value: `${x5.day30} of ${n5}` },
      ],
      delta: [
        `Same 36 people as run v3: would try ${x5.v3A.tries.yes} (v3, today as text) → ${x5.t.tries.yes} (the product as built); v3’s proposal B had ${x5.v3B.tries.yes}.`,
        `Against the re-run (v4, agent v3 rules × production v3): first-visit listening ${pct(rerunBest.activation)} there; here ${pct(share(x5.t.tries.yes, n5))} would try. The price is now the app’s, not the run’s own.`,
        'Four persona variables added: starting condition, wearable, device, language.',
      ],
      decisions: decisions(['d3', 'd1']),
      findings: RUN_V5.findings.slice(0, 4),
      priceTested: {
        amount: `$${10} a month or $${100} a year`,
        currency: 'US dollars, the same in every country',
        period: 'a month or a year',
        origin: `The app’s own Upgrade screen (${APP_PRICE.where}).`,
        differsFromApp: false,
      },
      link: '/admin/buyer-agent?v=5',
      sources: ['buyer-v5', 'personas', 'versions', 'prd', 'owner-docs', 'buyer-prices'],
    },
    {
      id: 'it-v6',
      name: 'Report v6',
      date: RUN_V6.date,
      question: criterion(RUN_V6, 'Question'),
      changed: [criterion(RUN_V6, 'Who'), criterion(RUN_V6, 'New variables'), criterion(RUN_V6, 'Product version'), criterion(RUN_V6, 'Price')],
      headline: [
        { label: 'Would try: freemium / retreat €19.99', value: `${x6.A.tries.yes} / ${x6.B.tries.yes} of ${x6.A.n}`, note: `retreat at €39: ${x6.ALT.tries.yes}` },
        { label: 'Expected Plus (yes 1, maybe ½)', value: `${x6.plus.A} / ${x6.plus.B} / ${x6.plus.ALT}`, note: 'freemium / €19.99 / €39' },
        { label: 'Creator followers', value: `${x6.followers.n} of ${x6.A.n}`, note: `freemium ${x6.followers.A.tries.yes} try, retreat ${x6.followers.B.tries.yes} buy` },
        { label: 'Followers refusing daily check-ins', value: `${x6.notifHit} of ${x6.followers.n}`, note: 'a deal breaker the retreat as specified hits' },
        { label: 'Best offer, followers (prediction)', value: best6['creator follower'].name },
      ],
      delta: [
        `A larger panel (${n5} → ${x6.A.n}) on a new seed, with four more variables: compare shares. Freemium: ${pct(share(x5.t.tries.yes, n5))} → ${pct(share(x6.A.tries.yes, x6.A.n))} would try.`,
        `The first run to test a different way in: the creator retreat. Moved answers from A to B: ${x6.moved.length ? x6.moved.slice(0, 3).map(([k, c]) => `${label(k).toLowerCase()} (${c})`).join(', ') : 'none'}.`,
        `€19.99 against €39 among followers: ${x6.followers.B.tries.yes} yes, ${x6.followers.B.tries.maybe} maybe → ${x6.followers.ALT.tries.yes} yes, ${x6.followers.ALT.tries.maybe} maybe.`,
      ],
      decisions: decisions(['d8']),
      findings: RUN_V6.findings.slice(0, 4),
      priceTested: {
        amount: 'Retreat ticket €19.99, and €39 · then Plus $10 a month or $100 a year',
        currency: 'Euros for the ticket (at €1 = $1.08); US dollars for Plus',
        period: '8 weeks for the ticket; a month or a year for Plus',
        origin: 'The approved retreat redesign (Admin → Business funnel → Creator retreat) for the ticket; the app’s Upgrade screen for Plus.',
        differsFromApp: true,
        warning: `The app sells no ticket today; Plus after it is the app’s price (${APP_PRICE.amount}).`,
      },
      link: '/admin/buyer-agent?v=6',
      sources: ['buyer-v6', 'personas', 'versions', 'prd', 'owner-docs', 'buyer-prices', 'retreat'],
    },
    {
      id: 'it-v7',
      name: 'Report v7',
      date: RUN_V7.date,
      question: criterion(RUN_V7, 'Question'),
      changed: [criterion(RUN_V7, 'Who'), criterion(RUN_V7, 'New variables'), criterion(RUN_V7, 'Product version')],
      headline: [
        { label: 'Would try: v6’s best → + quick wins', value: `${x7.A.tries.yes} → ${x7.B.tries.yes} of ${x7.A.n}`, note: `no: ${x7.A.tries.no} → ${x7.B.tries.no}` },
        { label: 'Expected Plus (yes 1, maybe ½)', value: `${x7.plus.A} → ${x7.plus.B}`, note: `${x7.lostPay} stop paying because the free core is enough` },
        { label: 'Quick win that moved most', value: x7.moved[0] ? label(x7.moved[0][0]) : 'none', note: x7.moved[0] ? `${x7.moved[0][1]} of ${x7.A.n} answers` : undefined },
        { label: 'Indonesia: would try', value: `${x7.indo.A.tries.yes} → ${x7.indo.B.tries.yes} of ${x7.indo.n}` },
        { label: 'Sure at day 30 (prediction)', value: `${x7.day30A} → ${x7.day30B} of ${x7.A.n}` },
      ],
      delta: [
        `A larger panel (${x6.A.n} → ${x7.A.n}) on a new seed, five more variables (13 in all). Offer A is v6’s best: ${bestNames.join('; ')}.`,
        `Quick wins: would try ${pct(share(x7.A.tries.yes, x7.A.n))} → ${pct(share(x7.B.tries.yes, x7.B.n))}; expected Plus ${x7.plus.A} → ${x7.plus.B}.`,
        `The retreat with quick wins, among ${x7.followers.n} creator followers: ${x7.followers.ALT.tries.yes} buy, expected Plus ${x7.followers.plusALT} against ${x7.followers.plusB} on freemium with quick wins.`,
      ],
      decisions: decisions(['d3', 'd4']),
      findings: RUN_V7.findings.slice(0, 4),
      priceTested: {
        amount: allFreemium ? `${APP_PRICE.amount} (v6’s best is freemium for every channel)` : `As v6’s best per channel, then ${APP_PRICE.amount}`,
        currency: 'US dollars',
        period: 'a month or a year',
        origin: `The app’s Upgrade screen (${APP_PRICE.where}); the quick wins add no price.`,
        differsFromApp: !allFreemium,
        warning: allFreemium ? undefined : 'Where v6’s best is the retreat, the ticket is not an app price.',
      },
      link: '/admin/buyer-agent?v=7',
      sources: ['buyer-v7', 'personas', 'versions', 'prd', 'owner-docs', 'buyer-prices'],
    },
  ]
}

/*
 * U122 (J177): what a buyer report is made of. The business owner named five
 * inputs: the personas, the product version, the PRD, the business owner's
 * documents, and the price given at the time. Each report version records
 * the value it used for each. Values come from the run data where the data
 * holds them; where it does not, the journal entry that does is cited; where
 * nothing does, the value is NOT_RECORDED rather than a guess.
 */

export const INPUT_KINDS = ['personas', 'product', 'prd', 'ownerDocs', 'price'] as const
export type InputKind = (typeof INPUT_KINDS)[number]

export const INPUT_LABEL: Record<InputKind, string> = {
  personas: 'Personas',
  product: 'Product version',
  prd: 'PRD',
  ownerDocs: 'Business owner’s documents',
  price: 'Pricing',
}

/** The source in reportSources each input kind points to. */
export const INPUT_SOURCE: Record<InputKind, SourceId> = {
  personas: 'personas',
  product: 'versions',
  prd: 'prd',
  ownerDocs: 'owner-docs',
  price: 'buyer-prices',
}

export const NOT_RECORDED = 'not recorded'

export interface InputValue {
  /** The value in a few words, for the graph and the table. */
  short: string
  /** The value in full, with where it comes from. */
  detail: string
  recorded: boolean
}

const rec = (short: string, detail: string): InputValue => ({ short, detail, recorded: true })
const gap = (detail: string): InputValue => ({ short: NOT_RECORDED, detail, recorded: false })

export type ReportId = Iteration['id']

export function buildInputs(): Record<ReportId, Record<InputKind, InputValue>> {
  const runs = [1, 2, 3].map((v) => BUYER_RUNS.find((r) => r.version === v)!)
  const [r1, r2, r3] = runs
  const plus = PLANS.find((p) => p.id === 'plus')!
  const panel = (r: BuyerRun) => rec(`${r.panel.size} personas · generator ${r.generator} · seed ${r.panel.seed}`, criterion(r, 'Who'))
  const walks = ([1, 2, 3] as const).map((a) => report(a, 1).walks.length)
  const ownerRefs = (r3.references ?? []).filter((x) => !x.title.startsWith('Buyer agent'))
  // J137: runs v1–v3 walked no design version's screens; they read the pitch and
  // offer as text and judged test cases against today's app, closest to staging v5.
  const textOnly = rec(
    'Text pitch, no screens · cases judged on today’s app (≈ production v3)',
    'No design version’s screens were walked: the agent read the pitch and offer as text. Its test cases were judged against how the app behaves today, closest to staging v5 (production v3, the production default). Recorded in J137.',
  )
  // No run lists the PRD among what it read: not in the run data, nor in J133–J139 / U101–U104.
  const prd = gap('No run lists the PRD among what it read (checked: the run data, J133–J139, U101–U104). The PRD overview draft of 11 Nov 2026 existed at the time, but nothing says it was used.')
  // J133 and context timeline row 24: the buyer agent was the business owner's idea; v1 and v2 read none of their documents.
  const ideaOnly = rec(
    'Buyer-test-agent idea only; no document read',
    'The run exists because of the business owner’s idea of a buyer test agent (J133; context timeline row 24). The agent read none of their documents as evidence: the run lists no references.',
  )
  const prdRead = rec(
    'PRD overview, draft of 11 Nov 2026',
    'Read first and listed among what the agent read: docs/PRD-OVERVIEW.md (Wiki → PRD overview), for what production v3 does and does not do: built, built on sample data, not built.',
  )
  const ownerOf = (refs: Reference[] = []) => refs.filter((x) => /business owner|Retreat-in-a-Box|B2B2C/.test(x.title))
  const docs = (refs: Reference[] | undefined, short: string) => {
    const o = ownerOf(refs)
    return rec(short, o.map((x) => `${x.title} (${x.where}): ${x.used}`).join(' '))
  }
  const later = [RUN_V5, RUN_V6, RUN_V7]
  const panelVars = (r: BuyerRun) => rec(`${r.panel.size} personas · generator ${r.generator} · seed ${r.panel.seed} · ${r.variables?.length ?? 0} variables`, `${criterion(r, 'Who')} Variables: ${(r.variables ?? []).map((v) => v.label.toLowerCase()).join(', ')}.`)
  const best6 = v6Best()
  const allFreemium = Object.values(best6).every((o) => o.entry === 'freemium')
  return {
    'it-v5': {
      personas: panelVars(later[0]),
      product: rec('Production v3 (staging v5), as it is', `${criterion(RUN_V5, 'Product version')} ${RUN_V5.stimulus.offer.join('; ')}.`),
      prd: prdRead,
      ownerDocs: docs(RUN_V5.references, 'Freemium brief · lighthouse · measurement review'),
      price: rec('App: $10/mo, $100/yr (Upgrade screen)', `${APP_PRICE.amount}, on ${APP_PRICE.where}; US dollars in every country.`),
    },
    'it-v6': {
      personas: panelVars(later[1]),
      product: rec('A: production v3 · B: creator retreat (proposal)', `${criterion(RUN_V6, 'Product version')} B: ${RUN_V6.stimulus.offer.join('; ')}.`),
      prd: prdRead,
      ownerDocs: docs(RUN_V6.references, '+ Retreat-in-a-Box spec · B2B2C redesign · chat 24 Nov'),
      price: rec('Ticket €19.99 vs €39 · then Plus $10/$100', criterion(RUN_V6, 'Price')),
    },
    'it-v7': {
      personas: panelVars(later[2]),
      product: rec('A: v6’s best per channel · B: + quick wins', `${criterion(RUN_V7, 'Product version')} A: ${RUN_V7.control?.offer.join('; ')}. B adds: ${RUN_V7.stimulus.offer.join('; ')}.`),
      prd: prdRead,
      ownerDocs: docs(RUN_V7.references, '+ chat 24 Nov: Insight Timer quick wins'),
      price: rec(allFreemium ? 'v6’s best: app $10/mo, $100/yr' : 'v6’s best per channel · Plus $10/$100', criterion(RUN_V7, 'Price')),
    },
    'it-v1': {
      personas: panel(r1),
      product: textOnly,
      prd,
      ownerDocs: ideaOnly,
      price: rec(
        `$${plus.monthlyUsd}/mo · $${plus.yearlyUsd}/yr (admin mock)`,
        `Plus at $${plus.monthlyUsd} a month or $${plus.yearlyUsd} a year, the same in US dollars for everyone, from the admin’s mock plan table (Commerce → PLANS), as J137 found. Not the app’s price (${APP_PRICE.amount}).`,
      ),
    },
    'it-v2': {
      personas: panel(r2),
      product: textOnly,
      prd,
      ownerDocs: ideaOnly,
      price: rec('Regional mock: $9.99, £8.99, €9.99, ₹399…', `${r2.stimulus.offer.slice(1, 3).join('. ')}. From the admin’s regional pricing table (mock). The app has no regional prices.`),
    },
    'it-v3': {
      personas: panel(r3),
      product: rec('A: today, as text · B: a proposal, not built', `Offer A: ${r3.control?.offer[0] ?? ''}. Offer B: ${r3.stimulus.name.replace(/^Offer B: /, '')}; its items are proposals answered as if built. No screens walked (J137).`),
      prd,
      ownerDocs: rec(
        `${ownerRefs.length} read first: ${ownerRefs.map((x) => x.title.split(/[,:]/)[0].trim()).join(' · ')}`,
        ownerRefs.map((x) => `${x.title} (${x.where}): ${x.used}`).join(' '),
      ),
      price: rec('A: regional mock · B: $9.99/mo, $59.99/yr', `A: as in run v2. B: ${r3.stimulus.offer.find((o) => o.startsWith('Plus')) ?? ''}. Neither is the app’s price (${APP_PRICE.amount}).`),
    },
    'it-rerun': {
      personas: rec(
        `Panels of runs v1–v3: ${walks.join(' + ')}`,
        `Each agent’s rules walk that agent’s own panel: ${runs.map((r, i) => `agent v${i + 1}, ${walks[i]} people (generator ${r.generator}, seed ${r.panel.seed})`).join('; ')}. ${walks.reduce((a, b) => a + b, 0) * DESIGNS.length} walks in all.`,
      ),
      product: rec(`Production v1, v2, v3 (staging ${DESIGNS.map((d) => `v${d.staging}`).join(', ')})`, `The real screens of ${DESIGNS.map((d) => d.name).join('; ')}, walked step by step (U104).`),
      prd,
      // J136 / J139, context timeline row 26: the business owner's brief of 19 Nov.
      ownerDocs: rec(
        'Market-fit brief of 19 Nov (top 10 metrics)',
        'The business owner’s brief of 19 Nov 2026: core retention metrics, where in the funnel people leave, what holds back more AI plays, and the top 10 market-fit metrics (J136, J139; context timeline row 26). Agent v3’s rules carry run v3’s reading of their documents.',
      ),
      price: rec('App: $10/mo, $100/yr (Upgrade screen)', `${APP_PRICE.amount}, on ${APP_PRICE.where}. Whether a persona would pay is still judged against the price it saw in its own run (about $9.99 in the US).`),
    },
  }
}

export interface InputEdge {
  input: InputKind
  report: ReportId
  value: InputValue
}

/** One edge per input a report recorded using; a value not recorded draws no edge. */
export function inputEdges(its: Iteration[]): InputEdge[] {
  return its.flatMap((it) => INPUT_KINDS.filter((k) => it.inputs[k].recorded).map((k) => ({ input: k, report: it.id, value: it.inputs[k] })))
}

/** True when a report's value for an input differs from the report before it. */
export function changedFrom(its: Iteration[], i: number, k: InputKind) {
  return i > 0 && its[i].inputs[k].short !== its[i - 1].inputs[k].short
}
