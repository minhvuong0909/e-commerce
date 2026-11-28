import { Request, Response, Router } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { TokenPayload } from '~/models/requests/Users.requests'
import wishlistService from '~/services/wishlist.services'
import { wrapAsync } from '~/utils/handlers'
import { getParam } from '~/utils/params'

const wishlistRouter = Router()
const userId = (req: Request) => (req.decode_authorization as TokenPayload).user_id

/** POST /wishlist/preview — public: active products for a guest's browser-stored ids (max 100). */
wishlistRouter.post(
  '/preview',
  wrapAsync(async (req: Request, res: Response) => {
    const result = await wishlistService.preview(req.body?.product_ids)
    res.status(HTTP_STATUS.OK).json({ message: 'Wishlist preview', result })
  })
)

/** GET /wishlist — signed-in user's wishlist (ids + active products, newest first). */
wishlistRouter.get(
  '',
  accessTokenValidator,
  wrapAsync(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({ message: 'Get wishlist success', result: await wishlistService.list(userId(req)) })
  })
)

/** POST /wishlist — add one product (idempotent). */
wishlistRouter.post(
  '',
  accessTokenValidator,
  wrapAsync(async (req: Request, res: Response) => {
    const result = await wishlistService.add(userId(req), String(req.body?.product_id ?? ''))
    res.status(HTTP_STATUS.OK).json({ message: 'Added to wishlist', result })
  })
)

/** POST /wishlist/merge — fold the browser wishlist into the account after login. */
wishlistRouter.post(
  '/merge',
  accessTokenValidator,
  wrapAsync(async (req: Request, res: Response) => {
    const result = await wishlistService.merge(userId(req), req.body?.product_ids)
    res.status(HTTP_STATUS.OK).json({ message: 'Wishlist merged', result })
  })
)

/** DELETE /wishlist/:product_id — remove one product (no-op if absent). */
wishlistRouter.delete(
  '/:product_id',
  accessTokenValidator,
  wrapAsync(async (req: Request, res: Response) => {
    const result = await wishlistService.remove(userId(req), getParam(req, 'product_id'))
    res.status(HTTP_STATUS.OK).json({ message: 'Removed from wishlist', result })
  })
)

export default wishlistRouter
