import { CreateBrandReqBody } from '~/models/requests/Brands.requests'
import databaseService from './database.service'
import Brand from '~/models/schemas/Brands.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { BRANDS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

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
    // check product có tồn tại trong brand ?
    const hasProduct = await databaseService.products.findOne({ _id: new ObjectId(brand_id) })
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
}

let brandsService = new BrandsService()
export default brandsService
