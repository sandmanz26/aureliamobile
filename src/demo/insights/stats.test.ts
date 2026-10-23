import { describe, expect, it } from 'vitest'
import type { ClickEvent } from '../../api/clicks'
import { countBy, elementStats, heatmapUrl } from './stats'

const base = { sid: 's1', page: '/home', ui: 2, vw: 402, vh: 874, t: '2026-10-22T10:00:00.000Z' }
const tap = (over: Partial<ClickEvent>): ClickEvent => ({ ...base, type: 'click', label: 'Join', sel: '#join', kind: 'button', section: 'Page', ...over })

describe('insights stats', () => {
  it('counts and sorts by frequency', () => {
    expect(countBy(['a', 'b', 'a'], (x) => x)).toEqual([['a', 2], ['b', 1]])
  })

  it('groups taps per element with their outcomes', () => {
    const events: ClickEvent[] = [
      { ...base, type: 'view' },
      tap({ fx: 'navigated', to: '/chat' }),
      tap({ fx: 'nothing', sid: 's2' }),
      tap({ fx: 'nothing', rage: true }),
    ]
    const [join] = elementStats(events)
    expect(join.taps).toHaveLength(3)
    expect(join.nothing).toBe(2)
    expect(join.rage).toBe(1)
    expect(join.sessions).toBe(2)
  })

  it('builds a heatmap link that survives odd selectors', () => {
    expect(heatmapUrl('/home', 'a[href="/x"]')).toContain(encodeURIComponent('a[href="/x"]'))
  })
})
