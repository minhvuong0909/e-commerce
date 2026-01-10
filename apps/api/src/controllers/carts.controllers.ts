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

export const updateCartItemController = async (
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
  const cartItem = await cartsService.updateCartItem({
    user_id: user_id,
    cart_item_id: req.params.id,
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
  const user = await usersService.findUserById(user_id)
  // check verify status của user trước khi tạo cart
  if (user.verify_status !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
    })
  }
  await cartsService.deleteCartItem({
    user_id: user_id,
    cart_item_id: req.params.id
  })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.DELETE_CART_ITEM_SUCCESS
  })
}

export const getCartItemsController = async (
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
  const { cartItems, total_price } = await cartsService.getCartItemsByUserId({ user_id: req.params.user_id })
  res.status(HTTP_STATUS.OK).json({
    message: CART_MESSAGES.GET_CART_ITEMS_SUCCESS,
    data: { cartItems, total_price }
  })
}
