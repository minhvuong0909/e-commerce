import { ObjectId } from 'mongodb'
import { CartStatus, OrderStatus, PaymentStatus } from '~/constants/enums'
import databaseService from './database.service'
import { ErrorWithStatus } from '~/models/Errors'
import { CART_MESSAGES, ORDER_MESSAGES, PRODUCT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import OrderItems from '~/models/schemas/OrderItems.Schema'
import Order from '~/models/schemas/Orders.schema'
import { CreateOrderReqBody } from '~/models/requests/Orders.requests'
import { or } from 'sequelize'
import { filter } from 'lodash'
class OrdersService {
  async createOrderItem({
    user_id,
    cart_item_id,
    payload
  }: {
    user_id: string
    cart_item_id: string[]
    payload: CreateOrderReqBody
  }) {
    // get cart active
    const cart = await databaseService.carts.findOne({ user_id: new ObjectId(user_id), status: CartStatus.ACTIVE })
    if (!cart) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // lấy cart item được chọn
    const cartItems = await databaseService.cart_items
      .find({
        _id: { $in: cart_item_id.map((id) => new ObjectId(id)) },
        cart_id: cart._id
      })
      .toArray()
    // nếu ko chọn
    if (cartItems.length === 0) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.NO_SELECTED_CART_ITEMS,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // tính tổng tiền
    let total_price = 0
    const orderItems: OrderItems[] = []
    for (const item of cartItems) {
      const product = await databaseService.products.findOne({ _id: item.product_id })
      if (!product) {
        throw new ErrorWithStatus({
          message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (item.quantity > product.quantity) {
        throw new ErrorWithStatus({
          message: PRODUCT_MESSAGES.INSUFFICIENT_PRODUCT_STOCK,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      total_price += item.quantity * product.price
      // push vào
      orderItems.push(
        new OrderItems({
          order_id: new ObjectId(),
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        })
      )
    }
    // tạo order
    const order = await databaseService.orders.insertOne(
      new Order({
        user_id: new ObjectId(user_id),
        total_price: total_price,
        payment_method: payload.payment_method as any,
        payment_status: PaymentStatus.PENDING,
        shipping_fee: 0,
        status: OrderStatus.Pending
      })
    )
    // đặt hàng thành công thì tạo order items và trừ quantity trong products
    for (const orderItem of orderItems) {
      orderItem.order_id = order.insertedId
      await databaseService.order_items.insertOne(orderItem)
      // trừ quantity
      await databaseService.products.findOneAndUpdate(
        { _id: orderItem.product_id },
        {
          $inc: {
            quantity: -orderItem.quantity,
            soldNumber: orderItem.quantity
          }
        }
      )
    }
    // xóa cart items đã đặt hàng
    await databaseService.cart_items.deleteMany({
      _id: { $in: cartItems.map((item) => item._id!) }
    })
    return order
  }

  async updateOrderStatus({ user_id, order_id }: { user_id: string; order_id: string }) {
    const order = await databaseService.orders.findOneAndUpdate(
      { _id: new ObjectId(order_id), user_id: new ObjectId(user_id), status: OrderStatus.Pending },
      {
        $set: {
          status: OrderStatus.Confirmed,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return order
  }

  async deleteOrder({ user_id, order_id }: { user_id: string; order_id: string }) {
    const order = await databaseService.orders.findOneAndUpdate(
      {
        _id: new ObjectId(order_id),
        user_id: new ObjectId(user_id),
        status: OrderStatus.Pending
      },

      {
        $set: {
          status: OrderStatus.Cancelled,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  async getOrderById({ user_id, order_id }: { user_id: string; order_id: string }) {
    const order = await databaseService.orders.findOne({
      _id: new ObjectId(order_id),
      user_id: new ObjectId(user_id)
    })
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return order
  }

  async getAllMyOrders({ user_id }: { user_id: string }) {
    const orders = (await databaseService.orders
      .find({ user_id: new ObjectId(user_id) })
      .sort({ created_at: -1 })
      .toArray()) as Order[]
    if (orders.length === 0) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return orders
  }

  async getAllOrders() {
    const orders = (await databaseService.orders.find().sort({ created_at: -1 }).toArray()) as Order[]
    if (orders.length === 0) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return orders
  }
}

let ordersService = new OrdersService()
export default ordersService
