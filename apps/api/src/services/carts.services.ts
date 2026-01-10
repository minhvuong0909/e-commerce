import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from './database.service'
import usersService from './users.services'
import { CART_MESSAGES, PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CartStatus, UserVerifyStatus } from '~/constants/enums'
import Cart from '~/models/schemas/Carts.schema'
import { CreateCartITemReqBody } from '~/models/requests/Carts.requests'
import { ObjectId } from 'mongodb'
import CartItems from '~/models/schemas/CartItems.schema'

class CartsService {
  async createCart(user_id: string) {
    const user = await usersService.findUserById(user_id)
    if (user.verify_status !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.EMAIL_HAS_BEEN_UNVERIFIED
      })
    }
    let cart = await databaseService.carts.findOne({
      user_id: user._id,
      status: CartStatus.ACTIVE
    })
    if (!cart) {
      const result = await databaseService.carts.insertOne(
        new Cart({
          user_id: user._id,
          status: CartStatus.ACTIVE
        })
      )
      // gán lại cart vừa tạo
      cart = await databaseService.carts.findOne({ _id: result.insertedId })
    }
    return cart
  }

  async createCartItem({ user_id, payload }: { user_id: string; payload: CreateCartITemReqBody }) {
    const cart = await this.createCart(user_id)

    if (CartStatus.ACTIVE !== cart?.status) {
      throw new ErrorWithStatus({
        message: 'Cannot add item to inactive cart',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // check product tồn tại
    const product = await databaseService.products.findOne({ _id: new ObjectId(payload.product_id) })
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // check cart item existed
    const existedItem = await databaseService.cart_items.findOne({
      cart_id: cart._id,
      product_id: new ObjectId(payload.product_id)
    })
    // check số lượng của product với của product trong kho
    const totalQuantity = existedItem ? existedItem.quantity + payload.quantity : payload.quantity
    if (totalQuantity > product.quantity) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.INSUFFICIENT_PRODUCT_STOCK,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // nếu item tồn tại thì cho nó tăng số lương product lên
    if (existedItem) {
      return await databaseService.cart_items.updateOne(
        { _id: existedItem._id },
        { $inc: { quantity: payload.quantity } }
      )
    }
    // thêm vào cart items
    const cartItem = await databaseService.cart_items.insertOne(
      new CartItems({
        cart_id: cart._id,
        product_id: new ObjectId(payload.product_id),
        quantity: payload.quantity
      })
    )
    return cartItem
  }
}

let cartsService = new CartsService()
export default cartsService
