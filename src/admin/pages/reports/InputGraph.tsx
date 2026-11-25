import { useState } from 'react'
import { INPUT_DOT } from './reportColors'
import { INPUT_KINDS, INPUT_LABEL, changedFrom, inputEdges, type InputKind, type Iteration, type ReportId } from '../../data/buyerAgentReport'

/*
 * U122 (J177): the buyer report's inputs as a matrix-like graph. Rows are the
 * five input kinds, columns the report versions; each cell is the value that
 * report used, on a line from its input. A line is drawn only where the data
 * records the input (inputEdges); "not recorded" cells sit on a dashed gap.
 * Click a report to light its five inputs; click an input to follow it across
 * the reports and see where it changed.
 */

const INPUT_LINE: Record<InputKind, string> = {
  personas: 'border-adm-s1',
  product: 'border-adm-s2',
  prd: 'border-adm-s3',
  ownerDocs: 'border-adm-s4',
  price: 'border-adm-good',
}

type Pick = { kind: 'report'; id: ReportId } | { kind: 'input'; id: InputKind } | null

export function InputGraph({ iterations }: { iterations: Iteration[] }) {
  const [pick, setPick] = useState<Pick>(null)
  const edges = inputEdges(iterations)
  const hasEdge = (k: InputKind, r: ReportId) => edges.some((e) => e.input === k && e.report === r)
  const lit = (k: InputKind, r: ReportId) => !pick || (pick.kind === 'report' ? pick.id === r : pick.id === k)
  const toggle = (p: NonNullable<Pick>) => setPick((cur) => (cur && cur.kind === p.kind && cur.id === p.id ? null : p))
  const selected = pick?.kind === 'report' ? iterations.find((it) => it.id === pick.id) : undefined

  return (
    <div className="flex flex-col gap-12">
      <div className="overflow-x-auto rounded-8 border border-adm-line bg-adm-bg p-12">
        <div className="grid min-w-[880px] gap-x-12 gap-y-10" style={{ gridTemplateColumns: `170px repeat(${iterations.length}, minmax(170px, 1fr))` }} role="group" aria-label="Inputs on the left, report versions across the top; each cell is the value that report used.">
          <div className="self-end text-11 font-semibold uppercase tracking-wider text-adm-muted">Inputs ↓ · Reports →</div>
          {iterations.map((it) => {
            const on = pick?.kind === 'report' && pick.id === it.id
            return (
              <button
                key={it.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle({ kind: 'report', id: it.id })}
                data-report={it.id}
                className={`flex flex-col items-start gap-2 rounded-8 border px-10 py-8 text-left transition-colors ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-ink-2 bg-adm-surface text-adm-ink hover:bg-adm-hover'}`}
              >
                <span className="text-13 font-semibold">{it.name}</span>
                <span className={`text-11 ${on ? 'text-adm-surface/80' : 'text-adm-muted'}`}>{INPUT_KINDS.filter((k) => it.inputs[k].recorded).length} of 5 inputs recorded</span>
              </button>
            )
          })}
          {INPUT_KINDS.map((k) => {
            const on = pick?.kind === 'input' && pick.id === k
            return [
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => toggle({ kind: 'input', id: k })}
                data-input={k}
                className={`flex items-center gap-8 rounded-8 border px-10 py-8 text-left text-12 font-semibold transition-colors ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line bg-adm-surface text-adm-ink hover:bg-adm-hover'}`}
              >
                <span className={`h-8 w-8 shrink-0 rounded-full ${INPUT_DOT[k]}`} aria-hidden="true" />
                {INPUT_LABEL[k]}
              </button>,
              ...iterations.map((it, i) => {
                const v = it.inputs[k]
                const edge = hasEdge(k, it.id)
                const changed = changedFrom(iterations, i, k)
                const bright = lit(k, it.id)
                return (
                  <div key={`${k}-${it.id}`} data-cell={`${k}:${it.id}`} data-lit={bright && pick ? 'true' : undefined} className={`relative flex items-center transition-opacity ${bright ? 'opacity-100' : 'opacity-25'}`}>
                    <span aria-hidden="true" className={`absolute top-1/2 -left-12 w-12 border-t-2 ${edge ? INPUT_LINE[k] : 'border-dashed border-adm-axis'}`} />
                    <div
                      className={`relative w-full rounded-8 border px-10 py-6 text-12 ${edge ? 'border-adm-line bg-adm-surface text-adm-ink' : 'border-dashed border-adm-axis bg-transparent italic text-adm-muted'} ${bright && pick ? 'ring-2 ring-adm-ink' : ''}`}
                    >
                      {v.short}
                      {changed && <span className="ml-6 inline-block rounded-4 bg-adm-s2/15 px-4 text-10 font-semibold not-italic text-adm-ink">changed</span>}
                    </div>
                  </div>
                )
              }),
            ]
          })}
        </div>
      </div>

      <div className="min-h-[72px] rounded-8 border border-adm-line bg-adm-surface p-12 text-12" aria-live="polite">
        {!pick && <p className="text-adm-muted">Click a report to see its five inputs in full, or an input to follow it across the reports. A solid line means the input is recorded; a dashed gap means the data does not say.</p>}
        {selected && (
          <div className="flex flex-col gap-8">
            <p className="text-13 font-semibold text-adm-ink">{selected.name} was made from</p>
            <dl className="grid gap-x-12 gap-y-6 lg:grid-cols-[180px_1fr]">
              {INPUT_KINDS.map((k) => (
                <div key={k} className="contents">
                  <dt className="flex items-center gap-6 font-semibold text-adm-ink">
                    <span className={`h-8 w-8 rounded-full ${INPUT_DOT[k]}`} aria-hidden="true" />
                    {INPUT_LABEL[k]}
                  </dt>
                  <dd className={selected.inputs[k].recorded ? 'text-adm-ink-2' : 'italic text-adm-muted'}>
                    {selected.inputs[k].recorded ? '' : 'Not recorded. '}
                    {selected.inputs[k].detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {pick?.kind === 'input' && (
          <div className="flex flex-col gap-8">
            <p className="text-13 font-semibold text-adm-ink">{INPUT_LABEL[pick.id]}, report by report</p>
            <ol className="flex flex-col gap-6">
              {iterations.map((it, i) => (
                <li key={it.id} className="flex flex-col gap-2 lg:flex-row lg:gap-12">
                  <span className="shrink-0 font-semibold text-adm-ink lg:w-[260px]">
                    {it.name}
                    {changedFrom(iterations, i, pick.id) && <span className="ml-6 rounded-4 bg-adm-s2/15 px-4 text-10 font-semibold">changed</span>}
                  </span>
                  <span className={it.inputs[pick.id].recorded ? 'text-adm-ink-2' : 'italic text-adm-muted'}>{it.inputs[pick.id].detail}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
