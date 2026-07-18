export interface ShippingAddress {
  recipient_name: string
  phone: string
  note?: string
  address_line: string
  city?: string
  district?: string
  lat?: number
  lng?: number
  distance_km?: number
  address_source?: 'manual' | 'map'
}

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  MOMO: 'MOMO',
  PAYOS: 'PAYOS',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export interface CreateOrderPayload extends ShippingAddress {
  items: string[]
  payment_method: PaymentMethod
  delivery_method_id: string
  lat: number
  lng: number
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
  items: unknown[]
}
export type OrderFilterStatus = 'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'

/** @deprecated Use OrderFilterStatus — kept as alias for imports */
export type Status = OrderFilterStatus

export type OrderBadgeTone = 'processing' | 'shipping' | 'done' | 'cancel'

export type OrderUI = {
  id: string
  code: string
  status: OrderBadgeTone
  statusLabel: string
  rawStatus: number
  total: number
  subtotal: number
  shippingFee: number
  shippingAddress?: ShippingAddress
  items: unknown[]
  date?: string
  paymentMethod: string
  rawPaymentMethod?: string
  rawPaymentStatus?: number
  createdAt?: string
  updatedAt?: string
  paymentStatusLabel?: string
  deliveryMethodId?: string
}
