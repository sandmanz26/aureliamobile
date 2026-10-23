import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { HttpError, requestJson } from './http'

const schema = z.object({ ok: z.boolean() })
const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }))

describe('requestJson', () => {
  it('returns validated data', async () => {
    vi.stubGlobal('fetch', respond({ ok: true }))
    await expect(requestJson('/api/x', { schema })).resolves.toEqual({ ok: true })
  })

  it('rejects a response of the wrong shape', async () => {
    vi.stubGlobal('fetch', respond({ ok: 'yes' }))
    await expect(requestJson('/api/x', { schema })).rejects.toMatchObject({ name: 'HttpError', status: 200 })
  })

  it('uses the server’s error message and status', async () => {
    vi.stubGlobal('fetch', respond({ error: 'Expected { flags }' }, 400))
    const error = await requestJson('/api/x', { schema }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).message).toBe('Expected { flags }')
    expect((error as HttpError).retryable).toBe(false)
  })

  it('turns a non-JSON answer (an HTML error page) into an HttpError', async () => {
    vi.stubGlobal('fetch', respond('<html>502</html>', 502))
    await expect(requestJson('/api/x', { schema })).rejects.toMatchObject({ status: 502, retryable: true })
  })

  it('reports network failures as status 0, retryable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    await expect(requestJson('/api/x', { schema })).rejects.toMatchObject({ status: 0, retryable: true })
  })

  it('sends JSON bodies', async () => {
    const fetchMock = respond({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await requestJson('/api/x', { schema, method: 'POST', body: { a: 1 } })
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
  })
})
