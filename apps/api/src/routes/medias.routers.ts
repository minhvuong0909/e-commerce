import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

const mediasRouter = Router()

// upload
mediasRouter.post('/upload-image', wrapAsync(uploadImageController))
mediasRouter.post('/upload-video', wrapAsync(uploadVideoController))

export default mediasRouter
