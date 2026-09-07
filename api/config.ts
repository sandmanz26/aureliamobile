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

const KEY = 'aurelia:demo:config'

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
    res.status(200).json({ configured: false, flags: null })
    return
  }

  try {
    if (req.method === 'GET') {
      const stored = await redis(['GET', KEY])
      res.status(200).json({
        configured: true,
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
      res.status(200).json({ configured: true, flags: clean, savedAt: new Date().toISOString() })
      return
    }

    res.status(405).json({ error: 'Use GET or POST' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'KV request failed' })
  }
}
