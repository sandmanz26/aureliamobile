import { describe, expect, it } from 'vitest'
import { forceLayout } from './forceLayout'

describe('forceLayout (U145)', () => {
  const nodes = [{ id: 'g', pin: [0.5, 0.5] as [number, number] }, ...Array.from({ length: 12 }, (_, i) => ({ id: `n${i}` }))]
  const links = nodes.slice(1).map((n) => ({ from: n.id, to: 'g' }))
  const a = forceLayout(nodes, links, 800, 500)

  it('is deterministic, keeps pins and stays inside the box', () => {
    const b = forceLayout(nodes, links, 800, 500)
    expect([...a.entries()]).toEqual([...b.entries()])
    expect(a.get('g')).toEqual({ x: 400, y: 250 })
    for (const p of a.values()) {
      expect(p.x).toBeGreaterThanOrEqual(40)
      expect(p.x).toBeLessThanOrEqual(760)
      expect(p.y).toBeGreaterThanOrEqual(40)
      expect(p.y).toBeLessThanOrEqual(460)
    }
  })

  it('keeps nodes apart', () => {
    const ps = [...a.values()]
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) expect(Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y)).toBeGreaterThan(20)
  })
})
