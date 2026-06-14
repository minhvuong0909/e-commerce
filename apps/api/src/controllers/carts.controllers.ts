import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Users.requests'
import cartsService from '~/services/carts.services'

export const createCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const cart = await cartsService.createCartItem({ user_id: user_id, payload: req.body })
  res.status(HTTP_STATUS.CREATED).json({
    message: CART_MESSAGES.ADD_TO_CART_SUCCESS,
    data: cart
  })
}

export const updateCartItemController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const cartItem = await cartsService.updateCartItem({
    user_id: user_id,
    cart_item_id: (req.params as any).id as string,
    quantity: req.body.quantity
  })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.UPDATE_CART_ITEM_SUCCESS,
    result: cartItem
  })
}

export const deleteCartItemController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  await cartsService.deleteCartItem({
    user_id: user_id,
    cart_item_id: (req.params as any).id as string
  })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.DELETE_CART_ITEM_SUCCESS
  })
}

export const clearCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await cartsService.clearCart({ user_id })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.CLEAR_CART_SUCCESS,
    result
  })
}

export const getCartItemsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { cartItems, total_price } = await cartsService.getCartItemsByUserId({ user_id })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.GET_CART_ITEMS_SUCCESS,
    data: { cartItems, total_price }
  })
}
