import type { Status } from '../models/OrderRequests'

const TABS: { label: string; value: Status }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn tất', value: 'done' },
  { label: 'Đã hủy', value: 'cancel' }
] as const

const VALID_STATUS: Status[] = ['all', 'processing', 'shipping', 'done', 'cancel'] as const
export type OrderStatus = Exclude<Status, 'all'>

// Mã trạng thái đơn hàng khớp enum OrderStatus phía backend
export const ORDER_STATUS_CODE = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 4
} as const

export interface OrderStatusMeta {
  tone: OrderStatus
  label: string
  /** Giá trị dùng để lọc theo tab */
  filter: OrderStatus
}

const ORDER_STATUS_META: Record<number, OrderStatusMeta> = {
  [ORDER_STATUS_CODE.PENDING]: { tone: 'processing', label: 'Đang xử lý', filter: 'processing' },
  [ORDER_STATUS_CODE.CONFIRMED]: { tone: 'shipping', label: 'Đã xác nhận', filter: 'shipping' },
  [ORDER_STATUS_CODE.SHIPPED]: { tone: 'shipping', label: 'Đang giao hàng', filter: 'shipping' },
  [ORDER_STATUS_CODE.DELIVERED]: { tone: 'done', label: 'Đã giao', filter: 'done' },
  [ORDER_STATUS_CODE.CANCELLED]: { tone: 'cancel', label: 'Đã hủy', filter: 'cancel' }
}

/** Trả về thông tin hiển thị (tone + nhãn) cho một mã trạng thái đơn hàng. */
export function getOrderStatusMeta(status: number): OrderStatusMeta {
  return ORDER_STATUS_META[status] ?? { tone: 'processing', label: 'Không xác định', filter: 'processing' }
}

export { TABS, VALID_STATUS }
