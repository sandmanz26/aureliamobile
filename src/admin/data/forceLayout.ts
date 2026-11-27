/**
 * A small force-directed layout (U145): Fruchterman–Reingold with gravity
 * and cooling, deterministic (nodes start evenly on a circle in input order),
 * no dependency. Used by the AKP relationship graph; a few dozen nodes lay
 * out in well under a frame's worth of work per hundred iterations.
 */

export interface LayoutNode {
  id: string
  /** Pinned position (0–1 of width and height), e.g. the focus node at the centre. */
  pin?: [number, number]
}

export interface LayoutLink {
  from: string
  to: string
}

export function forceLayout(nodes: readonly LayoutNode[], links: readonly LayoutLink[], w: number, h: number, iterations = 300, pad = 40): Map<string, { x: number; y: number }> {
  const n = nodes.length
  const pos = nodes.map((nd, i) => {
    if (nd.pin) return { x: nd.pin[0] * w, y: nd.pin[1] * h }
    const t = (i / Math.max(1, n)) * Math.PI * 2
    return { x: w / 2 + Math.cos(t) * w * 0.3, y: h / 2 + Math.sin(t) * h * 0.3 }
  })
  const index = new Map(nodes.map((nd, i) => [nd.id, i]))
  const edges = links.map((l) => [index.get(l.from), index.get(l.to)]).filter((e): e is [number, number] => e[0] !== undefined && e[1] !== undefined && e[0] !== e[1])
  const k = Math.sqrt(((w - 2 * pad) * (h - 2 * pad)) / Math.max(1, n)) * 0.85
  let temp = w / 8
  for (let it = 0; it < iterations; it++) {
    const disp = pos.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        let dx = pos[i].x - pos[j].x
        let dy = pos[i].y - pos[j].y
        let d = Math.hypot(dx, dy)
        if (d < 0.01) {
          dx = 0.01 * (i - j)
          dy = 0.01
          d = Math.hypot(dx, dy)
        }
        const f = (k * k) / d
        disp[i].x += (dx / d) * f
        disp[i].y += (dy / d) * f
        disp[j].x -= (dx / d) * f
        disp[j].y -= (dy / d) * f
      }
    for (const [a, b] of edges) {
      const dx = pos[a].x - pos[b].x
      const dy = pos[a].y - pos[b].y
      const d = Math.max(0.01, Math.hypot(dx, dy))
      const f = (d * d) / k
      disp[a].x -= (dx / d) * f
      disp[a].y -= (dy / d) * f
      disp[b].x += (dx / d) * f
      disp[b].y += (dy / d) * f
    }
    for (let i = 0; i < n; i++) {
      if (nodes[i].pin) continue
      disp[i].x += (w / 2 - pos[i].x) * 0.02 * k
      disp[i].y += (h / 2 - pos[i].y) * 0.02 * k
      const d = Math.max(0.01, Math.hypot(disp[i].x, disp[i].y))
      pos[i].x = Math.min(w - pad, Math.max(pad, pos[i].x + (disp[i].x / d) * Math.min(d, temp)))
      pos[i].y = Math.min(h - pad, Math.max(pad, pos[i].y + (disp[i].y / d) * Math.min(d, temp)))
    }
    temp = Math.max(0.5, temp * 0.985)
  }
  return new Map(nodes.map((nd, i) => [nd.id, pos[i]]))
}
