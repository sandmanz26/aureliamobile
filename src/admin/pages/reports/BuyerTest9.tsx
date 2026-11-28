import { useMemo, useState } from 'react'
import { Panel } from '../../components/ui'
import { ASSEMBLY_RULES } from '../../data/akpAssembly'
import { v9BrainImpact } from '../../data/aiBrain'
import { V9_OBJECTION_LABEL, V9_OFFER_A, V9_OFFER_B_TEMPLATE, V9_RULES, runV9, v9Change, v9Findings, v9Tallies, type V9GroupRow } from '../../data/buyerRunV9'

/*
 * Buyer agent report → Test 9 (U150, J208): test 8's StateFlip journey (A)
 * against the same journey with the person's own first chapter, assembled
 * from AKPs matched to their identity and condition (B). Every number comes
 * from data/buyerRunV9.ts and data/akpAssembly.ts.
 */

/** One line for the report's Summary tab, linking to the test in Detail. */
export function Test9Line() {
  const x = useMemo(() => v9Tallies(), [])
  return (
    <p className="rounded-8 border border-adm-line bg-adm-surface px-12 py-8 text-13 text-adm-ink">
      <span className="font-semibold">New, test 9: </span>the same StateFlip journey, but each person sees their own first chapter built from AKPs (“4-7-8 breathing, warm low voice, 55 BPM drone, 10 min”): would pay {x.payA.yes} → {x.payB.yes} of {x.n} simulated people.{' '}
      <a href="?tab=detail#test-9" className="font-medium underline decoration-adm-axis underline-offset-2">See test 9</a>
    </p>
  )
}

const pc = (k: number, n: number) => `${Math.round((k / Math.max(1, n)) * 100)}%`
const pct = (x: number) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`

function GroupTable({ rows, head }: { rows: V9GroupRow[]; head: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-12">
        <thead className="text-11 uppercase tracking-wider text-adm-muted">
          <tr className="border-b border-adm-line">
            <th className="py-6 pr-12 font-semibold">{head}</th>
            <th className="py-6 pr-12 font-semibold">People</th>
            <th className="py-6 pr-12 font-semibold">Try A → B</th>
            <th className="py-6 pr-12 font-semibold">Pay A → B</th>
            <th className="py-6 pr-12 font-semibold">Top objection (B)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.key} className="border-b border-adm-line last:border-0">
              <td className="py-8 pr-12 font-semibold text-adm-ink">{d.label}</td>
              <td className="py-8 pr-12 tabular-nums">{d.n}</td>
              <td className="py-8 pr-12 tabular-nums">{d.tryA} → {d.tryB}</td>
              <td className="py-8 pr-12 tabular-nums">{d.payA} → {d.payB}</td>
              <td className="py-8 pr-12 text-adm-ink-2">{d.topObjectionB ? `${V9_OBJECTION_LABEL[d.topObjectionB]} (${d.topObjectionCount})` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BuyerTest9() {
  const x = useMemo(() => v9Tallies(), [])
  const change = useMemo(() => v9Change(), [])
  const findings = useMemo(() => v9Findings(), [])
  const impact = useMemo(() => v9BrainImpact(), [])
  const [who, setWho] = useState(0)
  const examples = useMemo(() => {
    const up = x.payUp.slice(0, 4)
    const no = runV9().answers.filter((a) => a.b.tries === 'no').slice(0, 2)
    return [...up, ...no]
  }, [x])
  const ex = examples[who]

  return (
    <section id="test-9" className="flex min-w-0 scroll-mt-16 flex-col gap-16">
      <Panel
        title={`Test 9: their own first chapter, built from AKPs, shown before the free week. Would pay ${x.payA.yes} → ${x.payB.yes} of ${x.n}`}
        description={`Simulated, by written rules, on persona set v4 (${x.total} people, ${x.excluded} risk-flagged left out). A = ${V9_OFFER_A}. B = ${V9_OFFER_B_TEMPLATE}.`}
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
          <GroupTable rows={x.dims} head="Main need" />
        </Panel>
        <Panel title="By identity archetype" description="The Wellness Identity archetype (personaIdentityV4), from each person’s life situation.">
          <GroupTable rows={x.archetypes} head="Archetype" />
        </Panel>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="What changed against test 8, and why" description="The declaration from runChanges.ts (V9_CHANGE), and B’s effect split into its parts on the same people.">
          <ul className="flex flex-col gap-6 text-13 text-adm-ink-2">
            {change.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <ol className="flex flex-col gap-4 text-12">
            {change.split.map((s) => (
              <li key={s.label} className="flex justify-between gap-8 border-t border-adm-line pt-4">
                <span className="min-w-0 text-adm-ink">{s.label}</span>
                <span className="shrink-0 tabular-nums text-adm-ink-2">paid {s.paid}{s.step ? ` (+${s.step})` : ''}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Objections, and the chance to reach the targets" description="Objections among those who would not pay; the AI brain’s chance with test 8’s journey alone against test 9’s B.">
          <div className="grid grid-cols-2 gap-12">
            {(['A', 'B'] as const).map((s) => (
              <div key={s} className="flex min-w-0 flex-col gap-4">
                <span className="text-12 font-semibold text-adm-ink">Offer {s}</span>
                <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
                  {(s === 'A' ? x.objectionsA : x.objectionsB).map(([k, c]) => (
                    <li key={k} className="flex justify-between gap-8">
                      <span className="min-w-0">{V9_OBJECTION_LABEL[k]}</span>
                      <span className="tabular-nums">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-12 text-adm-ink-2">
            Would pay after the free week: {pct(impact.paidBefore)} → {pct(impact.paidAfter)} (target 15%). Business chance {pct(impact.businessBefore)} → {pct(impact.businessAfter)}; all three functions {pct(impact.mvpBefore)} → {pct(impact.mvpAfter)}.
            {impact.businessAfter === impact.businessBefore ? ' No change: test 8’s journey already met the 15% target, so the business chance is held back by the other funnel stages (day 7, day 30, the free limit), not by paying.' : ''}
          </p>
        </Panel>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <Panel title="How the first chapter is assembled" description="akpAssembly.ts: one AKP per role, picked by written rules from the person’s identity and StateFlip. Drafted by us — to review.">
          <dl className="flex flex-col gap-6 text-12">
            {ASSEMBLY_RULES.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-col gap-2">
                <dt className="font-semibold text-adm-ink">{r.label}</dt>
                <dd className="break-words text-adm-ink-2">{r.rule}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="The rules, written out" description="A is played by test 8’s rules; B adds four written terms.">
          <dl className="flex flex-col gap-6 text-12">
            {V9_RULES.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-col gap-2">
                <dt className="font-semibold text-adm-ink">{r.label}</dt>
                <dd className="break-words text-adm-ink-2">{r.formula}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {ex && (
        <Panel title="One person, worked by hand" description="Pick someone: the chapter they were shown, the AKPs in it and why, and their numbers.">
          <div className="flex flex-wrap gap-6">
            {examples.map((a, i) => (
              <button key={a.personaId} type="button" onClick={() => setWho(i)} aria-pressed={i === who} className={`rounded-full border px-10 py-4 text-12 ${i === who ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`}>
                {a.name.split(' ')[0]} · {a.country}
              </button>
            ))}
          </div>
          <p className="text-13 text-adm-ink">
            {ex.name} ({ex.archetype}): StateFlip {ex.flipId} “{ex.flipTitle}”. A: tries {ex.a.tries}, pays {ex.a.pays}. B: tries {ex.b.tries}, pays {ex.b.pays}.
          </p>
          <p className="rounded-8 border border-adm-line bg-adm-bg px-12 py-8 text-13 text-adm-ink">{ex.chapter.preview}</p>
          <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
            {ex.chapter.pieces.map((q) => (
              <li key={q.role} className="break-words">
                <span className="font-semibold text-adm-ink">{q.role}:</span> {q.akp.name} <span className="font-mono text-11">{q.akp.id}</span> · {q.matched}
              </li>
            ))}
          </ul>
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
