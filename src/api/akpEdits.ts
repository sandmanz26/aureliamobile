import { z } from 'zod'
import { akpEditSchema, type AkpEdit } from '../admin/data/akpEdits'
import { requestJson } from '../lib/http'

/**
 * /api/akp-edits — the admin's edits to the AKP catalogue (U149; see
 * api/akp-edits.ts and src/admin/data/akpEdits.ts). The endpoint is
 * unauthenticated, so what it returns is validated again here and an edit
 * that does not parse is dropped rather than replayed.
 */
const response = z.object({
  configured: z.boolean(),
  scope: z.string().optional(),
  edits: z.array(z.unknown()).nullable().optional(),
  savedAt: z.string().optional(),
})

export function validAkpEdits(list: unknown[]): AkpEdit[] {
  return list.flatMap((item) => {
    const parsed = akpEditSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

export async function fetchAkpEdits(signal?: AbortSignal) {
  const data = await requestJson('/api/akp-edits', { schema: response, signal })
  return { configured: data.configured, scope: data.scope, edits: data.edits ? validAkpEdits(data.edits) : null }
}

export async function saveAkpEdits(edits: AkpEdit[]) {
  const data = await requestJson('/api/akp-edits', { schema: response, method: 'POST', body: { edits } })
  return { configured: data.configured, scope: data.scope }
}
