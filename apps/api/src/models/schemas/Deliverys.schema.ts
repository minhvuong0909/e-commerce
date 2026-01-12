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
