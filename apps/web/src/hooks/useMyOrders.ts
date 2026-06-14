import { useQuery } from '@tanstack/react-query'
import { getOrderStatusMeta } from '../constants/order'
import type { OrderApiResponse, OrderUI } from '../models/OrderRequests'
import { getMyOrdersApi } from '../services/orders.services'

export const MY_ORDERS_QUERY_KEY = ['my-orders'] as const

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

const createOrderCode = (id: string) => `#${id.slice(-6).toUpperCase()}`

const mapOrders = (rawOrders: OrderApiResponse[]): OrderUI[] =>
  rawOrders.map((order) => {
    const statusData = getOrderStatusMeta(order.status)
    return {
      id: order._id,
      code: createOrderCode(order._id),
      status: statusData.filter,
      statusLabel: statusData.label,
      subtotal: order.total_price,
      shippingFee: order.shipping_fee,
      total: order.total_price,
      items: order.items || [],
      date: formatDate(order.created_at),
      paymentMethod: order.payment_method
    }
  })

export const useMyOrders = () => {
  return useQuery({
    queryKey: MY_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await getMyOrdersApi()
      const rawOrders: OrderApiResponse[] = Array.isArray(res) ? res : res?.data?.result || []
      return mapOrders(rawOrders)
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000
  })
}
