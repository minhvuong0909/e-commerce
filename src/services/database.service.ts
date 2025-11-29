import dotenv from 'dotenv'
import { env } from 'process'

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('ecommerce', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false
})

module.exports = sequelize
