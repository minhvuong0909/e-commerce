import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import { createCartController } from '~/controllers/carts.controllers'
import { accessTokenValidator, checkPermissions } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const cartsRouter = Router()

/* 
    Description: create cart 
    method: POST
    body: {
        user_id: string;
        created_at?: Date;
        updated_at?: Date;
        }   
*/

cartsRouter.post('/create', accessTokenValidator, checkPermissions(USER_ROLE.User), wrapAsync(createCartController))
export default cartsRouter
