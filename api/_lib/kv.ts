// Shared by every serverless endpoint: the Upstash REST client, the
// per-deployment key scoping and the request/response types.
//
// The leading underscore keeps this folder out of Vercel's routes — it is
// a module, not an endpoint. Imports use the `.js` extension because the
// project is ESM ("type": "module") and Node resolves the compiled file.
//
// Scoping, once, for all of them: one Upstash store sits behind every
// deployment of this project. Production (`web_prod`) keeps the bare key, so
// everything stored before the split stayed where it was; every other
// deployment appends its branch, so rehearsing on staging never writes to
// what the public site reads. The staging site is its own Vercel project
// whose *production* branch is `web_app`, which is why VERCEL_ENV alone is
// not enough. No VERCEL_ENV at all (local `vercel dev`, another host) is
// treated as production: that is how these endpoints behaved originally.

export interface Req {
  method?: string
  body?: unknown
}

export interface Res {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

/** production | preview | development on Vercel; empty anywhere else. */
export const ENVIRONMENT = process.env.VERCEL_ENV ?? ''

export function scopedKey(base: string, env = process.env): string {
  const environment = env.VERCEL_ENV ?? ''
  const ref = env.VERCEL_GIT_COMMIT_REF
  if (!environment || (environment === 'production' && (!ref || ref === 'web_prod'))) return base
  const suffix = (ref || environment).replace(/[^a-zA-Z0-9._-]+/g, '-')
  return `${base}:${suffix}`
}

const URL_BASE = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

/** False when the store's env vars are missing: endpoints answer `configured: false`. */
export const kvConfigured = Boolean(URL_BASE && TOKEN)

const KV_TIMEOUT_MS = 8_000

/** One Redis command over Upstash's REST API. Throws on HTTP errors and timeouts. */
export async function redis(command: (string | number)[]): Promise<unknown> {
  const response = await fetch(URL_BASE!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(KV_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`KV ${response.status}`)
  const payload = (await response.json()) as { result?: unknown }
  return payload.result
}

/**
 * The request body as an object, or undefined. A string body is parsed; a
 * malformed one is undefined (the caller answers 400) rather than an
 * exception that would surface as a 500.
 */
export function parseBody(req: Req): Record<string, unknown> | undefined {
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return undefined
    }
  }
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined
}

/** Never let a CDN or browser serve a stale copy: every endpoint is read live. */
export function noStore(res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
}
