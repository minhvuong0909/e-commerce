import { OrderStatus } from '~/constants/enums'

/**
 * Bảng chuyển trạng thái đơn hàng hợp lệ.
 * Pending → Confirmed | Cancelled
 * Confirmed → Shipped | Cancelled
 * Shipped → Delivered
 * Delivered / Cancelled là trạng thái cuối (không chuyển tiếp).
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.Shipped]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: []
}

/** Kiểm tra một giá trị có phải là OrderStatus hợp lệ không. */
export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'number' && Number.isInteger(value) && value in ALLOWED_ORDER_TRANSITIONS
}

/** Kiểm tra có được phép chuyển từ trạng thái `from` sang `to` không. */
export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_ORDER_TRANSITIONS[from]?.includes(to) ?? false
}
