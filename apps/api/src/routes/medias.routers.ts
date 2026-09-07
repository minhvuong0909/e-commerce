import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

const mediasRouter = Router()

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
