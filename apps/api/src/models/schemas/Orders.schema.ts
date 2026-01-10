import { ObjectId } from 'mongodb'
import { OrderStatus } from '~/constants/enums'

interface OrderType {
  _id?: ObjectId
  user_id: ObjectId
  total_price: number
  shipping_fee: number
  status: OrderStatus
  created_at?: Date
  updated_at?: Date
}

export default class Order {
  _id?: ObjectId
  user_id: ObjectId
  total_price: number
  shipping_fee: number
  status: OrderStatus
  created_at: Date
  updated_at: Date
  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id || new ObjectId()
    this.user_id = order.user_id
    this.total_price = order.total_price
    this.shipping_fee = order.shipping_fee
    this.status = order.status
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
  }
}
