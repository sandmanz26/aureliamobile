// Shared demo config — the one piece of server state in this project.
//
// GET  /api/config  -> the published walkthrough scope, for every visitor
// POST /api/config  -> replaces it (called by the /__demo Publish button)
//
// Backed by Upstash Redis over its REST API, which is what Vercel injects when
// you connect a KV / Upstash store to the project (KV_REST_API_URL +
// KV_REST_API_TOKEN). No SDK, so there is nothing to install.
//
// If those env vars are absent the endpoint reports `configured: false` rather
// than failing: the client then falls back to its local copy, so an
// unconfigured deployment behaves exactly as it did before this existed.
//
// One store, several deployments
// ------------------------------
// Staging and production are two Vercel deployments of the same project
// pointed at the same Upstash store. Under a single key they would share one
// flag set, so pressing Publish while rehearsing on staging would change what
// the public site shows — the opposite of why staging exists. The key is
// therefore scoped per environment.
//
// Production keeps the bare key so every flag set published before this split
// stays where it was; everything else gets its branch name appended.

const BASE_KEY = 'aurelia:demo:config'

/** production | preview | development on Vercel; absent anywhere else. */
const ENVIRONMENT = process.env.VERCEL_ENV ?? ''

function keyFor() {
  // No VERCEL_ENV means this is not a Vercel deployment at all (a local
  // `vercel dev`, or some other host). Treat it as production: that is how
  // this endpoint behaved before the split, and there is nothing to collide
  // with.
  if (!ENVIRONMENT || ENVIRONMENT === 'production') return BASE_KEY
  const ref = process.env.VERCEL_GIT_COMMIT_REF
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

export default async function handler(req: Req, res: Res) {
  // The published scope is read on every page load, so never let a CDN or the
  // browser serve a stale copy.
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (!URL_BASE || !TOKEN) {
    res.status(200).json({ configured: false, scope: KEY, environment: ENVIRONMENT || 'unknown', flags: null })
    return
  }

  try {
    if (req.method === 'GET') {
      const stored = await redis(['GET', KEY])
      res.status(200).json({
        configured: true,
        scope: KEY,
        environment: ENVIRONMENT || 'unknown',
        flags: typeof stored === 'string' ? JSON.parse(stored) : null,
      })
      return
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
        | { flags?: Record<string, boolean> }
        | undefined
      const flags = body?.flags

      if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
        res.status(400).json({ error: 'Expected { flags: Record<string, boolean> }' })
        return
      }
      // Only booleans get stored — this endpoint is unauthenticated, so keep
      // what it can write to the narrowest possible shape.
      const clean: Record<string, boolean> = {}
      for (const [key, value] of Object.entries(flags)) {
        if (typeof value === 'boolean') clean[key] = value
      }

      await redis(['SET', KEY, JSON.stringify(clean)])
      res.status(200).json({
        configured: true,
        scope: KEY,
        environment: ENVIRONMENT || 'unknown',
        flags: clean,
        savedAt: new Date().toISOString(),
      })
      return
    }

    res.status(405).json({ error: 'Use GET or POST' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'KV request failed' })
  }
}
