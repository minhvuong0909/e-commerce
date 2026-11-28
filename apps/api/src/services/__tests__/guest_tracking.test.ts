import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'

const mocks = vi.hoisted(() => ({ orders: vi.fn(), lines: vi.fn(), products: vi.fn(), filter: vi.fn() }))
vi.mock('../database.service', () => ({
  default: {
    orders: {
      find: (f: unknown) => {
        mocks.filter(f)
        return { limit: () => ({ toArray: mocks.orders }) }
      }
    },
    order_items: { find: () => ({ toArray: mocks.lines }) },
    products: { find: () => ({ toArray: mocks.products }) }
  }
}))
import guestTrackingService, { maskName, maskPhone, normalizeOrderCode, normalizePhone } from '../guest_tracking.services'

const id = new ObjectId('6a2eb2e0b48f3b18c8d51dd5')
const productId = new ObjectId()
const order = {
  _id: id,
  user_id: null,
  guest_customer: { name: 'Nguyễn Văn An', phone: '0900 000 001', email: 'a@b.test' },
  shipping_address: { recipient_name: 'Nguyễn Văn An', phone: '0900000001', address_line: '1 Võ Văn Ngân', district: 'Thủ Đức', city: 'Hồ Chí Minh' },
  status: 0,
  payment_method: 'CASH_ON_DELIVERY',
  payment_status: 0,
  total_price: 410000,
  shipping_fee: 25000,
  created_at: new Date(),
  updated_at: new Date()
}

describe('input normalisation', () => {
  it('accepts short or full order codes, with or without #', () => {
    expect(normalizeOrderCode('#d51dd5')).toBe('D51DD5')
    expect(normalizeOrderCode(String(id))).toBe(String(id).toUpperCase())
    expect(() => normalizeOrderCode('12345')).toThrow()
    expect(() => normalizeOrderCode('ZZZZZZ')).toThrow()
    expect(() => normalizeOrderCode('.*')).toThrow() // never reaches the regex
  })
  it('normalises Vietnamese phone formats', () => {
    expect(normalizePhone('+84 900 000 001')).toBe('0900000001')
    expect(normalizePhone('0900.000.001')).toBe('0900000001')
    expect(() => normalizePhone('123')).toThrow()
  })
  it('masks personal data', () => {
    expect(maskName('Nguyễn Văn An')).toBe('N*** V*** An')
    expect(maskPhone('0900000001')).toBe('****0001')
  })
})

describe('guest order tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.lines.mockResolvedValue([{ product_id: productId, quantity: 2, price: 192500 }])
    mocks.products.mockResolvedValue([{ _id: productId, name: 'Serum', thumbnail: 't.jpg' }])
  })

  it('returns status, items and masked details when code and phone match', async () => {
    mocks.orders.mockResolvedValue([order])
    const r = await guestTrackingService.track('#D51DD5', '+84 900 000 001')
    expect(r).toMatchObject({ code: '#D51DD5', status: 0, total_price: 410000 })
    expect(r.recipient).toEqual({ name: 'N*** V*** An', phone: '****0001', area: 'Thủ Đức, Hồ Chí Minh' })
    expect(r.items).toEqual([{ name: 'Serum', thumbnail: 't.jpg', quantity: 2, price: 192500 }])
    const body = JSON.stringify(r)
    expect(body).not.toContain('Võ Văn Ngân')
    expect(body).not.toContain('a@b.test')
    expect(body).not.toContain('0900000001')
  })

  it('only searches guest orders (never account orders)', async () => {
    mocks.orders.mockResolvedValue([order])
    await guestTrackingService.track('D51DD5', '0900000001')
    expect(mocks.filter.mock.calls[0][0]).toMatchObject({ user_id: null })
  })

  it('gives the same 404 for a wrong phone as for an unknown code', async () => {
    mocks.orders.mockResolvedValueOnce([order])
    const wrongPhone = await guestTrackingService.track('D51DD5', '0911111111').catch((e) => e)
    mocks.orders.mockResolvedValueOnce([])
    const unknown = await guestTrackingService.track('ABCDEF', '0900000001').catch((e) => e)
    expect(wrongPhone.status).toBe(404)
    expect(unknown.status).toBe(404)
    expect(wrongPhone.message).toBe(unknown.message)
  })
})
