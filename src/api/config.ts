import { z } from 'zod'
import { requestJson } from '../lib/http'

/**
 * /api/config — the published feature-flag set (see api/config.ts).
 * Schemas mirror the endpoint; the server validates what it accepts, the
 * client validates what it receives.
 */
const flags = z.record(z.string(), z.boolean())

export const configResponse = z.object({
  configured: z.boolean(),
  flags: flags.nullable(),
  scope: z.string().optional(),
  environment: z.string().optional(),
  savedAt: z.string().optional(),
})
export type ConfigResponse = z.infer<typeof configResponse>

export const configKeys = { all: ['config'] as const }

export function fetchConfig(signal?: AbortSignal) {
  return requestJson('/api/config', { schema: configResponse, signal })
}

export function publishConfig(next: Record<string, boolean>) {
  return requestJson('/api/config', { schema: configResponse, method: 'POST', body: { flags: next } })
}
