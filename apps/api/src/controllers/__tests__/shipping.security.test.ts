import { describe, expect, it, vi, beforeEach } from 'vitest'
const mocks = vi.hoisted(() => ({ reverse: vi.fn(), quote: vi.fn() }))
vi.mock('~/services/shipping.services', () => ({
  default: { reverseGeocode: mocks.reverse, getShippingQuote: mocks.quote }
}))
import { reverseGeocodeController, getShippingQuoteController } from '../shipping.controllers'
describe('public shipping input limits', () => {
  beforeEach(() => vi.clearAllMocks())
  it.each([
    { lat: '91', lng: '106' },
    { lat: '10', lng: '181' },
    { lat: 'NaN', lng: '106' },
    { lat: '', lng: '106' },
    { lat: ['10'], lng: '106' }
  ])('rejects invalid coordinates before an upstream request %j', async (query) => {
    await expect(reverseGeocodeController({ query } as any, {} as any)).rejects.toMatchObject({ status: 400 })
    expect(mocks.reverse).not.toHaveBeenCalled()
  })
  it('bounds guest address length', async () => {
    await expect(
      getShippingQuoteController({ body: { address_line: 'x'.repeat(501) } } as any, {} as any, vi.fn())
    ).rejects.toMatchObject({ status: 400 })
    expect(mocks.quote).not.toHaveBeenCalled()
  })
})
