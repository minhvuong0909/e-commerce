import { Router } from 'express'
import {
  createBrandController,
  deleteBrandController,
  getBrandController,
  getBrandsController,
  updateBrandController
} from '~/controllers/brands.controllers'
import { createBrandValidator } from '~/middlewares/brands.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const brandsRouter = Router()

/**
 * POST /brand/create
 * Create a product brand.
 * Auth: access token.
 * Features: stores brand identity used by product cards, filters and admin product setup.
 */
brandsRouter.post('/create', accessTokenValidator, createBrandValidator, wrapAsync(createBrandController))

/**
 * PATCH /brand/update/:brand_id
 * Update a product brand.
 * Auth: access token.
 * Features: edits brand name and related display information.
 */
brandsRouter.patch('/update/:brand_id', accessTokenValidator, createBrandValidator, wrapAsync(updateBrandController))

/**
 * DELETE /brand/delete/:brand_id
 * Delete a product brand.
 * Auth: access token.
 * Features: removes a brand that is no longer part of the catalog.
 */
brandsRouter.delete('/delete/:brand_id', accessTokenValidator, wrapAsync(deleteBrandController))

/**
 * GET /brand/:brand_id
 * Brand detail.
 * Features: returns a single brand for product/admin views.
 */
brandsRouter.get('/:brand_id', wrapAsync(getBrandController))

/**
 * GET /brand
 * Public brand list.
 * Features: powers storefront filters and product form dropdowns.
 */
brandsRouter.get('/', wrapAsync(getBrandsController))
export default brandsRouter
