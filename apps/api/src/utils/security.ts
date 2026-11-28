import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export function badRequest(message: string): never {
  throw new ErrorWithStatus({ message, status: HTTP_STATUS.BAD_REQUEST })
}

/** Canonical IDs + strict integer quantities; never silently coerce an invalid order. */
export function normalizeOrderItems(input: unknown): Array<{ product_id: string; quantity: number }> {
  if (!Array.isArray(input) || input.length === 0 || input.length > 100)
    badRequest('Đơn hàng phải có từ 1 đến 100 dòng sản phẩm.')
  const quantities = new Map<string, number>()
  for (const item of input) {
    if (!item || typeof item.product_id !== 'string' || !ObjectId.isValid(item.product_id))
      badRequest('Mã sản phẩm không hợp lệ.')
    if (
      typeof item.quantity !== 'number' ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 1000
    )
      badRequest('Số lượng phải là số nguyên từ 1 đến 1000.')
    const id = new ObjectId(item.product_id).toHexString()
    const total = (quantities.get(id) ?? 0) + item.quantity
    if (total > 1000) badRequest('Số lượng sản phẩm vượt giới hạn.')
    quantities.set(id, total)
  }
  return Array.from(quantities, ([product_id, quantity]) => ({ product_id, quantity }))
}
