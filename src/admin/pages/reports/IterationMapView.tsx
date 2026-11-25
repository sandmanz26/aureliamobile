import { useMemo, useState, type KeyboardEvent } from 'react'
import { COLUMN_TITLE, type IterationMap, type MapColumn, type MapNode } from '../../data/iterationMap'
import { useDetail } from './DetailDrawer'
import { nodeItem } from './detailItems'

/*
 * The iteration map (U129, J182): sources → reports and tests → decisions
 * and versions. Hover or focus a box to light its whole path; click it (or
 * Enter) to open its summary in the drawer. Under the picture the same map
 * is written out as a list, which is also how it reads on a phone.
 */

const W = 1040
const NW = 250
const NH = 38
const ROW = 46
const PAD = 10
const COLS: MapColumn[] = ['source', 'report', 'outcome']
const ARC = 40
/** Room on the right for the arcs from a decision down to the version it shipped in. */
const GAP = (W - 8 - ARC - 3 * NW) / 2
const colX = (c: MapColumn) => 8 + COLS.indexOf(c) * (NW + GAP)

const FILL: Record<MapColumn, string> = { source: 'fill-adm-s1', report: 'fill-adm-s2', outcome: 'fill-adm-good' }

function clip(s: string, n = 34) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s
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

export function IterationMapView({ map, label }: { map: IterationMap; label: string }) {
  const open = useDetail()
  const [active, setActive] = useState<string | null>(null)
  const { nodes, edges } = map

  const rows = Math.max(1, ...COLS.map((c) => nodes.filter((n) => n.column === c).length))
  const H = rows * ROW + PAD * 2
  const pos = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of COLS) {
      const ns = nodes.filter((n) => n.column === c)
      const step = Math.min((H - 2 * PAD) / Math.max(ns.length, 1), ROW * 1.6)
      const top = (H - step * ns.length) / 2
      ns.forEach((n, i) => m.set(n.id, top + i * step + (step - NH) / 2))
    }
    return m
  }, [nodes, H])

  const path = useMemo(() => {
    if (!active) return null
    const up = closure(active, (id) => edges.filter((e) => e.to === id).map((e) => e.from))
    const down = closure(active, (id) => edges.filter((e) => e.from === id).map((e) => e.to))
    return new Set([active, ...up, ...down])
  }, [active, edges])
  const lit = (id: string) => !path || path.has(id)
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const onKey = (e: KeyboardEvent, n: MapNode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open(nodeItem(n))
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-12">
      <div className="min-w-0 overflow-x-auto rounded-8 border border-adm-line bg-adm-bg" data-iteration-map>
        <div style={{ width: W }} className="flex flex-col">
          <div className="grid border-b border-adm-line py-10" style={{ gridTemplateColumns: `${NW}px 1fr ${NW}px 1fr ${NW}px`, paddingLeft: 8, paddingRight: ARC }}>
            {COLS.map((c, i) => [
              <div key={c} className="flex flex-col gap-2">
                <span className="text-12 font-semibold text-adm-ink">{COLUMN_TITLE[c]}</span>
                <span className="text-11 text-adm-muted">
                  {nodes.filter((n) => n.column === c).length || 'Nothing yet'}
                  {nodes.some((n) => n.column === c) ? (c === 'source' ? ' kinds of source' : c === 'report' ? ' reports and tests' : ' decisions and versions') : ''}
                </span>
              </div>,
              i < 2 ? <span key={`${c}-gap`} aria-hidden="true" className="self-center text-center text-14 text-adm-muted">→</span> : null,
            ])}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="group" aria-label={label} className="block max-w-none" onMouseLeave={() => setActive(null)}>
            {edges.map((e) => {
              const a = byId.get(e.from)
              const b = byId.get(e.to)
              if (!a || !b) return null
              const x1 = colX(a.column) + NW
              const y1 = (pos.get(a.id) ?? 0) + NH / 2
              const y2 = (pos.get(b.id) ?? 0) + NH / 2
              // Same column (decision → version): an arc out to the right and back.
              const same = a.column === b.column
              const x2 = same ? x1 : colX(b.column)
              const mid = same ? x1 + ARC - 4 : (x1 + x2) / 2
              const on = !!path && path.has(e.from) && path.has(e.to)
              return (
                <path
                  key={`${e.from}>${e.to}`}
                  d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  strokeWidth={on ? 2 : 1.25}
                  className="stroke-adm-ink-2 transition-opacity"
                  opacity={path ? (on ? 0.85 : 0.05) : 0.3}
                >
                  <title>{e.why}</title>
                </path>
              )
            })}
            {nodes.map((n) => {
              const x = colX(n.column)
              const y = pos.get(n.id) ?? 0
              return (
                <g
                  key={n.id}
                  tabIndex={0}
                  role="button"
                  data-node={n.id}
                  aria-label={`${COLUMN_TITLE[n.column]}: ${n.title}, ${n.tag}. Open details`}
                  className="cursor-pointer outline-none [&:focus-visible>rect:first-of-type]:stroke-adm-accent"
                  opacity={lit(n.id) ? 1 : 0.3}
                  onMouseEnter={() => setActive(n.id)}
                  onFocus={() => setActive(n.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => open(nodeItem(n))}
                  onKeyDown={(e) => onKey(e, n)}
                >
                  <title>{n.title}</title>
                  <rect x={x} y={y} width={NW} height={NH} rx={8} strokeWidth={active === n.id ? 2 : 1} className={`fill-adm-surface ${n.column === 'report' ? 'stroke-adm-ink-2' : 'stroke-adm-line'}`} />
                  <circle cx={x + 13} cy={y + NH / 2} r={4} className={FILL[n.column]} />
                  <text x={x + 24} y={y + 16} className="fill-adm-ink text-12 font-semibold">
                    {clip(n.title, 31)}
                  </text>
                  <text x={x + 24} y={y + 30} className="fill-adm-muted text-10">
                    {clip(n.tag, 40)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <MapInWords map={map} />
    </div>
  )
}

/** The map written out: each report, what it reads and what it led to. Readable without the picture, and on a phone. */
function MapInWords({ map }: { map: IterationMap }) {
  const open = useDetail()
  const byId = new Map(map.nodes.map((n) => [n.id, n]))
  const chip = (n: MapNode) => (
    <button
      key={n.id}
      type="button"
      onClick={() => open(nodeItem(n))}
      className="max-w-full rounded-full border border-adm-line px-8 py-2 text-left text-11 font-medium text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink"
    >
      {n.title}
    </button>
  )
  return (
    <details className="group rounded-8 border border-adm-line">
      <summary className="cursor-pointer list-none p-10 text-12 font-semibold text-adm-ink hover:bg-adm-hover [&::-webkit-details-marker]:hidden">The same map, in words</summary>
      <ul className="flex flex-col divide-y divide-adm-line border-t border-adm-line">
        {map.nodes
          .filter((n) => n.column === 'report')
          .map((n) => {
            const from = map.edges.filter((e) => e.to === n.id).map((e) => byId.get(e.from)!)
            const to = map.edges.filter((e) => e.from === n.id).map((e) => byId.get(e.to)!)
            return (
              <li key={n.id} className="flex flex-col gap-6 p-10">
                <div>{chip(n)}</div>
                <div className="flex flex-wrap items-center gap-4 text-11 text-adm-muted">
                  <span>Learns from:</span>
                  {from.length ? from.map(chip) : <span>nothing recorded</span>}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-11 text-adm-muted">
                  <span>Led to:</span>
                  {to.length ? to.map(chip) : <span>no decision yet</span>}
                </div>
              </li>
            )
          })}
      </ul>
    </details>
  )
}
