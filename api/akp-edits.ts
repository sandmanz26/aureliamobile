// The admin's edits to the AKP catalogue (U149) — the same KV-backed pattern
// as api/annotations.ts.
//
// GET  /api/akp-edits  -> every edit stored for this deployment
// POST /api/akp-edits  -> replaces the whole list ({ edits: AkpEdit[] })
//
// Last write wins, no merge: the client sends its full ordered list, the
// same accepted simplification api/annotations.ts makes for a low-traffic
// internal tool. Scoped per deployment by scopedKey (staging edits never
// reach production's store), `configured: false` without KV so the client
// keeps its local copy, noStore on every answer, parseBody for a malformed
// body (400, not 500).
//
// The shape mirrors src/admin/data/akpEdits.ts; this file is a separate
// deploy target and does not import client code, so the schema is restated.
// Unlike annotations, an invalid edit rejects the whole POST: the edits are
// replayed in order, and silently dropping one would change what the others
// mean.

import { z } from 'zod'
import { kvConfigured, noStore, parseBody, redis, scopedKey } from './_lib/kv.js'
import type { Req, Res } from './_lib/kv.js'

const KEY = scopedKey('aurelia:admin:akp-edits')

const MAX_EDITS = 2000
const MAX_BYTES = 900_000

const id = z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/)
const linkType = z.enum(['drives', 'supports', 'part-of', 'step-of', 'feeds', 'fed-by', 'mirrors'])
const fields = z
  .object({
    name: z.string().min(1).max(200),
    family: z.enum(['goal', 'identity', 'script', 'music', 'image', 'video', 'product']),
    fn: z.enum(['wellness', 'product', 'identity', 'brand']),
    layer: z.string().max(120),
    modality: z.enum(['Script', 'Music', 'Image', 'Video', '—']),
    description: z.string().max(2000),
    usedFor: z.string().max(300),
    helps: z.string().max(300),
    causalRole: z.string().max(1000),
    flips: z.array(z.string().regex(/^SF-[A-Z]+-\d{2}$/)).max(125),
    status: z.enum(['draft', 'reviewed', 'approved']),
  })
  .partial()
  .strict()
const meta = { id: z.string().min(1).max(40), at: z.string().min(1).max(40), by: z.string().min(1).max(60), akp: id }
const edit = z.discriminatedUnion('op', [
  z.object({ ...meta, op: z.literal('add'), value: fields.required({ name: true, family: true }) }),
  z.object({ ...meta, op: z.literal('update'), set: fields, prev: fields }),
  z.object({ ...meta, op: z.literal('delete') }),
  z.object({ ...meta, op: z.literal('restore') }),
  z.object({ ...meta, op: z.literal('link-add'), to: id, type: linkType }),
  z.object({ ...meta, op: z.literal('link-remove'), to: id, type: linkType }),
])
const edits = z.array(edit).max(MAX_EDITS)

export default async function handler(req: Req, res: Res) {
  noStore(res)

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Use GET or POST' })
    return
  }
  if (!kvConfigured) {
    res.status(200).json({ configured: false, scope: KEY, edits: null })
    return
  }

  try {
    if (req.method === 'GET') {
      const stored = await redis(['GET', KEY])
      let list: unknown = []
      if (typeof stored === 'string') {
        try {
          list = JSON.parse(stored)
        } catch {
          list = []
        }
      }
      res.status(200).json({ configured: true, scope: KEY, edits: Array.isArray(list) ? list : [] })
      return
    }

    const body = parseBody(req)
    if (!body || !Array.isArray(body.edits)) {
      res.status(400).json({ error: 'Expected { edits: AkpEdit[] }' })
      return
    }
    const parsed = edits.safeParse(body.edits)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      res.status(400).json({ error: `Invalid edits${issue?.path.length ? ` at ${issue.path.join('.')}` : ''}: ${issue?.message ?? 'wrong shape'}` })
      return
    }
    const json = JSON.stringify(parsed.data)
    if (json.length > MAX_BYTES) {
      res.status(413).json({ error: `Edits larger than ${MAX_BYTES} bytes` })
      return
    }
    await redis(['SET', KEY, json])
    res.status(200).json({ configured: true, scope: KEY, edits: parsed.data, savedAt: new Date().toISOString() })
  } catch (error) {
    console.error('api/akp-edits failed', error)
    res.status(500).json({ error: 'Request failed' })
  }
}
