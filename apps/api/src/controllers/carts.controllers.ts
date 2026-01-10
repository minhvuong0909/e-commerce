import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Users.requests'
import cartsService from '~/services/carts.services'
import usersService from '~/services/users.services'

export const createCartController = async (
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
  // create cart
  const cart = await cartsService.createCartItem({ user_id: user_id, payload: req.body })
  res.status(HTTP_STATUS.CREATED).json({
    message: CART_MESSAGES.ADD_TO_CART_SUCCESS,
    data: cart
  })
}
