import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  createVoucherController,
  listVouchersController,
  validateVoucherController
} from '~/controllers/vouchers.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const vouchersRouter = Router()

/**
 * POST /vouchers/validate
 * Public checkout helper.
 * Features: checks whether a voucher code is active and calculates discount eligibility for the cart total.
 */
vouchersRouter.post('/validate', wrapAsync(validateVoucherController))

/**
 * GET /vouchers
 * Admin voucher list.
 * Auth: access token, Admin role.
 * Features: returns all configured voucher/coupon campaigns for the admin panel.
 */
vouchersRouter.get('', accessTokenValidator, checkPermissions(USER_ROLE.Admin), wrapAsync(listVouchersController))

/**
 * POST /vouchers
 * Admin voucher creation.
 * Auth: access token, verified email, Admin role.
 * Features: creates fixed amount or percentage discount codes for checkout.
 */
vouchersRouter.post(
  '',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(createVoucherController)
)

export default vouchersRouter
