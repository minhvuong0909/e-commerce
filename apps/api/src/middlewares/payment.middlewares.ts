import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.service'
import { OrderStatus, PaymentMethod, PaymentStatus } from '~/constants/enums'
import { TokenPayload } from '~/models/requests/Users.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

/** A valid JWT alone does not grant access to another customer's payment. */
export const requirePaymentOwner =
  (method: PaymentMethod) => async (req: Request, _res: Response, next: NextFunction) => {
    const id = String(req.params.order_id ?? '')
    if (!ObjectId.isValid(id))
      throw new ErrorWithStatus({ message: 'Mã đơn hàng không hợp lệ.', status: HTTP_STATUS.BAD_REQUEST })
    const { user_id } = req.decode_authorization as TokenPayload
    const order = await databaseService.orders.findOne({ _id: new ObjectId(id), user_id: new ObjectId(user_id) })
    if (!order) throw new ErrorWithStatus({ message: 'Không tìm thấy đơn hàng.', status: HTTP_STATUS.NOT_FOUND })
    if (
      order.status === OrderStatus.Cancelled ||
      order.payment_status === PaymentStatus.REFUNDED ||
      order.payment_method !== method
    ) {
      throw new ErrorWithStatus({
        message: 'Đơn hàng không thể thanh toán bằng phương thức này.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    next()
  }
