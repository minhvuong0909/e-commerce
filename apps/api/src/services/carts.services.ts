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
import { Request } from 'express'

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

  async updateCartItem({
    cart_item_id,
    quantity,
    user_id
  }: {
    cart_item_id: string
    quantity: number
    user_id: string
  }) {
    // check cart
    const cart = await databaseService.carts.findOne({ user_id: new ObjectId(user_id), status: CartStatus.ACTIVE })
    if (!cart) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // check cart item
    const cartItem = await databaseService.cart_items.findOne({ _id: new ObjectId(cart_item_id), cart_id: cart._id })
    if (!cartItem) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const product = await databaseService.products.findOne({ _id: cartItem.product_id })
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // check quanitty
    if (quantity > product!.quantity) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.INSUFFICIENT_PRODUCT_STOCK,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return await databaseService.cart_items.updateOne(
      { _id: new ObjectId(cart_item_id) },
      { $set: { quantity: quantity, updated_at: new Date() } }
    )
  }

  async deleteCartItem({ cart_item_id, user_id }: { cart_item_id: string; user_id: string }) {
    // check cart
    const cart = await databaseService.carts.findOne({ user_id: new ObjectId(user_id), status: CartStatus.ACTIVE })
    if (!cart) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // check cart item
    const cartItem = await databaseService.cart_items.findOne({ _id: new ObjectId(cart_item_id), cart_id: cart._id })
    if (!cartItem) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_ITEM_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return await databaseService.cart_items.deleteOne({ _id: new ObjectId(cart_item_id) })
  }

  async getCartItemsByUserId({ user_id }: { user_id: string }) {
    // lấy cart của user
    const cart = await databaseService.carts.findOne({ user_id: new ObjectId(user_id), status: CartStatus.ACTIVE })
    if (!cart) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // lấy cart items của cart
    const cartItems = await databaseService.cart_items
      .aggregate([
        {
          $match: { cart_id: cart._id }
        },
        {
          $lookup: {
            from: process.env.DB_PRODUCTS_COLLECTION as string,
            localField: 'product_id',
            foreignField: '_id',
            as: 'product_infor'
          }
        },
        {
          $unwind: '$product_infor'
        }
      ])
      .sort({ created_at: -1 })
      .toArray()
    return {
      cartItems,
      total_price: cartItems.reduce((total: number, item: any) => total + item.quantity * item.product_infor.price, 0)
    }
  }
}

let cartsService = new CartsService()
export default cartsService
