import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIPPING_MESSAGES } from '~/constants/messages'
import shippingService from '~/services/shipping.services'

export const getStoreInfoController = async (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    message: SHIPPING_MESSAGES.GET_STORE_INFO_SUCCESS,
    result: shippingService.getStoreInfo()
  })
}

export const getShippingQuoteController = async (req: Request, res: Response, _next: NextFunction) => {
  const { address_line, city, district, lat, lng, delivery_method_id } = req.body

  const quote = await shippingService.getShippingQuote({
    address_line,
    city,
    district,
    lat: lat != null ? Number(lat) : undefined,
    lng: lng != null ? Number(lng) : undefined,
    delivery_method_id
  })

  res.status(HTTP_STATUS.OK).json({
    message: SHIPPING_MESSAGES.GET_SHIPPING_QUOTE_SUCCESS,
    result: quote
  })
}

export const reverseGeocodeController = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)

  const result = await shippingService.reverseGeocode(lat, lng)

  res.status(HTTP_STATUS.OK).json({
    message: SHIPPING_MESSAGES.REVERSE_GEOCODE_SUCCESS,
    result
  })
}
