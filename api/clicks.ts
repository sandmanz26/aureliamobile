// Click insights — what people tap, and the path they take between screens.
//
// POST /api/clicks  { events: ClickEvent[] }  -> appends (capped list)
// POST /api/clicks  { clear: true }           -> deletes this deployment's log
// GET  /api/clicks                            -> every stored event
//
// Same Upstash KV and the same per-deployment scoping as api/annotations.ts:
// production keeps the bare key, every other deployment appends its branch,
// so staging rehearsal clicks never mix with production's. Without
// KV_REST_API_URL/KV_REST_API_TOKEN it answers `configured: false` and the
// client keeps events in localStorage instead.
//
// Unauthenticated like the other demo endpoints: anyone who finds it can read
// or clear the log. Events carry no personal data (no typed text, no names) —
// a random per-tab session id, the page, the element's visible label and a
// position — which is what makes that acceptable for an internal tool.

import { kvConfigured, noStore, parseBody, redis, scopedKey } from './_lib/kv.js'
import type { Req, Res } from './_lib/kv.js'

const BASE_KEY = 'aurelia:insights:clicks'

const KEY = scopedKey(BASE_KEY)
/** The log keeps the newest this many events. */
const MAX_EVENTS = 20000
const MAX_BATCH = 200

const str = (v: unknown, max: number) => typeof v === 'string' && v.length <= max
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)

function isValidEvent(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const e = value as Record<string, unknown>
  return (
    (e.type === 'click' || e.type === 'view') &&
    str(e.t, 40) &&
    str(e.sid, 40) &&
    str(e.page, 300) &&
    num(e.ui) &&
    num(e.vw) &&
    num(e.vh) &&
    (e.x === undefined || num(e.x)) &&
    (e.y === undefined || num(e.y)) &&
    (e.docH === undefined || num(e.docH)) &&
    (e.label === undefined || str(e.label, 120)) &&
    (e.tag === undefined || str(e.tag, 20)) &&
    (e.href === undefined || str(e.href, 300)) &&
    (e.from === undefined || str(e.from, 300)) &&
    // U034 element detail
    (e.kind === undefined || str(e.kind, 20)) &&
    (e.section === undefined || str(e.section, 80)) &&
    (e.sel === undefined || str(e.sel, 300)) &&
    (e.state === undefined || str(e.state, 60)) &&
    (e.to === undefined || str(e.to, 300)) &&
    (e.fx === undefined || e.fx === 'navigated' || e.fx === 'changed' || e.fx === 'nothing') &&
    (e.rage === undefined || typeof e.rage === 'boolean') &&
    (e.dead === undefined || typeof e.dead === 'boolean') &&
    ['ex', 'ey', 'ew', 'eh', 'ms', 'sy'].every((k) => e[k] === undefined || num(e[k]))
  )
}

export default async function handler(req: Req, res: Res) {
  noStore(res)

  if (!kvConfigured) {
    res.status(200).json({ configured: false, scope: KEY, events: null })
    return
  }

  try {
    if (req.method === 'GET') {
      const raw = (await redis(['LRANGE', KEY, 0, -1])) as string[] | null
      const events = (raw ?? []).flatMap((line) => {
        try {
          return [JSON.parse(line)]
        } catch {
          return []
        }
      })
      res.status(200).json({ configured: true, scope: KEY, events })
      return
    }

    if (req.method === 'POST') {
      const body = parseBody(req)
      if (body?.clear === true) {
        await redis(['DEL', KEY])
        res.status(200).json({ configured: true, scope: KEY, cleared: true })
        return
      }
      const list = body?.events
      if (!Array.isArray(list) || list.length > MAX_BATCH) {
        res.status(400).json({ error: `Expected { events: ClickEvent[] } with at most ${MAX_BATCH}` })
        return
      }
      const clean = list.filter(isValidEvent)
      if (clean.length) {
        await redis(['RPUSH', KEY, ...clean.map((e) => JSON.stringify(e))])
        await redis(['LTRIM', KEY, -MAX_EVENTS, -1])
      }
      res.status(200).json({ configured: true, scope: KEY, stored: clean.length })
      return
    }

    res.status(405).json({ error: 'Use GET or POST' })
  } catch (error) {
    console.error('api/clicks failed', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
