import { CreateCategoryReqBody } from '~/models/requests/Categories.requests'
import databaseService from './database.service'
import Category from '~/models/schemas/Categories.schema'
import slugify from 'slugify'
import { ErrorWithStatus } from '~/models/Errors'
import { CATEGORY_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'

class CategoryService {
  // create category
  async createCategory(category: CreateCategoryReqBody) {
    const slug = slugify(category.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    })

    const existed = await databaseService.categories.findOne({ slug })
    if (existed) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_NAME_EXISTED,
        status: HTTP_STATUS.CONFLICT
      })
    }
    const result = await databaseService.categories.insertOne(new Category(category))
    return result
  }

  // update category
  async updateCategory(category_id: string, payload: Partial<CreateCategoryReqBody>) {
    const updateData: any = {
      updated_at: new Date()
    }

    // chỉ cho update các field hợp lệ
    if (payload.name) {
      const slug = slugify(payload.name, {
        lower: true,
        strict: true,
        locale: 'vi'
      })

      // check slug
      const existed = await databaseService.categories.findOne({
        slug,
        _id: { $ne: new ObjectId(category_id) }
      })

      if (existed) {
        throw new ErrorWithStatus({
          message: CATEGORY_MESSAGES.CATEGORY_NAME_EXISTED,
          status: HTTP_STATUS.CONFLICT
        })
      }

      updateData.name = payload.name
      updateData.slug = slug
    }

    if (payload.desc !== undefined) {
      updateData.description = payload.desc
    }

    const result = await databaseService.categories.findOneAndUpdate(
      { _id: new ObjectId(category_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return result
  }

  async deleteCategory(category_id: string) {
    // check category có trong product ?
    const hasProduct = await databaseService.products.findOne({ _id: new ObjectId(category_id) })
    // nếu co product trong cate thì kh cho xóa
    if (hasProduct) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_HAS_PRODUCTS,
        status: HTTP_STATUS.CONFLICT
      })
    }

    const result = await databaseService.categories.findOneAndDelete({ _id: new ObjectId(category_id) })

    if (!result) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  async getCategoryById(category_id: string) {
    const result = await databaseService.categories.findOne({ _id: new ObjectId(category_id) })
    if (!result) {
      throw new ErrorWithStatus({
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
}

let categoryServices = new CategoryService()
export default categoryServices
