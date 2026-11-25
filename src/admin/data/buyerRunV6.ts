import type { BuyerAnswer, BuyerRun, Reference } from './buyerRuns'
import { V5_REFERENCES } from './buyerRunV5'
import {
  APP_PLUS,
  EUR_USD,
  FEATURES,
  PROD_V3,
  RULES,
  VAR_LABEL,
  answer,
  band,
  bySegment,
  dealBreakersHit,
  drawStratifiedN,
  expectedPlus,
  movedBy,
  movedCounts,
  of,
  play,
  pool2,
  retreat,
  tally,
  topThemes,
  usd,
  varsUpTo,
  type Offer,
} from './buyerPlay'

/**
 * Buyer agent run v6 (U124, J178): 60 personas from persona generator 2 on a
 * new seed, with four more variables (how they found Aurelia, the meditation
 * app they used before and why they left it, budget sensitivity). Tests the
 * approved creator-retreat redesign (an 8-week journey in the creator's voice,
 * a ticket, then Plus) at €19.99 and at €39 against plain freemium (the
 * product as it is). Every figure is a prediction about synthetic people.
 */

export const V6_LEVEL = 6 as const
export const V6_SEED = 2031
export const V6_SIZE = 60

export const V6_A = PROD_V3
export const V6_B = retreat(19.99)
export const V6_ALT = retreat(39)

export const V6_CHANGES: Record<string, { label: string; source: string }> = {
  ...FEATURES,
  entry: { label: 'A ticket as the way in, sold by the creator', source: 'Approved retreat redesign: €19.99 ticket, 70/30, digital kit; tested against €39' },
}

export const V6_REFERENCES: Reference[] = [
  ...V5_REFERENCES.filter((r) => !r.title.startsWith('Buyer agent')),
  { title: 'Retreat-in-a-Box: the business owner’s two spec PDFs and our reading', where: 'docs/briefs/2026-11-23-retreat-in-a-box-reading.md', used: 'The 8-week curriculum, the cohort (week-1 keynote, week-8 Q&A, Sunday prompts), daily check-ins, the €19.99 ticket and graduation to Plus. The spec’s 76.5% at week 8 and “+85.7% sleep” are mock figures and were not used.' },
  { title: 'B2B2C research and the approved redesign (24 Nov 2026)', where: 'docs/research/b2b2c/00-summary.md · Admin → Business funnel → Creator retreat', used: 'The redesign’s terms (70/30, journey produced once in the creator’s voice, a digital kit), €19.99 against €39, and the pilot numbers: active at week 8 ≥35%, Plus per ticket buyer ≥8%.' },
  { title: 'The business owner’s chat of 24 Nov 2026, part 0', where: 'docs/briefs/2026-11-24-chat-part0-healing-map.md', used: 'The retreat’s purpose in their words: build reach through creators, funnel participants into Aurelia, convert them to paid plans.' },
  { title: 'Buyer agent run v5', where: 'This page, ?v=5', used: 'The product as it is, which is offer A here, and the rules, unchanged.' },
]

export const V6_INSTRUCTIONS = `You are a buyer test agent. Run v6: 60 personas from persona generator 2 (seed ${V6_SEED}), stratified by region and age band.

Read first, as in v5, plus: the business owner's Retreat-in-a-Box specification and our reading of it, the B2B2C research with the approved redesign, and the business owner's chat of 24 Nov (the retreat's purpose).

New this run, for every persona: how they found Aurelia (a creator they follow, organically, or through an employer), the meditation app they used before and why they left it, and how sensitive their budget is.

Each persona answers offer A, plain freemium (production v3 as it is, Plus at $10 / $100), and offer B, the creator retreat: an 8-week journey in the creator's own voice and language, a live cohort, a €19.99 ticket up front, then Plus at the app's price when they graduate. The same retreat at €39 is answered too (tries and pays only). For B, "tries" means buys the ticket and starts week 1; "pays" means moves to Plus at week 8. Only creator followers meet the retreat through someone they trust.

${RULES}`

const why = (because: string[]) => because.find((b) => !/^Does not try|^A deal breaker is hit/.test(b)) ?? because[0]

function build(): BuyerRun {
  const people = drawStratifiedN(pool2(), V6_SEED, V6_SIZE)
  const answers: BuyerAnswer[] = people.map((p) => {
    const a = play(p, V6_A, V6_LEVEL)
    const alt = play(p, V6_ALT, V6_LEVEL)
    return answer(p, V6_B, V6_LEVEL, {
      control: { tries: a.tries, pays: a.pays, why: why(a.because) },
      alt: { tries: alt.tries, pays: alt.pays, why: why(alt.because) },
      movedBy: movedBy(p, V6_A, V6_B, V6_LEVEL),
    })
  })
  return {
    id: 'run-6',
    version: 6,
    title: 'v6 · Creator retreat (€19.99 vs €39) against plain freemium, 60 personas',
    date: '2026-11-25',
    kind: 'run',
    generator: 2,
    method:
      'The agent played 60 personas from a new seed against plain freemium (A) and the creator retreat (B, at €19.99, and again at €39), under v5’s written rules, after reading the PRD, the business owner’s documents and the retreat redesign. No backend, no live model call. Every figure is a prediction.',
    panel: { seed: V6_SEED, size: people.length, personaIds: people.map((p) => p.id) },
    stimulus: {
      name: 'Offer B: the creator retreat, approved redesign',
      pitch: 'A creator you follow invites you to an 8-week retreat in their own voice: a journey of chapters with short personal parts made for you, a live cohort with the creator, and a digital kit. €19.99 for the 8 weeks. At the end, Aurelia Plus keeps your journey going.',
      offer: [
        'Ticket €19.99 (about $21.59) for 8 weeks, paid up front; also asked at €39',
        'The journey in the creator’s own voice and language, with personal inserts',
        'A live cohort: week-1 keynote, week-8 Q&A, Sunday prompts, daily check-ins',
        `At week 8: Plus at the app’s price, $${APP_PLUS.monthly} a month or $${APP_PLUS.yearly} a year`,
        'Everything in production v3 inside the app',
      ],
      priceUsd: APP_PLUS.monthly,
    },
    control: {
      name: 'Offer A: plain freemium, production v3 as it is (run v5’s offer)',
      offer: ['Quick Start without an account; free limit 3 sends then 30 minutes; Plus $10 a month or $100 a year in US dollars; English only'],
    },
    abLabels: ['A · freemium', 'B · retreat €19.99'],
    altLabel: 'Retreat at €39',
    changes: V6_CHANGES,
    defaultPrice: { label: `Ticket €19.99 (or €39) · then $${APP_PLUS.monthly} · $${APP_PLUS.yearly} a year`, usd: APP_PLUS.monthly },
    usYearlyMonthly: APP_PLUS.perMonthYearly,
    variables: varsUpTo(V6_LEVEL).map((k) => ({ key: k, label: VAR_LABEL[k] })),
    references: V6_REFERENCES,
    criteria: [
      { label: 'Question', value: 'Does the creator-retreat entry (the approved redesign) bring more people to Plus than plain freemium, and does €19.99 or €39 work better?' },
      { label: 'Who', value: `${people.length} personas from persona generator 2 (seed ${V6_SEED}), drawn in rounds of one per region × age band; regions balanced.` },
      { label: 'New variables', value: 'How they found Aurelia (creator follower / organic / employer), the meditation app they used before, why they left it, and budget sensitivity, on top of v5’s four. All read from the persona’s own profile.' },
      { label: 'Product version', value: 'A: production v3 as it is. B: the retreat redesign, a proposal answered as if built.' },
      { label: 'Price', value: `A: $${APP_PLUS.monthly} a month or $${APP_PLUS.yearly} a year. B: a €19.99 ticket (at €1 = $${EUR_USD}), then Plus at the same app price; the €39 ticket answered as well.` },
      { label: 'What the agent read first', value: 'v5’s documents plus the Retreat-in-a-Box specification and our reading, the B2B2C research and redesign, and the chat of 24 Nov.' },
      { label: 'Calibration', value: 'v5’s rules, unchanged, plus: a creator they follow raises what they would pay for that creator’s programme by half; a retreat buyer reaches Plus only if they would still be there at week 8.' },
      { label: 'Read it as', value: 'A comparison on the same 60 people. The retreat is sold only to a creator’s followers; read the followers’ rows for what the channel does, and the whole panel for what it costs in reach.' },
    ],
    instructions: V6_INSTRUCTIONS,
    findings: [],
    answers,
  }
}

const run = build()
const people = () => run.answers.map((a) => pool2().find((p) => p.id === a.personaId)!)

/** Expected Plus for an offer, over a set of answers (yes 1, maybe ½). */
function plusOf(rows: { tries: BuyerAnswer['tries']; pays: BuyerAnswer['pays'] }[]) {
  return expectedPlus(tally(rows))
}

/** Tallies and segments, computed from the answers (never typed). */
export function v6Tallies(r: BuyerRun = run) {
  const A = tally(r.answers.map((a) => a.control!))
  const B = tally(r.answers)
  const ALT = tally(r.answers.map((a) => a.alt!))
  const followers = r.answers.filter((a) => a.vars?.found === 'creator follower')
  const fA = tally(followers.map((a) => a.control!))
  const fB = tally(followers)
  const fALT = tally(followers.map((a) => a.alt!))
  const ps = people()
  const notifHit = ps.filter((p) => followersHas(p.id, followers) && dealBreakersHit(p, V6_B).includes('notifications every day')).length
  const payFirstHit = ps.filter((p) => followersHas(p.id, followers) && dealBreakersHit(p, V6_B).includes('being asked to pay before trying')).length
  const churn = bySegment(r.answers.filter((a) => a.vars?.churn !== 'never used one'), 'churn')
  return {
    A,
    B,
    ALT,
    followers: { n: followers.length, A: fA, B: fB, ALT: fALT, plusA: plusOf(followers.map((a) => a.control!)), plusB: plusOf(followers), plusALT: plusOf(followers.map((a) => a.alt!)) },
    others: { n: r.answers.length - followers.length, triesB: r.answers.filter((a) => a.vars?.found !== 'creator follower' && a.tries === 'yes').length },
    notifHit,
    payFirstHit,
    plus: { A: expectedPlus(A), B: expectedPlus(B), ALT: expectedPlus(ALT) },
    budget: bySegment(r.answers.map((a) => ({ ...a, tries: a.control!.tries, pays: a.control!.pays })), 'budget'),
    found: bySegment(r.answers.map((a) => ({ ...a, tries: a.control!.tries, pays: a.control!.pays })), 'found'),
    churn,
    moved: movedCounts(r.answers),
    themes: topThemes(r.answers),
    themesA: topThemes(r.answers.map((a) => ({ ...a, theme: play(pool2().find((p) => p.id === a.personaId)!, V6_A, V6_LEVEL).theme }))),
    band: band(r.answers),
    day30: r.answers.filter((a) => a.day30 === 'yes').length,
    employerTrigger: ps.filter((p) => p.profile.testing.buyTriggers.includes('their employer paying for it')).length,
  }
}
const followersHas = (id: string, f: BuyerAnswer[]) => f.some((a) => a.personaId === id)

export type Channel = 'creator follower' | 'organic' | 'employer'

/**
 * v6's best offer for each channel: the one with the most expected Plus
 * (yes 1, maybe ½) among that channel's personas. Run v7 builds on it.
 */
export function v6Best(): Record<Channel, Offer> {
  const pick = (ch: Channel): Offer => {
    const rows = run.answers.filter((a) => (a.vars?.found ?? 'organic') === ch)
    const scores: [Offer, number][] = [
      [V6_A, plusOf(rows.map((a) => a.control!))],
      [V6_B, plusOf(rows)],
      [V6_ALT, plusOf(rows.map((a) => a.alt!))],
    ]
    // Ties go to the offer with more people trying, then to freemium.
    const trying = (o: Offer) => rows.filter((a) => (o === V6_A ? a.control!.tries : o === V6_B ? a.tries : a.alt!.tries) === 'yes').length
    return scores.sort((x, y) => y[1] - x[1] || trying(y[0]) - trying(x[0]))[0][0]
  }
  return { 'creator follower': pick('creator follower'), organic: pick('organic'), employer: pick('employer') }
}

const seg = (rows: { key: string; n: number; tries: number; pays: number }[], key: string) => rows.find((x) => x.key === key) ?? { key, n: 0, tries: 0, pays: 0 }

function findings(): string[] {
  const x = v6Tallies()
  const n = x.A.n
  const f = x.followers
  const best = v6Best()
  const hi = seg(x.budget, 'high')
  const emp = seg(x.found, 'employer')
  const label = (k: string) => V6_CHANGES[k]?.label.toLowerCase() ?? k
  return [
    `Prediction, whole panel: plain freemium (A) ${of(x.A.tries.yes, n)} would try and ${x.A.pays.yes} pay (${x.A.pays.maybe} maybe); the retreat at €19.99 (B) ${of(x.B.tries.yes, n)} would buy the ticket and ${x.B.pays.yes} reach Plus (${x.B.pays.maybe} maybe). Expected Plus (yes 1, maybe ½): A ${x.plus.A}, B ${x.plus.B}, B at €39 ${x.plus.ALT}.`,
    `The retreat reaches only followers: ${of(f.n, n)} follow a creator. Among them, freemium gets ${f.A.tries.yes} trying and ${f.plusA} expected Plus; the €19.99 retreat ${f.B.tries.yes} buying and ${f.plusB}; €39 ${f.ALT.tries.yes} and ${f.plusALT}. Of the ${x.others.n} who do not follow a creator, ${x.others.triesB} would buy a stranger’s ticket.`,
    `€19.99 against €39: ${f.B.tries.yes} yes and ${f.B.tries.maybe} maybe at €19.99 among followers, ${f.ALT.tries.yes} yes and ${f.ALT.tries.maybe} maybe at €39.${f.ALT.tries.yes + f.ALT.tries.maybe < f.B.tries.yes + f.B.tries.maybe ? ' The higher ticket loses buyers before it can earn more from them.' : ''}`,
    `The retreat as specified hits deal breakers before price: ${of(x.notifHit, f.n)} followers refuse daily check-ins and ${of(x.payFirstHit, f.n)} refuse to pay before trying. One check-in a day at most is a fix v7 tests; paying before trying stays a no for the ticket.`,
    `Best offer by channel (most expected Plus): creator followers, ${best['creator follower'].name.toLowerCase()}; organic, ${best.organic.name.toLowerCase()}; employer, ${best.employer.name.toLowerCase()}. Run v7 builds on this.`,
    `Budget sensitivity: ${of(hi.tries, hi.n)} with a sensitive budget would try freemium, and ${hi.pays} would pay or might. A ticket up front asks this group to pay before anything has helped.`,
    `Employer: ${of(emp.n, n)} would hear of Aurelia through work; ${emp.tries} would try freemium. No offer here has the employer paying; ${of(x.employerTrigger, n)} name “their employer paying for it” as a reason to buy.`,
    `Why they left their last app: ${x.churn.slice(0, 3).map((c) => `${c.key} (${c.n})`).join(', ')}. What moved answers from A to B: ${x.moved.length ? x.moved.slice(0, 4).map(([k, c]) => `${label(k)} (${c})`).join(', ') : 'nothing'}. Top objections to B: ${x.themes.slice(0, 3).map(([k, c]) => `${k} (${c})`).join(', ')}.`,
    `Price band ${usd(x.band.low)}–${usd(x.band.high)} a month; a €19.99 ticket is about ${usd(Math.round(((19.99 * EUR_USD) / 2) * 100) / 100)} a month over its 8 weeks. Sure at day 30 on B: ${of(x.day30, n)}.`,
  ]
}

run.findings = findings()

export const RUN_V6: BuyerRun = run
