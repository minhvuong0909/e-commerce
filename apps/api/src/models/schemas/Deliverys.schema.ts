import { ObjectId } from 'mongodb'
interface DeliveryType {
  _id?: ObjectId
  name: string
  description: string
  type: DeliveryMethodType
  created_at?: Date
  updated_at?: Date
}