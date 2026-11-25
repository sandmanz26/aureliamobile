import type { BuyerAnswer, BuyerRun, Reference } from './buyerRuns'
import { V6_CHANGES, V6_REFERENCES, v6Best, type Channel } from './buyerRunV6'
import {
  APP_PLUS,
  CULTURE,
  QUICK_WINS,
  RULES,
  VAR_LABEL,
  answer,
  band,
  bySegment,
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
  varsOf,
  varsUpTo,
  withQuickWins,
  type Offer,
} from './buyerPlay'

/**
 * Buyer agent run v7 (U124, J178): 100 personas from persona generator 2 on
 * a new seed, with five more variables (life stage, when they need it, trust
 * in AI for wellness, privacy concern, cultural context, Indonesia included).
 * Offer A is run v6's best offer for each channel; offer B adds the
 * Insight-Timer-style quick wins the business owner asked for: a free core
 * library, a daily check-in at most once a day, "Need help now?" and
 * community without ranks. Every figure is a prediction.
 */

export const V7_LEVEL = 7 as const
export const V7_SEED = 2032
export const V7_SIZE = 100

/** Offer A for a persona: v6's best offer for their channel. */
export function v7A(found: string): Offer {
  return v6Best()[(found as Channel) in v6Best() ? (found as Channel) : 'organic']
}

/** The retreat at €19.99 with the same quick wins, answered by everyone too: v6's retreat lost on daily check-ins, which one of the quick wins removes. */
export const V7_ALT = withQuickWins(retreat(19.99))

export const V7_REFERENCES: Reference[] = [
  ...V6_REFERENCES.filter((r) => !r.title.startsWith('Buyer agent')),
  { title: 'The business owner’s chat of 24 Nov 2026: Insight Timer quick wins', where: 'docs/briefs/2026-11-24-chat-part0-healing-map.md §2.5 · docs/briefs/2026-11-24-chat-combined.md', used: '“So many QUICK WINS FOR US… use their best performing features into our Aurelia app”: the free core library, the once-a-day check-in, “Need help now?” and community without ranks, adapted to our value.' },
  { title: 'Buyer agent run v6', where: 'This page, ?v=6', used: 'The best offer for each channel (offer A here), and the rules, unchanged.' },
]

export const V7_INSTRUCTIONS = `You are a buyer test agent. Run v7: 100 personas from persona generator 2 (seed ${V7_SEED}), drawn in rounds of one per region × age band.

Read first, as in v6, plus the business owner's chat of 24 Nov on Insight Timer's quick wins.

New this run, for every persona: life stage, the time of day they need it, trust in AI for wellness, privacy concern, and cultural context (Indonesia included).

Offer A is run v6's best offer for the persona's channel (how they found Aurelia). Offer B is A plus the Insight-Timer-style quick wins: a free core library with no limit, a daily check-in at most once a day, "Need help now?" one tap away, and community without ranks. Community without ranks is already in production v3: say so when it moves nobody. Everyone also answers the €19.99 creator retreat with the same quick wins (tries and pays only), because v6's retreat lost on daily check-ins and one quick win caps them at one a day.

${RULES}`

function build(): BuyerRun {
  const people = drawStratifiedN(pool2(), V7_SEED, V7_SIZE)
  const answers: BuyerAnswer[] = people.map((p) => {
    const A = v7A(varsOf(p).found)
    const B = withQuickWins(A)
    const a = play(p, A, V7_LEVEL)
    const alt = play(p, V7_ALT, V7_LEVEL)
    return answer(p, B, V7_LEVEL, {
      alt: { tries: alt.tries, pays: alt.pays, why: alt.because.find((b) => !/^Does not try|^A deal breaker is hit/.test(b)) ?? alt.because[0] },
      control: { tries: a.tries, pays: a.pays, why: `${A.name}: ${a.because.find((b) => !/^Does not try|^A deal breaker is hit/.test(b)) ?? a.because[0]}` },
      movedBy: movedBy(p, A, B, V7_LEVEL),
    })
  })
  const best = v6Best()
  return {
    id: 'run-7',
    version: 7,
    title: 'v7 · Insight-Timer-style quick wins on top of v6’s best offer, 100 personas',
    date: '2026-11-25',
    kind: 'run',
    generator: 2,
    method:
      'The agent played 100 personas from a new seed against v6’s best offer for their channel (A) and the same offer with the Insight-Timer-style quick wins (B), under v5’s written rules, after reading the PRD, the business owner’s documents and their chat on quick wins. No backend, no live model call. Every figure is a prediction.',
    panel: { seed: V7_SEED, size: people.length, personaIds: people.map((p) => p.id) },
    stimulus: {
      name: 'Offer B: v6’s best offer plus the quick wins',
      pitch: 'Everything in offer A, and: a free core library of sessions you can play any time, with no limit; one check-in a day at most, never a streak; “Need help now?” one tap away on every screen; a community without ranks.',
      offer: QUICK_WINS.map((f) => V6_CHANGES[f].label),
      priceUsd: APP_PLUS.monthly,
    },
    control: {
      name: 'Offer A: run v6’s best offer for each channel',
      offer: (Object.entries(best) as [Channel, Offer][]).map(([ch, o]) => `${ch[0].toUpperCase()}${ch.slice(1)}: ${o.name}`),
    },
    abLabels: ['A · v6’s best', 'B · + quick wins'],
    altLabel: 'Retreat €19.99 + quick wins',
    changes: V6_CHANGES,
    defaultPrice: { label: `As in A (${[...new Set(Object.values(best).map((o) => (o.entry === 'ticket' ? `ticket €${o.ticketEur}, then ` : '')))].join('')}$${APP_PLUS.monthly} · $${APP_PLUS.yearly} a year)`, usd: APP_PLUS.monthly },
    usYearlyMonthly: APP_PLUS.perMonthYearly,
    variables: varsUpTo(V7_LEVEL).map((k) => ({ key: k, label: VAR_LABEL[k] })),
    references: V7_REFERENCES,
    criteria: [
      { label: 'Question', value: 'On top of run v6’s best offer, do the Insight-Timer-style quick wins bring more people in, keep them longer and bring more to Plus, and for whom?' },
      { label: 'Who', value: `${people.length} personas from persona generator 2 (seed ${V7_SEED}), drawn in rounds of one per region × age band; ${people.filter((p) => p.country === 'Indonesia').length} in Indonesia.` },
      { label: 'New variables', value: 'Life stage, when they need it, trust in AI for wellness, privacy concern and cultural context, on top of v5’s and v6’s eight. All read from the persona’s own profile.' },
      { label: 'Product version', value: 'A: v6’s best offer per channel (built parts are production v3). B: A plus four quick wins; three are proposals, community without ranks is built.' },
      { label: 'Price', value: `As in A: Plus at the app’s $${APP_PLUS.monthly} a month or $${APP_PLUS.yearly} a year${Object.values(best).some((o) => o.entry === 'ticket') ? ', after the retreat ticket where the retreat is the best offer' : ''}. The quick wins add no price.` },
      { label: 'What the agent read first', value: 'v6’s documents plus the business owner’s chat of 24 Nov on quick wins.' },
      { label: 'Calibration', value: 'v5’s rules, unchanged. The life-stage, time-of-need and culture variables act through them: a young family has less time, a retiree more; a collective culture warms to a cohort, a reserved one less so; the free limit can land at night.' },
      { label: 'Read it as', value: 'A comparison on the same 100 people. A quick win that moves nobody is a finding, not a failure of the run.' },
    ],
    instructions: V7_INSTRUCTIONS,
    findings: [],
    answers,
  }
}

const run = build()

/** Tallies and segments, computed from the answers (never typed). */
export function v7Tallies(r: BuyerRun = run) {
  const A = tally(r.answers.map((a) => a.control!))
  const B = tally(r.answers)
  const lostPay = r.answers.filter((a) => a.control!.pays !== 'no' && a.pays === 'no').length
  const segB = (key: string) => bySegment(r.answers, key)
  const segA = (key: string) => bySegment(r.answers.map((a) => ({ ...a, tries: a.control!.tries, pays: a.control!.pays })), key)
  const indo = r.answers.filter((a) => a.vars?.culture?.startsWith('Indonesia'))
  const followers = r.answers.filter((a) => a.vars?.found === 'creator follower')
  return {
    A,
    B,
    plus: { A: expectedPlus(A), B: expectedPlus(B) },
    lostPay,
    moved: movedCounts(r.answers),
    themes: topThemes(r.answers),
    aiTrustA: segA('aiTrust'),
    aiTrustB: segB('aiTrust'),
    privacy: segB('privacy'),
    needTimeA: segA('needTime'),
    needTimeB: segB('needTime'),
    lifeStage: segB('lifeStage'),
    indo: { n: indo.length, A: tally(indo.map((a) => a.control!)), B: tally(indo) },
    followers: { n: followers.length, B: tally(followers), ALT: tally(followers.map((a) => a.alt!)), plusB: expectedPlus(tally(followers)), plusALT: expectedPlus(tally(followers.map((a) => a.alt!))) },
    band: band(r.answers),
    day30A: r.answers.filter((a) => play(pool2().find((p) => p.id === a.personaId)!, v7A(a.vars?.found ?? 'organic'), V7_LEVEL).day30 === 'yes').length,
    day30B: r.answers.filter((a) => a.day30 === 'yes').length,
    weekB: r.answers.reduce((s, a) => s + (a.week ?? 0), 0) / r.answers.length,
  }
}

const seg = (rows: { key: string; n: number; tries: number; pays: number }[], key: string) => rows.find((x) => x.key === key) ?? { key, n: 0, tries: 0, pays: 0 }

function findings(): string[] {
  const x = v7Tallies()
  const n = x.A.n
  const label = (k: string) => V6_CHANGES[k]?.label ?? k
  const movedKeys = new Set(x.moved.map(([k]) => k))
  const idle = QUICK_WINS.filter((k) => !movedKeys.has(k))
  const lowA = seg(x.aiTrustA, 'low')
  const lowB = seg(x.aiTrustB, 'low')
  const none = seg(x.aiTrustB, 'none')
  const nightA = seg(x.needTimeA, 'at night, in bed')
  const nightB = seg(x.needTimeB, 'at night, in bed')
  const prot = seg(x.privacy, 'very protective')
  const fam = [seg(x.lifeStage, 'young family'), seg(x.lifeStage, 'caring for family')]
  return [
    `Prediction: quick wins on top of v6’s best offer. Would try ${x.A.tries.yes} → ${x.B.tries.yes} of ${n} (no: ${x.A.tries.no} → ${x.B.tries.no}). Would pay ${x.A.pays.yes} → ${x.B.pays.yes} yes, ${x.A.pays.maybe} → ${x.B.pays.maybe} maybe; expected Plus (yes 1, maybe ½) ${x.plus.A} → ${x.plus.B}.`,
    `What moved answers: ${x.moved.length ? x.moved.map(([k, c]) => `${label(k).toLowerCase()} (${c})`).join(', ') : 'nothing'}.${idle.length ? ` Moved nobody: ${idle.map((k) => label(k).toLowerCase()).join(', ')}${idle.includes('community-no-ranks') ? ' (community without ranks is already in production v3)' : ''}.` : ''}`,
    `The free core library brings people in and keeps some from paying: ${of(x.lostPay, n)} who would pay or might on A say no on B, because the free core is enough. More trying, fewer payers per person: the Insight Timer trade.`,
    `Trust in AI: ${of(lowA.tries, lowA.n)} with low trust would try A, ${lowB.tries} B (the library lets them sample). With no trust at all, ${of(none.tries, none.n)} try B: no quick win answers “a machine wrote it”.`,
    `At night, in bed: ${of(nightA.tries, nightA.n)} try A, ${nightB.tries} B. The free limit can land mid-session at 3am on A; a free library removes that moment.`,
    `Indonesia (${x.indo.n} personas): would try ${x.indo.A.tries.yes} → ${x.indo.B.tries.yes}, would pay or might ${x.indo.A.pays.yes + x.indo.A.pays.maybe} → ${x.indo.B.pays.yes + x.indo.B.pays.maybe}. ${CULTURE.Indonesia.split(': ')[1]}: Bahasa and a rupiah price matter more there than any quick win.`,
    `Privacy: ${of(prot.tries, prot.n)} who are very protective would try B; the quick wins add no data line, which is still their first question. Families try B too (young family ${fam[0].tries} of ${fam[0].n}, caring for family ${fam[1].tries} of ${fam[1].n}) but, by the rules, play a session fewer in week one.`,
    `The retreat again, with the quick wins: among ${x.followers.n} creator followers, ${x.followers.ALT.tries.yes} would buy the €19.99 ticket (B, freemium with quick wins: ${x.followers.B.tries.yes} try); expected Plus ${x.followers.plusALT} against ${x.followers.plusB}. ${x.followers.plusALT > x.followers.plusB ? 'With check-ins capped at one a day, the retreat now beats freemium for followers.' : 'Even with check-ins capped at one a day, freemium still brings followers to Plus more often.'}`,
    `Top objections to B: ${x.themes.slice(0, 3).map(([k, c]) => `${k} (${c})`).join(', ')}. Price band ${usd(x.band.low)}–${usd(x.band.high)} a month. Week one averages ${x.weekB.toFixed(1)} sessions on B; sure at day 30 ${x.day30A} → ${x.day30B} of ${n}.`,
  ]
}

run.findings = findings()

export const RUN_V7: BuyerRun = run
