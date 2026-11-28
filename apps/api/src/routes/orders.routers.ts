import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  createGuestOrderController,
  createOrderController,
  deleteOrderController,
  getAllMyOrdersController,
  getAllOrdersController,
  getOrderByIdController,
  refundOrderController,
  updateOrderController
} from '~/controllers/orders.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
import { guestOrderLimiter, orderTrackLimiter } from '~/middlewares/rateLimit.middlewares'
import guestTrackingService from '~/services/guest_tracking.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { getDashboardSummaryController } from '~/controllers/dashboard.controllers'

const ordersRouter = Router()

/**
 * POST /orders/create
 * Create an authenticated customer order from cart items.
 * Auth: access token, verified email, User role.
 * Features: persists order lines, shipping/payment method and triggers order notification flow.
 */
ordersRouter.post(
  '/create',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(createOrderController)
)

/**
 * POST /orders/guest
 * Create a guest checkout order.
 * Features: lets customers order with name, phone and address without registering an account.
 */
ordersRouter.post('/guest', guestOrderLimiter, wrapAsync(createGuestOrderController))

/**
 * POST /orders/track
 * Public guest order lookup by short order code + the phone used at checkout.
 * Guest orders only; returns status, items and totals with masked recipient details.
 * Rate limited; unknown code and wrong phone return the same 404.
 */
ordersRouter.post(
  '/track',
  orderTrackLimiter,
  wrapAsync(async (req, res) => {
    const result = await guestTrackingService.track(req.body?.code, req.body?.phone)
    res.status(HTTP_STATUS.OK).json({ message: 'Track order success', result })
  })
)

/**
 * PUT /orders/status/:id
 * Update order status from admin/staff operations.
 * Auth: access token, verified email, Staff or Admin role.
 * Features: approves, processes or changes fulfillment status.
 */
ordersRouter.put(
  '/status/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Staff, USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(updateOrderController)
)

/**
 * PATCH /orders/status/:id
 * Partially update order status from admin/staff operations.
 * Auth: access token, verified email, Staff or Admin role.
 * Features: same status workflow as PUT for clients that use PATCH semantics.
 */
ordersRouter.patch(
  '/status/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Staff, USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(updateOrderController)
)

/**
 * DELETE /orders/:id
 * Cancel a customer's order.
 * Auth: access token, verified email, User role.
 * Features: supports customer-side order cancellation.
 */
ordersRouter.delete(
  '/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(deleteOrderController)
)

/**
 * GET /orders/:id
 * Order detail.
 * Auth: access token, verified email, User/Staff/Admin role.
 * Features: returns line items, totals, delivery and payment data for detail screens.
 */
ordersRouter.get(
  '/:id',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User, USER_ROLE.Staff, USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(getOrderByIdController)
)

/**
 * GET /orders/me/my-orders
 * Current customer's order history.
 * Auth: access token, verified email, User role.
 * Features: powers "My orders" in the storefront account area.
 */
ordersRouter.get(
  '/me/my-orders',
  accessTokenValidator,
  checkPermissions(USER_ROLE.User),
  requireVerifiedEmail,
  wrapAsync(getAllMyOrdersController)
)

/**
 * GET /orders/all/all-orders
 * Admin/staff order management list.
 * Auth: access token, Staff or Admin role.
 * Features: lists customer orders for dashboard, search, filtering and fulfillment operations.
 */
ordersRouter.get(
  '/all/all-orders',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Staff, USER_ROLE.Admin),
  wrapAsync(getAllOrdersController)
)

/**
 * GET /orders/stats/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Admin/staff dashboard figures computed server-side over ALL orders in the range
 * (recognised revenue, open orders, status mix, daily series, period-over-period change,
 * top products, low stock, reconciliation anomalies). Dates are in Asia/Ho_Chi_Minh.
 */
ordersRouter.get(
  '/stats/summary',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Staff, USER_ROLE.Admin),
  wrapAsync(getDashboardSummaryController)
)

/**
 * POST /orders/:id/refund
 * Refund an order.
 * Auth: access token, verified email, Admin role.
 * Features: triggers refund logic for paid orders and updates order/payment status.
 */
ordersRouter.post(
  '/:id/refund',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(refundOrderController)
)

export default ordersRouter
