import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Users.requests'
import usersService from '~/services/users.services'

export const createOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  // check verify status của user trước khi tạo cart
  if (user.verify_status !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
    })
  }
  const order = await ordersService.createOrder({
    user_id: user_id,
    items: req.body.items,
    shipping_address: req.body.shipping_address,
    payment_method: req.body.payment_method
  })
  res.status(HTTP_STATUS.CREATED).json({
    message: ORDER_MESSAGES.CREATE_ORDER_SUCCESS,
    result: order
  })
}
