import api from '../configs/api'

import type { CreateOrderPayload } from '../models/OrderRequests'

export const createOrderApi = (data: CreateOrderPayload) => {
  return api.post('/orders/create', data)
}

export const getMyOrdersApi = () => {
  return api.get('/orders/me/my-orders')
}

export const getOrderByIdApi = (id: string) => {
  return api.get(`/orders/${id}`)
}

export const getAllOrdersApi = (limit: number, page: number) => {
  return api.get('/orders/all/all-orders', {
    params: {
      limit,
      page
    }
  })
}

export const updateOrderStatusApi = (orderId: string, status: string) => {
  return api.patch(`/orders/status/${orderId}`, { status })
}

export const cancelOrderApi = (orderId: string) => {
  return api.delete(`/orders/${orderId}`)
}