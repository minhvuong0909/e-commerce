import { ObjectId } from 'mongodb'
import { DeliveryMethodType, DeliveryStatus } from '~/constants/enums'
interface DeliveryType {
  _id?: ObjectId
  name: string
  description: string
  type: DeliveryMethodType
  status: DeliveryStatus
  created_at?: Date
  updated_at?: Date
}

export default class Delivery {
  _id?: ObjectId
  name: string
  description: string
  type: DeliveryMethodType
  status: DeliveryStatus
  created_at: Date
  updated_at: Date
  constructor(delivery: DeliveryType) {
    const date = new Date()
    this._id = delivery._id || new ObjectId()
    this.name = delivery.name
    this.description = delivery.description
    this.type = delivery.type
    this.status = delivery.status
    this.created_at = delivery.created_at || date
    this.updated_at = delivery.updated_at || date
  }
}