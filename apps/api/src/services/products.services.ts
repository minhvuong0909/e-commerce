import { PRODUCT_STATUS } from '~/constants/enums'
import { CreateProductBody } from '~/models/requests/Products.requests'
import Product from '~/models/schemas/Products.schema'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { BRAND_MESSAGES, CATEGORY_MESSAGES, PRODUCTS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class ProductServices {
  // create
  async createProduct(payload: CreateProductBody) {
    // check brand
    const brand = await databaseService.brands.findOne({
      _id: new ObjectId(payload.brand_id)
    })
    if (!brand) {
      throw new ErrorWithStatus({
        message: BRAND_MESSAGES.BRAND_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // check category_id
    const category = await databaseService.categories.findOne({
      _id: new ObjectId(payload.category_id)
    })
    if (!category) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const product = new Product({
      ...payload,
      category_id: category._id,
      status: payload.status || PRODUCT_STATUS.Active
    })
    await databaseService.products.insertOne(product)
    return product
  }
  // update
  async updateProduct({ product_id, payload }: { product_id: string; payload: Partial<CreateProductBody> }) {
    const product = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      [
        {
          $set: {
            ...payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after'
      }
    )
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }
    return product
  }
  // delete
  async deleteProduct(product_id: string) {
    const product = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      [
        {
          $set: {
            status: PRODUCT_STATUS.Stock,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after'
      }
    )
    return product
  }

  // get product by id
  async getProductById(product_id: string) {
    return await databaseService.products.findOne({ _id: new ObjectId(product_id) })
  }
}

let productsService = new ProductServices()
export default productsService
