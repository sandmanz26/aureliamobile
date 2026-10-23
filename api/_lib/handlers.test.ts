import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Req, Res } from './kv.js'

// The handlers read their env at import time, so each test stubs the env and
// re-imports. KV itself is a mocked fetch that records the Redis commands.
function mockRes() {
  const res = { code: 0, body: undefined as unknown, headers: {} as Record<string, string> }
  const api: Res = {
    status: (c) => ((res.code = c), api),
    json: (b) => void (res.body = b),
    setHeader: (k, v) => void (res.headers[k] = v),
  }
  return { res, api }
}

async function load(name: 'config' | 'clicks' | 'annotations', kv: boolean) {
  vi.resetModules()
  if (kv) {
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'token')
  } else {
    vi.stubEnv('KV_REST_API_URL', '')
    vi.stubEnv('KV_REST_API_TOKEN', '')
  }
  vi.stubEnv('VERCEL_ENV', 'production')
  vi.stubEnv('VERCEL_GIT_COMMIT_REF', 'web_app')
  return (await import(`../${name}.ts`)).default as (req: Req, res: Res) => Promise<void>
}

const commands: unknown[][] = []
beforeEach(() => {
  commands.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      const command = JSON.parse(String(init.body)) as unknown[]
      commands.push(command)
      const result = command[0] === 'GET' ? null : command[0] === 'LRANGE' ? [] : 'OK'
      return new Response(JSON.stringify({ result }))
    }),
  )
})

describe('serverless endpoints', () => {
  it('report configured:false without a store, with the scope and no-store', async () => {
    for (const name of ['config', 'clicks', 'annotations'] as const) {
      const handler = await load(name, false)
      const { res, api } = mockRes()
      await handler({ method: 'GET' }, api)
      expect(res.code).toBe(200)
      expect(res.body).toMatchObject({ configured: false, scope: expect.stringMatching(/:web_app$/) })
      expect(res.headers['Cache-Control']).toContain('no-store')
    }
  })

  it('answer 400 to a malformed body instead of crashing', async () => {
    for (const name of ['config', 'clicks', 'annotations'] as const) {
      const handler = await load(name, true)
      const { res, api } = mockRes()
      await handler({ method: 'POST', body: '{bad json' }, api)
      expect(res.code).toBe(400)
    }
  })

  it('config stores only booleans, under the scoped key', async () => {
    const handler = await load('config', true)
    const { res, api } = mockRes()
    await handler({ method: 'POST', body: { flags: { chat: true, evil: 'x', lock: false } } }, api)
    expect(res.code).toBe(200)
    expect(commands).toContainEqual(['SET', 'aurelia:demo:config:web_app', '{"chat":true,"lock":false}'])
  })

  it('clicks drops invalid events and caps the log', async () => {
    const handler = await load('clicks', true)
    const { res, api } = mockRes()
    const good = { type: 'view', t: 't', sid: 's', page: '/home', ui: 2, vw: 402, vh: 874 }
    await handler({ method: 'POST', body: { events: [good, { type: 'hack' }] } }, api)
    expect(res.body).toMatchObject({ stored: 1 })
    expect(commands[0]).toEqual(['RPUSH', 'aurelia:insights:clicks:web_app', JSON.stringify(good)])
    expect(commands[1][0]).toBe('LTRIM')
  })

  it('rejects other methods', async () => {
    const handler = await load('annotations', true)
    const { res, api } = mockRes()
    await handler({ method: 'DELETE' }, api)
    expect(res.code).toBe(405)
  })
})
