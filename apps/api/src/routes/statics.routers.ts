import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/statics.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()
staticRouter.get('/image/:filename', wrapAsync(serveImageController))
staticRouter.get('/video/:filename', wrapAsync(serveVideoController))
export default staticRouter
