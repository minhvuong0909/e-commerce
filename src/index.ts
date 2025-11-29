import express from 'express'
import dotenv from 'dotenv'
import { swaggerSpec, swaggerUi } from './config/swagger.ui'
import router from './routes/users.routers'
dotenv.config()

const app = express() //dùng express tạo 1 server
const port = process.env.PORT //server sẽ chạy trên cổng port 3000
const sequelize = require('../src/services/database.service')
const userRoutes = router

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => {
  console.log(`Project này đang chạy trên post ${port}`)
})
;(async () => {
  try {
    await sequelize.authenticate()
    console.log('MySQL connected successfully!')
  } catch (error) {
    console.error('Unable to connect:', error)
  }
})()

// swagger route
app.use('/', userRoutes)
