import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import Review from '~/models/schemas/Reviews.schema'
import databaseService from './database.service'

class ReviewService {
  async listByProduct(productId: string) {
    if (!ObjectId.isValid(productId)) {
      throw new ErrorWithStatus({ message: 'Invalid product id', status: HTTP_STATUS.BAD_REQUEST })
    }
    return databaseService.reviews
      .find({ product_id: new ObjectId(productId), visible: true })
      .sort({ created_at: -1 })
      .toArray()
  }

  async create({
    productId,
    userId,
    customerName,
    rating,
    comment
  }: {
    productId: string
    userId?: string
    customerName: string
    rating: number
    comment: string
  }) {
    if (!ObjectId.isValid(productId)) {
      throw new ErrorWithStatus({ message: 'Invalid product id', status: HTTP_STATUS.BAD_REQUEST })
    }
    if (!comment?.trim()) {
      throw new ErrorWithStatus({ message: 'Review comment is required', status: HTTP_STATUS.BAD_REQUEST })
    }
    const product = await databaseService.products.findOne({ _id: new ObjectId(productId) })
    if (!product) {
      throw new ErrorWithStatus({ message: 'Product not found', status: HTTP_STATUS.NOT_FOUND })
    }

    const review = new Review({
      product_id: new ObjectId(productId),
      user_id: userId && ObjectId.isValid(userId) ? new ObjectId(userId) : undefined,
      customer_name: customerName?.trim() || 'Khách hàng',
      rating,
      comment
    })
    await databaseService.reviews.insertOne(review)

    const stats = await databaseService.reviews
      .aggregate([
        { $match: { product_id: new ObjectId(productId), visible: true } },
        { $group: { _id: '$product_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
      .toArray()
    const ratingNumber = stats[0]?.avg ? Number(stats[0].avg.toFixed(1)) : review.rating
    await databaseService.products.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { rating_number: ratingNumber, review_count: stats[0]?.count || 1, updated_at: new Date() } }
    )
    return review
  }
}

const reviewService = new ReviewService()
export default reviewService
