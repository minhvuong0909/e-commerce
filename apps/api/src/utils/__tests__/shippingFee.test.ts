import { describe, it, expect } from 'vitest'
import { calculateBaseShippingFee, applyExpressSurcharge } from '~/utils/shippingFee'

describe('calculateBaseShippingFee', () => {
  it('returns 15000 for distances under 5 km', () => {
    expect(calculateBaseShippingFee(0)).toBe(15000)
    expect(calculateBaseShippingFee(4.99)).toBe(15000)
  })

  it('returns 25000 for distances from 5 km to under 10 km', () => {
    expect(calculateBaseShippingFee(5)).toBe(25000)
    expect(calculateBaseShippingFee(9.99)).toBe(25000)
  })

  it('returns 40000 for distances from 10 km to under 20 km', () => {
    expect(calculateBaseShippingFee(10)).toBe(40000)
    expect(calculateBaseShippingFee(19.99)).toBe(40000)
  })

  it('returns 60000 for distances from 20 km to under 25 km', () => {
    expect(calculateBaseShippingFee(20)).toBe(60000)
    expect(calculateBaseShippingFee(24.99)).toBe(60000)
  })

  it('rejects distances at or beyond 25 km', () => {
    expect(() => calculateBaseShippingFee(25)).toThrow('OUT_OF_DELIVERY_ZONE')
    expect(() => calculateBaseShippingFee(30)).toThrow('OUT_OF_DELIVERY_ZONE')
  })
})

describe('applyExpressSurcharge', () => {
  it('adds express surcharge when express delivery is selected', () => {
    expect(applyExpressSurcharge(15000, true)).toBe(35000)
  })

  it('keeps base fee for standard delivery', () => {
    expect(applyExpressSurcharge(15000, false)).toBe(15000)
  })
})
