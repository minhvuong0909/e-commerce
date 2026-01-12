import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  createOrderController,
  deleteOrderController,
  getOrderByIdController,
  updateOrderController
} from '~/controllers/orders.controllers'
import { accessTokenValidator, checkPermissions } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const ordersRouter = Router()
/*
    description: create order
    method: POST
    body: {
        items: [cart_item_id1,..],
        payment_method: string,
    }
*/
ordersRouter.post('/create', accessTokenValidator, checkPermissions(USER_ROLE.User), wrapAsync(createOrderController))

/*
    description: update order status (duyệt đơn hàng)
    method: PUT
*/
ordersRouter.put(
  '/status/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Staff),
  wrapAsync(updateOrderController)
)

/*
    description: delete order (hủy đơn hàng)
    method: DELETE
*/
ordersRouter.delete('/:id', accessTokenValidator, checkPermissions(USER_ROLE.User), wrapAsync(deleteOrderController))

/*
    description: get order by id
    method: GET
*/
ordersRouter.get('/:id', accessTokenValidator, checkPermissions(USER_ROLE.User), wrapAsync(getOrderByIdController))

/*
    description: get all orders (admin, staff)
    method: GET
*/
// ordersRouter.get('/', accessTokenValidator, checkPermissions(USER_ROLE.Staff || USER_ROLE.Admin), wrapAsync(getAllOrdersController))
export default ordersRouter
