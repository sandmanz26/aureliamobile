import contextMd from '../../../docs/briefs/EUGENE-CONTEXT.md?raw'

/*
 * Start here → "Your asks" (U147, J206): the business owner's list of asks
 * (§0 of the context brief) read at build time, so the tracker can never
 * disagree with the document. Personal names are replaced on screen.
 */

export type AskStatus = 'done' | 'live' | 'planned' | 'waiting' | 'received' | 'open' | 'parked'

export const ASK_STATUS_LABEL: Record<AskStatus, string> = {
  done: 'Done',
  live: 'On staging or production',
  planned: 'Planned',
  waiting: 'Waiting',
  received: 'Received',
  open: 'Open',
  parked: 'Parked',
}

export interface Ask {
  id: string
  ask: string
  from: string
  statusText: string
  status: AskStatus
  link?: { to: string; label: string }
}

/** Pages that answer an ask, where they exist. */
export const ASK_LINKS: Record<string, { to: string; label: string }> = {
  A1: { to: '/admin/ai-brain', label: 'AI brain' },
  A40: { to: '/admin/ai-brain', label: 'AI brain' },
  A43: { to: '/admin/ai-brain', label: 'AI brain' },
  A5: { to: '/admin/ai-brain?tab=detail#features', label: 'Feature ranking' },
  A7: { to: '/admin/ai-brain?tab=detail#weekly', label: 'Weekly report' },
  A44: { to: '/admin/reports/buyer-agent?tab=detail#test-8', label: 'Buyer agent test 8' },
  A22: { to: '/admin/stateflips', label: 'StateFlips' },
  A23: { to: '/admin/stateflips', label: 'StateFlips' },
  A29: { to: '/admin/stateflips', label: 'StateFlips' },
  A2: { to: '/admin/stateflips', label: 'StateFlips' },
  A3: { to: '/admin/stateflips', label: 'StateFlips' },
  A24: { to: '/admin/stateflips', label: 'StateFlips (AKPs)' },
  A25: { to: '/admin/personas', label: 'Personas' },
  A9: { to: '/admin/reports/cost', label: 'Cost report' },
  A10: { to: '/admin/reports', label: 'Reports' },
  A12: { to: '/admin/healing-map', label: 'Healing map' },
  A4: { to: '/admin/healing-map', label: 'Healing map' },
  A31: { to: '/admin/reports/metrics', label: 'Report metrics' },
  A39: { to: '/wiki/b2b2c/owner-thesis', label: 'His thesis' },
  A17: { to: '/wiki/b2b2c/owner-thesis', label: 'His thesis' },
}

export function statusOf(text: string): AskStatus {
  const t = text.toLowerCase()
  if (/^done/.test(t)) return 'done'
  if (/on staging|production/.test(t)) return 'live'
  if (/parked/.test(t)) return 'parked'
  if (/waiting|needs permission/.test(t)) return 'waiting'
  if (/planned|agreed/.test(t)) return 'planned'
  if (/received|saved/.test(t)) return 'received'
  return 'open'
}

/** No personal names on screen: "Eugene" → "the business owner", "Hussein" → "a designer". */
export const plain = (s: string) =>
  s
    .replace(/\*\*/g, '')
    .replace(/Eugene['’]s/g, 'the business owner’s')
    .replace(/Eugene/g, 'the business owner')
    .replace(/Hussein['’]s/g, 'a designer’s')

export function parseAsks(md: string): Ask[] {
  const start = md.indexOf('## 0.')
  if (start < 0) return []
  const end = md.indexOf('\n## ', start + 5)
  const section = md.slice(start, end < 0 ? undefined : end)
  const out: Ask[] = []
  for (const line of section.split('\n')) {
    const m = /^\|\s*(A\d+)\s*\|(.*)\|(.*)\|(.*)\|\s*$/.exec(line)
    if (!m) continue
    const statusText = plain(m[4].trim())
    out.push({ id: m[1], ask: plain(m[2].trim()), from: plain(m[3].trim()), statusText, status: statusOf(statusText), link: ASK_LINKS[m[1]] })
  }
  return out.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)))
}

export const OWNER_ASKS: Ask[] = parseAsks(contextMd)
