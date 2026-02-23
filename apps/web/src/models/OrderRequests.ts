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
