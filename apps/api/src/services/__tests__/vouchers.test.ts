import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'

const mocks = vi.hoisted(() => ({ insert: vi.fn(), findOne: vi.fn(), update: vi.fn(), del: vi.fn() }))
vi.mock('../database.service', () => ({
  default: { vouchers: { insertOne: mocks.insert, findOne: mocks.findOne, findOneAndUpdate: mocks.update, deleteOne: mocks.del } }
}))
import voucherService from '../vouchers.services'
import { computeDiscount, parseVoucherInput } from '~/utils/voucherInput'

const valid = { code: ' glow10 ', discount_type: 'percent', discount_value: 10 }

describe('parseVoucherInput', () => {
  it('normalises the code and fills safe defaults', () => {
    expect(parseVoucherInput(valid)).toEqual({ code: 'GLOW10', discount_type: 'percent', discount_value: 10, min_order_value: 0, usage_limit: 0 })
  })

  it('never accepts counters, ids or unknown fields from the client', () => {
    const out = parseVoucherInput({ ...valid, used_count: 999, _id: 'x', created_at: '2020-01-01', hacked: true })
    expect(out).not.toHaveProperty('used_count')
    expect(out).not.toHaveProperty('_id')
    expect(out).not.toHaveProperty('hacked')
  })

  it.each([
    [{ ...valid, discount_value: 150 }, 'percent above 100'],
    [{ ...valid, discount_value: 0 }, 'zero discount'],
    [{ ...valid, discount_value: 10.5 }, 'fractional'],
    [{ ...valid, discount_type: 'fixed', discount_value: -5000 }, 'negative fixed'],
    [{ ...valid, code: 'ab' }, 'short code'],
    [{ ...valid, code: 'SALE 50' }, 'space in code'],
    [{ ...valid, usage_limit: -1 }, 'negative usage'],
    [{ ...valid, starts_at: '2026-12-10', ends_at: '2026-12-01' }, 'ends before starts'],
    [{ ...valid, discount_type: 'bogus' }, 'unknown type']
  ] as Array<[Record<string, unknown>, string]>)('rejects %o (%s)', (body) => {
    expect(() => parseVoucherInput(body)).toThrow()
  })

  it('PATCH validates against stored values (switching to percent re-checks the amount)', () => {
    const current = { discount_type: 'fixed' as const, discount_value: 50_000 }
    expect(() => parseVoucherInput({ discount_type: 'percent' }, { partial: true, current })).toThrow()
    expect(parseVoucherInput({ active: false }, { partial: true, current })).toEqual({ active: false })
  })
})

describe('computeDiscount', () => {
  it('applies percent with an optional cap and never exceeds the subtotal', () => {
    expect(computeDiscount({ discount_type: 'percent', discount_value: 10 }, 1_000_000)).toBe(100_000)
    expect(computeDiscount({ discount_type: 'percent', discount_value: 10, max_discount_value: 50_000 }, 1_000_000)).toBe(50_000)
    expect(computeDiscount({ discount_type: 'fixed', discount_value: 200_000 }, 150_000)).toBe(150_000)
  })
})

describe('voucher service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('maps a duplicate code (unique index) to 409', async () => {
    mocks.insert.mockRejectedValue(Object.assign(new Error('E11000'), { code: 11000 }))
    await expect(voucherService.create(valid)).rejects.toMatchObject({ status: 409 })
  })

  it('refuses to rename a voucher that has already been used', async () => {
    mocks.findOne.mockResolvedValue({ _id: new ObjectId(), code: 'OLD', discount_type: 'fixed', discount_value: 10_000, used_count: 3 })
    await expect(voucherService.update(new ObjectId().toHexString(), { code: 'NEW' })).rejects.toMatchObject({ status: 400 })
  })

  it('refuses a usage limit below what has already been used', async () => {
    mocks.findOne.mockResolvedValue({ _id: new ObjectId(), code: 'X', discount_type: 'fixed', discount_value: 10_000, used_count: 5 })
    await expect(voucherService.update(new ObjectId().toHexString(), { usage_limit: 3 })).rejects.toMatchObject({ status: 400 })
  })

  it('only deletes never-used vouchers', async () => {
    mocks.del.mockResolvedValue({ deletedCount: 0 })
    mocks.findOne.mockResolvedValue({ _id: new ObjectId() })
    await expect(voucherService.remove(new ObjectId().toHexString())).rejects.toThrow(/không thể xóa/)
    expect(mocks.del.mock.calls[0][0]).toMatchObject({ used_count: { $lte: 0 } })
  })

  it('validate honours the percent cap and states the minimum order', async () => {
    mocks.findOne.mockResolvedValue({ code: 'CAP', active: true, discount_type: 'percent', discount_value: 20, max_discount_value: 30_000, min_order_value: 200_000, usage_limit: 0, used_count: 0 })
    await expect(voucherService.validate('cap', 1_000_000)).resolves.toMatchObject({ discount: 30_000, final_subtotal: 970_000 })
    await expect(voucherService.validate('cap', 100_000)).rejects.toThrow(/200\.000/)
  })
})
