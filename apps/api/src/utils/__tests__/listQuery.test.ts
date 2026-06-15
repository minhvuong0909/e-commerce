import { describe, expect, it } from 'vitest'
import { PaymentMethod } from '~/constants/enums'
import {
  buildBrandSearchFilter,
  buildCategorySearchFilter,
  buildOrderSearchFilter
} from '~/utils/listQuery'

describe('buildBrandSearchFilter', () => {
  it('returns empty filter when search is blank', () => {
    expect(buildBrandSearchFilter()).toEqual({})
    expect(buildBrandSearchFilter('   ')).toEqual({})
  })

  it('builds regex search on brand text fields', () => {
    const filter = buildBrandSearchFilter('glossier')
    expect(filter.$or).toEqual(
      expect.arrayContaining([
        { name: { $regex: 'glossier', $options: 'i' } },
        { hotline: { $regex: 'glossier', $options: 'i' } }
      ])
    )
  })
})

describe('buildCategorySearchFilter', () => {
  it('searches name, desc and slug', () => {
    const filter = buildCategorySearchFilter('skincare')
    expect(filter.$or).toEqual(
      expect.arrayContaining([
        { name: { $regex: 'skincare', $options: 'i' } },
        { slug: { $regex: 'skincare', $options: 'i' } }
      ])
    )
  })
})

describe('buildOrderSearchFilter', () => {
  it('maps momo keyword to payment method enum', () => {
    const filter = buildOrderSearchFilter('momo')
    expect(filter.$or).toEqual(expect.arrayContaining([{ payment_method: PaymentMethod.MOMO }]))
  })

  it('includes shipping address fields', () => {
    const filter = buildOrderSearchFilter('0909')
    expect(filter.$or).toEqual(
      expect.arrayContaining([{ 'shipping_address.phone': { $regex: '0909', $options: 'i' } }])
    )
  })
})
