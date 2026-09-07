import { Router } from 'express'
import {
  getShippingQuoteController,
  getStoreInfoController,
  reverseGeocodeController
} from '~/controllers/shipping.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
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
 * Auth: access token.
 * Features: geocodes the customer address, estimates route distance and returns delivery fee.
 */
shippingRouter.post('/quote', accessTokenValidator, wrapAsync(getShippingQuoteController))

/**
 * GET /shipping/reverse-geocode
 * Address helper for checkout maps/forms.
 * Auth: access token.
 * Features: converts latitude/longitude to a readable address.
 */
shippingRouter.get('/reverse-geocode', accessTokenValidator, wrapAsync(reverseGeocodeController))

export default shippingRouter
