import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { PaymentMethod, PRODUCT_STATUS } from '~/constants/enums'
const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  products: vi.fn(),
  reserve: vi.fn(),
  insert: vi.fn(),
  lines: vi.fn(),
  voucher: vi.fn(),
  consume: vi.fn(),
  delivery: vi.fn(),
  quote: vi.fn()
}))
vi.mock('../database.service', () => ({
  default: {
    withTransaction: mocks.transaction,
    delivery_methods: { findOne: mocks.delivery },
    products: { find: mocks.products, updateOne: mocks.reserve },
    orders: { insertOne: mocks.insert },
    order_items: { insertMany: mocks.lines }
  }
}))
vi.mock('../shipping.services', () => ({ default: { getShippingQuote: mocks.quote } }))
vi.mock('../vouchers.services', () => ({ default: { validate: mocks.voucher, markUsed: mocks.consume } }))
vi.mock('../telegram.services', () => ({ default: {} }))
vi.mock('~/config/mail', () => ({ createMailTransporter: () => ({ sendMail: vi.fn() }) }))
vi.mock('~/config/payment', () => ({ payos: {} }))
import ordersService from '../orders.services'

describe('order reservation boundaries', () => {
  const productId = new ObjectId(),
    deliveryId = new ObjectId(),
    session = { testSession: true }
  const payload = () => ({
    delivery_method_id: deliveryId.toHexString(),
    payment_method: PaymentMethod.CASH_ON_DELIVERY,
    recipient_name: 'Test',
    phone: '0900000000',
    address_line: 'Test address',
    lat: 10,
    lng: 106,
    items: [{ product_id: productId.toHexString(), quantity: 1 }]
  })
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ordersService as any, 'sendOrderConfirmationEmail').mockResolvedValue(undefined)
    vi.spyOn(ordersService as any, 'sendTelegramOrderNotification').mockResolvedValue(undefined)
    mocks.transaction.mockImplementation((work) => work(session))
    mocks.products.mockReturnValue({
      toArray: async () => [{ _id: productId, price: 100000, status: PRODUCT_STATUS.Active }]
    })
    mocks.reserve.mockResolvedValue({ modifiedCount: 1 })
    mocks.delivery.mockResolvedValue({ _id: deliveryId })
    mocks.quote.mockResolvedValue({ shipping_fee: 20000, lat: 10, lng: 106, distance_km: 1 })
    mocks.insert.mockResolvedValue({ insertedId: new ObjectId() })
    mocks.lines.mockResolvedValue({})
    mocks.consume.mockResolvedValue(undefined)
  })
  it('aggregates duplicate lines and reserves once inside the transaction', async () => {
    const body = payload()
    body.items.push({ product_id: productId.toHexString(), quantity: 2 })
    await ordersService.createGuestOrder(body)
    expect(mocks.reserve).toHaveBeenCalledOnce()
    expect(mocks.reserve.mock.calls[0][0].quantity).toEqual({ $gte: 3 })
    expect(mocks.reserve.mock.calls[0][1].$inc.quantity).toBe(-3)
    expect(mocks.reserve.mock.calls[0][2]).toEqual({ session })
    expect(mocks.insert.mock.calls[0][0].total_price).toBe(320000)
    expect(mocks.insert.mock.calls[0][1]).toEqual({ session })
    expect(mocks.lines.mock.calls[0][1]).toEqual({ session })
  })
  it('aborts before creating the order if atomic reservation fails', async () => {
    mocks.reserve.mockResolvedValue({ modifiedCount: 0 })
    await expect(ordersService.createGuestOrder(payload())).rejects.toThrow()
    expect(mocks.insert).not.toHaveBeenCalled()
  })
  it('propagates voucher claim failure so the transaction can roll back all writes', async () => {
    const body = { ...payload(), voucher_code: 'LAST' }
    const voucherId = new ObjectId()
    mocks.voucher.mockResolvedValue({ discount: 10000, voucher: { _id: voucherId } })
    mocks.consume.mockRejectedValue(new Error('voucher exhausted'))
    await expect(ordersService.createGuestOrder(body)).rejects.toThrow('voucher exhausted')
    expect(mocks.voucher).toHaveBeenCalledWith('LAST', 100000, session)
    expect(mocks.consume).toHaveBeenCalledWith(voucherId, session)
  })
  it('rejects guest online payments instead of granting anonymous access to payment links', async () => {
    await expect(
      ordersService.createGuestOrder({ ...payload(), payment_method: PaymentMethod.PAYOS })
    ).rejects.toThrow()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })
})
