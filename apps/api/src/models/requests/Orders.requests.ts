import { PaymentMethod } from '~/constants/enums'

export interface ShippingAddressInput {
  recipient_name: string
  phone: string
  note?: string
  address_line: string
  city?: string
  district?: string
  lat: number
  lng: number
  address_source?: 'manual' | 'map'
}

export interface CreateOrderReqBody extends ShippingAddressInput {
  payment_method: PaymentMethod
  delivery_method_id: string
}
