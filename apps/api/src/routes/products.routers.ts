import express, { Router } from 'express'
import { cloneDeep } from 'lodash'
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  getProductsController,
  updateProductController
} from '~/controllers/products.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createProductValidator, getProductByIdValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { CreateProductBody } from '~/models/requests/Products.requests'
import { wrapAsync } from '~/utils/handlers'
const productRouter = express.Router()

/*
  description: create product
  path: products/create
  method: POST
  body: createProductBody
*/
productRouter.post('/create', accessTokenValidator, createProductValidator, wrapAsync(createProductController))

/*
Description: get a product by id
    path: /products/:id
    method: GET
*/
productRouter.get('/:id', getProductByIdValidator, wrapAsync(getProductByIdController))

/*
Description: update a product by id
    path: /products/update/:id
    method: patch
*/
productRouter.patch(
  '/update/:id',
  filterMiddleware<CreateProductBody>([
    'name',
    'quantity',
    'price',
    'description',
    'origin',
    'volume',
    'weight',
    'width',
    'height',
    'status',
    'medias',
    'thumbnail',
    'category_id',
    'ship_category_id',
    'medias',
    'brand_id'
  ]),
  accessTokenValidator,
  createProductValidator,
  wrapAsync(updateProductController)
)

/*
Description: delete a product by id
    path: /products/delete/:id
    method: delete
*/
productRouter.delete('/delete/:id', accessTokenValidator, wrapAsync(deleteProductController))

/*
Description: get all products
    path: /
    method: get
*/
productRouter.get('/', wrapAsync(getProductsController))
export default productRouter
