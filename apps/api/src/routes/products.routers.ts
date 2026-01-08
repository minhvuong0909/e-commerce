import express, { Router } from 'express'
import { cloneDeep } from 'lodash'
import { createProductController } from '~/controllers/products.controllers'
import { createProductValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const productRouter = express.Router()

/*
  description: create product
  path: products/create
  method: POST
  body: createProductBody
*/
productRouter.post('/create', accessTokenValidator, createProductValidator, wrapAsync(createProductController))

// productRouter.

export default productRouter
