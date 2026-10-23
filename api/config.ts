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

import { ENVIRONMENT, kvConfigured, noStore, parseBody, redis, scopedKey } from './_lib/kv.js'
import type { Req, Res } from './_lib/kv.js'

const BASE_KEY = 'aurelia:demo:config'

const KEY = scopedKey(BASE_KEY)

export default async function handler(req: Req, res: Res) {
  // The published scope is read on every page load, so never let a CDN or the
  // browser serve a stale copy.
  noStore(res)

  if (!kvConfigured) {
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
      const body = parseBody(req)
      const flags = body?.flags

      if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
        res.status(400).json({ error: 'Expected { flags: Record<string, boolean> }' })
        return
      }
      // Only booleans get stored — this endpoint is unauthenticated, so keep
      // what it can write to the narrowest possible shape. The count and key
      // length caps exist for the same reason: nothing here needs more than
      // the real registry ever has, and an unauthenticated POST that can
      // grow without limit is a storage-cost knob anyone can turn.
      const MAX_FLAGS = 500
      const MAX_KEY_LENGTH = 200
      const entries = Object.entries(flags)
      if (entries.length > MAX_FLAGS) {
        res.status(400).json({ error: `Expected at most ${MAX_FLAGS} flags` })
        return
      }
      const clean: Record<string, boolean> = {}
      for (const [key, value] of entries) {
        if (typeof value === 'boolean' && key.length <= MAX_KEY_LENGTH) clean[key] = value
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
    // Logged for whoever can read Vercel's function logs; not returned to the
    // caller, since this endpoint takes requests from anyone and an upstream
    // error message is not this app's to hand out.
    console.error('api/config failed', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
