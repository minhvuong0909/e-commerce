import express, { Router } from 'express'
import { cloneDeep } from 'lodash'
import { createProductController, getProductByIdController } from '~/controllers/products.controllers'
import { createProductValidator, getProductByIdValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const productRouter = express.Router()

/*
  description: create product
  path: products/create
  method: POST
  body: createProductBody
*/
productRouter.post('/create', createProductValidator, wrapAsync(createProductController))

/*
Description: get a product by id
    path: /products/:id
    method: GET
*/
productRouter.get('/:id', accessTokenValidator, getProductByIdValidator, wrapAsync(getProductByIdController))
export default productRouter
