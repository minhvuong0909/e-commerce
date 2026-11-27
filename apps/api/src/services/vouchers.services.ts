import { ClientSession, ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import Voucher from '~/models/schemas/Vouchers.schema'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from './database.service'
import { computeDiscount, parseVoucherInput } from '~/utils/voucherInput'
import { isDuplicateKeyError } from '~/utils/idempotency'
import { badRequest } from '~/utils/security'

const notFound = () => new ErrorWithStatus({ message: 'Không tìm thấy voucher.', status: HTTP_STATUS.NOT_FOUND })
const duplicateCode = () => new ErrorWithStatus({ message: 'Mã voucher đã tồn tại.', status: HTTP_STATUS.CONFLICT })

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) badRequest('Mã voucher không hợp lệ.')
  return new ObjectId(id)
}

class VoucherService {
  async list() {
    return databaseService.vouchers.find({}).sort({ created_at: -1 }).toArray()
  }

  async create(body: unknown) {
    const input = parseVoucherInput(body)
    const voucher = new Voucher({
      code: input.code!,
      discount_type: input.discount_type!,
      discount_value: input.discount_value!,
      max_discount_value: input.max_discount_value ?? null,
      min_order_value: input.min_order_value,
      usage_limit: input.usage_limit,
      starts_at: input.starts_at ?? undefined,
      ends_at: input.ends_at ?? undefined,
      active: input.active ?? true
    })
    try {
      await databaseService.vouchers.insertOne(voucher)
    } catch (error) {
      if (isDuplicateKeyError(error)) throw duplicateCode()
      throw error
    }
    return voucher
  }

  async update(id: string, body: unknown) {
    const _id = toObjectId(id)
    const current = await databaseService.vouchers.findOne({ _id })
    if (!current) throw notFound()
    const input = parseVoucherInput(body, {
      partial: true,
      current: { ...current, max_discount_value: current.max_discount_value ?? null }
    })
    if (input.code && input.code !== current.code && current.used_count > 0)
      badRequest('Không thể đổi mã của voucher đã được sử dụng.')
    if (input.usage_limit !== undefined && input.usage_limit > 0 && input.usage_limit < current.used_count)
      badRequest(`Số lượt dùng không thể nhỏ hơn số lượt đã dùng (${current.used_count}).`)
    try {
      const updated = await databaseService.vouchers.findOneAndUpdate(
        { _id },
        { $set: { ...input, updated_at: new Date() } },
        { returnDocument: 'after' }
      )
      if (!updated) throw notFound()
      return updated
    } catch (error) {
      if (isDuplicateKeyError(error)) throw duplicateCode()
      throw error
    }
  }

  /** Only never-used vouchers can be deleted; used ones stay for order history and are deactivated instead. */
  async remove(id: string) {
    const _id = toObjectId(id)
    const result = await databaseService.vouchers.deleteOne({ _id, used_count: { $lte: 0 } })
    if (result.deletedCount === 1) return { deleted: true }
    const exists = await databaseService.vouchers.findOne({ _id }, { projection: { _id: 1 } })
    if (!exists) throw notFound()
    badRequest('Voucher đã được sử dụng nên không thể xóa. Hãy tắt voucher thay vì xóa.')
  }

  async validate(code: string, subtotal: number, session?: ClientSession) {
    if (typeof code !== 'string' || code.length > 64 || !Number.isFinite(subtotal) || subtotal < 0)
      throw new ErrorWithStatus({ message: 'Dữ liệu voucher không hợp lệ.', status: HTTP_STATUS.BAD_REQUEST })
    const voucher = await databaseService.vouchers.findOne(
      { code: code.trim().toUpperCase(), active: true },
      { session }
    )
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
      throw new ErrorWithStatus({
        message: `Đơn hàng cần tối thiểu ${voucher.min_order_value.toLocaleString('vi-VN')}đ để dùng mã này`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const discount = computeDiscount(voucher, subtotal)
    return { voucher, discount, final_subtotal: subtotal - discount }
  }

  async markUsed(voucherId?: ObjectId, session?: ClientSession) {
    if (!voucherId) return
    const result = await databaseService.vouchers.updateOne(
      {
        _id: voucherId,
        active: true,
        $or: [{ usage_limit: { $lte: 0 } }, { $expr: { $lt: ['$used_count', '$usage_limit'] } }]
      },
      { $inc: { used_count: 1 }, $set: { updated_at: new Date() } },
      { session }
    )
    if (result.modifiedCount !== 1)
      throw new ErrorWithStatus({ message: 'Mã giảm giá đã hết lượt sử dụng.', status: HTTP_STATUS.BAD_REQUEST })
  }
}

const voucherService = new VoucherService()
export default voucherService
