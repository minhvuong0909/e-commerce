import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const ordersRouter = Router()
/*
    description: create order
    method: POST

*/
ordersRouter.post('/create', accessTokenValidator, wrapAsync(createOrderController))
export default ordersRouter
