import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import Voucher, { VoucherType } from '~/models/schemas/Vouchers.schema'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from './database.service'

class VoucherService {
  async list() {
    return databaseService.vouchers.find({}).sort({ created_at: -1 }).toArray()
  }

  async create(payload: VoucherType) {
    const code = payload.code?.trim().toUpperCase()
    if (!code) {
      throw new ErrorWithStatus({ message: 'Voucher code is required', status: HTTP_STATUS.BAD_REQUEST })
    }
    const existed = await databaseService.vouchers.findOne({ code })
    if (existed) {
      throw new ErrorWithStatus({ message: 'Voucher code already exists', status: HTTP_STATUS.BAD_REQUEST })
    }
    const voucher = new Voucher({ ...payload, code })
    await databaseService.vouchers.insertOne(voucher)
    return voucher
  }

  async validate(code: string, subtotal: number) {
    const voucher = await databaseService.vouchers.findOne({ code: code.trim().toUpperCase(), active: true })
    if (!voucher) {
      throw new ErrorWithStatus({ message: 'Mã giảm giá không hợp lệ', status: HTTP_STATUS.NOT_FOUND })
    }
    const now = new Date()
    if (voucher.starts_at && new Date(voucher.starts_at) > now) {
      throw new ErrorWithStatus({ message: 'Mã giảm giá chưa bắt đầu', status: HTTP_STATUS.BAD_REQUEST })
    }
    if (voucher.ends_at && new Date(voucher.ends_at) < now) {
      throw new ErrorWithStatus({ message: 'Mã giảm giá đã hết hạn', status: HTTP_STATUS.BAD_REQUEST })
    }
    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      throw new ErrorWithStatus({ message: 'Mã giảm giá đã hết lượt sử dụng', status: HTTP_STATUS.BAD_REQUEST })
    }
    if (subtotal < voucher.min_order_value) {
      throw new ErrorWithStatus({ message: 'Đơn hàng chưa đạt giá trị tối thiểu', status: HTTP_STATUS.BAD_REQUEST })
    }

    const rawDiscount =
      voucher.discount_type === 'percent' ? Math.floor((subtotal * voucher.discount_value) / 100) : voucher.discount_value
    const discount = Math.min(subtotal, Math.max(0, rawDiscount))
    return { voucher, discount, final_subtotal: subtotal - discount }
  }

  async markUsed(voucherId?: ObjectId) {
    if (!voucherId) return
    await databaseService.vouchers.updateOne({ _id: voucherId }, { $inc: { used_count: 1 }, $set: { updated_at: new Date() } })
  }
}

const voucherService = new VoucherService()
export default voucherService
