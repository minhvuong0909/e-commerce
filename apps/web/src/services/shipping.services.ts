import api from '../configs/api'

export type StoreInfo = {
  lat: number
  lng: number
  address: string
  max_delivery_distance_km: number
}

export type ShippingQuote = {
  lat: number
  lng: number
  formatted_address: string
  distance_km: number
  base_shipping_fee: number
  express_surcharge: number
  shipping_fee: number
  delivery_method_type?: number
}

export type ReverseGeocodeResult = {
  lat: number
  lng: number
  formatted_address: string
  address_line?: string
  city?: string
  district?: string
}

export type ShippingQuotePayload = {
  address_line?: string
  city?: string
  district?: string
  lat?: number
  lng?: number
  delivery_method_id?: string
}

export const getStoreInfoApi = () => api.get<{ result: StoreInfo }>('/shipping/store')

export const getShippingQuoteApi = (data: ShippingQuotePayload) =>
  api.post<{ result: ShippingQuote }>('/shipping/quote', data)

export const reverseGeocodeApi = (lat: number, lng: number) =>
  api.get<{ result: ReverseGeocodeResult }>('/shipping/reverse-geocode', { params: { lat, lng } })
