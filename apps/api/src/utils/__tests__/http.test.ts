import { EventEmitter } from 'events'
import type { ClientRequest } from 'http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyRequestTimeout, fetchWithTimeout, UpstreamTimeoutError } from '../http'

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the response when upstream answers in time', async () => {
    const ok = new Response('{}', { status: 200 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok))
    await expect(fetchWithTimeout('https://example.test', {}, { timeoutMs: 50, service: 'test' })).resolves.toBe(ok)
  })

  it('throws UpstreamTimeoutError when upstream hangs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        })
      })
    )
    await expect(fetchWithTimeout('https://example.test', {}, { timeoutMs: 20, service: 'slow' })).rejects.toBeInstanceOf(
      UpstreamTimeoutError
    )
  })

  it('passes through non-timeout network errors unchanged', async () => {
    const boom = new TypeError('fetch failed')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(boom))
    await expect(fetchWithTimeout('https://example.test', {}, { timeoutMs: 50, service: 'x' })).rejects.toBe(boom)
  })
})

describe('applyRequestTimeout', () => {
  it('destroys a stalled request with UpstreamTimeoutError', () => {
    const req = Object.assign(new EventEmitter(), {
      setTimeout: vi.fn((_ms: number, cb: () => void) => cb()),
      destroy: vi.fn()
    }) as unknown as ClientRequest
    applyRequestTimeout(req, 1000, 'momo')
    expect(req.setTimeout).toHaveBeenCalledWith(1000, expect.any(Function))
    expect((req.destroy as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(UpstreamTimeoutError)
  })
})
