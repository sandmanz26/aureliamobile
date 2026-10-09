// Shared review annotations — the same KV-backed pattern as api/config.ts.
//
// GET  /api/annotations  -> every annotation stored for this deployment
// POST /api/annotations  -> replaces the whole set
//
// The client always sends its full local array; there is no merge on the
// server, the same simplification api/config.ts makes for flags. This is a
// low-traffic internal review tool (a handful of people annotating a build,
// not a product feature under concurrent load), so two people dropping pins
// in the same few hundred milliseconds and one push clobbering the other's
// is an accepted, documented limitation rather than something this endpoint
// tries to resolve.
//
// Backed by Upstash Redis over its REST API, exactly like api/config.ts — see
// that file for the KV_REST_API_URL / KV_REST_API_TOKEN contract and the
// `configured: false` fallback when they're absent.
//
// Scoped by VERCEL_ENV for the same reason api/config.ts's flags are: one
// Upstash store sits behind every deployment of this project, so an unscoped
// key would mean a pin dropped while rehearsing on staging shows up on the
// public production build.

const BASE_KEY = 'aurelia:demo:annotations'

/** production | preview | development on Vercel; absent anywhere else. */
const ENVIRONMENT = process.env.VERCEL_ENV ?? ''

function keyFor() {
  const ref = process.env.VERCEL_GIT_COMMIT_REF
  // Staging is a separate Vercel project that deploys `web_app` as *its*
  // production, so VERCEL_ENV=production is not enough: only `web_prod` gets
  // the bare key.
  if (!ENVIRONMENT || (ENVIRONMENT === 'production' && (!ref || ref === 'web_prod'))) return BASE_KEY
  const suffix = (ref || ENVIRONMENT).replace(/[^a-zA-Z0-9._-]+/g, '-')
  return `${BASE_KEY}:${suffix}`
}

const KEY = keyFor()

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

async function redis(command: string[]): Promise<unknown> {
  const response = await fetch(URL_BASE!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!response.ok) throw new Error(`KV ${response.status}`)
  const payload = (await response.json()) as { result?: unknown }
  return payload.result
}

// Mirrors src/demo/annotations/format.ts's Annotation type. This endpoint
// doesn't import client code — it's a separate deploy target — so the shape
// is restated here and validated rather than trusted blindly from a POST
// body, since the endpoint is unauthenticated like api/config.ts.
const MAX_ANNOTATIONS = 500
const MAX_TEXT_LENGTH = 4000
const MAX_STRING_LENGTH = 300

function isValidAnnotation(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const a = value as Record<string, unknown>
  return (
    typeof a.id === 'string' &&
    a.id.length > 0 &&
    a.id.length <= 64 &&
    typeof a.page === 'string' &&
    a.page.length <= MAX_STRING_LENGTH &&
    typeof a.x === 'number' &&
    Number.isFinite(a.x) &&
    typeof a.y === 'number' &&
    Number.isFinite(a.y) &&
    typeof a.vw === 'number' &&
    Number.isFinite(a.vw) &&
    typeof a.vh === 'number' &&
    Number.isFinite(a.vh) &&
    typeof a.scrollY === 'number' &&
    Number.isFinite(a.scrollY) &&
    // Design version (staging v1/v2 switcher). Optional: pins from before it
    // existed have none and read as v1.
    (a.ui === undefined || (typeof a.ui === 'number' && Number.isInteger(a.ui) && a.ui >= 1 && a.ui <= 99)) &&
    typeof a.text === 'string' &&
    a.text.length <= MAX_TEXT_LENGTH &&
    typeof a.createdAt === 'string' &&
    a.createdAt.length <= MAX_STRING_LENGTH &&
    typeof a.updatedAt === 'string' &&
    a.updatedAt.length <= MAX_STRING_LENGTH
  )
}

export default async function handler(req: Req, res: Res) {
  // Read on every poll and every page load of the tool, so never let a CDN
  // or the browser serve a stale copy.
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (!URL_BASE || !TOKEN) {
    res.status(200).json({ configured: false, scope: KEY, annotations: null })
    return
  }

  try {
    if (req.method === 'GET') {
      const stored = await redis(['GET', KEY])
      res.status(200).json({
        configured: true,
        scope: KEY,
        annotations: typeof stored === 'string' ? JSON.parse(stored) : [],
      })
      return
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
        | { annotations?: unknown }
        | undefined
      const list = body?.annotations

      if (!Array.isArray(list)) {
        res.status(400).json({ error: 'Expected { annotations: Annotation[] }' })
        return
      }
      if (list.length > MAX_ANNOTATIONS) {
        res.status(400).json({ error: `Expected at most ${MAX_ANNOTATIONS} annotations` })
        return
      }
      const clean = list.filter(isValidAnnotation)

      await redis(['SET', KEY, JSON.stringify(clean)])
      res.status(200).json({
        configured: true,
        scope: KEY,
        annotations: clean,
        savedAt: new Date().toISOString(),
      })
      return
    }

    res.status(405).json({ error: 'Use GET or POST' })
  } catch (error) {
    // Logged for whoever can read Vercel's function logs; not returned to the
    // caller, since this endpoint takes requests from anyone and an upstream
    // error message is not this app's to hand out.
    console.error('api/annotations failed', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
