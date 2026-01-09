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

/*
    Description: Create a new category
    path: /categories/create
    method: POST
    Header: {Authorization: Bearer <access_token>}
    body: {
      name: string
      desc: string
    }
*/
categoryRouter.post('/create', accessTokenValidator, createCategoryValidator, wrapAsync(createCategoryController))

/*
    Description: Update a category
    path: /categories/update
    method: PUT
    Header: {Authorization: Bearer <access_token>}
    body: {
      name: string
      desc: string
    }
*/
categoryRouter.patch(
  '/update/:category_id',
  filterMiddleware<CreateCategoryReqBody>(['name', 'desc']),
  accessTokenValidator,
  createCategoryValidator,
  wrapAsync(updateCategoryController)
)

/*
    Description: Delete a category
    path: /categories/delete
    method: PUT
    Header: {Authorization: Bearer <access_token>}
    body: 
*/
categoryRouter.delete('/delete/:category_id', accessTokenValidator, wrapAsync(deleteCategoryController))

/*
    Description: get a category infor by id
    path: /categories/:id
    method: get
*/
categoryRouter.get('/:category_id', accessTokenValidator, wrapAsync(getCategoryController))

/*
    Description: get all category
    path: /categories/
    method: get
*/
categoryRouter.get('/', wrapAsync(getCategoriesController))
export default categoryRouter
