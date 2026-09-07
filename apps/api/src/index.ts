import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { swaggerSpec, swaggerUi } from './config/swagger.ui'
import databaseService from './services/database.service'
import userRouter from './routes/users.routers'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import productRouter from './routes/products.routers'
import mediasRouter from './routes/medias.routers'
import staticRouter from './routes/statics.routers'
import categoryRouter from './routes/categories.routers'
import brandsRouter from './routes/brands.routers'
import cartsRouter from './routes/carts.routers'
import ordersRouter from './routes/orders.routers'
import { seedDeliverysController } from './controllers/delivery_methods.controllers'
import deliveryRoutes from './routes/deliveries.routes'
import paymentRouter from './routes/payment.routers'
import shippingRouter from './routes/shipping.routers'
import shopSettingsRouter from './routes/shop_settings.routers'
import vouchersRouter from './routes/vouchers.routers'
import reviewsRouter from './routes/reviews.routers'
import aiRouter from './routes/ai.routers'

dotenv.config()

const app = express() //dùng express tạo 1 server
const port = process.env.PORT || 3000 //server sẽ chạy trên cổng port 3000
//

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')
const splitOrigins = (value?: string) =>
  stripEnv(value)
    .split(',')
    .map((origin) => stripEnv(origin))
    .filter(Boolean)

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://vuongdev.top',
  'http://vuongdev.top',
  'http://160.22.107.250:8080'
]
const envOrigins = [
  ...splitOrigins(process.env.CORS_ORIGINS),
  stripEnv(process.env.CLIENT_URL),
  stripEnv(process.env.WEB_URL),
  stripEnv(process.env.FRONTEND_URL)
].filter(Boolean)
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

app.use(
  cors({
    origin: (origin: any, callback: any) => {
      // Cho phép request không có origin 
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'CORS policy does not allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
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

app.use('/delivery-methods', deliveryRoutes)

app.use('/payment', paymentRouter)

app.use('/shipping', shippingRouter)

app.use('/shop-settings', shopSettingsRouter)

app.use('/vouchers', vouchersRouter)

app.use('/reviews', reviewsRouter)

app.use('/ai', aiRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// error handler tập trung
app.use(defaultErrorHandler)

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server backend đang chạy trên port ${port}`)
})

// Trigger nodemon server restart for /ai/chat route
