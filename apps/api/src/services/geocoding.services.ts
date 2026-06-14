import { shippingConfig } from '~/config/shipping'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIPPING_MESSAGES } from '~/constants/messages'

export type GeocodedLocation = {
  lat: number
  lng: number
  display_name: string
  address_line?: string
  city?: string
  district?: string
}

type NominatimAddress = Record<string, string> | undefined

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const geocodeCache = new Map<string, { value: GeocodedLocation; expiresAt: number }>()

let lastNominatimRequestAt = 0

async function waitForNominatimSlot() {
  const elapsed = Date.now() - lastNominatimRequestAt
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed))
  }
  lastNominatimRequestAt = Date.now()
}

function readCache(key: string): GeocodedLocation | undefined {
  const cached = geocodeCache.get(key)
  if (!cached) return undefined
  if (cached.expiresAt < Date.now()) {
    geocodeCache.delete(key)
    return undefined
  }
  return cached.value
}

function writeCache(key: string, value: GeocodedLocation) {
  geocodeCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

async function requestNominatim<T>(path: string, params: Record<string, string>): Promise<T> {
  await waitForNominatimSlot()

  const url = new URL(`${shippingConfig.nominatimBaseUrl}${path}`)
  url.searchParams.set('format', 'json')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': shippingConfig.nominatimUserAgent }
  })

  if (!response.ok) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.BAD_GATEWAY,
      message: SHIPPING_MESSAGES.GEOCODING_FAILED
    })
  }

  return response.json() as Promise<T>
}

function parseAddressParts(address: NominatimAddress) {
  if (!address) return {}
  return {
    address_line: [address.house_number, address.road].filter(Boolean).join(' ') || undefined,
    district: address.suburb || address.city_district || address.district || address.county,
    city: address.city || address.town || address.state
  }
}

class GeocodingService {
  async forwardGeocode(query: string): Promise<GeocodedLocation> {
    const trimmed = query.trim()
    if (!trimmed) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.ADDRESS_NOT_FOUND
      })
    }

    const cacheKey = `fwd:${trimmed.toLowerCase()}`
    const cached = readCache(cacheKey)
    if (cached) return cached

    const results = await requestNominatim<
      Array<{ lat: string; lon: string; display_name: string; address?: NominatimAddress }>
    >('/search', { limit: '1', countrycodes: 'vn', q: trimmed })

    const hit = results[0]
    if (!hit) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.ADDRESS_NOT_FOUND
      })
    }

    const location: GeocodedLocation = {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      display_name: hit.display_name,
      ...parseAddressParts(hit.address)
    }
    writeCache(cacheKey, location)
    return location
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.INVALID_COORDINATES
      })
    }

    const cacheKey = `rev:${lat.toFixed(5)},${lng.toFixed(5)}`
    const cached = readCache(cacheKey)
    if (cached) return cached

    const result = await requestNominatim<{ display_name?: string; address?: NominatimAddress }>('/reverse', {
      lat: String(lat),
      lon: String(lng)
    })

    if (!result.display_name) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.ADDRESS_NOT_FOUND
      })
    }

    const parts = parseAddressParts(result.address)
    const location: GeocodedLocation = {
      lat,
      lng,
      display_name: result.display_name,
      address_line: parts.address_line || result.display_name.split(',')[0],
      city: parts.city,
      district: parts.district
    }
    writeCache(cacheKey, location)
    return location
  }
}

const geocodingService = new GeocodingService()
export default geocodingService
