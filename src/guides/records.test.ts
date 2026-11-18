import { describe, expect, it } from 'vitest'
import handoff from '../../docs/HANDOFF.md?raw'
import journal from '../../docs/WORK-JOURNAL.md?raw'
import updateLog from '../../docs/UPDATE-LOG.md?raw'
import knowledge from '../../docs/AI-KNOWLEDGE.md?raw'

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

// Owner, 18 Nov 2026 (J129): what the agent learns goes into AI-KNOWLEDGE.md
// on every request, for other AIs to read. Its "Covers up to J###" line must
// match the latest request in the journal.
describe('AI-KNOWLEDGE.md', () => {
  it('is up to date with the latest request', () => {
    const latest = ids(journal, 'J').sort().at(-1)
    const covers = knowledge.match(/Covers up to (J\d{3})/)?.[1]
    expect(covers, 'update docs/AI-KNOWLEDGE.md and its "Covers up to" line').toBe(latest)
  })
})
