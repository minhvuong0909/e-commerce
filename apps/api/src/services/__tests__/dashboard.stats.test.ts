import { describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus } from '~/constants/enums'

vi.mock('../database.service', () => ({ default: {} }))
import { dayKey, findAnomalies, isOpen, isRecognized, percentChange, summarize, type StatsOrder } from '../dashboard.services'
import { parseRange } from '~/controllers/dashboard.controllers'

const order = (p: Partial<StatsOrder>): StatsOrder => ({
  _id: new ObjectId(),
  status: OrderStatus.Pending,
  payment_status: PaymentStatus.PENDING,
  payment_method: PaymentMethod.CASH_ON_DELIVERY,
  total_price: 100_000,
  shipping_fee: 20_000,
  created_at: new Date('2026-09-05T03:00:00Z'),
  ...p
})

describe('revenue recognition', () => {
  it('counts paid orders and delivered COD, never cancelled or unpaid', () => {
    expect(isRecognized(order({ payment_status: PaymentStatus.COMPLETED, payment_method: PaymentMethod.PAYOS }))).toBe(true)
    expect(isRecognized(order({ status: OrderStatus.Delivered }))).toBe(true) // COD collected
    expect(isRecognized(order({ status: OrderStatus.Shipped }))).toBe(false) // COD not collected yet
    expect(
      isRecognized(order({ status: OrderStatus.Cancelled, payment_status: PaymentStatus.COMPLETED, payment_method: PaymentMethod.MOMO }))
    ).toBe(false)
    expect(isRecognized(order({ status: OrderStatus.Delivered, payment_method: PaymentMethod.MOMO }))).toBe(false)
  })

  it('treats active, uncollected orders as open', () => {
    expect(isOpen(order({ status: OrderStatus.Confirmed }))).toBe(true)
    expect(isOpen(order({ status: OrderStatus.Cancelled }))).toBe(false)
    expect(isOpen(order({ payment_status: PaymentStatus.FAILED, payment_method: PaymentMethod.MOMO }))).toBe(false)
  })
})

describe('summarize', () => {
  const orders = [
    order({ status: OrderStatus.Delivered, total_price: 200_000, shipping_fee: 25_000 }),
    order({ payment_status: PaymentStatus.COMPLETED, payment_method: PaymentMethod.PAYOS, total_price: 300_000, shipping_fee: 0 }),
    order({ status: OrderStatus.Cancelled, total_price: 999_000 }),
    order({ status: OrderStatus.Confirmed, total_price: 50_000 })
  ]

  it('does not add shipping on top of total_price (it is already included)', () => {
    const s = summarize(orders, '2026-09-01', '2026-09-07')
    expect(s.revenue).toBe(500_000)
    expect(s.revenue_excl_shipping).toBe(475_000)
    expect(s.recognized_orders).toBe(2)
    expect(s.avg_order_value).toBe(250_000)
    expect(s.open_orders).toBe(1)
    expect(s.open_value).toBe(50_000)
    expect(s.by_status).toMatchObject({ delivered: 1, cancelled: 1, pending: 1, confirmed: 1 })
  })

  it('builds a gap-free daily series in shop time', () => {
    const late = order({ status: OrderStatus.Delivered, created_at: new Date('2026-09-06T18:30:00Z') }) // 01:30 on the 7th in VN
    const s = summarize([late], '2026-09-01', '2026-09-07')
    expect(s.series).toHaveLength(7)
    expect(s.series[0].date).toBe('2026-09-01')
    expect(s.series.find((d) => d.date === '2026-09-07')?.revenue).toBe(100_000)
    expect(s.series.find((d) => d.date === '2026-09-06')?.revenue).toBe(0)
  })
})

describe('helpers', () => {
  it('reports real period change, or null without a baseline', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 0)).toBeNull()
  })

  it('flags paid-but-cancelled and delivered-but-unpaid online orders', () => {
    const a = findAnomalies([
      order({ status: OrderStatus.Cancelled, payment_status: PaymentStatus.COMPLETED, payment_method: PaymentMethod.MOMO, total_price: 240_000 }),
      order({ status: OrderStatus.Cancelled, payment_status: PaymentStatus.COMPLETED, refund_state: 'completed' }),
      order({ status: OrderStatus.Delivered, payment_method: PaymentMethod.MOMO, total_price: 675_000 }),
      order({ status: OrderStatus.Delivered })
    ])
    expect(a.paid_but_cancelled).toMatchObject({ count: 1, amount: 240_000 })
    expect(a.delivered_unpaid_online).toMatchObject({ count: 1, amount: 675_000 })
  })

  it('uses the shop timezone for day keys', () => {
    expect(dayKey(new Date('2026-09-06T18:30:00Z'))).toBe('2026-09-07')
  })
})

describe('parseRange', () => {
  const now = new Date('2026-11-27T05:00:00Z')
  it('defaults to the last 30 days ending today', () => {
    expect(parseRange({}, now)).toEqual({ from: '2026-10-29', to: '2026-11-27' })
  })
  it('rejects malformed, reversed, impossible or oversized ranges', () => {
    expect(() => parseRange({ from: '2026/01/01', to: '2026-01-02' }, now)).toThrow()
    expect(() => parseRange({ from: '2026-02-10', to: '2026-02-01' }, now)).toThrow()
    expect(() => parseRange({ from: '2026-02-30', to: '2026-03-01' }, now)).toThrow()
    expect(() => parseRange({ from: '2024-01-01', to: '2026-01-01' }, now)).toThrow()
  })
})
