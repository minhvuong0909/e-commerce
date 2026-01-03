import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateProductBody } from '~/models/requests/Products.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import productsService from '~/services/products.services'
import usersService from '~/services/users.services'

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  // check admin || staff
  const user = await usersService.checkRole(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // create product
  const result = await productsService.createProduct(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCESS,
    result
  })
}


export const updateProductController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  
}