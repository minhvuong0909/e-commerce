import { Router } from 'express'
import {
  getShippingQuoteController,
  getStoreInfoController,
  reverseGeocodeController
} from '~/controllers/shipping.controllers'
import { shippingLimiter } from '~/middlewares/rateLimit.middlewares'
import { wrapAsync } from '~/utils/handlers'

const shippingRouter = Router()

/**
 * GET /shipping/store
 * Public store shipping origin.
 * Features: returns warehouse/store address used by checkout shipping logic.
 */
shippingRouter.get('/store', wrapAsync(getStoreInfoController))

/**
 * POST /shipping/quote
 * Shipping fee estimate for checkout.
 * Public, rate-limited for guest checkout; no order or private account data.
 * Features: geocodes the customer address, estimates route distance and returns delivery fee.
 */
shippingRouter.post('/quote', shippingLimiter, wrapAsync(getShippingQuoteController))

/**
 * GET /shipping/reverse-geocode
 * Address helper for checkout maps/forms.
 * Public, rate-limited address lookup for guest checkout.
 * Features: converts latitude/longitude to a readable address.
 */
shippingRouter.get('/reverse-geocode', shippingLimiter, wrapAsync(reverseGeocodeController))

export default shippingRouter
