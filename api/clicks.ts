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

const BASE_KEY = 'aurelia:insights:clicks'
const ENVIRONMENT = process.env.VERCEL_ENV ?? ''

function keyFor() {
  const ref = process.env.VERCEL_GIT_COMMIT_REF
  if (!ENVIRONMENT || (ENVIRONMENT === 'production' && (!ref || ref === 'web_prod'))) return BASE_KEY
  const suffix = (ref || ENVIRONMENT).replace(/[^a-zA-Z0-9._-]+/g, '-')
  return `${BASE_KEY}:${suffix}`
}

const KEY = keyFor()
/** The log keeps the newest this many events. */
const MAX_EVENTS = 20000
const MAX_BATCH = 200

const URL_BASE = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

interface Req {
  method?: string
  body?: unknown
}
interface Res {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const response = await fetch(URL_BASE!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!response.ok) throw new Error(`KV ${response.status}`)
  const payload = (await response.json()) as { result?: unknown }
  return payload.result
}

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
    (e.from === undefined || str(e.from, 300))
  )
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (!URL_BASE || !TOKEN) {
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
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
        | { events?: unknown; clear?: unknown }
        | undefined
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
