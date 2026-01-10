import { ObjectId } from 'mongodb'
import { CartStatus } from '~/constants/enums'
interface CartType {
  _id?: ObjectId
  user_id: ObjectId
  status: CartStatus
  created_at?: Date
  updated_at?: Date
}

export default class Cart {
  _id?: ObjectId
  user_id: ObjectId
  status: CartStatus
  created_at: Date
  updated_at: Date
  constructor(cart: CartType) {
    const date = new Date()
    this._id = cart._id || new ObjectId()
    this.user_id = cart.user_id
    this.status = cart.status || CartStatus.ACTIVE
    this.created_at = cart.created_at || date
    this.updated_at = cart.updated_at || date
  }
}
