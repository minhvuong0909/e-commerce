import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Users.requests'
import ordersService from '~/services/orders.services'
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
  const order = await ordersService.createOrderItem({
    user_id: user_id,
    cart_item_id: req.body.items,
    payload: req.body
  })
  res.status(HTTP_STATUS.CREATED).json({
    message: ORDER_MESSAGES.CREATE_ORDER_SUCCESS,
    result: order
  })
}

// cập nhật trạng thái dơn hàng
export const updateOrderController = async (
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
  const order = await ordersService.updateOrderStatus({
    user_id: user_id,
    order_id: req.params.id
  })
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.UPDATE_ORDER_SUCCESS,
    result: order
  })
}

export const deleteOrderController = async (
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
  const order = await ordersService.deleteOrder({
    user_id: user_id,
    order_id: req.params.id
  })
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.DELETE_ORDER_SUCCESS
  })
}

export const getOrderByIdController = async (
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
  const order = await ordersService.getOrderById({
    user_id: user_id,
    order_id: req.params.id
  })
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ORDER_SUCCESS,
    result: order
  })
}

export const getAllMyOrdersController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  // check verify
  if (user.verify_status !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
    })
  }

  const orders = await ordersService.getAllMyOrders({ user_id })
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ALL_ORDERS_SUCCESS,
    result: orders
  })
}

export const getAllOrdersController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  if (user.verify_status !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
    })
  }
  const orders = await ordersService.getAllOrders()
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ALL_ORDERS_SUCCESS,
    result: orders
  })
}
