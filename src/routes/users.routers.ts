import express, { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
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

export default userRouter
