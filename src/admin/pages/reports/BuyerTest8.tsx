import { useMemo, useState } from 'react'
import { Panel } from '../../components/ui'
import { V8_OBJECTION_LABEL, V8_OFFER_A, V8_OFFER_B_TEMPLATE, V8_RULES, runV8, v8Change, v8Findings, v8Tallies } from '../../data/buyerRunV8'

/*
 * Buyer agent report → Test 8 (U147, J206): persona set v4 against v7's best
 * offer (A) and a StateFlip journey with a free first week (B). Every number
 * comes from data/buyerRunV8.ts.
 */

/** One line for the report's Summary tab, linking to the test in Detail. */
export function Test8Line() {
  const x = useMemo(() => v8Tallies(), [])
  return (
    <p className="rounded-8 border border-adm-line bg-adm-surface px-12 py-8 text-13 text-adm-ink">
      <span className="font-semibold">New, test 8: </span>a journey named after each person’s own StateFlip, free first week, then $10/month: would pay {x.payA.yes} → {x.payB.yes} of {x.n} simulated people, against v7’s best offer.{' '}
      <a href="?tab=detail#test-8" className="font-medium underline decoration-adm-axis underline-offset-2">See test 8</a>
    </p>
  )
}

const pc = (k: number, n: number) => `${Math.round((k / Math.max(1, n)) * 100)}%`

export function BuyerTest8() {
  const x = useMemo(() => v8Tallies(), [])
  const change = useMemo(() => v8Change(), [])
  const findings = useMemo(() => v8Findings(), [])
  const [who, setWho] = useState(0)
  const answers = runV8().answers
  const examples = useMemo(() => {
    const up = x.payUp.slice(0, 4)
    const no = answers.filter((a) => a.b.tries === 'no').slice(0, 2)
    return [...up, ...no]
  }, [x, answers])
  const ex = examples[who]

  return (
    <section id="test-8" className="flex min-w-0 scroll-mt-16 flex-col gap-16">
      <Panel
        title={`Test 8: a journey for their own StateFlip, free first week, then $10/month. Would pay ${x.payA.yes} → ${x.payB.yes} of ${x.n}`}
        description={`Simulated, by written rules, on persona set v4 (${x.total} people, ${x.excluded} risk-flagged left out: they get Need help now?, never an offer). A = ${V8_OFFER_A.name}. B = “${V8_OFFER_B_TEMPLATE}”, with X their own StateFlip.`}
      >
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            ['Would try A', `${x.tryA.yes}`, pc(x.tryA.yes, x.n)],
            ['Would try B', `${x.tryB.yes}`, pc(x.tryB.yes, x.n)],
            ['Would pay A', `${x.payA.yes}`, `expected paid ${x.paidA}`],
            ['Would pay B', `${x.payB.yes}`, `expected paid ${x.paidB}`],
          ].map(([l, v, n]) => (
            <div key={l} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg p-12">
              <dt className="text-12 text-adm-muted">{l}</dt>
              <dd className="text-22 font-semibold tabular-nums text-adm-ink">{v}</dd>
              <dd className="text-12 text-adm-ink-2">{n}</dd>
            </div>
          ))}
        </dl>
        <ul className="flex list-disc flex-col gap-4 pl-16 text-13 text-adm-ink-2">
          {findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="By dimension of the main need" description="Would try and would pay, A → B, and the top objection to B among those who would not pay.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-12">
              <thead className="text-11 uppercase tracking-wider text-adm-muted">
                <tr className="border-b border-adm-line">
                  <th className="py-6 pr-12 font-semibold">Main need</th>
                  <th className="py-6 pr-12 font-semibold">People</th>
                  <th className="py-6 pr-12 font-semibold">Try A → B</th>
                  <th className="py-6 pr-12 font-semibold">Pay A → B</th>
                  <th className="py-6 pr-12 font-semibold">Top objection (B)</th>
                </tr>
              </thead>
              <tbody>
                {x.dims.map((d) => (
                  <tr key={d.dimension} className="border-b border-adm-line last:border-0">
                    <td className="py-8 pr-12 font-semibold text-adm-ink">{d.label}</td>
                    <td className="py-8 pr-12 tabular-nums">{d.n}</td>
                    <td className="py-8 pr-12 tabular-nums">{d.tryA} → {d.tryB}</td>
                    <td className="py-8 pr-12 tabular-nums">{d.payA} → {d.payB}</td>
                    <td className="py-8 pr-12 text-adm-ink-2">{d.topObjectionB ? `${V8_OBJECTION_LABEL[d.topObjectionB]} (${d.topObjectionCount})` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Objections, among those who would not pay" description="The largest negative term in each person’s pay score.">
          <div className="grid grid-cols-2 gap-12">
            {(['A', 'B'] as const).map((s) => (
              <div key={s} className="flex min-w-0 flex-col gap-4">
                <span className="text-12 font-semibold text-adm-ink">Offer {s}</span>
                <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
                  {(s === 'A' ? x.objectionsA : x.objectionsB).map(([k, c]) => (
                    <li key={k} className="flex justify-between gap-8">
                      <span>{V8_OBJECTION_LABEL[k]}</span>
                      <span className="tabular-nums">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="What changed against test 7, and why" description="The declaration (offer, panel, rules) from runChanges.ts, and B’s effect split into its parts on the same people.">
          <ul className="flex flex-col gap-6 text-13 text-adm-ink-2">
            {change.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <ol className="flex flex-col gap-4 text-12">
            {change.split.map((s) => (
              <li key={s.label} className="flex justify-between gap-8 border-t border-adm-line pt-4">
                <span className="text-adm-ink">{s.label}</span>
                <span className="tabular-nums text-adm-ink-2">expected paid {s.paid}{s.step ? ` (+${s.step})` : ''}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="The rules, written out" description="Each person is read through conditionForBuyer (need, urgency, readiness, scepticism, time) and their StateFlip’s chance.">
          <dl className="flex flex-col gap-6 text-12">
            {V8_RULES.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-col gap-2">
                <dt className="font-semibold text-adm-ink">{r.label}</dt>
                <dd className="break-words text-adm-ink-2">{r.formula}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {ex && (
        <Panel title="One person, worked by hand" description="Pick someone: their numbers, every formula with their values in it.">
          <div className="flex flex-wrap gap-6">
            {examples.map((a, i) => (
              <button key={a.personaId} type="button" onClick={() => setWho(i)} aria-pressed={i === who} className={`rounded-full border px-10 py-4 text-12 ${i === who ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`}>
                {a.name.split(' ')[0]} · {a.country}
              </button>
            ))}
          </div>
          <p className="text-13 text-adm-ink">
            {ex.name}: StateFlip {ex.flipId} “{ex.flipTitle}”. A: tries {ex.a.tries}, pays {ex.a.pays}. B: tries {ex.b.tries}, pays {ex.b.pays}.
          </p>
          <ul className="flex flex-col gap-4 font-mono text-11 text-adm-ink-2">
            {ex.why.map((w) => (
              <li key={w} className="break-words">{w}</li>
            ))}
          </ul>
        </Panel>
      )}
    </section>
  )
}
