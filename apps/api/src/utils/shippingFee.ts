import { shippingConfig } from '~/config/shipping'

export function calculateBaseShippingFee(distanceKm: number): number {
  if (distanceKm < 0) {
    throw new Error('Invalid distance')
  }

  if (distanceKm >= shippingConfig.maxDeliveryDistanceKm) {
    throw new Error('OUT_OF_DELIVERY_ZONE')
  }

  if (distanceKm < 5) return 15000
  if (distanceKm < 10) return 25000
  if (distanceKm < 20) return 40000
  return 60000
}

export function applyExpressSurcharge(baseFee: number, isExpress: boolean): number {
  return isExpress ? baseFee + shippingConfig.expressSurcharge : baseFee
}
