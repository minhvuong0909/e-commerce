import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  clearCartController,
  createCartController,
  deleteCartItemController,
  getCartItemsController,
  updateCartItemController
} from '~/controllers/carts.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const cartsRouter = Router()

/**
 * POST /carts/create
 * Add a product to the current customer's cart.
 * Auth: access token, verified email, User role.
 * Features: creates the user's active cart when needed and appends/merges cart items.
 */
cartsRouter.post(
  '/create',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(createCartController)
)

/**
 * PUT /carts/items/update/:id
 * Update cart item quantity.
 * Auth: access token, verified email, User role.
 * Features: changes quantity before checkout and recalculates cart totals on the client.
 */
cartsRouter.put(
  '/items/update/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(updateCartItemController)
)

/**
 * DELETE /carts/items/delete/:id
 * Remove one item from the cart.
 * Auth: access token, verified email, User role.
 * Features: supports cart cleanup before checkout.
 */
cartsRouter.delete(
  '/items/delete/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(deleteCartItemController)
)

/**
 * DELETE /carts/clear
 * Clear the current customer's active cart.
 * Auth: access token, verified email, User role.
 * Features: removes every item after checkout completion or manual reset.
 */
cartsRouter.delete(
  '/clear',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(clearCartController)
)

/**
 * GET /carts/me
 * Current customer's cart.
 * Auth: access token, verified email, User role.
 * Features: returns cart items for navbar badge, cart page and checkout.
 */
cartsRouter.get(
  '/me',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(getCartItemsController)
)
export default cartsRouter
