import api from '../configs/api'

export type ProductReview = {
  _id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}

export const getProductReviewsApi = (productId: string) =>
  api.get<{ result: ProductReview[] }>(`/reviews/products/${productId}`)

export const createProductReviewApi = (productId: string, payload: { rating: number; comment: string }) =>
  api.post(`/reviews/products/${productId}`, payload)
