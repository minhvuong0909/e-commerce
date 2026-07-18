import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import paymentService from '~/services/payment.services'
import paypalService from '~/services/paypal.services'
import databaseService from '~/services/database.service'

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')
const CLIENT_URL = stripEnv(process.env.CLIENT_URL) || 'http://localhost:5173'

const getPayPalCaptureId = (captureResult: any, fallbackId: string) =>
  captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || fallbackId

const redirectToOrderResult = (res: Response, params: Record<string, string>) => {
  const query = new URLSearchParams(params)
  return res.redirect(`${CLIENT_URL}/user/order-result?${query.toString()}`)
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

export const momoReturnController = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.handleMoMoReturn(req.query as Record<string, unknown>)
    return redirectToOrderResult(res, {
      resultCode: result.resultCode,
      orderId: `ORDER-${result.order_id}`,
      amount: result.amount,
      transId: result.transId,
      message: result.gatewayMessage,
      paymentMethod: 'MOMO'
    })
  } catch (error: any) {
    console.error('MoMo return error:', error?.message || error)
    return redirectToOrderResult(res, {
      resultCode: '1',
      message: error?.message || 'Xac thuc thanh toan MoMo that bai.',
      paymentMethod: 'MOMO'
    })
  }
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

export const createPayOSPaymentController = async (req: Request<ParamsDictionary>, res: Response) => {
  const payosResponse = await paymentService.createPayOSPaymentUrl(((req.params as any).order_id as string))

  res.status(HTTP_STATUS.OK).json({
    message: 'Tạo liên kết thanh toán PayOS thành công!',
    result: {
      payUrl: payosResponse.checkoutUrl,
      orderCode: payosResponse.orderCode
    }
  })
}

export const payosWebhookController = async (req: Request, res: Response) => {
  await paymentService.handlePayOSWebhook(req.body)
  res.sendStatus(HTTP_STATUS.NO_CONTENT)
}

export const payosReturnController = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.handlePayOSReturn(req.query as Record<string, unknown>)
    return redirectToOrderResult(res, {
      resultCode: result.resultCode,
      orderId: result.order_id,
      amount: String(result.amount),
      transId: result.transId,
      message: result.gatewayMessage,
      paymentMethod: 'PAYOS'
    })
  } catch (error: any) {
    console.error('PayOS return error:', error?.message || error)
    return redirectToOrderResult(res, {
      resultCode: '1',
      message: error?.message || 'Xác thực thanh toán PayOS thất bại.',
      paymentMethod: 'PAYOS'
    })
  }
}

export const payosCancelController = async (req: Request, res: Response) => {
  const orderCode = req.query.orderCode as string
  let orderId = ''
  if (orderCode) {
    const payment = await databaseService.payments.findOne({
      payment_method: 'PAYOS',
      $or: [
        { gateway_trans_id: String(orderCode) },
        { 'raw_gateway_response.orderCode': Number(orderCode) }
      ]
    })
    if (payment) {
      orderId = payment.order_id.toString()
    }
  }
  return redirectToOrderResult(res, {
    resultCode: '1',
    message: 'Người dùng hủy thanh toán PayOS.',
    paymentMethod: 'PAYOS',
    orderId
  })
}
