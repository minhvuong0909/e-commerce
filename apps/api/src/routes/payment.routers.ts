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
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
import { isMoMoSandboxMode } from '~/config/payment'

const paymentRouter = Router()

/*
    description: Tạo URL thanh toán MoMo
    method: POST
    path: /payment/momo/:order_id
    headers: { Authorization: Bearer <access_token> }
    Luồng: 
      1. Frontend gửi order_id lên
      2. Backend tạo URL sang MoMo → trả về { payUrl, qrCodeUrl }
      3. Frontend chuyển hướng người dùng sang payUrl để quét QR / thanh toán
*/
paymentRouter.post('/momo/:order_id', accessTokenValidator, wrapAsync(createMoMoPaymentController))

/*
    description: Webhook nhận kết quả thanh toán từ MoMo
    method: POST
    path: /payment/momo/webhook
*/
paymentRouter.post('/momo/webhook', wrapAsync(momoWebhookController))

/*
    description: MoMo redirect user ve sau khi thanh toan
    method: GET
    path: /payment/momo/return
*/
paymentRouter.get('/momo/return', wrapAsync(momoReturnController))

/*
    description: Tạo đơn hàng thanh toán PayPal
    method: POST
    path: /payment/paypal/create/:order_id
    headers: { Authorization: Bearer <access_token> }
*/
paymentRouter.post('/paypal/create/:order_id', accessTokenValidator, wrapAsync(createPayPalPaymentController))

/*
    description: PayPal callback nhận kết quả thanh toán thành công
    method: GET
    path: /payment/paypal/success
*/
paymentRouter.get('/paypal/success', wrapAsync(paypalSuccessController))

/*
    description: Tạo liên kết thanh toán PayOS
    method: POST
    path: /payment/payos/create/:order_id
*/
paymentRouter.post('/payos/create/:order_id', accessTokenValidator, wrapAsync(createPayOSPaymentController))

/*
    description: PayOS callback nhận kết quả chuyển khoản thành công
    method: GET
    path: /payment/payos/return
*/
paymentRouter.get('/payos/return', wrapAsync(payosReturnController))

/*
    description: PayOS callback khi người dùng hủy giao dịch
    method: GET
    path: /payment/payos/cancel
*/
paymentRouter.get('/payos/cancel', wrapAsync(payosCancelController))

/*
    description: Webhook nhận kết quả thanh toán từ PayOS
    method: POST
    path: /payment/payos/webhook
*/
paymentRouter.post('/payos/webhook', wrapAsync(payosWebhookController))

if (isMoMoSandboxMode) {
  paymentRouter.post(
    '/momo/mock-success/:order_id',
    accessTokenValidator,
    wrapAsync(mockMoMoPaymentSuccessController)
  )
}

export default paymentRouter
