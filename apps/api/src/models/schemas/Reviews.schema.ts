import { ObjectId } from 'mongodb'

export interface ReviewType {
  _id?: ObjectId
  product_id: ObjectId
  user_id?: ObjectId
  customer_name: string
  rating: number
  comment: string
  visible?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class Review {
  _id?: ObjectId
  product_id: ObjectId
  user_id?: ObjectId
  customer_name: string
  rating: number
  comment: string
  visible: boolean
  created_at: Date
  updated_at: Date

  constructor(review: ReviewType) {
    const date = new Date()
    this._id = review._id || new ObjectId()
    this.product_id = review.product_id
    this.user_id = review.user_id
    this.customer_name = review.customer_name
    this.rating = Math.min(5, Math.max(1, Number(review.rating)))
    this.comment = review.comment.trim()
    this.visible = review.visible ?? true
    this.created_at = review.created_at || date
    this.updated_at = review.updated_at || date
  }
}
