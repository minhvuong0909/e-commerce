import { describe, it, expect } from 'vitest'
import { ObjectId } from 'mongodb'
import { PRODUCT_STATUS } from '~/constants/enums'
import {
  buildProductMatchStage,
  buildProductSortStage,
  escapeRegex,
  parsePagination
} from '~/utils/productQuery'

describe('escapeRegex', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegex('a.b*c')).toBe('a\\.b\\*c')
  })
})

describe('buildProductMatchStage', () => {
  it('returns an empty match when no filters are provided', () => {
    expect(buildProductMatchStage({})).toEqual({})
  })

  it('builds a case-insensitive name regex from search', () => {
    const match = buildProductMatchStage({ search: 'serum' })
    expect(match.name).toEqual({ $regex: 'serum', $options: 'i' })
  })

  it('trims search and ignores empty/whitespace-only search', () => {
    expect(buildProductMatchStage({ search: '   ' })).toEqual({})
  })

  it('converts valid category_id and brand_id to ObjectId', () => {
    const id = new ObjectId().toHexString()
    const match = buildProductMatchStage({ category_id: id, brand_id: id })
    expect(match.category_id).toBeInstanceOf(ObjectId)
    expect(match.brand_id).toBeInstanceOf(ObjectId)
    expect(match.category_id.toHexString()).toBe(id)
  })

  it('ignores invalid ObjectId values', () => {
    const match = buildProductMatchStage({ category_id: 'not-an-id' })
    expect(match.category_id).toBeUndefined()
  })

  it('builds a price range with both bounds', () => {
    const match = buildProductMatchStage({ minPrice: 100, maxPrice: 500 })
    expect(match.price).toEqual({ $gte: 100, $lte: 500 })
  })

  it('builds a price range with only a lower bound', () => {
    const match = buildProductMatchStage({ minPrice: 100 })
    expect(match.price).toEqual({ $gte: 100 })
  })

  it('keeps a valid status filter and drops an invalid one', () => {
    expect(buildProductMatchStage({ status: PRODUCT_STATUS.Stock }).status).toBe(PRODUCT_STATUS.Stock)
    expect(buildProductMatchStage({ status: 99 }).status).toBeUndefined()
  })
})

describe('buildProductSortStage', () => {
  it('defaults to newest first', () => {
    expect(buildProductSortStage()).toEqual({ created_at: -1 })
    expect(buildProductSortStage('unknown')).toEqual({ created_at: -1 })
  })

  it('maps price and best selling sorts', () => {
    expect(buildProductSortStage('price_asc')).toEqual({ price: 1 })
    expect(buildProductSortStage('price_desc')).toEqual({ price: -1 })
    expect(buildProductSortStage('best_selling')).toEqual({ soldNumber: -1 })
  })
})

describe('parsePagination', () => {
  it('defaults to page 1 and limit 10', () => {
    expect(parsePagination()).toEqual({ page: 1, limit: 10, skip: 0 })
  })

  it('computes skip from page and limit', () => {
    expect(parsePagination(3, 20)).toEqual({ page: 3, limit: 20, skip: 40 })
  })

  it('clamps invalid or out-of-range values', () => {
    expect(parsePagination(0, 0)).toEqual({ page: 1, limit: 10, skip: 0 })
    expect(parsePagination(-5, 9999)).toEqual({ page: 1, limit: 100, skip: 0 })
  })
})
