import express, { Router } from 'express'
import { loginController, registerController, verifyEmailController } from '~/controllers/users.controllers'
import { emailVerifyTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
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
userRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(verifyEmailController))
export default userRouter
