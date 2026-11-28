import { badRequest } from './security'

export const VOUCHER_LIMITS = {
  codeMin: 3,
  codeMax: 32,
  fixedMax: 100_000_000,
  orderMax: 1_000_000_000,
  usageMax: 1_000_000
} as const

const CODE_RE = /^[A-Z0-9_-]+$/

export type VoucherInput = {
  code?: string
  discount_type?: 'percent' | 'fixed'
  discount_value?: number
  max_discount_value?: number | null
  min_order_value?: number
  usage_limit?: number
  starts_at?: Date | null
  ends_at?: Date | null
  active?: boolean
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v)

function intInRange(raw: unknown, field: string, min: number, max: number): number {
  const v = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw
  if (!isInt(v) || v < min || v > max) badRequest(`${field} phải là số nguyên từ ${min} đến ${max.toLocaleString('vi-VN')}.`)
  return v
}

function dateOrNull(raw: unknown, field: string): Date | null {
  if (raw === null || raw === '') return null
  const d = typeof raw === 'string' || raw instanceof Date ? new Date(raw) : null
  if (!d || Number.isNaN(d.getTime())) badRequest(`${field} không hợp lệ.`)
  return d
}

/**
 * Whitelist + validate admin voucher input. Counters (used_count), ids and timestamps are never
 * accepted from the client. `partial` is for PATCH: only provided fields are returned.
 * `current` lets cross-field rules (percent ≤ 100, ends after starts) use the stored values.
 */
export function parseVoucherInput(body: unknown, { partial = false, current }: { partial?: boolean; current?: VoucherInput } = {}): VoucherInput {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: VoucherInput = {}
  const has = (k: string) => raw[k] !== undefined

  if (has('code') || !partial) {
    const code = typeof raw.code === 'string' ? raw.code.trim().toUpperCase() : ''
    if (code.length < VOUCHER_LIMITS.codeMin || code.length > VOUCHER_LIMITS.codeMax || !CODE_RE.test(code))
      badRequest(`Mã phải dài ${VOUCHER_LIMITS.codeMin}–${VOUCHER_LIMITS.codeMax} ký tự, chỉ gồm chữ, số, "-" và "_".`)
    out.code = code
  }
  if (has('discount_type') || !partial) {
    if (raw.discount_type !== 'percent' && raw.discount_type !== 'fixed') badRequest('Loại giảm giá phải là "percent" hoặc "fixed".')
    out.discount_type = raw.discount_type
  }
  const type = out.discount_type ?? current?.discount_type
  if (has('discount_value') || !partial || has('discount_type')) {
    const source = has('discount_value') ? raw.discount_value : current?.discount_value
    out.discount_value =
      type === 'percent'
        ? intInRange(source, 'Phần trăm giảm', 1, 100)
        : intInRange(source, 'Số tiền giảm', 1_000, VOUCHER_LIMITS.fixedMax)
  }
  if (has('max_discount_value')) {
    out.max_discount_value =
      raw.max_discount_value === null || raw.max_discount_value === '' || raw.max_discount_value === 0
        ? null
        : intInRange(raw.max_discount_value, 'Giảm tối đa', 1_000, VOUCHER_LIMITS.fixedMax)
  }
  if (type === 'fixed' && (out.max_discount_value ?? null) !== null) out.max_discount_value = null // cap only applies to percent
  if (has('min_order_value') || !partial) out.min_order_value = has('min_order_value') ? intInRange(raw.min_order_value, 'Đơn tối thiểu', 0, VOUCHER_LIMITS.orderMax) : 0
  if (has('usage_limit') || !partial) out.usage_limit = has('usage_limit') ? intInRange(raw.usage_limit, 'Số lượt dùng', 0, VOUCHER_LIMITS.usageMax) : 0
  if (has('starts_at')) out.starts_at = dateOrNull(raw.starts_at, 'Ngày bắt đầu')
  if (has('ends_at')) out.ends_at = dateOrNull(raw.ends_at, 'Ngày kết thúc')
  if (has('active')) {
    if (typeof raw.active !== 'boolean') badRequest('Trạng thái phải là true/false.')
    out.active = raw.active
  }

  const starts = out.starts_at !== undefined ? out.starts_at : (current?.starts_at ?? null)
  const ends = out.ends_at !== undefined ? out.ends_at : (current?.ends_at ?? null)
  if (starts && ends && ends <= starts) badRequest('Ngày kết thúc phải sau ngày bắt đầu.')
  return out
}

/** Discount for a subtotal; percent discounts honour the optional cap. Never exceeds the subtotal. */
export function computeDiscount(
  v: { discount_type: 'percent' | 'fixed'; discount_value: number; max_discount_value?: number | null },
  subtotal: number
) {
  let d = v.discount_type === 'percent' ? Math.floor((subtotal * v.discount_value) / 100) : v.discount_value
  if (v.discount_type === 'percent' && v.max_discount_value) d = Math.min(d, v.max_discount_value)
  return Math.min(subtotal, Math.max(0, d))
}
