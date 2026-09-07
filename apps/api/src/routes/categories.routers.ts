import { Router } from 'express'
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController
} from '~/controllers/categories.controllers'
import { createCategoryValidator } from '~/middlewares/categories.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { CreateCategoryReqBody } from '~/models/requests/Categories.requests'
import { wrapAsync } from '~/utils/handlers'

const categoryRouter = Router()

/**
 * POST /category/create
 * Create a product category.
 * Auth: access token.
 * Features: adds catalog groups used by storefront filters and admin product assignment.
 */
categoryRouter.post('/create', accessTokenValidator, createCategoryValidator, wrapAsync(createCategoryController))

/**
 * PATCH /category/update/:category_id
 * Update a product category.
 * Auth: access token.
 * Features: edits category name/description shown in storefront filter pills and admin screens.
 */
categoryRouter.patch(
  '/update/:category_id',
  filterMiddleware<CreateCategoryReqBody>(['name', 'desc']),
  accessTokenValidator,
  createCategoryValidator,
  wrapAsync(updateCategoryController)
)

/**
 * DELETE /category/delete/:category_id
 * Delete a product category.
 * Auth: access token.
 * Features: removes a catalog group that is no longer used.
 */
categoryRouter.delete('/delete/:category_id', accessTokenValidator, wrapAsync(deleteCategoryController))

/**
 * GET /category/:category_id
 * Category detail.
 * Auth: access token.
 * Features: returns one category for admin edit/detail views.
 */
categoryRouter.get('/:category_id', accessTokenValidator, wrapAsync(getCategoryController))

/**
 * GET /category
 * Public category list.
 * Features: powers storefront category filters and product form dropdowns.
 */
categoryRouter.get('/', wrapAsync(getCategoriesController))
export default categoryRouter
