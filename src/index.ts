import express from 'express'
import dotenv from 'dotenv'
import { swaggerSpec, swaggerUi } from './config/swagger.ui'
import databaseService from './services/database.service'
import router from './routes/users.routers'
dotenv.config()

const app = express() //dùng express tạo 1 server
const port = process.env.PORT //server sẽ chạy trên cổng port 3000
const userRoutes = router

// listen dùng để mở server ổ port 3000
async function startServer() {
  try {
    await databaseService.connect()
    console.log('MongoDB connected successfully')

    app.listen(port, () => {
      console.log(`SERVER BE đang chạy trên PORT ${port}`)
    })
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error)
    process.exit(1) // dừng server nếu DB fail
  }
}

startServer()
