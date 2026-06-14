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

/* 
// khi client add to cart thì sẽ tạo cart cho user và thêm cart item vào cart đó
    Description: create cart item
    method: POST
    body: {
        user_id: string;
        created_at?: Date;
        updated_at?: Date;
        }   
*/

cartsRouter.post(
  '/create',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(createCartController)
)

/* 
    Description: update cart item
    method: PUT
    body: {
        qwanitity: number;
        }   
*/
cartsRouter.put(
  '/items/update/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(updateCartItemController)
)

/*
    Description: delete cart item
    method: DELETE
    body: {
        }
*/
cartsRouter.delete(
  '/items/delete/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(deleteCartItemController)
)

/*
    Description: clear all items in the user's active cart
    method: DELETE
    path: /carts/clear
*/
cartsRouter.delete(
  '/clear',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(clearCartController)
)

/* 

    Description: get cart items by user id
    method: GET
*/
cartsRouter.get(
  '/me',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(getCartItemsController)
)
export default cartsRouter
