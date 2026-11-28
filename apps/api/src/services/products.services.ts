import { PRODUCT_STATUS } from '~/constants/enums'
import { CreateProductBody } from '~/models/requests/Products.requests'
import Product from '~/models/schemas/Products.schema'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { BRANDS_MESSAGES, CATEGORY_MESSAGES, PRODUCT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { normalizeProductMedias, productMediaStages } from '~/utils/productMedia'
import { Request } from 'express'
import {
  buildProductMatchStage,
  buildProductSortStage,
  parsePagination,
  ProductQueryParams
} from '~/utils/productQuery'

const LIST_DESCRIPTION_CHARS = 280

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
    const { medias: rawMedias, ...productInfo } = payload
    const { medias, thumbnail } = normalizeProductMedias(rawMedias || [])
    // products.medias là nguồn duy nhất; không ghi thêm vào collection product_medias cũ
    // (insertMany([]) còn làm hỏng việc tạo sản phẩm không có ảnh)
    return databaseService.products.insertOne(
      new Product({
        ...productInfo,
        medias,
        thumbnail: productInfo.thumbnail || thumbnail || '',
        category_id: new ObjectId(category._id),
        brand_id: new ObjectId(brand._id),
        ship_category_id: new ObjectId(payload.ship_category_id),
        status: payload.status || PRODUCT_STATUS.Active
      })
    )
  }
  // update
  async updateProduct({ product_id, payload }: { product_id: string; payload: Partial<CreateProductBody> }) {
    const set: Record<string, unknown> = { ...payload }
    if (payload.medias) {
      const { medias, thumbnail } = normalizeProductMedias(payload.medias)
      set.medias = medias
      if (!payload.thumbnail) set.thumbnail = thumbnail || ''
    }
    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      { $set: { ...set, updated_at: new Date() } },
      { returnDocument: 'after' }
    )
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }
    // danh sách media mới thay hoàn toàn bản cũ: bỏ bản legacy để không bị đọc ngược lại
    if (payload.medias) await databaseService.product_media.deleteMany({ product_id: product._id })
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
          ...productMediaStages()
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
    const catQuery = (req.query.category_id || req.query.category) as string | undefined
    if (catQuery && catQuery.trim()) {
      const trimmedCat = catQuery.trim()
      if (ObjectId.isValid(trimmedCat)) {
        req.query.category_id = trimmedCat
      } else {
        const catDoc = await databaseService.categories.findOne({
          $or: [
            { slug: trimmedCat },
            { name: { $regex: new RegExp(`^${trimmedCat.replace(/-/g, ' ')}$`, 'i') } },
            { name: { $regex: new RegExp(trimmedCat.replace(/-/g, '.*'), 'i') } }
          ]
        })
        if (catDoc) {
          req.query.category_id = catDoc._id.toString()
        }
      }
    }

    const match = buildProductMatchStage(req.query as ProductQueryParams)
    const sortStage = buildProductSortStage(req.query.sort as string | undefined)
    const { page, limit, skip } = parsePagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    )

    const [products, totalItems] = await Promise.all([
      databaseService.products
        .aggregate([
          { $match: match },
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          ...productMediaStages(),
          // danh sách chỉ hiện 3–4 dòng mô tả (QuickView); bản đầy đủ lấy ở GET /products/:id
          { $set: { description: { $substrCP: [{ $ifNull: ['$description', ''] }, 0, LIST_DESCRIPTION_CHARS] } } }
        ])
        .toArray(),
      databaseService.products.countDocuments(match)
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    }
  }
}

let productsService = new ProductServices()
export default productsService
