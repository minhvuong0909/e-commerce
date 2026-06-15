import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Users.requests'
import ordersService from '~/services/orders.services'

export const createOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
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

// cập nhật trạng thái đơn hàng
export const updateOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const order = await ordersService.updateOrderStatus({
    user_id: user_id,
    order_id: (req.params as any).id as string,
    status: Number(req.body.status)
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
  await ordersService.deleteOrder({
    user_id: user_id,
    order_id: (req.params as any).id as string
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
  const order = await ordersService.getOrderById({
    user_id: user_id,
    order_id: (req.params as any).id as string
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
  const { orders, pagination } = await ordersService.getAllOrders(req)
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ALL_ORDERS_SUCCESS,
    result: orders,
    pagination
  })
}

export const refundOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const order = await ordersService.refundOrder({
    order_id: (req.params as { id: string }).id
  })
  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.REFUND_ORDER_SUCCESS,
    result: order
  })
}
