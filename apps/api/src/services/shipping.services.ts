import { ObjectId } from 'mongodb'
import { DeliveryMethodType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIPPING_MESSAGES } from '~/constants/messages'
import { shippingConfig } from '~/config/shipping'
import { ErrorWithStatus } from '~/models/Errors'
import { applyExpressSurcharge, calculateBaseShippingFee } from '~/utils/shippingFee'
import databaseService from './database.service'
import geocodingService from './geocoding.services'

export type ShippingQuoteInput = {
  address_line?: string
  city?: string
  district?: string
  lat?: number
  lng?: number
  delivery_method_id?: string
}

export type ShippingQuoteResult = {
  lat: number
  lng: number
  formatted_address: string
  distance_km: number
  base_shipping_fee: number
  express_surcharge: number
  shipping_fee: number
  delivery_method_type?: DeliveryMethodType
}

class ShippingService {
  getStoreInfo() {
    return {
      lat: shippingConfig.storeLat,
      lng: shippingConfig.storeLng,
      address: shippingConfig.storeAddress,
      max_delivery_distance_km: shippingConfig.maxDeliveryDistanceKm
    }
  }

  async getRouteDistanceKm(destLat: number, destLng: number): Promise<number> {
    const { storeLat, storeLng, osrmBaseUrl } = shippingConfig
    const url = `${osrmBaseUrl}/route/v1/driving/${storeLng},${storeLat};${destLng},${destLat}?overview=false`

    const response = await fetch(url)
    if (!response.ok) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_GATEWAY,
        message: SHIPPING_MESSAGES.ROUTING_FAILED
      })
    }

    const payload = (await response.json()) as {
      code?: string
      routes?: Array<{ distance?: number }>
    }

    const meters = payload.routes?.[0]?.distance
    if (payload.code !== 'Ok' || !meters) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_GATEWAY,
        message: SHIPPING_MESSAGES.ROUTING_FAILED
      })
    }

    return meters / 1000
  }

  async resolveDestination(input: ShippingQuoteInput) {
    if (input.lat != null && input.lng != null && Number.isFinite(input.lat) && Number.isFinite(input.lng)) {
      const reverse = await geocodingService.reverseGeocode(input.lat, input.lng)
      return {
        lat: input.lat,
        lng: input.lng,
        formatted_address: reverse.display_name,
        address_line: input.address_line?.trim() || reverse.address_line,
        city: input.city?.trim() || reverse.city,
        district: input.district?.trim() || reverse.district
      }
    }

    const addressParts = [input.address_line, input.district, input.city].map((part) => part?.trim()).filter(Boolean)
    if (addressParts.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.ADDRESS_REQUIRED
      })
    }

    const geocoded = await geocodingService.forwardGeocode([...addressParts, 'Việt Nam'].join(', '))
    return {
      lat: geocoded.lat,
      lng: geocoded.lng,
      formatted_address: geocoded.display_name,
      address_line: input.address_line?.trim() || geocoded.address_line || geocoded.display_name.split(',')[0],
      city: input.city?.trim() || geocoded.city,
      district: input.district?.trim() || geocoded.district
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    return this.resolveDestination({ lat, lng })
  }

  async getShippingQuote(input: ShippingQuoteInput): Promise<ShippingQuoteResult> {
    const destination = await this.resolveDestination(input)
    const distance_km = await this.getRouteDistanceKm(destination.lat, destination.lng)

    if (distance_km >= shippingConfig.maxDeliveryDistanceKm) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: SHIPPING_MESSAGES.OUT_OF_DELIVERY_ZONE
      })
    }

    let deliveryMethodType: DeliveryMethodType | undefined
    if (input.delivery_method_id) {
      const deliveryMethod = await databaseService.delivery_methods.findOne({
        _id: new ObjectId(input.delivery_method_id)
      })
      if (!deliveryMethod) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: SHIPPING_MESSAGES.DELIVERY_METHOD_NOT_FOUND
        })
      }
      deliveryMethodType = deliveryMethod.type as DeliveryMethodType
    }

    const base_shipping_fee = calculateBaseShippingFee(distance_km)
    const isExpress = deliveryMethodType === DeliveryMethodType.EXPRESS
    const express_surcharge = isExpress ? shippingConfig.expressSurcharge : 0
    const shipping_fee = applyExpressSurcharge(base_shipping_fee, isExpress)

    return {
      lat: destination.lat,
      lng: destination.lng,
      formatted_address: destination.formatted_address,
      distance_km: Math.round(distance_km * 100) / 100,
      base_shipping_fee,
      express_surcharge,
      shipping_fee,
      delivery_method_type: deliveryMethodType
    }
  }
}

const shippingService = new ShippingService()
export default shippingService
