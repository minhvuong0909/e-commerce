import { ObjectId } from 'mongodb'
interface OrderItemsType {
  _id?: ObjectId
  order_id: ObjectId
  product_id: ObjectId
  quantity: number
  price: number
  created_at?: Date
  updated_at?: Date
}

export default class OrderItems {
  _id?: ObjectId
  order_id: ObjectId
  product_id: ObjectId
  quantity: number
  price: number
  created_at: Date
  updated_at: Date
  constructor(orderItems: OrderItemsType) {
    const date = new Date()
    this._id = orderItems._id || new ObjectId()
    this.order_id = orderItems.order_id
    this.product_id = orderItems.product_id
    this.quantity = orderItems.quantity
    this.price = orderItems.price
    this.created_at = orderItems.created_at || date
    this.updated_at = orderItems.updated_at || date
  }
}
