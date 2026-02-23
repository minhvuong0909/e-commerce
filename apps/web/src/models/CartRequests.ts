import type { Product } from './ProductRequests'

export interface CartItem {
  _id: string
  cart_id: string
  quantity: number
  product_infor: Product
}
