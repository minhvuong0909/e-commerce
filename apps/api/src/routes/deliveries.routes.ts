import { Router } from 'express'
import { getAllDeliveryMethodsController } from '~/controllers/delivery_methods.controllers'
import { wrapAsync } from '~/utils/handlers'

const deliveryRoutes = Router()

/**
 * GET /delivery-methods
 * Public delivery method list (name, description, type, status only — no customer data).
 * Must stay public: guest "buy now" checkout loads it before the shopper has an account,
 * and Admin/Staff use the same checkout. Previously User-only, which broke both.
 */
deliveryRoutes.get('/', wrapAsync(getAllDeliveryMethodsController))

export default deliveryRoutes
