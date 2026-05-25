import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import paymentService from '~/services/payment.services'
import paypalService from '~/services/paypal.services'

const FRONTEND_URL = process.env.FRONTEND_URL 

const getPayPalCaptureId = (captureResult: any, fallbackId: string) =>
  captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || fallbackId

const redirectToOrderResult = (res: Response, params: Record<string, string>) => {
  const query = new URLSearchParams(params)
  return res.redirect(`${FRONTEND_URL}/user/order-result?${query.toString()}`)
}

export const createMoMoPaymentController = async (req: Request<ParamsDictionary>, res: Response) => {
  const momoResponse = await paymentService.createMoMoPaymentUrl(((req.params as any).order_id as string))

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.CREATE_MOMO_PAYMENT_SUCCESS,
    result: {
      payUrl: momoResponse.payUrl,
      qrCodeUrl: momoResponse.qrCodeUrl,
      deeplink: momoResponse.deeplink,
      orderId: momoResponse.orderId
    }
  })
}

export const momoWebhookController = async (req: Request, res: Response) => {
  await paymentService.handleMoMoWebhook(req.body)
  res.sendStatus(HTTP_STATUS.NO_CONTENT)
}

export const createPayPalPaymentController = async (req: Request<ParamsDictionary>, res: Response) => {
  const approveUrl = await paypalService.createPayPalOrder(((req.params as any).order_id as string))

  res.status(HTTP_STATUS.OK).json({
    message: 'Tao don hang PayPal thanh cong!',
    result: {
      payUrl: approveUrl
    }
  })
}

export const paypalSuccessController = async (req: Request, res: Response) => {
  const paypalOrderId = req.query.token as string
  const orderId = req.query.order_id as string

  try {
    const captureResult = await paypalService.capturePayPalOrder(paypalOrderId, orderId)
    return redirectToOrderResult(res, {
      status: 'success',
      resultCode: '0',
      paymentMethod: 'PAYPAL',
      orderId,
      transId: getPayPalCaptureId(captureResult, paypalOrderId)
    })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return redirectToOrderResult(res, {
      status: 'fail',
      paymentMethod: 'PAYPAL',
      orderId: orderId || ''
    })
  }
}

export const mockMoMoPaymentSuccessController = async (req: Request<ParamsDictionary>, res: Response) => {
  const result = await paymentService.mockPaymentSuccess(((req.params as any).order_id as string))

  res.status(HTTP_STATUS.OK).json({
    message: result.message,
    result: {
      transId: result.transId
    }
  })
}
