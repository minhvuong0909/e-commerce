import { ObjectId } from 'mongodb'
interface CartItemsType {
  _id?: ObjectId
  cart_id: ObjectId
  product_id: ObjectId
  quantity: number
  created_at?: Date
  updated_at?: Date
}

export default class CartItems {
  _id?: ObjectId
  cart_id: ObjectId
  product_id: ObjectId
  quantity: number
  created_at: Date
  updated_at: Date
  constructor(cartItems: CartItemsType) {
    const date = new Date()
    this._id = cartItems._id || new ObjectId()
    this.cart_id = cartItems.cart_id
    this.product_id = cartItems.product_id
    this.quantity = cartItems.quantity
    this.created_at = cartItems.created_at || date
    this.updated_at = cartItems.updated_at || date
  }
}
