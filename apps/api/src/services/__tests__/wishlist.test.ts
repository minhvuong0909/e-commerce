import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'

const mocks = vi.hoisted(() => ({
  productsFind: vi.fn(),
  productFindOne: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  bulk: vi.fn(),
  del: vi.fn(),
  itemsFind: vi.fn()
}))
vi.mock('../database.service', () => ({
  default: {
    products: {
      find: (...a: unknown[]) => ({ toArray: () => mocks.productsFind(...a) }),
      findOne: mocks.productFindOne
    },
    wishlist_items: {
      countDocuments: mocks.count,
      updateOne: mocks.update,
      bulkWrite: mocks.bulk,
      deleteOne: mocks.del,
      find: () => ({ sort: () => ({ limit: () => ({ toArray: mocks.itemsFind }) }) })
    }
  }
}))
import wishlistService, { parseProductIds, WISHLIST_MAX } from '../wishlist.services'

const uid = new ObjectId().toHexString()
const p1 = new ObjectId(),
  p2 = new ObjectId(),
  p3 = new ObjectId()

describe('parseProductIds', () => {
  it('dedupes while preserving order and rejects bad input', () => {
    expect(parseProductIds([String(p1), String(p2), String(p1)], 10).map(String)).toEqual([String(p1), String(p2)])
    expect(() => parseProductIds('x', 10)).toThrow()
    expect(() => parseProductIds(['not-an-id'], 10)).toThrow()
    expect(() => parseProductIds([String(p1), String(p2)], 1)).toThrow()
  })
})

describe('wishlist service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds idempotently with an upsert, and refuses inactive products', async () => {
    mocks.productFindOne.mockResolvedValueOnce({ _id: p1 })
    mocks.count.mockResolvedValue(0)
    await wishlistService.add(uid, String(p1))
    const [filter, update, opts] = mocks.update.mock.calls[0]
    expect(filter).toEqual({ user_id: new ObjectId(uid), product_id: p1 })
    expect(update).toHaveProperty('$setOnInsert')
    expect(opts).toEqual({ upsert: true })

    mocks.productFindOne.mockResolvedValueOnce(null)
    await expect(wishlistService.add(uid, String(p2))).rejects.toThrow(/không còn được bán/)
  })

  it(`caps the list at ${WISHLIST_MAX} items`, async () => {
    mocks.productFindOne.mockResolvedValue({ _id: p1 })
    mocks.count.mockResolvedValue(WISHLIST_MAX)
    await expect(wishlistService.add(uid, String(p1))).rejects.toThrow(/tối đa/)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('lists only active products, newest first, dropping removed ones', async () => {
    mocks.itemsFind.mockResolvedValue([{ product_id: p3 }, { product_id: p1 }, { product_id: p2 }])
    mocks.productsFind.mockResolvedValue([{ _id: p1, name: 'A' }, { _id: p3, name: 'C' }]) // p2 inactive/deleted
    const result = await wishlistService.list(uid)
    expect(result.product_ids).toEqual([String(p3), String(p1)])
    expect(result.products.map((p) => p.name)).toEqual(['C', 'A'])
  })

  it('merges a guest list without exceeding the cap and skips unknown products', async () => {
    mocks.productsFind.mockResolvedValueOnce([{ _id: p1 }, { _id: p2 }]).mockResolvedValue([])
    mocks.count.mockResolvedValue(WISHLIST_MAX - 1)
    mocks.itemsFind.mockResolvedValue([])
    await wishlistService.merge(uid, [String(p1), String(p2), String(p3)])
    const ops = mocks.bulk.mock.calls[0][0]
    expect(ops).toHaveLength(1)
    expect(ops[0].updateOne.upsert).toBe(true)
  })

  it('preview returns active products for a guest without needing an account', async () => {
    mocks.productsFind.mockResolvedValue([{ _id: p2, name: 'B' }])
    const result = await wishlistService.preview([String(p1), String(p2)])
    expect(result.map((p) => p.name)).toEqual(['B'])
    expect(mocks.productsFind.mock.calls[0][0]).toMatchObject({ status: 0 })
  })
})
