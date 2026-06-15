import { ObjectId } from 'mongodb'
import { PaymentMethod } from '~/constants/enums'
import { escapeRegex } from './productQuery'

export { parsePagination as parseListPagination } from './productQuery'

function keywordRegex(search: string) {
  return { $regex: escapeRegex(search.trim()), $options: 'i' as const }
}

/** Tìm theo chuỗi ObjectId đầy đủ hoặc khớp một phần qua $toString. */
export function buildObjectIdOrConditions(
  search: string,
  fields: Array<'_id' | 'user_id'>
): Record<string, unknown>[] {
  const trimmed = search.trim()
  if (!trimmed) return []

  const conditions: Record<string, unknown>[] = []

  if (ObjectId.isValid(trimmed)) {
    for (const field of fields) {
      conditions.push({ [field]: new ObjectId(trimmed) })
    }
  }

  const partial = escapeRegex(trimmed)
  for (const field of fields) {
    conditions.push({
      $expr: {
        $regexMatch: {
          input: { $toString: `$${field}` },
          regex: partial,
          options: 'i'
        }
      }
    })
  }

  return conditions
}

export function buildBrandSearchFilter(search?: string): Record<string, unknown> {
  if (!search?.trim()) return {}

  const regex = keywordRegex(search)
  return {
    $or: [
      { name: regex },
      { desc: regex },
      { hotline: regex },
      { address: regex },
      ...buildObjectIdOrConditions(search, ['_id'])
    ]
  }
}

export function buildCategorySearchFilter(search?: string): Record<string, unknown> {
  if (!search?.trim()) return {}

  const regex = keywordRegex(search)
  return {
    $or: [
      { name: regex },
      { desc: regex },
      { description: regex },
      { slug: regex },
      ...buildObjectIdOrConditions(search, ['_id'])
    ]
  }
}

const PAYMENT_METHOD_BY_KEYWORD: Record<string, PaymentMethod> = {
  momo: PaymentMethod.MOMO,
  paypal: PaymentMethod.PAYPAL,
  credit: PaymentMethod.CREDIT_CARD,
  card: PaymentMethod.CREDIT_CARD,
  cod: PaymentMethod.CASH_ON_DELIVERY,
  cash: PaymentMethod.CASH_ON_DELIVERY
}

function resolvePaymentMethodMatch(search: string): PaymentMethod | undefined {
  const normalized = search.trim().toLowerCase()
  for (const [key, method] of Object.entries(PAYMENT_METHOD_BY_KEYWORD)) {
    if (normalized.includes(key)) return method
  }
  return undefined
}

export function buildOrderSearchFilter(search?: string): Record<string, unknown> {
  if (!search?.trim()) return {}

  const regex = keywordRegex(search)
  const or: Record<string, unknown>[] = [
    { payment_method: regex },
    { 'shipping_address.recipient_name': regex },
    { 'shipping_address.phone': regex },
    ...buildObjectIdOrConditions(search, ['_id', 'user_id'])
  ]

  const paymentMethod = resolvePaymentMethodMatch(search)
  if (paymentMethod) {
    or.unshift({ payment_method: paymentMethod })
  }

  return { $or: or }
}

/** Pipeline $facet: một query lấy data + totalItems. */
export function buildPaginatedFacetStages(skip: number, limit: number) {
  return {
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      meta: [{ $count: 'totalItems' }]
    }
  }
}

export function extractFacetResult<T>(result: { data?: T[]; meta?: Array<{ totalItems: number }> }) {
  const totalItems = result.meta?.[0]?.totalItems ?? 0
  return {
    data: result.data ?? [],
    totalItems
  }
}
