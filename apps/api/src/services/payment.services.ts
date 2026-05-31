import crypto from 'crypto'
import https from 'https'
import { ObjectId } from 'mongodb'
import { PaymentStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import databaseService from './database.service'
import nodemailer from 'nodemailer'

// Tái sử dụng cùng cấu hình Gmail SMTP đã có sẵn trong dự án
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

// Đăng ký tại: https://business.momo.vn/
const MOMO_SANDBOX_CONFIG = {
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
}

const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || MOMO_SANDBOX_CONFIG.endpoint
const isMoMoSandbox = MOMO_ENDPOINT.includes('test-payment.momo.vn')

const MOMO_CONFIG = {
  partnerCode: isMoMoSandbox
    ? MOMO_SANDBOX_CONFIG.partnerCode
    : process.env.MOMO_PARTNER_CODE || MOMO_SANDBOX_CONFIG.partnerCode,
  accessKey: isMoMoSandbox
    ? MOMO_SANDBOX_CONFIG.accessKey
    : process.env.MOMO_ACCESS_KEY || MOMO_SANDBOX_CONFIG.accessKey,
  secretKey: isMoMoSandbox
    ? MOMO_SANDBOX_CONFIG.secretKey
    : process.env.MOMO_SECRET_KEY || MOMO_SANDBOX_CONFIG.secretKey,
  endpoint: MOMO_ENDPOINT,
  ipnUrl: process.env.MOMO_IPN_URL || 'https://rented-skirt-giddy.ngrok-free.dev/payment/momo/webhook',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/user/order-result'
}

class PaymentService {
  // Tạo URL thanh toán MoMo (QR Code / App)
  async createMoMoPaymentUrl(order_id: string) {
    // 1. Lấy thông tin đơn hàng từ DB
    const order = await databaseService.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) {
      throw new ErrorWithStatus({
        message: PAYMENT_MESSAGES.PAYMENT_ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // 2. Kiểm tra nếu đơn đã được thanh toán rồi
    if (order.payment_status === PaymentStatus.COMPLETED) {
      throw new ErrorWithStatus({
        message: PAYMENT_MESSAGES.PAYMENT_ALREADY_COMPLETED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // 3. Xây dựng payload gửi sang MoMo
    const requestId = `${MOMO_CONFIG.partnerCode}-${Date.now()}`
    const orderId = `ORDER-${order_id}-${Date.now()}`
    const orderInfo = `Thanh toan don hang #${order_id}`
    const amount = order.total_price.toString()
    const requestType = 'captureWallet'
    const extraData = '' // Dữ liệu thêm (bỏ trống nếu không cần)

    // 4. Tạo chữ ký HMAC SHA256 (bảo mật, ngăn giả mạo)
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`
    ].join('&')

    const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex')

    // 5. Payload đầy đủ gửi sang API của MoMo
    const requestBody = JSON.stringify({
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    })

    // 6. Gọi API MoMo và nhận về payUrl
    const momoResponse = await this._callMoMoApi(requestBody)
    if (momoResponse.resultCode !== 0) {
      throw new ErrorWithStatus({
        message: `MoMo Error: ${momoResponse.message} (Mã lỗi: ${momoResponse.resultCode})`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tạo bản ghi Payment với trạng thái PENDING
    await databaseService.payments.insertOne({
      order_id: new ObjectId(order_id),
      user_id: order.user_id,
      amount: order.total_price,
      payment_method: 'MOMO',
      payment_status: PaymentStatus.PENDING,
      gateway_trans_id: momoResponse.transId || momoResponse.orderId || orderId,
      raw_gateway_response: momoResponse,
      created_at: new Date(),
      updated_at: new Date()
    })

    return momoResponse
  }

  // Xử lý Webhook MoMo gọi về sau khi khách hàng thanh toán
  async handleMoMoWebhook(webhookData: any) {
    const {
      orderId,
      resultCode,
      signature: momoSignature,
      amount,
      requestId,
      orderInfo,
      partnerCode,
      transId,
      message,
      extraData
    } = webhookData

    // 1. Xác minh chữ ký từ MoMo để đảm bảo dữ liệu không bị giả mạo
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${webhookData.orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${webhookData.payType}`,
      `requestId=${requestId}`,
      `responseTime=${webhookData.responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`
    ].join('&')

    const expectedSignature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex')

    if (expectedSignature !== momoSignature) {
      throw new ErrorWithStatus({
        message: PAYMENT_MESSAGES.MOMO_WEBHOOK_INVALID_SIGNATURE,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    // 2. Trích xuất order_id từ orderId của MoMo
    const parts = orderId.split('-')
    const order_id = parts[1] // lấy phần ID thật

    // 3. Cập nhật trạng thái đơn hàng và giao dịch dựa trên kết quả từ MoMo
    if (resultCode === 0) {
      // Thanh toán thành công
      await databaseService.orders.updateOne(
        { _id: new ObjectId(order_id) },
        {
          $set: {
            payment_status: PaymentStatus.COMPLETED,
            updated_at: new Date()
          }
        }
      )

      await databaseService.payments.updateOne(
        { order_id: new ObjectId(order_id), payment_method: 'MOMO' },
        {
          $set: {
            payment_status: PaymentStatus.COMPLETED,
            gateway_trans_id: transId,
            raw_gateway_response: webhookData,
            updated_at: new Date()
          }
        }
      )
      console.log(`Đơn hàng ${order_id} đã thanh toán thành công qua MoMo. MoMo TransId: ${transId}`)

      // 4. Gửi email xác nhận thanh toán thành công cho khách hàng
      this.sendPaymentConfirmationEmail(order_id, amount, transId, 'Ví MoMo', 'MoMo').catch((err) =>
        console.error('Gửi email xác nhận thanh toán thất bại:', err)
      )
    } else {
      // Thanh toán thất bại
      await databaseService.orders.updateOne(
        { _id: new ObjectId(order_id) },
        {
          $set: {
            payment_status: PaymentStatus.FAILED,
            updated_at: new Date()
          }
        }
      )

      await databaseService.payments.updateOne(
        { order_id: new ObjectId(order_id), payment_method: 'MOMO' },
        {
          $set: {
            payment_status: PaymentStatus.FAILED,
            gateway_trans_id: transId,
            raw_gateway_response: webhookData,
            updated_at: new Date()
          }
        }
      )
      console.log(`❌ Đơn hàng ${order_id} thanh toán thất bại. Mã lỗi: ${resultCode} - ${message}`)
    }

    return { message: PAYMENT_MESSAGES.MOMO_WEBHOOK_SUCCESS }
  }

  // -------------------------------------------------------
  // Gửi email xác nhận thanh toán thành công
  // -------------------------------------------------------
  public async sendPaymentConfirmationEmail(
    order_id: string,
    amount: string,
    transId: string,
    paymentMethodName = 'Ví MoMo',
    gatewayName = 'MoMo'
  ) {
    // Tìm đơn hàng để lấy user_id
    const order = await databaseService.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) return

    // Tìm user để lấy email
    const user = await databaseService.users.findOne({ _id: order.user_id })
    if (!user || !user.email) return

    const formattedAmount = Number(amount).toLocaleString('vi-VN')
    const orderDate = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

    await transporter.sendMail({
      from: process.env.GMAIL_USER as string,
      to: user.email,
      subject: `Thanh toán thành công - Đơn hàng #${order_id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Thanh toán thành công!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Đơn hàng của bạn đã được xác nhận</p>
          </div>

          <div style="padding: 32px 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Mã đơn hàng</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">#${order_id.slice(-6).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Số tiền</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #16a34a; font-size: 18px;">${formattedAmount}đ</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Phương thức</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">${paymentMethodName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Mã giao dịch ${gatewayName}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">${transId}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Thời gian</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">${orderDate}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/user/orders/${order_id}"
                style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
                Xem chi tiết đơn hàng
              </a>
            </div>

            <p style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
              Cảm ơn bạn đã mua hàng! Đơn hàng sẽ được xử lý và giao đến bạn trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      `
    })
    console.log(`📧 Đã gửi email xác nhận thanh toán đến ${user.email}`)
  }

  // callback
  private _callMoMoApi(requestBody: string): Promise<any> {
    const url = new URL(MOMO_CONFIG.endpoint)

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(new Error('Cannot parse MoMo response'))
          }
        })
      })

      req.on('error', reject)
      req.write(requestBody)
      req.end()
    })
  }

  // -------------------------------------------------------
  // Giả lập thanh toán thành công dành cho Test Free
  // -------------------------------------------------------
  async mockPaymentSuccess(order_id: string) {
    const order = await databaseService.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy đơn hàng.',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Cập nhật trạng thái đơn hàng thành công
    await databaseService.orders.updateOne(
      { _id: new ObjectId(order_id) },
      {
        $set: {
          payment_status: PaymentStatus.COMPLETED,
          updated_at: new Date()
        }
      }
    )

    // Tạo hoặc cập nhật bản ghi Payment thành công
    const mockTransId = `MOCK-TRANS-${Date.now()}`
    await databaseService.payments.updateOne(
      { order_id: new ObjectId(order_id) },
      {
        $set: {
          order_id: new ObjectId(order_id),
          user_id: order.user_id,
          amount: order.total_price,
          payment_method: 'MOMO_MOCK',
          payment_status: PaymentStatus.COMPLETED,
          gateway_trans_id: mockTransId,
          updated_at: new Date()
        }
      },
      { upsert: true }
    )

    console.log(` Đơn hàng ${order_id} đã được giả lập thanh toán thành công.`)

    // Gửi email xác nhận thanh toán thành công
    const amount = order.total_price.toString()
    this.sendPaymentConfirmationEmail(order_id, amount, mockTransId).catch((err) =>
      console.error('[TEST MODE] Gửi email giả lập thanh toán thất bại:', err)
    )

    return { message: 'Giả lập thanh toán thành công!', transId: mockTransId }
  }
}

const paymentService = new PaymentService()
export default paymentService
