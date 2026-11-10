import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tokenResponse = (token: string) => new Response(JSON.stringify({ csrfToken: token }), { status: 200 })

const stubFetch = (handler: (url: string) => Response) => {
  const calls: { url: string; token: string | undefined }[] = []

  vi.stubGlobal('localStorage', { getItem: () => null })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const headers = (init?.headers ?? {}) as Record<string, string>
      calls.push({ url, token: headers['x-csrf-token'] })
      return handler(url)
    })
  )

  return calls
}

const freshApiFetch = async () => {
  const module = await import('../../client/util/useApi.tsx')
  return module.apiFetch
}

const mutationCalls = (calls: { url: string; token: string | undefined }[]) =>
  calls.filter(call => call.url === '/api/admin/thing')

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('refetches the token and replays the request once when a mutation is rejected', async () => {
    let issued = 0
    const calls = stubFetch(url => {
      if (url === '/api/csrf-token') {
        issued += 1
        return tokenResponse(`token-${issued}`)
      }
      return new Response('', { status: issued > 1 ? 200 : 403 })
    })

    const apiFetch = await freshApiFetch()
    const response = await apiFetch('/api/admin/thing', 'POST', { a: 1 })

    expect(response.status).toBe(200)
    expect(mutationCalls(calls).map(call => call.token)).toEqual(['token-1', 'token-2'])
  })

  it('does not replay a second time when the fresh token is also rejected', async () => {
    const calls = stubFetch(url =>
      url === '/api/csrf-token' ? tokenResponse('token') : new Response('', { status: 403 })
    )

    const apiFetch = await freshApiFetch()
    const response = await apiFetch('/api/admin/thing', 'POST', { a: 1 })

    expect(response.status).toBe(403)
    expect(mutationCalls(calls)).toHaveLength(2)
  })

  it('leaves a forbidden GET alone instead of discarding the token', async () => {
    const calls = stubFetch(url =>
      url === '/api/csrf-token' ? tokenResponse('token') : new Response('', { status: 403 })
    )

    const apiFetch = await freshApiFetch()
    const response = await apiFetch('/api/admin/thing', 'GET')

    expect(response.status).toBe(403)
    expect(mutationCalls(calls)).toHaveLength(1)
  })
})
