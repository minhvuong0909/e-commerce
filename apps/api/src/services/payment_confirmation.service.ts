import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentStatus } from '~/constants/enums'
import { badRequest } from '~/utils/security'
import databaseService from './database.service'

/** Commit payment + order together; a late callback cannot overwrite cancellation/refund. */
export async function confirmGatewayPayment(
  paymentId: ObjectId,
  gateway: string,
  transactionId?: string,
  raw?: unknown
) {
  return databaseService.withTransaction(async (session) => {
    const payment = await databaseService.payments.findOne({ _id: paymentId, payment_method: gateway }, { session })
    if (!payment) badRequest('Không tìm thấy giao dịch thanh toán.')
    const order = await databaseService.orders.findOne({ _id: payment.order_id }, { session })
    if (
      !order ||
      order.refund_state ||
      order.status === OrderStatus.Cancelled ||
      order.payment_status === PaymentStatus.REFUNDED ||
      payment.payment_status === PaymentStatus.REFUNDED ||
      order.payment_method !== gateway ||
      Number(order.total_price) !== Number(payment.amount)
    )
      badRequest('Đơn hàng không thể nhận giao dịch thanh toán này.')
    if (order.payment_status === PaymentStatus.COMPLETED && payment.payment_status === PaymentStatus.COMPLETED)
      return false
    await databaseService.orders.updateOne(
      { _id: order._id },
      { $set: { payment_status: PaymentStatus.COMPLETED, updated_at: new Date() } },
      { session }
    )
    await databaseService.payments.updateOne(
      { _id: paymentId },
      {
        $set: {
          payment_status: PaymentStatus.COMPLETED,
          updated_at: new Date(),
          ...(transactionId ? { gateway_trans_id: transactionId } : {}),
          ...(raw ? { raw_gateway_response: raw } : {})
        }
      },
      { session }
    )
    return true
  })
}
