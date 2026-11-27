import crypto from 'crypto'
import { badRequest } from './security'

/** How long an identical order without a client key is treated as a duplicate submit. */
export const FINGERPRINT_WINDOW_MS = 2 * 60 * 1000

const CLIENT_KEY_RE = /^[A-Za-z0-9_-]{8,100}$/

export type OrderOwner = { user_id?: string; guest_phone?: string }

function ownerTag(owner: OrderOwner) {
  if (owner.user_id) return `u:${owner.user_id}`
  return `g:${(owner.guest_phone ?? '').replace(/\D/g, '')}`
}

/**
 * Accept only a well-formed `Idempotency-Key` header; anything else is a client bug we should surface.
 * Missing header is allowed (older clients) and falls back to a request fingerprint.
 */
export function readClientKey(header: unknown): string | undefined {
  if (header === undefined || header === null || header === '') return undefined
  if (typeof header !== 'string' || !CLIENT_KEY_RE.test(header)) badRequest('Idempotency-Key không hợp lệ.')
  return header
}

type FingerprintInput = {
  items: Array<{ product_id: string; quantity: number }>
  payment_method?: unknown
  delivery_method_id?: unknown
  address_line?: unknown
  phone?: unknown
  voucher_code?: unknown
}

/** Stable hash of what makes two submits "the same order". Item order does not matter. */
export function orderFingerprint(input: FingerprintInput): string {
  const items = [...input.items]
    .map((i) => `${i.product_id}x${i.quantity}`)
    .sort()
    .join(',')
  const norm = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  const raw = [items, norm(input.payment_method), norm(input.delivery_method_id), norm(input.address_line), norm(input.phone), norm(input.voucher_code)].join('|')
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

/**
 * Key stored on the order (unique index). Always scoped to the buyer so one customer's key can
 * never resolve to another customer's order.
 */
export function buildIdempotencyKey(owner: OrderOwner, clientKey: string | undefined, fp: string, now = Date.now()) {
  if (clientKey) return `${ownerTag(owner)}:k:${clientKey}`
  return `${ownerTag(owner)}:fp:${fp}:${Math.floor(now / FINGERPRINT_WINDOW_MS)}`
}

export function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000)
}
