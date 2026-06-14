const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

const toNumber = (value: string | undefined, fallback: number) => {
  const trimmed = stripEnv(value)
  if (!trimmed) return fallback
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** 160 Lã Xuân Oai, Long Phước, Thủ Đức, TP.HCM (Nominatim) */
export const shippingConfig = {
  storeLat: toNumber(stripEnv(process.env.STORE_LAT), 10.824813),
  storeLng: toNumber(stripEnv(process.env.STORE_LNG), 106.8078734),
  storeAddress: stripEnv(process.env.STORE_ADDRESS) || '160 Lã Xuân Oai, Phường Long Phước, Thủ Đức, TP.HCM',
  maxDeliveryDistanceKm: toNumber(stripEnv(process.env.MAX_DELIVERY_DISTANCE_KM), 25),
  expressSurcharge: toNumber(stripEnv(process.env.EXPRESS_SHIPPING_SURCHARGE), 20000),
  nominatimBaseUrl: stripEnv(process.env.NOMINATIM_BASE_URL) || 'https://nominatim.openstreetmap.org',
  osrmBaseUrl: stripEnv(process.env.OSRM_BASE_URL) || 'https://router.project-osrm.org',
  nominatimUserAgent: stripEnv(process.env.NOMINATIM_USER_AGENT) || 'VibrantMart-Ecommerce/1.0'
} as const
