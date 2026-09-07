import { Router } from 'express'
import { createProductReviewController, listProductReviewsController } from '~/controllers/reviews.controllers'
import { accessTokenValidator, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const reviewsRouter = Router()

/**
 * GET /reviews/products/:product_id
 * Public review listing for a product detail page.
 * Features: returns customer ratings/comments shown under the product information.
 */
reviewsRouter.get('/products/:product_id', wrapAsync(listProductReviewsController))

/**
 * POST /reviews/products/:product_id
 * Create a product review.
 * Auth: access token and verified email.
 * Features: lets signed-in customers submit a 1-5 star rating and comment.
 */
reviewsRouter.post(
  '/products/:product_id',
  accessTokenValidator,
  requireVerifiedEmail,
  wrapAsync(createProductReviewController)
)

export default reviewsRouter
