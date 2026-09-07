import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/statics.controllers'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()

/**
 * GET /static/image/:filename
 * Public local image serving.
 * Features: serves uploaded images when media is stored on the VPS filesystem.
 */
staticRouter.get('/image/:filename', wrapAsync(serveImageController))

/**
 * GET /static/video/:filename
 * Public local video serving.
 * Features: streams uploaded videos when media is stored on the VPS filesystem.
 */
staticRouter.get('/video/:filename', wrapAsync(serveVideoController))

export default staticRouter
