import { Router } from 'express'
import {
  createMoMoPaymentController,
  momoWebhookController,
  momoReturnController,
  createPayPalPaymentController,
  paypalSuccessController,
  mockMoMoPaymentSuccessController,
  createPayOSPaymentController,
  payosWebhookController,
  payosReturnController,
  payosCancelController
} from '~/controllers/payment.controllers'
import { accessTokenValidator, requireVerifiedEmail, checkPermissions } from '~/middlewares/users.middlewares'
import { requirePaymentOwner } from '~/middlewares/payment.middlewares'
import { PaymentMethod, USER_ROLE } from '~/constants/enums'
import { wrapAsync } from '~/utils/handlers'
import { isMoMoSandboxMode } from '~/config/payment'

const paymentRouter = Router()

/**
 * POST /payment/momo/:order_id
 * Create a MoMo payment URL.
 * Auth: access token.
 * Features: returns payUrl/qrCodeUrl so the storefront can redirect customers to MoMo checkout.
 */

/**
 * POST /payment/momo/webhook
 * MoMo payment webhook.
 * Features: receives MoMo transaction status and updates order/payment state.
 */
paymentRouter.post('/momo/webhook', wrapAsync(momoWebhookController))
// Static webhook must precede the dynamic order route.
paymentRouter.post(
  '/momo/:order_id',
  accessTokenValidator,
  requireVerifiedEmail,
  requirePaymentOwner(PaymentMethod.MOMO),
  wrapAsync(createMoMoPaymentController)
)

/**
 * GET /payment/momo/return
 * MoMo customer return URL.
 * Features: handles the browser redirect after customers finish or leave MoMo payment.
 */
paymentRouter.get('/momo/return', wrapAsync(momoReturnController))

/**
 * POST /payment/paypal/create/:order_id
 * Create a PayPal payment session.
 * Auth: access token.
 * Features: initializes PayPal checkout for an existing order.
 */
paymentRouter.post(
  '/paypal/create/:order_id',
  accessTokenValidator,
  requireVerifiedEmail,
  requirePaymentOwner(PaymentMethod.PAYPAL),
  wrapAsync(createPayPalPaymentController)
)

/**
 * GET /payment/paypal/success
 * PayPal success callback.
 * Features: captures successful payment and updates the matching order.
 */
paymentRouter.get('/paypal/success', wrapAsync(paypalSuccessController))

/**
 * POST /payment/payos/create/:order_id
 * Create a PayOS payment link.
 * Auth: access token.
 * Features: starts bank transfer/QR checkout through PayOS for an existing order.
 */
paymentRouter.post(
  '/payos/create/:order_id',
  accessTokenValidator,
  requireVerifiedEmail,
  requirePaymentOwner(PaymentMethod.PAYOS),
  wrapAsync(createPayOSPaymentController)
)

/**
 * GET /payment/payos/return
 * PayOS customer return URL.
 * Features: handles browser return after successful PayOS payment.
 */
paymentRouter.get('/payos/return', wrapAsync(payosReturnController))

/**
 * GET /payment/payos/cancel
 * PayOS cancel URL.
 * Features: handles customer cancellation and returns them to the storefront.
 */
paymentRouter.get('/payos/cancel', wrapAsync(payosCancelController))

/**
 * POST /payment/payos/webhook
 * PayOS payment webhook.
 * Features: receives PayOS transaction status and updates order/payment state.
 */
paymentRouter.post('/payos/webhook', wrapAsync(payosWebhookController))

if (
  isMoMoSandboxMode &&
  process.env.NODE_ENV !== 'production' &&
  process.env.PAYMENT_MODE !== 'production' &&
  !process.argv.includes('--production') &&
  process.env.ENABLE_PAYMENT_MOCK === 'true'
) {
  /**
   * POST /payment/momo/mock-success/:order_id
   * MoMo sandbox-only test helper.
   * Auth: access token.
   * Features: marks a MoMo test payment as successful during local/demo development.
   */
  paymentRouter.post(
    '/momo/mock-success/:order_id',
    accessTokenValidator,
    checkPermissions(USER_ROLE.Admin),
    requireVerifiedEmail,
    requirePaymentOwner(PaymentMethod.MOMO),
    wrapAsync(mockMoMoPaymentSuccessController)
  )
}

export default paymentRouter
