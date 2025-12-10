import express from 'express'
import dotenv from 'dotenv'
import { swaggerSpec, swaggerUi } from './config/swagger.ui'
import databaseService from './services/database.service'
import userRouter from './routes/users.routers'
import { Request, Response, NextFunction } from 'express'

import { defaultErrorHandler } from './middlewares/error.middlewares'
dotenv.config()

const app = express() //dùng express tạo 1 server
const port = process.env.PORT || 3000 //server sẽ chạy trên cổng port 3000

// kết nối db
databaseService.connect()
app.use(express.json()) // cho server xài middleware biến đổi json khi sử dụng post()
// gọi server dùng router để tạo
app.use('/users', userRouter)

// lỗi của controller ressponse
app.use(defaultErrorHandler)

// lỗi cuối cùng
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log('Lỗi nè: ' + error.message)
  res.status(error.status).json({
    message: error.message
  })
})

// listen dùng để mở server ổ port 3000
app.listen(port, () => {
  console.log('Server backend đang chạy trên port 3000')
})
