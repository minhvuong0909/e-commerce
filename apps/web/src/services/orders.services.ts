import api from '../configs/api'

import type { CreateOrderPayload } from '../models/OrderRequests'
import type { PaginationMeta } from '../models/Pagination'

export const createOrderApi = (data: CreateOrderPayload) => {
  return api.post('/orders/create', data)
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