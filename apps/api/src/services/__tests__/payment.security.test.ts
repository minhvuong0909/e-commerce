import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus } from '~/constants/enums'
const mocks = vi.hoisted(() => ({
  findOrder: vi.fn(),
  findPayment: vi.fn(),
  updateOrder: vi.fn(),
  updatePayment: vi.fn(),
  gateway: vi.fn(),
  webhook: vi.fn()
}))
vi.mock('../database.service', () => ({
  default: {
    withTransaction: async (work: (session: unknown) => Promise<unknown>) => work({ testSession: true }),
    orders: { findOne: mocks.findOrder, updateOne: mocks.updateOrder },
    payments: { findOne: mocks.findPayment, updateOne: mocks.updatePayment }
  }
}))
vi.mock('~/config/mail', () => ({ createMailTransporter: () => ({ sendMail: vi.fn() }) }))
vi.mock('~/config/payment', () => ({
  assertMoMoProductionReady: vi.fn(),
  MOMO_CONFIG: {},
  PAYOS_CONFIG: {},
  payos: { paymentRequests: { get: mocks.gateway }, webhooks: { verify: mocks.webhook } }
}))
import paymentService from '../payment.services'

describe('PayOS payment binding', () => {
  const id = new ObjectId()
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findOrder.mockResolvedValue({
      _id: id,
      total_price: 300000,
      payment_method: PaymentMethod.PAYOS,
      payment_status: PaymentStatus.PENDING,
      status: OrderStatus.Pending
    })
    mocks.findPayment.mockResolvedValue({
      _id: new ObjectId(),
      order_id: id,
      amount: 300000,
      payment_status: PaymentStatus.PENDING
    })
    mocks.gateway.mockResolvedValue({
      orderCode: 1234,
      amount: 300000,
      amountPaid: 300000,
      status: 'PAID',
      id: 'link-id'
    })
  })
  it('rejects unrelated orderCode before consulting the provider or writing', async () => {
    mocks.findPayment.mockResolvedValue(null)
    await expect(paymentService.handlePayOSReturn({ order_id: id.toHexString(), orderCode: 1234 })).rejects.toThrow()
    expect(mocks.findPayment.mock.calls[0][0].order_id.equals(id)).toBe(true)
    expect(mocks.gateway).not.toHaveBeenCalled()
    expect(mocks.updateOrder).not.toHaveBeenCalled()
  })
  it.each([{ amount: 1 }, { amountPaid: 1 }, { amountPaid: undefined }, { orderCode: 9999 }])(
    'rejects mismatched provider data %j',
    async (changed) => {
      mocks.gateway.mockResolvedValue({
        orderCode: 1234,
        amount: 300000,
        amountPaid: 300000,
        status: 'PAID',
        ...changed
      })
      await expect(paymentService.handlePayOSReturn({ order_id: id.toHexString(), orderCode: 1234 })).rejects.toThrow()
      expect(mocks.updateOrder).not.toHaveBeenCalled()
    }
  )
  it('does not resurrect a cancelled order', async () => {
    mocks.findOrder.mockResolvedValue({
      _id: id,
      total_price: 300000,
      payment_method: PaymentMethod.PAYOS,
      status: OrderStatus.Cancelled
    })
    await expect(paymentService.handlePayOSReturn({ order_id: id.toHexString(), orderCode: 1234 })).rejects.toThrow()
    expect(mocks.updateOrder).not.toHaveBeenCalled()
  })
  it('rechecks cancellation inside the confirmation transaction', async () => {
    mocks.findOrder.mockResolvedValueOnce({
      _id: id,
      total_price: 300000,
      payment_method: PaymentMethod.PAYOS,
      payment_status: PaymentStatus.PENDING,
      status: OrderStatus.Pending
    })
    mocks.findOrder.mockResolvedValueOnce({
      _id: id,
      total_price: 300000,
      payment_method: PaymentMethod.PAYOS,
      status: OrderStatus.Cancelled
    })
    await expect(paymentService.handlePayOSReturn({ order_id: id.toHexString(), orderCode: 1234 })).rejects.toThrow()
    expect(mocks.updateOrder).not.toHaveBeenCalled()
  })
  it('accepts a matching paid transaction and preserves its gateway mapping', async () => {
    const result = await paymentService.handlePayOSReturn({ order_id: id.toHexString(), orderCode: 1234 })
    expect(result.resultCode).toBe('0')
    expect(mocks.updateOrder).toHaveBeenCalledOnce()
    expect(mocks.updatePayment.mock.calls[0][1].$set.gateway_trans_id).toBeUndefined()
  })
  it('rejects underpaid signed webhooks', async () => {
    mocks.webhook.mockResolvedValue({ code: '00', orderCode: 1234, amount: 1 })
    await expect(paymentService.handlePayOSWebhook({})).rejects.toThrow()
    expect(mocks.updateOrder).not.toHaveBeenCalled()
  })
})
