import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/Users.requests'
import reviewService from '~/services/reviews.services'
import usersService from '~/services/users.services'

export const listProductReviewsController = async (req: Request, res: Response) => {
  const result = await reviewService.listByProduct((req.params as { product_id: string }).product_id)
  res.status(HTTP_STATUS.OK).json({ message: 'Get product reviews success', result })
}

export const createProductReviewController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.findUserById(user_id)
  const result = await reviewService.create({
    productId: (req.params as { product_id: string }).product_id,
    userId: user_id,
    customerName: user.name || user.username || 'Khách hàng',
    rating: Number(req.body.rating),
    comment: String(req.body.comment || '')
  })
  res.status(HTTP_STATUS.CREATED).json({ message: 'Create review success', result })
}
