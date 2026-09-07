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

/**
 * GET /users/addresses
 * Saved address list for the current customer.
 * Auth: access token and verified email.
 * Features: returns reusable checkout addresses.
 */
userAddressesRouter.get('/', accessTokenValidator, requireVerifiedEmail, wrapAsync(getSavedAddressesController))

/**
 * POST /users/addresses
 * Create a saved customer address.
 * Auth: access token and verified email.
 * Features: stores a shipping address that can be reused at checkout.
 */
userAddressesRouter.post('/', accessTokenValidator, requireVerifiedEmail, wrapAsync(createSavedAddressController))

/**
 * PATCH /users/addresses/:id
 * Update a saved customer address.
 * Auth: access token and verified email.
 * Features: edits recipient, phone, address text or location data.
 */
userAddressesRouter.patch('/:id', accessTokenValidator, requireVerifiedEmail, wrapAsync(updateSavedAddressController))

/**
 * DELETE /users/addresses/:id
 * Delete a saved customer address.
 * Auth: access token and verified email.
 * Features: removes an address from the customer's checkout profile.
 */
userAddressesRouter.delete('/:id', accessTokenValidator, requireVerifiedEmail, wrapAsync(deleteSavedAddressController))

export default userAddressesRouter
