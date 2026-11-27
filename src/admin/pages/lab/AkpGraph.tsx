import { useMemo, useState } from 'react'
import { forceLayout } from '../../data/forceLayout'

/*
 * The AKP relationship graph (U145, J206): an SVG force-directed graph, laid
 * out by data/forceLayout.ts (no dependency). Nodes are coloured by group
 * (family or modality, from the admin series tokens), links styled by type
 * (stroke weight and dash, so colour stays for the nodes). Hover or focus a
 * node to light up its neighbours; click to open its drawer. Below lg the
 * picture would be too small to read, so the same graph is shown as a list.
 */

export interface GraphNode {
  id: string
  label: string
  group: string
  fill: string
  dot: string
  goal?: boolean
  draft?: boolean
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

const W = 960
const H = 560

export function AkpGraph({ nodes, links, linkStyles, legend, onOpen, aria }: {
  nodes: GraphNode[]
  links: GraphLink[]
  linkStyles: Record<string, LinkStyle>
  legend: { label: string; dot: string }[]
  onOpen: (id: string) => void
  aria: string
}) {
  const [hover, setHover] = useState<string | null>(null)
  const pos = useMemo(
    () => forceLayout(nodes.map((n) => ({ id: n.id, pin: n.goal && nodes.filter((x) => x.goal).length === 1 ? ([0.5, 0.5] as [number, number]) : undefined })), links, W, H, 320, 56),
    [nodes, links],
  )
  const near = useMemo(() => {
    if (!hover) return null
    const s = new Set([hover])
    for (const l of links) {
      if (l.from === hover) s.add(l.to)
      if (l.to === hover) s.add(l.from)
    }
    return s
  }, [hover, links])
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const usedTypes = [...new Set(links.map((l) => l.type))]
  const degree = (id: string) => links.filter((l) => l.from === id || l.to === id).length

  return (
    <div className="flex min-w-0 flex-col gap-10" data-akp-graph>
      <div className="flex flex-wrap items-center gap-x-16 gap-y-6 text-11 text-adm-ink-2" aria-label="Legend">
        {legend.map((g) => (
          <span key={g.label} className="inline-flex items-center gap-4">
            <span className={`size-10 rounded-full ${g.dot}`} aria-hidden="true" />
            {g.label}
          </span>
        ))}
        <span className="h-12 w-px bg-adm-line" aria-hidden="true" />
        {usedTypes.map((t) => {
          const s = linkStyles[t]
          return (
            <span key={t} className="inline-flex items-center gap-4">
              <svg width="28" height="8" aria-hidden="true">
                <line x1="1" x2="27" y1="4" y2="4" className={s.cls} strokeWidth={s.width} strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </span>
          )
        })}
      </div>
      <p className="text-11 text-adm-muted" aria-live="polite">
        {nodes.filter((n) => !n.goal).length} AKPs around the goal · {links.length} links
      </p>

      <div className="hidden min-w-0 rounded-12 border border-adm-line bg-adm-bg lg:block">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={aria}>
          <defs>
            <marker id="akp-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className="fill-adm-muted" />
            </marker>
          </defs>
          {links.map((l, i) => {
            const a = pos.get(l.from)
            const b = pos.get(l.to)
            if (!a || !b) return null
            const s = linkStyles[l.type]
            const r = byId.get(l.to)?.goal ? 20 : 11
            const d = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))
            const lit = !near || (near.has(l.from) && near.has(l.to))
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x - ((b.x - a.x) / d) * r}
                y2={b.y - ((b.y - a.y) / d) * r}
                className={s.cls}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                markerEnd="url(#akp-arrow)"
                opacity={lit ? 0.9 : 0.12}
              >
                <title>{`${byId.get(l.from)?.label} ${s.label.toLowerCase()} ${byId.get(l.to)?.label}`}</title>
              </line>
            )
          })}
          {nodes.map((n) => {
            const p = pos.get(n.id)!
            const lit = !near || near.has(n.id)
            const r = n.goal ? 18 : 9
            const right = p.x >= W / 2 ? p.x < W - 170 : p.x < 200
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${n.id} ${n.label}, ${n.group}, ${degree(n.id)} links`}
                className="cursor-pointer outline-none"
                opacity={lit ? 1 : 0.25}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.id)}
                onBlur={() => setHover(null)}
                onClick={() => onOpen(n.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(n.id)}
              >
                <title>{`${n.id} · ${n.label} (${n.group})${n.draft ? ' · drafted' : ''}`}</title>
                <circle cx={p.x} cy={p.y} r={r + 6} className="fill-transparent" />
                {n.draft && <circle cx={p.x} cy={p.y} r={r + 4} className="fill-none stroke-adm-muted" strokeWidth={1.25} strokeDasharray="2 2" />}
                <circle cx={p.x} cy={p.y} r={r} className={`${n.goal ? 'fill-adm-ink' : n.fill} stroke-adm-surface`} strokeWidth={2} />
                <text x={n.goal ? p.x : right ? p.x + r + 5 : p.x - r - 5} y={n.goal ? p.y + r + 16 : p.y + 4} textAnchor={n.goal ? 'middle' : right ? 'start' : 'end'} className={`fill-adm-ink text-11 ${n.goal || hover === n.id ? 'font-semibold' : ''}`} paintOrder="stroke" stroke="var(--color-adm-bg)" strokeWidth={3}>
                  {n.goal || n.label.length <= 26 ? n.label : `${n.label.slice(0, 25)}…`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <ul className="flex flex-col gap-6 lg:hidden" data-akp-graph-list>
        {nodes.map((n) => {
          const out = links.filter((l) => l.from === n.id)
          return (
            <li key={n.id} className="rounded-8 border border-adm-line">
              <button type="button" onClick={() => onOpen(n.id)} className="flex w-full min-w-0 flex-col gap-4 p-10 text-left">
                <span className="inline-flex min-w-0 items-center gap-6 text-12 font-semibold text-adm-ink">
                  <span className={`size-10 shrink-0 rounded-full ${n.goal ? 'bg-adm-ink' : n.dot}`} aria-hidden="true" />
                  <span className="min-w-0 truncate">{n.label}</span>
                </span>
                <span className="text-11 text-adm-muted">
                  {n.id} · {n.group}
                  {n.draft ? ' · drafted' : ''}
                </span>
                {out.length > 0 && (
                  <span className="text-11 text-adm-ink-2">
                    {out.map((l) => `${linkStyles[l.type].label.toLowerCase()} ${byId.get(l.to)?.label ?? l.to}`).join(' · ')}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
