import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  createVoucherController,
  deleteVoucherController,
  listVouchersController,
  updateVoucherController,
  validateVoucherController
} from '~/controllers/vouchers.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { voucherValidateLimiter } from '~/middlewares/rateLimit.middlewares'
import { wrapAsync } from '~/utils/handlers'

const vouchersRouter = Router()
const adminOnly = [accessTokenValidator, checkPermissions(USER_ROLE.Admin), requireVerifiedEmail]

/**
 * POST /vouchers/validate
 * Public checkout helper (rate limited so codes cannot be brute-forced).
 * Features: checks whether a voucher code is active and calculates the discount for the cart total.
 */
vouchersRouter.post('/validate', voucherValidateLimiter, wrapAsync(validateVoucherController))

/** GET /vouchers — Admin: list all vouchers with usage counters. */
vouchersRouter.get('', accessTokenValidator, checkPermissions(USER_ROLE.Admin), wrapAsync(listVouchersController))

/** POST /vouchers — Admin: create a percent (optionally capped) or fixed-amount voucher. */
vouchersRouter.post('', ...adminOnly, wrapAsync(createVoucherController))

/** PATCH /vouchers/:id — Admin: edit, schedule or enable/disable a voucher. Used vouchers keep their code. */
vouchersRouter.patch('/:id', ...adminOnly, wrapAsync(updateVoucherController))

/** DELETE /vouchers/:id — Admin: delete a never-used voucher (used ones must be disabled instead). */
vouchersRouter.delete('/:id', ...adminOnly, wrapAsync(deleteVoucherController))

export default vouchersRouter
