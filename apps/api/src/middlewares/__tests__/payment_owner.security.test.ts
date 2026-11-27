import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus } from '~/constants/enums'
const mocks = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('~/services/database.service', () => ({ default: { orders: { findOne: mocks.find } } }))
import { requirePaymentOwner } from '../payment.middlewares'
describe('payment owner guard', () => {
  const id = new ObjectId(),
    user = new ObjectId()
  const request = () =>
    ({ params: { order_id: id.toHexString() }, decode_authorization: { user_id: user.toHexString() } }) as any
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find.mockResolvedValue({
      _id: id,
      user_id: user,
      payment_method: PaymentMethod.PAYOS,
      status: OrderStatus.Pending,
      payment_status: PaymentStatus.PENDING
    })
  })
  it('requires ownership in the database lookup', async () => {
    const next = vi.fn()
    await requirePaymentOwner(PaymentMethod.PAYOS)(request(), {} as any, next)
    expect(mocks.find.mock.calls[0][0]).toEqual({ _id: id, user_id: user })
    expect(next).toHaveBeenCalledOnce()
  })
  it('denies guessed or guest order IDs', async () => {
    mocks.find.mockResolvedValue(null)
    await expect(requirePaymentOwner(PaymentMethod.PAYOS)(request(), {} as any, vi.fn())).rejects.toMatchObject({
      status: 404
    })
  })
  it.each([
    { status: OrderStatus.Cancelled },
    { payment_status: PaymentStatus.REFUNDED },
    { payment_method: PaymentMethod.MOMO }
  ])('denies invalid order state %j', async (patch) => {
    mocks.find.mockResolvedValue({ status: OrderStatus.Pending, payment_method: PaymentMethod.PAYOS, ...patch })
    await expect(requirePaymentOwner(PaymentMethod.PAYOS)(request(), {} as any, vi.fn())).rejects.toMatchObject({
      status: 400
    })
  })
})
