import { useQuery } from '@tanstack/react-query'
import { getOrderStatusMeta, mapPaymentMethod, mapPaymentStatus } from '../constants/order'
import type { OrderApiResponse, OrderBadgeTone, OrderUI } from '../models/OrderRequests'
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
      status: statusData.tone as OrderBadgeTone,
      statusLabel: statusData.label,
      rawStatus: order.status,
      subtotal: order.total_price - (order.shipping_fee ?? 0),
      shippingFee: order.shipping_fee ?? 0,
      total: order.total_price,
      items: order.items || [],
      date: formatDate(order.created_at),
      paymentMethod: mapPaymentMethod(order.payment_method),
      rawPaymentMethod: order.payment_method,
      rawPaymentStatus: order.payment_status,
      paymentStatusLabel: mapPaymentStatus(order.payment_status),
      deliveryMethodId: order.delivery_method_id,
      createdAt: order.created_at,
      updatedAt: order.updated_at
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
