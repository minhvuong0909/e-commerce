import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getAllDeliveryMethodsController } from '~/controllers/delivery_methods.controllers'
import { accessTokenValidator, checkPermissions } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const deliveryRoutes = Router()

/**
 * GET /delivery-methods
 * Customer delivery method list.
 * Auth: access token, User role.
 * Features: returns active delivery options available during checkout.
 */
deliveryRoutes.get(
  '/',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  wrapAsync(getAllDeliveryMethodsController)
)

export default deliveryRoutes
