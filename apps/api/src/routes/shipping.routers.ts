import { Router } from 'express'
import {
  getShippingQuoteController,
  getStoreInfoController,
  reverseGeocodeController
} from '~/controllers/shipping.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const shippingRouter = Router()

shippingRouter.get('/store', wrapAsync(getStoreInfoController))

shippingRouter.post('/quote', accessTokenValidator, wrapAsync(getShippingQuoteController))

shippingRouter.get('/reverse-geocode', accessTokenValidator, wrapAsync(reverseGeocodeController))

export default shippingRouter
