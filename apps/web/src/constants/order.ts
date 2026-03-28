import type { Status } from '../models/OrderRequests'

const TABS: { label: string; value: Status; key: number }[] = [
  { label: 'Tất cả', value: 'all', key: 4 },
  { label: 'Đang xử lý', value: 'processing', key: 0 },
  { label: 'Đang giao', value: 'shipping', key: 1 },
  { label: 'Hoàn tất', value: 'done', key: 2 },
  { label: 'Đã hủy', value: 'cancel', key: 3 }
] as const

const VALID_STATUS: Status[] = ['all', 'processing', 'shipping', 'done', 'cancel'] as const
export type OrderStatus = Exclude<Status, 'all'>
export { TABS, VALID_STATUS }
