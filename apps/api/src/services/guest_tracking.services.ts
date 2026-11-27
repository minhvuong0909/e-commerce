import { ObjectId, type Filter } from 'mongodb'
import type Order from '~/models/schemas/Orders.schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { badRequest } from '~/utils/security'
import databaseService from './database.service'

/** Same answer whether the code is unknown or the phone does not match — no account/order enumeration. */
const NOT_FOUND = 'Không tìm thấy đơn hàng khớp mã và số điện thoại. Kiểm tra lại thông tin bạn đã nhập.'

/** "#d51dd5", "D51DD5" or a full 24-hex id → upper-case hex; anything else is rejected. */
export function normalizeOrderCode(raw: unknown): string {
  const code = typeof raw === 'string' ? raw.trim().replace(/^#/, '').toUpperCase() : ''
  if (!/^[0-9A-F]{6}$/.test(code) && !/^[0-9A-F]{24}$/.test(code)) badRequest('Mã đơn gồm 6 ký tự, ví dụ #D51DD5.')
  return code
}

/** Digits only, "+84 90…" / "84 90…" → "090…". */
export function normalizePhone(raw: unknown): string {
  let digits = typeof raw === 'string' ? raw.replace(/\D/g, '') : ''
  if (digits.startsWith('84') && digits.length >= 11) digits = '0' + digits.slice(2)
  if (digits.length < 9 || digits.length > 12) badRequest('Số điện thoại không hợp lệ.')
  return digits
}

export const maskName = (name?: string) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i, all) => (i === all.length - 1 ? w : `${w[0]}***`))
    .join(' ')

export const maskPhone = (phone?: string) => {
  const d = (phone ?? '').replace(/\D/g, '')
  return d.length >= 4 ? `****${d.slice(-4)}` : '****'
}

type GuestOrderDoc = {
  _id: ObjectId
  user_id?: ObjectId | null
  guest_customer?: { name?: string; phone?: string }
  shipping_address?: { recipient_name?: string; phone?: string; district?: string; city?: string }
  status: number
  payment_method: string
  payment_status: number
  total_price: number
  shipping_fee: number
  created_at: Date
  updated_at: Date
}

const phonesOf = (o: GuestOrderDoc) =>
  [o.guest_customer?.phone, o.shipping_address?.phone].filter(Boolean).map((p) => String(p).replace(/\D/g, '').replace(/^84(?=\d{9,})/, '0'))

class GuestTrackingService {
  async track(rawCode: unknown, rawPhone: unknown) {
    const code = normalizeOrderCode(rawCode)
    const phone = normalizePhone(rawPhone)

    // Guest orders only: account orders are viewed after signing in.
    const filter =
      code.length === 24
        ? { _id: new ObjectId(code), user_id: null }
        : { user_id: null, $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${code}$`, options: 'i' } } }

    // guest orders are stored with user_id: null, which the typed Filter does not model
    const candidates = (await databaseService.orders
      .find(filter as unknown as Filter<Order>)
      .limit(10)
      .toArray()) as unknown as GuestOrderDoc[]
    const order = candidates.find((o) => phonesOf(o).includes(phone))
    if (!order) throw new ErrorWithStatus({ message: NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

    const lines = await databaseService.order_items.find({ order_id: order._id }).toArray()
    const products = await databaseService.products
      .find({ _id: { $in: lines.map((l) => l.product_id) } }, { projection: { name: 1, thumbnail: 1 } })
      .toArray()
    const byId = new Map(products.map((p) => [String(p._id), p]))

    return {
      code: `#${String(order._id).slice(-6).toUpperCase()}`,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      total_price: order.total_price,
      shipping_fee: order.shipping_fee,
      created_at: order.created_at,
      updated_at: order.updated_at,
      recipient: {
        name: maskName(order.shipping_address?.recipient_name || order.guest_customer?.name),
        phone: maskPhone(order.shipping_address?.phone || order.guest_customer?.phone),
        area: [order.shipping_address?.district, order.shipping_address?.city].filter(Boolean).join(', ')
      },
      items: lines.map((l) => ({
        name: byId.get(String(l.product_id))?.name ?? 'Sản phẩm',
        thumbnail: byId.get(String(l.product_id))?.thumbnail,
        quantity: l.quantity,
        price: l.price
      }))
    }
  }
}

const guestTrackingService = new GuestTrackingService()
export default guestTrackingService
