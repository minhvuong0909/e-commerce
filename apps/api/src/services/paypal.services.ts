import https from 'https'
import { ObjectId } from 'mongodb'
import { PaymentStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from './database.service'
import paymentService from './payment.services'

const getPositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const PAYPAL_CONFIG = {
  apiUrl: process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com',
  returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/paypal/success',
  cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:5173/user/orders',
  vndPerUsd: getPositiveNumber(process.env.PAYPAL_VND_PER_USD, 25000)
}

type PayPalLink = {
  rel: string
  href: string
}

type PayPalTokenResponse = {
  access_token?: string
  message?: string
}

type PayPalOrderResponse = {
  id?: string
  links?: PayPalLink[]
  message?: string
}

type PayPalCaptureResponse = {
  status?: string
  message?: string
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string
      }>
    }
  }>
}

class PaypalService {
  private request<T>(path: string, method: string, headers: Record<string, string>, body?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${PAYPAL_CONFIG.apiUrl}${path}`)
      const req = https.request(
        {
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method,
          headers
        },
        (res) => {
          let responseBody = ''
          res.on('data', (chunk) => (responseBody += chunk))
          res.on('end', () => {
            try {
              resolve(JSON.parse(responseBody) as T)
            } catch {
              resolve(responseBody as T)
            }
          })
        }
      )

      req.on('error', reject)
      if (body) req.write(body)
      req.end()
    })
  }

  private getJsonHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  private assertValidOrderId(orderId: string) {
    if (!ObjectId.isValid(orderId)) {
      throw new ErrorWithStatus({
        message: 'Ma don hang khong hop le.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  }

  async getAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID || ''
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''

    if (!clientId || !clientSecret) {
      throw new ErrorWithStatus({
        message: 'Chua cau hinh PAYPAL_CLIENT_ID hoac PAYPAL_CLIENT_SECRET trong file .env.',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const response = await this.request<PayPalTokenResponse>(
      '/v1/oauth2/token',
      'POST',
      {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'grant_type=client_credentials'
    )

    if (!response.access_token) {
      console.error('PayPal OAuth response:', response)
      throw new ErrorWithStatus({
        message: 'Lay token PayPal that bai. Vui long kiem tra Client ID va Client Secret.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return response.access_token
  }

  async createPayPalOrder(orderId: string): Promise<string> {
    this.assertValidOrderId(orderId)

    const orderObjectId = new ObjectId(orderId)
    const order = await databaseService.orders.findOne({ _id: orderObjectId })
    if (!order) {
      throw new ErrorWithStatus({
        message: 'Khong tim thay don hang.',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (order.payment_status === PaymentStatus.COMPLETED) {
      throw new ErrorWithStatus({
        message: 'Don hang nay da duoc thanh toan.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const accessToken = await this.getAccessToken()
    const amountUsd = (order.total_price / PAYPAL_CONFIG.vndPerUsd).toFixed(2)

    const requestBody = JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: amountUsd
          },
          description: `Thanh toan don hang #${orderId}`
        }
      ],
      application_context: {
        brand_name: 'E-Commerce Store',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${PAYPAL_CONFIG.returnUrl}?order_id=${orderId}`,
        cancel_url: PAYPAL_CONFIG.cancelUrl
      }
    })

    const paypalOrder = await this.request<PayPalOrderResponse>(
      '/v2/checkout/orders',
      'POST',
      this.getJsonHeaders(accessToken),
      requestBody
    )

    const approveLink = paypalOrder.links?.find((link) => link.rel === 'approve')
    if (!paypalOrder.id || !approveLink) {
      console.error('PayPal Create Order Error:', paypalOrder)
      throw new ErrorWithStatus({
        message: `PayPal Error: ${paypalOrder.message || 'Khong the tao giao dich PayPal.'}`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseService.payments.updateOne(
      { order_id: orderObjectId, payment_method: 'PAYPAL' },
      {
        $set: {
          order_id: orderObjectId,
          user_id: order.user_id,
          amount: order.total_price,
          payment_method: 'PAYPAL',
          payment_status: PaymentStatus.PENDING,
          gateway_trans_id: paypalOrder.id,
          raw_gateway_response: paypalOrder,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: new Date()
        }
      },
      { upsert: true }
    )

    return approveLink.href
  }

  async capturePayPalOrder(paypalOrderId: string, orderId: string): Promise<PayPalCaptureResponse> {
    this.assertValidOrderId(orderId)
    if (!paypalOrderId) {
      throw new ErrorWithStatus({
        message: 'Thieu ma giao dich PayPal.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const orderObjectId = new ObjectId(orderId)
    const payment = await databaseService.payments.findOne({
      gateway_trans_id: paypalOrderId,
      order_id: orderObjectId,
      payment_method: 'PAYPAL'
    })

    if (!payment) {
      throw new ErrorWithStatus({
        message: 'Khong tim thay giao dich PayPal tuong ung voi don hang.',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (payment.payment_status === PaymentStatus.COMPLETED) {
      return payment.raw_gateway_response as PayPalCaptureResponse
    }

    const accessToken = await this.getAccessToken()
    const captureResult = await this.request<PayPalCaptureResponse>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      'POST',
      this.getJsonHeaders(accessToken)
    )

    if (captureResult.status !== 'COMPLETED') {
      console.error('PayPal Capture Error:', captureResult)
      await databaseService.payments.updateOne(
        { _id: payment._id },
        {
          $set: {
            payment_status: PaymentStatus.FAILED,
            raw_gateway_response: captureResult,
            updated_at: new Date()
          }
        }
      )

      throw new ErrorWithStatus({
        message: `Thanh toan PayPal khong hoan thanh. Trang thai: ${captureResult.status || captureResult.message}`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseService.payments.updateOne(
      { _id: payment._id },
      {
        $set: {
          payment_status: PaymentStatus.COMPLETED,
          raw_gateway_response: captureResult,
          updated_at: new Date()
        }
      }
    )

    await databaseService.orders.updateOne(
      { _id: orderObjectId },
      {
        $set: {
          payment_status: PaymentStatus.COMPLETED,
          updated_at: new Date()
        }
      }
    )

    const order = await databaseService.orders.findOne({ _id: orderObjectId })
    if (order) {
      paymentService
        .sendPaymentConfirmationEmail(orderId, order.total_price.toString(), paypalOrderId, 'PayPal', 'PayPal')
        .catch((err) => console.error('Gui email xac nhan thanh toan PayPal that bai:', err))
    }

    return captureResult
  }
}

const paypalService = new PaypalService()
export default paypalService
