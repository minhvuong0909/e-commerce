import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
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
    message: PRODUCT_MESSAGES.CREATE_PRODUCT_SUCCESS,
    result
  })
}

export const updateProductController = async (
  req: Request<ParamsDictionary, any, CreateProductBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // update
  const result = await productsService.updateProduct({ product_id: req.params.id, payload: req.body })
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.UPDATE_PRODUCT_SUCCESS,
    result
  })
}

export const getProductByIdController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string
  const product = await productsService.getProductById(id)
  return res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_PRODUCT_SUCCESS,
    result: product
  })
}

export const deleteProductController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // delete
  await productsService.deleteProduct(req.params.id)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.DELETE_PRODUCT_SUCCESS
  })
}

export const getProductsController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await productsService.getProducts(req)

  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_PRODUCTS_SUCCESS,
    result
  })
}
