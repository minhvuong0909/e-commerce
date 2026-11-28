import type { ClientRequest } from 'http'

/** Upper bounds for calls to third-party services, in milliseconds. */
export const HTTP_TIMEOUTS = {
  geocoding: 8_000,
  routing: 8_000,
  telegram: 8_000,
  paymentGateway: 20_000,
  openai: 20_000,
  mediaUpload: 30_000
} as const

export class UpstreamTimeoutError extends Error {
  constructor(readonly service: string, readonly timeoutMs: number) {
    super(`${service} did not respond within ${timeoutMs}ms`)
    this.name = 'UpstreamTimeoutError'
  }
}

/** `fetch` that aborts after `timeoutMs` and reports it as an UpstreamTimeoutError. */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  options: { timeoutMs: number; service: string }
): Promise<Response> {
  const signal = init.signal
    ? AbortSignal.any([init.signal, AbortSignal.timeout(options.timeoutMs)])
    : AbortSignal.timeout(options.timeoutMs)
  try {
    return await fetch(input, { ...init, signal })
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError') && !init.signal?.aborted) {
      throw new UpstreamTimeoutError(options.service, options.timeoutMs)
    }
    throw error
  }
}

/** Abort a node `https.request` that stalls (no socket activity) for `timeoutMs`. */
export function applyRequestTimeout(req: ClientRequest, timeoutMs: number, service: string) {
  req.setTimeout(timeoutMs, () => req.destroy(new UpstreamTimeoutError(service, timeoutMs)))
  return req
}
