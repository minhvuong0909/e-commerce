import { message } from 'antd'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORY_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateCategoryReqBody } from '~/models/requests/Categories.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import categoryServices from '~/services/categories.services'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  // check user
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // user: admin  |  staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // create category
  const category = await categoryServices.createCategory(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: CATEGORY_MESSAGES.CREATE_CATEGORY_SUCCESS,
    result: category
  })
}

export const updateCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { category_id } = (req.params as any)
  // check user
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // user: admin  |  staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // create category
  const category = await categoryServices.updateCategory(category_id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: CATEGORY_MESSAGES.UPDATE_CATEGORY_SUCCESS,
    result: category
  })
}

export const deleteCategoryController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  // check user
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // user: admin  |  staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  const { category_id } = (req.params as any)
  await categoryServices.deleteCategory(category_id)
  res.status(HTTP_STATUS.OK).json({
    message: CATEGORY_MESSAGES.DELETE_CATEGORY_SUCCESS
  })
}

export const getCategoryController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.checkRole(user_id)
  // user: admin  |  staff
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.PERMISSION_DENIED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  const { category_id } = (req.params as any)
  const category = await categoryServices.getCategoryById(category_id)
  res.status(HTTP_STATUS.OK).json({
    message: CATEGORY_MESSAGES.GET_CATEGORY_SUCCESS,
    result: category
  })
}

// get category phân trang
export const getCategoriesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const page = Number(req.query.body) || 1
  const limit = Number(req.query.limit) || 10
  const categories = await databaseService.categories
    .find()
    .sort({ createdAt: -1 }) // sort desc
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  const totalPage = await databaseService.categories.countDocuments()
  res.status(HTTP_STATUS.OK).json({
    message: CATEGORY_MESSAGES.GET_CATEGORIES_SUCCESS,
    data: categories,
    pagination: {
      page,
      limit,
      totalItems: totalPage,
      totalPages: Math.ceil(totalPage / limit)
    }
  })
}
