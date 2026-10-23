import { z } from 'zod'
import { requestJson } from '../lib/http'

/**
 * /api/annotations — review pins (see api/annotations.ts and
 * src/demo/annotations). Validated on the way in: the endpoint is
 * unauthenticated, so what it returns is treated as untrusted input and a
 * malformed note is dropped rather than rendered.
 */
export const annotation = z.object({
  id: z.string().min(1).max(64),
  page: z.string().max(300),
  x: z.number(),
  y: z.number(),
  vw: z.number(),
  vh: z.number(),
  scrollY: z.number().catch(0),
  ui: z.number().catch(1),
  text: z.string().max(4000),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const response = z.object({
  configured: z.boolean(),
  scope: z.string().optional(),
  annotations: z.array(z.unknown()).nullable().optional(),
})

/** Keeps every valid note and drops the rest, so one bad entry cannot hide the others. */
export function validAnnotations(list: unknown[]) {
  return list.flatMap((item) => {
    const parsed = annotation.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

export async function fetchAnnotations(signal?: AbortSignal) {
  const data = await requestJson('/api/annotations', { schema: response, signal })
  return { configured: data.configured, scope: data.scope, annotations: validAnnotations(data.annotations ?? []) }
}

export function saveAnnotations(list: z.infer<typeof annotation>[]) {
  return requestJson('/api/annotations', { schema: response, method: 'POST', body: { annotations: list } })
}
