import express, { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
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
export default userRouter
