import { describe, expect, it } from 'vitest'
import { buildIdempotencyKey, FINGERPRINT_WINDOW_MS, isDuplicateKeyError, orderFingerprint, readClientKey } from '../idempotency'

const base = {
  items: [
    { product_id: 'a', quantity: 1 },
    { product_id: 'b', quantity: 2 }
  ],
  payment_method: 'CASH_ON_DELIVERY',
  delivery_method_id: 'd1',
  address_line: '1 Võ Văn Ngân',
  phone: '0900 000 000'
}

describe('idempotency helpers', () => {
  it('validates the client key format', () => {
    expect(readClientKey(undefined)).toBeUndefined()
    expect(readClientKey('')).toBeUndefined()
    expect(readClientKey('0b6c1f3e-2a7d-4c3b-9f00-123456789abc')).toBe('0b6c1f3e-2a7d-4c3b-9f00-123456789abc')
    expect(() => readClientKey('short')).toThrow()
    expect(() => readClientKey('has spaces in it')).toThrow()
    expect(() => readClientKey('x'.repeat(101))).toThrow()
  })

  it('fingerprints ignore item order and whitespace, but not real differences', () => {
    const same = orderFingerprint({ ...base, items: [...base.items].reverse(), address_line: '  1  Võ Văn Ngân ' })
    expect(same).toBe(orderFingerprint(base))
    expect(orderFingerprint({ ...base, items: [{ product_id: 'a', quantity: 2 }] })).not.toBe(orderFingerprint(base))
    expect(orderFingerprint({ ...base, voucher_code: 'GLOW10' })).not.toBe(orderFingerprint(base))
  })

  it('scopes keys to the buyer so two customers never collide', () => {
    expect(buildIdempotencyKey({ user_id: 'u1' }, 'samekey123', 'fp')).not.toBe(buildIdempotencyKey({ user_id: 'u2' }, 'samekey123', 'fp'))
    expect(buildIdempotencyKey({ guest_phone: '090-000-0000' }, 'samekey123', 'fp')).toBe('g:0900000000:k:samekey123')
  })

  it('fingerprint keys expire with the time window', () => {
    const t = 10 * FINGERPRINT_WINDOW_MS
    expect(buildIdempotencyKey({ user_id: 'u' }, undefined, 'fp', t)).toBe(buildIdempotencyKey({ user_id: 'u' }, undefined, 'fp', t + 1000))
    expect(buildIdempotencyKey({ user_id: 'u' }, undefined, 'fp', t)).not.toBe(
      buildIdempotencyKey({ user_id: 'u' }, undefined, 'fp', t + FINGERPRINT_WINDOW_MS)
    )
  })

  it('recognises Mongo duplicate key errors', () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true)
    expect(isDuplicateKeyError(new Error('x'))).toBe(false)
  })
})
