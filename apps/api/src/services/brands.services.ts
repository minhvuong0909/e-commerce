import { CreateBrandReqBody } from '~/models/requests/Brands.requests'
import databaseService from './database.service'
import Brand from '~/models/schemas/Brands.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { BRANDS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import {
  buildBrandSearchFilter,
  buildPaginatedFacetStages,
  extractFacetResult
} from '~/utils/listQuery'

class BrandsService {
  // create
  async createBrand(payload: CreateBrandReqBody) {
    const result = await databaseService.brands.insertOne(new Brand(payload))
    return result
  }
  // update
  async updateBrand(brand_id: string, payload: Partial<CreateBrandReqBody>) {
    const result = await databaseService.brands.findOneAndUpdate(
      {
        _id: new ObjectId(brand_id)
      },
      {
        $set: {
          ...payload,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after'
      }
    )
    if (!result) {
      throw new ErrorWithStatus({
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async deleteBrand(brand_id: string) {
    // check brand có sản phẩm liên kết không (quan hệ 1 - N)
    const hasProduct = await databaseService.products.findOne({ brand_id: new ObjectId(brand_id) })
    // nếu có thì kh cho xóa brand vì mqh 1 - N
    if (hasProduct) {
      throw new ErrorWithStatus({
        message: BRANDS_MESSAGES.BRAND_HAS_PRODUCTS,
        status: HTTP_STATUS.CONFLICT
      })
    }
    const brand = await databaseService.brands.findOneAndDelete({ _id: new ObjectId(brand_id) })
    if (!brand) {
      throw new ErrorWithStatus({
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  async getBrandById(brand_id: string) {
    const brand = await databaseService.brands.findOne({ _id: new ObjectId(brand_id) })
    if (!brand) {
      throw new ErrorWithStatus({
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return brand
  }

  async getBrandsList({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const skip = (page - 1) * limit
    const match = buildBrandSearchFilter(search)
    const hasMatch = Object.keys(match).length > 0

    const pipeline: Record<string, unknown>[] = [
      ...(hasMatch ? [{ $match: match }] : []),
      {
        $lookup: {
          from: 'products',
          let: { brandId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$brand_id', '$$brandId'] } } }, { $count: 'count' }],
          as: 'productsCountData'
        }
      },
      {
        $addFields: {
          productsCount: { $ifNull: [{ $arrayElemAt: ['$productsCountData.count', 0] }, 0] }
        }
      },
      { $project: { productsCountData: 0 } },
      { $sort: { created_at: -1 } },
      buildPaginatedFacetStages(skip, limit)
    ]

    const [facetResult] = await databaseService.brands.aggregate(pipeline).toArray()
    const { data: brands, totalItems } = extractFacetResult(facetResult as { data?: unknown[]; meta?: Array<{ totalItems: number }> })

    return {
      brands,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit))
      }
    }
  }

  /** @deprecated Dùng getBrandsList — giữ cho tương thích nội bộ nếu cần */
  async getBrands(limit: number = 10, page: number = 1) {
    const result = await this.getBrandsList({ page, limit })
    return result.brands
  }
}

let brandsService = new BrandsService()
export default brandsService
