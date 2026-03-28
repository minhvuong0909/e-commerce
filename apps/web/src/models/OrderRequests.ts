import type { CartItem } from './CartRequests'

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  MOMO: 'MOMO',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export interface OrderItem {
  items: CartItem[]
  payment_method: PaymentMethod
  delivery_method_id: string
}

export type OrderApiResponse = {
  _id: string
  user_id: string
  delivery_method_id: string
  payment_method: string
  payment_status: number
  total_price: number
  shipping_fee: number
  status: number
  created_at: string
  updated_at: string
}
export type Status = 'all' | 'processing' | 'shipping' | 'done' | 'cancel'

export type OrderUI = {
  id: string
  code: string
  status: Exclude<Status, 'all'>
  statusLabel: string
  total: number
  subtotal: number
  shippingFee: number
  items: number
  date?: string
  paymentMethod: string
  createdAt?: string
  updatedAt?: string
  paymentStatusLabel?: string
  deliveryMethodId?: string
}
