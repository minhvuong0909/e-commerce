import type { OrderBadgeTone, OrderFilterStatus } from '../models/OrderRequests'

const TABS: { label: string; value: OrderFilterStatus }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn tất', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' }
] as const

const VALID_STATUS: OrderFilterStatus[] = [
  'all',
  'pending',
  'processing',
  'shipping',
  'completed',
  'cancelled'
] as const

/** Map legacy query params from older tabs */
const LEGACY_STATUS_MAP: Record<string, OrderFilterStatus> = {
  done: 'completed',
  cancel: 'cancelled'
}

export function parseOrderFilterStatus(value: string | null): OrderFilterStatus {
  if (!value) return 'all'
  if (VALID_STATUS.includes(value as OrderFilterStatus)) return value as OrderFilterStatus
  return LEGACY_STATUS_MAP[value] ?? 'all'
}

export type OrderStatus = Exclude<OrderFilterStatus, 'all'>

// Mã trạng thái đơn hàng khớp enum OrderStatus phía backend
export const ORDER_STATUS_CODE = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 4
} as const

export interface OrderStatusMeta {
  tone: OrderBadgeTone
  label: string
  filter: OrderStatus
}

const ORDER_STATUS_META: Record<number, OrderStatusMeta> = {
  [ORDER_STATUS_CODE.PENDING]: { tone: 'processing', label: 'Chờ xác nhận', filter: 'pending' },
  [ORDER_STATUS_CODE.CONFIRMED]: { tone: 'processing', label: 'Đang xử lý', filter: 'processing' },
  [ORDER_STATUS_CODE.SHIPPED]: { tone: 'shipping', label: 'Đang giao hàng', filter: 'shipping' },
  [ORDER_STATUS_CODE.DELIVERED]: { tone: 'done', label: 'Đã giao', filter: 'completed' },
  [ORDER_STATUS_CODE.CANCELLED]: { tone: 'cancel', label: 'Đã hủy', filter: 'cancelled' }
}

export const ORDER_FILTER_STATUS_CODE: Record<OrderStatus, number> = {
  pending: ORDER_STATUS_CODE.PENDING,
  processing: ORDER_STATUS_CODE.CONFIRMED,
  shipping: ORDER_STATUS_CODE.SHIPPED,
  completed: ORDER_STATUS_CODE.DELIVERED,
  cancelled: ORDER_STATUS_CODE.CANCELLED
}

/** Trả về thông tin hiển thị (tone + nhãn) cho một mã trạng thái đơn hàng. */
export function getOrderStatusMeta(status: number): OrderStatusMeta {
  return ORDER_STATUS_META[status] ?? { tone: 'processing', label: 'Không xác định', filter: 'processing' }
}

export function orderMatchesFilter(rawStatus: number, filter: OrderFilterStatus): boolean {
  if (filter === 'all') return true
  return rawStatus === ORDER_FILTER_STATUS_CODE[filter]
}

export function mapPaymentStatus(status: number): string {
  switch (status) {
    case 0:
      return 'Chưa thanh toán'
    case 1:
      return 'Đã thanh toán'
    case 2:
      return 'Thanh toán thất bại'
    case 3:
      return 'Đã hoàn tiền'
    default:
      return 'Không xác định'
  }
}

export function mapPaymentMethod(method: string): string {
  switch (method) {
    case 'CASH_ON_DELIVERY':
      return 'COD'
    case 'CREDIT_CARD':
      return 'Thẻ tín dụng'
    case 'PAYPAL':
      return 'PayPal'
    case 'MOMO':
      return 'MoMo'
    default:
      return method ? String(method).replaceAll('_', ' ') : '—'
  }
}

export const ORDER_BADGE_CLASS: Record<OrderBadgeTone, string> = {
  processing: '!border-amber-200/90 !bg-amber-50 !text-amber-900',
  shipping: '!border-violet-200/90 !bg-violet-50 !text-violet-900',
  done: '!border-emerald-200/90 !bg-emerald-50 !text-emerald-800',
  cancel: '!border-rose-200/90 !bg-rose-50 !text-rose-800'
}

export { TABS, VALID_STATUS }
