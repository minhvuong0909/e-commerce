import { Router } from 'express'
import {
  createMoMoPaymentController,
  momoWebhookController,
  createPayPalPaymentController,
  paypalSuccessController,
  mockMoMoPaymentSuccessController
} from '~/controllers/payment.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

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

// /*
//     description: Giả lập thanh toán MoMo thành công 
//     method: POST
//     path: /payment/momo/mock-success/:order_id
//     headers: { Authorization: Bearer <access_token> }
// */
// paymentRouter.post('/momo/mock-success/:order_id', accessTokenValidator, wrapAsync(mockMoMoPaymentSuccessController))

export default paymentRouter
