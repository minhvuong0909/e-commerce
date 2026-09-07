import express from 'express'
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

/**
 * POST /products/create
 * Create a product from the admin product form.
 * Auth: access token.
 * Features: stores name, price, inventory, media, category, brand, shipping size and publish status.
 */
productRouter.post('/create', accessTokenValidator, createProductValidator, wrapAsync(createProductController))

/**
 * GET /products/:id
 * Public product detail.
 * Features: returns product information used by the storefront detail page, cart and checkout.
 */
productRouter.get('/:id', getProductByIdValidator, wrapAsync(getProductByIdController))

/**
 * PATCH /products/update/:id
 * Update an existing product.
 * Auth: access token.
 * Features: edits product content, images, price, inventory, category/brand mapping and visible status.
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
    'brand_id'
  ]),
  accessTokenValidator,
  createProductValidator,
  wrapAsync(updateProductController)
)

/**
 * DELETE /products/delete/:id
 * Delete a product.
 * Auth: access token.
 * Features: removes the product from the catalog when admin no longer sells it.
 */
productRouter.delete('/delete/:id', accessTokenValidator, wrapAsync(deleteProductController))

/**
 * GET /products
 * Public product catalog.
 * Features: supports storefront listing/search/filter/pagination and admin catalog views.
 */
productRouter.get('/', wrapAsync(getProductsController))
export default productRouter
