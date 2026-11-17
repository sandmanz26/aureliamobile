import { describe, expect, it } from 'vitest'
import handoff from '../../docs/HANDOFF.md?raw'
import journal from '../../docs/WORK-JOURNAL.md?raw'
import updateLog from '../../docs/UPDATE-LOG.md?raw'

// Owner, 17 Nov 2026 (J109): every request and every change must also be in
// HANDOFF.md, so nothing is lost. Its §17 copies the index rows of the
// journal and the update log; this fails the check when one is missing.
const ids = (text: string, prefix: 'J' | 'U') =>
  [...text.matchAll(new RegExp(`^\\| (${prefix}\\d{3}) \\|`, 'gm'))].map((m) => m[1])

describe('HANDOFF.md ledger', () => {
  const ledger = new Set([...ids(handoff, 'J'), ...ids(handoff, 'U')])

  it('lists every request in the work journal', () => {
    const journalIds = ids(journal, 'J')
    expect(journalIds.length).toBeGreaterThan(100)
    expect(journalIds.filter((id) => !ledger.has(id))).toEqual([])
  })

  it('lists every code change in the update log', () => {
    const updateIds = ids(updateLog, 'U')
    expect(updateIds.length).toBeGreaterThan(80)
    expect(updateIds.filter((id) => !ledger.has(id))).toEqual([])
  })
})
