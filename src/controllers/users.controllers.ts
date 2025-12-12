import { NextFunction, Request, Response } from 'express'
import {
  EmailVerifyReqQuery,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  TokenPayload
} from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.service'
import { UserVerifyStatus } from '~/constants/enums'
import { json } from 'sequelize'

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

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  // lấy email từ request body
  const { email } = req.body
  // check trùng
  const isEmailExist = await usersService.checkEmailExist(email)
  if (isEmailExist) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED, // 401
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
  const result = await usersService.register(req.body)
  // response
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, any, EmailVerifyReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { email_verify_token } = req.query
  const { user_id } = req.decode_email_verify_token as TokenPayload
  // check user có gửi lên kh
  const user = await usersService.checkEmailVerifyToken({ user_id, email_verify_token })
  if (user.verify_status === UserVerifyStatus.Banned) {
    res.status(HTTP_STATUS.ACCEPTED).json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    })
  } else {
    // verify email
    const result = await usersService.verifyEmail(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
      result
    })
  }
}

// logout
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  // lấy ra 2 token mình kí và đã lưu vào file định nghĩa
  const { user_id: user_id_at } = req.decode_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayload
  // check nếu nó gửi 2 token này với có cùng 1 user ?
  if (user_id_at !== user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }
  // check refresh_token và user_id có tồn tại ?
  await usersService.checkRefreshToken({ user_id: user_id_at, refresh_token })
  // nếu có thì logout và xóa rf
  await usersService.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

// resendEmailVerifyToken
export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  // lấy user từ access token đã lưu
  const { user_id } = req.decode_authorization as TokenPayload
  // tìm user từ user id
  const user = await usersService.findUserById(user_id)
  // check user đã verify chưa
  if (user.verify_status === UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFY
    })
  } else if (user.verify_status === UserVerifyStatus.Banned) {
    ;(res.status(HTTP_STATUS.OK),
      json({
        message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
      }))
  } else {
    // chưa verify
    await usersService.resendEmailVerify(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
    })
  }
}
