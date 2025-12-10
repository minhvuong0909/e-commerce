import { NextFunction, Request, Response } from 'express'
import { LoginRequestBody } from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const result = await usersService.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
