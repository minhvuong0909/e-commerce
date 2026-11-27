import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIPPING_MESSAGES } from '~/constants/messages'
import shippingService from '~/services/shipping.services'
import { badRequest } from '~/utils/security'
import { ObjectId } from 'mongodb'

function validateCoordinates(lat: unknown, lng: unknown) {
  if (
    lat == null ||
    lng == null ||
    lat === '' ||
    lng === '' ||
    !['number', 'string'].includes(typeof lat) ||
    !['number', 'string'].includes(typeof lng) ||
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lng)) ||
    Math.abs(Number(lat)) > 90 ||
    Math.abs(Number(lng)) > 180
  )
    badRequest('Tọa độ không hợp lệ.')
}

export const getStoreInfoController = async (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    message: SHIPPING_MESSAGES.GET_STORE_INFO_SUCCESS,
    result: shippingService.getStoreInfo()
  })
}

export const getShippingQuoteController = async (req: Request, res: Response, _next: NextFunction) => {
  const { address_line, city, district, lat, lng, delivery_method_id } = req.body
  for (const value of [address_line, city, district])
    if (value !== undefined && (typeof value !== 'string' || value.length > 500)) badRequest('Địa chỉ không hợp lệ.')
  if (lat != null || lng != null) validateCoordinates(lat, lng)
  if (
    delivery_method_id !== undefined &&
    (typeof delivery_method_id !== 'string' || !ObjectId.isValid(delivery_method_id))
  )
    badRequest('Phương thức giao hàng không hợp lệ.')

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
  validateCoordinates(req.query.lat, req.query.lng)
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)

  const result = await shippingService.reverseGeocode(lat, lng)

  res.status(HTTP_STATUS.OK).json({
    message: SHIPPING_MESSAGES.REVERSE_GEOCODE_SUCCESS,
    result
  })
}
