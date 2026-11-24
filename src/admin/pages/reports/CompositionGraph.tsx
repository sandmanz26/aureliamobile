import { ExternalLink } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS, type CompLevel, type CompNode } from '../../data/combinationReport'
import { LABEL_MEANING, LABEL_TEXT, SOURCE_KINDS, type SourceLabel } from '../../data/reportSources'
import { LABEL_FILL, LABEL_STROKE } from './reportColors'

/*
 * U121 (J176): the Combination report's "How this report was made", as four
 * levels read left to right: sources → building blocks → stage readings →
 * verdict. Every node and edge comes from buildComposition(); this file only
 * lays them out. Hover, focus or click a node to light its whole path up and
 * down; the panel says what it is made of and what it feeds. Under the graph
 * the same thing is written out as lists, for reading without the picture.
 */

const NW = 210
const NH = 36
const ROW = 42
const KIND_H = 22
const PADX = 8
const PADY = 12
const W = 1040
const GAP = (W - 2 * PADX - 4 * NW) / 3
const colX = (level: CompLevel) => PADX + (level - 1) * (NW + GAP)

const STATUS_FILL = { 'on-track': 'fill-adm-good', below: 'fill-adm-critical', unmeasured: 'fill-adm-muted' } as const

function clip(s: string, n = 30) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

interface Placed extends CompNode {
  y: number
}

/** Positions: level 1 stacked by kind with a heading per kind, the other levels spread evenly over the same height. */
function layout(nodes: CompNode[]) {
  const l1 = nodes.filter((n) => n.level === 1)
  const kinds: { kind: string; y: number }[] = []
  const placed: Placed[] = []
  let y = PADY
  for (const kind of SOURCE_KINDS) {
    const inKind = l1.filter((n) => n.kind === kind)
    if (!inKind.length) continue
    kinds.push({ kind, y: y + 14 })
    y += KIND_H
    for (const n of inKind) {
      placed.push({ ...n, y })
      y += ROW
    }
  }
  const H = y + PADY
  for (const level of [2, 3, 4] as CompLevel[]) {
    const ns = nodes.filter((n) => n.level === level)
    const step = Math.min((H - 2 * PADY) / ns.length, 96)
    const top = (H - step * ns.length) / 2
    ns.forEach((n, i) => placed.push({ ...n, y: top + i * step + (step - NH) / 2 }))
  }
  return { placed, kinds, H }
}

function closure(start: string, next: (id: string) => string[]) {
  const seen = new Set<string>()
  const stack = [start]
  while (stack.length) {
    const id = stack.pop()!
    for (const n of next(id))
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(n)
      }
  }
  return seen
}

function NodeLink({ n }: { n: CompNode }) {
  if (!n.link) return null
  const text = n.level === 1 ? 'Open the source' : n.link.startsWith('#') ? 'Go to the section' : 'Open the decision log'
  const cls = 'inline-flex items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink'
  return n.link.startsWith('#') ? (
    <a href={n.link} className={cls}>
      {text}
    </a>
  ) : (
    <Link to={n.link} className={cls}>
      {text}
      <ExternalLink size={11} aria-hidden="true" />
    </Link>
  )
}

export function CompositionGraph({ nodes }: { nodes: CompNode[] }) {
  const [hover, setHover] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const { placed, kinds, H } = useMemo(() => layout(nodes), [nodes])
  const byId = useMemo(() => new Map(placed.map((n) => [n.id, n])), [placed])
  const feeds = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const n of nodes) for (const i of n.inputs) m.set(i, [...(m.get(i) ?? []), n.id])
    return m
  }, [nodes])
  const edges = placed.flatMap((n) => n.inputs.map((i) => ({ from: byId.get(i)!, to: n })))

  const active = hover ?? focus ?? selected
  const path = useMemo(() => {
    if (!active) return null
    const up = closure(active, (id) => byId.get(id)?.inputs ?? [])
    const down = closure(active, (id) => feeds.get(id) ?? [])
    return new Set([active, ...up, ...down])
  }, [active, byId, feeds])
  const lit = (id: string) => !path || path.has(id)
  const shown = active ? byId.get(active) : undefined

  const pick = (id: string) => setSelected((s) => (s === id ? null : id))
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(id)
    } else if (e.key === 'Escape') setSelected(null)
  }
  const levelOf = (l: CompLevel) => LEVELS.find((x) => x.level === l)!
  const labelsUsed = (Object.keys(LABEL_TEXT) as SourceLabel[]).filter((l) => nodes.some((n) => n.label === l))

  return (
    <div className="flex flex-col gap-14">
      <div className="grid gap-14 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 overflow-x-auto rounded-8 border border-adm-line bg-adm-bg">
          <div style={{ width: W }} className="flex flex-col">
            <div className="grid border-b border-adm-line py-10" style={{ gridTemplateColumns: `repeat(4, ${NW}px)`, columnGap: GAP, paddingInline: PADX }}>
              {LEVELS.map((l) => (
                <div key={l.level} className="flex flex-col gap-2">
                  <span className="text-12 font-semibold text-adm-ink">{l.title}</span>
                  <span className="text-11 leading-snug text-adm-muted">{l.description}</span>
                </div>
              ))}
            </div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              role="group"
              aria-label="How the Combination report is built, in four levels. Each box can be focused; the panel says what it is made of and what it feeds. The same is written out under the graph."
              className="block max-w-none"
              onMouseLeave={() => setHover(null)}
            >
              {kinds.map((k) => (
                <text key={k.kind} x={PADX} y={k.y} className="fill-adm-muted text-10 font-semibold uppercase tracking-wider">
                  {k.kind}
                </text>
              ))}
              {edges.map((e) => {
                const on = !!path && path.has(e.from.id) && path.has(e.to.id)
                const x1 = colX(e.from.level) + NW
                const x2 = colX(e.to.level)
                const y1 = e.from.y + NH / 2
                const y2 = e.to.y + NH / 2
                const mid = (x1 + x2) / 2
                return (
                  <path
                    key={`${e.from.id}>${e.to.id}`}
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    strokeWidth={on ? 2 : 1.25}
                    className={`${e.from.label ? LABEL_STROKE[e.from.label] : 'stroke-adm-ink-2'} transition-opacity`}
                    opacity={path ? (on ? 0.9 : 0.05) : 0.35}
                  />
                )
              })}
              {placed.map((n) => {
                const x = colX(n.level)
                const isSel = selected === n.id
                const isFocus = focus === n.id
                return (
                  <g
                    key={n.id}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSel}
                    aria-label={`${levelOf(n.level).title}: ${n.title}, ${n.tag}. Made of ${n.inputs.length}, feeds ${(feeds.get(n.id) ?? []).length}.`}
                    className="cursor-pointer outline-none"
                    opacity={lit(n.id) ? 1 : 0.3}
                    onMouseEnter={() => setHover(n.id)}
                    onFocus={() => setFocus(n.id)}
                    onBlur={() => setFocus(null)}
                    onClick={() => pick(n.id)}
                    onKeyDown={(e) => onKey(e, n.id)}
                  >
                    <title>{n.title}</title>
                    {(isSel || isFocus) && <rect x={x - 3} y={n.y - 3} width={NW + 6} height={NH + 6} rx={10} fill="none" strokeWidth={2} className="stroke-adm-accent" />}
                    <rect x={x} y={n.y} width={NW} height={NH} rx={8} className={`fill-adm-surface ${n.level === 1 ? 'stroke-adm-line' : 'stroke-adm-ink-2'}`} strokeWidth={active === n.id ? 2 : 1} />
                    {n.label && <circle cx={x + 13} cy={n.y + NH / 2} r={4} className={LABEL_FILL[n.label]} />}
                    {n.status && <circle cx={x + 13} cy={n.y + NH / 2} r={4} className={STATUS_FILL[n.status]} />}
                    <text x={x + (n.label || n.status ? 24 : 10)} y={n.y + 15} className={`fill-adm-ink text-12 ${n.level === 1 ? 'font-medium' : 'font-semibold'}`}>
                      {clip(n.title)}
                    </text>
                    <text x={x + (n.label || n.status ? 24 : 10)} y={n.y + 28} className="fill-adm-muted text-10">
                      {n.tag}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <aside aria-live="polite" className="flex min-w-0 flex-col gap-10 self-start rounded-8 border border-adm-line bg-adm-surface p-14 lg:sticky lg:bottom-12 lg:z-10 lg:shadow-lg 2xl:bottom-auto 2xl:top-16 2xl:shadow-none">
          {shown ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">{levelOf(shown.level).title}</span>
                <span className="text-14 font-semibold text-adm-ink">{shown.title}</span>
                <span className="text-11 text-adm-muted">
                  {shown.tag}
                  {shown.kind && ` · ${shown.kind}`}
                </span>
              </div>
              <p className="text-12 text-adm-ink-2">{shown.detail}</p>
              <NodeLink n={shown} />
              <NodeList title="Made of:" empty="Nothing: this is evidence, the bottom of the report." ids={shown.inputs} byId={byId} onPick={setSelected} />
              <NodeList title="Feeds:" empty="Nothing: this is where the report ends." ids={feeds.get(shown.id) ?? []} byId={byId} onPick={setSelected} />
            </>
          ) : (
            <>
              <span className="text-14 font-semibold text-adm-ink">Pick a box</span>
              <p className="text-12 text-adm-ink-2">Hover, focus or click any box to light up everything it is made of and everything it feeds. Click again or press Escape to let go.</p>
              <p className="text-12 text-adm-muted">
                {nodes.filter((n) => n.level === 1).length} sources → {nodes.filter((n) => n.level === 2).length} building blocks → {nodes.filter((n) => n.level === 3).length} stage readings → {nodes.filter((n) => n.level === 4).length} verdict and next moves.
              </p>
            </>
          )}
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-x-14 gap-y-6 text-11 text-adm-ink-2">
        {labelsUsed.map((l) => (
          <span key={l} className="inline-flex items-center gap-6" title={LABEL_MEANING[l]}>
            <svg width="8" height="8" aria-hidden="true">
              <circle cx="4" cy="4" r="4" className={LABEL_FILL[l]} />
            </svg>
            {LABEL_TEXT[l]}
          </span>
        ))}
        <span className="inline-flex items-center gap-6">
          <svg width="8" height="8" aria-hidden="true">
            <circle cx="4" cy="4" r="4" className="fill-adm-good" />
          </svg>
          Stage on track
        </span>
        <span className="inline-flex items-center gap-6">
          <svg width="8" height="8" aria-hidden="true">
            <circle cx="4" cy="4" r="4" className="fill-adm-critical" />
          </svg>
          Stage below target
        </span>
      </div>

      <CompositionText nodes={nodes} byId={byId} />
    </div>
  )
}

function NodeList({ title, empty, ids, byId, onPick }: { title: string; empty: string; ids: string[]; byId: Map<string, Placed>; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">{title}</span>
      {ids.length ? (
        <ul className="flex flex-wrap gap-4">
          {ids.map((id) => {
            const n = byId.get(id)!
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPick(id)}
                  className="rounded-full border border-adm-line px-8 py-2 text-11 font-medium text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-adm-accent"
                >
                  {n.title}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <span className="text-12 text-adm-muted">{empty}</span>
      )}
    </div>
  )
}

/** The graph written out: what each level is made of. Readable without the picture and by a screen reader. */
function CompositionText({ nodes, byId }: { nodes: CompNode[]; byId: Map<string, Placed> }) {
  const names = (ids: string[]) => ids.map((i) => byId.get(i)?.title ?? i).join(', ')
  const l1 = nodes.filter((n) => n.level === 1)
  return (
    <div className="flex flex-col gap-12 border-t border-adm-line pt-14">
      <h3 className="text-13 font-semibold text-adm-ink">The same, in words</h3>
      <div className="flex flex-col gap-4">
        <h4 className="text-12 font-semibold text-adm-ink">Level 1 is {l1.length} sources, by kind</h4>
        <ul className="flex list-disc flex-col gap-2 pl-18 text-12 text-adm-ink-2">
          {SOURCE_KINDS.filter((k) => l1.some((n) => n.kind === k)).map((k) => (
            <li key={k}>
              <span className="font-medium text-adm-ink">{k}:</span>{' '}
              {l1
                .filter((n) => n.kind === k)
                .map((n) => `${n.title} (${n.tag})`)
                .join(', ')}
            </li>
          ))}
        </ul>
      </div>
      {([2, 3, 4] as CompLevel[]).map((level) => (
        <div key={level} className="flex flex-col gap-4">
          <h4 className="text-12 font-semibold text-adm-ink">
            Level {level} is made of level {level - 1}
          </h4>
          <ul className="flex list-disc flex-col gap-2 pl-18 text-12 text-adm-ink-2">
            {nodes
              .filter((n) => n.level === level)
              .map((n) => (
                <li key={n.id}>
                  <span className="font-medium text-adm-ink">{n.title}</span> ({n.tag}) is made of {names(n.inputs)}.
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
