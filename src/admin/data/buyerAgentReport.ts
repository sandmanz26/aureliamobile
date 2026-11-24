import { DEFAULT_DECISIONS, type Decision } from './businessFunnel'
import { BUYER_RUNS, countVerdicts, personasOf, priceRange, type BuyerAnswer, type BuyerRun } from './buyerRuns'
import { AGENT_RULES, DESIGNS, agreement, report } from './buyerSim'
import { V3_CHANGES, type V3Change } from './buyerRunV3'
import { OVERALL_SUMMARY } from './buyerRerunSummaries'
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

export interface Iteration {
  /** Matches the finding id in reportSources. */
  id: 'it-v1' | 'it-v2' | 'it-v3' | 'it-rerun'
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
  link: string
  sources: SourceId[]
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
      name: 'Run v1',
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
      link: '/admin/buyer-agent?v=1',
      sources: ['buyer-v1', 'personas'],
    },
    {
      id: 'it-v2',
      name: 'Run v2',
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
      link: '/admin/buyer-agent?v=2',
      sources: ['buyer-v2', 'buyer-v1', 'personas'],
    },
    {
      id: 'it-v3',
      name: 'Run v3',
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
      link: '/admin/buyer-agent?v=3',
      sources: ['buyer-v3', 'buyer-v2', 'personas', 'backend-old', 'artefact'],
    },
    {
      id: 'it-rerun',
      name: 'Re-run by production version',
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
      link: '/admin/buyer-agent?view=versions',
      sources: ['buyer-rerun', 'versions', 'personas'],
    },
  ]
}
