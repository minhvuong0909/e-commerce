import api from '../configs/api'

import type { CreateGuestOrderPayload, CreateOrderPayload } from '../models/OrderRequests'
import type { PaginationMeta } from '../models/Pagination'

/**
 * `idempotencyKey` must stay the same for every retry of one checkout attempt, so a double click,
 * a slow network retry or a lost response returns the same order instead of creating a second one.
 */
const idempotencyHeaders = (idempotencyKey?: string) =>
  idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined

export const createOrderApi = (data: CreateOrderPayload, idempotencyKey?: string) => {
  return api.post('/orders/create', data, idempotencyHeaders(idempotencyKey))
}

export const createGuestOrderApi = (data: CreateGuestOrderPayload, idempotencyKey?: string) => {
  return api.post('/orders/guest', data, idempotencyHeaders(idempotencyKey))
}

/** Random key for one checkout attempt (falls back when crypto.randomUUID is unavailable, e.g. non-HTTPS). */
export function newCheckoutKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export const getMyOrdersApi = () => {
  return api.get('/orders/me/my-orders')
}

export const getOrderByIdApi = (id: string) => {
  return api.get(`/orders/${id}`)
}

export type OrdersListResponse = {
  result: import('../models/OrderRequests').OrderApiResponse[]
  pagination?: PaginationMeta
}

export const getAllOrdersApi = (limit: number, page: number, search?: string) => {
  const params: Record<string, string | number> = { limit, page }
  if (search?.trim()) params.search = search.trim()
  return api.get<OrdersListResponse>('/orders/all/all-orders', { params })
}

export const updateOrderStatusApi = (orderId: string, status: string) => {
  return api.patch(`/orders/status/${orderId}`, { status })
}

export const cancelOrderApi = (orderId: string) => {
  return api.delete(`/orders/${orderId}`)
}

export const refundOrderApi = (orderId: string) => {
  return api.post(`/orders/${orderId}/refund`)
}

export type DashboardSummary = {
  range: { from: string; to: string; days: number; timezone: string }
  revenue: number
  revenue_excl_shipping: number
  recognized_orders: number
  avg_order_value: number
  open_orders: number
  open_value: number
  total_orders: number
  by_status: Record<'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled', number>
  series: Array<{ date: string; revenue: number; orders: number }>
  previous: { revenue: number; recognized_orders: number; total_orders: number }
  change: { revenue: number | null; recognized_orders: number | null; total_orders: number | null }
  top_products: Array<{ _id: string; name?: string; thumbnail?: string; units: number; revenue: number }>
  low_stock: { threshold: number; items: Array<{ _id: string; name: string; quantity: number; thumbnail?: string }> }
  catalog: { products: number; customers: number }
  anomalies: Record<
    'paid_but_cancelled' | 'delivered_unpaid_online',
    { count: number; amount: number; order_ids: string[] }
  >
}

/** [Admin/Staff] Server-computed dashboard figures over every order in the range (dates: YYYY-MM-DD, VN time). */
export const getDashboardSummaryApi = (from: string, to: string) =>
  api.get<{ message: string; result: DashboardSummary }>('/orders/stats/summary', { params: { from, to } })
