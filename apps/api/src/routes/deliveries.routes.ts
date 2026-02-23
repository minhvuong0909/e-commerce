import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getAllDeliveryMethodsController } from '~/controllers/delivery_methods.controllers'
import { accessTokenValidator, checkPermissions } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const deliveyRoutes = Router()

deliveyRoutes.get(
  '/',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  wrapAsync(getAllDeliveryMethodsController)
)

export default deliveyRoutes
