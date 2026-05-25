import { ObjectId } from 'mongodb'
import { PaymentStatus } from '~/constants/enums'

interface PaymentType {
  _id?: ObjectId
  order_id: ObjectId
  user_id: ObjectId
  amount: number
  payment_method: string // MOMO, COD, PAYPAL
  payment_status: PaymentStatus
  gateway_trans_id?: string // transId của MoMo hoặc PayPal OrderID
  raw_gateway_response?: any // Lưu toàn bộ JSON response từ Gateway để đối soát
  created_at?: Date
  updated_at?: Date
}

export default class Payment {
  _id?: ObjectId
  order_id: ObjectId
  user_id: ObjectId
  amount: number
  payment_method: string
  payment_status: PaymentStatus
  gateway_trans_id?: string
  raw_gateway_response?: any
  created_at: Date
  updated_at: Date

  constructor(payment: PaymentType) {
    const date = new Date()
    this._id = payment._id || new ObjectId()
    this.order_id = payment.order_id
    this.user_id = payment.user_id
    this.amount = payment.amount
    this.payment_method = payment.payment_method
    this.payment_status = payment.payment_status
    this.gateway_trans_id = payment.gateway_trans_id
    this.raw_gateway_response = payment.raw_gateway_response
    this.created_at = payment.created_at || date
    this.updated_at = payment.updated_at || date
  }
}
