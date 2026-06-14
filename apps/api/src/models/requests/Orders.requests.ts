import { PaymentMethod } from '~/constants/enums'

export interface ShippingAddressInput {
  recipient_name: string
  phone: string
  address_line: string
  city?: string
  district?: string
}

export interface CreateOrderReqBody extends ShippingAddressInput {
  payment_method: PaymentMethod
  delivery_method_id: string
}
