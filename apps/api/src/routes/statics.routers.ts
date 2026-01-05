import { Router } from 'express'
import { serveImageController } from '~/controllers/statics.controllers'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()
staticRouter.get('/image/:filename', wrapAsync(serveImageController))

export default staticRouter
