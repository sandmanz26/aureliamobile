import { Cable, Footprints, Maximize, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { forceLayout } from '../../data/forceLayout'
import { shapePath, type Look } from './akpStyle'

/*
 * The AKP relationship graph (U145, J206; an interactive map since U149,
 * J207): an SVG force-directed graph, laid out by data/forceLayout.ts (no
 * dependency). Nodes carry their family's colour *and* shape (akpStyle.ts),
 * links are styled by type (stroke weight and dash).
 *
 * - Zoom with the wheel, a pinch or the buttons; drag the background to pan;
 *   Fit brings every node back into view.
 * - "Follow the path" lights the StateFlip, then its goal AKPs, then the
 *   strategy AKPs that serve it, one tier at a time.
 * - Editable graphs: click a node to edit it in the drawer; drag from one node
 *   to another (or Connect, then click the two) to add a link of the chosen
 *   type; New AKP places a node. Every one of these has a keyboard way in the
 *   drawer, and nodes are focusable buttons.
 * Below lg the picture would be too small to read, so the same graph is a
 * list that opens the same drawer.
 */

export interface GraphNode {
  id: string
  label: string
  group: string
  look: Look
  goal?: boolean
  draft?: boolean
  edited?: boolean
  /** 0 the StateFlip, 1 goal AKPs, 2 strategy AKPs; worked out from the links when absent. */
  tier?: number
}

export interface GraphLink {
  from: string
  to: string
  type: string
}

export interface LinkStyle {
  label: string
  cls: string
  width: number
  dash?: string
}

export interface GraphEditing {
  linkTypes: [string, string][]
  onLink: (from: string, to: string, type: string) => void
  onNew?: () => void
}

const W = 960
const H = 560
const MIN_K = 0.4
const MAX_K = 4
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k))
const TIER_TEXT = ['The StateFlip: the change the person wants', 'Its goal AKPs: the steps X, Y and Z on the way', 'The strategy AKPs: the script, music, image and video pieces that move them']

/** A family's mark (colour and shape) at legend or list size. */
export function Mark({ look, size = 10 }: { look: Look; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <path d={shapePath(look.shape, 6, 6, 4.4)} className={look.fill} />
    </svg>
  )
}

type Pos = Map<string, { x: number; y: number }>

function layout(nodes: GraphNode[], links: GraphLink[], prev: Pos | null): Pos {
  const single = nodes.filter((n) => n.goal).length === 1
  return forceLayout(
    nodes.map((n) => {
      const p = prev?.get(n.id)
      return { id: n.id, pin: p ? ([p.x / W, p.y / H] as [number, number]) : n.goal && single ? ([0.5, 0.5] as [number, number]) : undefined }
    }),
    links,
    W,
    H,
    prev ? 160 : 320,
    56,
  )
}

function tiers(nodes: GraphNode[], links: GraphLink[]): Map<string, number> {
  const t = new Map<string, number>()
  for (const n of nodes) if (n.tier !== undefined) t.set(n.id, n.tier)
  if (t.size === nodes.length) return t
  const goals = nodes.filter((n) => n.goal).map((n) => n.id)
  for (const g of goals) t.set(g, 0)
  for (const l of links) if (goals.includes(l.to) && !t.has(l.from)) t.set(l.from, 1)
  for (const n of nodes) if (!t.has(n.id)) t.set(n.id, 2)
  return t
}

export function AkpGraph({ nodes, links, linkStyles, legend, onOpen, aria, editing }: {
  nodes: GraphNode[]
  links: GraphLink[]
  linkStyles: Record<string, LinkStyle>
  legend: { label: string; look: Look }[]
  onOpen: (id: string) => void
  aria: string
  editing?: GraphEditing
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [path, setPath] = useState<number | null>(null)
  const [connect, setConnect] = useState<{ from: string | null } | null>(null)
  const [newType, setNewType] = useState(editing?.linkTypes[0]?.[0] ?? 'supports')
  const [drag, setDrag] = useState<{ from: string; x: number; y: number; over: string | null } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const viewRef = useRef(view)
  const gesture = useRef<{
    pointers: Map<number, { x: number; y: number }>
    pan?: { sx: number; sy: number; vx: number; vy: number }
    pinch?: { d: number; k: number; mx: number; my: number; vx: number; vy: number }
    node?: { id: string; cx: number; cy: number; moved: boolean }
  }>({ pointers: new Map() })
  useEffect(() => {
    viewRef.current = view
  })

  // Positions persist across edits: known nodes keep their place, new ones settle around them.
  const key = `${nodes.map((n) => n.id).join('|')}#${links.map((l) => `${l.from}>${l.to}`).join('|')}`
  const [laid, setLaid] = useState(() => ({ key, pos: layout(nodes, links, null) }))
  if (laid.key !== key) setLaid({ key, pos: layout(nodes, links, laid.pos) })
  const pos = laid.pos

  const tier = useMemo(() => tiers(nodes, links), [nodes, links])
  const near = useMemo(() => {
    if (path !== null) return new Set(nodes.filter((n) => (tier.get(n.id) ?? 2) <= path).map((n) => n.id))
    const focus = drag?.from ?? connect?.from ?? hover
    if (!focus) return null
    const s = new Set([focus])
    for (const l of links) {
      if (l.from === focus) s.add(l.to)
      if (l.to === focus) s.add(l.from)
    }
    return s
  }, [hover, links, path, tier, nodes, drag, connect])
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const usedTypes = [...new Set(links.map((l) => l.type))]
  const degree = (id: string) => links.filter((l) => l.from === id || l.to === id).length

  /** Client point → viewBox point (before the zoom transform). */
  const toBox = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return { x: 0, y: 0 }
    const p = new DOMPoint(cx, cy).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }, [])
  const toWorld = (cx: number, cy: number) => {
    const b = toBox(cx, cy)
    const v = viewRef.current
    return { x: (b.x - v.x) / v.k, y: (b.y - v.y) / v.k }
  }

  const zoomAt = useCallback((factor: number, bx = W / 2, by = H / 2) => {
    setView((v) => {
      const k = clampK(v.k * factor)
      return { k, x: bx - ((bx - v.x) * k) / v.k, y: by - ((by - v.y) * k) / v.k }
    })
  }, [])
  const fit = useCallback(() => {
    const ps = nodes.map((n) => pos.get(n.id)).filter((p): p is { x: number; y: number } => !!p)
    if (!ps.length) return setView({ x: 0, y: 0, k: 1 })
    const [x0, x1] = [Math.min(...ps.map((p) => p.x)) - 60, Math.max(...ps.map((p) => p.x)) + 140]
    const [y0, y1] = [Math.min(...ps.map((p) => p.y)) - 40, Math.max(...ps.map((p) => p.y)) + 40]
    const k = clampK(Math.min(W / (x1 - x0), H / (y1 - y0), 1.6))
    setView({ k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k })
  }, [nodes, pos])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const b = toBox(e.clientX, e.clientY)
      zoomAt(Math.exp(-e.deltaY * 0.0015), b.x, b.y)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [toBox, zoomAt])

  const clickNode = (id: string) => {
    if (connect && editing) {
      if (!connect.from) return setConnect({ from: id })
      if (connect.from !== id) editing.onLink(connect.from, id, newType)
      return setConnect(null)
    }
    onOpen(id)
  }

  const nodeAt = (cx: number, cy: number) => (document.elementFromPoint(cx, cy)?.closest('[data-node-id]') as SVGElement | null)?.dataset.nodeId ?? null

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current
    svgRef.current?.setPointerCapture(e.pointerId)
    const b = toBox(e.clientX, e.clientY)
    g.pointers.set(e.pointerId, b)
    const id = (e.target as Element).closest('[data-node-id]')?.getAttribute('data-node-id')
    if (g.pointers.size === 2) {
      const [p, q] = [...g.pointers.values()]
      const v = viewRef.current
      g.node = undefined
      g.pan = undefined
      setDrag(null)
      g.pinch = { d: Math.max(1, Math.hypot(p.x - q.x, p.y - q.y)), k: v.k, mx: (p.x + q.x) / 2, my: (p.y + q.y) / 2, vx: v.x, vy: v.y }
    } else if (id) {
      g.node = { id, cx: e.clientX, cy: e.clientY, moved: false }
    } else {
      const v = viewRef.current
      g.pan = { sx: b.x, sy: b.y, vx: v.x, vy: v.y }
    }
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current
    if (!g.pointers.has(e.pointerId)) return
    const b = toBox(e.clientX, e.clientY)
    g.pointers.set(e.pointerId, b)
    if (g.pinch && g.pointers.size >= 2) {
      const [p, q] = [...g.pointers.values()]
      const pi = g.pinch
      const k = clampK((pi.k * Math.hypot(p.x - q.x, p.y - q.y)) / pi.d)
      setView({ k, x: pi.mx - ((pi.mx - pi.vx) * k) / pi.k, y: pi.my - ((pi.my - pi.vy) * k) / pi.k })
    } else if (g.node) {
      if (!g.node.moved && Math.hypot(e.clientX - g.node.cx, e.clientY - g.node.cy) > 5) g.node.moved = true
      if (g.node.moved && editing) {
        const w = toWorld(e.clientX, e.clientY)
        const over = nodeAt(e.clientX, e.clientY)
        setDrag({ from: g.node.id, x: w.x, y: w.y, over: over !== g.node.id ? over : null })
      }
    } else if (g.pan) {
      setView((v) => ({ ...v, x: g.pan!.vx + b.x - g.pan!.sx, y: g.pan!.vy + b.y - g.pan!.sy }))
    }
  }
  const onUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current
    g.pointers.delete(e.pointerId)
    if (g.node) {
      const n = g.node
      if (!n.moved) clickNode(n.id)
      else if (editing) {
        const target = nodeAt(e.clientX, e.clientY)
        if (target && target !== n.id) editing.onLink(n.id, target, newType)
      }
    }
    g.node = undefined
    g.pan = undefined
    if (g.pointers.size < 2) g.pinch = undefined
    setDrag(null)
  }

  const btn = 'inline-flex items-center gap-4 rounded-8 border border-adm-line px-8 py-4 text-11 font-medium text-adm-ink hover:bg-adm-hover'
  const on = 'border-adm-ink bg-adm-ink text-adm-surface hover:bg-adm-ink'
  const dragFrom = drag ? pos.get(drag.from) : undefined

  return (
    <div className="flex min-w-0 flex-col gap-10" data-akp-graph>
      <div className="flex flex-wrap items-center gap-x-16 gap-y-6 text-11 text-adm-ink-2" aria-label="Legend">
        {legend.map((g) => (
          <span key={g.label} className="inline-flex items-center gap-4">
            <Mark look={g.look} size={12} />
            {g.label}
          </span>
        ))}
        <span className="h-12 w-px bg-adm-line" aria-hidden="true" />
        {usedTypes.map((t) => {
          const s = linkStyles[t] ?? linkStyles.supports
          return (
            <span key={t} className="inline-flex items-center gap-4">
              <svg width="28" height="8" aria-hidden="true">
                <line x1="1" x2="27" y1="4" y2="4" className={s.cls} strokeWidth={s.width} strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </span>
          )
        })}
        <span className="inline-flex items-center gap-4">
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" className="fill-none stroke-adm-muted" strokeWidth={1.25} strokeDasharray="2 2" />
          </svg>
          Drafted
        </span>
        {editing && (
          <span className="inline-flex items-center gap-4">
            <svg width="14" height="14" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" className="fill-none stroke-adm-accent" strokeWidth={2} />
            </svg>
            Edited
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6" role="toolbar" aria-label="Graph tools" data-graph-tools>
        <span className="hidden items-center gap-6 lg:inline-flex">
          <button type="button" className={btn} onClick={() => zoomAt(1 / 1.25)} aria-label="Zoom out">
            <Minus size={12} aria-hidden="true" />
          </button>
          <span className="w-36 text-center text-11 tabular-nums text-adm-muted" aria-live="polite">
            {Math.round(view.k * 100)}%
          </span>
          <button type="button" className={btn} onClick={() => zoomAt(1.25)} aria-label="Zoom in">
            <Plus size={12} aria-hidden="true" />
          </button>
          <button type="button" className={btn} onClick={fit} data-fit>
            <Maximize size={12} aria-hidden="true" /> Fit
          </button>
          <span className="h-16 w-px bg-adm-line" aria-hidden="true" />
          <button type="button" aria-pressed={path !== null} className={`${btn} ${path !== null ? on : ''}`} onClick={() => setPath(path === null ? 0 : null)} data-follow-path>
            <Footprints size={12} aria-hidden="true" /> Follow the path
          </button>
        </span>
        {editing && (
          <>
            <span className="hidden h-16 w-px bg-adm-line lg:inline" aria-hidden="true" />
            <label className="hidden items-center gap-4 text-11 text-adm-muted lg:inline-flex">
              New links:
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="rounded-8 border border-adm-line bg-adm-surface px-6 py-4 text-11 text-adm-ink" data-new-link-type>
                {editing.linkTypes.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" aria-pressed={!!connect} className={`${btn} hidden lg:inline-flex ${connect ? on : ''}`} onClick={() => setConnect(connect ? null : { from: null })} data-connect>
              <Cable size={12} aria-hidden="true" /> Connect
            </button>
            {editing.onNew && (
              <button type="button" className={btn} onClick={editing.onNew} data-graph-new>
                <Plus size={12} aria-hidden="true" /> New AKP here
              </button>
            )}
          </>
        )}
      </div>

      {path !== null && (
        <div className="hidden flex-wrap items-center gap-6 rounded-8 border border-adm-line bg-adm-bg p-8 text-12 text-adm-ink-2 lg:flex" data-path-steps>
          {[0, 1, 2].map((t) => (
            <button key={t} type="button" aria-pressed={path === t} onClick={() => setPath(t)} className={`${btn} ${path === t ? on : ''}`}>
              {t + 1}. {['StateFlip', 'Goal AKPs', 'Strategy AKPs'][t]}
            </button>
          ))}
          <span aria-live="polite">{TIER_TEXT[path]}.</span>
          {path < 2 && (
            <button type="button" className={btn} onClick={() => setPath(path + 1)}>
              Next →
            </button>
          )}
        </div>
      )}

      <p className="text-11 text-adm-muted" aria-live="polite">
        {nodes.filter((n) => !n.goal).length} AKPs around the goal · {links.length} links
        {editing && <span className="hidden lg:inline">{connect ? (connect.from ? ` · now click the node to link ${connect.from} to (as “${newType}”)` : ' · click the node the link starts from') : ' · click a node to edit it; drag from one node to another to link them; wheel or pinch to zoom, drag the background to pan'}</span>}
      </p>

      <div className="hidden min-w-0 overflow-hidden rounded-12 border border-adm-line bg-adm-bg lg:block">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`block h-auto w-full touch-none select-none ${drag ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
          role="group"
          aria-label={aria}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-graph-svg
        >
          <defs>
            <marker id="akp-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className="fill-adm-muted" />
            </marker>
          </defs>
          <rect width={W} height={H} className="fill-transparent" />
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} data-graph-view>
            {links.map((l, i) => {
              const a = pos.get(l.from)
              const b = pos.get(l.to)
              if (!a || !b) return null
              const s = linkStyles[l.type] ?? linkStyles.supports
              const r = byId.get(l.to)?.goal ? 20 : 12
              const d = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))
              const lit = !near || (near.has(l.from) && near.has(l.to))
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x - ((b.x - a.x) / d) * r} y2={b.y - ((b.y - a.y) / d) * r} className={s.cls} strokeWidth={s.width} strokeDasharray={s.dash} markerEnd="url(#akp-arrow)" opacity={lit ? 0.9 : 0.1}>
                  <title>{`${byId.get(l.from)?.label} ${s.label.toLowerCase()} ${byId.get(l.to)?.label}`}</title>
                </line>
              )
            })}
            {drag && dragFrom && <line x1={dragFrom.x} y1={dragFrom.y} x2={drag.x} y2={drag.y} className="stroke-adm-accent" strokeWidth={2} strokeDasharray="4 3" markerEnd="url(#akp-arrow)" data-drag-line />}
            {nodes.map((n) => {
              const p = pos.get(n.id)
              if (!p) return null
              const lit = !near || near.has(n.id)
              const r = n.goal ? 18 : 9
              const right = p.x >= W / 2 ? p.x < W - 170 : p.x < 200
              const picked = connect?.from === n.id || drag?.over === n.id
              const current = path !== null && tier.get(n.id) === path
              return (
                <g
                  key={n.id}
                  data-node-id={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.id} ${n.label}, ${n.group}, ${degree(n.id)} links${n.edited ? ', edited' : ''}`}
                  className="cursor-pointer outline-none [&:focus-visible>.ring]:stroke-adm-ink"
                  opacity={lit ? 1 : 0.2}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      clickNode(n.id)
                    }
                  }}
                >
                  <title>{`${n.id} · ${n.label} (${n.group})${n.draft ? ' · drafted' : ''}${n.edited ? ' · edited' : ''}`}</title>
                  <circle cx={p.x} cy={p.y} r={r + 8} className="ring fill-transparent stroke-transparent" strokeWidth={2} />
                  {n.draft && <circle cx={p.x} cy={p.y} r={r + 4} className="fill-none stroke-adm-muted" strokeWidth={1.25} strokeDasharray="2 2" />}
                  {(n.edited || picked) && <circle cx={p.x} cy={p.y} r={r + 5} className="fill-none stroke-adm-accent" strokeWidth={picked ? 3 : 2} />}
                  <path d={shapePath(n.goal ? 'circle' : n.look.shape, p.x, p.y, r)} className={`${n.goal ? 'fill-adm-ink' : n.look.fill} stroke-adm-surface`} strokeWidth={2} />
                  <text x={n.goal ? p.x : right ? p.x + r + 6 : p.x - r - 6} y={n.goal ? p.y + r + 16 : p.y + 4} textAnchor={n.goal ? 'middle' : right ? 'start' : 'end'} className={`pointer-events-none fill-adm-ink text-11 ${n.goal || hover === n.id || current ? 'font-semibold' : ''}`} paintOrder="stroke" stroke="var(--color-adm-bg)" strokeWidth={3}>
                    {n.goal || n.label.length <= 26 ? n.label : `${n.label.slice(0, 25)}…`}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <ul className="flex flex-col gap-6 lg:hidden" data-akp-graph-list>
        {nodes.map((n) => {
          const out = links.filter((l) => l.from === n.id)
          return (
            <li key={n.id} className="rounded-8 border border-adm-line">
              <button type="button" onClick={() => onOpen(n.id)} className="flex w-full min-w-0 flex-col gap-4 p-10 text-left">
                <span className="inline-flex min-w-0 items-center gap-6 text-12 font-semibold text-adm-ink">
                  <Mark look={n.goal ? { ...n.look, fill: 'fill-adm-ink', shape: 'circle' } : n.look} size={12} />
                  <span className="min-w-0 truncate">{n.label}</span>
                </span>
                <span className="text-11 text-adm-muted">
                  {n.id} · {n.group}
                  {n.draft ? ' · drafted' : ''}
                  {n.edited ? ' · edited' : ''}
                </span>
                {out.length > 0 && <span className="text-11 text-adm-ink-2">{out.map((l) => `${(linkStyles[l.type] ?? linkStyles.supports).label.toLowerCase()} ${byId.get(l.to)?.label ?? l.to}`).join(' · ')}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
