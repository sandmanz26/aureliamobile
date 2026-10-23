import { z } from 'zod'
import { requestJson } from '../lib/http'

/**
 * /api/clicks — click insights (see api/clicks.ts and src/demo/insights).
 * One schema for an event, shared by the tracker that writes them and the
 * insights page that reads them back.
 */
export const clickEvent = z.object({
  type: z.enum(['click', 'view']),
  t: z.string(),
  sid: z.string(),
  page: z.string(),
  /** Design version on screen (staging v1–v4 switcher; 2 on production). */
  ui: z.number(),
  vw: z.number(),
  vh: z.number(),
  x: z.number().optional(),
  y: z.number().optional(),
  docH: z.number().optional(),
  label: z.string().optional(),
  tag: z.string().optional(),
  href: z.string().optional(),
  from: z.string().optional(),
  kind: z.string().optional(),
  section: z.string().optional(),
  sel: z.string().optional(),
  ex: z.number().optional(),
  ey: z.number().optional(),
  ew: z.number().optional(),
  eh: z.number().optional(),
  state: z.string().optional(),
  ms: z.number().optional(),
  sy: z.number().optional(),
  rage: z.boolean().optional(),
  dead: z.boolean().optional(),
  fx: z.enum(['navigated', 'changed', 'nothing']).optional(),
  to: z.string().optional(),
})
export type ClickEvent = z.infer<typeof clickEvent>

const readResponse = z.object({
  configured: z.boolean(),
  scope: z.string().optional(),
  // Lenient on read: one malformed stored line must not hide the rest.
  events: z.array(z.unknown()).nullable(),
})

const writeResponse = z.object({
  configured: z.boolean(),
  scope: z.string().optional(),
  stored: z.number().optional(),
  cleared: z.boolean().optional(),
})

export const clickKeys = { all: ['clicks'] as const }

export async function fetchClicks(signal?: AbortSignal) {
  const data = await requestJson('/api/clicks', { schema: readResponse, signal, timeoutMs: 20_000 })
  const events = (data.events ?? []).flatMap((e) => {
    const parsed = clickEvent.safeParse(e)
    return parsed.success ? [parsed.data] : []
  })
  return { configured: data.configured, scope: data.scope, events }
}

export function postClicks(events: ClickEvent[]) {
  return requestJson('/api/clicks', { schema: writeResponse, method: 'POST', body: { events }, keepalive: true })
}

export function clearClicks() {
  return requestJson('/api/clicks', { schema: writeResponse, method: 'POST', body: { clear: true } })
}
