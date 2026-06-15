import { Router } from 'express'
import {
  createSavedAddressController,
  deleteSavedAddressController,
  getSavedAddressesController,
  updateSavedAddressController
} from '~/controllers/user_addresses.controllers'
import { accessTokenValidator, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const userAddressesRouter = Router()

userAddressesRouter.get(
  '/',
  accessTokenValidator,
  requireVerifiedEmail,
  wrapAsync(getSavedAddressesController)
)

userAddressesRouter.post(
  '/',
  accessTokenValidator,
  requireVerifiedEmail,
  wrapAsync(createSavedAddressController)
)

userAddressesRouter.patch(
  '/:id',
  accessTokenValidator,
  requireVerifiedEmail,
  wrapAsync(updateSavedAddressController)
)

userAddressesRouter.delete(
  '/:id',
  accessTokenValidator,
  requireVerifiedEmail,
  wrapAsync(deleteSavedAddressController)
)

export default userAddressesRouter
