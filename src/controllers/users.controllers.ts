import { NextFunction, Request, Response } from 'express'
import {
  ChangePasswordReqBody,
  EmailVerifyReqQuery,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenReqBody,
  RegisterRequestBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateProfileRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
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

// hàm forgot password
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  // check email exist
  const hasUser = await usersService.checkEmailExist(email)
  if (!hasUser) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else {
    // nếu tồn tại gửi link cho nó
    const forgot_password_token = await usersService.forgotPassword(email)

    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
      result: forgot_password_token
    })
  }
}

// hàm verify forgot password token
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  if (!req.decode_forgot_password_token) {
    return res.status(401).json({
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
    })
  }
  // kiểm tra token có trùng hợp
  const { forgot_password_token } = req.body
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  // tìm user
  const user = await usersService.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // kiểm tra token có đúng user gửi lên không
  if (user.forgot_password_token !== forgot_password_token) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_NOT_MATCH
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

// hàm reset password
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { forgot_password_token, password } = req.body
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  console.log('User: ', user_id)

  // tìm user
  const user = await usersService.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // kiểm tra token có cùng với user ?
  if (user.forgot_password_token !== forgot_password_token) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_NOT_MATCH
    })
  }
  // cập nhật mật khẩu
  await usersService.resetPassword({ user_id, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESEND_EMAIL_SUCCESS
  })
}

// hàm getMeController
export const getProfileController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.getProfile(user_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

// hàm update profile controller
export const updateProfileController = async (
  req: Request<ParamsDictionary, any, UpdateProfileRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  // check status của user
  if (user.verify_status !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
    })
  }
  // update profile
  const userInfo = await usersService.updateProfile({ user_id, payload: req.body })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    result: userInfo
  })
}

// hàm change password
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { old_password, password } = req.body
  // change
  await usersService.changePassword({ user_id, old_password, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

// hàm refresh token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, exp } = req.decode_refresh_token as TokenPayload
  // check trong db có refresh token hay khong
  await usersService.checkRefreshToken({ user_id, refresh_token })
  const result = await usersService.refreshToken({ user_id, refresh_token, exp })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
