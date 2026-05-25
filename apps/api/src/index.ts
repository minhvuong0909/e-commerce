import express from 'express'
import dotenv from 'dotenv'
import { swaggerSpec, swaggerUi } from './config/swagger.ui'
import databaseService from './services/database.service'
import userRouter from './routes/users.routers'
import { Request, Response, NextFunction } from 'express'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import productRouter from './routes/products.routers'
import mediasRouter from './routes/medias.routers'
import staticRouter from './routes/statics.routers'
import categoryRouter from './routes/categories.routers'
import brandsRouter from './routes/brands.routers'
import cartsRouter from './routes/carts.routers'
import ordersRouter from './routes/orders.routers'
import { seedDeliverysController } from './controllers/delivery_methods.controllers'
import deliveyRoutes from './routes/deliveries.routes'
import paymentRouter from './routes/payment.routers'

dotenv.config()
const cors = require('cors')

const app = express() //dùng express tạo 1 server
const port = process.env.PORT || 3000 //server sẽ chạy trên cổng port 3000
//
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
  })
)

// kết nối db
databaseService.connect()
// seed delivery methods
seedDeliverysController()
app.use(express.json()) // cho server xài middleware biến đổi json khi sử dụng post()
// gọi server dùng router để tạo
app.use('/users', userRouter)

app.use('/products', productRouter)

app.use('/medias', mediasRouter)

app.use('/static', staticRouter)

app.use('/category', categoryRouter)

app.use('/brand', brandsRouter)

app.use('/carts', cartsRouter)

app.use('/orders', ordersRouter)

app.use('/delivery-methods', deliveyRoutes)

app.use('/payment', paymentRouter)  

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
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
// app.listen(port, () => {
//   // seed delivery methods
//   console.log('Server backend đang chạy trên port 3000')
// })




app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server backend đang chạy trên port ${port}`)
})