import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { USER_ROLE } from '~/constants/enums'
import { uploadLimiter } from '~/middlewares/rateLimit.middlewares'

const mediasRouter = Router()
// Catalog uploads are administrative operations; validate before parsing large bodies.
mediasRouter.use(
  uploadLimiter,
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin, USER_ROLE.Staff),
  requireVerifiedEmail
)

/**
 * POST /medias/upload-image
 * Image upload endpoint.
 * Features: uploads product/shop images, using Cloudinary when configured and falling back to local media storage.
 */
mediasRouter.post('/upload-image', wrapAsync(uploadImageController))

/**
 * POST /medias/upload-video
 * Video upload endpoint.
 * Features: stores product or marketing videos for later static serving.
 */
mediasRouter.post('/upload-video', wrapAsync(uploadVideoController))

export default mediasRouter
