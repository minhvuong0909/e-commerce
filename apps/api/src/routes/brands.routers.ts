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

/*
      Description: Create a new brand
      path: /brands/create
      method: POST
      Header: {Authorization: Bearer <access_token>}
      body: {
          name: string;
          hotline: string;
          address: string;
      }
  */
brandsRouter.post('/create', accessTokenValidator, createBrandValidator, wrapAsync(createBrandController))

/*
      Description: Update a brand
      path: /brands/update
      method: PUT
      Header: {Authorization: Bearer <access_token>}
      body: {
          name: string;
          hotline: string;
          address: string;
      }
  */
brandsRouter.patch('/update/:brand_id', accessTokenValidator, createBrandValidator, wrapAsync(updateBrandController))

/*
      Description: Update a brand
      path: /brands/delete
      method: DELETE
      Header: {Authorization: Bearer <access_token>}
  */
brandsRouter.delete('/delete/:brand_id', accessTokenValidator, wrapAsync(deleteBrandController))

/*
    Description: Get Brand by ID
    path: /brands/:id
    method: get
*/
brandsRouter.get('/:brand_id', wrapAsync(getBrandController))

/*
    Description: get all category
    path: /categories/
    method: get
*/
brandsRouter.get('/', wrapAsync(getBrandsController))
export default brandsRouter
