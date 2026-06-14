export interface ShippingAddress {
  recipient_name: string
  phone: string
  address_line: string
  city?: string
  district?: string
}

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  MOMO: 'MOMO',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export interface CreateOrderPayload extends ShippingAddress {
  items: string[]
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
  shipping_address?: ShippingAddress
  created_at: string
  updated_at: string
  items: any[]
}
export type Status = 'all' | 'processing' | 'shipping' | 'done' | 'cancel'

export type OrderUI = {
  id: string
  code: string
  status: Exclude<Status, 'all'>
  statusLabel: string
  rawStatus?: number
  total: number
  subtotal: number
  shippingFee: number
  shippingAddress?: ShippingAddress
  items: any[]
  date?: string
  paymentMethod: string
  rawPaymentMethod?: string
  rawPaymentStatus?: number
  createdAt?: string
  updatedAt?: string
  paymentStatusLabel?: string
  deliveryMethodId?: string
}
