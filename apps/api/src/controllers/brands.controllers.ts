import { message } from 'antd'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANDS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateBrandReqBody } from '~/models/requests/Brands.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import brandsService from '~/services/brands.services'
import usersService from '~/services/users.services'

export const createBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // admin || staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }

  const brand = await brandsService.createBrand(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: BRANDS_MESSAGES.CREATE_BRAND_SUCCESS,
    result: brand
  })
}

export const updateBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandReqBody>,
  res: Response,
  next: NextFunction
) => {
  const brand_id = ((req.params as any).brand_id as string) as string
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // admin || staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }

  const brand = await brandsService.updateBrand(brand_id, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.UPDATE_BRAND_SUCCESS,
    result: brand
  })
}

export const deleteBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandReqBody>,
  res: Response,
  next: NextFunction
) => {
  const brand_id = ((req.params as any).brand_id as string) as string
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // admin || staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }

  await brandsService.deleteBrand(brand_id)
  res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.DELETE_BRAND_SUCCESS
  })
}

export const getBrandController = async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
  const brand_id = ((req.params as any).brand_id as string) as string
  const brand = await brandsService.getBrandById(brand_id)
  return res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.GET_BRAND_SUCCESS,
    result: brand
  })
}

export const getBrandsController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const { brands, pagination } = await brandsService.getBrandsList({ page, limit, search })

  res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.GET_BRANDS_SUCCESS,
    data: brands,
    pagination
  })
}
