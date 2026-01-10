import { PRODUCT_STATUS } from '~/constants/enums'
import { CreateProductBody } from '~/models/requests/Products.requests'
import Product from '~/models/schemas/Products.schema'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { BRANDS_MESSAGES, CATEGORY_MESSAGES, PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import ProductMedia from '~/models/schemas/ProductImages.schema'
import { Request } from 'express'

class ProductServices {
  // create
  async createProduct(payload: CreateProductBody) {
    // check brand
    const brand = await databaseService.brands.findOne({
      _id: new ObjectId(payload.brand_id)
    })
    if (!brand) {
      throw new ErrorWithStatus({
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND,
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
    const { medias, ...productInfo } = payload
    const result = await databaseService.products.insertOne(
      new Product({
        ...productInfo,
        medias,
        category_id: new ObjectId(category._id),
        brand_id: new ObjectId(brand._id),
        ship_category_id: new ObjectId(payload.ship_category_id),
        status: payload.status || PRODUCT_STATUS.Active
      })
    )
    result.insertedId
    // sau đó lưu medias vào productmedia
    // biến đổi từng media thành các product
    const mediasToSave = medias.map((media) => ({
      product_id: result.insertedId,
      media
    })) as ProductMedia[]
    // lưu vào db product media
    const mediaResult = await databaseService.product_media.insertMany(mediasToSave)
    return result
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
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }
    return product
  }
  // delete
  async deleteProduct(product_id: string) {
    const product = await databaseService.products.findOneAndDelete({
      _id: new ObjectId(product_id)
    })
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }
  }

  // get product by id
  async getProductById(product_id: string) {
    const result = await databaseService.products
      .aggregate(
        [
          {
            $match: {
              _id: new ObjectId(product_id) //đưa vào id  product cần tìm
            }
          },
          {
            $lookup: {
              from: 'product_medias',
              localField: '_id',
              foreignField: 'product_id',
              as: 'medias_infor'
            }
          },
          {
            $project: {
              medias: {
                $map: {
                  input: '$medias_infor',
                  as: 'media',
                  in: '$$media.media'
                }
              },
              _id: 1,
              name: 1,
              quantity: 1,
              price: 1,
              description: 1,
              rating_number: 1,
              brand_id: 1,
              origin: 1,
              volume: 1,
              weight: 1,
              height: 1,
              width: 1,
              sold: 1,
              status: 1,
              category_id: 1,
              ship_category_id: 1
            }
          }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray() // dùng converse từ json thành mảng
    if (result.length === 0)
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    return result[0] //vì tìm 1 nên trả về pt đầu tiên
  }

  async getProducts(req: Request) {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const products = await databaseService.products
      .aggregate([
        {
          $skip: (page - 1) * limit //cập nhật
        },
        {
          $limit: limit // cập nhật
        },
        {
          $lookup: {
            from: 'product_medias',
            localField: '_id',
            foreignField: 'product_id',
            as: 'medias_infor'
          }
        },
        {
          $project: {
            medias: {
              $map: {
                input: '$medias_infor',
                as: 'media',
                in: '$$media.media'
              }
            },
            _id: 1,
            name: 1,
            quantity: 1,
            price: 1,
            description: 1,
            rating_number: 1,
            brand_id: 1,
            origin: 1,
            volume: 1,
            weight: 1,
            height: 1,
            width: 1,
            sold: 1,
            status: 1,
            category_id: 1,
            ship_category_id: 1
          }
        }
      ])
      .sort({ created_at: -1 })
      .toArray()
    return products
  }
}

let productsService = new ProductServices()
export default productsService
