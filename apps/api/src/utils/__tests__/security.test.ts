import { describe, expect, it } from 'vitest'
import { ObjectId } from 'mongodb'
import { normalizeOrderItems } from '../security'

describe('strict order input', () => {
  const id = new ObjectId().toHexString()
  it('merges duplicate product IDs before checking/reserving stock', () => {
    expect(
      normalizeOrderItems([
        { product_id: id, quantity: 2 },
        { product_id: id.toUpperCase(), quantity: 3 }
      ])
    ).toEqual([{ product_id: id, quantity: 5 }])
  })
  it.each([0, -1, 1.5, NaN, Infinity, '2', null, 1001])('rejects invalid quantity %s', (quantity) => {
    expect(() => normalizeOrderItems([{ product_id: id, quantity }])).toThrow()
  })
  it.each([[], null, {}, [{ product_id: 'bad', quantity: 1 }]])('rejects malformed input', (input) =>
    expect(() => normalizeOrderItems(input)).toThrow()
  )
  it('caps combined quantities', () =>
    expect(() =>
      normalizeOrderItems([
        { product_id: id, quantity: 600 },
        { product_id: id, quantity: 600 }
      ])
    ).toThrow())
})
