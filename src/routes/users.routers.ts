import express, { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

// chia dự án thành nhìu router
const userRouter = express.Router()

/*
  description: login
  path: users/login
  method: POST
  body: {
    email: string,
    password: string
  }

*/
userRouter.post('/login', loginValidator, wrapAsync(loginController))

/*
  description: register
  path: users/register
  method: POST
  body: {
    name: string,
    email: string,
    password: string,
    confirm_password: string,
    date_of_birth: date
  }
*/
userRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
  desc: verify email => khi người dùng bấm vào link trong email.
thì họ gửi email_verify_token thông qua query
để mình kiểm tra, vậy thì trong query sẽ có token đó
mình sẽ verify và lưu payload vào decode_email_verify_token
  path: users/verify-email/?email_verify_token=string
  method: GET
*/
userRouter.get('/verify-email', emailVerifyTokenValidator, wrapAsync(verifyEmailController))

/*
  desc: logout => người dùng bấm logout thì kiểm tra at và rf có trùng user kh 
      nếu trùng thì xóa rf 
    path: users/logout
  method: post
  header: {Authorization: Bearer </access_token>} ==> 
  body: {
    refreshToken: string
  }
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
  desc: gửi lại link verify email khi người dùng muốn nhấn vào nút gửi lại email
  path: users/resend-verify-email
  method: POTST
  header: {
    Authorization: 'Bearer <access_token>'
  }
*/
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/* desc: thông báo bị quên mật khẩu, yêu cầu lấy lại
server kiểm tra email có tồn tại trong hệ thống k 
gửi link khôi phục account qua email cho người dùng
gửi lên email
  path: users/forgot-password
  body: {email: string}
  method: POST
*/
userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
  desc: Verify link in email to reset password
  path: /verify-forgot-password
  method: POST
  body: {
    verify_forgot_password_token
  }
*/
userRouter.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

/*
  desc: Reset password khi gửi đã verify forgot password token đã gửi qua mail
  path: rest-password
  method: POST
  body: {
    password: string,
    confirm_password: string,
    forgot_password_token: string
  }
*/
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

export default userRouter
