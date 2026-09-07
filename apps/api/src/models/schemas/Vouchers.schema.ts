import { ObjectId } from 'mongodb'

export type VoucherDiscountType = 'percent' | 'fixed'

export interface VoucherType {
  _id?: ObjectId
  code: string
  discount_type: VoucherDiscountType
  discount_value: number
  min_order_value?: number
  usage_limit?: number
  used_count?: number
  starts_at?: Date
  ends_at?: Date
  active?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class Voucher {
  _id?: ObjectId
  code: string
  discount_type: VoucherDiscountType
  discount_value: number
  min_order_value: number
  usage_limit: number
  used_count: number
  starts_at?: Date
  ends_at?: Date
  active: boolean
  created_at: Date
  updated_at: Date

  constructor(voucher: VoucherType) {
    const date = new Date()
    this._id = voucher._id || new ObjectId()
    this.code = voucher.code.trim().toUpperCase()
    this.discount_type = voucher.discount_type
    this.discount_value = Number(voucher.discount_value)
    this.min_order_value = Number(voucher.min_order_value || 0)
    this.usage_limit = Number(voucher.usage_limit || 0)
    this.used_count = Number(voucher.used_count || 0)
    this.starts_at = voucher.starts_at
    this.ends_at = voucher.ends_at
    this.active = voucher.active ?? true
    this.created_at = voucher.created_at || date
    this.updated_at = voucher.updated_at || date
  }
}
